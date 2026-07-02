"use client";

import { Notes } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";
import { BrowserWindow } from "~/components/mocks/BrowserWindow";

/**
 * Slide 13 — "Nov 2024 · Anthropic announces MCP." Full-bleed screenshot of
 * the real anthropic.com announcement page, framed inside a Chrome window so
 * it reads unmistakably as "this actually happened on this exact site."
 */

const BROWSER_W = 1220;
const BROWSER_H = 600;

export function McpAnnouncedSlide() {
	return (
		<DeckSlide padded={false}>
			<div className="flex h-full w-full items-center justify-center">
				<BrowserWindow
					tabs={[
						{
							title:
								"Introducing the Model Context Protocol \\ Anthropic",
							url: "anthropic.com/news/model-context-protocol",
						},
					]}
					activeIndex={0}
					width={BROWSER_W}
					height={BROWSER_H}
				>
					<div
						className="absolute inset-0 overflow-hidden"
						style={{ background: "#F5F1E8" }}
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/screenshots/mcp-announcement.png"
							alt="Introducing the Model Context Protocol — anthropic.com"
							style={{
								width: "100%",
								height: "auto",
								display: "block",
							}}
						/>
						{/* Soft bottom fade so the page dissolves into the slide bg
						    rather than cutting hard at the window edge. */}
						<div
							className="pointer-events-none absolute inset-x-0 bottom-0"
							style={{
								height: "35%",
								background:
									"linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.92) 100%)",
							}}
						/>
					</div>
				</BrowserWindow>
			</div>

			<Notes>
				<PresenterNote noteKey="mcpAnnounced" />
			</Notes>
		</DeckSlide>
	);
}
