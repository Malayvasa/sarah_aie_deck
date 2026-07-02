"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useContext, type ReactNode } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

/**
 * Slide 12 — "Sparkles everywhere." Bento grid of tool chromes where each
 * tile locks in that tool's actual AI button in its actual spot, with a soft
 * pulsing glow ring so the sparkle is what the eye lands on.
 *
 * Tile sizes vary — one hero (2×2), a couple mediums (1×2), and a handful of
 * small squares — so the grid reads magazine-y rather than uniform.
 */

const SANS =
	'-apple-system, BlinkMacSystemFont, "SF Pro", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

export function SparkleButtonsEverywhereSlide() {
	return (
		<DeckSlide padded={false}>
			<SparklesEverywhereBody />
			<Notes>
				<PresenterNote noteKey="sparkleButtonsEverywhere" />
			</Notes>
		</DeckSlide>
	);
}

function SparklesEverywhereBody() {
	const { isSlideActive } = useContext(SlideContext);

	// Grid order → framer stagger index. Tiles rise + fade in when the slide
	// activates so the whole grid materializes.
	const stagger = (i: number) => ({
		initial: { opacity: 0, y: 18 },
		animate: isSlideActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
		transition: {
			duration: 0.5,
			ease: [0.34, 1.12, 0.6, 1] as [number, number, number, number],
			delay: 0.05 + i * 0.08,
		},
	});

	return (
		<div className="relative flex h-full w-full items-center justify-center bg-black px-12">
			<div
				className="grid w-full max-w-[1220px]"
				style={{
					gridTemplateColumns: "repeat(12, 1fr)",
					gridTemplateRows: "repeat(5, 110px)",
					gap: 14,
				}}
			>
				{/* Salesforce Einstein (4×3) — dialed down from the old 5×3 hero */}
				<motion.div
					{...stagger(0)}
					style={{ gridColumn: "1 / span 4", gridRow: "1 / span 3" }}
				>
					<SalesforceTile />
				</motion.div>

				{/* Notion AI (3×3) — no longer full-height portrait */}
				<motion.div
					{...stagger(1)}
					style={{ gridColumn: "5 / span 3", gridRow: "1 / span 3" }}
				>
					<NotionTile />
				</motion.div>

				{/* GitHub Copilot (3×2) — top of the right column */}
				<motion.div
					{...stagger(2)}
					style={{ gridColumn: "8 / span 3", gridRow: "1 / span 2" }}
				>
					<GitHubTile />
				</motion.div>

				{/* Linear (2×2) — next to GitHub */}
				<motion.div
					{...stagger(3)}
					style={{ gridColumn: "11 / span 2", gridRow: "1 / span 2" }}
				>
					<LinearTile />
				</motion.div>

				{/* Datadog Bits AI (5×3) — hero on the bottom-right */}
				<motion.div
					{...stagger(4)}
					style={{ gridColumn: "8 / span 5", gridRow: "3 / span 3" }}
				>
					<DatadogTile />
				</motion.div>

				{/* Slack AI (4×2) */}
				<motion.div
					{...stagger(5)}
					style={{ gridColumn: "1 / span 4", gridRow: "4 / span 2" }}
				>
					<SlackTile />
				</motion.div>

				{/* Google Docs Gemini (3×2) */}
				<motion.div
					{...stagger(6)}
					style={{ gridColumn: "5 / span 3", gridRow: "4 / span 2" }}
				>
					<GoogleDocsTile />
				</motion.div>
			</div>
		</div>
	);
}

/* ─── Shared tile helpers ────────────────────────────────────────────────── */

function Tile({
	children,
	background,
	color,
	borderTop,
}: {
	children: ReactNode;
	background: string;
	color?: string;
	borderTop?: string;
}) {
	return (
		<div
			className="relative flex h-full w-full flex-col overflow-hidden rounded-xl"
			style={{
				background,
				color: color ?? "#E4E7ED",
				border: "1px solid rgba(255,255,255,0.06)",
				borderTop: borderTop ?? "1px solid rgba(255,255,255,0.06)",
				boxShadow:
					"0 20px 40px rgba(0,0,0,0.45), 0 6px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
				fontFamily: SANS,
			}}
		>
			{children}
		</div>
	);
}

function LogoImg({
	slug,
	size,
	round = 3,
	background,
	padding,
}: {
	slug: string;
	size: number;
	round?: number;
	background?: string;
	padding?: number;
}) {
	// eslint-disable-next-line @next/next/no-img-element
	return (
		<span
			className="flex shrink-0 items-center justify-center"
			style={{
				width: size,
				height: size,
				borderRadius: round,
				background,
				padding,
				overflow: "hidden",
			}}
		>
			<img
				src={`/logos/${slug}.svg`}
				alt=""
				width={size - (padding ?? 0) * 2}
				height={size - (padding ?? 0) * 2}
				style={{
					width: size - (padding ?? 0) * 2,
					height: size - (padding ?? 0) * 2,
					display: "block",
				}}
			/>
		</span>
	);
}

