"use client";

import { motion } from "framer-motion";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

/**
 * Slide — "Even 'native' isn't native." Grouped bar chart of the three
 * worst-gap rows pulled from Composio's own eval hub (composio vs each app's
 * Native MCP + Skills, or in Google Drive's case Claude's own connector, on
 * identical tasks): https://ctx.composio.io/Jayesh/evals/native.html
 *
 * The metric is task success rate: share of runs that completed end-to-end
 * and passed a deterministic verifier, same held-out tasks, same model, for
 * both providers. Δ is Composio minus the alternative. These are the three
 * largest gaps in the eval hub's "outcome quality" table.
 *
 * `FAILURES` below is a sample of real failed trials pulled from each app's
 * individual report (e.g. reports/slack-report.html?raw=1) — tasks Composio
 * passed and the alternative didn't, spanning the eval hub's failure taxonomy:
 *   no_capability        the alternative has no tool for this at all
 *   right_tool_bad_args   it picked the right tool but called it wrong
 *   verifier_rejected     it finished but the answer didn't check out
 *   timeout               it never finished
 */

type Comparison = {
	slug: string;
	app: string;
	altLabel: string;
	composio: number;
	alt: number;
	delta: number;
};

const COMPARISONS: Comparison[] = [
	{ slug: "slack", app: "Slack", altLabel: "Native MCP + Skills", composio: 86, alt: 36, delta: 50 },
	{ slug: "datadog", app: "Datadog", altLabel: "Native MCP + Skills", composio: 100, alt: 57, delta: 43 },
	{ slug: "googledrive", app: "Google Drive", altLabel: "Claude Connector", composio: 100, alt: 69, delta: 31 },
];

type FailureKind = "no_capability" | "right_tool_bad_args" | "verifier_rejected" | "timeout";

type Failure = {
	slug: string;
	task: string;
	kind: FailureKind;
};

const FAILURES: Failure[] = [
	{ slug: "slack", task: "Add reaction to a message", kind: "no_capability" },
	{ slug: "datadog", task: "Create a tagged event", kind: "no_capability" },
	{ slug: "datadog", task: "Create a log alert monitor", kind: "right_tool_bad_args" },
	{ slug: "datadog", task: "List org users, roles & log indexes", kind: "verifier_rejected" },
	{ slug: "googledrive", task: "Get storage quota", kind: "verifier_rejected" },
	{ slug: "googledrive", task: "Restore a file from trash", kind: "timeout" },
];

const KIND_LABEL: Record<FailureKind, string> = {
	no_capability: "no_capability",
	right_tool_bad_args: "bad_args",
	verifier_rejected: "wrong_answer",
	timeout: "timeout",
};

// Never got an answer (destructive) vs ran but got it wrong (warning).
const KIND_TONE: Record<FailureKind, "destructive" | "warning"> = {
	no_capability: "destructive",
	timeout: "destructive",
	right_tool_bad_args: "warning",
	verifier_rejected: "warning",
};

const CHART_H = 170;
const GRIDLINES = [0, 25, 50, 75, 100];

export function NativeConnectorEvalsSlide() {
	return (
		<DeckSlide>
			<NativeConnectorEvalsBody />
			<Notes>
				<PresenterNote noteKey="nativeConnectorEvals" />
			</Notes>
		</DeckSlide>
	);
}

function NativeConnectorEvalsBody() {
	const { isSlideActive } = useContext(SlideContext);

	return (
		<div className="flex flex-1 flex-col justify-center gap-6">
			<div className="flex items-end justify-between">
				<h2 className="text-h1 text-foreground">Task success rate</h2>
				<Legend />
			</div>

			<div className="flex items-end gap-16 pl-12">
				<YAxis />
				<div className="flex flex-1 justify-between">
					{COMPARISONS.map((c, i) => (
						<ChartGroup key={c.slug} c={c} active={isSlideActive} index={i} />
					))}
				</div>
			</div>

			<FailureSample active={isSlideActive} />
		</div>
	);
}

function Legend() {
	return (
		<div className="flex items-center gap-4 pb-1">
			<span className="flex items-center gap-1.5 text-mono-xs text-muted-foreground">
				<span className="size-2.5 rounded-[2px] bg-brand" />
				Composio
			</span>
			<span className="flex items-center gap-1.5 text-mono-xs text-muted-foreground">
				<span className="size-2.5 rounded-[2px]" style={{ background: "#f97316" }} />
				Native MCP + Skills
			</span>
		</div>
	);
}

