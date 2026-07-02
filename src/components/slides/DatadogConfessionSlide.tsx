"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useContext, useEffect, useState } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";
import { useStepMotion } from "~/components/deck/useStepMotion";
import {
	BrowserWindow,
	newTabButtonPosition,
} from "~/components/mocks/BrowserWindow";
import { DatadogDashboard } from "~/components/mocks/DatadogDashboard";
import { DatadogLogin } from "~/components/mocks/DatadogLogin";
import { MacCursor } from "~/components/mocks/MacCursor";

/**
 * Slide 2 — the Datadog confession.
 *
 * Step 0 sequence, driven off `SlideContext.isSlideActive`:
 *   a. YouTube tab open (Rick Astley), cursor lounging bottom-right.
 *   b. Cursor moves up to "+" button and clicks.
 *   c. A new Datadog tab spawns, URL bar types `app.datadoghq.com` (slow).
 *   d. Typing completes → login page loads, camera pulls back to full window.
 * Step 1: login page swaps for the Datadog dashboard.
 * Step 2: the screen "cuts" to a live news broadcast — the dashboard becomes
 *   the footage on-air, chyron declares the dashboard dead.
 */

const BROWSER_W = 1180;
const BROWSER_H = 620;

const CURSOR_REST = { x: 940, y: 480 };
const CURSOR_NEWTAB = newTabButtonPosition(1);

const YOUTUBE_TAB = {
	title:
		"Rick Astley - Never Gonna Give You Up (Official Music Video) - YouTube",
	slug: "youtube",
	url: "youtube.com/watch?v=dQw4w9WgXcQ",
};
const DATADOG_URL = "app.datadoghq.com";

export function DatadogConfessionSlide() {
	return (
		<DeckSlide padded={false}>
			<DatadogConfessionBody />
			<Notes>
				<PresenterNote noteKey="datadogConfession" steps={2} />
			</Notes>
		</DeckSlide>
	);
}

