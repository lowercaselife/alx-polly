---
name: pr-writing
description: Write clear, professional PR descriptions
---

# PR Writing Skill

A good PR description helps reviewers understand changes quickly.

## Structure

### Title
- Start with type: feat:, fix:, refactor:, docs:, test:
- Keep under 50 characters
- Use imperative mood ("Add" not "Added")
- Example: "feat: add user authentication with JWT"

### What Changed
- Bullet points of main changes
- Be specific but concise
- Focus on WHAT, not HOW
- Example:
  * Added login endpoint with rate limiting
  * Implemented JWT token generation
  * Created user session management

### Why
- Business reason or motivation
- Problem being solved
- Example: "Users needed a secure way to authenticate across multiple devices"

### Notes for Reviewers
- Highlight complex areas
- Call out decisions that need discussion
- Flag potential risks
- Example:
  * Token expiry set to 24h - please review if this is appropriate
  * New dependency: jsonwebtoken library
  * Breaking change: authentication now required for /api/user

## Tone
- Professional and clear
- Not too casual, not too formal
- Focus on facts, not opinions

## Length
- Keep total description under 500 words
- Each section 2-5 bullet points maximum
