"use client";

import { Notes } from "spectacle";
import { DeckSlide, Kicker } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

export function McpProblemsSlide() {
	return (
		<DeckSlide>
			<div className="flex h-full w-full flex-col justify-center gap-6">
				<Kicker>14 · The reality of MCP</Kicker>
				<h1 className="max-w-[22ch] font-normal font-mono text-[84px] leading-[1.05] tracking-tight text-foreground">Wire up a dozen MCP servers and it's a mess.</h1>
				<p className="max-w-[40ch] font-mono text-[28px] leading-[1.35] text-muted-foreground">Three reasons.</p>
			</div>
			<Notes>
				<PresenterNote noteKey="mcpProblems" />
			</Notes>
		</DeckSlide>
	);
}
