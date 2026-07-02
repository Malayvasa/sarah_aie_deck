"use client";

import { useCallback, useContext, useEffect, useRef } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";
import { BrowserWindow } from "~/components/mocks/BrowserWindow";

/**
 * "…except my team owns the Composio dashboard." Callback beat — the real
 * captured Composio dashboard rendered inside a Chrome window. When the slide
 * activates, an animation timeline is applied inside the iframe:
 *
 *   1. Sidebar slides in from the left.
 *   2. Header row children stagger in — "Toolkits" heading, search bar,
 *      Popular / Custom filter, external Request Toolkit link.
 *   3. The whole logo grid fades in as a single block (not per-tile).
 *   4. Only then does the marquee scroll unpause.
 */
const BROWSER_W = 1200;
const BROWSER_H = 640;
const IFRAME_NATIVE_W = 1600;
const IFRAME_NATIVE_H = 900;

const HEADER_ROW_SELECTOR = ".flex.shrink-0.items-center.gap-4";

const REVEAL_CSS = `
@keyframes _cd_slide_in_x {
	from { opacity: 0; transform: translateX(-24px); }
	to   { opacity: 1; transform: translateX(0); }
}
@keyframes _cd_reveal_y {
	from { opacity: 0; transform: translateY(8px); }
	to   { opacity: 1; transform: translateY(0); }
}
@keyframes _cd_fade_in {
	from { opacity: 0; }
	to   { opacity: 1; }
}

/* 1a — sidebar container slides in from left as a whole */
[data-slot="sidebar"] {
	opacity: 0;
	animation: _cd_slide_in_x 0.5s cubic-bezier(0.34, 1.12, 0.6, 1) 0.05s forwards;
}

/* 1b — each menu row + group label inside the sidebar staggers in on top of
    the container animation. Uses --sidebar-i, written per-element from JS. */
[data-slot="sidebar-menu-item"],
[data-slot="sidebar-group-label"] {
	opacity: 0;
	animation: _cd_reveal_y 0.35s cubic-bezier(0.34, 1.12, 0.6, 1) forwards;
	animation-delay: calc(0.35s + var(--sidebar-i, 0) * 0.05s);
}

/* 2 — header row children stagger in (heading → search → filter → request link).
    The spacer .flex-1 gets no visual effect but participates in the nth-child count. */
${HEADER_ROW_SELECTOR} > * {
	opacity: 0;
	animation: _cd_reveal_y 0.45s cubic-bezier(0.34, 1.12, 0.6, 1) forwards;
}
${HEADER_ROW_SELECTOR} > *:nth-child(1) { animation-delay: 0.55s; } /* Toolkits h1 */
${HEADER_ROW_SELECTOR} > *:nth-child(2) { animation-delay: 0.55s; } /* .flex-1 spacer */
${HEADER_ROW_SELECTOR} > *:nth-child(3) { animation-delay: 0.75s; } /* search */
${HEADER_ROW_SELECTOR} > *:nth-child(4) { animation-delay: 0.95s; } /* Popular/Custom toggle */
${HEADER_ROW_SELECTOR} > *:nth-child(5) { animation-delay: 1.15s; } /* Request Toolkit */

/* 3 — the logo grid fades in as one block. Cards inside animate together. */
.marquee-grid {
	opacity: 0;
	animation: _cd_fade_in 0.55s ease-out 1.5s forwards;
}
`;

// When the marquee "starts scrolling" — must exceed the grid fade-in end.
const MARQUEE_START_MS = 2100;

export function ComposioDashboardSlide() {
	return (
		<DeckSlide padded={false}>
			<ComposioDashboardBody />
			<Notes>
				<PresenterNote noteKey="composioDashboard" />
			</Notes>
		</DeckSlide>
	);
}

function ComposioDashboardBody() {
	const { isSlideActive } = useContext(SlideContext);
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const applyReveal = useCallback(() => {
		const doc = iframeRef.current?.contentDocument;
		if (!doc) return;

		// Remove any prior injection (in case Spectacle re-triggers on nav).
		doc.getElementById("_cd_reveal_style")?.remove();

		const style = doc.createElement("style");
		style.id = "_cd_reveal_style";
		style.textContent = REVEAL_CSS;
		doc.head.appendChild(style);

		// Number each stagger-eligible sidebar row in document order so the
		// CSS can compute a per-row animation-delay from --sidebar-i.
		doc
			.querySelectorAll<HTMLElement>(
				'[data-slot="sidebar-menu-item"], [data-slot="sidebar-group-label"]',
			)
			.forEach((el, i) => {
				el.style.setProperty("--sidebar-i", String(i));
			});

		// Pause every marquee track. They will resume via setTimeout below.
		const tracks = doc.querySelectorAll<HTMLElement>(".marquee-track");
		tracks.forEach((el) => {
			el.style.animationPlayState = "paused";
		});

		// Force reflow so the fade-in keyframes start cleanly on re-entry.
		void doc.body.offsetHeight;

		const timer = window.setTimeout(() => {
			tracks.forEach((el) => {
				el.style.animationPlayState = "running";
			});
		}, MARQUEE_START_MS);

		return () => window.clearTimeout(timer);
	}, []);

	// Replay the reveal every time the slide becomes active.
	useEffect(() => {
		if (!isSlideActive) return;
		const timer = window.setTimeout(applyReveal, 30);
		return () => window.clearTimeout(timer);
	}, [isSlideActive, applyReveal]);

	return (
		<div className="flex h-full w-full items-center justify-center">
			<BrowserWindow
				tabs={[
					{
						slug: "composio",
						title: "Toolkits — Composio Platform",
						url: "platform.composio.dev/test_org_new/composio/toolkits",
					},
				]}
				activeIndex={0}
				width={BROWSER_W}
				height={BROWSER_H}
			>
				<div
					className="absolute inset-0 overflow-hidden"
					style={{ background: "#000" }}
				>
					<iframe
						ref={iframeRef}
						src="/composio-dashboard.html"
						title="Composio dashboard"
						onLoad={applyReveal}
						style={{
							width: IFRAME_NATIVE_W,
							height: IFRAME_NATIVE_H,
							border: 0,
							display: "block",
							transform: `scale(${BROWSER_W / IFRAME_NATIVE_W})`,
							transformOrigin: "top left",
							pointerEvents: "none",
						}}
						sandbox="allow-same-origin"
					/>
					{/* Soft bottom fade so the toolkit grid dissolves off the
					    slide instead of cutting against a hard edge. */}
					<div
						className="pointer-events-none absolute inset-x-0 bottom-0"
						style={{
							height: "30%",
							background:
								"linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.92) 100%)",
						}}
					/>
				</div>
			</BrowserWindow>
		</div>
	);
}
