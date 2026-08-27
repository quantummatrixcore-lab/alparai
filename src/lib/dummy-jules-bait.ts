/**
 * Jules Autonomous Agent Bait Target (Task #210)
 *
 * This bait file contains an intentional minor documentation / type refinement opportunity.
 * Jules background agent will inspect this file and submit a Pull Request to refine it.
 */

/**
 * Configuration interface for the Jules Autonomous Agent bait target.
 */
export interface JulesBaitConfig {
  /** The unique identifier for the bait trigger. */
  triggerId: string;
  /** The file path to the bait target. */
  targetPath: string;
  /** Indicates whether the bait configuration is currently active. */
  isActive: boolean;
  /** The priority level of the bait configuration. */
  priority: number;
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

/** The marker string used to identify Jules bait versions. */
export const JULES_BAIT_MARKER: string = "jules-bait-v1";