/** Placeholder grey block used to fake body content behind the AI button.
 *  Pass `dark` on light-background tiles so the placeholder actually shows. */
function Skel({
	w = "100%",
	h = 8,
	tone = 0.09,
	r = 4,
	dark = false,
}: {
	w?: number | string;
	h?: number;
	tone?: number;
	r?: number;
	dark?: boolean;
}) {
	const rgb = dark ? "0,0,0" : "255,255,255";
	return (
		<span
			className="inline-block"
			style={{
				width: w,
				height: h,
				background: `rgba(${rgb},${tone})`,
				borderRadius: r,
			}}
		/>
	);
}

/**
 * The pulsing glow ring that sits behind an AI button, calling the eye to it.
 * Pass `background` for a full custom gradient (rainbow-style); otherwise a
 * single-color radial is used.
 */
function GlowRing({
	color,
	background,
}: {
	color: string;
	background?: string;
}) {
	return (
		<motion.span
			aria-hidden
			className="pointer-events-none absolute inset-0 -m-3 rounded-full"
			style={{
				background:
					background ?? `radial-gradient(circle, ${color} 0%, transparent 65%)`,
				filter: "blur(14px)",
			}}
			animate={{ opacity: [0.45, 0.9, 0.45], scale: [0.9, 1.08, 0.9] }}
			transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
		/>
	);
}

function AiPill({
	label,
	background,
	glow,
	glowBackground,
	icon,
	color = "#fff",
	radius = 8,
	fontSize = 12,
	padding = "6px 10px",
	sheenDelay = 0,
}: {
	label: ReactNode;
	background: string;
	glow: string;
	/** Full custom gradient for the halo (overrides `glow`). */
	glowBackground?: string;
	icon?: ReactNode;
	color?: string;
	radius?: number;
	fontSize?: number;
	padding?: string;
	/** Offset per pill so the whole grid doesn't shine in unison. */
	sheenDelay?: number;
}) {
	return (
		<span className="relative inline-flex items-center">
			<GlowRing color={glow} background={glowBackground} />
			<span
				className="relative inline-flex items-center gap-1.5 overflow-hidden font-semibold"
				style={{
					background,
					color,
					padding,
					borderRadius: radius,
					fontSize,
					letterSpacing: "-0.005em",
					boxShadow:
						"0 6px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
				}}
			>
				{icon ?? <Sparkles size={fontSize + 2} strokeWidth={2.4} />}
				<span className="relative z-10">{label}</span>
				{/* Sheen sweep — diagonal light band that traverses the pill. */}
				<motion.span
					aria-hidden
					className="pointer-events-none absolute inset-y-0"
					initial={{ x: "-140%" }}
					animate={{ x: "220%" }}
					transition={{
						duration: 2.6,
						repeat: Infinity,
						repeatDelay: 2.2,
						ease: "easeInOut",
						delay: sheenDelay,
					}}
					style={{
						width: "80%",
						background:
							"linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 40%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0.28) 60%, rgba(255,255,255,0) 100%)",
						mixBlendMode: "screen",
						filter: "blur(2px)",
						borderRadius: radius,
					}}
				/>
			</span>
		</span>
	);
}

/* ─── Salesforce Einstein (hero) ─────────────────────────────────────────── */

