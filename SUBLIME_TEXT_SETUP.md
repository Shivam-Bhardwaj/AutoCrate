# Sublime Text Setup Guide for AutoCrate Web Development

## Installation

1. Download Sublime Text from https://www.sublimetext.com/
2. Run the installer and follow the installation wizard
3. Choose "Add to explorer context menu" during installation

## User Settings Configuration

To apply these settings:
1. Open Sublime Text
2. Press `Ctrl+,` (comma) to open Settings
3. Replace everything in the right panel (User settings) with the following:

```json
{
  "font_face": "Consolas",
  "font_size": 12,
  "line_padding_top": 2,
  "line_padding_bottom": 2,
  "sidebar_size": 14,
  "theme": "Adaptive.sublime-theme",
  "color_scheme": "Monokai.sublime-color-scheme",
  "tab_size": 2,
  "translate_tabs_to_spaces": true,
  "detect_indentation": true,
  "trim_automatic_white_space": true,
  "word_wrap": false,
  "auto_complete": true,
  "auto_complete_commit_on_tab": true,
  "auto_complete_with_fields": true,
  "auto_match_enabled": true,
  "highlight_line": true,
  "draw_white_space": "selection",
  "show_encoding": true,
  "show_line_endings": true,
  "scroll_past_end": true,
  "ensure_newline_at_eof_on_save": true,
  "atomic_save": false,
  "reload_on_change": true,
  "close_windows_when_empty": false,
  "index_files": true,
  "folder_exclude_patterns": [
    ".git",
    "node_modules",
    ".next",
    "build",
    "dist",
    "__pycache__",
    ".pytest_cache"
  ],
  "file_exclude_patterns": [
    "*.pyc",
    "*.pyo",
    "*.exe",
    "*.dll",
    "*.obj",
    "*.o",
    "*.a",
    "*.lib",
    "*.so",
    "*.dylib",
    "*.ncb",
    "*.sdf",
    "*.suo",
    "*.pdb",
    "*.idb",
    ".DS_Store",
    "*.class",
    "*.psd",
    "*.db",
    "*.sublime-workspace"
  ],
  "jsx_quote_style": "double",
  "auto_complete_triggers": [
    {
      "selector": "text.html, text.xml, meta.jsx, meta.tsx",
      "characters": "<"
    },
    {
      "selector": "source.ts, source.tsx, source.js, source.jsx",
      "characters": "."
    }
  ],
  "find_panel_location": "below",
  "show_minimap": true,
  "show_status_bar": true
}
```

## Installing Package Control

### Method 1: Manual Installation (Recommended if automatic fails)

1. Download Package Control manually:
   - Go to https://packagecontrol.io/Package%20Control.sublime-package
   - Save the file to your desktop

2. Install it manually:
   - Navigate to: `C:\\Users\\%USERNAME%\\AppData\\Roaming\\Sublime Text\\Installed Packages\\`
   - Copy the downloaded `Package Control.sublime-package` file to this folder
   - Restart Sublime Text

### Method 2: Command Palette (If the above doesn't work)

1. Press `Ctrl+Shift+P` to open Command Palette
2. Type "Install Package Control"
3. Select "Package Control: Install Package Control"

## Recommended Packages

After installing Package Control, install these packages:

1. Press `Ctrl+Shift+P`
2. Type "Package Control: Install Package"
3. Install these packages (one by one):
   - Emmet
   - GitGutter
   - SideBarEnhancements
   - Babel
   - TypeScript
   - BracketHighlighter
   - ColorHighlighter
   - EditorConfig

## Syntax-Specific Settings

For TypeScript/TSX files:
1. Open a .tsx file
2. Go to Preferences → Settings - Syntax Specific
3. Add this configuration:

```json
{
  "tab_size": 2,
  "translate_tabs_to_spaces": true,
  "detect_indentation": false,
  "trim_automatic_white_space": true,
  "word_wrap": false,
  "auto_complete_triggers": [
    {
      "selector": "text.html, text.xml, meta.jsx, meta.tsx",
      "characters": "<"
    },
    {
      "selector": "source.ts, source.tsx, source.js, source.jsx",
      "characters": "."
    }
  ]
}
```

## Key Bindings

Add these useful key bindings:
1. Go to Preferences → Key Bindings
2. Add to User key bindings:

```json
[
  { "keys": ["ctrl+shift+r"], "command": "reveal_in_side_bar" },
  { "keys": ["f12"], "command": "goto_definition" },
  { "keys": ["shift+f12"], "command": "find_references" },
  { "keys": ["alt+up"], "command": "swap_line_up" },
  { "keys": ["alt+down"], "command": "swap_line_down" }
]
```

## Project Configuration

Create a `.sublime-project` file in your project root:

```json
{
  "folders": [
    {
      "path": ".",
      "folder_exclude_patterns": [
        ".git",
        "node_modules",
        ".next",
        "build",
        "dist",
        "__pycache__"
      ],
      "file_exclude_patterns": [
        "*.pyc",
        "*.pyo",
        "*.exe",
        "*.dll",
        "*.obj",
        "*.o",
        "*.a",
        "*.lib",
        "*.so",
        "*.dylib",
        "*.ncb",
        "*.sdf",
        "*.suo",
        "*.pdb",
        "*.idb",
        ".DS_Store",
        "*.class",
        "*.psd",
        "*.db"
      ]
    }
  ],
  "settings": {
    "tab_size": 2,
    "translate_tabs_to_spaces": true
  }
}
```