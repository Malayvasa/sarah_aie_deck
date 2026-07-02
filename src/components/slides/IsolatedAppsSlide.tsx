"use client";

import { motion } from "framer-motion";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

/**
 * Slide 17 — "Isolated apps." A phosphor-green radar screen. Every MCP-
 * connected app is a blip painted on the scope, but the agent can only see
 * whichever one the sweep is currently touching — the others fade back into
 * the noise the instant the sweep moves on. Sells the beat directly: each
 * server knows only itself, and no context survives from one to the next.
 */

const SWEEP_S = 8; // full rotation period
const FADE_DEG = 38; // how many degrees a blip stays lit after being swept
const HOLD_DEG = 6; // how many degrees the blip stays at peak before fading
const SCREEN_R = 220; // inner screen radius (px)

type App = {
	slug: string;
	name: string;
	code: string;
	angle: number; // deg, 0 = north, clockwise
	radius: number; // 0..1 of SCREEN_R
};

// Angles are spaced 45° apart so a blip's fade tail never overlaps the next.
const APPS: App[] = [
	{ slug: "slack", name: "Slack", code: "SL-01", angle: 20, radius: 0.7 },
	{ slug: "salesforce", name: "Salesforce", code: "SF-02", angle: 65, radius: 0.5 },
	{ slug: "datadog", name: "Datadog", code: "DD-03", angle: 110, radius: 0.82 },
	{ slug: "sentry", name: "Sentry", code: "SN-04", angle: 155, radius: 0.42 },
	{ slug: "github", name: "GitHub", code: "GH-05", angle: 200, radius: 0.65 },
	{ slug: "linear", name: "Linear", code: "LN-06", angle: 245, radius: 0.36 },
	{ slug: "jira", name: "Jira", code: "JR-07", angle: 290, radius: 0.78 },
	{ slug: "posthog", name: "PostHog", code: "PH-08", angle: 335, radius: 0.5 },
];

const NEON = "#3EFF7A";
const NEON_DIM = "#0BAE45";
const SCREEN_BG = "#04140A";

export function IsolatedAppsSlide() {
	return (
		<DeckSlide padded={false}>
			<IsolatedAppsBody />
			<Notes>
				<PresenterNote noteKey="isolatedApps" />
			</Notes>
		</DeckSlide>
	);
}

/* ─── Sweep hook ─────────────────────────────────────────────────────────── */

