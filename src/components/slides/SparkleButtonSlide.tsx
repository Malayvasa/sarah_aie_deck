"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

/**
 * "The sparkle button." A single hero button floating in the void — the 2023
 * moment when every product bolted a purple/pink Ask-AI chip onto its UI.
 * Pulsing outer glow, subtle inner shine sweep, gentle float bob.
 */
export function SparkleButtonSlide() {
	return (
		<DeckSlide padded={false}>
			<SparkleButtonBody />
			<Notes>
				<PresenterNote noteKey="sparkleButton" />
			</Notes>
		</DeckSlide>
	);
}

function SparkleButtonBody() {
	const { isSlideActive } = useContext(SlideContext);

	return (
		<div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
			{/* Star field lives at slide level so the stars breathe around the
			    button, not inside it. Behind the glow so the pill's aura pushes
			    them into the background where they belong. */}
			<StarField />
			{/* Ambient glow behind the button — pulses lightly AND rotates hue
			    through the full spectrum on a matching cadence, so its color
			    tracks the rainbow gradient on the button itself. */}
			<motion.div
				className="pointer-events-none absolute"
				initial={{ opacity: 0, scale: 0.6 }}
				animate={
					isSlideActive
						? {
								opacity: [0.55, 0.85, 0.55],
								scale: [1, 1.05, 1],
							}
						: { opacity: 0, scale: 0.6 }
				}
				transition={{
					duration: 3.5,
					repeat: isSlideActive ? Infinity : 0,
					ease: "easeInOut",
				}}
				style={{
					width: 820,
					height: 500,
					borderRadius: "50%",
					// SAME linear rainbow as the button, SAME horizontal slide,
					// just huge, heavily blurred, and dimmed via opacity.
					background:
						"linear-gradient(90deg, #06B6D4 0%, #3B82F6 12%, #6366F1 24%, #A855F7 36%, #D946EF 48%, #F97316 62%, #F59E0B 74%, #EAB308 84%, #06B6D4 100%)",
					backgroundSize: "300% 100%",
					animation: "_sb_hue_slide 9s linear infinite",
					filter: "blur(80px)",
					// Radial mask — smoother, faster fall-off. Multi-stop ease
					// curve holds the core, then drops from 0.7 → 0.3 → 0 in a
					// tight band so the halo dies before the rectangle edges.
					WebkitMaskImage:
						"radial-gradient(ellipse 55% 55% at 50% 50%, black 0%, rgba(0,0,0,0.9) 25%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.18) 58%, transparent 72%)",
					maskImage:
						"radial-gradient(ellipse 55% 55% at 50% 50%, black 0%, rgba(0,0,0,0.9) 25%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.18) 58%, transparent 72%)",
					willChange: "background-position, opacity, transform",
				}}
			/>

			{/* The button — bob-floats and materializes in on slide enter. */}
			<motion.div
				key={isSlideActive ? "in" : "out"}
				initial={{ opacity: 0, y: 16, scale: 0.92 }}
				animate={
					isSlideActive
						? {
								opacity: 1,
								y: [0, -6, 0],
								scale: 1,
							}
						: { opacity: 0, y: 16, scale: 0.92 }
				}
				transition={{
					opacity: { duration: 0.6, ease: [0.34, 1.18, 0.6, 1] },
					scale: { duration: 0.6, ease: [0.34, 1.18, 0.6, 1] },
					y: {
						duration: 4,
						repeat: isSlideActive ? Infinity : 0,
						ease: "easeInOut",
					},
				}}
				className="relative"
			>
				<SparkleButton />
			</motion.div>
		</div>
	);
}

