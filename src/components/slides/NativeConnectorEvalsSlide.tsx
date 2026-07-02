"use client";

import { motion } from "framer-motion";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide, Kicker } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

/**
 * Slide — "Even 'native' isn't native." Three worst-gap rows pulled from
 * Composio's own eval hub (composio vs each app's native MCP/CLI/connector,
 * same tasks): https://ctx.composio.io/Jayesh/evals/native.html
 *
 * Success % is the deterministic-verifier pass rate; Δ is Composio minus the
 * alternative. These are the three largest gaps in the "outcome quality"
 * table, i.e. where the native option struggled most.
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
	{ slug: "slack", app: "Slack", altLabel: "Slack (native)", composio: 86, alt: 36, delta: 50 },
	{ slug: "datadog", app: "Datadog", altLabel: "Datadog (native)", composio: 100, alt: 57, delta: 43 },
	{ slug: "googledrive", app: "Google Drive", altLabel: "Claude AI", composio: 100, alt: 69, delta: 31 },
];

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
		<div className="flex flex-1 flex-col justify-center gap-10">
			<div>
				<Kicker tone="brand">Same tasks, same models</Kicker>
				<h2 className="mt-2 max-w-[20ch] text-h1 text-foreground">
					Even &ldquo;native&rdquo; isn&rsquo;t native.
				</h2>
			</div>

			<div className="grid grid-cols-3 gap-6">
				{COMPARISONS.map((c, i) => (
					<motion.div
						key={c.slug}
						initial={{ opacity: 0, y: 24 }}
						animate={
							isSlideActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
						}
						transition={{
							duration: 0.5,
							ease: [0.34, 1.12, 0.6, 1],
							delay: 0.15 * i,
						}}
					>
						<ComparisonCard c={c} active={isSlideActive} delay={0.15 * i} />
					</motion.div>
				))}
			</div>
		</div>
	);
}

function ComparisonCard({
	c,
	active,
	delay,
}: {
	c: Comparison;
	active: boolean;
	delay: number;
}) {
	return (
		<div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
			<div className="flex items-center gap-3">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={`/logos/${c.slug}.svg`} width={28} height={28} alt="" />
				<div>
					<div className="text-h3 text-foreground">{c.app}</div>
					<div className="text-mono-xs text-muted-foreground">
						vs {c.altLabel}
					</div>
				</div>
				<span className="ml-auto rounded-full bg-success/15 px-2.5 py-1 text-mono-xs text-success">
					+{c.delta}
				</span>
			</div>

			<Bar label="Composio" pct={c.composio} tone="success" active={active} delay={delay + 0.25} />
			<Bar label={c.altLabel} pct={c.alt} tone="destructive" active={active} delay={delay + 0.4} />
		</div>
	);
}

function Bar({
	label,
	pct,
	tone,
	active,
	delay,
}: {
	label: string;
	pct: number;
	tone: "success" | "destructive";
	active: boolean;
	delay: number;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-baseline justify-between">
				<span className="text-mono-sm text-muted-foreground">{label}</span>
				<span className="text-mono-sm text-foreground">{pct}%</span>
			</div>
			<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
				<motion.div
					className={tone === "success" ? "h-full bg-success" : "h-full bg-destructive"}
					initial={{ width: "0%" }}
					animate={{ width: active ? `${pct}%` : "0%" }}
					transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
				/>
			</div>
		</div>
	);
}
