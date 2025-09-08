const fs = require('fs');
const path = require('path');

// Read changelog
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const changelog = fs.readFileSync(changelogPath, 'utf-8');

// Extract the latest unreleased changes
const unreleasedMatch = changelog.match(/## \[Unreleased\]([\s\S]*?)(?=## \[|$)/);
const latestChanges = unreleasedMatch ? unreleasedMatch[1].trim() : 'No unreleased changes';

// Read TODO items (you can customize this path)
const todoPath = path.join(__dirname, '..', 'TODO.md');
let todoContent = '';
if (fs.existsSync(todoPath)) {
  todoContent = fs.readFileSync(todoPath, 'utf-8');
}

// Generate email content
const today = new Date().toISOString().split('T')[0];
const emailContent = `
Subject: Re: AutoCrate Updates - Official Communication Thread

Hello Team,

Here's the latest update for AutoCrate:

## Recent Changes

${latestChanges}

## TODO Items

${todoContent || '- No current TODO items'}

## Notes

Please review the changes and provide feedback.

Best regards,
[Your Name]

---

Generated from CHANGELOG.md on ${today}
`;

// Save email content
const outputPath = path.join(__dirname, '..', 'docs', 'emails', `update-${today}.txt`);
fs.writeFileSync(outputPath, emailContent);

console.log(`Email content generated at: ${outputPath}`);
console.log('\n--- EMAIL CONTENT ---');
console.log(emailContent);
