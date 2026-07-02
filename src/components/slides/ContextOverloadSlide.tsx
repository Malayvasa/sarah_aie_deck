"use client";

import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

/**
 * Slide 16 — "Context overload." Replica of Claude Code's Context Window
 * inspector panel. As each MCP-connected app "pops in" around the panel
 * (with a green ✓ badge), the `MCP tools` row grows both in bytes and in
 * tool count, eventually taking over the top of the sorted list. By the
 * time all 10 apps are connected, MCP tools has eaten most of the window.
 */

// Positions computed on an ellipse around the centered panel — every icon
// sits at a clean 36° step so nothing crowds and there are no gaps.
const CENTER_X = 683;
const CENTER_Y = 384;
const RX = 490;
const RY = 280;
const APP_SLUGS: { slug: string; tools: number }[] = [
	{ slug: "slack", tools: 42 },
	{ slug: "github", tools: 210 },
	{ slug: "notion", tools: 68 },
	{ slug: "linear", tools: 34 },
	{ slug: "datadog", tools: 128 },
	{ slug: "sentry", tools: 46 },
	{ slug: "posthog", tools: 88 },
	{ slug: "jira", tools: 56 },
	{ slug: "figma", tools: 30 },
	{ slug: "salesforce", tools: 620 },
];
const APPS: { slug: string; x: number; y: number; tools: number }[] =
	APP_SLUGS.map((a, i) => {
		const angle = (i / APP_SLUGS.length) * Math.PI * 2 - Math.PI / 2;
		return {
			slug: a.slug,
			tools: a.tools,
			x: CENTER_X + Math.cos(angle) * RX,
			y: CENTER_Y + Math.sin(angle) * RY,
		};
	});

const APP_INTERVAL_MS = 550;

// Each row gets its own tinted yellow — brightest = MCP tools (the row
// under the spotlight), progressively dimmer amber / bronze as we head
// down the list. Mirrors Claude Code's real palette.
const SWATCH_COLORS: Record<string, string> = {
	"mcp-tools": "hsl(48, 100%, 60%)",
	messages: "hsl(45, 85%, 55%)",
	"system-tools": "hsl(40, 75%, 48%)",
	"system-prompt": "hsl(36, 65%, 42%)",
	skills: "hsl(33, 60%, 37%)",
	"custom-agents": "hsl(30, 55%, 32%)",
	"memory-files": "hsl(28, 50%, 28%)",
};

// Fixed sections that don't change during the animation. Messages is
// deliberately small here — the point is that MCP tools is eating the
// window, not conversation history.
const FIXED_ROWS = [
	{ key: "messages", label: "Messages", size: 62_000, pct: 6.2 },
	{ key: "system-tools", label: "System tools", size: 11_700, pct: 1.2 },
	{ key: "system-prompt", label: "System prompt", size: 10_000, pct: 1.0 },
	{ key: "skills", label: "Skills", size: 9_900, pct: 1.0 },
	{ key: "custom-agents", label: "Custom agents", size: 329, pct: 0.0 },
	{ key: "memory-files", label: "Memory files", size: 68, pct: 0.0 },
];

// MCP tools sizing: baseline 10.6k / 290 tools; each app adds ~68k / its
// tool count. All 10 apps wired = ~700k, which is 70% of the 1M budget.
const MCP_BASELINE_SIZE = 10_600;
const MCP_BASELINE_TOOLS = 290;
const PER_APP_KB = 68;

function mcpSizeForApps(added: number): number {
	const bytesFromApps = APPS.slice(0, added).reduce(
		(sum) => sum + PER_APP_KB * 1000,
		0,
	);
	return MCP_BASELINE_SIZE + bytesFromApps;
}
function mcpToolCountForApps(added: number): number {
	return APPS.slice(0, added).reduce(
		(sum, a) => sum + a.tools,
		MCP_BASELINE_TOOLS,
	);
}

const TOTAL_BUDGET = 1_000_000;

export function ContextOverloadSlide() {
	return (
		<DeckSlide padded={false}>
			<ContextOverloadBody />
			<Notes>
				<PresenterNote noteKey="contextOverload" />
			</Notes>
		</DeckSlide>
	);
}

