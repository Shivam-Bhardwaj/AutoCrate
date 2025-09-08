# Claude Prompt Generator Command

## Quick Command for Claude
Copy and paste this into any Claude conversation to generate structured prompts:

```
Create a detailed LLM prompt for this issue:

**Problem:** [Describe the bug/issue/task]
**Current Behavior:** [What's happening now - be very detailed since LLM won't see screenshots]
**Expected Behavior:** [What should happen instead]
**Component/File:** [Which files are affected]
**Tech Context:** [Framework, libraries, etc.]
**Requirements:** [Specific tasks to accomplish]

Format it as a comprehensive prompt file that includes problem statement, technical context, current/expected behavior, requirements, constraints, code context, success criteria, and additional notes. Make it self-contained for a lightweight LLM.
```

## Usage Instructions

### Method 1: Interactive Script
```bash
# Navigate to project folder
cd llm-prompts
node prompt-generator.js
```

### Method 2: Windows Batch
```cmd
# Double-click or run:
generate-prompt.bat
```

### Method 3: Copy Template and Fill
1. Copy `example-template.txt`
2. Fill in the sections with your specific issue details
3. Save as new file with descriptive name

### Method 4: Claude Command (Any Project)
Use the command above in any Claude conversation - just fill in the bracketed sections with your specific details.

## File Naming Convention
- `bug-[component]-[description]-[timestamp].txt`
- `feature-[name]-[description]-[timestamp].txt`
- `refactor-[component]-[purpose]-[timestamp].txt`

## Tips for Better Prompts
1. **Be Visual** - Describe UI issues in detail since LLM can't see screenshots
2. **Include Context** - Add relevant code snippets or file structure
3. **Be Specific** - Clear requirements and success criteria
4. **Add Constraints** - Project conventions, coding standards, limitations
5. **Self-Contained** - All necessary information in one prompt