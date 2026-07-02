"use client";

import { ArrowRight, ChevronDown } from "lucide-react";

/**
 * Datadog login screen. Reproduced from the real DOM at
 * app.datadoghq.com/account/login — two-column layout with the big dog logo
 * on the left and the login form on the right, on a near-black background.
 */

const BG = "#0a0812";
const TEXT = "#FFFFFF";
const TEXT_MUTED = "rgba(255,255,255,0.76)";
const TEXT_DIM = "rgba(255,255,255,0.45)";
const INPUT_BORDER = "rgba(255,255,255,0.22)";
const LINK_BLUE = "#4A9BFF";
const GOOGLE = "#DC4E41";
const BLUE = "#3D8BD0";
const BLUE_BORDER = "#579FDD";
const DIVIDER = "rgba(255,255,255,0.12)";

const SANS =
	'"Noto Sans", "Lucida Grande", "Lucida Sans Unicode", -apple-system, BlinkMacSystemFont, sans-serif';

export function DatadogLogin() {
	return (
		<div
			className="relative flex h-full w-full items-stretch"
			style={{
				background: BG,
				backgroundImage:
					"radial-gradient(1200px 800px at 15% 20%, rgba(255,255,255,0.02) 0%, transparent 55%), radial-gradient(900px 600px at 85% 90%, rgba(255,255,255,0.02) 0%, transparent 55%)",
				color: TEXT,
				fontFamily: SANS,
			}}
		>
			{/* Left column — dog + DATADOG wordmark */}
			<div className="flex flex-1 items-center justify-center">
				<DatadogHeroLogo />
			</div>

			{/* Right column — form */}
			<div className="flex flex-1 items-center">
				<div className="flex w-[380px] flex-col gap-4">
					{/* Row: heading + region */}
					<div className="flex items-center justify-between">
						<h1
							style={{
								fontSize: 23,
								fontWeight: 300,
								margin: 0,
								color: TEXT,
							}}
						>
							Log in to Datadog
						</h1>
						<button
							type="button"
							className="flex items-center gap-1"
							style={{
								color: TEXT_MUTED,
								fontSize: 13,
								padding: "4px 6px",
								background: "transparent",
								border: 0,
							}}
						>
							<span>🇺🇸 US1 - East</span>
							<ChevronDown size={12} />
						</button>
					</div>

					{/* New user link */}
					<div
						className="flex items-center gap-2"
						style={{ color: TEXT_MUTED, fontSize: 13 }}
					>
						<span style={{ fontWeight: 500 }}>New user?</span>
						<a
							href="#"
							className="flex items-center gap-1"
							style={{
								color: TEXT_MUTED,
								textDecoration: "none",
							}}
						>
							<span>Try for free</span>
							<ArrowRight size={13} />
						</a>
					</div>

					{/* Google button */}
					<button
						type="button"
						className="relative flex w-full items-center justify-center rounded"
						style={{
							background: GOOGLE,
							color: "#fff",
							fontSize: 15,
							fontWeight: 500,
							height: 40,
							border: 0,
						}}
					>
						<GoogleG />
						<span>Sign in with Google</span>
					</button>

					{/* SSO link */}
					<a
						href="#"
						style={{
							color: LINK_BLUE,
							textDecoration: "none",
							fontSize: 13,
							fontWeight: 500,
						}}
					>
						Using Single Sign-On?
					</a>

					<div style={{ height: 1, background: DIVIDER, marginTop: 4 }} />

					{/* Inputs */}
					<form className="flex flex-col gap-2">
						<UnderlineInput placeholder="Username/Email" />
						<UnderlineInput placeholder="Password" type="password" />

						<button
							type="button"
							className="mt-3 w-full rounded"
							style={{
								background: BLUE,
								border: `1px solid ${BLUE_BORDER}`,
								color: TEXT,
								fontSize: 15,
								fontWeight: 500,
								height: 40,
							}}
						>
							Log in
						</button>
						<a
							href="#"
							style={{
								color: LINK_BLUE,
								textDecoration: "none",
								fontSize: 13,
								fontWeight: 500,
								marginTop: 2,
							}}
						>
							Forgot password?
						</a>
					</form>
				</div>
			</div>

			{/* Footer */}
			<div
				className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap"
				style={{ color: TEXT_DIM, fontSize: 11 }}
			>
				<span>Copyright Datadog, Inc. 2026</span>
				<span>·</span>
				<span>35.122006844</span>
				<span>·</span>
				<a href="#" style={{ color: LINK_BLUE, textDecoration: "none" }}>
					Master Subscription Agreement
				</a>
				<span>·</span>
				<a href="#" style={{ color: LINK_BLUE, textDecoration: "none" }}>
					Privacy Policy
				</a>
				<span>·</span>
				<a href="#" style={{ color: LINK_BLUE, textDecoration: "none" }}>
					Cookie Policy
				</a>
			</div>
		</div>
	);
}

function DatadogHeroLogo() {
	return (
		<div
			className="flex flex-col items-center"
			style={{ width: 280 }}
			aria-label="Datadog"
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src="/logos/datadog-wordmark.svg"
				alt="Datadog"
				width={280}
				height={280}
				style={{
					width: 280,
					height: 280,
					display: "block",
					// Real SVG ships as black-on-transparent — force it to white.
					filter: "brightness(0) invert(1)",
				}}
			/>
		</div>
	);
}

function GoogleG() {
	// White square chip with the multi-color G, matching Google's brand button.
	return (
		<span
			className="absolute left-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-sm"
			style={{ background: "#fff" }}
		>
			<svg width="18" height="18" viewBox="0 0 24 24">
				<path
					fill="#4285F4"
					d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.44c-.28 1.48-1.12 2.73-2.39 3.57v2.96h3.86c2.26-2.09 3.58-5.17 3.58-8.77z"
				/>
				<path
					fill="#34A853"
					d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.96c-1.07.72-2.44 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.06C3.26 21.3 7.31 24 12 24z"
				/>
				<path
					fill="#FBBC05"
					d="M5.27 14.33c-.25-.72-.38-1.49-.38-2.33s.14-1.61.38-2.33V6.61H1.29A11.98 11.98 0 0 0 0 12c0 1.94.46 3.78 1.29 5.39l3.98-3.06z"
				/>
				<path
					fill="#EA4335"
					d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.98 3.06C6.22 6.86 8.87 4.75 12 4.75z"
				/>
			</svg>
		</span>
	);
}

function UnderlineInput({
	placeholder,
	type = "text",
}: {
	placeholder: string;
	type?: string;
}) {
	return (
		<input
			type={type}
			placeholder={placeholder}
			style={{
				background: "transparent",
				borderBottom: `1px solid ${INPUT_BORDER}`,
				borderTop: 0,
				borderLeft: 0,
				borderRight: 0,
				color: TEXT,
				fontSize: 15,
				height: 42,
				outline: "none",
				padding: "0 4px",
				width: "100%",
			}}
		/>
	);
}