function ContextOverloadBody() {
	const { isSlideActive } = useContext(SlideContext);
	const [appsAdded, setAppsAdded] = useState(0);

	useEffect(() => {
		if (!isSlideActive) {
			setAppsAdded(0);
			return;
		}
		// Small initial breath, then one app per tick until we've added them
		// all. Both timers live in the outer scope so cleanup can nuke either.
		let interval: number | undefined;
		const kickoff = window.setTimeout(() => {
			setAppsAdded(1);
			interval = window.setInterval(() => {
				setAppsAdded((a) => {
					if (a >= APPS.length) {
						if (interval !== undefined) {
							window.clearInterval(interval);
						}
						return a;
					}
					return a + 1;
				});
			}, APP_INTERVAL_MS);
		}, 700);
		return () => {
			window.clearTimeout(kickoff);
			if (interval !== undefined) window.clearInterval(interval);
		};
	}, [isSlideActive]);

	const mcpSize = mcpSizeForApps(appsAdded);
	const mcpToolCount = mcpToolCountForApps(appsAdded);

	return (
		<div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
			{/* App icons popping around the panel */}
			{APPS.map((app, i) => (
				<AppIcon
					key={app.slug}
					slug={app.slug}
					x={app.x}
					y={app.y}
					visible={i < appsAdded}
				/>
			))}

			{/* Center panel */}
			<ContextWindowPanel
				mcpSize={mcpSize}
				mcpToolCount={mcpToolCount}
				appsAdded={appsAdded}
			/>
		</div>
	);
}

/* ─── App icon with checkmark ────────────────────────────────────────────── */

function AppIcon({
	slug,
	x,
	y,
	visible,
}: {
	slug: string;
	x: number;
	y: number;
	visible: boolean;
}) {
	// Always mounted at its final position; only opacity + scale animate off
	// `visible`. Avoids AnimatePresence's mount/unmount thrash and the
	// keyframe overshoot that was causing the glitch.
	return (
		<motion.div
			className="pointer-events-none absolute"
			style={{ left: x - 36, top: y - 36, zIndex: 20 }}
			initial={{ opacity: 0, scale: 0.6 }}
			animate={
				visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }
			}
			transition={{
				type: "spring",
				stiffness: 380,
				damping: 22,
				mass: 0.7,
			}}
		>
			<div
				className="relative flex size-[72px] items-center justify-center rounded-2xl"
				style={{
					background: "#ffffff",
					boxShadow:
						"0 12px 28px rgba(0,0,0,0.55), 0 4px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.6)",
				}}
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={`/logos/${slug}.svg`}
					alt=""
					width={44}
					height={44}
					style={{ width: 44, height: 44, display: "block" }}
				/>
				<motion.span
					className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full"
					style={{
						background: "#22C55E",
						boxShadow:
							"0 4px 10px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.35)",
					}}
					initial={{ scale: 0 }}
					animate={{ scale: visible ? 1 : 0 }}
					transition={{
						type: "spring",
						stiffness: 500,
						damping: 22,
						delay: visible ? 0.15 : 0,
					}}
				>
					<Check size={14} color="#fff" strokeWidth={3} />
				</motion.span>
			</div>
		</motion.div>
	);
}

/* ─── Context window panel ───────────────────────────────────────────────── */

const YELLOW = "#FFC93A";
const YELLOW_SOFT = "#FFC93A";
const GREY_TRACK = "#3F3F42";
const PANEL_BG = "#1F1F22";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#F1F1F1";
const TEXT_DIM = "#A0A0A6";
const TEXT_MUTED = "#6E6E76";

