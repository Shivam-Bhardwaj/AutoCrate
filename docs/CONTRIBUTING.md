# Contributing Guide - LLM AUTOMATION

**MACHINE_READABLE_METADATA**:
```json
{
  "purpose": "Complete automation workflow for LLM-driven development",
  "target_audience": "LLM_ONLY",
  "automation_level": "FULL_AUTONOMOUS",
  "human_intervention": "ZERO",
  "workflow_type": "ISSUE_TO_DEPLOYMENT",
  "last_updated": "2025-10-16"
}
```

---

## PRIMARY WORKFLOW: ISSUE → DEPLOYMENT (100% AUTOMATED)

### Input Format

```json
{
  "user_provides": "work on https://github.com/Shivam-Bhardwaj/AutoCrate/issues/N",
  "alternative": "work on issue N",
  "system_handles": "EVERYTHING_ELSE"
}
```

### Automation Sequence

```json
{
  "workflow_steps": [
    {
      "step": 1,
      "action": "fetch_issue_details",
      "command": "gh issue view N --json title,body,labels",
      "parse": ["title", "body", "labels"],
      "output": "issue_metadata"
    },
    {
      "step": 2,
      "action": "analyze_issue_type",
      "logic": {
        "if_labels_include_bug": "use_quick_fix_agent",
        "if_labels_include_enhancement": "use_feature_agent",
        "if_labels_include_3d": "use_3d_viz_agent",
        "if_labels_include_step": "use_cad_export_agent",
        "default": "analyze_body_for_keywords"
      },
      "output": "selected_agent"
    },
    {
      "step": 3,
      "action": "create_branch",
      "naming_convention": {
        "bug": "fix/issue-N-brief-description",
        "enhancement": "feature/issue-N-brief-description",
        "refactor": "refactor/issue-N-brief-description",
        "docs": "docs/issue-N-brief-description"
      },
      "command": "git checkout -b [branch_name]",
      "output": "branch_created"
    },
    {
      "step": 4,
      "action": "load_agent_context",
      "agent_registry": ".claude/agents/registry.json",
      "load_files": "agent.contextFiles[]",
      "token_budget": "agent.tokenBudget",
      "output": "context_loaded"
    },
    {
      "step": 5,
      "action": "implement_solution",
      "sub_steps": [
        "identify_files_to_modify",
        "read_relevant_tests",
        "implement_changes",
        "write_new_tests_if_needed",
        "update_existing_tests_if_needed"
      ],
      "output": "implementation_complete"
    },
    {
      "step": 6,
      "action": "run_tests",
      "command": "npm test",
      "required": "all_tests_pass",
      "if_fail": "goto_step_5_revise_implementation",
      "output": "tests_passed"
    },
    {
      "step": 7,
      "action": "run_build",
      "command": "npm run build",
      "required": "build_success",
      "if_fail": "goto_step_5_fix_build_errors",
      "output": "build_success"
    },
    {
      "step": 8,
      "action": "commit_changes",
      "command": "git add . && git commit -m [message]",
      "message_format": {
        "type": "feat|fix|refactor|docs|test|chore",
        "description": "Brief description (max 50 chars)",
        "body": "[Optional details]",
        "footer": "Closes #N\n\n🤖 Generated with Claude Code\n\nCo-Authored-By: Claude <noreply@anthropic.com>"
      },
      "output": "committed"
    },
    {
      "step": 9,
      "action": "push_to_remote",
      "command": "git push -u origin [branch_name]",
      "required": "push_success",
      "output": "pushed"
    },
    {
      "step": 10,
      "action": "create_pull_request",
      "command": "gh pr create --title [title] --body [body]",
      "title_format": "[type]: [brief description]",
      "body_format": {
        "summary": "## Summary\n[Bullet points of changes]",
        "closes": "Closes #N",
        "testing": "## Testing\n- [x] All tests pass\n- [x] Build succeeds",
        "footer": "🤖 Generated with Claude Code"
      },
      "output": "pr_created"
    },
    {
      "step": 11,
      "action": "return_pr_url",
      "output": "PR created: [URL]"
    }
  ]
}
```

---

## COMMIT MESSAGE FORMAT - MACHINE TEMPLATE

### Conventional Commits Standard

