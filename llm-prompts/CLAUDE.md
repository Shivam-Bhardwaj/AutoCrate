# LLM Prompts Collection

## Purpose
This folder contains well-structured, detailed prompts designed for lightweight LLMs to handle specific development tasks, bug fixes, and technical challenges.

## Organization
- Each prompt is stored as a separate `.txt` file
- Filenames use descriptive naming: `bug-type-description.txt`
- Prompts include complete context, requirements, and success criteria
- Templates for common prompt patterns are available

## Prompt Structure
Each prompt should include:
1. **Problem Statement** - Clear description of the issue
2. **Technical Context** - Relevant codebase information, tech stack, conventions
3. **Requirements** - Specific tasks to accomplish
4. **Constraints** - Limitations or rules to follow
5. **Success Criteria** - How to determine if the task is complete
6. **Examples** - Code patterns or expected outputs when relevant

## Usage
1. Identify the bug/issue/task
2. Create a new `.txt` file with descriptive name
3. Use the structured format to create comprehensive prompt
4. Test prompt with lightweight LLM
5. Refine as needed

## File Naming Convention
- `bug-[component]-[description].txt` - For bug fixes
- `feature-[name]-[description].txt` - For new features  
- `refactor-[component]-[purpose].txt` - For code refactoring
- `test-[type]-[description].txt` - For testing tasks
- `fix-[issue-type]-[description].txt` - For general fixes

## Notes
- Prompts should be self-contained and include all necessary context
- Avoid referencing external files unless absolutely necessary
- Keep language clear and specific for lightweight LLMs
- Include relevant code snippets or patterns when helpful