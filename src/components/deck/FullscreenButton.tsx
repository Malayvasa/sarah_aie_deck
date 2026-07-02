"use client";

import { Maximize } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/**
 * Minimal fullscreen affordance for presenting. Lives in real viewport pixels
 * (outside Spectacle's scaled canvas) so it stays a constant small size on any
 * screen. Press `f` or click the button. It hides itself once fullscreen is
 * active, so it never shows up in a recording.
 */
export function FullscreenButton() {
	const [isFullscreen, setIsFullscreen] = useState(false);

	const toggle = useCallback(() => {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			document.documentElement.requestFullscreen().catch(() => {});
		}
	}, []);

	useEffect(() => {
		const onChange = () => setIsFullscreen(!!document.fullscreenElement);
		const onKey = (e: KeyboardEvent) => {
			// Ignore when typing in an input; `f` toggles fullscreen.
			if (e.key === "f" && !e.metaKey && !e.ctrlKey && !e.altKey) {
				const t = e.target as HTMLElement | null;
				if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
				e.preventDefault();
				toggle();
			}
		};
		document.addEventListener("fullscreenchange", onChange);
		window.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("fullscreenchange", onChange);
			window.removeEventListener("keydown", onKey);
		};
	}, [toggle]);

	// Hidden while presenting fullscreen — keeps the recording clean.
	if (isFullscreen) return null;

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label="Enter fullscreen (f)"
			className="fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 font-mono text-[11px] text-white/40 uppercase tracking-widest opacity-40 backdrop-blur-sm transition-opacity hover:bg-white/10 hover:text-white/80 hover:opacity-100"
		>
			<Maximize className="size-[13px]" strokeWidth={2} aria-hidden="true" />
			Fullscreen
		</button>
	);
}
