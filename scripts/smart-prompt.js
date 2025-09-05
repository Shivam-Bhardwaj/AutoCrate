#!/usr/bin/env node

/**
 * Smart Prompt Handler
 * Routes prompts to appropriate LLMs and manages parallel changes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const CHANGES_FILE = path.join(process.cwd(), 'changes.json');
const PROMPTS_DIR = path.join(process.cwd(), '.prompts');

// Ensure prompts directory exists
if (!fs.existsSync(PROMPTS_DIR)) {
  fs.mkdirSync(PROMPTS_DIR, { recursive: true });
}

// Categorize prompt
function categorizePrompt(prompt) {
  const docKeywords = [
    'document',
    'readme',
    'changelog',
    'guide',
    'tutorial',
    'explain',
    'description',
  ];
  const codeKeywords = [
    'implement',
    'fix',
    'refactor',
    'add',
    'create',
    'update',
    'modify',
    'bug',
    'feature',
  ];

  const lowerPrompt = prompt.toLowerCase();

  // Check for documentation keywords
  const isDoc = docKeywords.some((keyword) => lowerPrompt.includes(keyword));
  const isCode = codeKeywords.some((keyword) => lowerPrompt.includes(keyword));

  if (isDoc && !isCode) return 'documentation';
  if (isCode && !isDoc) return 'code';
  if (isDoc && isCode) return 'mixed';

  return 'code'; // Default to code
}

// Parse multiple prompts from input
function parsePrompts(input) {
  // Support multiple prompts separated by "---" or numbered list
  const prompts = [];

  // Check for separator-based format
  if (input.includes('---')) {
    const parts = input
      .split('---')
      .map((p) => p.trim())
      .filter((p) => p);
    prompts.push(...parts);
  }
  // Check for numbered list format
  else if (/^\d+[\.\)]\s/m.test(input)) {
    const matches = input.match(/\d+[\.\)]\s+[^\n]+/g);
    if (matches) {
      prompts.push(...matches.map((m) => m.replace(/^\d+[\.\)]\s+/, '')));
    }
  }
  // Single prompt
  else {
    prompts.push(input.trim());
  }

  return prompts.map((prompt) => ({
    text: prompt,
    type: categorizePrompt(prompt),
    title: prompt.slice(0, 50).replace(/[^a-zA-Z0-9\s]/g, ''),
    timestamp: Date.now(),
  }));
}

// Save prompt to file for processing
function savePrompt(prompt) {
  const filename = `${prompt.timestamp}-${prompt.type}.txt`;
  const filepath = path.join(PROMPTS_DIR, filename);

  const content = {
    prompt: prompt.text,
    type: prompt.type,
    title: prompt.title,
    created: new Date().toISOString(),
  };

  fs.writeFileSync(filepath, JSON.stringify(content, null, 2));
  return filepath;
}

// Queue change for processing
function queueChange(prompt) {
  const data = JSON.parse(fs.readFileSync(CHANGES_FILE, 'utf8'));

  data.queue.push({
    id: prompt.timestamp,
    title: prompt.title,
    description: prompt.text,
    type: prompt.type,
    created: new Date().toISOString(),
  });

  fs.writeFileSync(CHANGES_FILE, JSON.stringify(data, null, 2));
}

// Process prompts intelligently
async function processPrompts(prompts) {
  console.log(`\nProcessing ${prompts.length} prompt(s)...`);

  const codePrompts = prompts.filter((p) => p.type === 'code');
  const docPrompts = prompts.filter((p) => p.type === 'documentation');
  const mixedPrompts = prompts.filter((p) => p.type === 'mixed');

  // Handle mixed prompts by splitting them
  for (const mixed of mixedPrompts) {
    console.log(`Splitting mixed prompt: "${mixed.title}"`);
    // Create code version
    codePrompts.push({
      ...mixed,
      type: 'code',
      text: `CODE ONLY: ${mixed.text}`,
    });
    // Create doc version
    docPrompts.push({
      ...mixed,
      type: 'documentation',
      text: `DOCUMENTATION ONLY: ${mixed.text}`,
    });
  }

  // Process documentation with Gemini (can run in parallel)
  if (docPrompts.length > 0) {
    console.log(`\nRouting ${docPrompts.length} documentation task(s) to Gemini...`);
    for (const prompt of docPrompts) {
      savePrompt(prompt);
      queueChange(prompt);

      // Start Gemini processing in background
      const geminiCmd = `gemini "${prompt.text}" > "${PROMPTS_DIR}/${prompt.timestamp}-result.md" 2>&1 &`;
      try {
        execSync(geminiCmd, { shell: true });
        console.log(`  - Gemini processing: "${prompt.title}"`);
      } catch (error) {
        console.error(`  - Failed to start Gemini: ${error.message}`);
      }
    }
  }

  // Process code with Claude (current context)
  if (codePrompts.length > 0) {
    console.log(`\nRouting ${codePrompts.length} code task(s) to Claude...`);
    for (const prompt of codePrompts) {
      savePrompt(prompt);
      queueChange(prompt);
      console.log(`  - Claude will handle: "${prompt.title}"`);
    }

    // Create consolidated prompt for Claude
    if (codePrompts.length === 1) {
      console.log(`\nClaude prompt:\n${codePrompts[0].text}`);
    } else {
      console.log('\nClaude consolidated prompt:');
      codePrompts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.text}`);
      });
    }
  }

  // Start automatic processing
  console.log('\nStarting automatic processing...');
  execSync('node scripts/process-changes.js process', { stdio: 'inherit' });
}

// Interactive mode
async function interactive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n=== Smart Prompt Handler ===');
  console.log('Enter your changes (separate multiple with "---" or use numbered list)');
  console.log('Press Ctrl+D when done, or type "exit" to quit\n');

  let input = '';

  rl.on('line', (line) => {
    if (line.toLowerCase() === 'exit') {
      rl.close();
      return;
    }
    input += line + '\n';
  });

  rl.on('close', () => {
    if (input.trim()) {
      const prompts = parsePrompts(input);
      processPrompts(prompts);
    }
  });
}

// CLI interface
const args = process.argv.slice(2);

if (args.length === 0) {
  interactive();
} else {
  const input = args.join(' ');
  const prompts = parsePrompts(input);
  processPrompts(prompts);
}
