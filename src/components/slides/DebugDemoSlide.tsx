"use client";

import { motion } from "framer-motion";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Notes } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";
import { useStepMotion } from "~/components/deck/useStepMotion";
import { TerminalWindow } from "~/components/terminal-kit";

/**
 * Slide 18 — the debug demo. A single centered Claude-theme terminal that
 * step-reveals a verbatim `pi` agent trace: pull Slack thread → parallel
 * search Sentry + Datadog → identify a bad regex → edit, commit, PR. The
 * older content scrolls off the top via `pinScrollBottom`, so the newest
 * beat is always on screen even though every past beat is still rendered.
 *
 * Trace source: docs/pi-slack-debug-trace (RTF export from Sarah).
 */

const TERMINAL_W = 1180;
const TERMINAL_H = 660;

export function DebugDemoSlide() {
	return (
		<DeckSlide padded={false}>
			<DebugDemoBody />
			<Notes>
				<PresenterNote noteKey="debugDemo" />
			</Notes>
		</DeckSlide>
	);
}

const WORD_MS = 14; // per-token stream delay — fast

/* Walk a React tree and count word-ish tokens in every string leaf. */
function countTokens(node: React.ReactNode): number {
	if (node == null || typeof node === "boolean") return 0;
	if (typeof node === "string") return node.split(/(\s+)/).length;
	if (typeof node === "number") return 1;
	if (Array.isArray(node)) {
		let s = 0;
		for (const n of node) s += countTokens(n);
		return s;
	}
	if (React.isValidElement(node)) {
		const el = node as React.ReactElement<{ children?: React.ReactNode }>;
		return countTokens(el.props.children);
	}
	return 0;
}

/* Return a partial React tree where the first `budget.n` string tokens are
 * revealed. Non-string leaves and structural elements are always kept so
 * "zero-cost" nodes (function components that own their content internally,
 * e.g. <SearchToolsPlan/>) still render after the text stream is done. */
function sliceTree(node: React.ReactNode, budget: { n: number }): React.ReactNode {
	if (node == null || typeof node === "boolean") return node;
	if (typeof node === "string") {
		const tokens = node.split(/(\s+)/);
		const take = Math.min(tokens.length, Math.max(0, budget.n));
		budget.n = Math.max(0, budget.n - tokens.length);
		return tokens.slice(0, take).join("");
	}
	if (typeof node === "number") return node;
	if (Array.isArray(node)) {
		const out: React.ReactNode[] = [];
		for (let i = 0; i < node.length; i++) {
			const item = node[i];
			// Hold token-consuming siblings back until budget reaches them.
			// Otherwise styled containers (borders, padding, backgrounds)
			// render as empty shells before their preceding sibling has
			// finished streaming. Zero-cost siblings — opaque function
			// components like SearchToolsPlan that own their own inner
			// Stream — still pass through so they can start streaming when
			// their position in the flow is reached.
			if (budget.n <= 0 && countTokens(item) > 0) break;
			const sliced = sliceTree(item, budget);
			if (React.isValidElement(sliced) && sliced.key == null) {
				out.push(React.cloneElement(sliced, { key: `s${i}` }));
			} else {
				out.push(sliced);
			}
		}
		return out;
	}
	if (React.isValidElement(node)) {
		const el = node as React.ReactElement<{ children?: React.ReactNode }>;
		const kids = sliceTree(el.props.children, budget);
		return React.cloneElement(el, {}, kids);
	}
	// Unknown shape (e.g. Code's custom `{t, c}` chunk objects) — pass through
	// untouched so component-specific data structures survive the walk.
	return node;
}

/* Stream any React subtree word-by-word once mounted. Recursively reveals
 * string leaves in tree order; parent elements render as empty shells until
 * the walker reaches them. `onDone` fires once the whole subtree is
 * revealed — Sequence uses that to advance to the next unit. */
function Stream({
	children,
	delayMs = WORD_MS,
	onDone,
	instant = false,
}: {
	children: React.ReactNode;
	delayMs?: number;
	onDone?: () => void;
	/** Render children in one shot instead of word-by-word. Used by tool
	 * blocks (Multi Execute, shell, read/edit) that should just "fire" rather
	 * than feel like the agent is thinking. */
	instant?: boolean;
}) {
	const total = useMemo(() => countTokens(children), [children]);
	const [count, setCount] = useState(0);
	const onDoneRef = useRef(onDone);
	onDoneRef.current = onDone;
	useEffect(() => {
		if (instant) {
			setCount(total);
			const t = setTimeout(() => onDoneRef.current?.(), 0);
			return () => clearTimeout(t);
		}
		setCount(0);
		if (total === 0) {
			const t = setTimeout(() => onDoneRef.current?.(), 0);
			return () => clearTimeout(t);
		}
		let i = 0;
		const t = setInterval(() => {
			i += 1;
			setCount(i);
			if (i >= total) {
				clearInterval(t);
				onDoneRef.current?.();
			}
		}, delayMs);
		return () => clearInterval(t);
	}, [total, delayMs, instant]);
	const sliced = useMemo(
		() => sliceTree(children, { n: count }),
		[children, count],
	);
	return <>{sliced}</>;
}

/* Sequence renders children one at a time. Each child receives an `onDone`
 * prop; when that fires, Sequence mounts the next child. Used inside Fade
 * blocks to enforce "AssistantLine finishes, THEN the plan panel starts". */
function Sequence({ children }: { children: React.ReactNode }) {
	const kids = React.Children.toArray(children);
	const [i, setI] = useState(0);
	const bump = useCallback(() => {
		setI((c) => Math.min(c + 1, kids.length));
	}, [kids.length]);
	return (
		<>
			{kids.slice(0, Math.min(i + 1, kids.length)).map((child, idx) => {
				if (!React.isValidElement(child)) return child;
				const el = child as React.ReactElement<{
					onDone?: () => void;
					key?: React.Key;
				}>;
				return React.cloneElement(el, {
					key: el.key ?? `q${idx}`,
					onDone: idx === i ? bump : undefined,
				});
			})}
		</>
	);
}