function DatadogConfessionBody() {
	const { reached, placeholder } = useStepMotion(2);
	const { isSlideActive } = useContext(SlideContext);
	const openedDashboard = reached(0);
	const newsOn = reached(1);

	// Phases within step 0:
	// 0 youtube idle · 1 cursor moving to + · 2 clicked + new tab spawned +
	// URL typing starts · 3 URL committed, login page loaded.
	const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
	const [clickBump, setClickBump] = useState(false);

	useEffect(() => {
		if (!isSlideActive) {
			setPhase(0);
			setClickBump(false);
			return;
		}
		const timers: number[] = [];
		timers.push(window.setTimeout(() => setPhase(1), 900));
		timers.push(window.setTimeout(() => setClickBump(true), 2050));
		timers.push(
			window.setTimeout(() => {
				setPhase(2);
				setClickBump(false);
			}, 2200),
		);
		return () => timers.forEach(clearTimeout);
	}, [isSlideActive]);

	const onTypingDone = useCallback(() => setPhase(3), []);

	const datadogVisible = phase >= 2;
	// Once the URL commits, we consider the browser "pulled back" — the camera
	// stops zooming in on the address bar. The dashboard step layers on top of
	// that pulled-back view.
	const pulledBack = phase >= 3 || openedDashboard;

	const tabs = [
		{ ...YOUTUBE_TAB, visible: true },
		{
			url: DATADOG_URL,
			slug: pulledBack ? "datadog" : undefined,
			title: pulledBack ? "Log in — Datadog" : "New Tab",
			visible: datadogVisible,
		},
	];
	const activeIndex = datadogVisible ? 1 : 0;
	const cursorTarget = phase === 0 ? CURSOR_REST : CURSOR_NEWTAB;

	return (
		<>
			{placeholder}
			{/* Slide is full-bleed (padded={false} on DeckSlide) so the browser
			    can center in the true 1366×768 canvas. We anchor with items-start /
			    justify-start at (0,0) and place via animated x/y — that lets the
			    zoomed state keep its transformOrigin: 0% 0% at the top-left of the
			    browser while the pulled-back state slides into the true center. */}
			<div className="relative flex h-full w-full items-start justify-start overflow-hidden">
				<motion.div
					className="relative"
					initial={false}
					animate={
						newsOn
							? // Fill the slide: scale until browser width matches slide
							  // width (1366/1180 ≈ 1.158) and translate up so the title
							  // bar + URL bar exit off the top — leaving just the
							  // content viewport (dashboard) as full-slide footage.
							  { scale: 1.16, x: 0, y: -100 }
							: pulledBack
								? { scale: 1, x: 93, y: 74 }
								: { scale: 2.1, x: 164, y: 160 }
					}
					transition={{ duration: 0.9, ease: [0.34, 1.12, 0.6, 1] }}
					style={{ transformOrigin: "0% 0%" }}
				>
					<BrowserWindow
						tabs={tabs}
						activeIndex={activeIndex}
						width={BROWSER_W}
						height={BROWSER_H}
						typing={phase === 2}
						typingDelay={500}
						typingSpeed={160}
						onTypingComplete={onTypingDone}
						overlay={
							!pulledBack ? (
								<motion.div
									className="pointer-events-none absolute"
									initial={false}
									animate={{
										x: cursorTarget.x,
										y: cursorTarget.y,
										scale: clickBump ? 0.85 : 1,
									}}
									transition={{
										x: { duration: 1.1, ease: [0.4, 0.02, 0.2, 1] },
										y: { duration: 1.1, ease: [0.4, 0.02, 0.2, 1] },
										scale: { duration: 0.15 },
									}}
									style={{ left: 0, top: 0, zIndex: 20 }}
								>
									<MacCursor size={24} />
								</motion.div>
							) : null
						}
					>
						{openedDashboard ? (
							<motion.div
								key="dashboard"
								className="absolute inset-0"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.35 }}
							>
								<DatadogDashboard />
							</motion.div>
						) : phase >= 3 ? (
							<motion.div
								key="login"
								className="absolute inset-0"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.4 }}
							>
								<DatadogLogin />
							</motion.div>
						) : activeIndex === 0 ? (
							<motion.div
								key="youtube"
								className="absolute inset-0"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.25 }}
							>
								<YouTubeFake />
							</motion.div>
						) : (
							<motion.div
								key="newtab"
								className="absolute inset-0"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
								style={{ background: "#202124" }}
							/>
						)}
					</BrowserWindow>

					{/* Aggressive bottom fade — only while we're zoomed in on the
					    URL bar, hiding the empty content area entirely. */}
					<motion.div
						className="pointer-events-none absolute inset-x-0"
						initial={false}
						animate={{ opacity: pulledBack ? 0 : 1 }}
						transition={{ duration: 0.5 }}
						style={{
							top: 74,
							bottom: 0,
							background:
								"linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 8%, rgba(0,0,0,0.95) 18%, #000000 32%)",
						}}
					/>

					{/* Persistent bottom vignette — softens the browser's bottom
					    edge into the slide background after we pull back. Hidden
					    once the news broadcast takes over so the "footage" reads
					    clean. */}
					<motion.div
						className="pointer-events-none absolute inset-x-0"
						initial={false}
						animate={{ opacity: newsOn ? 0 : 1 }}
						transition={{ duration: 0.35 }}
						style={{
							top: "48%",
							bottom: -1,
							background:
								"linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.9) 70%, #000000 92%)",
						}}
					/>
					{/* Belt-and-suspenders cover for any subpixel sliver at the
					    very bottom of the browser window. Also hidden during the
					    broadcast so the chyron sits directly on the dashboard. */}
					<motion.div
						className="pointer-events-none absolute inset-x-0"
						initial={false}
						animate={{ opacity: newsOn ? 0 : 1 }}
						transition={{ duration: 0.35 }}
						style={{ bottom: -1, height: 6, background: "#000000" }}
					/>

					{/* Right-edge fade — same lifecycle. */}
					<motion.div
						className="pointer-events-none absolute inset-y-0"
						initial={false}
						animate={{ opacity: pulledBack ? 0 : 1 }}
						transition={{ duration: 0.5 }}
						style={{
							right: 0,
							width: "65%",
							background:
								"linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 12%, rgba(0,0,0,0.98) 30%, #000000 55%)",
						}}
					/>
				</motion.div>

				<AnimatePresence>{newsOn ? <NewsBroadcast /> : null}</AnimatePresence>
			</div>
		</>
	);
}

/* ─── YouTube fake ───────────────────────────────────────────────────────── */

function YouTubeFake() {
	return (
		<div
			className="flex h-full w-full items-center justify-center"
			style={{ background: "#0F0F0F", color: "#F1F1F1" }}
		>
			<div className="flex flex-col items-center gap-4">
				<div
					className="relative flex items-center justify-center overflow-hidden rounded-md"
					style={{ width: 640, height: 360, background: "#000" }}
				>
					<div
						className="absolute inset-0"
						style={{
							background:
								"linear-gradient(180deg, #1a1a2b 0%, #2b1b1b 100%)",
						}}
					/>
					<div className="relative flex flex-col items-center gap-3">
						<div className="flex size-16 items-center justify-center rounded-full bg-white/90">
							<div
								style={{
									width: 0,
									height: 0,
									borderLeft: "18px solid #FF0000",
									borderTop: "12px solid transparent",
									borderBottom: "12px solid transparent",
									marginLeft: 5,
								}}
							/>
						</div>
						<span className="font-mono text-[11px] text-white/60">
							dQw4w9WgXcQ
						</span>
					</div>
				</div>
				<div className="text-[16px] font-medium">
					Rick Astley - Never Gonna Give You Up (Official Music Video)
				</div>
			</div>
		</div>
	);
}

