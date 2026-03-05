---
name: code-exploration
description: Explore and summarize code changes effectively
---

# Code Exploration Skill

When exploring code changes, be systematic and thorough.

## Finding Changes

1. Use git to find recently modified files
2. Look for new files created
3. Identify deleted files
4. Check for moved/renamed files

## Analyzing Each File

For each changed file, note:

### Purpose
- What does this file do?
- What is its role in the system?

### Changes Made
- What was added?
- What was removed?
- What was modified?

### Impact
- Does this affect other files?
- Are there new dependencies?
- Does it change public APIs?

## Patterns to Notice

- Multiple files changing together (related changes)
- New directories (architectural changes)
- Configuration changes (deployment impact)
- Test file changes (what's being tested)

## Output Format

**Files Changed**: [count]

**New Files**:
- path/to/file.js - Purpose: [what it does]

**Modified Files**:
- path/to/file.js - Changes: [summary of changes]

**Patterns Observed**:
- [Any notable patterns or relationships]

**Potential Impact**:
- [Areas of codebase that might be affected]