"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

/**
 * Slide 09 — "What a dashboard actually is." Reads left-to-right:
 *
 *   [iOS-style question bubble]  →  [generic dashboard mock]  →  [answer table]
 *
 * The dashboard sits between the human's plain-English question and the
 * flat table of numbers she actually wanted — the "translation device."
 */

const SANS =
	'-apple-system, BlinkMacSystemFont, "SF Pro", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

export function TranslationDeviceSlide() {
	return (
		<DeckSlide padded={false}>
			<TranslationDeviceBody />
			<Notes>
				<PresenterNote noteKey="translationDevice" />
			</Notes>
		</DeckSlide>
	);
}

function TranslationDeviceBody() {
	const { isSlideActive } = useContext(SlideContext);

	const fadeUp = (delay: number) => ({
		initial: { opacity: 0, y: 20 },
		animate: isSlideActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
		transition: {
			duration: 0.55,
			ease: [0.34, 1.12, 0.6, 1] as [number, number, number, number],
			delay,
		},
	});
	const arrowFade = (delay: number) => ({
		initial: { opacity: 0, x: -10 },
		animate: isSlideActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 },
		transition: { duration: 0.35, ease: "easeOut" as const, delay },
	});

	return (
		<div className="flex h-full w-full items-center justify-center gap-6 bg-black px-8">
			<motion.div {...fadeUp(0)}>
				<QuestionBubble />
			</motion.div>

			<motion.div {...arrowFade(0.55)}>
				<Arrow />
			</motion.div>

			<motion.div {...fadeUp(0.8)}>
				<DashboardMock />
			</motion.div>

			<motion.div {...arrowFade(1.4)}>
				<Arrow />
			</motion.div>

			<motion.div {...fadeUp(1.65)}>
				<AnswerTable />
			</motion.div>
		</div>
	);
}

/* ─── iOS chat bubble ────────────────────────────────────────────────────── */

function QuestionBubble() {
	return (
		<div
			className="relative"
			style={{ width: 260, fontFamily: SANS }}
		>
			<div
				className="relative px-5 py-4"
				style={{
					background:
						"linear-gradient(180deg, #34AAFF 0%, #0A84FF 100%)",
					color: "#fff",
					fontSize: 26,
					fontWeight: 400,
					lineHeight: 1.28,
					letterSpacing: "-0.02em",
					// Three rounded corners; the bottom-right is sharpened to a
					// small radius so the bubble reads as an outgoing iMessage
					// without needing a fussy teardrop tail.
					borderTopLeftRadius: 22,
					borderTopRightRadius: 22,
					borderBottomLeftRadius: 22,
					borderBottomRightRadius: 6,
					boxShadow:
						"0 20px 40px rgba(10,132,255,0.25), 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
				}}
			>
				What was our Q4 revenue by customer?
			</div>
			<div
				className="mt-2 text-right text-[12px]"
				style={{ color: "rgba(235,235,245,0.4)" }}
			>
				Delivered
			</div>
		</div>
	);
}

/* ─── Generic dashboard ──────────────────────────────────────────────────── */

