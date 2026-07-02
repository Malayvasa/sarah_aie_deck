"use client";

import { motion } from "framer-motion";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

/**
 * Slide 05 · 2022 — the bug report. Centered iOS-style push notification
 * from Slack. Enter animation replays every time the slide becomes active:
 * slides down from above with a soft overshoot, fades in, small scale bump.
 */
export function SlackMessageSlide() {
	return (
		<DeckSlide padded={false}>
			<SlackMessageBody />
			<Notes>
				<PresenterNote noteKey="slackMessage" />
			</Notes>
		</DeckSlide>
	);
}

function SlackMessageBody() {
	const { isSlideActive } = useContext(SlideContext);

	return (
		<div className="flex h-full w-full items-center justify-center">
			<motion.div
				// Key the animation to slide activity — leave & return replays it.
				key={isSlideActive ? "in" : "out"}
				initial={{ opacity: 0, y: -60, scale: 0.94 }}
				animate={
					isSlideActive
						? { opacity: 1, y: 0, scale: 1 }
						: { opacity: 0, y: -60, scale: 0.94 }
				}
				transition={{
					duration: 0.7,
					ease: [0.34, 1.24, 0.6, 1], // iOS-style soft overshoot
				}}
			>
				<IosSlackNotification
					sender="Malay"
					channel="#agentic-snippet-board"
					body={'hey i get an error when i search for "(prod)"'}
					time="7:34 PM"
				/>
			</motion.div>
		</div>
	);
}

const SANS =
	'-apple-system, BlinkMacSystemFont, "SF Pro", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

function IosSlackNotification({
	sender,
	channel,
	body,
	time,
}: {
	sender: string;
	channel: string;
	body: string;
	time: string;
}) {
	return (
		<div
			className="relative"
			style={{
				width: 860,
				borderRadius: 32,
				background:
					"linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(248,248,250,0.88) 100%)",
				backdropFilter: "saturate(1.8) blur(30px)",
				WebkitBackdropFilter: "saturate(1.8) blur(30px)",
				boxShadow:
					"0 40px 80px rgba(0,0,0,0.4), 0 14px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.6)",
				padding: 24,
				fontFamily: SANS,
				color: "#000000",
			}}
		>
			<div className="flex items-start" style={{ gap: 18 }}>
				<SlackAppIcon size={68} />
				<div className="min-w-0 flex-1">
					<div className="flex items-baseline">
						<span
							style={{
								fontSize: 22,
								fontWeight: 600,
								color: "#000000",
								letterSpacing: -0.2,
							}}
						>
							Slack
						</span>
						<span
							className="ml-auto"
							style={{ fontSize: 19, color: "rgba(60,60,67,0.6)" }}
						>
							{time}
						</span>
					</div>
					<div
						style={{
							marginTop: 4,
							fontSize: 22,
							fontWeight: 600,
							color: "#000000",
							letterSpacing: -0.2,
						}}
					>
						{sender} · {channel}
					</div>
					<div
						style={{
							marginTop: 6,
							fontSize: 22,
							fontWeight: 400,
							lineHeight: 1.3,
							color: "#000000",
							letterSpacing: -0.2,
						}}
					>
						{body}
					</div>
				</div>
			</div>
		</div>
	);
}

function SlackAppIcon({ size = 40 }: { size?: number }) {
	return (
		<div
			className="flex shrink-0 items-center justify-center"
			style={{
				width: size,
				height: size,
				borderRadius: size * 0.24,
				background: "#fff",
				boxShadow: "0 0 0 0.5px rgba(0,0,0,0.08)",
			}}
		>
			<svg
				width={size * 0.62}
				height={size * 0.62}
				viewBox="0 0 122.8 122.8"
			>
				<path
					fill="#E01E5A"
					d="M25.8,77.6c0,7.1-5.8,12.9-12.9,12.9S0,84.7,0,77.6s5.8-12.9,12.9-12.9h12.9V77.6z M32.3,77.6c0-7.1,5.8-12.9,12.9-12.9s12.9,5.8,12.9,12.9v32.3c0,7.1-5.8,12.9-12.9,12.9s-12.9-5.8-12.9-12.9V77.6z"
				/>
				<path
					fill="#36C5F0"
					d="M45.2,25.8c-7.1,0-12.9-5.8-12.9-12.9S38.1,0,45.2,0s12.9,5.8,12.9,12.9v12.9H45.2z M45.2,32.3c7.1,0,12.9,5.8,12.9,12.9s-5.8,12.9-12.9,12.9H12.9C5.8,58.1,0,52.3,0,45.2s5.8-12.9,12.9-12.9H45.2z"
				/>
				<path
					fill="#2EB67D"
					d="M97,45.2c0-7.1,5.8-12.9,12.9-12.9s12.9,5.8,12.9,12.9s-5.8,12.9-12.9,12.9H97V45.2z M90.5,45.2c0,7.1-5.8,12.9-12.9,12.9s-12.9-5.8-12.9-12.9V12.9C64.7,5.8,70.5,0,77.6,0s12.9,5.8,12.9,12.9V45.2z"
				/>
				<path
					fill="#ECB22E"
					d="M77.6,97c7.1,0,12.9,5.8,12.9,12.9s-5.8,12.9-12.9,12.9s-12.9-5.8-12.9-12.9V97H77.6z M77.6,90.5c-7.1,0-12.9-5.8-12.9-12.9s5.8-12.9,12.9-12.9h32.3c7.1,0,12.9,5.8,12.9,12.9s-5.8,12.9-12.9,12.9H77.6z"
				/>
			</svg>
		</div>
	);
}
