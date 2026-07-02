"use client";

import { motion } from "framer-motion";
import {
	Activity,
	Bell,
	Bookmark,
	Boxes,
	Braces,
	ChevronDown,
	ChevronRight,
	CircleCheck,
	CircleHelp,
	Database,
	Dog,
	Filter,
	Home,
	Info,
	LayoutDashboard,
	LayoutGrid,
	Layers,
	List,
	Search,
	Server,
	Settings,
	ShieldAlert,
	Sliders,
	Star,
	TriangleAlert,
	UserCircle2,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Mock Datadog CI Visibility / Pipelines dashboard — modeled off a real
 * screenshot. Deliberately busy: three top charts, job summary, a big
 * pipeline-executions bar chart, filter sidebar and executions table.
 */

const DD_PURPLE = "#632CA6";
const DD_PURPLE_DEEP = "#3A196B";
const BG = "#F5F7FA";
const CHROME = "#FFFFFF";
const BORDER = "#E4E7EB";
const BORDER_STRONG = "#D3D7DC";
const TEXT = "#2A2E36";
const TEXT_DIM = "#5C6675";
const TEXT_MUTED = "#8B93A1";
const SUCCESS = "#3EB489";
const FAILURE = "#E24C4B";
const BLUE = "#2C7BE5";
const BLUE_SOFT = "#8AB4F0";
const YELLOW = "#F5C518";
const CHIP_BG = "#F1F3F6";

const SANS =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export type DatadogDashboardProps = { animate?: boolean };

export function DatadogDashboard({ animate = true }: DatadogDashboardProps) {
	const [ready, setReady] = useState(!animate);
	useEffect(() => {
		if (!animate) return;
		const t = window.setTimeout(() => setReady(true), 500);
		return () => window.clearTimeout(t);
	}, [animate]);

	return (
		<div
			className="flex h-full w-full text-[11px]"
			style={{ background: BG, color: TEXT, fontFamily: SANS }}
		>
			<Sidebar />
			<motion.div
				className="flex min-w-0 flex-1 flex-col"
				initial={false}
				animate={{ opacity: ready ? 1 : 0.4 }}
				transition={{ duration: 0.4 }}
			>
				<Breadcrumb />
				<TitleRow />
				<ExecutionMeta />
				<div className="flex-1 overflow-hidden px-3 pb-3">
					<TopCharts />
					<JobSummary />
					<PipelineExecutions />
				</div>
			</motion.div>
		</div>
	);
}

/* ─── Sidebar ────────────────────────────────────────────────────────────── */

function Sidebar() {
	const items: { icon: typeof Home; label: string; active?: boolean }[] = [
		{ icon: Home, label: "No Ho…" },
		{ icon: Bookmark, label: "Watchdog" },
		{ icon: Zap, label: "Events" },
		{ icon: LayoutDashboard, label: "Dashboards" },
		{ icon: Server, label: "Infrastruc…" },
		{ icon: TriangleAlert, label: "Monitors" },
		{ icon: Activity, label: "Metrics" },
		{ icon: Boxes, label: "Integrations" },
		{ icon: Layers, label: "APM", active: true },
		{ icon: Database, label: "Reservatio…" },
		{ icon: List, label: "Logs" },
		{ icon: ShieldAlert, label: "Security" },
		{ icon: Sliders, label: "UX Monitoring" },
	];
	return (
		<div
			className="flex w-[112px] shrink-0 flex-col"
			style={{
				background: `linear-gradient(180deg, ${DD_PURPLE_DEEP} 0%, #24104A 100%)`,
			}}
		>
			<div
				className="flex items-center gap-1.5 px-2.5 py-2"
				style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
			>
				<Dog size={14} className="text-white" />
				<span className="text-[11.5px] font-semibold text-white">
					DATADOG
				</span>
			</div>
			<div className="flex flex-col gap-[2px] py-1">
				<div
					className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] text-white/50 uppercase tracking-wider"
					style={{ background: "rgba(255,255,255,0.04)" }}
				>
					<Search size={10} />
					<span>Q</span>
				</div>
				{items.map(({ icon: Icon, label, active }) => (
					<div
						key={label}
						className="flex items-center gap-2 px-2.5 py-1"
						style={{
							background: active ? "rgba(255,255,255,0.14)" : "transparent",
							color: active ? "#fff" : "rgba(255,255,255,0.72)",
							fontSize: 10.5,
							borderLeft: active
								? `2px solid ${DD_PURPLE}`
								: "2px solid transparent",
						}}
					>
						<Icon size={11} strokeWidth={2} />
						<span className="truncate">{label}</span>
					</div>
				))}
			</div>
		</div>
	);
}