function DashboardMock() {
	// Pure wireframe — no text, only grey shapes standing in for chrome,
	// controls, charts, KPIs, and a table. All shades pulled from a single
	// grey ramp so nothing reads as "colored data".
	const G = {
		panel: "#1A1A1F",
		surface: "#232329",
		outline: "rgba(255,255,255,0.10)",
		block: "#3A3A44",
		blockSoft: "#2E2E36",
		blockFaint: "#26262E",
	} as const;
	const bars = [50, 62, 46, 70, 58, 74, 66, 80, 72, 84, 78, 92];
	const barMax = Math.max(...bars);
	const gap = 12;

	const Placeholder = ({
		w,
		h = 8,
		soft = false,
		r = 3,
	}: {
		w: number | string;
		h?: number;
		soft?: boolean;
		r?: number;
	}) => (
		<span
			className="inline-block"
			style={{
				width: w,
				height: h,
				borderRadius: r,
				background: soft ? G.blockSoft : G.block,
			}}
		/>
	);

	return (
		<div
			className="flex flex-col overflow-hidden rounded-lg"
			style={{
				width: 500,
				height: 380,
				background: G.panel,
				border: `1px solid ${G.outline}`,
				boxShadow: "0 30px 60px rgba(0,0,0,0.55), 0 10px 24px rgba(0,0,0,0.4)",
			}}
		>
			{/* Chrome bar — traffic lights + a placeholder title bar */}
			<div
				className="flex items-center gap-2 px-3 py-2.5"
				style={{ background: G.surface, borderBottom: `1px solid ${G.outline}` }}
			>
				<span
					className="size-[10px] rounded-full"
					style={{ background: G.blockSoft }}
				/>
				<span
					className="size-[10px] rounded-full"
					style={{ background: G.blockSoft }}
				/>
				<span
					className="size-[10px] rounded-full"
					style={{ background: G.blockSoft }}
				/>
				<span className="ml-3">
					<Placeholder w={130} />
				</span>
				<span className="ml-auto">
					<Placeholder w={54} h={16} r={4} soft />
				</span>
			</div>

			{/* Filter row — grey pills */}
			<div
				className="flex items-center gap-2 px-3 py-2.5"
				style={{ borderBottom: `1px solid ${G.outline}` }}
			>
				<Placeholder w={82} h={20} r={10} soft />
				<Placeholder w={110} h={20} r={10} soft />
				<Placeholder w={68} h={20} r={10} soft />
				<span
					className="rounded-full"
					style={{
						width: 60,
						height: 20,
						border: `1px dashed ${G.outline}`,
					}}
				/>
				<span className="ml-auto">
					<Placeholder w={48} h={22} r={5} />
				</span>
			</div>

			{/* Chart + KPI split */}
			<div className="flex flex-1 min-h-0" style={{ padding: gap, gap }}>
				<div
					className="flex flex-1 flex-col gap-2 rounded-md p-3"
					style={{ background: G.surface, border: `1px solid ${G.outline}` }}
				>
					{/* Chart title placeholders */}
					<div className="flex items-center justify-between">
						<Placeholder w={84} />
						<Placeholder w={40} soft />
					</div>
					{/* Y-axis + bars */}
					<div className="flex flex-1 min-h-0 gap-2">
						<div className="flex w-[18px] flex-col justify-between py-[2px]">
							{[0, 1, 2, 3].map((i) => (
								<Placeholder key={i} w={14} soft />
							))}
						</div>
						<div className="relative flex flex-1 items-end gap-[4px]">
							{/* faint horizontal gridlines */}
							{[0.25, 0.5, 0.75].map((f) => (
								<span
									key={f}
									aria-hidden
									className="pointer-events-none absolute inset-x-0"
									style={{
										bottom: `${f * 100}%`,
										height: 1,
										background: G.blockFaint,
									}}
								/>
							))}
							{bars.map((v, i) => (
								<div
									key={i}
									className="flex flex-1"
									style={{
										height: `${(v / barMax) * 100}%`,
										background: G.block,
										borderRadius: 2,
									}}
								/>
							))}
						</div>
					</div>
					{/* Legend placeholders */}
					<div className="flex items-center gap-3">
						<span className="flex items-center gap-1.5">
							<span
								className="size-[8px] rounded-[2px]"
								style={{ background: G.block }}
							/>
							<Placeholder w={40} soft />
						</span>
						<span className="flex items-center gap-1.5">
							<span
								className="size-[8px] rounded-[2px]"
								style={{ background: G.blockSoft }}
							/>
							<Placeholder w={30} soft />
						</span>
					</div>
				</div>

				{/* KPI stack */}
				<div className="flex w-[126px] shrink-0 flex-col" style={{ gap }}>
					{[0, 1, 2].map((i) => (
						<div
							key={i}
							className="flex flex-1 flex-col justify-between rounded-md p-2.5"
							style={{ background: G.surface, border: `1px solid ${G.outline}` }}
						>
							<Placeholder w={44} soft />
							<Placeholder w={72} h={14} r={4} />
							<Placeholder w={30} soft />
						</div>
					))}
				</div>
			</div>

			{/* Table strip */}
			<div
				className="flex flex-col gap-1 px-3 py-2"
				style={{ borderTop: `1px solid ${G.outline}`, background: G.surface }}
			>
				<div className="flex items-center gap-3">
					<Placeholder w={54} soft />
					<Placeholder w={40} soft />
					<Placeholder w={40} soft />
					<span className="ml-auto">
						<Placeholder w={30} soft />
					</span>
				</div>
				{[0, 1, 2].map((i) => (
					<div key={i} className="flex items-center gap-3">
						<Placeholder w={68} />
						<Placeholder w={44} soft />
						<Placeholder w={44} soft />
						<span className="ml-auto">
							<Placeholder w={30} soft />
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

/* ─── Answer table ───────────────────────────────────────────────────────── */

function AnswerTable() {
	const rows = [
		{ c: "Acme Corp", r: "$412,800" },
		{ c: "Globex Inc", r: "$287,500" },
		{ c: "Initech", r: "$264,120" },
		{ c: "Umbrella Co", r: "$248,900" },
		{ c: "Hooli", r: "$219,540" },
		{ c: "Stark Industries", r: "$204,315" },
		{ c: "Wayne Enterprises", r: "$188,660" },
	];
	return (
		<div
			className="flex flex-col overflow-hidden rounded-lg"
			style={{
				width: 300,
				background: "#0F0F17",
				border: "1px solid rgba(255,255,255,0.08)",
				boxShadow: "0 30px 60px rgba(0,0,0,0.55), 0 10px 24px rgba(0,0,0,0.4)",
				fontFamily:
					'"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
			}}
		>
			<div
				className="grid grid-cols-[1fr_auto] gap-4 px-4 py-2.5"
				style={{
					background: "#171724",
					borderBottom: "1px solid rgba(255,255,255,0.08)",
					color: "#8B93A1",
					fontSize: 12,
					letterSpacing: "0.14em",
					textTransform: "uppercase",
					fontWeight: 700,
				}}
			>
				<span>Customer</span>
				<span>Revenue</span>
			</div>
			{rows.map((r, i) => (
				<div
					key={r.c}
					className="grid grid-cols-[1fr_auto] gap-4 px-4 py-2.5"
					style={{
						borderBottom:
							i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
						color: "#E4E7ED",
						fontSize: 14,
						background: i % 2 ? "rgba(255,255,255,0.015)" : "transparent",
					}}
				>
					<span>{r.c}</span>
					<span style={{ color: "#7CE38B", fontVariantNumeric: "tabular-nums" }}>
						{r.r}
					</span>
				</div>
			))}
		</div>
	);
}

/* ─── Arrow between panels ───────────────────────────────────────────────── */

function Arrow() {
	return (
		<div
			className="flex flex-col items-center gap-1.5"
			style={{ color: "rgba(255,255,255,0.35)" }}
		>
			<ArrowRight size={36} strokeWidth={2} />
		</div>
	);
}