function SparkleButton() {
	return (
		<div
			className="relative flex items-center overflow-hidden"
			style={{
				gap: 32,
				padding: "48px 92px",
				borderRadius: 999,
				// Rainbow gradient that slides horizontally forever — cyan →
				// blue → indigo → magenta → orange → yellow and loops back.
				// The double-loop stops on the tail mirror the head so the
				// background-position sweep never shows a hard seam.
				background:
					"linear-gradient(90deg, #06B6D4 0%, #3B82F6 12%, #6366F1 24%, #A855F7 36%, #D946EF 48%, #F97316 62%, #F59E0B 74%, #EAB308 84%, #06B6D4 100%)",
				backgroundSize: "300% 100%",
				animation: "_sb_hue_slide 9s linear infinite",
				// Neutral drop shadow — colored shadows fought the rainbow
				// gradient, staying purple while the pill went yellow. A soft
				// dark drop reads cleanly under every hue.
				boxShadow:
					"0 0 0 1.5px rgba(255,255,255,0.22) inset, 0 24px 48px rgba(0,0,0,0.45), 0 8px 18px rgba(0,0,0,0.35)",
				color: "#fff",
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", Arial, sans-serif',
				fontSize: 84,
				fontWeight: 600,
				letterSpacing: "-0.02em",
			}}
		>
			{/* Local keyframes for the background slide — scoped via `_sb_`
			    prefix so it can't collide with anything else in the deck. */}
			<style>{`
				@keyframes _sb_hue_slide {
					from { background-position: 0% 50%; }
					to   { background-position: 300% 50%; }
				}
			`}</style>
			{/* Diagonal shine sweep — soft on all four edges. A vertical mask
			    fades the strip at top & bottom so it doesn't cut hard against
			    the button's rounded corners; the horizontal linear-gradient
			    handles left/right. */}
			<motion.div
				aria-hidden
				className="pointer-events-none absolute inset-y-0"
				initial={{ x: "-110%" }}
				animate={{ x: "210%" }}
				transition={{
					duration: 3.6,
					repeat: Infinity,
					repeatDelay: 0.6,
					ease: [0.32, 0, 0.68, 1], // smooth in/out sinusoidal
				}}
				style={{
					width: "95%",
					background:
						"linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 32%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.6) 55%, rgba(255,255,255,0.25) 68%, rgba(255,255,255,0) 100%)",
					mixBlendMode: "screen",
					filter: "blur(4px)",
					WebkitMaskImage:
						"radial-gradient(ellipse 75% 70% at 50% 50%, black 45%, transparent 100%)",
					maskImage:
						"radial-gradient(ellipse 75% 70% at 50% 50%, black 45%, transparent 100%)",
				}}
			/>

			<motion.span
				className="relative flex items-center justify-center"
				animate={{ rotate: [0, 8, -6, 0] }}
				transition={{
					duration: 3.6,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			>
				<Sparkles
					size={90}
					strokeWidth={2.4}
					style={{ filter: "drop-shadow(0 0 16px rgba(255,255,255,0.7))" }}
				/>
			</motion.span>
			<span className="relative">Generate</span>
		</div>
	);
}

/**
 * Full-slide star field surrounding the button. Distribution is radial:
 * densest in a ring just outside the pill, thinning toward the slide edges,
 * so the button reads as the source of the galaxy.
 *
 * Positions are pixel offsets from slide center (683, 384) computed
 * deterministically per ring; no random state so hot-reload / re-render
 * gives the same layout every time.
 */
function StarField() {
	type Star = {
		x: number;
		y: number;
		size: number;
		delay: number;
		dur: number;
		dx: number;
		dy: number;
		kind: "twinkle" | "flash";
	};

	const CX = 683;
	const CY = 384;
	// Each ring: how many stars, base radius (px from center), and how much
	// jitter to add to each star's radius so they don't sit on a perfect ring.
	// Density falls off ring-by-ring — closer to the button = more stars per
	// unit angle.
	const rings = [
		{ count: 34, r: 300, jitter: 65, phase: 0.0, sizeMin: 1.5, sizeMax: 3.2, flashEvery: 6 },
		{ count: 30, r: 430, jitter: 85, phase: 0.31, sizeMin: 1.4, sizeMax: 2.6, flashEvery: 8 },
		{ count: 22, r: 560, jitter: 100, phase: 0.67, sizeMin: 1.2, sizeMax: 2.4, flashEvery: 10 },
		{ count: 14, r: 700, jitter: 60, phase: 0.19, sizeMin: 1.1, sizeMax: 2.0, flashEvery: 12 },
	];

	const stars: Star[] = [];
	for (let ringI = 0; ringI < rings.length; ringI++) {
		const ring = rings[ringI];
		for (let i = 0; i < ring.count; i++) {
			// Deterministic pseudo-noise so stars don't tile — mixes the star
			// index and ring index without ever pulling from Math.random.
			const noise = ((i * 41 + ringI * 137) % 100) / 100; // 0..1
			const noise2 = ((i * 71 + ringI * 53) % 100) / 100;
			const noise3 = ((i * 19 + ringI * 97) % 100) / 100;

			const angle =
				(i / ring.count) * Math.PI * 2 + ring.phase + noise * 0.15;
			const r = ring.r + (noise - 0.5) * 2 * ring.jitter;
			const x = CX + Math.cos(angle) * r;
			const y = CY + Math.sin(angle) * r;

			// Skip anything that would fall behind or too close to the pill —
			// visible drift keeps them just outside its silhouette.
			if (Math.hypot(x - CX, y - CY) < 240) continue;

			const size = ring.sizeMin + noise2 * (ring.sizeMax - ring.sizeMin);
			// Drift amplitude scales up in the outer rings so distant stars
			// travel further, matching how nebula dust reads on TV.
			const driftBase = 22 + ringI * 8;
			const dx = (noise3 - 0.5) * 2 * driftBase;
			const dy = (noise - 0.5) * 2 * driftBase;
			const dur = 6.5 + noise2 * 7; // 6.5..13.5s
			const delay = noise * 2.8;
			const kind: Star["kind"] = i % ring.flashEvery === 0 ? "flash" : "twinkle";

			stars.push({ x, y, size, delay, dur, dx, dy, kind });
		}
	}

	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0"
			style={{ mixBlendMode: "screen" }}
		>
			{stars.map((s, i) => {
				const isFlash = s.kind === "flash";
				return (
					<motion.span
						// biome-ignore lint/suspicious/noArrayIndexKey: static list
						key={i}
						className="absolute rounded-full"
						style={{
							left: s.x,
							top: s.y,
							width: s.size,
							height: s.size,
							background: "#fff",
							boxShadow: `0 0 ${s.size * (isFlash ? 8 : 4)}px rgba(255,255,255,0.9)`,
						}}
						initial={{ opacity: 0, scale: 0.6, x: 0, y: 0 }}
						animate={
							isFlash
								? {
										opacity: [0.2, 0.4, 1.5, 0.4, 0.2],
										scale: [0.7, 1.0, 2.0, 1.0, 0.7],
										x: [0, s.dx * 0.4, s.dx, s.dx * 0.4, 0],
										y: [0, s.dy * 0.4, s.dy, s.dy * 0.4, 0],
									}
								: {
										opacity: [0.3, 0.9, 0.5, 1, 0.3],
										scale: [0.85, 1.2, 0.95, 1.3, 0.85],
										x: [0, s.dx, s.dx * 0.6, -s.dx * 0.4, 0],
										y: [0, s.dy, -s.dy * 0.5, s.dy * 0.7, 0],
									}
						}
						transition={{
							duration: s.dur,
							repeat: Infinity,
							ease: "easeInOut",
							delay: s.delay,
						}}
					/>
				);
			})}
		</div>
	);
}
