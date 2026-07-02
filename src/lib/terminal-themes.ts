// Ported from landing-new terminal-kit. Only the claude theme is used in the deck.
export const TERMINAL_THEMES = ["default", "grok", "claude"] as const;

export type TerminalTheme = (typeof TERMINAL_THEMES)[number];

export function terminalThemeClass(theme: TerminalTheme = "default") {
	return theme === "default"
		? "terminal-theme-default"
		: `terminal-theme-${theme}`;
}

export function terminalThemeLightClass(theme: TerminalTheme = "default") {
	return theme === "default"
		? "terminal-theme-light"
		: `terminal-theme-${theme}-light`;
}
