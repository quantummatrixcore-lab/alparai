/**
 * Jules Autonomous Agent Bait Target (Task #210)
 *
 * This bait file contains an intentional minor documentation / type refinement opportunity.
 * Jules background agent will inspect this file and submit a Pull Request to refine it.
 */

export interface JulesBaitConfig {
  triggerId: string;
  targetPath: string;
  isActive: boolean;
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

export const JULES_BAIT_MARKER = "jules-bait-v1";