function YAxis() {
	return (
		<div
			className="relative flex shrink-0 flex-col justify-between text-mono-xs text-muted-foreground"
			style={{ height: CHART_H }}
		>
			{GRIDLINES.slice()
				.reverse()
				.map((g) => (
					<span key={g} className="-translate-y-1/2">
						{g}%
					</span>
				))}
		</div>
	);
}

function ChartGroup({
	c,
	active,
	index,
}: {
	c: Comparison;
	active: boolean;
	index: number;
}) {
	const groupDelay = 0.15 * index;

	return (
		<motion.div
			className="flex w-[180px] flex-col items-center gap-3"
			initial={{ opacity: 0, y: 16 }}
			animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
			transition={{ duration: 0.4, ease: [0.34, 1.12, 0.6, 1], delay: groupDelay }}
		>
			<span className="rounded-full bg-success/15 px-2.5 py-1 text-mono-xs text-success">
				+{c.delta}
			</span>

			<div
				className="relative flex w-full items-end justify-center gap-4"
				style={{ height: CHART_H }}
			>
				{/* Gridlines */}
				{GRIDLINES.map((g) => (
					<span
						key={g}
						className="pointer-events-none absolute inset-x-0 border-t border-border/60"
						style={{ bottom: `${g}%` }}
					/>
				))}

				<ChartBar
					pct={c.composio}
					tone="brand"
					active={active}
					delay={groupDelay + 0.2}
				/>
				<ChartBar
					pct={c.alt}
					tone="alt"
					active={active}
					delay={groupDelay + 0.35}
				/>
			</div>

			<div className="flex items-center gap-2">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={`/logos/${c.slug}.svg`} width={20} height={20} alt="" />
				<div className="leading-tight">
					<div className="text-body-sm text-foreground">{c.app}</div>
					<div className="text-mono-xs text-muted-foreground">
						vs {c.altLabel}
					</div>
				</div>
			</div>
		</motion.div>
	);
}

function ChartBar({
	pct,
	tone,
	active,
	delay,
}: {
	pct: number;
	tone: "brand" | "alt";
	active: boolean;
	delay: number;
}) {
	return (
		<div className="relative flex h-full w-14 flex-col items-center justify-end">
			<motion.span
				className="mb-1.5 text-mono-sm text-foreground"
				initial={{ opacity: 0 }}
				animate={{ opacity: active ? 1 : 0 }}
				transition={{ duration: 0.3, delay: delay + 0.5 }}
			>
				{pct}%
			</motion.span>
			<motion.div
				className={
					tone === "brand" ? "w-full rounded-t-sm bg-brand" : "w-full rounded-t-sm"
				}
				style={tone === "alt" ? { background: "#f97316" } : undefined}
				initial={{ height: 0 }}
				animate={{ height: active ? `${pct}%` : 0 }}
				transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
			/>
		</div>
	);
}

function FailureSample({ active }: { active: boolean }) {
	return (
		<div className="border-t border-border pt-4">
			<div className="mb-2 text-mono-xs uppercase tracking-[0.14em] text-muted-foreground">
				Sample of tasks the alternative failed
			</div>
			<div className="grid grid-cols-2 gap-x-10 gap-y-1.5">
				{FAILURES.map((f, i) => (
					<motion.div
						key={f.task}
						className="flex items-center gap-2"
						initial={{ opacity: 0, x: -8 }}
						animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
						transition={{ duration: 0.35, delay: 0.9 + i * 0.06 }}
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={`/logos/${f.slug}.svg`} width={14} height={14} alt="" />
						<span className="text-mono-xs text-foreground">✕ {f.task}</span>
						<span
							className={
								"ml-auto shrink-0 rounded-full px-2 py-0.5 text-mono-xs " +
								(KIND_TONE[f.kind] === "warning"
									? "bg-warning/15 text-warning"
									: "bg-destructive/15 text-destructive")
							}
						>
							{KIND_LABEL[f.kind]}
						</span>
					</motion.div>
				))}
			</div>
		</div>
	);
}