function SalesforceTile() {
	return (
		<Tile background="#0B1F3B" borderTop="1px solid #001639">
			{/* Global nav */}
			<div
				className="flex items-center gap-2 px-3 py-1.5"
				style={{ background: "#001639", color: "#fff" }}
			>
				<LogoImg slug="salesforce" size={16} background="#fff" padding={2} />
				<Skel w={54} h={5} tone={0.35} />
				<Skel w={40} h={5} tone={0.14} />
				<Skel w={40} h={5} tone={0.14} />
				<Skel w={40} h={5} tone={0.14} />
				<Skel w={40} h={5} tone={0.14} />
				<span className="ml-auto flex items-center gap-1.5">
					<Skel w={90} h={16} tone={0.08} r={3} />
					<Skel w={12} h={12} tone={0.14} r={999} />
					<Skel w={12} h={12} tone={0.14} r={999} />
					<Skel w={16} h={16} tone={0.14} r={999} />
				</span>
			</div>
			{/* Object tabs */}
			<div
				className="flex items-center gap-3 px-3 py-1.5"
				style={{
					background: "#0B2540",
					borderBottom: "1px solid rgba(255,255,255,0.05)",
				}}
			>
				<Skel w={36} h={6} tone={0.09} />
				<Skel w={44} h={6} tone={0.09} />
				<span
					className="relative rounded-sm px-1.5 py-0.5"
					style={{
						background: "rgba(26,185,255,0.10)",
						color: "#7DD3FC",
					}}
				>
					<Skel w={62} h={6} tone={0.32} />
				</span>
				<Skel w={32} h={6} tone={0.09} />
				<Skel w={40} h={6} tone={0.09} />
				<Skel w={44} h={6} tone={0.09} />
				<Skel w={32} h={6} tone={0.09} />
			</div>
			{/* Record highlight */}
			<div className="flex items-start gap-3 px-4 pt-3 pb-2">
				<LogoImg slug="salesforce" size={30} background="#fff" padding={4} round={4} />
				<div className="flex flex-1 flex-col gap-1.5">
					<Skel w={62} h={5} tone={0.24} />
					<Skel w={190} h={9} tone={0.28} />
					<Skel w={140} h={5} tone={0.20} />
				</div>
				<div className="flex flex-col items-end gap-1.5">
					<Skel w={90} h={16} tone={0.10} r={4} />
					<Skel w={70} h={16} tone={0.10} r={4} />
				</div>
			</div>
			{/* Highlight strip — 4 KPI columns */}
			<div
				className="grid grid-cols-4 gap-3 px-4 pb-2.5"
				style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
			>
				{[0, 1, 2, 3].map((i) => (
					<div key={i} className="flex flex-col gap-1">
						<Skel w={42} h={5} tone={0.20} />
						<Skel w={70} h={8} tone={0.28} />
					</div>
				))}
			</div>
			{/* Path stages — Salesforce's stage bar */}
			<div className="flex items-center gap-1 px-4 py-2">
				{[0.1, 0.1, 0.1, 0.22, 0.06].map((t, i) => (
					<span
						key={i}
						className="flex-1"
						style={{
							height: 12,
							background: `rgba(255,255,255,${t})`,
							clipPath:
								"polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%, 6px 50%)",
						}}
					/>
				))}
			</div>
			{/* Body area — two-column related lists */}
			<div
				className="grid flex-1 grid-cols-2 gap-3 px-4 py-2"
				style={{
					background: "rgba(0,0,0,0.18)",
					borderTop: "1px solid rgba(255,255,255,0.05)",
				}}
			>
				<div className="flex flex-col gap-1.5">
					<Skel w={70} h={5} tone={0.14} />
					<Skel w="90%" h={5} tone={0.06} />
					<Skel w="70%" h={5} tone={0.06} />
					<Skel w="82%" h={5} tone={0.06} />
					<Skel w="60%" h={5} tone={0.06} />
					<Skel w="90%" h={5} tone={0.06} />
				</div>
				<div className="flex flex-col gap-1.5">
					<Skel w={54} h={5} tone={0.14} />
					<Skel w="80%" h={5} tone={0.06} />
					<Skel w="65%" h={5} tone={0.06} />
					<Skel w="90%" h={5} tone={0.06} />
					<Skel w="55%" h={5} tone={0.06} />
				</div>
			</div>
			{/* Einstein AI button */}
			<div className="absolute bottom-4 right-4">
				<AiPill
					label="Ask Einstein"
					background="linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)"
					glow="rgba(109,40,217,0.6)"
					fontSize={13}
					padding="10px 14px"
					radius={10}
					sheenDelay={0}
				/>
			</div>
		</Tile>
	);
}

/* ─── Notion AI (tall) ───────────────────────────────────────────────────── */

