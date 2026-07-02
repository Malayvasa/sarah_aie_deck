"use client";

import { useSteps } from "spectacle";

/**
 * Bridge between Spectacle's step system and Framer Motion.
 *
 * Spectacle drives in-slide progression (arrow keys advance the `step`, and
 * once a slide's steps are exhausted it moves to the next slide). This hook
 * surfaces the current step as a plain number you can feed straight into
 * Framer Motion `animate` props / variants.
 *
 * Usage:
 *   const { step, placeholder, isStep } = useStepMotion(3);
 *   return <>{placeholder}<motion.div animate={isStep(1) ? "in" : "out"} /></>;
 *
 * IMPORTANT: you must render `placeholder` somewhere in the slide so Spectacle
 * registers how many steps exist. It renders nothing visible.
 */
export function useStepMotion(numSteps: number) {
	const { step, isActive, placeholder, stepId } = useSteps(numSteps);

	return {
		/** Active step index, 0-based. -1 before the first step is reached. */
		step,
		/** Whether this stepper's slide is the active slide. */
		isActive,
		/** Number of revealed items (step + 1, clamped to [0, numSteps]). */
		revealed: Math.max(0, Math.min(step + 1, numSteps)),
		/** True once the given step index has been reached. */
		reached: (i: number) => step >= i,
		/** True when exactly on the given step. */
		isStep: (i: number) => step === i,
		/** Must be rendered in the slide for Spectacle to count the steps. */
		placeholder,
		stepId,
	};
}