function ContextWindowPanel({
	mcpSize,
	mcpToolCount,
	appsAdded,
}: {
	mcpSize: number;
	mcpToolCount: number;
	appsAdded: number;
}) {
	// Everything else is fixed; free space shrinks as MCP tools grows.
	const usedElseWhere = FIXED_ROWS.reduce((s, r) => s + r.size, 0);
	const mcpBudget = Math.min(mcpSize, TOTAL_BUDGET - usedElseWhere);
	const free = Math.max(0, TOTAL_BUDGET - usedElseWhere - mcpBudget);
	const used = TOTAL_BUDGET - free;
	const pctUsed = (used / TOTAL_BUDGET) * 100;

	const mcpPct = (mcpBudget / TOTAL_BUDGET) * 100;
	const mcpRow = {
		key: "mcp-tools",
		label: "MCP tools",
		size: mcpBudget,
		pct: mcpPct,
	};

	// Sort visible rows by size (descending) so MCP tools rises to the top
	// once it overtakes Messages.
	const visibleRows = [...FIXED_ROWS, mcpRow].sort((a, b) => b.size - a.size);

	const deferredRows = [
		{ key: "mcp-def", label: "MCP tools (deferred)", size: 147_800 },
		{ key: "sys-def", label: "System tools (deferred)", size: 24_100 },
	];

	return (
		<motion.div
			className="relative"
			style={{
				width: 640,
				background: PANEL_BG,
				border: `1px solid ${BORDER}`,
				borderRadius: 14,
				boxShadow:
					"0 40px 80px rgba(0,0,0,0.6), 0 14px 28px rgba(0,0,0,0.45)",
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "SF Pro", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
				color: TEXT,
				zIndex: 5,
			}}
		>
			{/* Header */}
			<div
				className="flex items-center justify-between px-5 pb-3 pt-4"
				style={{ borderBottom: `1px solid ${BORDER}` }}
			>
				<span className="text-[19px] font-medium">Context window</span>
				<div className="flex items-center gap-2 text-[15px]" style={{ color: TEXT_DIM }}>
					<AnimatedNumber value={used / 1000} suffix="k" decimals={1} />
					<span>/ 1.0M</span>
					<span>
						(<AnimatedNumber value={pctUsed} suffix="%" decimals={0} />)
					</span>
					<ChevronDown size={16} />
				</div>
			</div>

			{/* Progress bar — segmented, each colored segment matches its
			    row's swatch shade. Read left→right in the same order the rows
			    are sorted below. */}
			<div className="px-5 pt-3">
				<div
					className="relative flex overflow-hidden rounded-[3px]"
					style={{ height: 7, background: GREY_TRACK }}
				>
					{visibleRows.map((row) => (
						<motion.span
							key={row.key}
							layout
							animate={{
								width: `${(row.size / TOTAL_BUDGET) * 100}%`,
							}}
							transition={{
								duration: 0.5,
								ease: [0.34, 1.12, 0.6, 1],
							}}
							style={{
								height: "100%",
								background:
									SWATCH_COLORS[row.key] ?? YELLOW_SOFT,
							}}
						/>
					))}
				</div>
			</div>

			{/* Rows */}
			<div className="flex flex-col gap-2 px-5 pt-4">
				{visibleRows.map((row) => (
					<motion.div
						key={row.key}
						layout
						transition={{
							type: "spring",
							stiffness: 400,
							damping: 32,
						}}
					>
						<Row
							label={row.label}
							size={row.size}
							pct={row.pct}
							swatch={SWATCH_COLORS[row.key] ?? YELLOW_SOFT}
							emphasized={row.key === "mcp-tools" && appsAdded > 0}
						/>
					</motion.div>
				))}
				<motion.div layout>
					<Row label="Free space" size={free} pct={(free / TOTAL_BUDGET) * 100} muted swatch={GREY_TRACK} />
				</motion.div>
				{deferredRows.map((row) => (
					<Row
						key={row.key}
						label={row.label}
						size={row.size}
						pct={0}
						deferred
					/>
				))}
			</div>

			<div className="h-4" />
		</motion.div>
	);
}

function Row({
	label,
	size,
	pct,
	swatch = YELLOW_SOFT,
	muted,
	deferred,
	emphasized,
}: {
	label: string;
	size: number;
	pct: number;
	swatch?: string;
	muted?: boolean;
	deferred?: boolean;
	emphasized?: boolean;
}) {
	const color = muted || deferred ? TEXT_MUTED : TEXT;
	const showSwatch = !deferred;
	return (
		<div className="flex items-center gap-3 text-[14.5px]">
			{showSwatch ? (
				<span
					className="size-3 shrink-0 rounded-[2px]"
					style={{
						background: muted ? GREY_TRACK : swatch,
						boxShadow: emphasized
							? "0 0 0 2px rgba(255,201,58,0.35)"
							: undefined,
					}}
				/>
			) : (
				<span className="size-3 shrink-0" />
			)}
			<span style={{ color }} className="flex-1">
				{label}
			</span>
			<span
				className="w-[70px] text-right tabular-nums"
				style={{ color, fontVariantNumeric: "tabular-nums" }}
			>
				<AnimatedNumber
					value={size / 1000}
					suffix="k"
					decimals={size >= 100_000 ? 1 : 1}
				/>
			</span>
			<span
				className="w-[54px] text-right tabular-nums"
				style={{
					color: deferred ? TEXT_MUTED : color,
					fontVariantNumeric: "tabular-nums",
				}}
			>
				{deferred ? "—" : <AnimatedNumber value={pct} suffix="%" decimals={1} />}
			</span>
		</div>
	);
}

/* ─── Animated number ────────────────────────────────────────────────────── */

function AnimatedNumber({
	value,
	suffix = "",
	decimals = 0,
}: {
	value: number;
	suffix?: string;
	decimals?: number;
}) {
	const [display, setDisplay] = useState(value);
	useEffect(() => {
		const start = display;
		const end = value;
		if (start === end) return;
		let raf = 0;
		let startedAt: number | null = null;
		const duration = 400;
		const step = (t: number) => {
			if (startedAt === null) startedAt = t;
			const p = Math.min(1, (t - startedAt) / duration);
			const eased = 1 - (1 - p) ** 3;
			setDisplay(start + (end - start) * eased);
			if (p < 1) raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, [value, display]);
	return <span>{display.toFixed(decimals)}{suffix}</span>;
}
