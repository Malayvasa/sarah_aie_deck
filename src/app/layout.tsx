import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted JetBrains Mono (no Google Fonts fetch at build).
const jetbrainsMono = localFont({
	src: [
		{
			path: "../../public/fonts/JetBrainsMono-Regular.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../public/fonts/JetBrainsMono-Medium.woff2",
			weight: "500",
			style: "normal",
		},
		{
			path: "../../public/fonts/JetBrainsMono-Bold.woff2",
			weight: "700",
			style: "normal",
		},
	],
	variable: "--font-jetbrains-mono",
	display: "swap",
});

const abcDiatype = localFont({
	src: [
		{
			path: "../../public/fonts/ABCDiatype-Regular.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../public/fonts/ABCDiatype-RegularItalic.woff2",
			weight: "400",
			style: "italic",
		},
		{
			path: "../../public/fonts/ABCDiatype-Medium.woff2",
			weight: "500",
			style: "normal",
		},
	],
	variable: "--font-abc-diatype",
});

export const metadata: Metadata = {
	title: "Sarah — AI Engineer",
	description: "Sarah's deck",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang="en"
			// Deck defaults to the DEV (dark) surface. Drop `dark` to use FOR YOU (light).
			className={`dark ${abcDiatype.variable} ${jetbrainsMono.variable}`}
		>
			<body className="bg-background text-foreground">{children}</body>
		</html>
	);
}