```json
{
  "format": "<type>: <description>\n\n[optional body]\n\n<footer>",
  "types": {
    "feat": "New feature",
    "fix": "Bug fix",
    "refactor": "Code refactoring (no behavior change)",
    "docs": "Documentation only",
    "test": "Adding/updating tests",
    "chore": "Maintenance tasks",
    "perf": "Performance improvement",
    "style": "Code style/formatting"
  },
  "description_rules": {
    "max_length": 50,
    "case": "lowercase",
    "no_period": true,
    "imperative_mood": true
  },
  "footer_required": {
    "issue_reference": "Closes #N",
    "attribution": "🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>"
  }
}
```

### Example Commits

```json
{
  "examples": [
    {
      "scenario": "bug_fix",
      "message": "fix: correct klimp placement calculation\n\nFixed off-by-one error in klimp spacing algorithm\nthat caused misalignment on left panel.\n\nCloses #95\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>"
    },
    {
      "scenario": "new_feature",
      "message": "feat: add panel stops to prevent collapse\n\nImplemented panel stop system:\n- Added panel-stop-calculator.ts\n- Integrated with STEP generator\n- Added 3D visualization\n- Updated tests\n\nCloses #87\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>"
    },
    {
      "scenario": "refactor",
      "message": "refactor: consolidate LLM documentation\n\nMerged 25 MD files into 8 focused docs:\n- docs/START_HERE.md (entry point)\n- docs/ARCHITECTURE.md (technical)\n- docs/AGENT_GUIDE.md (automation)\n- docs/TESTING_GUIDE.md (testing)\n- docs/CONTRIBUTING.md (workflows)\n\nCloses #N\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>"
    }
  ]
}
```

---

## VERSION MANAGEMENT - AUTOMATION

### Semantic Versioning

```json
{
  "format": "MAJOR.MINOR.PATCH",
  "rules": {
    "MAJOR": "Breaking changes",
    "MINOR": "New features (backward compatible)",
    "PATCH": "Bug fixes (backward compatible)"
  },
  "automation": {
    "patch": "npm run version:patch",
    "minor": "npm run version:minor",
    "major": "npm run version:major",
    "sync": "npm run version:sync"
  }
}
```

### Version Bump Workflow

```json
{
  "workflow": [
    {
      "step": 1,
      "determine_version_type": {
        "if_breaking_change": "major",
        "if_new_feature": "minor",
        "if_bug_fix": "patch"
      }
    },
    {
      "step": 2,
      "run_command": "npm run version:[type]",
      "updates": ["package.json", "package-lock.json"]
    },
    {
      "step": 3,
      "run_command": "npm run version:sync",
      "updates_all_version_references": true
    },
    {
      "step": 4,
      "commit": "chore: bump version to X.Y.Z",
      "tag": "vX.Y.Z"
    },
    {
      "step": 5,
      "push": "git push && git push --tags"
    }
  ]
}
```

---

## DEPLOYMENT WORKFLOW - FULL AUTOMATION

### Deployment Triggers

```json
{
  "auto_deploy_on": {
    "trigger_1": {
      "event": "merge_to_main",
      "action": "vercel_deploy",
      "automatic": true
    },
    "trigger_2": {
      "event": "manual_deploy_command",
      "command": "/deploy",
      "workflow": [
        "run_tests",
        "bump_version",
        "commit_version",
        "push_to_main",
        "vercel_deploys_automatically"
      ]
    }
  }
}
```

### Deployment Checklist (AUTOMATED)

```json
{
  "pre_deployment_checks": [
    {
      "check": "all_tests_pass",
      "command": "npm test",
      "blocking": true
    },
    {
      "check": "build_succeeds",
      "command": "npm run build",
      "blocking": true
    },
    {
      "check": "no_typescript_errors",
      "command": "npm run type-check",
      "blocking": true
    },
    {
      "check": "no_uncommitted_changes",
      "command": "git status --porcelain",
      "blocking": true
    },
    {
      "check": "on_correct_branch",
      "allowed": ["main", "master"],
      "blocking": true
    }
  ],
  "post_deployment": [
    {
      "action": "verify_deployment",
      "check_url": "https://autocrate.vercel.app",
      "expect": "200_OK"
    },
    {
      "action": "update_changelog",
      "file": "CHANGELOG.md",
      "format": "## [X.Y.Z] - YYYY-MM-DD\n### [Type]\n- [Description]"
    }
  ]
}
```

---

## BRANCH STRATEGY - AUTOMATION

### Branch Naming Convention