function DebugDemoBody() {
	// 7 advances → 8 revealed states (initial + 7 keystrokes).
	const { reached, placeholder } = useStepMotion(7);

	return (
		<div className="flex h-full w-full items-center justify-center bg-black">
			{placeholder}
			<div style={{ width: TERMINAL_W, height: TERMINAL_H }}>
				<TerminalWindow
					className="tk-claude-dark h-full [&_.terminal-body-scroll]:!overflow-y-auto"
					fill
					footer={<TerminalInput />}
					path="~/GitHub/test-app (fix/snippet-search-regex-escape)"
					pinScrollBottom
					progress={{ value: 5.1, label: "context" }}
					theme="claude"
					variant="dark"
					bodyClassName="pb-3"
				>
					<div className="flex flex-col gap-3 px-1 text-[13px]">
						<Banner />
						<UserPrompt />
						{reached(0) && (
							<Fade>
								<Sequence>
									<AssistantText>
										I'm going to pull up the Slack thread and search through
										Sentry and Datadog to track down what's causing this
										error.
									</AssistantText>
									<SearchToolsBlock />
								</Sequence>
							</Fade>
						)}
						{reached(1) && (
							<Fade>
								<Sequence>
									<AssistantText>
										I'm converting the Slack permalink timestamp to get the
										actual message ID, then fetching the thread while
										simultaneously searching Sentry and Datadog for related
										information.
									</AssistantText>
									<MultiExecuteBlock1 />
								</Sequence>
							</Fade>
						)}
						{reached(2) && (
							<Fade>
								<Sequence>
									<AssistantText>
										I see the issue now — the user searched for "(prod)"
										which is invalid regex syntax, and the snippet.search
										endpoint is passing that input directly into a RegExp
										constructor without escaping. I need to either sanitize
										the regex special characters or switch to a plain
										substring match instead. Let me look at what's in the
										local repo to understand the current implementation.
									</AssistantText>
								</Sequence>
							</Fade>
						)}
						{reached(3) && (
							<Fade>
								<Sequence>
									<ShellUnit
										latencyMs={220}
										command={
											<CodeBlock>{`$ cd ~/GitHub/test-app && ls && git remote -v && git branch --show-current`}</CodeBlock>
										}
										response={
											<CodeBlock>
												<span
													style={{ color: "var(--terminal-dim)" }}
												>
													… (13 earlier lines, ctrl+o to expand)
													{"\n"}
												</span>
												{`tsconfig.tsbuildinfo
vitest.config.ts
origin  https://github.com/ComposioHQ/agentic-snippet-board.git (fetch)
origin  https://github.com/ComposioHQ/agentic-snippet-board.git (push)
main`}
											</CodeBlock>
										}
									/>
									<ShellUnit
										latencyMs={200}
										command={
											<CodeBlock>{`$ grep -rn "new RegExp" src/server | head -30`}</CodeBlock>
										}
										response={
											<CodeBlock>{`src/server/snippets.filter.ts:6:  const re = new RegExp(trimmed, "i");`}</CodeBlock>
										}
									/>
									<ReadUnit path="~/GitHub/test-app/src/server/snippets.filter.ts" />
								</Sequence>
							</Fade>
						)}
						{reached(4) && (
							<Fade>
								<Sequence>
									<AssistantText>
										I've identified the issue — regex special characters
										need to be escaped before creating the RegExp object.
										Now I'm setting up a branch, committing the fix, and
										pushing it to open a draft PR.
									</AssistantText>
									<EditUnit path="~/GitHub/test-app/src/server/snippets.filter.ts" />
								</Sequence>
							</Fade>
						)}
						{reached(5) && (
							<Fade>
								<Sequence>
									<ShellUnit
										latencyMs={2500}
										command={
											<CodeBlock>{`$ git checkout -b fix/snippet-search-regex-escape
$ git add src/server/snippets.filter.ts
$ git commit -m "fix(search): escape regex metacharacters …"
$ git push -u origin fix/snippet-search-regex-escape`}</CodeBlock>
										}
										response={
											<CodeBlock>
												<span
													style={{ color: "var(--terminal-dim)" }}
												>
													… (10 earlier lines, ctrl+o to expand)
													{"\n"}
												</span>
												{`remote: Resolving deltas: 100% …
To https://github.com/ComposioHQ/agentic-snippet-board.git
 * [new branch] fix/snippet-search-regex-escape → fix/snippet-search-regex-escape
branch tracks origin/fix/snippet-search-regex-escape`}
											</CodeBlock>
										}
									/>
								</Sequence>
							</Fade>
						)}
						{reached(6) && (
							<Fade>
								<Sequence>
									<MultiExecuteBlock2 />
									<FinalReport />
								</Sequence>
							</Fade>
						)}
					</div>
				</TerminalWindow>
			</div>
		</div>
	);
}

/* ─── Presentation primitives ───────────────────────────────────────────── */

const FADE = {
	initial: { opacity: 0, y: 8 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.35, ease: [0.34, 1.1, 0.6, 1] as const },
};

function Fade({ children }: { children: React.ReactNode }) {
	return (
		<motion.div className="flex flex-col gap-5" {...FADE}>
			{children}
		</motion.div>
	);
}

