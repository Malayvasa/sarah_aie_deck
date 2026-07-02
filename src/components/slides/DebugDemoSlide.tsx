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
}: {
	children: React.ReactNode;
	delayMs?: number;
	onDone?: () => void;
}) {
	const total = useMemo(() => countTokens(children), [children]);
	const [count, setCount] = useState(0);
	const onDoneRef = useRef(onDone);
	onDoneRef.current = onDone;
	useEffect(() => {
		setCount(0);
		if (total === 0) {
			// Nothing to stream — schedule onDone on next tick so callers
			// still get a chance to advance.
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
	}, [total, delayMs]);
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
									<ShellUnit>
										<ShellCmd>
											$ cd /Users/sarahsimionescu/GitHub/test-app && ls &&
											git remote -v && git branch --show-current
										</ShellCmd>
										<ShellOut>
											<span style={{ color: "var(--terminal-dim)" }}>
												... (13 earlier lines, ctrl+o to expand)
											</span>
											{"\n"}tsconfig.tsbuildinfo{"\n"}vitest.config.ts{"\n"}
											origin&nbsp;&nbsp;
											https://github.com/ComposioHQ/agentic-snippet-board.git
											(fetch){"\n"}origin&nbsp;&nbsp;
											https://github.com/ComposioHQ/agentic-snippet-board.git
											(push){"\n"}main
										</ShellOut>
										<Took>Took 0.1s</Took>
									</ShellUnit>
									<ShellUnit>
										<ShellCmd>
											{`$ cd /Users/sarahsimionescu/GitHub/test-app && grep -rn "snippet.search\\|snippet\\.search\\|\\.search\\b\\|new RegExp" src/server 2>/dev/null | head -30`}
										</ShellCmd>
										<ShellOut>
											src/server/snippets.filter.ts:6:&nbsp;&nbsp;const re =
											new RegExp(trimmed, "i");
										</ShellOut>
										<Took>Took 0.0s</Took>
									</ShellUnit>
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
									<ShellUnit>
										<ShellCmd>
											$ cd /Users/sarahsimionescu/GitHub/test-app && git
											checkout -b fix/snippet-search-regex-escape && git add
											src/server/snippets.filter.ts && git commit -m
											"fix(search): escape regex metacharacters in snippet
											search query
											{"\n\n"}User-provided queries were passed directly into
											new RegExp, causing{"\n"}TRPCError: Invalid regular
											expression when the query contained regex{"\n"}
											metacharacters like '(', '[', etc. (e.g. searching
											'(prod)').{"\n\n"}Escape metacharacters before
											constructing the RegExp so queries are{"\n"}treated as
											literal substrings." && git push -u origin
											fix/snippet-search-regex-escape 2&gt;&amp;1 | tail -20
										</ShellCmd>
										<ShellOut>
											<span style={{ color: "var(--terminal-dim)" }}>
												... (10 earlier lines, ctrl+o to expand)
											</span>
											{"\n"}remote: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
											https://github.com/ComposioHQ/agentic-snippet-board/security/dependabot/1
											{"\n"}remote:{"\n"}To
											https://github.com/ComposioHQ/agentic-snippet-board.git
											{"\n"}&nbsp;* [new branch] &nbsp;&nbsp;&nbsp;
											fix/snippet-search-regex-escape →
											fix/snippet-search-regex-escape{"\n"}branch
											'fix/snippet-search-regex-escape' set up to track
											'origin/fix/snippet-search-regex-escape'.
										</ShellOut>
										<Took>Took 2.5s</Took>
									</ShellUnit>
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
		<motion.div className="flex flex-col gap-3" {...FADE}>
			{children}
		</motion.div>
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
		<AgentPanel title="Search Tools" subtitle="Composio">
			<SearchToolsPlan onDone={onDone} />
			<Tail />
		</AgentPanel>
	);
}

function MultiExecuteBlock1({ onDone }: { onDone?: () => void }) {
	return (
		<AgentPanel title="Multi Execute" subtitle="Composio">
			<MultiExecute1 onDone={onDone} />
			<Tail />
		</AgentPanel>
	);
}

function MultiExecuteBlock2({ onDone }: { onDone?: () => void }) {
	return (
		<AgentPanel title="Multi Execute" subtitle="Composio">
			<MultiExecute2 onDone={onDone} />
			<Tail />
		</AgentPanel>
	);
}

