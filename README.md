# BookmarkBrain

BookmarkBrain is an AI-enhanced bookmark manager with interactive graph visualization and smart features to help you organize and explore your web bookmarks.

![BookmarkBrain Screenshot](./screenshots/main-screenshot.png)

## Features

- **Visual Graph Exploration**: View your bookmarks as an interactive "brain" network with smart connections
- **AI-Powered Analysis**: Get summaries, suggested tags, and categories for your bookmarks
- **Efficient Organization**: Manage bookmarks with categories and tags for easy retrieval 
- **Import/Export**: Bring in bookmarks from browsers, Twitter/X, and other sources
- **Offline Support**: Full PWA functionality for offline access to your bookmarks
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

### Frontend
- React 18+ with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- React Force Graph for visualization
- Service worker for offline capabilities

### Backend
- Node.js with Express
- TypeScript for type safety
- Prisma ORM with SQLite database
- OpenAPI/Swagger for documentation
- Zod for schema validation

## Project Structure

```
/
├── frontend/                # Frontend React application
│   ├── public/              # Static assets
│   │   ├── images/          # Image assets
│   │   └── icons/           # Icon assets
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions and API clients
│   │   ├── stores/          # Zustand stores
│   │   ├── views/           # Page components
│   │   ├── App.tsx          # Main application component
│   │   ├── index.css        # Global styles
│   │   ├── main.tsx         # Entry point
│   │   └── service-worker.ts # PWA service worker
│   ├── index.html           # HTML template
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── tsconfig.json        # TypeScript configuration
│   └── vite.config.ts       # Vite configuration
├── backend/                 # Backend Express application
│   ├── prisma/              # Prisma schema and migrations
│   ├── src/                 # Source code
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── lib/             # Utility functions
│   │   ├── app.ts           # Express application setup
│   │   └── server.ts        # Entry point
│   └── tsconfig.json        # TypeScript configuration
├── tsconfig.json            # Root TypeScript configuration
├── package.json             # Project dependencies and scripts
└── README.md                # Project documentation
```

## Setup and Development

### Prerequisites
- Node.js 18+ and npm
- Running instance of LM Studio or similar for local AI features (optional)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/bookmarkbrain.git
   cd bookmarkbrain
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Initialize the database
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   cd ..
   ```

4. Start the development servers
   ```bash
   npm run dev
   ```
   This will start both the frontend (on port 5173) and the backend (on port 5001).

5. (Optional) Set up LM Studio
   - Download and install [LM Studio](https://lmstudio.ai/)
   - Run a local model server on port 1234
   - AI features will automatically connect to this server

## API Documentation

When the backend is running, you can access the API documentation at:
```
http://localhost:5001/api-docs
```

## Improvements and Changes

### Added or Enhanced
- Added robust error handling and input validation with Zod
- Improved the API client with retry logic and background sync
- Enhanced the Service Worker for better offline capabilities
- Standardized the API responses and error formats
- Added comprehensive API documentation with Swagger
- Improved the UI with a consistent "Jarvis/cyberpunk" theme
- Implemented proper type safety throughout the codebase

### Fixed
- Fixed inconsistent path imports with proper TypeScript path aliases
- Resolved issues with the bookmark service
- Improved PWA support with proper service worker implementation
- Fixed issues with the graph visualization

## Deployment

For production deployment:

```bash
# Build the frontend
npm run build:frontend

# Build the backend
npm run build:backend

# Start the production server
npm run start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React Force Graph](https://github.com/vasturiano/react-force-graph) for the graph visualization
- [LM Studio](https://lmstudio.ai/) for local AI capabilities
- All contributors and supporters of the project 