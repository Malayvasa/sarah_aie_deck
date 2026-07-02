"use client";

import * as React from "react";

import { cn } from "~/lib/utils";

/**
 * Ported (simplified) from terminal-kit. The deck only uses the Claude theme, so
 * the theme-detection hook is dropped and the ASCII symbol spinner is the
 * default — matching Claude Code / claude.ai's thinking glyph.
 */

/** Claude thinking spinner — cycles in this order (claude.ai / Claude Code). */
export const CLAUDE_THINKING_FRAMES = [
	"·", // middle dot / bullet
	"✻", // teardrop-spoked asterisk ✻
	"✽", // heavy teardrop-spoked asterisk ✽
	"✶", // six pointed black star ✶
	"✳", // eight spoked asterisk ✳
	"✢", // four balloon-spoked asterisk ✢
] as const;

export type TerminalAsciiSpinnerProps = {
	frames?: ReadonlyArray<string>;
	speed?: number;
	color?: string;
	className?: string;
};

export function TerminalAsciiSpinner({
	frames = CLAUDE_THINKING_FRAMES,
	speed = 150,
	color = "var(--terminal-teal)",
	className,
}: TerminalAsciiSpinnerProps) {
	const [step, setStep] = React.useState(0);
	const [reduceMotion, setReduceMotion] = React.useState(false);
	const frameCount = Math.max(1, frames.length);

	React.useEffect(() => {
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setReduceMotion(media.matches);
		update();
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, []);

	React.useEffect(() => {
		if (reduceMotion) return;
		const interval = window.setInterval(
			() => setStep((current) => (current + 1) % frameCount),
			Math.max(16, speed),
		);
		return () => window.clearInterval(interval);
	}, [reduceMotion, speed, frameCount]);

	const frame = frames[reduceMotion ? 0 : step % frameCount] ?? frames[0] ?? "·";

	return (
		<span
			aria-hidden
			className={cn(
				"inline-flex w-[1em] shrink-0 items-center justify-center font-mono leading-none",
				className,
			)}
			style={{ color }}
		>
			{frame}
		</span>
	);
}

export type ThinkingIndicatorProps = {
	label?: string;
	children?: React.ReactNode;
	asciiProps?: Omit<TerminalAsciiSpinnerProps, "className">;
	className?: string;
};

export function ThinkingIndicator({
	label,
	children,
	asciiProps,
	className,
}: ThinkingIndicatorProps) {
	const content = children ?? label;
	const asciiColor = asciiProps?.color ?? "var(--terminal-teal)";

	return (
		<div
			aria-live="polite"
			className={cn("flex items-center gap-2.5 text-[14px]", className)}
			role="status"
		>
			<TerminalAsciiSpinner {...asciiProps} color={asciiColor} />
			{content && <span style={{ color: asciiColor }}>{content}</span>}
		</div>
	);
}
