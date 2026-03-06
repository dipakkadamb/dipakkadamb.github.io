---
title: "[Scenario Title]"
description: "Brief 1-2 sentence description of this scenario."
author: "[Author Name or Team]"
date: YYYY-MM-DD
tags: [tag1, tag2, tag3]
category: "[Category Name]"
version: "1.0"
difficulty: "[Beginner/Intermediate/Advanced]"
---

# Overview
[Executive summary of the scenario. What was the core problem and the proposed solution? Why was this project initiated?]

## Client Requirement
[Detail the specific business and technical requirements the client presented. Example: Need to upgrade OS to comply with new security audits.]

## Environment Details
*   **Source Environment:** [e.g., Windows Server 2012 R2, physical hardware, 32GB RAM]
*   **Destination Environment:** [e.g., Windows Server 2025, VMware vSphere 8 VMs]
*   **Network constraints:** [e.g., Air-gapped, segmented VLANs, Site-to-Site VPN]
*   **Key Services/Roles:** [e.g., Active Directory, File Services, IIS, SQL Server]

## Architecture Diagram
*(Insert diagram here - e.g., Mermaid diagram code block or standard image link)*
```mermaid
graph TD;
    [Replace this with actual architecture diagram if applicable]
```

## Pre-Migration Checklist
- [ ] List prerequisite 1 (e.g., verified bare-metal backups)
- [ ] List prerequisite 2 (e.g., acquired licensing keys)
- [ ] List prerequisite 3 (e.g., downtime window approved by stakeholders)

## Step-by-Step Implementation

### Phase 1: Preparation
1. [Step one details...]
2. [Step two details...]

### Phase 2: Execution
1. [Step one details...]
2. [Step two details...]

### Phase 3: Post-Migration
1. [Step one details...]
2. [Step two details...]

## Commands / Scripts Used

```powershell
# Describe exactly what this script/command achieves before the block
Invoke-Command -ScriptBlock { Example-Command }
```

## Issues Encountered
| Issue | Trigger/Symptom | Impact |
| :--- | :--- | :--- |
| [Briefly describe issue] | [What caused it or how it presented] | High/Medium/Low |

### Resolution Steps
*   **Issue 1:** [Detailed steps on how it was tracked down and solved]

## Validation / Testing
[How did we prove the environment is stable? e.g., "Ran dcdiag, verified DNS replication, tested client login from VDI, confirmed file share access..."]

## Final Outcome
[What was the result for the client? e.g., "Successfully migrated without unexpected downtime. Increased server performance by 20% and achieved compliance."]

## Lessons Learned
[What should the team do differently next time? What surprised us? Was any tooling particularly helpful or unhelpful?]

## References
*   [Link 1 Title](https://example.com)
*   [Link 2 Title](https://example.com)