/* ─── Live news broadcast overlay ────────────────────────────────────────── */

const NEWS_FONT =
	'"Arial Black", "Helvetica Neue", "Helvetica", Impact, sans-serif';

/**
 * Broadcast graphics tint each element's specular highlight to match its own
 * fill — red bugs get a warm pink shine, yellow ticker gets a cream sheen,
 * black bars get a cool blue rim. Also different bands share different bend
 * points, so nothing feels stamped from the same template.
 */
const GLOSS = {
	// Deep red — hot, saturated shine, curves quickly out.
	red:
		"linear-gradient(180deg, rgba(255,220,220,0.55) 0%, rgba(255,140,140,0.18) 18%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.25) 100%)",
	// Golden — long warm crest so the whole ticker glows.
	yellow:
		"linear-gradient(180deg, rgba(255,255,220,0.65) 0%, rgba(255,240,180,0.25) 30%, rgba(255,255,255,0) 65%, rgba(120,80,0,0.2) 100%)",
	// Cool graphite — subtle top rim only, mostly dark.
	dark:
		"linear-gradient(180deg, rgba(200,220,255,0.22) 0%, rgba(255,255,255,0.04) 12%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.35) 100%)",
	// Pill / bug — pronounced curved crown, brighter across the top 40%.
	pill:
		"radial-gradient(120% 90% at 50% -10%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.18) 30%, rgba(255,255,255,0) 55%), linear-gradient(180deg, rgba(255,255,255,0) 60%, rgba(0,0,0,0.28) 100%)",
	// Big headline slab — very restrained; just a thin waxy strip up top.
	slab:
		"linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 8%, rgba(255,255,255,0) 30%, rgba(0,0,0,0.35) 100%)",
} as const;

/** Glossy overlay component — absolute, non-interactive layer for the shine. */
function GlassGloss({
	variant = "dark",
	radius = 0,
}: {
	variant?: keyof typeof GLOSS;
	radius?: number;
}) {
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0"
			style={{ background: GLOSS[variant], borderRadius: radius }}
		/>
	);
}

/** Diagonal shine sweep that periodically crosses the bright red bug. */
function ShineSweep() {
	return (
		<motion.div
			aria-hidden
			className="pointer-events-none absolute inset-y-0"
			initial={{ x: "-120%" }}
			animate={{ x: "220%" }}
			transition={{
				duration: 3.2,
				repeat: Infinity,
				repeatDelay: 4,
				ease: "easeInOut",
			}}
			style={{
				width: "45%",
				background:
					"linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)",
				mixBlendMode: "screen",
			}}
		/>
	);
}