function NotionTile() {
	return (
		<Tile background="#F9F8F5" color="#37352F">
			<div className="flex flex-1">
				{/* Notion sidebar */}
				<div
					className="flex w-[68px] shrink-0 flex-col gap-1.5 px-2 py-2"
					style={{
						background: "#F1EEE8",
						borderRight: "1px solid rgba(55,53,47,0.06)",
					}}
				>
					<div className="flex items-center gap-1">
						<LogoImg slug="notion" size={12} />
						<Skel w={38} h={5} tone={0.28} dark />
					</div>
					<div className="mt-1 flex flex-col gap-[3px]">
						<Skel w={50} h={4} tone={0.10} dark />
						<Skel w={44} h={4} tone={0.10} dark />
						<Skel w={38} h={4} tone={0.10} dark />
					</div>
					<Skel w={36} h={3} tone={0.20} dark />
					<div className="flex flex-col gap-[3px]">
						<div className="flex items-center gap-1">
							<span
								className="inline-block size-[6px]"
								style={{ background: "rgba(55,53,47,0.4)" }}
							/>
							<Skel w={38} h={4} tone={0.14} dark />
						</div>
						<div className="flex items-center gap-1 pl-2">
							<span
								className="inline-block size-[4px]"
								style={{
									background: "rgba(55,53,47,0.14)",
									borderRadius: 999,
								}}
							/>
							<Skel w={30} h={4} tone={0.09} dark />
						</div>
						<div className="flex items-center gap-1 pl-2">
							<span
								className="inline-block size-[4px]"
								style={{
									background: "rgba(55,53,47,0.14)",
									borderRadius: 999,
								}}
							/>
							<Skel w={34} h={4} tone={0.09} dark />
						</div>
						<div className="flex items-center gap-1 pl-2">
							<span
								className="inline-block size-[4px]"
								style={{
									background: "rgba(55,53,47,0.14)",
									borderRadius: 999,
								}}
							/>
							<Skel w={26} h={4} tone={0.09} dark />
						</div>
						<div className="mt-1 flex items-center gap-1">
							<span
								className="inline-block size-[6px]"
								style={{ background: "rgba(55,53,47,0.4)" }}
							/>
							<Skel w={30} h={4} tone={0.14} dark />
						</div>
					</div>
				</div>

				{/* Page body */}
				<div className="flex flex-1 flex-col px-4 py-3">
					{/* Breadcrumb */}
					<div className="flex items-center gap-1.5">
						<Skel w={30} h={4} tone={0.10} dark />
						<span style={{ color: "rgba(55,53,47,0.3)", fontSize: 8 }}>/</span>
						<Skel w={40} h={4} tone={0.10} dark />
						<span style={{ color: "rgba(55,53,47,0.3)", fontSize: 8 }}>/</span>
						<Skel w={54} h={4} tone={0.10} dark />
					</div>
					{/* Icon + Title */}
					<div className="mt-3 flex items-center gap-1.5">
						<span style={{ fontSize: 16 }}>📄</span>
					</div>
					<div className="mt-1 flex flex-col gap-2">
						<Skel w="70%" h={16} tone={0.32} r={3} dark />
						<Skel w="35%" h={5} tone={0.10} dark />
					</div>
					{/* Callout */}
					<div
						className="mt-3 flex items-start gap-2 rounded-md px-2 py-1.5"
						style={{
							background: "rgba(35,131,226,0.06)",
							border: "1px solid rgba(35,131,226,0.14)",
						}}
					>
						<span style={{ fontSize: 10 }}>💡</span>
						<div className="flex flex-1 flex-col gap-1">
							<Skel w="88%" h={4} tone={0.10} dark />
							<Skel w="70%" h={4} tone={0.10} dark />
						</div>
					</div>
					{/* Paragraphs */}
					<div className="mt-3 flex flex-col gap-1.5">
						<Skel w="90%" h={4} tone={0.09} dark />
						<Skel w="82%" h={4} tone={0.09} dark />
						<Skel w="94%" h={4} tone={0.09} dark />
						<Skel w="60%" h={4} tone={0.09} dark />
					</div>
					{/* Bullet list */}
					<div className="mt-2 flex flex-col gap-1">
						{["82%", "68%", "78%"].map((w, i) => (
							<div key={i} className="flex items-center gap-1.5">
								<span
									className="inline-block size-[3px] rounded-full"
									style={{ background: "rgba(55,53,47,0.4)" }}
								/>
								<Skel w={w} h={4} tone={0.08} dark />
							</div>
						))}
					</div>
				</div>
			</div>
			<div className="absolute bottom-3 left-1/2 -translate-x-1/2">
				<AiPill
					label="Ask AI"
					background="linear-gradient(180deg, #FFFFFF 0%, #F3F1EC 100%)"
					color="#37352F"
					glow="rgba(168,85,247,0.6)"
					// Rainbow-ish halo behind the white pill — cyan → violet →
					// pink → orange sweep sitting under Notion's clean chip.
					glowBackground="conic-gradient(from 210deg at 50% 50%, rgba(6,182,212,0.55), rgba(139,92,246,0.7), rgba(217,70,239,0.7), rgba(249,115,22,0.55), rgba(6,182,212,0.55))"
					fontSize={12}
					padding="7px 12px"
					radius={999}
					icon={<span style={{ fontSize: 13 }}>✨</span>}
					sheenDelay={0.4}
				/>
			</div>
		</Tile>
	);
}

/* ─── GitHub Copilot (small) ─────────────────────────────────────────────── */

