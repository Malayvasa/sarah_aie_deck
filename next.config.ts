import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Hide the Next.js dev indicator (the "N" badge + top-of-toolbar hairline).
	// It renders as a horizontal white line at the bottom of the viewport
	// during development, which shows up in slide screenshots.
	devIndicators: false,
};

export default nextConfig;