/* ─── Header rows ─────────────────────────────────────────────────────────── */

function Breadcrumb() {
	return (
		<div
			className="flex items-center gap-1.5 px-3 py-1.5 text-[10.5px]"
			style={{
				background: CHROME,
				borderBottom: `1px solid ${BORDER}`,
				color: TEXT_DIM,
			}}
		>
			<span>CI</span>
			<ChevronRight size={10} />
			<span>Pipelines</span>
			<div className="ml-auto flex items-center gap-3" style={{ color: TEXT_MUTED }}>
				<Bell size={12} />
				<CircleHelp size={12} />
				<Settings size={12} />
				<UserCircle2 size={14} />
			</div>
		</div>
	);
}

function TitleRow() {
	return (
		<div
			className="flex items-center gap-3 px-3 pt-2 pb-2"
			style={{ background: CHROME, borderBottom: `1px solid ${BORDER}` }}
		>
			<Star size={13} style={{ color: YELLOW, fill: YELLOW }} />
			<span className="text-[13px] font-semibold" style={{ color: TEXT }}>
				Datadog/bottom
			</span>
			<span
				className="rounded-sm px-1.5 py-[1px] text-[10px]"
				style={{ background: CHIP_BG, color: TEXT_DIM }}
			>
				Codefresh
			</span>
			<div className="ml-auto flex items-center gap-1.5">
				<div
					className="flex items-center gap-1 rounded px-2 py-1 text-[10.5px]"
					style={{ background: CHIP_BG, color: TEXT }}
				>
					<span>Past 1 Week</span>
					<ChevronDown size={10} />
				</div>
				<div className="flex" style={{ border: `1px solid ${BORDER_STRONG}` }}>
					<Chip active>
						<LayoutGrid size={11} />
					</Chip>
					<Chip>
						<List size={11} />
					</Chip>
					<Chip>
						<Info size={11} />
					</Chip>
				</div>
			</div>
		</div>
	);
}

function Chip({ children, active }: { children: React.ReactNode; active?: boolean }) {
	return (
		<span
			className="flex size-6 items-center justify-center"
			style={{
				background: active ? "#EEF1F6" : CHROME,
				color: active ? TEXT : TEXT_DIM,
				borderRight: `1px solid ${BORDER_STRONG}`,
			}}
		>
			{children}
		</span>
	);
}

function ExecutionMeta() {
	return (
		<div
			className="flex items-center gap-2 px-3 py-1.5 text-[10.5px]"
			style={{ background: CHROME, borderBottom: `1px solid ${BORDER}`, color: TEXT_DIM }}
		>
			<span>Last Execution:</span>
			<span
				className="rounded px-1.5 py-[1px] text-[10px] font-semibold"
				style={{ background: SUCCESS, color: "#fff" }}
			>
				SUCCESS
			</span>
			<span>·</span>
			<span>1 minute ago</span>
			<span>·</span>
			<span>Pipeline ID:</span>
			<span style={{ color: BLUE, fontFamily: "monospace" }}>
				6z0e70c3d0da61787cd63
			</span>
			<div className="ml-auto flex items-center gap-1">
				<span>Duration:</span>
				<span style={{ color: TEXT, fontWeight: 600 }}>1 min 16 s</span>
			</div>
		</div>
	);
}

/* ─── Top charts row ─────────────────────────────────────────────────────── */

function TopCharts() {
	return (
		<div className="mt-2 grid grid-cols-3 gap-2">
			<ChartCard title="Total Executions">
				<StackedBars scheme="ok-fail" />
			</ChartCard>
			<ChartCard title="Total Failed">
				<StackedBars scheme="fail-only" />
			</ChartCard>
			<ChartCard title="Build Duration">
				<TriLineChart />
			</ChartCard>
			<ChartLegend items={[{ c: FAILURE, l: "Error" }, { c: SUCCESS, l: "Success" }]} />
			<ChartLegend items={[{ c: FAILURE, l: "Error" }]} />
			<ChartLegend items={[{ c: BLUE_SOFT, l: "min" }, { c: BLUE, l: "p50" }, { c: "#1F4FB0", l: "p95" }]} />
		</div>
	);
}