function GitHubTile() {
	return (
		<Tile background="#0D1117">
			<div
				className="flex items-center gap-2 px-3 py-1.5"
				style={{ background: "#010409", borderBottom: "1px solid #21262D" }}
			>
				<LogoImg slug="github" size={16} background="#fff" padding={2} />
				<Skel w={46} h={5} tone={0.16} />
				<span style={{ color: "#484f58", fontSize: 8 }}>/</span>
				<Skel w={54} h={5} tone={0.24} />
				<span className="ml-auto flex items-center gap-1.5">
					<Skel w={14} h={14} tone={0.10} r={999} />
					<Skel w={14} h={14} tone={0.10} r={999} />
				</span>
			</div>
			{/* PR tabs */}
			<div
				className="flex items-center gap-3 px-3 py-1"
				style={{ borderBottom: "1px solid #21262D" }}
			>
				<div className="flex items-center gap-1">
					<Skel w={36} h={5} tone={0.08} />
					<Skel w={18} h={8} tone={0.06} r={999} />
				</div>
				<div className="flex items-center gap-1">
					<Skel w={30} h={5} tone={0.20} />
					<span
						className="inline-block h-[2px] w-6"
						style={{ background: "#F78166" }}
					/>
				</div>
				<Skel w={30} h={5} tone={0.08} />
				<Skel w={32} h={5} tone={0.08} />
			</div>
			{/* Diff */}
			<div className="flex flex-1 flex-col gap-1 p-2">
				<div
					className="flex items-center gap-1.5 rounded-t-md px-2 py-1"
					style={{
						background: "rgba(255,255,255,0.02)",
						border: "1px solid rgba(255,255,255,0.06)",
						borderBottom: "none",
					}}
				>
					<span
						className="text-[9px]"
						style={{ color: "#3178C6", fontWeight: 800 }}
					>
						TS
					</span>
					<Skel w={70} h={4} tone={0.08} />
					<span className="ml-auto text-[8.5px]" style={{ color: "#7D8590" }}>
						+3 −1
					</span>
				</div>
				<div
					className="flex-1 rounded-b-md p-2 font-mono text-[8px]"
					style={{
						background: "rgba(255,255,255,0.015)",
						border: "1px solid rgba(255,255,255,0.06)",
					}}
				>
					{[
						{ k: "ctx", w: "60%" },
						{ k: "del", w: "50%" },
						{ k: "add", w: "62%" },
						{ k: "add", w: "40%" },
						{ k: "ctx", w: "36%" },
					].map((l, i) => (
						<div
							key={i}
							className="flex items-center gap-1"
							style={{
								background:
									l.k === "add"
										? "rgba(63,185,80,0.10)"
										: l.k === "del"
											? "rgba(248,81,73,0.10)"
											: "transparent",
							}}
						>
							<span
								className="w-[10px] text-center"
								style={{
									color:
										l.k === "add"
											? "#3FB950"
											: l.k === "del"
												? "#F85149"
												: "#484f58",
									fontSize: 8,
								}}
							>
								{l.k === "add" ? "+" : l.k === "del" ? "−" : " "}
							</span>
							<Skel w={l.w} h={3} tone={0.10} />
						</div>
					))}
				</div>
			</div>
			<div className="absolute bottom-2.5 right-2.5">
				<AiPill
					label="Ask Copilot"
					background="linear-gradient(135deg, #24292F 0%, #57606A 100%)"
					glow="rgba(120,120,255,0.4)"
					fontSize={11}
					padding="5px 9px"
					icon={<span style={{ fontSize: 12 }}>🤖</span>}
					sheenDelay={0.8}
				/>
			</div>
		</Tile>
	);
}

/* ─── Linear AI (small) ──────────────────────────────────────────────────── */