function NewsBroadcast() {
	return (
		<motion.div
			className="pointer-events-none absolute inset-0 overflow-hidden"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.4, delay: 0.25 }}
			style={{ fontFamily: NEWS_FONT }}
		>
			{/* Camera vignette + faint scanlines over the (browser-scaled) dashboard
			    so it reads as a broadcast feed. */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.55) 100%)",
				}}
			/>
			<div
				className="absolute inset-0 mix-blend-overlay opacity-25"
				style={{
					background:
						"repeating-linear-gradient(180deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 3px)",
				}}
			/>

			{/* Top-right cluster: LIVE + timestamp */}
			<div className="absolute top-6 right-6 flex items-center gap-3">
				<div
					className="relative flex items-center gap-2 overflow-hidden rounded-full px-3.5 py-1.5"
					style={{
						background:
							"linear-gradient(180deg, #E63340 0%, #C0161F 100%)",
						color: "#fff",
						boxShadow:
							"0 8px 18px rgba(208,33,42,0.4), inset 0 1px 0 rgba(255,255,255,0.45)",
					}}
				>
					<motion.span
						className="relative inline-block size-2 rounded-full bg-white"
						animate={{ opacity: [1, 0.25, 1] }}
						transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
						style={{ boxShadow: "0 0 6px rgba(255,255,255,0.9)" }}
					/>
					<span
						className="relative"
						style={{
							fontSize: 16,
							fontWeight: 900,
							letterSpacing: "0.14em",
						}}
					>
						LIVE
					</span>
					<GlassGloss variant="pill" radius={999} />
					<ShineSweep />
				</div>
				<div
					className="relative overflow-hidden rounded-[3px] px-3 py-1.5"
					style={{
						background:
							"linear-gradient(180deg, rgba(20,20,20,0.9) 0%, rgba(0,0,0,0.9) 100%)",
						color: "#fff",
						fontFamily: '"JetBrains Mono", monospace',
						fontSize: 14,
						boxShadow: "0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
					}}
				>
					<span className="relative">22:51 EST</span>
					<GlassGloss variant="dark" radius={3} />
				</div>
			</div>

			{/* Top-left channel bug */}
			<div
				className="absolute top-6 left-6 overflow-hidden rounded-[3px] px-3 py-1.5"
				style={{
					background:
						"linear-gradient(180deg, rgba(25,25,25,0.9) 0%, rgba(0,0,0,0.92) 100%)",
					color: "#fff",
					fontSize: 15,
					fontWeight: 900,
					letterSpacing: "0.16em",
					borderLeft: "3px solid #D0212A",
					boxShadow: "0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
				}}
			>
				<span className="relative">AXN</span>
				<GlassGloss variant="dark" radius={3} />
			</div>

			{/* Lower third — chyron, floated up from the edge with side margin. */}
			<div className="absolute bottom-10 left-10 right-10 overflow-hidden rounded-[6px]">
				{/* Headline strip */}
				<div
					className="flex items-stretch"
					style={{ boxShadow: "0 18px 40px rgba(0,0,0,0.6)" }}
				>
					{/* BREAKING NEWS block */}
					<div
						className="relative flex items-center overflow-hidden px-6"
						style={{
							background:
								"linear-gradient(180deg, #E63340 0%, #C0161F 100%)",
							color: "#fff",
							fontSize: 24,
							fontWeight: 900,
							letterSpacing: "0.08em",
							padding: "18px 26px",
							boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.25)",
						}}
					>
						<span className="relative z-[2]">BREAKING&nbsp;NEWS</span>
						<GlassGloss variant="red" />
						<ShineSweep />
					</div>
					{/* Headline */}
					<div
						className="relative flex flex-1 items-center overflow-hidden pl-8"
						style={{
							background:
								"linear-gradient(180deg, #1F1F1F 0%, #0A0A0A 100%)",
							color: "#fff",
							padding: "18px 32px",
							boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -2px 0 rgba(0,0,0,0.4)",
						}}
					>
						<h1
							className="relative z-[2]"
							style={{
								fontSize: 44,
								fontWeight: 900,
								letterSpacing: "0.01em",
								lineHeight: 1,
								margin: 0,
							}}
						>
							DASHBOARD IS DEAD
						</h1>
						<GlassGloss variant="slab" />
					</div>
				</div>
				{/* Yellow ticker */}
				<div
					className="flex items-stretch"
					style={{
						fontSize: 18,
						fontWeight: 900,
						letterSpacing: "0.04em",
					}}
				>
					<div
						className="relative flex items-center overflow-hidden px-4"
						style={{
							background:
								"linear-gradient(180deg, #1B1B1B 0%, #050505 100%)",
							color: "#FFCC00",
							padding: "10px 18px",
							borderTop: "2px solid #FFCC00",
							boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
						}}
					>
						<span className="relative z-[2]">SRE ALERT</span>
						<GlassGloss variant="dark" />
					</div>
					<div
						className="relative flex-1 overflow-hidden"
						style={{
							background:
								"linear-gradient(180deg, #FFDB4D 0%, #F5B800 100%)",
							color: "#0A0A0A",
							borderTop: "2px solid #FFCC00",
							boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -2px 0 rgba(0,0,0,0.15)",
						}}
					>
						<motion.div
							className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap"
							initial={{ x: "5%" }}
							animate={{ x: "-100%" }}
							transition={{
								duration: 28,
								repeat: Infinity,
								ease: "linear",
							}}
							style={{ padding: "10px 0", fontWeight: 900 }}
						>
							SUSPECTED CAUSE: NEGLECT · &quot;IT HID ITS DEMONS IN THE p95
							PANEL&quot; — DEV SAYS · LAST SIGHTING: NOV 2024 · NO ONE HAS
							OPENED IT IN 6 MONTHS · MEMORIAL SERVICE TO BE HELD IN GRAFANA
							· AGENTS UNAVAILABLE FOR COMMENT · MORE DETAILS AS THE STORY
							DEVELOPS
						</motion.div>
						<GlassGloss variant="yellow" />
					</div>
				</div>
			</div>
		</motion.div>
	);
}