function ChartCard({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className="flex flex-col rounded"
			style={{ background: CHROME, border: `1px solid ${BORDER}`, height: 138 }}
		>
			<div
				className="flex items-center justify-between px-2 py-1 text-[10.5px] font-semibold"
				style={{ color: TEXT, borderBottom: `1px solid ${BORDER}` }}
			>
				<span>{title}</span>
				<div className="flex items-center gap-1.5" style={{ color: TEXT_MUTED }}>
					<Sliders size={10} />
					<Filter size={10} />
					<ChevronDown size={10} />
				</div>
			</div>
			<div className="flex-1 p-2">{children}</div>
		</div>
	);
}

function ChartLegend({ items }: { items: { c: string; l: string }[] }) {
	return (
		<div className="flex items-center justify-center gap-3 text-[10px]" style={{ color: TEXT_DIM }}>
			{items.map((i) => (
				<span key={i.l} className="flex items-center gap-1">
					<span
						className="inline-block size-[9px] rounded-[2px]"
						style={{ background: i.c }}
					/>
					<span>{i.l}</span>
				</span>
			))}
		</div>
	);
}

/* ─── Job summary ────────────────────────────────────────────────────────── */

function JobSummary() {
	return (
		<div
			className="mt-3 flex flex-col rounded"
			style={{ background: CHROME, border: `1px solid ${BORDER}` }}
		>
			<div
				className="px-3 py-1.5 text-[11px] font-semibold"
				style={{ color: TEXT, borderBottom: `1px solid ${BORDER}` }}
			>
				Job Summary
			</div>
			<div
				className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wider"
				style={{ color: TEXT_MUTED, borderBottom: `1px solid ${BORDER}` }}
			>
				<span>JOB</span>
				<span>P50 DURATION</span>
				<span>P95 DURATION</span>
				<span>AVG EXEC TIME %</span>
				<span>FAILURE %</span>
			</div>
			{[
				{ job: "sleep", p50: "1 min 8 s", p95: "2 min 2 s", exec: 91.6, fail: 0.9 },
				{ job: "exit", p50: "6.20 s", p95: "7.75 s", exec: 8.2, fail: 15.8 },
			].map((r) => (
				<div
					key={r.job}
					className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] items-center gap-2 px-3 py-1.5 text-[11px]"
					style={{ borderBottom: `1px solid ${BORDER}` }}
				>
					<span style={{ color: TEXT }}>{r.job}</span>
					<InlineBar label={r.p50} value={70} color={BLUE} />
					<InlineBar label={r.p95} value={80} color={BLUE} />
					<InlineBar label={`${r.exec}%`} value={r.exec} color={BLUE} />
					<InlineBar label={`${r.fail}%`} value={r.fail * 4} color={FAILURE} />
				</div>
			))}
		</div>
	);
}

function InlineBar({ label, value, color }: { label: string; value: number; color: string }) {
	return (
		<div className="flex items-center gap-2">
			<span style={{ color: TEXT, width: 66 }}>{label}</span>
			<div
				className="relative flex-1 overflow-hidden rounded-[2px]"
				style={{ background: "#EDF0F4", height: 6 }}
			>
				<div
					className="absolute inset-y-0 left-0"
					style={{ width: `${Math.min(100, value)}%`, background: color }}
				/>
			</div>
		</div>
	);
}

/* ─── Pipeline executions ────────────────────────────────────────────────── */

function PipelineExecutions() {
	return (
		<div
			className="mt-3 flex flex-col rounded"
			style={{ background: CHROME, border: `1px solid ${BORDER}` }}
		>
			<div
				className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold"
				style={{ color: TEXT, borderBottom: `1px solid ${BORDER}` }}
			>
				<span>Pipeline Executions</span>
				<span className="text-[10px] font-normal" style={{ color: TEXT_MUTED }}>
					Showing last 100 pipeline executions
				</span>
			</div>
			<div className="px-3 py-2">
				<TallStackedBars />
			</div>
			<div
				className="flex items-center gap-2 border-t px-3 py-1.5"
				style={{ borderColor: BORDER }}
			>
				<div
					className="flex flex-1 items-center gap-1.5 rounded px-2 py-1"
					style={{ background: CHIP_BG, color: TEXT_DIM, fontSize: 10.5 }}
				>
					<Search size={11} />
					<span>Search pipeline executions</span>
				</div>
				<button
					className="rounded px-2 py-1 text-[10.5px]"
					style={{ background: CHIP_BG, color: TEXT }}
					type="button"
				>
					Hide Controls
				</button>
				<div className="flex" style={{ border: `1px solid ${BORDER_STRONG}` }}>
					<PillTab active>Pipeline</PillTab>
					<PillTab>Job</PillTab>
					<PillTab>Command</PillTab>
				</div>
				<span className="text-[10.5px]" style={{ color: TEXT_DIM }}>
					20,138 pipeline executions found
				</span>
			</div>
			<div className="grid grid-cols-[180px_1fr]" style={{ borderTop: `1px solid ${BORDER}` }}>
				<FilterPanel />
				<ExecutionsTable />
			</div>
		</div>
	);
}