function ShellUnit({
	children,
	onDone,
}: {
	children: React.ReactNode;
	onDone?: () => void;
}) {
	return (
		<ShellBlock>
			<Stream onDone={onDone}>{children}</Stream>
		</ShellBlock>
	);
}

function ReadUnit({ path, onDone }: { path: string; onDone?: () => void }) {
	return (
		<ReadBlock path={path}>
			<SnippetsFilterBefore onDone={onDone} />
		</ReadBlock>
	);
}

function EditUnit({ path, onDone }: { path: string; onDone?: () => void }) {
	return (
		<EditBlock path={path}>
			<SnippetsFilterDiff onDone={onDone} />
		</EditBlock>
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
				background: "rgba(255,255,255,0.03)",
				border: "1px solid rgba(255,255,255,0.06)",
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

function SearchToolsPlan({ onDone }: { onDone?: () => void }) {
	return (
		<Stream onDone={onDone}>
		<div className="flex flex-col gap-3 text-[13px] leading-relaxed">
			{/* SLACK */}
			<PlanApp>
				<PlanStep n={1} tags={["SLACK_FIND_CHANNELS"]}
					chips={["Optional (if channel is unknown)", "Prerequisite"]}
					kinds={["opt", "prereq"]}>
					Resolve the conversation using SLACK_FIND_CHANNELS (identify the
					channel to query).
				</PlanStep>
				<PlanStep n={2} tags={["SLACK_SEARCH_MESSAGES"]}
					chips={["Optional (if parent message timestamp is unknown)", "Prerequisite"]}
					kinds={["opt", "prereq"]}>
					Locate the parent message using SLACK_SEARCH_MESSAGES (capture
					exact channel and parent ts).
				</PlanStep>
				<PlanStep n={3} tags={["SLACK_FETCH_CONVERSATION_HISTORY"]}
					chips={["Optional (if multiple candidates match)", "Prerequisite"]}
					kinds={["opt", "prereq"]}>
					Confirm the correct parent message using
					SLACK_FETCH_CONVERSATION_HISTORY (verify in timeline and record
					exact parent ts).
				</PlanStep>
				<div style={{ color: "var(--terminal-dim)" }}>
					&nbsp;&nbsp;…5 more steps
				</div>
				<PlanWarn>
					<Tag>SLACK_FETCH_CONVERSATION_HISTORY</Tag> Only returns the channel
					timeline; it won't include thread replies unless you fetch the
					thread separately.
				</PlanWarn>
				<PlanWarn>
					<Tag>SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION</Tag> messages[]
					includes the parent message plus replies; don't assume the first
					item is a reply.
				</PlanWarn>
				<PlanWarn>
					<Tag>SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION</Tag>{" "}
					thread_not_found occurs if ts is not the exact parent message
					timestamp (for example, using a reply timestamp).
				</PlanWarn>
			</PlanApp>
			<PlanDivider />

			{/* SENTRY */}
			<PlanApp>
				<PlanStep n={1} tags={["SENTRY_GET_ORGANIZATION_BY_ID_OR_SLUG"]}
					chips={["Optional (if organization identifier may be wrong)", "Prerequisite"]}
					kinds={["opt", "prereq"]}>
					Confirm access/scope using SENTRY_GET_ORGANIZATION_BY_ID_OR_SLUG
					(avoid org-scoped 403/404 from mismatched identifier).
				</PlanStep>
				<PlanStep n={2}
					tags={["SENTRY_GET_PROJECT_LIST", "SENTRY_RETRIEVE_ORGANIZATION_PROJECTS", "SENTRY_ACCESS_PROJECT_INFORMATION"]}
					chips={["Optional (if project identifiers are missing/ambiguous)", "Prerequisite"]}
					kinds={["opt", "prereq"]}>
					Discover/verify projects using SENTRY_GET_PROJECT_LIST; if
					incomplete, use SENTRY_RETRIEVE_ORGANIZATION_PROJECTS; optionally
					confirm the target using SENTRY_ACCESS_PROJECT_INFORMATION.
				</PlanStep>
				<PlanStep n={3} tags={["SENTRY_RETRIEVE_PROJECT_ISSUES_LIST"]}
					chips={["Required", "Step"]}
					kinds={["req", "prereq"]}>
					For each target project, list recent unresolved issues using
					SENTRY_RETRIEVE_PROJECT_ISSUES_LIST (apply an unresolved-focused
					query; paginate via cursor until exhausted when available; retain
					the full payload if inline output is truncated).
				</PlanStep>
				<div style={{ color: "var(--terminal-dim)" }}>
					&nbsp;&nbsp;…3 more steps
				</div>
				<PlanWarn>
					<Tag>SENTRY_RETRIEVE_PROJECT_ISSUES_LIST</Tag> Issues may be nested
					under response.data.details; treating response.data as a flat list
					can make parsing look empty.
				</PlanWarn>
				<PlanWarn>
					<Tag>SENTRY_RETRIEVE_PROJECT_ISSUES_LIST</Tag> count (and sometimes
					userCount) can be returned as strings; cast to integers before
					sorting to avoid lexicographic ranking.
				</PlanWarn>
				<PlanWarn>
					<Tag>SENTRY_RETRIEVE_PROJECT_ISSUES_LIST</Tag> stats fields can be
					arrays of [epoch,value] buckets; aggregate bucket values rather
					than treating stats as a scalar.
				</PlanWarn>
				<PlanNote>
					Flatten multi-project issue results and rank by numeric count
				</PlanNote>
				<Code>{[
					`issues=[i `,
					{ t: "for", c: COL_KEY },
					` r `,
					{ t: "in", c: COL_KEY },
					` payload.get(`,
					{ t: "'results'", c: COL_STR },
					`,[]) `,
					{ t: "for", c: COL_KEY },
					` i `,
					{ t: "in", c: COL_KEY },
					` ((r.get(`,
					{ t: "'response'", c: COL_STR },
					`,{}).get(`,
					{ t: "'data'", c: COL_STR },
					`,{}) `,
					{ t: "or", c: COL_KEY },
					` {}).get(`,
					{ t: "'details'", c: COL_STR },
					`,[]) `,
					{ t: "or", c: COL_KEY },
					` [])]`,
				]}</Code>
				<Code>{[
					`rows=`,
					{ t: "sorted", c: COL_BUILTIN },
					`(issues,key=`,
					{ t: "lambda", c: COL_KEY },
					` x:`,
					{ t: "int", c: COL_BUILTIN },
					`(x.get(`,
					{ t: "'count'", c: COL_STR },
					`) `,
					{ t: "or", c: COL_KEY },
					` `,
					{ t: "0", c: COL_NUM },
					`),reverse=`,
					{ t: "True", c: COL_NUM },
					`)`,
				]}</Code>
				<Code>{[
					`out=[{k:i.get(k) `,
					{ t: "for", c: COL_KEY },
					` k `,
					{ t: "in", c: COL_KEY },
					` [`,
					{ t: "'id'", c: COL_STR },
					`,`,
					{ t: "'shortId'", c: COL_STR },
					`,`,
					{ t: "'title'", c: COL_STR },
					`,`,
					{ t: "'count'", c: COL_STR },
					`,`,
					{ t: "'lastSeen'", c: COL_STR },
					`,`,
					{ t: "'permalink'", c: COL_STR },
					`]} `,
					{ t: "for", c: COL_KEY },
					` i `,
					{ t: "in", c: COL_KEY },
					` rows[:`,
					{ t: "20", c: COL_NUM },
					`]]`,
				]}</Code>
				<PlanNote>
					Aggregate bucketed stats into a single activity value (when
					present)
				</PlanNote>
				<Code>{[
					{ t: "def", c: COL_KEY },
					` `,
					{ t: "bucket_sum", c: COL_FN },
					`(`,
					{ t: "issue,key", c: COL_PARAM },
					`):`,
				]}</Code>
				<Code>{[
					`    b=(issue.get(`,
					{ t: "'stats'", c: COL_STR },
					`) `,
					{ t: "or", c: COL_KEY },
					` {}).get(key) `,
					{ t: "or", c: COL_KEY },
					` []`,
				]}</Code>
				<Code>{[
					`    `,
					{ t: "return", c: COL_KEY },
					` `,
					{ t: "sum", c: COL_BUILTIN },
					`(v `,
					{ t: "for", c: COL_KEY },
					` _,v `,
					{ t: "in", c: COL_KEY },
					` b `,
					{ t: "if", c: COL_KEY },
					` `,
					{ t: "isinstance", c: COL_BUILTIN },
					`(v,(`,
					{ t: "int", c: COL_BUILTIN },
					`,`,
					{ t: "float", c: COL_BUILTIN },
					`)))`,
				]}</Code>
			</PlanApp>
			<PlanDivider />

			{/* DATADOG */}
			<PlanApp>
				<PlanStep n={1} tags={["DATADOG_SEARCH_LOGS"]}
					chips={["Required", "Prerequisite"]}
					kinds={["req", "prereq"]}>
					Pick a narrow UTC window and convert to 13-digit epoch milliseconds
					for DATADOG_SEARCH_LOGS (control volume/accuracy).
				</PlanStep>
				<PlanStep n={2} tags={["DATADOG_LIST_APM_SERVICES"]}
					chips={["Optional (if service name uncertain)", "Prerequisite"]}
					kinds={["opt", "prereq"]}>
					Enumerate candidate services using DATADOG_LIST_APM_SERVICES (build
					correct service-scoped filters).
				</PlanStep>
				<PlanStep n={3} tags={["DATADOG_LIST_LOG_INDEXES"]}
					chips={["Optional (if index unknown or results unexpectedly empty)", "Prerequisite"]}
					kinds={["opt", "prereq"]}>
					Discover valid indexes using DATADOG_LIST_LOG_INDEXES (avoid
					false-empty searches from wrong index scoping).
				</PlanStep>
				<div style={{ color: "var(--terminal-dim)" }}>
					&nbsp;&nbsp;…6 more steps
				</div>
				<PlanWarn>
					<Tag>DATADOG_SEARCH_LOGS</Tag> time_from/time_to must be epoch
					milliseconds (13-digit); passing seconds can silently mis-scope and
					look like no results.
				</PlanWarn>
				<PlanWarn>
					<Tag>DATADOG_SEARCH_LOGS</Tag> Matches may appear under
					response.data.logs or response.data_preview.logs depending on
					truncation/offloading; don't assume a single path.
				</PlanWarn>
				<PlanWarn>
					<Tag>DATADOG_SEARCH_LOGS</Tag> nextLogId can remain non-empty even
					when a page looks complete; rely on cursor pagination or you can
					miss most matches.
				</PlanWarn>
				<PlanNote>
					Extract logs defensively when DATADOG_SEARCH_LOGS returns either
					full logs or preview logs
				</PlanNote>
				<Code>{[
					{ t: "def", c: COL_KEY },
					` `,
					{ t: "extract_logs", c: COL_FN },
					`(`,
					{ t: "result", c: COL_PARAM },
					`):`,
				]}</Code>
				<Code>{[
					`    r=(result.get(`,
					{ t: "'response'", c: COL_STR },
					`) `,
					{ t: "or", c: COL_KEY },
					` {})`,
				]}</Code>
				<Code>{[
					`    d=(r.get(`,
					{ t: "'data'", c: COL_STR },
					`) `,
					{ t: "or", c: COL_KEY },
					` {})`,
				]}</Code>
				<Code>{[
					`    `,
					{ t: "if", c: COL_KEY },
					` `,
					{ t: "isinstance", c: COL_BUILTIN },
					`(d,`,
					{ t: "dict", c: COL_BUILTIN },
					`) `,
					{ t: "and", c: COL_KEY },
					` d.get(`,
					{ t: "'logs'", c: COL_STR },
					`) `,
					{ t: "is", c: COL_KEY },
					` `,
					{ t: "not", c: COL_KEY },
					` `,
					{ t: "None", c: COL_NUM },
					`:`,
				]}</Code>
				<Code>{[
					`        `,
					{ t: "return", c: COL_KEY },
					` d.get(`,
					{ t: "'logs'", c: COL_STR },
					`) `,
					{ t: "or", c: COL_KEY },
					` []`,
				]}</Code>
				<Code>{[
					`    dp=(r.get(`,
					{ t: "'data_preview'", c: COL_STR },
					`) `,
					{ t: "or", c: COL_KEY },
					` {})`,
				]}</Code>
				<Code>{[
					`    `,
					{ t: "return", c: COL_KEY },
					` dp.get(`,
					{ t: "'logs'", c: COL_STR },
					`) `,
					{ t: "or", c: COL_KEY },
					` []`,
				]}</Code>
				<PlanNote>
					Cluster recurring signatures while tolerating missing/non-string
					fields
				</PlanNote>
				<Code>{[
					{ t: "from", c: COL_KEY },
					` collections `,
					{ t: "import", c: COL_KEY },
					` Counter`,
				]}</Code>
				<Code>{[
					{ t: "def", c: COL_KEY },
					` `,
					{ t: "top_signatures", c: COL_FN },
					`(`,
					{ t: "logs,n=", c: COL_PARAM },
					{ t: "20", c: COL_NUM },
					`):`,
				]}</Code>
				<Code>{[`    c=Counter()`]}</Code>
				<Code>{[
					`    `,
					{ t: "for", c: COL_KEY },
					` l `,
					{ t: "in", c: COL_KEY },
					` logs:`,
				]}</Code>
				<Code>{[
					`        a=l.get(`,
					{ t: "'attributes'", c: COL_STR },
					`) `,
					{ t: "or", c: COL_KEY },
					` {}`,
				]}</Code>
				<Code>{[
					`        msg=`,
					{ t: "str", c: COL_BUILTIN },
					`(l.get(`,
					{ t: "'message'", c: COL_STR },
					`) `,
					{ t: "or", c: COL_KEY },
					` `,
					{ t: "''", c: COL_STR },
					`)[:`,
					{ t: "120", c: COL_NUM },
					`]`,
				]}</Code>
				<Code>{[
					`        err=`,
					{ t: "str", c: COL_BUILTIN },
					`(a.get(`,
					{ t: "'errorMessage'", c: COL_STR },
					`) `,
					{ t: "or", c: COL_KEY },
					` a.get(`,
					{ t: "'error'", c: COL_STR },
					`) `,
					{ t: "or", c: COL_KEY },
					` a.get(`,
					{ t: "'errorStack'", c: COL_STR },
					`) `,
					{ t: "or", c: COL_KEY },
					` `,
					{ t: "''", c: COL_STR },
					`)[:`,
					{ t: "160", c: COL_NUM },
					`]`,
				]}</Code>
				<Code>{[
					`        c[(msg,err)]+=`,
					{ t: "1", c: COL_NUM },
				]}</Code>
				<Code>{[
					`    `,
					{ t: "return", c: COL_KEY },
					` c.most_common(n)`,
				]}</Code>
			</PlanApp>
			<PlanDivider />

			{/* GITHUB */}
			<PlanApp>
				<PlanStep n={1} tags={["GITHUB_GET_A_BRANCH"]}
					chips={["Required", "Prerequisite"]}
					kinds={["req", "prereq"]}>
					Validate base and head refs exist and are accessible using
					GITHUB_GET_A_BRANCH (repeat per ref; use owner-qualified head when
					applicable).
				</PlanStep>
				<PlanStep n={2} tags={["GITHUB_LIST_BRANCHES"]}
					chips={["Optional (if ref name is uncertain)", "Prerequisite"]}
					kinds={["opt", "prereq"]}>
					Discover candidate branch names using GITHUB_LIST_BRANCHES (use to
					correct typos/format before write ops).
				</PlanStep>
				<PlanStep n={3} tags={["GITHUB_COMPARE_TWO_COMMITS"]}
					chips={["Optional (to prevent no-diff/unrelated-history failures)", "Prerequisite"]}
					kinds={["opt", "prereq"]}>
					Compare base vs head using GITHUB_COMPARE_TWO_COMMITS (proceed only
					if head is ahead / not identical).
				</PlanStep>
				<div style={{ color: "var(--terminal-dim)" }}>
					&nbsp;&nbsp;…5 more steps
				</div>
				<PlanWarn>
					<Tag>GITHUB_CREATE_A_PULL_REQUEST</Tag> HTTP 422 Validation Failed
					if base/head invalid/identical, no common history, or an open PR
					already exists; errors[].field may be "head" with code="invalid";
					can also fail with HTTP 403 due to access restrictions.
				</PlanWarn>
				<PlanWarn>
					<Tag>GITHUB_CREATE_A_PULL_REQUEST</Tag> Create response payload can
					be very large/truncated; rely on response.data.number and
					response.data.html_url as canonical outputs.
				</PlanWarn>
				<PlanWarn>
					<Tag>GITHUB_GET_A_PULL_REQUEST</Tag> Immediately after creation,
					mergeable may be null and mergeable_state may be "unknown"; rapid
					follow-up GETs can transiently 404.
				</PlanWarn>
				<PlanNote>Filter and sort pull request list results by an actor field</PlanNote>
				<Code>{[
					`prs=response_data.get(`,
					{ t: "'pull_requests'", c: COL_STR },
					`,[])`,
				]}</Code>
				<Code>{[
					`actor=`,
					{ t: "'a_user'", c: COL_STR },
				]}</Code>
				<Code>{[
					`filtered=[p `,
					{ t: "for", c: COL_KEY },
					` p `,
					{ t: "in", c: COL_KEY },
					` prs `,
					{ t: "if", c: COL_KEY },
					` p.get(`,
					{ t: "'user'", c: COL_STR },
					`,{}).get(`,
					{ t: "'login'", c: COL_STR },
					`)==actor]`,
				]}</Code>
				<Code>{[
					`filtered.sort(key=`,
					{ t: "lambda", c: COL_KEY },
					` p:p.get(`,
					{ t: "'created_at'", c: COL_STR },
					`,`,
					{ t: "''", c: COL_STR },
					`))`,
				]}</Code>
				<Code>{[
					`rows=[(p.get(`,
					{ t: "'title'", c: COL_STR },
					`),p.get(`,
					{ t: "'created_at'", c: COL_STR },
					`)) `,
					{ t: "for", c: COL_KEY },
					` p `,
					{ t: "in", c: COL_KEY },
					` filtered]`,
				]}</Code>
			</PlanApp>

			{/* Connections list */}
			<div className="mt-1">
				<div style={{ color: "var(--terminal-fg)", fontWeight: 600 }}>
					Connections
				</div>
				<Conn name="slack" accounts={[{ name: "Composio", def: true }]} />
				<Conn
					name="sentry"
					accounts={[{ name: "@composio-sentry", def: true }]}
				/>
				<Conn
					name="datadog"
					accounts={[
						{ name: "@dashboard-write-only-key", def: true },
						{ name: "@read-logs" },
					]}
				/>
				<Conn name="github" accounts={[{ name: "", def: true }]} />
			</div>
		</div>
		</Stream>
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
		<div className="leading-relaxed">
			<span style={{ color: "var(--terminal-fg)" }}>{n}.</span>{" "}
			{tags.map((t, i) => (
				<span key={t}>
					<Tag>{t}</Tag>
					{i < tags.length - 1 ? " " : null}
				</span>
			))}{" "}
			{chips.map((c, i) => (
				<Chip key={c + i} kind={kinds[i]}>
					{c}
				</Chip>
			))}{" "}
			<span style={{ color: "var(--terminal-dim)" }}>{children}</span>
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

function MultiExecute1({ onDone }: { onDone?: () => void }) {
	return (
		<Stream onDone={onDone}>
			<div className="flex flex-col gap-2">
				<div style={{ color: "var(--terminal-dim)" }}>
					Executing 3 tools in parallel:{" "}
					<Paren>(SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION)</Paren>{" "}
					<Paren>(SENTRY_RETRIEVE_PROJECT_ISSUES_LIST)</Paren>{" "}
					<Paren>(DATADOG_SEARCH_LOGS)</Paren>
				</div>
				<ToolResult name="SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION" />
				<ToolResult name="SENTRY_RETRIEVE_PROJECT_ISSUES_LIST" />
				<ToolResult name="DATADOG_SEARCH_LOGS" />
				<div>
					<span style={{ color: "var(--terminal-fg)", fontWeight: 600 }}>
						(3/3)
					</span>{" "}
					<span style={{ color: COL_ADD }}>succeeded</span>
				</div>
			</div>
		</Stream>
	);
}

function MultiExecute2({ onDone }: { onDone?: () => void }) {
	return (
		<Stream onDone={onDone}>
			<div className="flex flex-col gap-2">
				<div style={{ color: "var(--terminal-dim)" }}>
					Executing 1 tool: <Paren>(GITHUB_CREATE_A_PULL_REQUEST)</Paren>
				</div>
				<ToolResult name="GITHUB_CREATE_A_PULL_REQUEST" />
				<div>
					<span style={{ color: "var(--terminal-fg)", fontWeight: 600 }}>
						(1/1)
					</span>{" "}
					<span style={{ color: COL_ADD }}>succeeded</span>
				</div>
			</div>
		</Stream>
	);
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

function SnippetsFilterBefore({ onDone }: { onDone?: () => void }) {
	return (
		<Stream onDone={onDone}>
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
		</Stream>
	);
}

function SnippetsFilterDiff({ onDone }: { onDone?: () => void }) {
	return (
		<Stream onDone={onDone}>
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
		</Stream>
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
		<span style={{ color: COL_LINK, textDecoration: "underline" }}>
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