function LinearTile() {
	return (
		<Tile
			background="linear-gradient(135deg, #16151E 0%, #0D0C15 100%)"
		>
			<div
				className="flex items-center gap-2 px-3 py-1.5"
				style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
			>
				<LogoImg slug="linear" size={14} />
				<Skel w={46} h={5} tone={0.14} />
				<span className="ml-auto flex items-center gap-1.5">
					<Skel w={12} h={12} tone={0.08} r={999} />
					<Skel w={12} h={12} tone={0.08} r={999} />
				</span>
			</div>
			{/* Filter chips */}
			<div
				className="flex items-center gap-1 px-3 py-1.5"
				style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
			>
				<Skel w={28} h={10} tone={0.06} r={999} />
				<Skel w={34} h={10} tone={0.06} r={999} />
				<Skel w={26} h={10} tone={0.06} r={999} />
			</div>
			{/* Issue list */}
			<div className="flex flex-1 flex-col gap-1 px-3 py-1.5">
				{[
					{ p: "#F5A623", n: "ENG-482" },
					{ p: "#3EB489", n: "ENG-481" },
					{ p: "#F04B5B", n: "ENG-478" },
					{ p: "#5E6AD2", n: "ENG-477" },
				].map((r, i) => (
					<div key={i} className="flex items-center gap-1.5">
						<span
							className="size-[7px] rounded-full"
							style={{ background: r.p, opacity: 0.75 }}
						/>
						<span
							className="text-[8.5px]"
							style={{ color: "rgba(255,255,255,0.35)" }}
						>
							{r.n}
						</span>
						<span className="flex-1">
							<Skel w={i === 0 ? "78%" : `${60 - i * 6}%`} h={4} tone={0.10} />
						</span>
						<span
							className="rounded-full"
							style={{
								width: 12,
								height: 12,
								background: "rgba(94,106,210,0.35)",
							}}
						/>
					</div>
				))}
			</div>
			<div className="absolute bottom-3 right-3">
				<AiPill
					label="Draft"
					background="linear-gradient(135deg, #7C7EEA 0%, #5E6AD2 100%)"
					glow="rgba(124,126,234,0.55)"
					fontSize={11}
					padding="5px 9px"
					sheenDelay={1.2}
				/>
			</div>
		</Tile>
	);
}

/* ─── Slack AI (wide) ────────────────────────────────────────────────────── */

