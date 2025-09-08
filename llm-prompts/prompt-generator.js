#!/usr/bin/env node
/**
 * LLM Prompt Generator Script
 * Generates structured prompts for lightweight LLMs based on bug reports or issues
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function getCurrentDateTime() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

function sanitizeFileName(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

async function generatePrompt() {
  console.log('\n=== LLM Prompt Generator ===\n');
  
  // Gather information
  const projectName = await askQuestion('Project name (default: AutoCrate): ') || 'AutoCrate';
  const techStack = await askQuestion('Tech stack (default: Next.js 14, TypeScript, Three.js): ') || 'Next.js 14, TypeScript, Three.js';
  const issueType = await askQuestion('Issue type (bug/feature/refactor/test): ');
  const component = await askQuestion('Component/file affected: ');
  const problemStatement = await askQuestion('Problem description: ');
  const currentBehavior = await askQuestion('Current behavior (detailed): ');
  const expectedBehavior = await askQuestion('Expected behavior: ');
  const requirements = await askQuestion('Requirements (comma-separated): ');
  const constraints = await askQuestion('Additional constraints: ');
  const codeContext = await askQuestion('Relevant code context (optional): ');
  
  // Generate filename
  const sanitizedProblem = sanitizeFileName(problemStatement);
  const fileName = `${issueType}-${sanitizedProblem}-${getCurrentDateTime()}.txt`;
  
  // Create prompt content
  const promptContent = `PROMPT FOR LIGHTWEIGHT LLM - ${problemStatement.toUpperCase()}

=== PROBLEM STATEMENT ===
${problemStatement}

=== TECHNICAL CONTEXT ===
Project: ${projectName}
Tech Stack: ${techStack}
File Location: ${component}
Related Components: ${component}

=== CURRENT BEHAVIOR ===
${currentBehavior}

=== EXPECTED BEHAVIOR ===
${expectedBehavior}

=== REQUIREMENTS ===
${requirements.split(',').map((req, i) => `${i + 1}. ${req.trim()}`).join('\n')}

=== CONSTRAINTS ===
- Follow existing code patterns and conventions
- Maintain TypeScript type safety
- No hardcoded values
- Use underscore prefix for unused variables
- 2-space indentation, single quotes, semicolons required
${constraints ? `- ${constraints}` : ''}

=== CODE CONTEXT ===
${codeContext || '[No specific code context provided]'}

=== SUCCESS CRITERIA ===
- [ ] Primary functionality implemented
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code follows project conventions
- [ ] All requirements met

=== ADDITIONAL NOTES ===
[Add any specific implementation details, gotchas, or references here]
`;

  // Save the file
  const promptsDir = './llm-prompts';
  if (!fs.existsSync(promptsDir)) {
    fs.mkdirSync(promptsDir);
  }
  
  const filePath = path.join(promptsDir, fileName);
  fs.writeFileSync(filePath, promptContent);
  
  console.log(`\n✅ Prompt generated successfully!`);
  console.log(`📁 File: ${filePath}`);
  console.log(`📝 Ready to use with lightweight LLM\n`);
  
  rl.close();
}

// Error handling
process.on('SIGINT', () => {
  console.log('\n\n👋 Prompt generation cancelled');
  rl.close();
  process.exit(0);
});

// Run the generator
generatePrompt().catch(console.error);