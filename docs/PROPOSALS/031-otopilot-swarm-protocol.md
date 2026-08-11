# Proposal 031: Swarm Autopilot Trigger Protocol (Otopilot)

**Status:** Proposed (Awaiting Architect/Opus Integration into MASTER_PLAN.md)
**Author:** Antigravity (Agent-OS) / Founder Directive
**Date:** 2026-08-11

## 1. Context & Motivation

In accordance with the Founder's directive, there is a need for a clear protocol on how the "otopilot" (autopilot) command should be processed within the system. When the main agent (Antigravity) receives the "otopilot" trigger, it must immediately, without hesitation, spawn the maximum possible number of subagents to parallelize tasks, and distribute these tasks based on the capabilities of the AI models (Model Tiering).

## 2. Core Structure: The "Autopilot" Process (360° Analysis)

When a task arrives with the "otopilot" keyword, the system automatically executes the following **SWARM_OVERRIDE** process:

### Step 1: Task Fracture

The main agent (or Swarm Commander) performs a 360-degree analysis of the incoming master task and breaks it down into the smallest possible non-blocking subcomponents (nodes).

- A _separate_ subagent is designed for each independent unit/file or logical process. (The goal is maximum parallelism).

### Step 2: Model Tiering & Delegation

Subagents are not spawned randomly; they are categorized based on their roles and model tiers:

- **Nano/Micro Tasks (Flash/Free):** Simple regex replacements, JSON filling, log cleanup, or basic CLI runs are delegated to Flash-tier models.
- **Medium/Large Tasks (Pro/Sonnet):** Complex architectural refactoring, Next.js Server Actions, or intricate UI components are delegated to Pro-tier models.
- **Role Assignment:** Each subagent is assigned a distinct "Role" (e.g., CI/CD Engineer, Database Ops, Frontend Pro) to provide a clear cognitive framework.

### Step 3: Max Swarm Deployment (Parallel Execution)

The main agent spawns all identified subagents simultaneously using a single `invoke_subagent` tool call.

- During `SWARM_OVERRIDE`, the planning phase (planning_mode) is skipped entirely, as this is an explicit order to execute immediately.
- Agents run completely in parallel, utilizing `enable_write_tools` and `enable_mcp_tools` to write code to the repository.

### Step 4: Strict RAM Preservation (Auto-Kill)

- **Mandatory Kill:** Once a subagent reports completion of its assigned task, the main agent MUST immediately execute `manage_subagents(Action: "kill")` to terminate that specific subagent.
- Orphaned or idling subagents waste critical system RAM and compute. Subagents only exist to complete their fracture and die.

## 3. Enforcement (Rule Alignment)

This protocol aligns with and enforces the existing rules:

- **Rule 8 (Auto-Kill Policy):** Actively enforced at Step 4.
- **Rule 14 (Architect Guard):** Subagents are strictly instructed NOT to modify `docs/MASTER_PLAN.md`. Only the main coordinating agent (acting under Architect rules) is permitted to consolidate and write the final status updates to the master plan.
- **Rule G-7 (Completion Evidence):** The main agent verifies that the subagents have actually pushed their code, or pushes it on their behalf, before marking the issue as resolved.

## 4. Example Invocation

```json
{
  "Subagents": [
    {
      "TypeName": "swarm_commander",
      "Role": "CI/CD Fixer",
      "Prompt": "Fix .github/workflows. Do not touch MASTER_PLAN.",
      "Model": "flash"
    },
    {
      "TypeName": "swarm_commander",
      "Role": "React Pro",
      "Prompt": "Refactor prioritization-widget.tsx. Do not touch MASTER_PLAN.",
      "Model": "pro"
    }
  ]
}
```

## 5. Conclusion

This protocol provides the definitive 360-degree execution blueprint for the "otopilot" command, ensuring maximum speed, optimal model routing, and immediate resource cleanup.