function PillTab({ children, active }: { children: React.ReactNode; active?: boolean }) {
	return (
		<span
			className="px-2 py-1 text-[10.5px]"
			style={{
				background: active ? BLUE : CHROME,
				color: active ? "#fff" : TEXT_DIM,
				borderRight: `1px solid ${BORDER_STRONG}`,
			}}
		>
			{children}
		</span>
	);
}

function FilterPanel() {
	return (
		<div
			className="flex flex-col gap-2 px-3 py-2 text-[10.5px]"
			style={{ borderRight: `1px solid ${BORDER}`, color: TEXT_DIM }}
		>
			<div
				className="flex items-center gap-1.5 rounded px-2 py-1"
				style={{ background: CHIP_BG }}
			>
				<Search size={10} />
				<span>Search facets</span>
			</div>
			<Facet label="CI Status" open>
				<FacetRow label="Blocked" count="1.7k" checked />
				<FacetRow label="Success" count="17k" checked />
				<FacetRow label="Error" count="6.5k" checked />
			</Facet>
			<Facet label="Duration" open>
				<div className="flex items-center gap-1 px-2 py-1 text-[10px]" style={{ color: TEXT_DIM }}>
					<span>Min: 0</span>
					<span className="ml-auto">Max: 4 W min</span>
				</div>
				<div
					className="mx-2 relative h-[3px] rounded-full"
					style={{ background: "#DDE1E8" }}
				>
					<div
						className="absolute left-[10%] right-[35%] h-full rounded-full"
						style={{ background: BLUE }}
					/>
					<span
						className="absolute size-2 rounded-full"
						style={{ background: BLUE, left: "10%", top: -2.5 }}
					/>
					<span
						className="absolute size-2 rounded-full"
						style={{ background: BLUE, right: "35%", top: -2.5 }}
					/>
				</div>
			</Facet>
			<FacetLabel label="Pipeline ID" />
			<FacetLabel label="CI Provider" />
			<FacetLabel label="Manually Triggered" />
		</div>
	);
}

function Facet({
	label,
	open,
	children,
}: {
	label: string;
	open?: boolean;
	children?: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-center gap-1 text-[10.5px] font-semibold" style={{ color: TEXT }}>
				<ChevronDown
					size={10}
					style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
				/>
				<span>{label}</span>
			</div>
			<div className="flex flex-col gap-1 pl-3">{children}</div>
		</div>
	);
}

function FacetLabel({ label }: { label: string }) {
	return (
		<div className="flex items-center gap-1 text-[10.5px] font-semibold" style={{ color: TEXT }}>
			<ChevronRight size={10} />
			<span>{label}</span>
		</div>
	);
}

function FacetRow({ label, count, checked }: { label: string; count: string; checked?: boolean }) {
	return (
		<div className="flex items-center gap-2 text-[10.5px]" style={{ color: TEXT }}>
			<span
				className="flex size-[11px] items-center justify-center rounded-[2px]"
				style={{
					background: checked ? BLUE : "#fff",
					border: `1px solid ${checked ? BLUE : BORDER_STRONG}`,
				}}
			>
				{checked ? <CircleCheck size={9} color="#fff" strokeWidth={3} /> : null}
			</span>
			<span className="flex-1">{label}</span>
			<span style={{ color: TEXT_MUTED }}>{count}</span>
		</div>
	);
}

