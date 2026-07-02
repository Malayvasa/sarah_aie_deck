"use client";

import { motion } from "framer-motion";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

/**
 * Slide 08 — "We don't talk about Salesforce." Blown-up recreation of a real
 * Salesforce Workbench SOQL query box, just the query itself — no results.
 * `Account.Owner.Name` is highlighted as the one line that lands the joke.
 */

const SANS = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
const MONO = '"Courier New", Courier, monospace';

export function SalesforceSoqlSlide() {
	return (
		<DeckSlide padded={false}>
			<SalesforceSoqlBody />
			<Notes>
				<PresenterNote noteKey="salesforceSoql" />
			</Notes>
		</DeckSlide>
	);
}

function SalesforceSoqlBody() {
	const { isSlideActive } = useContext(SlideContext);

	return (
		<div className="flex h-full w-full items-center justify-center bg-black">
			<motion.div
				className="relative"
				style={{ width: 1120 }}
				initial={{ opacity: 0, y: 16 }}
				animate={
					isSlideActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
				}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
			>
				<div
					style={{
						background: "#ffffff",
						color: "#000000",
						fontFamily: SANS,
						padding: "40px 48px 44px",
						boxShadow:
							"0 40px 90px rgba(0,0,0,0.5), 0 12px 30px rgba(0,0,0,0.3)",
					}}
				>
					<div style={{ fontSize: 22 }}>
						Enter or modify a SOQL query below:
					</div>

					<div
						style={{
							marginTop: 16,
							border: "1px solid #999",
							padding: 20,
							fontFamily: MONO,
							fontSize: 30,
							lineHeight: 1.6,
						}}
					>
						SELECT Name, Account.Name,{" "}
						<Highlight>Account.Owner.Name</Highlight> FROM Contact
					</div>

					<button
						type="button"
						style={{
							marginTop: 18,
							fontFamily: SANS,
							fontSize: 18,
							padding: "6px 22px",
							border: "1px solid #999",
							background:
								"linear-gradient(180deg, #fdfdfd 0%, #e8e8e8 100%)",
							borderRadius: 2,
						}}
					>
						Query
					</button>
				</div>
			</motion.div>
		</div>
	);
}

function Highlight({ children }: { children: React.ReactNode }) {
	return <span style={{ background: "#ffff00" }}>{children}</span>;
}
