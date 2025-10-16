# AutoCrate Development Scripts

This directory contains helper scripts to streamline development workflows.

## 🚀 Quick Start

### Working on a GitHub Issue

```bash
# Method 1: Using issue number
./scripts/issue-workflow.sh 77

# Method 2: Using GitHub URL
./scripts/issue-workflow.sh https://github.com/Shivam-Bhardwaj/AutoCrate/issues/77

# Method 3: Using multi-file helper
./scripts/multi-file-helper.sh issue 77
```

This will:

- Fetch issue details from GitHub
- Create a feature branch
- Set up an issue context file
- Open relevant files for editing
- Provide quick commands for testing and PR creation

### Opening Multiple Files

```bash
# Open core files (main UI, generator, visualizer)
./scripts/multi-file-helper.sh core

# Open all UI components
./scripts/multi-file-helper.sh ui

# Open hardware-related files
./scripts/multi-file-helper.sh hardware

# Search for a pattern
./scripts/multi-file-helper.sh search "PMI"

# Find all TODOs
./scripts/multi-file-helper.sh todo

# Show project status
./scripts/multi-file-helper.sh status
```

## 📁 Scripts Overview

### issue-workflow.sh

**Purpose**: Automates the entire workflow for working on GitHub issues.

**Features**:

- Fetches issue details using GitHub CLI
- Creates appropriately named feature branches
- Generates issue context files with all relevant information
- Creates quick access scripts for returning to issues
- Handles git operations (stashing, branching, pulling)
- Provides ready-to-use commands for commits and PRs

**Requirements**:

- GitHub CLI (`gh`) installed and authenticated
- Git repository with remote configured

**Usage**:

```bash
./scripts/issue-workflow.sh [issue-number-or-url]
```

**Output**:

- `.issue-context-XX.md` - Issue details and notes
- `.issue-XX-quick.sh` - Quick access script for the issue
- Feature branch created and checked out

### multi-file-helper.sh

**Purpose**: Helps open and work with multiple related files simultaneously.

**Features**:

- Pre-defined file groups (core, ui, lib, tests, api, etc.)
- Pattern search across codebase
- Find TODO/FIXME comments
- Show recently modified files
- Project status overview
- Copies file paths to clipboard (if xclip available)

**Usage**:

```bash
./scripts/multi-file-helper.sh [command] [options]
```

**Commands**:

- `core` - Open core system files
- `ui` - Open UI components
- `lib` - Open library files
- `tests` - Open test files
- `api` - Open API routes
- `hardware` - Open hardware-related files
- `step` - Open STEP export files
- `plywood` - Open plywood optimization files
- `search` - Search for pattern
- `recent` - Show recent files
- `todo` - Find TODOs
- `status` - Show project status

### tmux-autocrate.sh

**Purpose**: Creates a tmux session with multiple panes for parallel development.

**Features**:

- 5-pane layout for different workflows
- Pre-configured windows for features, testing, monitoring
- Automatic session management

**Usage**:

```bash
./scripts/tmux-autocrate.sh
```

## 🔧 Configuration

### Setting Up GitHub CLI

If you haven't set up GitHub CLI:

```bash
# Install (Ubuntu/Debian)
sudo apt install gh

# Install (macOS)
brew install gh

# Configure authentication
gh auth login
```

### Making Scripts Available Globally

Add to your shell configuration (`~/.bashrc` or `~/.zshrc`):

```bash
# AutoCrate helpers
alias ac-issue='~/workspace/AutoCrate/scripts/issue-workflow.sh'
alias ac-files='~/workspace/AutoCrate/scripts/multi-file-helper.sh'
alias ac-tmux='~/workspace/AutoCrate/scripts/tmux-autocrate.sh'

# Quick shortcuts
alias ac-core='ac-files core'
alias ac-search='ac-files search'
alias ac-todo='ac-files todo'
alias ac-status='ac-files status'
```

Then reload your shell:

```bash
source ~/.bashrc  # or ~/.zshrc
```

## 💡 Tips

### Working on Multiple Issues

You can have multiple issue workspaces:

```bash
# Start issue 77
./scripts/issue-workflow.sh 77
# Work on it...

# Switch to issue 78
git stash
./scripts/issue-workflow.sh 78
# Work on it...

# Return to issue 77
git checkout issue-77-[branch-name]
git stash pop
./.issue-77-quick.sh
```

### Quick File Access in VS Code

The multi-file helper copies paths to clipboard. In VS Code:

1. Run: `./scripts/multi-file-helper.sh core`
2. Press `Ctrl+P` (Quick Open)
3. Paste the file paths
4. VS Code will open all files in tabs

### Combining with Editor

For Neovim users:

```bash
# Open core files in Neovim
nvim $(./scripts/multi-file-helper.sh core | tail -1)

# Open files with search results
nvim $(grep -l "PMI" src/**/*.tsx)
```

For VS Code users:

```bash
# Open core files in VS Code
code $(./scripts/multi-file-helper.sh core | tail -1)
```

## 🐛 Troubleshooting

### "gh: command not found"

Install GitHub CLI:

- Ubuntu/Debian: `sudo apt install gh`
- macOS: `brew install gh`
- Other: https://cli.github.com/

### "Permission denied"

Make scripts executable:

```bash
chmod +x scripts/*.sh
```

### Can't fetch issue details

Authenticate with GitHub:

```bash
gh auth login
```

### Scripts not finding files

Ensure you're in the project root:

```bash
cd /path/to/AutoCrate
./scripts/issue-workflow.sh 77
```

## 📝 Contributing

To add new scripts or improve existing ones:

1. Follow the existing patterns (colors, error handling, usage info)
2. Make scripts executable: `chmod +x script-name.sh`
3. Update this README with documentation
4. Test on both Linux and macOS if possible
5. Use shellcheck for validation: `shellcheck script-name.sh`

## 📄 License

These scripts are part of the AutoCrate project and follow the same license.