function ExecutionsTable() {
	const rows = Array.from({ length: 8 }).map((_, i) => ({
		date: `Mar 22 17:25:${String(59 - i * 3).padStart(2, "0")}.${100 + i * 37}`,
		id: `6z0e5abd${(1000 + i * 13).toString(16)}bdc19afcae`,
		duration: i === 3 ? "3 min 26 s" : `2 min ${8 + (i % 4)} s`,
		queue: `${5 + (i % 6)}`,
		err: i % 4 === 1,
	}));
	return (
		<div className="flex flex-col">
			<div
				className="grid grid-cols-[110px_1fr_80px_80px_120px] gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wider"
				style={{
					color: TEXT_MUTED,
					borderBottom: `1px solid ${BORDER}`,
					background: "#FAFBFC",
				}}
			>
				<span>Date</span>
				<span>Pipeline ID</span>
				<span>Duration</span>
				<span>Queue Time</span>
				<span>Node Name</span>
			</div>
			{rows.map((r, i) => (
				<div
					key={i}
					className="grid grid-cols-[110px_1fr_80px_80px_120px] items-center gap-2 px-3 py-1 text-[10.5px]"
					style={{ borderBottom: `1px solid ${BORDER}` }}
				>
					<div className="flex items-center gap-1.5" style={{ color: TEXT }}>
						<span
							className="inline-block size-[8px] rounded-full"
							style={{ background: r.err ? FAILURE : SUCCESS }}
						/>
						<span>{r.date}</span>
					</div>
					<span style={{ color: BLUE, fontFamily: "monospace" }} className="truncate">
						{r.id}
					</span>
					<span style={{ color: TEXT }}>{r.duration}</span>
					<span style={{ color: TEXT_DIM }}>{r.queue}</span>
					<span style={{ color: TEXT_DIM }} className="truncate">
						—
					</span>
				</div>
			))}
		</div>
	);
}

/* ─── Chart primitives ───────────────────────────────────────────────────── */

/** Stacked green/red bars, like Total Executions. */
function StackedBars({ scheme }: { scheme: "ok-fail" | "fail-only" }) {
	const bars = Array.from({ length: 34 }).map((_, i) => {
		const t = (Math.sin(i * 0.7) + 1) / 2;
		const total = 40 + Math.round(t * 55);
		const fail =
			scheme === "fail-only"
				? Math.round(20 + t * 40)
				: Math.round((0.15 + (Math.sin(i * 1.5) + 1) * 0.15) * total);
		const ok = scheme === "fail-only" ? 0 : total - fail;
		return { ok, fail };
	});
	const max = Math.max(...bars.map((b) => b.ok + b.fail));
	return (
		<div className="flex h-full items-stretch">
			{bars.map((b, i) => (
				<div key={i} className="flex flex-1 flex-col justify-end">
					<div
						style={{
							height: `${(b.fail / max) * 100}%`,
							background: FAILURE,
						}}
					/>
					<div
						style={{
							height: `${(b.ok / max) * 100}%`,
							background: SUCCESS,
						}}
					/>
				</div>
			))}
		</div>
	);
}

/** Three-line chart for Build Duration (min / p50 / p95). */
function TriLineChart() {
	const w = 300;
	const h = 90;
	const series = [
		{ color: BLUE_SOFT, base: 25, amp: 8 },
		{ color: BLUE, base: 45, amp: 12 },
		{ color: "#1F4FB0", base: 65, amp: 15 },
	];
	const n = 22;
	return (
		<svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
			{series.map((s, si) => {
				const step = w / (n - 1);
				const pts = Array.from({ length: n }).map((_, i) => {
					const v = s.base + Math.sin(i * 0.6 + si) * s.amp + Math.cos(i * 1.3) * 4;
					return `${(i * step).toFixed(1)} ${(h - (v / 100) * h).toFixed(1)}`;
				});
				return (
					<path
						key={si}
						d={`M ${pts.join(" L ")}`}
						fill="none"
						stroke={s.color}
						strokeWidth={1.4}
					/>
				);
			})}
		</svg>
	);
}

/** The tall stacked-bar chart in the Pipeline Executions section. */
function TallStackedBars() {
	const bars = Array.from({ length: 96 }).map((_, i) => {
		const t = (Math.sin(i * 0.35) + 1) / 2;
		const total = 20 + t * 80 + Math.sin(i * 0.9) * 10;
		const fail = Math.max(0, Math.sin(i * 1.1) * 25 + t * 20);
		const ok = Math.max(0, total - fail);
		return { ok, fail };
	});
	const max = Math.max(...bars.map((b) => b.ok + b.fail));
	return (
		<div className="flex h-[130px] items-stretch">
			{bars.map((b, i) => (
				<div key={i} className="flex flex-1 flex-col justify-end">
					<div style={{ height: `${(b.fail / max) * 100}%`, background: FAILURE }} />
					<div style={{ height: `${(b.ok / max) * 100}%`, background: SUCCESS }} />
				</div>
			))}
		</div>
	);
}