/* ─── ToolCall: bordered call → wait → response beat ─────────────────── */
function ToolCall({
	tool,
	query,
	response,
	latencyMs = 800,
	onDone,
}: {
	tool: string;
	query: React.ReactNode;
	response: React.ReactNode;
	latencyMs?: number;
	onDone?: () => void;
}) {
	const [phase, setPhase] = useState<"calling" | "response">("calling");
	const onDoneRef = useRef(onDone);
	onDoneRef.current = onDone;

	useEffect(() => {
		const t = setTimeout(() => setPhase("response"), latencyMs);
		return () => clearTimeout(t);
	}, [latencyMs]);

	useEffect(() => {
		if (phase !== "response") return;
		const t = setTimeout(() => onDoneRef.current?.(), 900);
		return () => clearTimeout(t);
	}, [phase]);

	return (
		<div
			className="rounded-sm"
			style={{
				background: "rgba(255,255,255,0.018)",
				border: "1px solid rgba(255,255,255,0.07)",
			}}
		>
			<div
				className="flex items-center gap-2 px-3 py-1.5"
				style={{
					borderBottom: "1px solid rgba(255,255,255,0.05)",
					fontSize: 11,
				}}
			>
				<span
					style={{
						color: "var(--terminal-fg)",
						fontWeight: 600,
						fontFamily: '"JetBrains Mono", ui-monospace, monospace',
					}}
				>
					{tool}
				</span>
			</div>
			<div
				className="flex gap-3 px-3 py-2"
				style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
			>
				<TagChip color="var(--terminal-teal)">REQ</TagChip>
				<div className="min-w-0 flex-1">{query}</div>
			</div>
			{phase === "calling" ? (
				<div
					className="flex items-center gap-3 px-3 py-2"
					style={{ color: "var(--terminal-dim)" }}
				>
					<motion.span
						animate={{ opacity: [0.25, 1, 0.25] }}
						transition={{
							duration: 1.2,
							repeat: Infinity,
							ease: "easeInOut",
						}}
						style={{ color: "var(--terminal-teal)" }}
					>
						●
					</motion.span>
					<span className="text-[11.5px] italic">calling…</span>
				</div>
			) : (
				<motion.div
					className="flex gap-3 px-3 py-2"
					initial={{ opacity: 0, y: 4 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.24 }}
				>
					<TagChip color={COL_ADD}>RES</TagChip>
					<div className="min-w-0 flex-1">{response}</div>
				</motion.div>
			)}
		</div>
	);
}

function TagChip({
	color,
	children,
}: {
	color: string;
	children: React.ReactNode;
}) {
	return (
		<span
			className="shrink-0 rounded-sm px-1.5 py-[1px]"
			style={{
				fontFamily: '"JetBrains Mono", ui-monospace, monospace',
				fontSize: 9.5,
				fontWeight: 700,
				letterSpacing: "0.14em",
				color,
				border: `1px solid ${color}`,
				lineHeight: 1.4,
				alignSelf: "flex-start",
			}}
		>
			{children}
		</span>
	);
}

function CodeBlock({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="whitespace-pre-wrap"
			style={{
				fontFamily: '"JetBrains Mono", ui-monospace, monospace',
				fontSize: 11,
				lineHeight: 1.5,
				color: "var(--terminal-fg)",
			}}
		>
			{children}
		</div>
	);
}

function ResultLine({ children }: { children: React.ReactNode }) {
	return (
		<div
			style={{
				fontFamily: '"JetBrains Mono", ui-monospace, monospace',
				fontSize: 11.5,
			}}
		>
			{children}
		</div>
	);
}

/* ─── Sequence unit wrappers ─────────────────────────────────────────────
 * Each of these accepts `onDone` from Sequence and forwards it to the
 * inner Stream / opaque component that owns the streaming. That's how
 * "AssistantLine finishes THEN the plan panel starts" is enforced. */

function AssistantText({
	children,
	onDone,
}: {
	children: React.ReactNode;
	onDone?: () => void;
}) {
	return (
		<AssistantLine>
			<Stream onDone={onDone}>{children}</Stream>
		</AssistantLine>
	);
}

function SearchToolsBlock({ onDone }: { onDone?: () => void }) {
	return (
		<ToolCall
			tool="COMPOSIO_SEARCH_TOOLS"
			latencyMs={1000}
			onDone={onDone}
			query={
				<CodeBlock>{`{ ask: "pull the slack thread and use sentry + datadog
         to find the error, then open a draft PR with the fix" }`}</CodeBlock>
			}
			response={<SearchToolsPlan />}
		/>
	);
}

function MultiExecuteBlock1({ onDone }: { onDone?: () => void }) {
	return (
		<ToolCall
			tool="COMPOSIO_MULTI_EXECUTE_TOOL"
			latencyMs={1500}
			onDone={onDone}
			query={
				<CodeBlock>{`{ tool_calls: [
  { name: "SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION",
    args: { permalink: "…/p1782959651275229" } },
  { name: "SENTRY_RETRIEVE_PROJECT_ISSUES_LIST",
    args: { org: "composio-ly", project: "sarah-demo",
            query: "is:unresolved" } },
  { name: "DATADOG_SEARCH_LOGS",
    args: { service: "agentic-snippet-board",
            query: "status:error", time_from: <7d> } },
] }`}</CodeBlock>
			}
			response={
				<ResultLine>
					<span style={{ color: COL_ADD, fontWeight: 700 }}>✓</span>{" "}
					<span style={{ color: "var(--terminal-fg)" }}>3/3</span>{" "}
					<span style={{ color: "var(--terminal-dim)" }}>
						· thread parsed · 1 sentry issue{" "}
					</span>
					<Mono>SARAH-DEMO-1</Mono>{" "}
					<span style={{ color: "var(--terminal-dim)" }}>· 14 datadog matches</span>
				</ResultLine>
			}
		/>
	);
}

