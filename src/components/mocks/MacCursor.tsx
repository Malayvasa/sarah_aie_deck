"use client";

/** macOS-style arrow pointer. Sized to look "right" at 1:1 in a mock UI. */
export function MacCursor({ size = 22 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			style={{ display: "block", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}
		>
			<path
				d="M4 2 L4 18.5 L8.5 14.5 L11 20 L13.5 19 L11 13.5 L17 13.5 Z"
				fill="#ffffff"
				stroke="#000000"
				strokeWidth={1.2}
				strokeLinejoin="round"
			/>
		</svg>
	);
}
