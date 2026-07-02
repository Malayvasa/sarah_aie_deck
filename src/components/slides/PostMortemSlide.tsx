"use client";

import { Notes } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

/**
 * "How did we get here?" — full-bleed Ant-Man reaction shot from the meme,
 * no text. Visual carries the line.
 */
export function PostMortemSlide() {
	return (
		<DeckSlide padded={false}>
			<div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src="/images/ant-man-what-happened-here.webp"
					alt="What the hell happened here?"
					className="object-contain"
					style={{
						display: "block",
						maxHeight: "62%",
						maxWidth: "62%",
					}}
				/>
			</div>
			<Notes>
				<PresenterNote noteKey="postMortem" />
			</Notes>
		</DeckSlide>
	);
}
