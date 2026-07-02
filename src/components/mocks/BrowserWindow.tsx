"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowLeft,
	ArrowRight,
	Lock,
	MoreVertical,
	Puzzle,
	RotateCw,
	Star,
	User,
	X,
	type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Reusable Chrome dark-mode browser shell. Supports:
 *   - Multiple tabs with an active index and per-tab show/hide animation
 *     (so you can "click +" to spawn a new tab)
 *   - Optional URL typing on the active tab
 *   - An `overlay` slot rendered on top of the whole window (used for cursors,
 *     tooltips, click ripples, etc.)
 */

const SANS =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const CHROME_COLORS = {
	titleBg: "#272A2D",
	titleBg2: "#1E2022",
	tabInactive: "#2F3236",
	tabActive: "#3C4043",
	tabTextActive: "#E8EAED",
	tabTextInactive: "#9AA0A6",
	urlBar: "#3C4043",
	urlText: "#E8EAED",
	urlMuted: "#9AA0A6",
	contentBg: "#202124",
	divider: "#1E2022",
} as const;

const C = CHROME_COLORS;

// Tab strip layout constants — exposed so slides can compute cursor targets
// relative to the "+" button.
export const TAB_STRIP_PL = 88; // matches pl-[88px] on the title bar
export const TAB_WIDTH = 260;
export const TAB_GAP = 2;
export const TAB_ROW_HEIGHT = 44;

export type BrowserTab = {
	title: string;
	slug?: string;
	url: string;
	visible?: boolean; // default true; false collapses tab width to 0
};

export type BrowserWindowProps = {
	tabs: BrowserTab[];
	activeIndex: number;
	children?: ReactNode;
	/** Rendered on top of the browser window — cursor, tooltips, click bumps. */
	overlay?: ReactNode;
	width?: number;
	height?: number;
	typing?: boolean;
	typingSpeed?: number;
	typingDelay?: number;
	onTypingComplete?: () => void;
	className?: string;
};

export function BrowserWindow({
	tabs,
	activeIndex,
	children,
	overlay,
	width = 1100,
	height = 540,
	typing = false,
	typingSpeed = 55,
	typingDelay = 300,
	onTypingComplete,
	className,
}: BrowserWindowProps) {
	const active = tabs[activeIndex];
	const displayedUrl = useTypedUrl(
		active?.url ?? "",
		typing,
		typingSpeed,
		typingDelay,
		onTypingComplete,
	);

	return (
		<div
			className={`relative overflow-hidden rounded-lg shadow-[0_30px_60px_rgba(0,0,0,0.55),0_10px_24px_rgba(0,0,0,0.4)] ${className ?? ""}`}
			style={{
				width,
				background: C.contentBg,
				fontFamily: SANS,
			}}
		>
			{/* Title bar + tab strip */}
			<div
				className="relative flex items-end pr-3 pt-2"
				style={{
					background: `linear-gradient(180deg, ${C.titleBg} 0%, ${C.titleBg2} 100%)`,
					height: TAB_ROW_HEIGHT,
					paddingLeft: TAB_STRIP_PL,
				}}
			>
				<TrafficLights />
				<div className="flex items-end" style={{ gap: TAB_GAP }}>
					{tabs.map((tab, i) => {
						const isActive = i === activeIndex;
						const visible = tab.visible !== false;
						return (
							<motion.div
								key={i}
								initial={false}
								animate={{
									width: visible ? TAB_WIDTH : 0,
									opacity: visible ? 1 : 0,
								}}
								transition={{
									duration: 0.4,
									ease: [0.34, 1.1, 0.6, 1],
								}}
								style={{ overflow: "hidden", flexShrink: 0 }}
							>
								<ChromeTab tab={tab} active={isActive} />
							</motion.div>
						);
					})}
					<button
						className="ml-1 mb-1 flex size-7 items-center justify-center rounded-full"
						style={{ color: C.tabTextInactive }}
						type="button"
					>
						<span className="text-[16px] leading-none">+</span>
					</button>
				</div>
			</div>

			{/* URL bar */}
			<div
				className="flex items-center gap-2 px-3 py-2"
				style={{
					background: C.titleBg2,
					borderTop: "1px solid rgba(255,255,255,0.08)",
					borderBottom: `1px solid ${C.divider}`,
				}}
			>
				<NavButton icon={ArrowLeft} dim />
				<NavButton icon={ArrowRight} dim />
				<NavButton icon={RotateCw} />

				<div
					className="flex flex-1 items-center gap-2 rounded-full px-3 py-1.5"
					style={{ background: C.urlBar }}
				>
					<Lock size={13} style={{ color: C.urlMuted }} />
					<div
						className="flex flex-1 items-center truncate font-mono text-[12px] leading-[16px]"
						style={{ color: C.urlText, minHeight: 16 }}
					>
						<span className="truncate">
							<UrlText url={displayedUrl} />
						</span>
						<span
							aria-hidden
							className="ml-[1px] inline-block h-[12px] w-[1.5px] shrink-0 animate-[terminal-cursor-blink_1s_step-end_infinite]"
							style={{
								background: C.urlText,
								opacity:
									typing && displayedUrl.length < (active?.url.length ?? 0)
										? 1
										: 0,
							}}
						/>
					</div>
					<Star size={13} style={{ color: C.urlMuted }} />
				</div>

				<NavButton icon={Puzzle} dim />
				<div
					className="ml-1 flex size-7 items-center justify-center rounded-full"
					style={{ background: "#185ABC", color: "#fff" }}
				>
					<User size={13} />
				</div>
				<NavButton icon={MoreVertical} dim />
			</div>

			{/* Content viewport */}
			<div
				className="relative overflow-hidden"
				style={{ height, background: "#000000" }}
			>
				<AnimatePresence mode="wait">{children}</AnimatePresence>
			</div>

			{overlay}
		</div>
	);
}