function MultiExecuteBlock2({ onDone }: { onDone?: () => void }) {
	return (
		<ToolCall
			tool="COMPOSIO_MULTI_EXECUTE_TOOL"
			latencyMs={1100}
			onDone={onDone}
			query={
				<CodeBlock>{`{ tool_calls: [
  { name: "GITHUB_CREATE_A_PULL_REQUEST",
    args: { owner: "ComposioHQ",
            repo:  "agentic-snippet-board",
            head:  "fix/snippet-search-regex-escape",
            base:  "main",
            title: "fix(search): escape regex metacharacters …",
            draft: true } },
] }`}</CodeBlock>
			}
			response={
				<ResultLine>
					<span style={{ color: COL_ADD, fontWeight: 700 }}>✓</span>{" "}
					<span style={{ color: "var(--terminal-fg)" }}>
						draft PR opened
					</span>{" "}
					<span style={{ color: "var(--terminal-dim)" }}>·{" "}</span>
					<Link>ComposioHQ/agentic-snippet-board#3</Link>
				</ResultLine>
			}
		/>
	);
}

function ShellUnit({
	command,
	response,
	latencyMs = 350,
	onDone,
}: {
	command: React.ReactNode;
	response: React.ReactNode;
	latencyMs?: number;
	onDone?: () => void;
}) {
	return (
		<ToolCall
			tool="COMPOSIO_REMOTE_BASH"
			latencyMs={latencyMs}
			onDone={onDone}
			query={command}
			response={response}
		/>
	);
}

function ReadUnit({ path, onDone }: { path: string; onDone?: () => void }) {
	return (
		<ToolCall
			tool="fs.read"
			latencyMs={280}
			onDone={onDone}
			query={
				<CodeBlock>
					<span style={{ color: "var(--terminal-teal)" }}>{path}</span>
				</CodeBlock>
			}
			response={<SnippetsFilterBefore />}
		/>
	);
}

function EditUnit({ path, onDone }: { path: string; onDone?: () => void }) {
	return (
		<ToolCall
			tool="fs.edit"
			latencyMs={280}
			onDone={onDone}
			query={
				<CodeBlock>
					<span style={{ color: "var(--terminal-teal)" }}>{path}</span>
				</CodeBlock>
			}
			response={<SnippetsFilterDiff />}
		/>
	);
}

/* Pinned CLI input at the bottom of the terminal. Static — decorative
 * chrome that sells the "you're still in the session" beat. */
function TerminalInput() {
	return (
		<div
			className="flex flex-col gap-1 px-3 pt-2 pb-1"
			style={{
				borderTop: "1px solid var(--terminal-border)",
				background:
					"linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))",
			}}
		>
			<div className="flex items-center gap-2 text-[13px]">
				<span
					style={{ color: "var(--terminal-teal)", fontWeight: 700 }}
				>
					›
				</span>
				<span
					className="terminal-cursor inline-block"
					style={{
						width: 8,
						height: 14,
						background: "var(--terminal-fg)",
					}}
				/>
			</div>
			<div
				className="flex items-center gap-3 text-[11.5px]"
				style={{ color: "var(--terminal-dim)" }}
			>
				<span>
					<span style={{ color: "var(--terminal-fg)" }}>escape</span>{" "}
					interrupt
				</span>
				<span>·</span>
				<span>
					<span style={{ color: "var(--terminal-fg)" }}>ctrl+c</span> clear
				</span>
				<span>·</span>
				<span>
					<span style={{ color: "var(--terminal-fg)" }}>/</span> commands
				</span>
				<span>·</span>
				<span>
					<span style={{ color: "var(--terminal-fg)" }}>!</span> bash
				</span>
				<span className="ml-auto">
					↑94 ↓22k · claude-opus-4-7 · medium
				</span>
			</div>
		</div>
	);
}

function Banner() {
	return (
		<div className="flex flex-col gap-0.5 leading-[1.35]">
			<div>
				<span style={{ color: "var(--terminal-teal)", fontWeight: 700 }}>
					pi
				</span>{" "}
				<span style={{ color: "var(--terminal-dim)" }}>v0.74.2</span>
			</div>
			<div style={{ color: "var(--terminal-dim)" }}>
				<Kbd>escape</Kbd> interrupt · <Kbd>ctrl+c/ctrl+d</Kbd> clear/exit ·{" "}
				<Kbd>/</Kbd> commands · <Kbd>!</Kbd> bash · <Kbd>ctrl+o</Kbd> more
			</div>
			<div style={{ color: "var(--terminal-dim)" }}>
				Press ctrl+o to show full startup help and loaded resources.
			</div>
			<div style={{ color: "var(--terminal-dim)" }}>
				Pi can explain its own features and look up its docs. Ask it how to
				use or extend Pi.
			</div>
			<div className="mt-2" style={{ color: "var(--terminal-dim)" }}>
				Navigated to selected point
			</div>
		</div>
	);
}

function Kbd({ children }: { children: React.ReactNode }) {
	return <span style={{ color: "var(--terminal-fg)" }}>{children}</span>;
}

function UserPrompt() {
	return (
		<div
			className="rounded-sm px-3 py-2 leading-relaxed"
			style={{
				background: "rgba(217,119,87,0.03)",
				border: "1px solid rgba(217,119,87,0.32)",
				color: "var(--terminal-fg)",
			}}
		>
			pull in{" "}
			<Link>
				https://composioworkspace.slack.com/archives/C0BEMBK5XDG/p1782959651275229
			</Link>{" "}
			and use sentry &amp; datadog to find the error msg (datadog
			service:agentic-snippet-board, sentry org composio-ly, project
			sarah-demo), fine the root cause &amp; create a draft PR with the fix
		</div>
	);
}

function AssistantLine({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="italic leading-relaxed"
			style={{ color: "var(--terminal-dim)" }}
		>
			{children}
		</div>
	);
}

