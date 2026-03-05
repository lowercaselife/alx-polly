---
name: code-review
description: Systematic code review checklist
license: MIT
---

# Code Review Skill

When reviewing code, check these areas systematically:

## 1. Logic & Functionality
- Does the code do what it's supposed to?
- Are there edge cases not handled?
- Is there proper error handling?

## 2. Security
- SQL injection vulnerabilities
- XSS attacks
- Hardcoded credentials or secrets
- Unvalidated user input

## 3. Performance
- N+1 query problems
- Unnecessary loops or iterations
- Missing database indexes
- Memory leaks

## 4. Code Quality
- Clear variable and function names
- Appropriate comments (not too many, not too few)
- DRY principle (Don't Repeat Yourself)
- Function size (max 50 lines recommended)

## 5. Testing
- Are there tests for new functionality?
- Do tests cover edge cases?
- Are error scenarios tested?

## Output Format

Provide findings as:

**File: [filename]**
- Line X: [Issue type] - [Description]
- Line Y: [Issue type] - [Description]

**Summary**: [Overall assessment]
**Critical**: [Must fix before merging]
**Suggestions**: [Nice to have improvements]