function SlackTile() {
	return (
		<Tile background="#1A1D21">
			<div className="flex flex-1">
				{/* Sidebar */}
				<div
					className="flex w-[122px] shrink-0 flex-col gap-1 px-2 py-1.5"
					style={{
						background: "#19171D",
						borderRight: "1px solid rgba(255,255,255,0.05)",
					}}
				>
					<div className="flex items-center gap-1.5">
						<LogoImg slug="slack" size={14} />
						<Skel w={54} h={5} tone={0.20} />
					</div>
					<Skel w={38} h={3} tone={0.14} />
					{[
						{ h: "#", w: 66, t: 0.10, mention: true },
						{ h: "#", w: 54, t: 0.10 },
						{ h: "#", w: 74, t: 0.14 },
						{ h: "#", w: 48, t: 0.10 },
						{ h: "#", w: 60, t: 0.09 },
					].map((r, i) => (
						<div
							key={i}
							className="flex items-center gap-1.5"
							style={{
								background: r.mention ? "rgba(29,155,209,0.14)" : undefined,
								borderRadius: 3,
								padding: r.mention ? "1px 3px" : undefined,
							}}
						>
							<span
								style={{
									color: "rgba(255,255,255,0.35)",
									fontSize: 9,
									width: 6,
								}}
							>
								{r.h}
							</span>
							<Skel w={r.w} h={4} tone={r.t} />
							{r.mention ? (
								<span
									className="ml-auto rounded-full px-1 py-[1px] text-[7px] font-bold"
									style={{ background: "#E01E5A", color: "#fff" }}
								>
									3
								</span>
							) : null}
						</div>
					))}
					<Skel w={44} h={3} tone={0.14} />
					{[0.09, 0.09, 0.09].map((t, i) => (
						<div key={i} className="flex items-center gap-1.5">
							<span
								className="size-[6px] rounded-full"
								style={{
									background: i === 0 ? "#3EB489" : "rgba(255,255,255,0.15)",
								}}
							/>
							<Skel w={50 - i * 4} h={4} tone={t} />
						</div>
					))}
				</div>
				{/* Main pane */}
				<div className="flex flex-1 flex-col">
					<div
						className="flex items-center gap-2 px-3 py-1.5"
						style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
					>
						<span
							style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}
						>
							#
						</span>
						<Skel w={68} h={7} tone={0.24} />
						<Skel w={40} h={5} tone={0.08} />
					</div>
					<div className="flex flex-1 flex-col gap-2 px-3 py-2">
						{[
							{ avatar: "#B45AA3", lines: ["78%", "62%"] },
							{ avatar: "#2EB67D", lines: ["68%"] },
							{ avatar: "#ECB22E", lines: ["82%", "48%", "70%"] },
						].map((m, i) => (
							<div key={i} className="flex items-start gap-1.5">
								<Skel w={16} h={16} tone={0.24} r={2} />
								<div className="flex flex-1 flex-col gap-1">
									<div className="flex items-baseline gap-1.5">
										<Skel
											w={40}
											h={5}
											tone={0.24}
											r={3}
											// pass color via inline style
										/>
										<span
											className="rounded-full"
											style={{
												width: 12,
												height: 12,
												background: m.avatar,
												opacity: 0,
											}}
										/>
										<Skel w={22} h={4} tone={0.08} />
									</div>
									{m.lines.map((w, li) => (
										<Skel key={li} w={w} h={4} tone={0.09} />
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			<div className="absolute bottom-3 right-3">
				<AiPill
					label="Summarize"
					background="linear-gradient(135deg, #611F69 0%, #4A154B 100%)"
					glow="rgba(151,71,255,0.6)"
					fontSize={12}
					padding="7px 11px"
					sheenDelay={1.6}
				/>
			</div>
		</Tile>
	);
}

/* ─── Figma AI (small) ───────────────────────────────────────────────────── */

function DatadogTile() {
	return (
		<Tile background="#12111A">
			<div className="flex flex-1">
				{/* Purple app rail */}
				<div
					className="flex w-[36px] shrink-0 flex-col items-center gap-2 py-2"
					style={{
						background:
							"linear-gradient(180deg, #3A196B 0%, #24104A 100%)",
					}}
				>
					<LogoImg slug="datadog" size={20} background="#fff" padding={2} round={4} />
					{[0.35, 0.18, 0.18, 0.18, 0.18, 0.18].map((t, i) => (
						<Skel key={i} w={16} h={16} tone={t} r={3} />
					))}
				</div>

				<div className="flex min-w-0 flex-1 flex-col">
					{/* Top bar with query pill + time range */}
					<div
						className="flex items-center gap-1.5 px-2 py-1.5"
						style={{
							background: "#1B1B27",
							borderBottom: "1px solid rgba(255,255,255,0.06)",
						}}
					>
						<span
							className="rounded px-1.5 py-[3px] text-[8.5px] font-semibold uppercase tracking-wider"
							style={{ background: "#632CA6", color: "#fff" }}
						>
							Logs
						</span>
						<div
							className="flex flex-1 items-center gap-1.5 rounded px-1.5 py-1"
							style={{
								background: "#0F0E17",
								border: "1px solid #2C2A3F",
							}}
						>
							<span style={{ color: "#5E5E70", fontSize: 8 }}>🔍</span>
							<Skel w={28} h={4} tone={0.35} />
							<Skel w={20} h={4} tone={0.28} />
							<Skel w={32} h={4} tone={0.45} />
							<Skel w={22} h={4} tone={0.20} />
						</div>
						<span
							className="rounded border px-1.5 py-1 text-[8.5px]"
							style={{ borderColor: "#2C2A3F", color: "#C6A6EF" }}
						>
							Past 15m ▾
						</span>
					</div>

					<div className="flex min-h-0 flex-1">
						{/* Facets sidebar */}
						<div
							className="flex w-[76px] shrink-0 flex-col gap-1.5 px-1.5 py-1.5"
							style={{
								background: "#15141F",
								borderRight: "1px solid rgba(255,255,255,0.06)",
							}}
						>
							{[
								{ h: "Status", ops: [{ w: 34, on: true }, { w: 28, on: true }, { w: 30, on: false }] },
								{ h: "Service", ops: [{ w: 22, on: true }, { w: 32, on: false }] },
								{ h: "Env", ops: [{ w: 24, on: true }, { w: 30, on: false }] },
							].map((f, i) => (
								<div key={i} className="flex flex-col gap-0.5">
									<Skel w={26} h={4} tone={0.20} />
									{f.ops.map((o, j) => (
										<div key={j} className="flex items-center gap-1">
											<span
												className="flex size-[7px] items-center justify-center rounded-[1px]"
												style={{
													border: `1px solid ${o.on ? "#8B5CF6" : "#3D3B52"}`,
													background: o.on ? "#8B5CF6" : "transparent",
												}}
											/>
											<Skel w={o.w} h={4} tone={o.on ? 0.24 : 0.10} />
										</div>
									))}
								</div>
							))}
						</div>

						{/* Main pane */}
						<div className="flex min-w-0 flex-1 flex-col">
							{/* Bar histogram */}
							<div
								className="px-2 py-1.5"
								style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
							>
								<div className="flex items-center justify-between">
									<Skel w={44} h={4} tone={0.24} />
									<Skel w={30} h={4} tone={0.14} />
								</div>
								<div className="mt-1 flex h-[36px] items-end gap-[1.5px]">
									{Array.from({ length: 34 }).map((_, i) => {
										const t = (Math.sin(i * 0.5) + 1) / 2;
										const err = i >= 30 ? 24 + t * 14 : t * 4;
										const warn = 4 + t * 8;
										const info = 14 + t * 18;
										const total = err + warn + info;
										return (
											<div key={i} className="flex flex-1 flex-col justify-end">
												<div style={{ height: `${(err / total) * 100}%`, background: "#F04B5B" }} />
												<div style={{ height: `${(warn / total) * 100}%`, background: "#F5C518" }} />
												<div style={{ height: `${(info / total) * 100}%`, background: "#4A6FB0" }} />
											</div>
										);
									})}
								</div>
							</div>

							{/* Log rows */}
							<div className="flex-1 overflow-hidden py-1 font-mono">
								{[
									{ lvl: "ERROR", c: "#F04B5B", bg: "rgba(240,75,91,0.10)", wide: "82%" },
									{ lvl: "WARN", c: "#F5C518", bg: "rgba(245,197,24,0.08)", wide: "62%" },
									{ lvl: "INFO", c: "#8AB4F0", bg: undefined, wide: "70%" },
									{ lvl: "INFO", c: "#8AB4F0", bg: undefined, wide: "55%" },
									{ lvl: "ERROR", c: "#F04B5B", bg: "rgba(240,75,91,0.10)", wide: "76%" },
									{ lvl: "INFO", c: "#8AB4F0", bg: undefined, wide: "48%" },
									{ lvl: "WARN", c: "#F5C518", bg: "rgba(245,197,24,0.08)", wide: "66%" },
								].map((r, i) => (
									<div
										key={i}
										className="grid items-center gap-2 px-2 py-[3px] text-[9px]"
										style={{
											background: r.bg,
											gridTemplateColumns: "38px 34px 1fr",
										}}
									>
										<Skel w={34} h={4} tone={0.10} />
										<span
											className="rounded border text-center"
											style={{
												color: r.c,
												borderColor: `${r.c}55`,
												background: `${r.c}22`,
												fontSize: 7.5,
												fontWeight: 700,
												padding: "1px 0",
											}}
										>
											{r.lvl}
										</span>
										<Skel w={r.wide} h={4} tone={0.14} />
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bits AI button — Datadog's real branding */}
			<div className="absolute bottom-4 right-4">
				<AiPill
					label="Bits AI"
					background="linear-gradient(135deg, #7C3AED 0%, #632CA6 60%, #4C1D95 100%)"
					glow="rgba(139,92,246,0.6)"
					fontSize={13}
					padding="10px 14px"
					radius={10}
					sheenDelay={2.0}
				/>
			</div>
		</Tile>
	);
}

/* ─── Google Docs Gemini (small) ─────────────────────────────────────────── */

function GoogleDocsTile() {
	return (
		<Tile background="#FFFFFF" color="#202124">
			<div
				className="flex items-center gap-2 px-3 py-1.5"
				style={{ borderBottom: "1px solid #E5E7EB" }}
			>
				<LogoImg slug="googledocs" size={14} />
				<Skel w={70} h={5} tone={0.28} dark />
				<span className="ml-auto flex items-center gap-1.5">
					<Skel w={16} h={10} tone={0.14} dark r={2} />
					<Skel w={30} h={12} tone={0.20} dark r={3} />
				</span>
			</div>
			{/* Menu bar */}
			<div
				className="flex items-center gap-3 px-3 py-1"
				style={{
					borderBottom: "1px solid #E5E7EB",
					background: "#F1F3F4",
				}}
			>
				{["File", "Edit", "View", "Insert", "Format"].map((_, i) => (
					<Skel key={i} w={18 + i * 2} h={4} tone={0.20} dark />
				))}
			</div>
			{/* Toolbar */}
			<div
				className="flex items-center gap-2 px-3 py-1"
				style={{ borderBottom: "1px solid #E5E7EB" }}
			>
				{[10, 10, 10, 14, 10, 10, 18, 10].map((w, i) => (
					<Skel key={i} w={w} h={10} tone={0.10} dark r={2} />
				))}
			</div>
			{/* Doc body */}
			<div className="flex flex-1 flex-col gap-1 px-6 py-2">
				<Skel w="55%" h={9} tone={0.24} dark />
				<Skel w="30%" h={4} tone={0.10} dark />
				<div className="mt-2 flex flex-col gap-[3px]">
					<Skel w="92%" h={4} tone={0.14} dark />
					<Skel w="86%" h={4} tone={0.14} dark />
					<Skel w="70%" h={4} tone={0.14} dark />
				</div>
				<div className="mt-1 flex flex-col gap-[3px]">
					<Skel w="80%" h={4} tone={0.12} dark />
					<Skel w="55%" h={4} tone={0.12} dark />
				</div>
			</div>
			<div className="absolute bottom-3 right-3">
				<AiPill
					label="Gemini"
					background="linear-gradient(135deg, #4285F4 0%, #9B72CB 50%, #D96570 100%)"
					glow="rgba(155,114,203,0.6)"
					fontSize={11}
					padding="5px 9px"
					icon={<span style={{ fontSize: 12 }}>✦</span>}
					sheenDelay={2.4}
				/>
			</div>
		</Tile>
	);
}