function AgentPanel({
	title,
	subtitle,
	children,
}: {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className="rounded-sm px-3 py-2.5"
			style={{
				background: "rgba(255,255,255,0.025)",
				border: "1px solid rgba(255,255,255,0.05)",
			}}
		>
			<div
				className="mb-1.5"
				style={{ color: "var(--terminal-dim)" }}
			>
				Agent ·{" "}
				<span style={{ color: "var(--terminal-teal)", fontWeight: 700 }}>
					{title}
				</span>
			</div>
			{subtitle && (
				<div
					className="mb-2"
					style={{ color: "var(--terminal-fg)", fontWeight: 600 }}
				>
					{subtitle}
				</div>
			)}
			<div className="flex flex-col gap-2">{children}</div>
		</div>
	);
}

function Tail() {
	return (
		<div style={{ color: "var(--terminal-dim)" }}>
			<span style={{ color: "var(--terminal-green)" }}>✓</span> session:tail
		</div>
	);
}

/* ─── Search Tools plan (verbatim) ──────────────────────────────────────── */

const COL_TAG = "#FFEB55"; // bright yellow — tool name brackets
const COL_OPT = "#C27E65"; // orange — Optional / string literals
const COL_PREREQ = "#825CC2"; // purple — Prerequisite
const COL_REQ = "#BF5053"; // red — Required
const COL_KEY = "#4689CC"; // light blue — python/ts keywords
const COL_BUILTIN = "#43C0A0"; // teal — builtins (int, sum, dict…)
const COL_NUM = "#A7C598"; // pale green — numbers / True / None
const COL_FN = "#D4D69A"; // yellow-green — function names
const COL_PARAM = "#8CD3FE"; // light cyan — parameters
const COL_ADD = "#A6B255"; // green-yellow — added diff lines
const COL_STR = "#C27E65"; // orange — strings
const COL_LINK = "#6F90B0"; // link blue
const COL_WARN = "#FFEB55"; // warnings — bright yellow

/* Tool discovery result. Slack renders in full ChatGPT-plan detail because
 * that's the primary app the agent's about to work through. Sentry and
 * Datadog collapse to the compact PlanAppRow so the box stays readable. */
function SearchToolsPlan() {
	return (
		<div className="flex flex-col gap-3 leading-relaxed">
			<div style={{ color: "var(--terminal-dim)", fontSize: 11.5 }}>
				20 tools · 3 connections resolved · 6 usage-warnings attached
			</div>

			{/* Slack — full plan */}
			<PlanAppFull
				name="Slack"
				count={5}
				connection="Composio (default)"
				pitfalls={[
					"FETCH_CONVERSATION_HISTORY: only returns channel timeline; won't include thread replies unless you fetch the thread separately",
					"FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION: messages[] includes parent + replies; don't assume the first item is a reply",
					"FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION: thread_not_found if ts isn't the exact parent message timestamp",
				]}
			>
				<PlanStep
					n={1}
					tags={["SLACK_FIND_CHANNELS"]}
					chips={["Optional (if channel is unknown)", "Prerequisite"]}
					kinds={["opt", "prereq"]}
				>
					Resolve the conversation using SLACK_FIND_CHANNELS (identify the
					channel to query).
				</PlanStep>
				<PlanStep
					n={2}
					tags={["SLACK_SEARCH_MESSAGES"]}
					chips={[
						"Optional (if parent message timestamp is unknown)",
						"Prerequisite",
					]}
					kinds={["opt", "prereq"]}
				>
					Locate the parent message using SLACK_SEARCH_MESSAGES (capture
					exact channel and parent ts).
				</PlanStep>
				<PlanStep
					n={3}
					tags={["SLACK_FETCH_CONVERSATION_HISTORY"]}
					chips={["Optional (if multiple candidates match)", "Prerequisite"]}
					kinds={["opt", "prereq"]}
				>
					Confirm the correct parent message using
					SLACK_FETCH_CONVERSATION_HISTORY (verify in timeline and record
					exact parent ts).
				</PlanStep>
				<div style={{ color: "var(--terminal-dim)", fontSize: 10.5 }}>
					&nbsp;&nbsp;…2 more steps
				</div>
			</PlanAppFull>

			{/* Sentry + Datadog — compact */}
			<div className="flex flex-col gap-2">
				<PlanAppRow
					name="Sentry"
					count={6}
					tags={["GET_ORG", "GET_PROJECT_LIST", "RETRIEVE_ISSUES"]}
					hint="org: composio-ly / sarah-demo"
				/>
				<PlanAppRow
					name="Datadog"
					count={9}
					tags={["SEARCH_LOGS", "LIST_APM_SERVICES", "LIST_LOG_INDEXES"]}
					hint="service: agentic-snippet-board"
				/>
			</div>
		</div>
	);
}

/* Full-detail app plan — header row + PlanStep/PlanWarn children indented
 * to align with the compact PlanAppRow visuals below it. */
function PlanAppFull({
	name,
	count,
	connection,
	pitfalls,
	children,
}: {
	name: string;
	count: number;
	connection?: string;
	pitfalls?: string[];
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-baseline gap-2 text-[12px]">
				<span
					style={{
						color: "var(--terminal-fg)",
						fontWeight: 700,
						minWidth: 80,
					}}
				>
					{name}
				</span>
				<span
					className="whitespace-nowrap"
					style={{ color: "var(--terminal-dim)" }}
				>
					{count} tools
				</span>
				{connection ? (
					<span
						className="ml-auto whitespace-nowrap"
						style={{ color: "var(--terminal-dim)", fontSize: 10.5 }}
					>
						{connection}
					</span>
				) : null}
			</div>
			<div className="flex flex-col gap-1 pl-[88px] text-[11px]">
				{children}
			</div>
			{pitfalls && pitfalls.length > 0 ? (
				<PitfallsBlock pitfalls={pitfalls} />
			) : null}
		</div>
	);
}

