import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";

hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sql", sql);

/**
 * Highlight a snippet to HTML (hljs token spans). Sync + client-safe — same
 * approach as the landing CodeBlock. Pair with the atom-one-dark stylesheet
 * (imported once where the code is rendered).
 */
export function highlightCode(code: string, language = "typescript"): string {
	try {
		return hljs.highlight(code, { language, ignoreIllegals: true }).value;
	} catch {
		return code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}
}