```json
{
  "patterns": {
    "feature": "feature/issue-N-brief-description",
    "bugfix": "fix/issue-N-brief-description",
    "hotfix": "hotfix/issue-N-brief-description",
    "refactor": "refactor/description",
    "docs": "docs/description"
  },
  "rules": {
    "lowercase": true,
    "use_hyphens": true,
    "include_issue_number": "when_applicable",
    "max_length": 50
  }
}
```

### Branch Lifecycle

```json
{
  "lifecycle": [
    {
      "step": "create",
      "from": "main",
      "command": "git checkout -b [type]/issue-N-description"
    },
    {
      "step": "implement",
      "commits": "multiple_atomic_commits_allowed"
    },
    {
      "step": "push",
      "command": "git push -u origin [branch_name]"
    },
    {
      "step": "pr",
      "command": "gh pr create --title [title] --body [body]"
    },
    {
      "step": "review",
      "automated": false,
      "human_reviews": "optional"
    },
    {
      "step": "merge",
      "method": "squash_and_merge",
      "delete_branch_after": true
    }
  ]
}
```

---

## CODE REVIEW - AUTOMATED CHECKS

### Pre-PR Validation

```json
{
  "automated_checks": [
    {
      "check": "lint",
      "command": "npm run lint",
      "auto_fix": "npm run lint -- --fix",
      "blocking": true
    },
    {
      "check": "format",
      "command": "prettier --check .",
      "auto_fix": "prettier --write .",
      "blocking": true
    },
    {
      "check": "type_safety",
      "command": "npm run type-check",
      "auto_fix": false,
      "blocking": true
    },
    {
      "check": "tests",
      "command": "npm test",
      "auto_fix": false,
      "blocking": true
    },
    {
      "check": "build",
      "command": "npm run build",
      "auto_fix": false,
      "blocking": true
    }
  ]
}
```

### PR Description Template

```json
{
  "template": {
    "title": "[type]: [brief description]",
    "body": {
      "summary": "## Summary\n[Bullet points]\n- What was changed\n- Why it was changed\n- How it was implemented",
      "issue_link": "Closes #N",
      "testing": "## Testing\n- [x] All tests pass\n- [x] Build succeeds\n- [x] Manual testing completed",
      "checklist": "## Checklist\n- [x] Code follows style guidelines\n- [x] Tests added/updated\n- [x] Documentation updated\n- [x] No breaking changes",
      "footer": "🤖 Generated with [Claude Code](https://claude.com/claude-code)"
    }
  }
}
```

---

## FILE MODIFICATION PATTERNS - LLM GUIDE

### Always Use Existing Files

```json
{
  "priority": "EDIT_OVER_CREATE",
  "rules": {
    "before_creating_file": [
      "search_for_similar_existing_file",
      "check_if_functionality_exists_elsewhere",
      "verify_new_file_is_absolutely_necessary"
    ],
    "when_editing": [
      "read_file_first",
      "understand_existing_patterns",
      "maintain_consistency",
      "update_tests"
    ]
  }
}
```

### Edit vs Write Decision Tree

```json
{
  "decision_tree": {
    "does_file_exist": {
      "yes": {
        "action": "use_edit_tool",
        "read_first": true
      },
      "no": {
        "is_new_file_necessary": {
          "yes": {
            "action": "use_write_tool",
            "check_similar_files_first": true
          },
          "no": {
            "action": "edit_existing_file_instead"
          }
        }
      }
    }
  }
}
```

---

## ERROR HANDLING - AUTOMATION

### Pre-commit Hook Failures

```json
{
  "failure_scenarios": {
    "typescript_errors": {
      "fix": "Read error output, fix type issues, retry commit",
      "command": "npm run type-check"
    },
    "test_failures": {
      "fix": "Read test output, fix failing tests, retry commit",
      "command": "npm test -- [failed-test].test.ts"
    },
    "lint_errors": {
      "fix": "npm run lint -- --fix",
      "auto_fixable": true
    },
    "format_errors": {
      "fix": "prettier --write [file]",
      "auto_fixable": true
    }
  }
}
```

### Build Failures

```json
{
  "build_error_handling": {
    "analyze_error": {
      "parse_output": "npm run build 2>&1",
      "extract": ["error_type", "file_path", "line_number"]
    },
    "common_errors": {
      "typescript_error": {
        "fix": "Fix type issue at file:line",
        "command": "npm run type-check"
      },
      "import_error": {
        "fix": "Check import path, verify file exists",
        "verify": "ls [import-path]"
      },
      "dependency_error": {
        "fix": "npm install",
        "verify": "check package.json"
      }
    }
  }
}
```