function PlanAppRow({
	name,
	count,
	tags,
	hint,
	pitfalls,
}: {
	name: string;
	count: number;
	tags: string[];
	hint?: string;
	pitfalls?: string[];
}) {
	const extra = count - tags.length;
	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-baseline gap-2 text-[12px]">
				<span
					style={{
						color: "var(--terminal-fg)",
						fontWeight: 700,
						minWidth: 80,
					}}
				>
					{name}
				</span>
				<span
					className="whitespace-nowrap"
					style={{ color: "var(--terminal-dim)" }}
				>
					{count} tools
				</span>
				<span
					className="min-w-0 flex-1 truncate"
					style={{
						color: COL_TAG,
						fontFamily: '"JetBrains Mono", ui-monospace, monospace',
						fontSize: 10.5,
					}}
				>
					[{tags.join(", ")}
					{extra > 0 ? (
						<span style={{ color: "var(--terminal-dim)" }}>
							, +{extra} more
						</span>
					) : null}
					]
				</span>
				{hint ? (
					<span
						className="shrink-0 whitespace-nowrap"
						style={{ color: "var(--terminal-dim)", fontSize: 10.5 }}
					>
						{hint}
					</span>
				) : null}
			</div>
			{pitfalls && pitfalls.length > 0 ? (
				<PitfallsBlock pitfalls={pitfalls} />
			) : null}
		</div>
	);
}

/* Yellow-bordered pitfalls block. Sits under the compact app row and
 * makes it obvious these are the calls to watch out for. */
function PitfallsBlock({ pitfalls }: { pitfalls: string[] }) {
	return (
		<div
			className="ml-[88px] flex flex-col gap-0.5 px-2 py-1.5"
			style={{
				border: "1px solid rgba(255,235,85,0.28)",
				borderRadius: 6,
			}}
		>
			<div
				className="flex items-center gap-1"
				style={{
					color: COL_WARN,
					fontSize: 9.5,
					fontWeight: 700,
					letterSpacing: "0.16em",
					textTransform: "uppercase",
				}}
			>
				<span>⚠</span>
				<span>pitfalls</span>
			</div>
			{pitfalls.map((p) => (
				<div
					key={p}
					style={{
						color: COL_WARN,
						fontSize: 10.5,
						lineHeight: 1.45,
						fontFamily: '"JetBrains Mono", ui-monospace, monospace',
					}}
				>
					{p}
				</div>
			))}
		</div>
	);
}

