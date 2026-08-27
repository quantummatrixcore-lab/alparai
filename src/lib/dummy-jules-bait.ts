/**
 * Jules Autonomous Agent Bait Target (Task #210)
 *
 * This bait file contains an intentional minor documentation / type refinement opportunity.
 * Jules background agent will inspect this file and submit a Pull Request to refine it.
 */

/**
 * Configuration options for the Jules autonomous agent bait trigger.
 */
export interface JulesBaitConfig {
  /** Unique identifier for the bait trigger event */
  triggerId: string;
  /** File path relative to repository root where the bait resides */
  targetPath: string;
  /** Indicates whether this bait target is currently active */
  isActive: boolean;
  /** Processing priority level for the background agent */
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

/**
 * Constant marker string used by Jules agent to verify successful bait deployment.
 */
export const JULES_BAIT_MARKER: string = "jules-bait-v1";
