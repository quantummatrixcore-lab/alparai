/**
 * Jules Autonomous Agent Bait Target (Task #210)
 *
 * This bait file contains an intentional minor documentation / type refinement opportunity.
 * Jules background agent will inspect this file and submit a Pull Request to refine it.
 */

/**
 * Configuration interface for Jules bait targeting.
 */
export interface JulesBaitConfig {
  /** The unique identifier for the bait trigger. */
  readonly triggerId: string;
  /** The target file path associated with the bait. */
  readonly targetPath: string;
  /** Indicates whether the bait configuration is currently active. */
  readonly isActive: boolean;
  /** The priority level of the bait configuration. */
  readonly priority: number;
}

/**
 * Returns initial configuration for Jules trigger bait.
 * @returns {JulesBaitConfig} The bait configuration object.
 */
export function getJulesBaitConfig(): JulesBaitConfig {
  return {
    triggerId: "jules-trigger-210",
    targetPath: "src/lib/dummy-jules-bait.ts",
    isActive: true,
    priority: 1,
  };
}

/**
 * A marker string used to identify the version of the Jules bait logic.
 */
export const JULES_BAIT_MARKER = "jules-bait-v1";