function useSweepAngle(period: number, active: boolean): number {
	const [angle, setAngle] = useState(0);
	const rafRef = useRef<number | undefined>(undefined);
	useEffect(() => {
		if (!active) {
			setAngle(0);
			return;
		}
		let start = 0;
		const tick = (t: number) => {
			if (!start) start = t;
			const elapsed = (t - start) / 1000;
			const a = ((elapsed / period) * 360) % 360;
			setAngle(a);
			rafRef.current = requestAnimationFrame(tick);
		};
		rafRef.current = requestAnimationFrame(tick);
		return () => {
			if (rafRef.current !== undefined) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, [period, active]);
	return angle;
}

/* ─── Body ───────────────────────────────────────────────────────────────── */

function IsolatedAppsBody() {
	const { isSlideActive } = useContext(SlideContext);
	const angle = useSweepAngle(SWEEP_S, isSlideActive);

	// Which app is currently "detected" (most recently swept, still glowing).
	const detected = useMemo(() => {
		let best: App | null = null;
		let bestDeg = Infinity;
		for (const app of APPS) {
			const deg = (angle - app.angle + 360) % 360;
			if (deg < FADE_DEG && deg < bestDeg) {
				bestDeg = deg;
				best = app;
			}
		}
		return best;
	}, [angle]);

	return (
		<div
			className="relative flex h-full w-full items-center justify-center"
			style={{
				background:
					"radial-gradient(1200px 700px at 50% 50%, #050A08 0%, #010302 70%, #000 100%)",
			}}
		>
			<div className="flex items-center" style={{ gap: 44 }}>
				<Radar angle={angle} />
				<Telemetry detected={detected} angle={angle} />
			</div>
		</div>
	);
}

/* ─── Radar unit ─────────────────────────────────────────────────────────── */

function Radar({ angle }: { angle: number }) {
	const outer = SCREEN_R + 46;
	const size = outer * 2;
	const center = outer;

	return (
		<div
			className="relative shrink-0"
			style={{
				width: size,
				height: size,
			}}
		>
			{/* Bezel — brushed steel */}
			<div
				className="absolute inset-0 rounded-full"
				style={{
					background:
						"linear-gradient(160deg, #C7CBD0 0%, #62666B 40%, #2A2C30 55%, #7C8085 80%, #B7BBC0 100%)",
					boxShadow:
						"0 40px 80px rgba(0,0,0,0.7), 0 14px 28px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(0,0,0,0.4)",
				}}
			/>
			{/* Inner black rim */}
			<div
				className="absolute rounded-full"
				style={{
					inset: 26,
					background:
						"radial-gradient(circle at center, #0A0F0C 0%, #01050B 60%, #000 100%)",
					boxShadow:
						"inset 0 4px 12px rgba(0,0,0,0.85), inset 0 -2px 6px rgba(255,255,255,0.06)",
				}}
			/>
			{/* Screen */}
			<div
				className="absolute overflow-hidden rounded-full"
				style={{
					left: outer - SCREEN_R,
					top: outer - SCREEN_R,
					width: SCREEN_R * 2,
					height: SCREEN_R * 2,
					background: `radial-gradient(circle at 45% 40%, #0B2E1A 0%, ${SCREEN_BG} 55%, #020806 100%)`,
					boxShadow:
						"inset 0 0 40px rgba(0,0,0,0.75), inset 0 0 100px rgba(0,180,80,0.14)",
				}}
			>
				{/* Grid */}
				<Grid />
				{/* Concentric range rings */}
				<Rings />
				{/* Crosshair */}
				<Crosshair />
				{/* Cardinal labels */}
				<Cardinals />
				{/* Sweep cone + line */}
				<Sweep angle={angle} />
				{/* Blips — one per app, opacity keyed to sweep proximity */}
				{APPS.map((app) => (
					<Blip key={app.slug} app={app} sweepAngle={angle} />
				))}
				{/* Center dot */}
				<div
					className="absolute rounded-full"
					style={{
						left: "50%",
						top: "50%",
						width: 8,
						height: 8,
						marginLeft: -4,
						marginTop: -4,
						background: NEON,
						boxShadow: `0 0 8px ${NEON}, 0 0 16px ${NEON}`,
					}}
				/>
				{/* Vignette + faint scanlines */}
				<div
					className="pointer-events-none absolute inset-0"
					style={{
						background:
							"radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)",
					}}
				/>
				<div
					className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
					style={{
						background:
							"repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)",
					}}
				/>
			</div>
			{/* Bezel screws */}
			{[45, 135, 225, 315].map((a) => {
				const rad = (a * Math.PI) / 180;
				const r = outer - 12;
				return (
					<span
						key={a}
						className="absolute rounded-full"
						style={{
							left: center + Math.cos(rad) * r - 6,
							top: center + Math.sin(rad) * r - 6,
							width: 12,
							height: 12,
							background:
								"radial-gradient(circle at 30% 30%, #D6D8DB 0%, #4B4E52 55%, #1A1C1F 100%)",
							boxShadow:
								"0 1px 2px rgba(0,0,0,0.8), inset 0 -1px 1px rgba(0,0,0,0.4)",
						}}
					>
						<span
							className="absolute inset-x-2 top-1/2 -translate-y-1/2"
							style={{ height: 1.5, background: "#1A1C1F", transform: "translateY(-1px) rotate(30deg)" }}
						/>
					</span>
				);
			})}
		</div>
	);
}

function Grid() {
	// 16-cell grid across the whole screen.
	const step = (SCREEN_R * 2) / 16;
	const lines: number[] = [];
	for (let i = 1; i < 16; i++) lines.push(i * step);
	return (
		<svg
			aria-hidden
			className="absolute inset-0"
			width={SCREEN_R * 2}
			height={SCREEN_R * 2}
		>
			<title>grid</title>
			{lines.map((p) => (
				<line
					key={`v-${p}`}
					x1={p}
					y1={0}
					x2={p}
					y2={SCREEN_R * 2}
					stroke="rgba(80,255,130,0.11)"
					strokeWidth={0.7}
				/>
			))}
			{lines.map((p) => (
				<line
					key={`h-${p}`}
					x1={0}
					y1={p}
					x2={SCREEN_R * 2}
					y2={p}
					stroke="rgba(80,255,130,0.11)"
					strokeWidth={0.7}
				/>
			))}
		</svg>
	);
}

function Rings() {
	const fractions = [0.25, 0.5, 0.75, 1];
	return (
		<svg
			aria-hidden
			className="absolute inset-0"
			width={SCREEN_R * 2}
			height={SCREEN_R * 2}
		>
			<title>range rings</title>
			{fractions.map((f) => (
				<circle
					key={f}
					cx={SCREEN_R}
					cy={SCREEN_R}
					r={SCREEN_R * f - 2}
					fill="none"
					stroke={NEON_DIM}
					strokeOpacity={f === 1 ? 0.85 : 0.42}
					strokeWidth={f === 1 ? 1.4 : 0.9}
				/>
			))}
		</svg>
	);
}

function Crosshair() {
	return (
		<svg
			aria-hidden
			className="absolute inset-0"
			width={SCREEN_R * 2}
			height={SCREEN_R * 2}
		>
			<title>crosshair</title>
			<line
				x1={SCREEN_R}
				y1={0}
				x2={SCREEN_R}
				y2={SCREEN_R * 2}
				stroke={NEON_DIM}
				strokeOpacity={0.55}
				strokeWidth={0.8}
				strokeDasharray="4 4"
			/>
			<line
				x1={0}
				y1={SCREEN_R}
				x2={SCREEN_R * 2}
				y2={SCREEN_R}
				stroke={NEON_DIM}
				strokeOpacity={0.55}
				strokeWidth={0.8}
				strokeDasharray="4 4"
			/>
		</svg>
	);
}

function Cardinals() {
	const labels = [
		{ t: "N", x: SCREEN_R, y: 14 },
		{ t: "E", x: SCREEN_R * 2 - 14, y: SCREEN_R },
		{ t: "S", x: SCREEN_R, y: SCREEN_R * 2 - 14 },
		{ t: "W", x: 14, y: SCREEN_R },
	];
	return (
		<>
			{labels.map((l) => (
				<span
					key={l.t}
					className="absolute font-mono text-[13px] font-bold"
					style={{
						left: l.x,
						top: l.y,
						transform: "translate(-50%, -50%)",
						color: NEON,
						textShadow: `0 0 6px ${NEON}`,
						letterSpacing: "0.1em",
					}}
				>
					{l.t}
				</span>
			))}
		</>
	);
}

/* ─── Sweep line + trailing cone ────────────────────────────────────────── */

function Sweep({ angle }: { angle: number }) {
	// conic-gradient starts at `from` (0deg = 12 o'clock, sweeps clockwise —
	// matches our angle convention). Place `from` FADE_DEG behind the sweep
	// so the opaque edge lands exactly on the sweep line.
	const from = (angle - FADE_DEG + 360) % 360;
	return (
		<>
			{/* Cone / afterglow */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 rounded-full"
				style={{
					background: `conic-gradient(from ${from}deg at 50% 50%, transparent 0deg, rgba(62,255,122,0.02) ${FADE_DEG * 0.4}deg, rgba(62,255,122,0.32) ${FADE_DEG}deg, transparent ${FADE_DEG + 0.5}deg)`,
					// Mask to the circle
					WebkitMaskImage:
						"radial-gradient(circle at 50% 50%, black 0%, black 98%, transparent 100%)",
					maskImage:
						"radial-gradient(circle at 50% 50%, black 0%, black 98%, transparent 100%)",
				}}
			/>
			{/* Leading sweep line */}
			<div
				aria-hidden
				className="pointer-events-none absolute"
				style={{
					left: "50%",
					top: "50%",
					width: 2.5,
					height: SCREEN_R - 4,
					marginLeft: -1.25,
					transformOrigin: "50% 0%",
					transform: `rotate(${angle - 180}deg)`,
					background: `linear-gradient(180deg, transparent 0%, ${NEON} 8%, ${NEON} 90%, rgba(62,255,122,0.4) 100%)`,
					boxShadow: `0 0 6px ${NEON}, 0 0 14px rgba(62,255,122,0.4)`,
				}}
			/>
		</>
	);
}

/* ─── Blip ───────────────────────────────────────────────────────────────── */

function Blip({ app, sweepAngle }: { app: App; sweepAngle: number }) {
	const degSince = (sweepAngle - app.angle + 360) % 360;
	const lit = degSince < FADE_DEG;
	// Two-part curve: hold at peak for HOLD_DEG, then hard fade over the
	// remainder. Squared falloff on the tail makes the ghost disappear fast
	// so at most one blip reads at a time.
	let opacity = 0;
	let scale = 0.7;
	if (lit) {
		if (degSince < HOLD_DEG) {
			opacity = 1;
			scale = 1;
		} else {
			const t = 1 - (degSince - HOLD_DEG) / (FADE_DEG - HOLD_DEG);
			opacity = t * t;
			scale = 0.85 + 0.15 * t;
		}
	}
	const rad = ((app.angle - 90) * Math.PI) / 180; // rotate so 0 = north
	const x = SCREEN_R + Math.cos(rad) * SCREEN_R * app.radius;
	const y = SCREEN_R + Math.sin(rad) * SCREEN_R * app.radius;
	// Ripple only fires in the first sliver after the sweep hits.
	const rippleActive = degSince < 4;
	return (
		<div
			className="pointer-events-none absolute"
			style={{
				left: x,
				top: y,
				opacity,
				transform: `translate(-50%, -50%) scale(${scale})`,
			}}
		>
			<div className="relative flex flex-col items-center gap-1">
				{rippleActive ? (
					<motion.span
						aria-hidden
						className="absolute rounded-full"
						initial={{ scale: 0.3, opacity: 0.8 }}
						animate={{ scale: 3, opacity: 0 }}
						transition={{ duration: 0.75, ease: "easeOut" }}
						style={{
							left: -34,
							top: -34,
							width: 68,
							height: 68,
							border: `2px solid ${NEON}`,
						}}
					/>
				) : null}
				<GlitchLogo slug={app.slug} />
			</div>
		</div>
	);
}

/* CRT-glitched logo — chromatic-aberration ghosts, sub-pixel horizontal
 * jitter, and phosphor flicker. Each pass through the sweep, the logo reads
 * as a dying scan-line rather than a clean asset. */
function GlitchLogo({ slug }: { slug: string }) {
	const LOGO_URL = `url(/logos/${slug}.svg)`;
	const MASK: React.CSSProperties = {
		WebkitMaskImage: LOGO_URL,
		maskImage: LOGO_URL,
		WebkitMaskRepeat: "no-repeat",
		maskRepeat: "no-repeat",
		WebkitMaskPosition: "center",
		maskPosition: "center",
		WebkitMaskSize: "contain",
		maskSize: "contain",
	};
	// Traveling scanline stripes clipped to the logo shape. Scroll the
	// gradient's background-position downward for the classic CRT roll.
	const SCANLINES: React.CSSProperties = {
		background:
			"repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0 1.2px, transparent 1.2px 3px)",
		backgroundSize: "100% 6px",
		mixBlendMode: "multiply",
	};
	return (
		<motion.div
			className="relative"
			style={{ width: 68, height: 68 }}
			animate={{ opacity: [1, 0.94, 1, 0.9, 1] }}
			transition={{
				duration: 0.5,
				repeat: Infinity,
				ease: "linear",
			}}
		>
			{/* Magenta-shifted ghost (offset left) */}
			<div
				className="absolute inset-0"
				style={{
					...MASK,
					backgroundColor: "#FF3AD1",
					transform: "translateX(-1.5px)",
					mixBlendMode: "screen",
					opacity: 0.55,
				}}
			/>
			{/* Cyan-shifted ghost (offset right) */}
			<div
				className="absolute inset-0"
				style={{
					...MASK,
					backgroundColor: "#3AFFFF",
					transform: "translateX(1.5px)",
					mixBlendMode: "screen",
					opacity: 0.55,
				}}
			/>
			{/* Main phosphor-green logo */}
			<div
				className="absolute inset-0"
				style={{
					...MASK,
					backgroundColor: NEON,
					filter: `drop-shadow(0 0 10px ${NEON}) drop-shadow(0 0 22px ${NEON}99)`,
				}}
			/>
			{/* Scanline overlay, clipped to logo shape. Position scrolls down for
			    a rolling-CRT effect; one full cycle = the 6px stripe height. */}
			<motion.div
				className="absolute inset-0"
				style={{ ...MASK, ...SCANLINES }}
				animate={{ backgroundPositionY: ["0px", "6px"] }}
				transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
			/>
			{/* Occasional glitch bar — sub-window slice offset horizontally */}
			<motion.div
				className="absolute inset-x-0 overflow-hidden"
				style={{
					top: "38%",
					height: "8%",
					...MASK,
					backgroundColor: NEON,
					mixBlendMode: "screen",
				}}
				animate={{ x: [0, 0, 6, 0, 0, -4, 0, 0] }}
				transition={{
					duration: 2.1,
					repeat: Infinity,
					ease: "linear",
					times: [0, 0.2, 0.22, 0.24, 0.6, 0.62, 0.64, 1],
				}}
			/>
		</motion.div>
	);
}

/* ─── Right-side telemetry panel ────────────────────────────────────────── */

function Telemetry({
	detected,
	angle,
}: {
	detected: App | null;
	angle: number;
}) {
	return (
		<div
			className="flex w-[280px] shrink-0 flex-col gap-3"
			style={{
				fontFamily:
					'"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
				color: NEON,
			}}
		>
			<div
				className="px-4 py-3"
				style={{
					background: "rgba(4,16,10,0.85)",
					border: `1px solid rgba(62,255,122,0.35)`,
					boxShadow: `0 0 28px rgba(62,255,122,0.15), inset 0 1px 0 rgba(62,255,122,0.14)`,
				}}
			>
				<div
					className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.16em]"
					style={{ color: NEON, opacity: 0.7 }}
				>
					<motion.span
						className="size-2 rounded-full"
						style={{ background: NEON, boxShadow: `0 0 6px ${NEON}` }}
						animate={{ opacity: [0.4, 1, 0.4] }}
						transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
					/>
					Sweep · SIGNAL
				</div>
				<div className="mt-2 flex items-baseline gap-2">
					<span
						className="text-[24px] font-bold"
						style={{
							color: detected ? NEON : "rgba(62,255,122,0.35)",
							textShadow: detected
								? `0 0 8px ${NEON}, 0 0 20px ${NEON}55`
								: undefined,
						}}
					>
						{detected ? detected.name : "—"}
					</span>
				</div>
				<div className="mt-1 flex items-baseline justify-between text-[11px]" style={{ color: NEON, opacity: 0.7 }}>
					<span>{detected ? detected.code : "no target"}</span>
					<span className="tabular-nums">
						{detected ? `AZ ${detected.angle.toString().padStart(3, "0")}°` : "AZ ---°"}
					</span>
				</div>
			</div>

			<div
				className="flex flex-col gap-1.5 px-4 py-3 text-[11px]"
				style={{
					background: "rgba(4,16,10,0.85)",
					border: `1px solid rgba(62,255,122,0.25)`,
					color: NEON,
				}}
			>
				<Row label="SWEEP" value={`${angle.toFixed(1)}°`} />
				<Row label="RANGE" value="LOCAL" />
				<Row label="MEMORY" value="—" />
				<Row label="LINK" value="isolated" />
			</div>

		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between">
			<span style={{ opacity: 0.6, letterSpacing: "0.12em" }}>{label}</span>
			<span
				className="tabular-nums"
				style={{ textShadow: `0 0 6px ${NEON}66` }}
			>
				{value}
			</span>
		</div>
	);
}
