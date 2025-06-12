# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

All commands must be run from the `frontend/` directory:

```bash
cd frontend
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Build for production (includes TypeScript compilation)
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## Architecture Overview

This is a React-based story writing interface with a tabbed layout system. The application uses:

- **React 18** with TypeScript and Vite
- **Headless UI** for accessible tab components
- **TailwindCSS v3** for styling (PostCSS-based, not the v4 Vite plugin)
- **Dark theme** with modern browser-style tabs

### Component Architecture

The app follows a hierarchical component structure:

1. **App.tsx** - Defines tab configuration and renders TabContainer
2. **TabContainer** - Main layout orchestrator using Headless UI's TabGroup
3. **Header** - Contains title and tab navigation (TabList/Tab components)
4. **MainContent** - Renders tab content panels (TabPanels/TabPanel)
5. **Page components** - Individual tab content (StoryPrompterPage, CharacterCreatorPage)

### Key Design Patterns

- **Tab system**: Uses Headless UI's compound component pattern where TabGroup wraps all tab-related components and manages state
- **Layout separation**: Header and MainContent are separate layout components that receive the same tab data
- **Component composition**: Pages are composed into tabs via the App.tsx configuration
- **TypeScript interfaces**: TabData interface defines the shape of tab configuration

### Styling Approach

- **Full-height layout**: Uses `min-h-screen flex flex-col` for viewport-filling design
- **Dark theme**: Gray-900 backgrounds with proper contrast ratios
- **Browser-style tabs**: Rounded top corners, active state styling, hover effects
- **Responsive padding**: `p-4` for content spacing while maintaining edge-to-edge header

### Important Implementation Notes

- **TailwindCSS version**: Must use v3 (not v4) with PostCSS configuration
- **Type imports**: Use `import { type ReactNode }` syntax for TypeScript types due to verbatimModuleSyntax
- **Tab state management**: Headless UI handles all tab state internally
- **Content organization**: Stories are managed in `stories/` directory structure outside the React app

### Story Management Structure

The `stories/` directory is organized for future LLM integration:
- `drafts/` - Work-in-progress stories
- `published/` - Completed stories
- `templates/` - Reusable prompts and templates
- `metadata/` - Story configurations and metadata