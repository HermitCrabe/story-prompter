# Story Prompter

A web-based interface for using LLMs to write and manage stories.

## Project Structure

```
story-prompter/
├── frontend/           # React web application
├── stories/            # Story files and metadata
│   ├── drafts/         # Work-in-progress stories
│   ├── published/      # Completed stories
│   ├── templates/      # Story templates and prompts
│   └── metadata/       # Story metadata and configuration
└── README.md          # This file
```

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Running the Development Server

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
cd frontend
npm run build
```

## Features

- Text input interface for story prompts
- Debug functionality to test inputs
- Organized file structure for stories and metadata

## Development

The frontend is built with:
- React 18
- TypeScript
- Vite (build tool)
- Modern ES6+ features

## Story Management

Stories are organized in the `stories/` directory:
- `drafts/` - Stories currently being worked on
- `published/` - Completed stories ready for sharing
- `templates/` - Reusable story templates and prompts
- `metadata/` - Story configurations and metadata files
