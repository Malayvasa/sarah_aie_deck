"use client";

import { Notes } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

export function McpProblemsSlide() {
	return (
		<DeckSlide padded={false}>
			<div className="flex h-full w-full items-center justify-center bg-black">
				{/* biome-ignore lint/performance/noImgElement: static slide image */}
				<img
					src="/images/mcp-mess.png"
					alt="A wall outlet with dozens of tangled power adapters and extension cords daisy-chained together"
					className="object-contain"
					style={{ maxHeight: "70%", maxWidth: "55%" }}
				/>
			</div>
			<Notes>
				<PresenterNote noteKey="mcpProblems" />
			</Notes>
		</DeckSlide>
	);
}
