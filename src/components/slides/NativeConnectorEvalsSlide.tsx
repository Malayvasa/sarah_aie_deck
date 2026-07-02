"use client";

import { motion } from "framer-motion";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide, Kicker } from "~/components/deck/DeckSlide";
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
	{ slug: "googledrive", app: "Google Drive", altLabel: "Claude AI", composio: 100, alt: 69, delta: 31 },
];

const CHART_H = 260;
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
		<div className="flex flex-1 flex-col justify-center gap-8">
			<div className="flex items-end justify-between">
				<div>
					<Kicker>The eval numbers</Kicker>
					<h2 className="mt-2 max-w-[24ch] text-h1 text-foreground">
						Task success rate
					</h2>
					<p className="mt-3 max-w-[52ch] text-body text-muted-foreground">
						Share of runs that finished end-to-end and passed a
						deterministic verifier — same held-out tasks, same model, per
						provider.
					</p>
				</div>
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
		</div>
	);
}

function Legend() {
	return (
		<div className="flex items-center gap-4 pb-1">
			<span className="flex items-center gap-1.5 text-mono-xs text-muted-foreground">
				<span className="size-2.5 rounded-[2px] bg-success" />
				Composio
			</span>
			<span className="flex items-center gap-1.5 text-mono-xs text-muted-foreground">
				<span className="size-2.5 rounded-[2px] bg-destructive" />
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
			className="flex w-[180px] flex-col items-center gap-4"
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
					tone="success"
					active={active}
					delay={groupDelay + 0.2}
				/>
				<ChartBar
					pct={c.alt}
					tone="destructive"
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
	tone: "success" | "destructive";
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
					tone === "success"
						? "w-full rounded-t-sm bg-success"
						: "w-full rounded-t-sm bg-destructive"
				}
				initial={{ height: 0 }}
				animate={{ height: active ? `${pct}%` : 0 }}
				transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
			/>
		</div>
	);
}
