"use client";

import * as React from "react";

import { cn } from "~/lib/utils";

type TerminalBodyScrollProps = {
	fill?: boolean;
	pinBottom?: boolean;
	stickToBottom?: boolean;
	children: React.ReactNode;
};

function pinScrollElement(element: HTMLElement) {
	element.scrollTop = element.scrollHeight;
}

function pinScrollElementSoon(element: HTMLElement) {
	pinScrollElement(element);
	requestAnimationFrame(() => {
		pinScrollElement(element);
		requestAnimationFrame(() => pinScrollElement(element));
	});
}

export function TerminalBodyScroll({
	fill,
	pinBottom = false,
	stickToBottom = false,
	children,
}: TerminalBodyScrollProps) {
	const scrollRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (!stickToBottom) return;

		const el = scrollRef.current;
		if (!el) return;

		const contentEl = el.firstElementChild as HTMLElement | null;
		if (!contentEl) return;

		// Pin once on mount, then only when the DOM structure changes — new
		// elements added anywhere in the tree. characterData mutations (which
		// is what word-by-word streaming inside an existing text node looks
		// like) are ignored, so the scroll no longer jitters on every word.
		pinScrollElementSoon(el);

		const observer = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.addedNodes.length > 0) {
					pinScrollElementSoon(el);
					return;
				}
			}
		});
		observer.observe(contentEl, {
			childList: true,
			subtree: true,
			characterData: false,
		});

		return () => observer.disconnect();
	}, [stickToBottom]);

	return (
		<div
			className={cn(
				"terminal-body-scroll-host",
				fill && "min-h-0 flex-1 overflow-hidden",
			)}
		>
			<div
				className={cn(
					"terminal-body-scroll",
					fill && "min-h-0 flex-1",
					pinBottom && "terminal-body-scroll-pin-bottom",
				)}
				ref={scrollRef}
			>
				{children}
			</div>
		</div>
	);
}