function PlanApp({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col gap-1.5">{children}</div>;
}

function PlanDivider() {
	return (
		<div
			className="my-1 select-none"
			style={{ color: "var(--terminal-dim)" }}
		>
			{"─".repeat(80)}
		</div>
	);
}

function PlanStep({
	n,
	tags,
	chips,
	kinds,
	children,
}: {
	n: number;
	tags: string[];
	chips: string[];
	kinds: Array<"opt" | "prereq" | "req">;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-baseline gap-1.5 leading-relaxed">
			<span className="shrink-0" style={{ color: "var(--terminal-fg)" }}>
				{n}.
			</span>
			<span className="shrink-0 whitespace-nowrap">
				{tags.map((t, i) => (
					<span key={t}>
						<Tag>{t}</Tag>
						{i < tags.length - 1 ? " " : null}
					</span>
				))}
			</span>
			<span className="shrink-0 whitespace-nowrap">
				{chips.map((c, i) => (
					<Chip key={c + i} kind={kinds[i]}>
						{c}
					</Chip>
				))}
			</span>
			<span
				className="min-w-0 flex-1 truncate"
				style={{ color: "var(--terminal-dim)" }}
			>
				{children}
			</span>
		</div>
	);
}

function Tag({ children }: { children: React.ReactNode }) {
	return <span style={{ color: COL_TAG }}>[{children}]</span>;
}

function Chip({
	kind,
	children,
}: {
	kind: "opt" | "prereq" | "req";
	children: React.ReactNode;
}) {
	const c =
		kind === "opt" ? COL_OPT : kind === "prereq" ? COL_PREREQ : COL_REQ;
	return <span style={{ color: c }}>[{children}]</span>;
}

function PlanWarn({ children }: { children: React.ReactNode }) {
	return (
		<div style={{ color: COL_WARN }}>
			&nbsp;&nbsp;⚠ {children}
		</div>
	);
}

function PlanNote({ children }: { children: React.ReactNode }) {
	return (
		<div style={{ color: "var(--terminal-dim)" }}>
			{children}
		</div>
	);
}

function Code({
	children,
}: {
	children: Array<string | { t: string; c: string }>;
}) {
	return (
		<div
			className="whitespace-pre pl-2"
			style={{
				color: "var(--terminal-fg)",
				borderLeft: "2px solid rgba(255,255,255,0.08)",
			}}
		>
			<span style={{ color: "var(--terminal-dim)" }}>▌ </span>
			{children.map((chunk, i) =>
				typeof chunk === "string" ? (
					<span key={i}>{chunk}</span>
				) : (
					<span key={i} style={{ color: chunk.c }}>
						{chunk.t}
					</span>
				),
			)}
		</div>
	);
}

function Conn({
	name,
	accounts,
}: {
	name: string;
	accounts: Array<{ name: string; def?: boolean }>;
}) {
	return (
		<div className="mt-0.5">
			<div>
				<span style={{ color: COL_ADD }}>●</span>{" "}
				<span style={{ color: "var(--terminal-fg)", fontWeight: 600 }}>
					{name}
				</span>
			</div>
			{accounts.map((a) => (
				<div
					key={a.name || "default"}
					className="ml-4"
					style={{ color: "var(--terminal-dim)" }}
				>
					<span style={{ color: COL_ADD }}>●</span>{" "}
					{a.name && (
						<span style={{ color: "var(--terminal-fg)" }}>{a.name}</span>
					)}
					{a.def ? " (default)" : null}
				</div>
			))}
		</div>
	);
}

/* ─── Multi Execute blocks ──────────────────────────────────────────────── */

// MultiExecute1/2 replaced by MultiExecuteBlock1/2 → ToolCall. Kept as
// no-op stubs so any lingering imports still resolve.
function MultiExecute1(_props: { onDone?: () => void }) {
	return null;
}

function MultiExecute2(_props: { onDone?: () => void }) {
	return null;
}

function Paren({ children }: { children: React.ReactNode }) {
	return <span style={{ color: "var(--terminal-dim)" }}>{children}</span>;
}

function ToolResult({ name }: { name: string }) {
	return (
		<div>
			<span style={{ color: "var(--terminal-fg)", fontWeight: 600 }}>
				{name}
			</span>{" "}
			<span style={{ color: COL_ADD }}>[✓]</span>
		</div>
	);
}

/* ─── Shell / read / edit blocks ────────────────────────────────────────── */

function ShellBlock({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="rounded-sm px-3 py-2"
			style={{
				background: "rgba(255,255,255,0.025)",
				border: "1px solid rgba(255,255,255,0.05)",
			}}
		>
			{children}
		</div>
	);
}

function ShellCmd({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="whitespace-pre-wrap"
			style={{ color: "var(--terminal-fg)", fontWeight: 600 }}
		>
			{children}
		</div>
	);
}

function ShellOut({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="mt-2 whitespace-pre-wrap"
			style={{ color: "var(--terminal-dim)" }}
		>
			{children}
		</div>
	);
}

function Took({ children }: { children: React.ReactNode }) {
	return (
		<div className="mt-2" style={{ color: "var(--terminal-dim)" }}>
			{children}
		</div>
	);
}

function ReadBlock({
	path,
	children,
}: {
	path: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className="rounded-sm px-3 py-2"
			style={{
				background: "rgba(255,255,255,0.025)",
				border: "1px solid rgba(255,255,255,0.05)",
			}}
		>
			<div>
				<span style={{ color: "var(--terminal-fg)", fontWeight: 600 }}>
					read
				</span>{" "}
				<span style={{ color: "var(--terminal-teal)" }}>{path}</span>
			</div>
			<div className="mt-2 flex flex-col gap-0.5 whitespace-pre">
				{children}
			</div>
		</div>
	);
}

function EditBlock({
	path,
	children,
}: {
	path: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className="rounded-sm px-3 py-2"
			style={{
				background: "rgba(255,255,255,0.025)",
				border: "1px solid rgba(255,255,255,0.05)",
			}}
		>
			<div>
				<span style={{ color: "var(--terminal-fg)", fontWeight: 600 }}>
					edit
				</span>{" "}
				<span style={{ color: "var(--terminal-teal)" }}>{path}</span>
			</div>
			<div className="mt-2 flex flex-col gap-0.5 whitespace-pre font-mono">
				{children}
			</div>
		</div>
	);
}

function SnippetsFilterBefore() {
	return (
		<>
			<CodeLine>
				<K>import</K> <K>type</K> {"{ Snippet }"} <K>from</K>{" "}
				<S>"~/types/snippet"</S>;
			</CodeLine>
			<CodeLine />
			<CodeLine>
				<K>export</K> <K>function</K> <F>filterSnippets</F>(
				<P>snippets: Snippet[], query: </P>
				<B>string</B>
				<P>)</P>: Snippet[] {"{"}
			</CodeLine>
			<CodeLine>
				&nbsp;&nbsp;<K>const</K> trimmed = query.trim();
			</CodeLine>
			<CodeLine>
				&nbsp;&nbsp;<K>if</K> (trimmed === <S>""</S>) <K>return</K> snippets;
			</CodeLine>
			<CodeLine>
				&nbsp;&nbsp;<K>const</K> re = <K>new</K> <B>RegExp</B>(trimmed,{" "}
				<S>"i"</S>);
			</CodeLine>
			<CodeLine>
				&nbsp;&nbsp;<K>return</K> snippets.filter(<P>(</P>
				<P>s</P>
				<P>)</P> =&gt; re.test(s.title) || re.test(s.content));
			</CodeLine>
			<CodeLine>{"}"}</CodeLine>
		</>
	);
}

function SnippetsFilterDiff() {
	return (
		<>
			<DiffLine kind="ctx">&nbsp;&nbsp;&nbsp;&nbsp;...</DiffLine>
			<DiffLine kind="ctx">&nbsp;&nbsp;2</DiffLine>
			<DiffLine kind="ctx">
				&nbsp;&nbsp;3 export function filterSnippets(snippets: Snippet[],
				query: string): Snippet[] {"{"}
			</DiffLine>
			<DiffLine kind="ctx">
				&nbsp;&nbsp;4 &nbsp;&nbsp;const trimmed = query.trim();
			</DiffLine>
			<DiffLine kind="ctx">
				&nbsp;&nbsp;5 &nbsp;&nbsp;if (trimmed === "") return snippets;
			</DiffLine>
			<DiffLine kind="del">
				- 6 &nbsp;&nbsp;const re = new RegExp(trimmed, "i");
			</DiffLine>
			<DiffLine kind="add">
				+ 6 &nbsp;&nbsp;// Escape regex metacharacters so user queries like
				"(prod)" or "[oops"
			</DiffLine>
			<DiffLine kind="add">
				+ 7 &nbsp;&nbsp;// are treated as literal substrings instead of raw
				regex patterns.
			</DiffLine>
			<DiffLine kind="add">
				+ 8 &nbsp;&nbsp;const escaped = trimmed.replace(/[.*+?^${"{"}
				{"}"}()|[\]\\]/g, "\\$&amp;");
			</DiffLine>
			<DiffLine kind="add">
				+ 9 &nbsp;&nbsp;const re = new RegExp(escaped, "i");
			</DiffLine>
			<DiffLine kind="ctx">
				&nbsp;&nbsp;7 &nbsp;&nbsp;return snippets.filter((s) =&gt; re.test(s.title) ||
				re.test(s.content));
			</DiffLine>
			<DiffLine kind="ctx">&nbsp;&nbsp;8 {"}"}</DiffLine>
		</>
	);
}

function DiffLine({
	kind,
	children,
}: {
	kind: "add" | "del" | "ctx";
	children: React.ReactNode;
}) {
	const color =
		kind === "add" ? COL_ADD : kind === "del" ? COL_REQ : "var(--terminal-dim)";
	return <div style={{ color }}>{children}</div>;
}

function CodeLine({ children }: { children?: React.ReactNode }) {
	return (
		<div style={{ color: "var(--terminal-fg)" }}>{children ?? " "}</div>
	);
}

function K({ children }: { children: React.ReactNode }) {
	return <span style={{ color: COL_KEY }}>{children}</span>;
}
function S({ children }: { children: React.ReactNode }) {
	return <span style={{ color: COL_STR }}>{children}</span>;
}
function F({ children }: { children: React.ReactNode }) {
	return <span style={{ color: COL_FN }}>{children}</span>;
}
function P({ children }: { children: React.ReactNode }) {
	return <span style={{ color: COL_PARAM }}>{children}</span>;
}
function B({ children }: { children: React.ReactNode }) {
	return <span style={{ color: COL_BUILTIN }}>{children}</span>;
}

function Link({ children }: { children: React.ReactNode }) {
	return (
		<span style={{ color: "#D97757", textDecoration: "underline" }}>
			{children}
		</span>
	);
}

/* ─── Final report ──────────────────────────────────────────────────────── */

function FinalReport({ onDone }: { onDone?: () => void }) {
	return (
		<Stream onDone={onDone}>
		<div className="flex flex-col gap-2 leading-relaxed">
			<div>
				Done — draft PR opened:{" "}
				<Link>ComposioHQ/agentic-snippet-board#3</Link>
			</div>
			<div style={{ color: "var(--terminal-dim)" }}>
				(https://github.com/ComposioHQ/agentic-snippet-board/pull/3)
			</div>

			<div
				className="mt-2 font-bold"
				style={{ color: "var(--terminal-fg)" }}
			>
				### Investigation trail
			</div>
			<div>
				- <b>Slack</b> (<Link>thread</Link>): user reports error when
				searching <Mono>"(prod)"</Mono>.
			</div>
			<div>
				- <b>Sentry</b> <Mono>composio-ly/sarah-demo</Mono> →{" "}
				<Link>SARAH-DEMO-1</Link>: <Mono>TRPCError:</Mono>{" "}
				<Mono>Invalid regular expression: /[oops/i: Unterminated character class</Mono>{" "}
				— 14 events, escalating, culprit <Mono>GET /api/trpc/[trpc]</Mono>.
			</div>
			<div>
				- <b>Datadog</b> <Mono>service:agentic-snippet-board</Mono>:{" "}
				<Mono>tRPC failed on snippet.search</Mono> with variants{" "}
				<Mono>/[oops/i</Mono>, <Mono>/(/i</Mono>, <Mono>/foo(bar/i</Mono> —
				all <Mono>RegExp</Mono> syntax errors on user-supplied queries.
			</div>

			<div
				className="mt-2 font-bold"
				style={{ color: "var(--terminal-fg)" }}
			>
				### Root cause
			</div>
			<div>
				<Mono>src/server/snippets.filter.ts</Mono> did{" "}
				<Mono>new RegExp(query.trim(), "i")</Mono> directly on user input.
				Any query with regex metacharacters (<Mono>(</Mono>, <Mono>[</Mono>,{" "}
				<Mono>+</Mono>, …) throws <Mono>SyntaxError</Mono>, surfacing as a
				TRPCError from <Mono>snippet.search</Mono>.
			</div>

			<div
				className="mt-2 font-bold"
				style={{ color: "var(--terminal-fg)" }}
			>
				### Fix (branch <Mono>fix/snippet-search-regex-escape</Mono>)
			</div>
			<div
				className="whitespace-pre-wrap rounded-sm px-3 py-2"
				style={{
					background: "rgba(255,255,255,0.03)",
					border: "1px solid rgba(255,255,255,0.05)",
					color: "var(--terminal-fg)",
				}}
			>
				<div style={{ color: "var(--terminal-dim)" }}>```ts</div>
				<div>
					&nbsp;&nbsp;<K>const</K> escaped = trimmed.replace(/[.*+?^$
					{"{}"}()|[\]\\]/g, <S>"\\$&amp;"</S>);
				</div>
				<div>
					&nbsp;&nbsp;<K>const</K> re = <K>new</K> <B>RegExp</B>(escaped,{" "}
					<S>"i"</S>);
				</div>
				<div style={{ color: "var(--terminal-dim)" }}>```</div>
			</div>
			<div>
				Escapes metacharacters so queries like <Mono>(prod)</Mono> are
				treated as literal substrings. PR is marked <b>draft</b> with full
				context, Sentry/Datadog/Slack links, and suggested follow-ups (unit
				tests, possibly swap to <Mono>includes</Mono>).
			</div>
		</div>
		</Stream>
	);
}

function Mono({ children }: { children: React.ReactNode }) {
	return (
		<span
			style={{
				color: "var(--terminal-teal)",
				fontFamily: '"JetBrains Mono", ui-monospace, monospace',
			}}
		>
			{children}
		</span>
	);
}