/**
 * Compute the pixel position of the "+" new-tab button given how many tabs
 * are visible. Useful for animating cursors to it.
 */
export function newTabButtonPosition(visibleTabs: number) {
	const x =
		TAB_STRIP_PL + visibleTabs * (TAB_WIDTH + TAB_GAP) + 4 /* ml-1 */ + 14; /* half of size-7 */
	const y = TAB_ROW_HEIGHT - 8 /* mb-1 */ - 14; /* half of size-7 */
	return { x, y };
}

/* ─── Internals ──────────────────────────────────────────────────────────── */

function useTypedUrl(
	target: string,
	typing: boolean,
	speed: number,
	delay: number,
	onDone?: () => void,
) {
	const [shown, setShown] = useState(typing ? "" : target);

	useEffect(() => {
		if (!typing) {
			setShown(target);
			return;
		}
		setShown("");
		let i = 0;
		let cancelled = false;
		const kickoff = window.setTimeout(() => {
			const tick = () => {
				if (cancelled) return;
				i += 1;
				setShown(target.slice(0, i));
				if (i < target.length) {
					window.setTimeout(tick, speed);
				} else {
					onDone?.();
				}
			};
			tick();
		}, delay);
		return () => {
			cancelled = true;
			window.clearTimeout(kickoff);
		};
	}, [target, typing, speed, delay, onDone]);

	return shown;
}

function TrafficLights() {
	return (
		<div className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
			{["#FF5F57", "#FEBC2E", "#28C840"].map((bg) => (
				<span
					key={bg}
					className="size-[12px] rounded-full"
					style={{ background: bg, border: "0.5px solid rgba(0,0,0,0.25)" }}
				/>
			))}
		</div>
	);
}

function ChromeTab({ tab, active }: { tab: BrowserTab; active: boolean }) {
	return (
		<div
			className="relative flex h-[34px] items-center gap-2 overflow-hidden pl-3 pr-2"
			style={{
				width: TAB_WIDTH,
				background: active ? C.tabActive : C.tabInactive,
				borderTopLeftRadius: 9,
				borderTopRightRadius: 9,
				color: active ? C.tabTextActive : C.tabTextInactive,
			}}
		>
			{tab.slug ? <AppLogo slug={tab.slug} size={14} /> : null}
			<span className="truncate text-[12.5px]">{tab.title}</span>
			<span
				className="flex size-[18px] shrink-0 items-center justify-center rounded-full"
				style={{ marginLeft: "auto" }}
			>
				<X size={14} strokeWidth={2} style={{ opacity: 0.75 }} />
			</span>
		</div>
	);
}

function NavButton({ icon: Icon, dim }: { icon: LucideIcon; dim?: boolean }) {
	return (
		<button
			type="button"
			className="flex size-7 items-center justify-center rounded-full"
			style={{ color: dim ? C.urlMuted : C.urlText }}
		>
			<Icon size={14} strokeWidth={2} />
		</button>
	);
}

function UrlText({ url }: { url: string }) {
	if (!url) return null;
	const [host, ...rest] = url.split("/");
	return (
		<span>
			<span style={{ color: C.urlText }}>{host}</span>
			<span style={{ color: C.urlMuted }}>
				{rest.length ? "/" + rest.join("/") : ""}
			</span>
		</span>
	);
}

function AppLogo({ slug, size }: { slug: string; size: number }) {
	// Composio's brand SVG ships dark-on-transparent — force it white so it
	// reads against the dark Chrome tab background.
	const isComposio = slug === "composio";
	// eslint-disable-next-line @next/next/no-img-element
	return (
		<img
			src={`/logos/${slug}.svg`}
			alt=""
			width={size}
			height={size}
			style={{
				width: size,
				height: size,
				borderRadius: 3,
				display: "block",
				flexShrink: 0,
				filter: isComposio ? "brightness(0) invert(1)" : undefined,
			}}
		/>
	);
}
