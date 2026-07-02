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
 * Slide 20 — the data-viz demo. Same terminal shell as the debug demo,
 * streaming a two-question `pi` agent trace: first a PostHog query for
 * onboarding vertical %s, then a follow-up that joins those users against
 * Metabase tool_execution_logs to find their most-used toolkits. Reuses the
 * Stream / Sequence / Fade infrastructure defined in DebugDemoSlide.
 *
 * Trace source: docs/pi-dataviz-trace (RTF export from Sarah).
 */

const TERMINAL_W = 1180;
const TERMINAL_H = 660;

export function DataVizDemoSlide() {
	return (
		<DeckSlide padded={false}>
			<DataVizDemoBody />
			<Notes>
				<PresenterNote noteKey="dataVizDemo" />
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

function DataVizDemoBody() {
	// 8 advances → 9 revealed states (initial + 8 keystrokes).
	const { reached, placeholder } = useStepMotion(8);

	return (
		<div className="flex h-full w-full items-center justify-center bg-black">
			{placeholder}
			<div style={{ width: TERMINAL_W, height: TERMINAL_H }}>
				<TerminalWindow
					className="tk-claude-dark h-full [&_.terminal-body-scroll]:!overflow-y-auto"
					fill
					footer={<TerminalInput />}
					path="~/GitHub/composio-pi-agent (feat/composio-pi-agent)"
					pinScrollBottom
					progress={{ value: 10.7, label: "context" }}
					theme="claude"
					variant="dark"
					bodyClassName="pb-3"
				>
					<div className="flex flex-col gap-3 px-1 text-[13px]">
						<Banner />
						<UserPrompt>
							give me the percentages of the "vertical" users selected during
							onboarding this week (only percentages no counts)
						</UserPrompt>
						{reached(0) && (
							<Fade>
								<Sequence>
									<AssistantText>thinking...</AssistantText>
									<PosthogSearchBlock />
								</Sequence>
							</Fade>
						)}
						{reached(1) && (
							<Fade>
								<Sequence>
									<AssistantText>thinking...</AssistantText>
									<PosthogQueryBlock />
									<VerticalDistResult />
								</Sequence>
							</Fade>
						)}
						{reached(2) && (
							<Fade>
								<Sequence>
									<AssistantText>Navigated to selected point</AssistantText>
									<UserPrompt>
										for the users that selected Ecommerce, what were their
										most commonly used toolkits? (use metabase logs table,
										user id formatted you can match on
										consumer-*-&lt;userid&gt; via metabase via composio
									</UserPrompt>
								</Sequence>
							</Fade>
						)}
						{reached(3) && (
							<Fade>
								<Sequence>
									<AssistantText>thinking...</AssistantText>
									<MetabaseSearchBlock />
									<PosthogLargeQueryBlock />
								</Sequence>
							</Fade>
						)}
						{reached(4) && (
							<Fade>
								<Sequence>
									<AssistantText>thinking...</AssistantText>
									<MetabaseDiscoveryBlock />
									<AssistantText>thinking...</AssistantText>
									<MetabaseSchemaBlock />
								</Sequence>
							</Fade>
						)}
						{reached(5) && (
							<Fade>
								<Sequence>
									<AssistantText>thinking...</AssistantText>
									<Workbench1 />
									<MetabaseDatasetBlock1 />
									<AssistantText>thinking...</AssistantText>
									<Workbench2 />
									<Workbench3 />
								</Sequence>
							</Fade>
						)}
						{reached(6) && (
							<Fade>
								<Sequence>
									<AssistantText>thinking...</AssistantText>
									<BashCatSql />
									<AssistantText>thinking...</AssistantText>
									<Workbench4 />
									<AssistantText>thinking...</AssistantText>
									<MetabaseDatasetBlock2 />
									<BashJq />
								</Sequence>
							</Fade>
						)}
						{reached(7) && (
							<Fade>
								<Sequence>
									<AssistantText>thinking...</AssistantText>
									<ToolkitTableResult />
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
					↑140 ↓101k · R7.0M · claude-opus-4-7 · medium
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

function UserPrompt({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="rounded-sm px-3 py-2 leading-relaxed"
			style={{
				background: "rgba(255,255,255,0.03)",
				border: "1px solid rgba(255,255,255,0.06)",
				color: "var(--terminal-fg)",
			}}
		>
			{children}
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
			<span style={{ color: "var(--terminal-green)" }}>✓</span> session:milk
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

/* ─── Restored shared primitives ────────────────────────────────────────── */

function Link({ children }: { children: React.ReactNode }) {
	return (
		<span style={{ color: COL_LINK, textDecoration: "underline" }}>
			{children}
		</span>
	);
}

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

function PlanApp({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col gap-1.5">{children}</div>;
}

function PlanDivider() {
	return (
		<div className="my-1 select-none" style={{ color: "var(--terminal-dim)" }}>
			{"─".repeat(80)}
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

function PlanWarn({ children }: { children: React.ReactNode }) {
	return (
		<div style={{ color: COL_WARN }}>
			&nbsp;&nbsp;⚠ {children}
		</div>
	);
}

function PlanNote({ children }: { children: React.ReactNode }) {
	return (
		<div style={{ color: "var(--terminal-dim)" }}>{children}</div>
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

/* ─── DataViz-specific stream units ─────────────────────────────────────── */

function PosthogSearchBlock({ onDone }: { onDone?: () => void }) {
	return (
		<AgentPanel title="Search Tools" subtitle="Composio">
			<PosthogPlan onDone={onDone} />
			<Tail />
		</AgentPanel>
	);
}

function PosthogPlan({ onDone }: { onDone?: () => void }) {
	return (
		<Stream onDone={onDone}>
			<div className="flex flex-col gap-3 leading-relaxed">
				<div style={{ color: "var(--terminal-dim)" }}>
					query posthog events for onboarding property vertical selected this
					week and get percentages
				</div>
				<PlanApp>
					<PlanStep
						n={1}
						tags={[
							"POSTHOG_LIST_ORGANIZATION_PROJECTS",
							"POSTHOG_LIST_ALL_PROJECTS_ACROSS_ORGANIZATIONS",
						]}
						chips={["Optional (if project_id unknown)", "Prerequisite"]}
						kinds={["opt", "prereq"]}
					>
						Discover/select an accessible project using
						POSTHOG_LIST_ORGANIZATION_PROJECTS (if needed broaden with
						POSTHOG_LIST_ALL_PROJECTS_ACROSS_ORGANIZATIONS; follow
						pagination).
					</PlanStep>
					<PlanStep
						n={2}
						tags={[
							"POSTHOG_GET_EVENT_DEFINITIONS",
							"POSTHOG_LIST_AND_FILTER_PROJECT_EVENTS",
						]}
						chips={["Required", "Prerequisite"]}
						kinds={["req", "prereq"]}
					>
						Catalog available event names/metadata using
						POSTHOG_GET_EVENT_DEFINITIONS (confirm exact naming/case; if the
						list is long, optionally cross-check candidates via
						POSTHOG_LIST_AND_FILTER_PROJECT_EVENTS).
					</PlanStep>
					<PlanStep
						n={3}
						tags={[
							"POSTHOG_GET_FILTERED_PROJECT_PROPERTY_DEFINITIONS",
							"POSTHOG_RETRIEVE_PROJECT_EVENT_VALUES",
						]}
						chips={[
							"Optional (if filter/breakdown keys or values are unclear)",
							"Prerequisite",
						]}
						kinds={["opt", "prereq"]}
					>
						Identify stable property keys using
						POSTHOG_GET_FILTERED_PROJECT_PROPERTY_DEFINITIONS (and confirm
						distinct buckets via POSTHOG_RETRIEVE_PROJECT_EVENT_VALUES).
					</PlanStep>
					<div style={{ color: "var(--terminal-dim)" }}>
						&nbsp;&nbsp;…4 more steps
					</div>
					<PlanWarn>
						<Tag>POSTHOG_LIST_ALL_PROJECTS_ACROSS_ORGANIZATIONS</Tag> Can fail
						with 401 authentication_error or 403 permission_denied when
						credentials lack access.
					</PlanWarn>
					<PlanWarn>
						<Tag>POSTHOG_CREATE_QUERY_IN_PROJECT_BY_ID</Tag> 400
						validation_error often includes invalid_input (unsupported
						functions), bad_arguments (type mismatch), and not_an_aggregate
						(missing GROUP BY).
					</PlanWarn>
					<PlanWarn>
						<Tag>POSTHOG_CREATE_QUERY_IN_PROJECT_BY_ID</Tag> Results are
						tabular (columns + results) and may be nested under
						data.response or returned as data_preview; map values by column
						index.
					</PlanWarn>
					<PlanNote>
						Extractor for POSTHOG_CREATE_QUERY_IN_PROJECT_BY_ID tabular shapes
						(data/response/data_preview)
					</PlanNote>
					<Code>
						{[
							{ t: "def", c: COL_KEY },
							" table(r):",
						]}
					</Code>
					<Code>
						{[
							"  d=(r ",
							{ t: "or", c: COL_KEY },
							" {}).get(",
							{ t: "'data'", c: COL_STR },
							") ",
							{ t: "or", c: COL_KEY },
							" (r ",
							{ t: "or", c: COL_KEY },
							" {}).get(",
							{ t: "'response'", c: COL_STR },
							") ",
							{ t: "or", c: COL_KEY },
							" {}",
						]}
					</Code>
					<Code>
						{[
							"  rr=d.get(",
							{ t: "'response'", c: COL_STR },
							") ",
							{ t: "or", c: COL_KEY },
							" d",
						]}
					</Code>
					<Code>
						{[
							"  ",
							{ t: "return", c: COL_KEY },
							" rr.get(",
							{ t: "'data'", c: COL_STR },
							") ",
							{ t: "or", c: COL_KEY },
							" rr.get(",
							{ t: "'data_preview'", c: COL_STR },
							") ",
							{ t: "or", c: COL_KEY },
							" rr",
						]}
					</Code>
					<Code>{["t=table(tool_result)"]}</Code>
					<Code>
						{[
							"cols=t.get(",
							{ t: "'columns'", c: COL_STR },
							") ",
							{ t: "or", c: COL_KEY },
							" []",
						]}
					</Code>
					<Code>
						{[
							"rows=t.get(",
							{ t: "'results'", c: COL_STR },
							") ",
							{ t: "or", c: COL_KEY },
							" []",
						]}
					</Code>
					<PlanNote>
						Convert tabular output (columns + results) into list-of-dicts
					</PlanNote>
					<Code>
						{[
							"out=[",
							{ t: "dict", c: COL_BUILTIN },
							"(",
							{ t: "zip", c: COL_BUILTIN },
							"(cols,r)) ",
							{ t: "for", c: COL_KEY },
							" r ",
							{ t: "in", c: COL_KEY },
							" rows]",
						]}
					</Code>
				</PlanApp>
				<div className="mt-1">
					<div style={{ color: "var(--terminal-fg)", fontWeight: 600 }}>
						Connections
					</div>
					<Conn
						name="posthog"
						accounts={[{ name: "soham@composio.dev", def: true }]}
					/>
				</div>
			</div>
		</Stream>
	);
}

function PosthogQueryBlock({ onDone }: { onDone?: () => void }) {
	return (
		<AgentPanel title="Multi Execute" subtitle="Composio">
			<PosthogQueryContent onDone={onDone} />
			<Tail />
		</AgentPanel>
	);
}

function PosthogQueryContent({ onDone }: { onDone?: () => void }) {
	return (
		<Stream onDone={onDone}>
			<div className="flex flex-col gap-2">
				<div style={{ color: "var(--terminal-dim)" }}>
					Executing 1 tool:{" "}
					<Paren>(POSTHOG_CREATE_QUERY_IN_PROJECT_BY_ID)</Paren>
				</div>
				<ToolResult name="POSTHOG_CREATE_QUERY_IN_PROJECT_BY_ID" />
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

function VerticalDistResult({ onDone }: { onDone?: () => void }) {
	return (
		<Stream onDone={onDone}>
			<div className="flex flex-col gap-1 leading-relaxed">
				<div>Vertical distribution from onboarding events (last 7 days):</div>
				<div>&nbsp;</div>
				<div>
					- <b>Marketing</b> — 27.9%
				</div>
				<div>
					- <b>Engineering</b> — 23.8%
				</div>
				<div>
					- <b>Content</b> — 22.9%
				</div>
				<div>
					- <b>Sales</b> — 11.8%
				</div>
				<div>
					- <b>Finance</b> — 8.0%
				</div>
				<div>
					- <b>Ecommerce</b> — 5.6%
				</div>
			</div>
		</Stream>
	);
}

function MetabaseSearchBlock({ onDone }: { onDone?: () => void }) {
	return (
		<AgentPanel title="Search Tools" subtitle="Composio">
			<MetabasePlan onDone={onDone} />
			<Tail />
		</AgentPanel>
	);
}

function MetabasePlan({ onDone }: { onDone?: () => void }) {
	return (
		<Stream onDone={onDone}>
			<div className="flex flex-col gap-3 leading-relaxed">
				<div style={{ color: "var(--terminal-dim)" }}>
					run SQL query against metabase logs table to find toolkits by user
					id pattern
				</div>
				<PlanApp>
					<PlanStep
						n={1}
						tags={["METABASE_LIST_DATABASES"]}
						chips={["Required", "Prerequisite"]}
						kinds={["req", "prereq"]}
					>
						Select the target data source using METABASE_LIST_DATABASES
						(identify where error events and auth configuration live).
					</PlanStep>
					<PlanStep
						n={2}
						tags={["METABASE_GET_API_DATABASE_ID_AUTOCOMPLETE_SUGGESTIONS"]}
						chips={[
							"Optional (if database ID is unclear from names)",
							"Prerequisite",
						]}
						kinds={["opt", "prereq"]}
					>
						Confirm the database identifier using
						METABASE_GET_API_DATABASE_ID_AUTOCOMPLETE_SUGGESTIONS (reduce
						mis-targeting before querying).
					</PlanStep>
					<PlanStep
						n={3}
						tags={["METABASE_LIST_TABLES"]}
						chips={["Required", "Step"]}
						kinds={["req", "prereq"]}
					>
						Enumerate candidate tables using METABASE_LIST_TABLES (narrow by
						schema to reduce payload).
					</PlanStep>
					<div style={{ color: "var(--terminal-dim)" }}>
						&nbsp;&nbsp;…5 more steps
					</div>
					<PlanWarn>
						<Tag>METABASE_POST_API_DATASET</Tag> HTTP 400/invalid-query often
						stems from mismatched identifier casing/quoting or alias/CTE
						inconsistencies; quote and alias explicitly.
					</PlanWarn>
					<PlanWarn>
						<Tag>METABASE_POST_API_DATASET</Tag> Responses are structured
						(e.g., separate column metadata and row arrays); don't assume a
						flat list.
					</PlanWarn>
					<PlanWarn>
						<Tag>METABASE_POST_API_DATASET</Tag> Large result sets may be
						truncated (rows-truncated style signal); start with LIMIT and
						prefer aggregates.
					</PlanWarn>
				</PlanApp>
				<div className="mt-1">
					<div style={{ color: "var(--terminal-fg)", fontWeight: 600 }}>
						Connections
					</div>
					<Conn name="metabase" accounts={[{ name: "", def: true }]} />
				</div>
			</div>
		</Stream>
	);
}

function PosthogLargeQueryBlock({ onDone }: { onDone?: () => void }) {
	return (
		<AgentPanel title="Multi Execute" subtitle="Composio">
			<PosthogLargeContent onDone={onDone} />
			<Tail />
		</AgentPanel>
	);
}

function PosthogLargeContent({ onDone }: { onDone?: () => void }) {
	return (
		<Stream onDone={onDone}>
			<div className="flex flex-col gap-2">
				<div style={{ color: "var(--terminal-dim)" }}>
					Executing 1 tool:{" "}
					<Paren>(POSTHOG_CREATE_QUERY_IN_PROJECT_BY_ID)</Paren>
				</div>
				<ToolResult name="POSTHOG_CREATE_QUERY_IN_PROJECT_BY_ID" />
				<div>
					<span style={{ color: "var(--terminal-fg)", fontWeight: 600 }}>
						(1/1)
					</span>{" "}
					<span style={{ color: COL_ADD }}>succeeded</span>
				</div>
				<div style={{ color: "var(--terminal-fg)", fontWeight: 600 }}>
					⇘ large result saved → <Mono>/mnt/files/mex/grow.json</Mono>
				</div>
			</div>
		</Stream>
	);
}

function MetabaseDiscoveryBlock({ onDone }: { onDone?: () => void }) {
	return (
		<AgentPanel title="Multi Execute" subtitle="Composio">
			<MetabaseDiscoveryContent onDone={onDone} />
			<Tail />
		</AgentPanel>
	);
}

function MetabaseDiscoveryContent({ onDone }: { onDone?: () => void }) {
	return (
		<Stream onDone={onDone}>
			<div className="flex flex-col gap-2">
				<div style={{ color: "var(--terminal-dim)" }}>
					Executing 2 tools in parallel:{" "}
					<Paren>(METABASE_GET_API_SEARCH)</Paren>{" "}
					<Paren>(METABASE_LIST_DATABASES)</Paren>
				</div>
				<ToolResult name="METABASE_GET_API_SEARCH" />
				<ToolResult name="METABASE_LIST_DATABASES" />
				<div>
					<span style={{ color: "var(--terminal-fg)", fontWeight: 600 }}>
						(2/2)
					</span>{" "}
					<span style={{ color: COL_ADD }}>succeeded</span>
				</div>
			</div>
		</Stream>
	);
}

function MetabaseSchemaBlock({ onDone }: { onDone?: () => void }) {
	return (
		<AgentPanel title="Multi Execute" subtitle="Composio">
			<MetabaseSchemaContent onDone={onDone} />
			<Tail />
		</AgentPanel>
	);
}

function MetabaseSchemaContent({ onDone }: { onDone?: () => void }) {
	return (
		<Stream onDone={onDone}>
			<div className="flex flex-col gap-2">
				<div style={{ color: "var(--terminal-dim)" }}>
					Executing 1 tool: <Paren>(METABASE_GET_TABLE_SCHEMA)</Paren>
				</div>
				<ToolResult name="METABASE_GET_TABLE_SCHEMA" />
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

/* Remote Workbench panel (Python code) */
function WorkbenchPanel({
	children,
	onDone,
}: {
	children: React.ReactNode;
	onDone?: () => void;
}) {
	return (
		<AgentPanel title="Remote Workbench" subtitle="Composio">
			<Stream onDone={onDone}>
				<div className="flex flex-col gap-0.5">{children}</div>
				<div className="mt-2" style={{ color: "var(--terminal-dim)" }}>
					sandbox:…6i6j
				</div>
			</Stream>
			<Tail />
		</AgentPanel>
	);
}

function Workbench1({ onDone }: { onDone?: () => void }) {
	return (
		<WorkbenchPanel onDone={onDone}>
			<Code>
				{[
					{ t: "import", c: COL_KEY },
					" json",
				]}
			</Code>
			<Code>
				{[
					"d = json.load(",
					{ t: "open", c: COL_BUILTIN },
					"(",
					{ t: "'/mnt/files/mex/grow.json'", c: COL_STR },
					"))",
				]}
			</Code>
			<Code>
				{[
					"users = [r[",
					{ t: "0", c: COL_NUM },
					"] ",
					{ t: "for", c: COL_KEY },
					" r ",
					{ t: "in", c: COL_KEY },
					" d[",
					{ t: "'results'", c: COL_STR },
					"][",
					{ t: "0", c: COL_NUM },
					"][",
					{ t: "'response'", c: COL_STR },
					"][",
					{ t: "'data'", c: COL_STR },
					"][",
					{ t: "'results'", c: COL_STR },
					"]]",
				]}
			</Code>
			<Code>
				{[
					{ t: "print", c: COL_BUILTIN },
					"(",
					{ t: "len", c: COL_BUILTIN },
					"(users), users[:",
					{ t: "3", c: COL_NUM },
					"])",
				]}
			</Code>
			<Code>
				{[
					{
						t: "# Build regex-style OR filter: entityId LIKE 'consumer-%-<uid>' for each",
						c: "#5E8A43",
					},
				]}
			</Code>
			<Code>
				{[
					{ t: "import", c: COL_KEY },
					" re",
				]}
			</Code>
			<Code>
				{[
					"uids_pattern = ",
					{ t: '"|"', c: COL_STR },
					".join(users)",
				]}
			</Code>
			<Code>
				{[
					"sql = ",
					{ t: 'f"""', c: COL_STR },
				]}
			</Code>
			<Code>{["SELECT provider, count() AS c"]}</Code>
			<Code>{["FROM logs"]}</Code>
			<Code>{["WHERE startTime >= now() - INTERVAL 7 DAY"]}</Code>
			<Code>
				{[
					"  AND match(entityId, '^consumer-[^-]+-(",
					{ t: "{uids_pattern}", c: COL_STR },
					")$')",
				]}
			</Code>
			<Code>{["GROUP BY provider"]}</Code>
			<Code>{["ORDER BY c DESC"]}</Code>
			<Code>{['LIMIT 50 """']}</Code>
		</WorkbenchPanel>
	);
}

function MetabaseDatasetBlock1({ onDone }: { onDone?: () => void }) {
	return (
		<AgentPanel title="Multi Execute" subtitle="Composio">
			<Stream onDone={onDone}>
				<div className="flex flex-col gap-2">
					<div style={{ color: "var(--terminal-dim)" }}>
						Executing 1 tool: <Paren>(METABASE_POST_API_DATASET)</Paren>
					</div>
					<ToolResult name="METABASE_POST_API_DATASET" />
					<div>
						<span
							style={{ color: "var(--terminal-fg)", fontWeight: 600 }}
						>
							(1/1)
						</span>{" "}
						<span style={{ color: COL_ADD }}>succeeded</span>
					</div>
				</div>
			</Stream>
			<Tail />
		</AgentPanel>
	);
}

function Workbench2({ onDone }: { onDone?: () => void }) {
	return (
		<WorkbenchPanel onDone={onDone}>
			<Code>
				{[
					"sql = ",
					{ t: 'f"""SELECT provider, count() AS c', c: COL_STR },
				]}
			</Code>
			<Code>{["FROM logs"]}</Code>
			<Code>{["WHERE startTime >= now() - INTERVAL 7 DAY"]}</Code>
			<Code>
				{[
					"  AND match(entityId, '^consumer-(",
					{ t: "{uids_pattern}", c: COL_STR },
					")-')",
				]}
			</Code>
			<Code>{["GROUP BY provider"]}</Code>
			<Code>{['LIMIT 100 """']}</Code>
			<Code>
				{[
					'result, err = run_composio_tool("METABASE_POST_API_DATASET", {"database": ',
					{ t: "232", c: COL_NUM },
					', "type": "native", "native": {"query": sql}})',
				]}
			</Code>
			<Code>
				{[
					{ t: "print", c: COL_BUILTIN },
					"(err)",
				]}
			</Code>
			<Code>
				{[
					"d = result.get(",
					{ t: '"data"', c: COL_STR },
					", {})",
				]}
			</Code>
			<Code>
				{[
					{ t: "print", c: COL_BUILTIN },
					"(",
					{ t: "list", c: COL_BUILTIN },
					"(d.keys())[:",
					{ t: "20", c: COL_NUM },
					"])",
				]}
			</Code>
			<Code>
				{[
					"rows = d.get(",
					{ t: '"data"', c: COL_STR },
					",{}).get(",
					{ t: '"rows"', c: COL_STR },
					")",
				]}
			</Code>
			<Code>
				{[
					{ t: "print", c: COL_BUILTIN },
					"(rows)",
				]}
			</Code>
		</WorkbenchPanel>
	);
}

function Workbench3({ onDone }: { onDone?: () => void }) {
	return (
		<WorkbenchPanel onDone={onDone}>
			<Code>
				{[
					"sql = ",
					{ t: 'f"""SELECT provider, count() AS c', c: COL_STR },
					" FROM logs WHERE startTime >= now() - INTERVAL 7 DAY AND match(entityId, '^consumer-(",
					{ t: "{uids_pattern}", c: COL_STR },
					')-\') GROUP BY provider LIMIT 100"""',
				]}
			</Code>
			<Code>
				{[
					{ t: "with", c: COL_KEY },
					" ",
					{ t: "open", c: COL_BUILTIN },
					"(",
					{ t: "'/mnt/files/mex/sql.txt'", c: COL_STR },
					",",
					{ t: "'w'", c: COL_STR },
					") ",
					{ t: "as", c: COL_KEY },
					" f: f.write(sql)",
				]}
			</Code>
			<Code>
				{[
					{ t: "print", c: COL_BUILTIN },
					"(",
					{ t: "len", c: COL_BUILTIN },
					"(sql))",
				]}
			</Code>
		</WorkbenchPanel>
	);
}

function BashPanel({
	children,
	onDone,
}: {
	children: React.ReactNode;
	onDone?: () => void;
}) {
	return (
		<AgentPanel title="Remote Bash" subtitle="Composio">
			<Stream onDone={onDone}>{children}</Stream>
			<Tail />
		</AgentPanel>
	);
}

function BashCatSql({ onDone }: { onDone?: () => void }) {
	return (
		<BashPanel onDone={onDone}>
			<Code>{["$ cat /mnt/files/mex/sql.txt"]}</Code>
			<div
				className="mt-2 flex flex-col gap-0.5"
				style={{ color: "var(--terminal-dim)" }}
			>
				<Code>{["SELECT provider, count() AS c"]}</Code>
				<Code>{["FROM app_db.tool_execution_logs"]}</Code>
				<Code>{["WHERE startTime >= now() - INTERVAL 7 DAY"]}</Code>
				<Code>
					{[
						"  AND match(entityId, '^consumer-(a16b9f3b-…-4f9bc|3c3ad13b-…-39d0|607dfd3b-…-e70b| ",
					]}
				</Code>
				<Code>
					{["    …459 UIDs joined with '|', truncated for display… )-')"]}
				</Code>
				<Code>{["GROUP BY provider"]}</Code>
				<Code>{["ORDER BY c DESC"]}</Code>
				<Code>{["LIMIT 100"]}</Code>
			</div>
			<div className="mt-2" style={{ color: "var(--terminal-dim)" }}>
				stdout:7 &nbsp;stderr:0 &nbsp;sandbox:…6i6j
			</div>
		</BashPanel>
	);
}

function Workbench4({ onDone }: { onDone?: () => void }) {
	return (
		<WorkbenchPanel onDone={onDone}>
			<Code>
				{[
					"sql = ",
					{ t: "open", c: COL_BUILTIN },
					"(",
					{ t: "'/mnt/files/mex/sql.txt'", c: COL_STR },
					").read()",
				]}
			</Code>
			<Code>
				{[
					'result, err = run_composio_tool("METABASE_POST_API_DATASET", {"database": ',
					{ t: "232", c: COL_NUM },
					', "type": "native", "native": {"query": sql}})',
				]}
			</Code>
			<Code>
				{[
					{ t: "print", c: COL_BUILTIN },
					'("ERR:", err[:',
					{ t: "500", c: COL_NUM },
					"] ",
					{ t: "if", c: COL_KEY },
					" err ",
					{ t: "else", c: COL_KEY },
					' "OK")',
				]}
			</Code>
			<Code>
				{[
					"d = result.get(",
					{ t: '"data"', c: COL_STR },
					", {})",
				]}
			</Code>
			<Code>
				{[
					"rows = d.get(",
					{ t: '"data"', c: COL_STR },
					",{}).get(",
					{ t: '"rows"', c: COL_STR },
					")",
				]}
			</Code>
			<Code>
				{[
					{ t: "print", c: COL_BUILTIN },
					"(rows)",
				]}
			</Code>
		</WorkbenchPanel>
	);
}

function MetabaseDatasetBlock2({ onDone }: { onDone?: () => void }) {
	return (
		<AgentPanel title="Multi Execute" subtitle="Composio">
			<Stream onDone={onDone}>
				<div className="flex flex-col gap-2">
					<div style={{ color: "var(--terminal-dim)" }}>
						Executing 1 tool: <Paren>(METABASE_POST_API_DATASET)</Paren>
					</div>
					<ToolResult name="METABASE_POST_API_DATASET" />
					<div>
						<span
							style={{ color: "var(--terminal-fg)", fontWeight: 600 }}
						>
							(1/1)
						</span>{" "}
						<span style={{ color: COL_ADD }}>succeeded</span>
					</div>
					<div
						style={{ color: "var(--terminal-fg)", fontWeight: 600 }}
					>
						⇘ large result saved → <Mono>/mnt/files/mex/fast.json</Mono>
					</div>
				</div>
			</Stream>
			<Tail />
		</AgentPanel>
	);
}

function BashJq({ onDone }: { onDone?: () => void }) {
	const rows: [string, number][] = [
		["outlook", 2464],
		["composio", 1279],
		["googledrive", 1009],
		["gmail", 1007],
		["instagram", 984],
		["googlesheets", 883],
		["facebook", 173],
		["trello", 149],
		["airtable", 84],
		["zoho_desk", 77],
		["composio_search", 74],
		["google_analytics", 64],
		["googleads", 57],
		["shopify", 45],
		["gemini", 44],
		["googlecalendar", 40],
	];
	return (
		<BashPanel onDone={onDone}>
			<Code>
				{[
					"$ jq -r '.results[0].response.data.data.rows[] | @tsv' /mnt/files/mex/fast.json",
				]}
			</Code>
			<div
				className="mt-2 flex flex-col"
				style={{ color: "var(--terminal-dim)" }}
			>
				{rows.map(([name, count]) => (
					<Code key={name}>{[`${name}\t${count}`]}</Code>
				))}
			</div>
			<div className="mt-2" style={{ color: "var(--terminal-dim)" }}>
				stdout:39 &nbsp;stderr:0 &nbsp;sandbox:…6i6j
			</div>
		</BashPanel>
	);
}

function ToolkitTableResult({ onDone }: { onDone?: () => void }) {
	const rows: [number, string, string][] = [
		[1, "outlook", "28.4%"],
		[2, "composio", "14.7%"],
		[3, "googledrive", "11.6%"],
		[4, "gmail", "11.6%"],
		[5, "instagram", "11.3%"],
		[6, "googlesheets", "10.2%"],
		[7, "facebook", "2.0%"],
		[8, "trello", "1.7%"],
		[9, "airtable", "1.0%"],
		[10, "zoho_desk", "0.9%"],
		[11, "composio_search", "0.9%"],
		[12, "google_analytics", "0.7%"],
		[13, "googleads", "0.7%"],
		[14, "shopify", "0.5%"],
		[15, "gemini", "0.5%"],
		[16, "googlecalendar", "0.5%"],
	];
	return (
		<Stream onDone={onDone}>
			<div className="flex flex-col gap-2 leading-relaxed">
				<div>
					Most-used toolkits by the 459 ecommerce-vertical users (last 7 days,
					from <Mono>logs</Mono> matched via{" "}
					<Mono>entityId LIKE 'consumer-&lt;uid&gt;-…'</Mono>). Total
					executions matched: <b>8,682</b>.
				</div>
				<div
					className="whitespace-pre rounded-sm px-3 py-2 leading-tight"
					style={{
						background: "rgba(255,255,255,0.03)",
						border: "1px solid rgba(255,255,255,0.05)",
						color: "var(--terminal-fg)",
						fontFamily:
							'"JetBrains Mono", ui-monospace, monospace',
					}}
				>
					<div>┌────┬──────────────────┬───────┐</div>
					<div>│ # &nbsp;│ Toolkit &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; │ Share │</div>
					<div>├────┼──────────────────┼───────┤</div>
					{rows.map(([n, name, pct]) => (
						<div key={n}>
							│ {String(n).padStart(2)} │ {name.padEnd(16)} │{" "}
							{pct.padStart(5)} │
						</div>
					))}
					<div>└────┴──────────────────┴───────┘</div>
				</div>
				<div>
					Long tail (&lt;0.5% each): reddit, metaads, googletasks, youtube,
					googledocs, browser_tool, slack, canva, baselinker,
					google_search_console, linkedin, whatsapp, discordbot, omnisend,
					zoho, gumroad, figma, moz, stripe, microsoft_clarity, telegram,
					github, discord.
				</div>
				<div>
					Note: Interestingly heavy on productivity/email
					(outlook/gmail/drive/sheets) and social (instagram/facebook) —
					Shopify itself is only 0.5% of calls, suggesting these ecommerce
					users are mostly using the platform for ad + content + inbox
					workflows around their store.
				</div>
			</div>
		</Stream>
	);
}
