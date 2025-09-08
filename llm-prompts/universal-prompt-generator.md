# Universal LLM Prompt Generator System

## Workflow: Vision LLM → Code LLM
1. **Vision LLM** (Claude/Gemini) - Sees screenshots, analyzes issues, generates detailed prompts
2. **Code LLM** (Cheaper models) - Receives detailed prompts, writes code, runs tests

## Universal Command for Any Project

Copy this into **any Claude or Gemini conversation** with your screenshot:

```
You are my LLM prompt generator. I will provide a bug/issue screenshot and project context. Generate a detailed, self-contained prompt for a lightweight coding LLM.

**PROJECT CONTEXT:**
- Name: [Project name]
- Tech Stack: [Languages, frameworks, libraries]
- File locations: [Which files need changes]
- Coding standards: [Style guide, conventions]

**ISSUE:** [Describe what you want fixed/implemented]

**SCREENSHOT:** [Attach your image]

Generate a comprehensive prompt that includes:
1. Problem statement (what's wrong)
2. Visual description (detailed - the coding LLM can't see images)
3. Technical context (files, tech stack, conventions)
4. Current vs expected behavior
5. Specific requirements
6. SPECIFIC FILE CHANGES - Identify exactly which files to modify and what changes are needed in each file
7. Code constraints and standards
8. Success criteria
9. Any relevant code patterns

CRITICAL: Include a "FILE CHANGES" section that specifies:
- Exact file paths to modify
- What specific changes are needed in each file
- Which functions/components to update
- Any new files that need to be created (if any)

This ensures the coding LLM only touches the necessary files and knows exactly what to change where. Make it detailed enough that a coding LLM can implement the fix without seeing the screenshot.
```

## Project-Specific Templates

### For React/Next.js Projects
```
**PROJECT CONTEXT:**
- Name: [Your project]
- Tech Stack: Next.js 14, TypeScript, React, Tailwind CSS
- File locations: src/components/, src/pages/
- Coding standards: TypeScript strict, 2-space indent, single quotes

**ISSUE:** [Your issue]
**SCREENSHOT:** [Attach image]
```

### For Node.js/Backend Projects  
```
**PROJECT CONTEXT:**
- Name: [Your project]
- Tech Stack: Node.js, Express, TypeScript, MongoDB
- File locations: src/routes/, src/models/, src/controllers/
- Coding standards: ESLint, Prettier, async/await preferred

**ISSUE:** [Your issue]
**SCREENSHOT:** [Attach image]
```

### For Python Projects
```
**PROJECT CONTEXT:**
- Name: [Your project]  
- Tech Stack: Python 3.11, FastAPI, SQLAlchemy, Pytest
- File locations: app/, tests/, models/
- Coding standards: PEP 8, type hints, docstrings required

**ISSUE:** [Your issue]
**SCREENSHOT:** [Attach image]
```

## How to Use

### Step 1: Vision LLM (Claude/Gemini)
1. Open new conversation with Claude or Gemini
2. Paste the universal command above
3. Fill in your project context
4. Attach your screenshot
5. Describe the issue
6. Get detailed prompt back

### Step 2: Code LLM (Cheaper model)
1. Copy the generated prompt
2. Paste into cheaper LLM (GPT-3.5, Claude Haiku, etc.)
3. LLM writes code based on detailed description
4. Test and iterate as needed

## Example Output Format
The vision LLM will generate something like:
```
PROMPT FOR CODING LLM - [ISSUE TITLE]

=== PROBLEM STATEMENT ===
[Clear issue description]

=== VISUAL DESCRIPTION ===  
[Detailed description of what's shown in screenshot since coding LLM can't see it]

=== TECHNICAL CONTEXT ===
Project: [Name]
Tech Stack: [Details]
Files: [Locations]
Standards: [Conventions]

=== REQUIREMENTS ===
1. [Specific task 1]
2. [Specific task 2]

[... full structured prompt]
```

## Benefits
- **Cost Efficient**: Use expensive vision models only for analysis
- **Scalable**: Works with any project/tech stack
- **Consistent**: Structured format works well with coding LLMs  
- **Universal**: Same system across all your projects
- **Quality**: Vision LLMs provide better context than manual descriptions

## Quick Reference Card
**Vision LLM Role**: Screenshot analyzer & prompt generator
**Coding LLM Role**: Code implementer & tester
**Key**: Detailed visual descriptions bridge the gap between seeing and coding