---

## ISSUE LABELING - FOR AGENT ROUTING

### Label → Agent Mapping

```json
{
  "label_to_agent": {
    "bug": {
      "scope_small": "quick-fix",
      "scope_large": "feature"
    },
    "enhancement": "feature",
    "3d": "3d-viz",
    "step": "cad-export",
    "nx": "nx",
    "ui": "ui",
    "testing": "testing",
    "hardware": "hardware",
    "lumber": "lumber",
    "scenario": "scenario",
    "docs": "review",
    "deployment": "deployment"
  },
  "keyword_to_agent": {
    "visualization|3d|three.js": "3d-viz",
    "step file|export|cad": "cad-export",
    "nx expression|parametric": "nx",
    "klimp|fastener|hardware": "hardware",
    "lumber|2x6|4x4|material": "lumber",
    "test|jest|playwright": "testing",
    "ui|button|form|component": "ui"
  }
}
```

---

## QUICK REFERENCE - EXACT COMMANDS

### Daily Commands

```bash
# Development
npm run dev                      # Start dev server
npm run build                    # Production build
npm run lint                     # ESLint
npm run type-check              # TypeScript

# Testing
npm test                         # All Jest tests
npm run test:coverage           # With coverage
npm run test:e2e                # Playwright E2E
npm run test:all                # Complete suite

# Version Management
npm run version:patch           # Bug fix: 13.1.0 → 13.1.1
npm run version:minor           # Feature: 13.1.0 → 13.2.0
npm run version:major           # Breaking: 13.1.0 → 14.0.0
npm run version:sync            # Sync version across files

# Git Operations
git status                       # Check status
git add .                        # Stage all
git commit -m "..."             # Commit
git push                         # Push
gh pr create                     # Create PR
gh issue view N                  # View issue
```

### Automation Commands

```bash
# Complete workflow automation
"work on issue N"                # LLM handles everything

# Slash commands
/test                            # Run tests
/verify                          # Health check
/build                           # Build verification
/deploy                          # Version bump + deploy
/feature                         # Feature workflow
/quick-fix                       # Bug fix workflow
```

---

## AUTOMATION MANIFEST - COMPLETE PIPELINE

```json
{
  "full_automation_pipeline": {
    "input": "work on issue N",
    "steps": [
      "fetch_issue_details",
      "select_agent_based_on_labels",
      "create_feature_branch",
      "load_agent_context",
      "implement_solution",
      "write_tests",
      "run_test_suite",
      "run_build",
      "commit_with_message",
      "push_to_remote",
      "create_pull_request",
      "return_pr_url"
    ],
    "output": "PR created and ready for deployment",
    "human_intervention": "ZERO",
    "automation_level": "100%"
  }
}
```

---

## CRITICAL RULES - NEVER VIOLATE

```json
{
  "absolute_rules": [
    {
      "rule": "NEVER commit without tests passing",
      "enforcement": "pre_commit_hook",
      "exception": "NONE"
    },
    {
      "rule": "NEVER push without build succeeding",
      "enforcement": "pre_push_hook",
      "exception": "NONE"
    },
    {
      "rule": "NEVER force push to main/master",
      "enforcement": "git_protection",
      "exception": "NONE"
    },
    {
      "rule": "ALWAYS use conventional commit format",
      "enforcement": "commit_message_validation",
      "exception": "NONE"
    },
    {
      "rule": "ALWAYS close issue in commit footer",
      "enforcement": "commit_template",
      "exception": "NONE"
    },
    {
      "rule": "ALWAYS run full test suite before PR",
      "enforcement": "automation_workflow",
      "exception": "NONE"
    },
    {
      "rule": "ALWAYS prefer Edit over Write for existing files",
      "enforcement": "llm_workflow",
      "exception": "NONE"
    },
    {
      "rule": "NEVER skip pre-commit hooks",
      "enforcement": "husky",
      "exception": "NONE"
    }
  ]
}
```

---

## See Also

- **docs/START_HERE.md** - LLM entry point
- **docs/AGENT_GUIDE.md** - Agent system details
- **docs/ARCHITECTURE.md** - Technical architecture
- **docs/TESTING_GUIDE.md** - Testing automation
- **.claude/agents/registry.json** - Agent definitions
- **CHANGELOG.md** - Version history
