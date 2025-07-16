# Checkers Game Application

## Overview

This is a full-stack web application for playing and analyzing checkers games. The application features a React frontend with shadcn/ui components, an Express.js backend, and PostgreSQL database integration using Drizzle ORM. The application supports both game setup and gameplay modes, along with position analysis capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Pattern**: RESTful API design
- **Error Handling**: Centralized error middleware
- **Logging**: Custom request/response logging middleware

### Database Architecture
- **Database**: PostgreSQL (configured but using in-memory storage currently)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon Database serverless driver

## Key Components

### Game Engine
- **Board Representation**: JSON-based board position storage
- **Move Generation**: Legal move calculation and validation with proper dark square placement
- **Game Logic**: Checkers rules implementation including captures, king promotion, and multi-jumps
- **AI Analysis**: Enhanced minimax algorithm with alpha-beta pruning (depth 2-5)
- **Position Evaluation**: Advanced evaluation including material, positional, mobility, and strategic factors
- **Engine Strength**: Configurable analysis depth from beginner to expert level

### UI Components
- **CheckersBoard**: Interactive game board with drag-and-drop functionality and move highlighting
- **ControlPanel**: Game mode switching, analysis controls, and configurable engine depth
- **AnalysisResults**: Comprehensive position evaluation display with progress tracking

### Data Models
- **Game Schema**: Stores position, current player, game mode, and analysis results
- **Move Types**: Structured move representation with captures and promotions
- **Position Types**: Type-safe piece and board position definitions

## Data Flow

1. **Game State Management**: React state manages current game position and mode
2. **Server Communication**: TanStack Query handles API requests for game persistence
3. **Real-time Updates**: Frontend immediately reflects user interactions
4. **Analysis Pipeline**: Position analysis runs on-demand with results cached

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI Framework**: Radix UI primitives, Lucide React icons
- **Database**: Drizzle ORM, Neon Database serverless
- **Validation**: Zod for schema validation
- **Utilities**: Class Variance Authority, clsx, date-fns

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast development server with HMR
- **ESBuild**: Production backend bundling
- **Replit Integration**: Development environment optimization

## Deployment Strategy

### Development
- **Server**: TSX for TypeScript execution in development
- **Client**: Vite dev server with proxy to backend
- **Database**: Environment variable configuration for database URL

### Production
- **Build Process**: Vite builds frontend, ESBuild bundles backend
- **Asset Serving**: Express serves static files from dist/public
- **Environment**: Production mode detection for optimizations

### Architecture Decisions

1. **Monorepo Structure**: Shared types between frontend and backend for consistency
2. **In-Memory Storage**: Current implementation uses memory storage with easy database migration path
3. **Component Architecture**: Modular UI components with clear separation of concerns
4. **Type Safety**: End-to-end TypeScript with strict configuration
5. **Modern Stack**: Latest versions of React, Express, and supporting libraries

## Recent Changes: Latest modifications with dates

### January 16, 2025 - Enhanced Engine Implementation
- **Fixed Critical Bug**: Corrected piece placement to use only dark squares (was causing moves to fail)
- **Advanced AI Engine**: Implemented minimax with alpha-beta pruning for stronger gameplay
- **Sophisticated Evaluation**: Added multi-factor position evaluation including:
  - Material values (pieces: 100pts, kings: 300pts)
  - Positional bonuses (advancement, center control, back rank protection)
  - Mobility assessment and strategic factors
- **Configurable Difficulty**: Added depth selection from beginner (depth 2) to expert (depth 5)
- **Enhanced UI**: Improved analysis display with better evaluation ranges and progress tracking
- **Performance Optimization**: Move ordering and pruning for faster analysis

### January 16, 2025 - Visual Analysis Features & Layout Improvements
- **Live Evaluation Bar**: Added position assessment bar showing Red/Black advantage with color-coded visualization
- **Move Suggestion Arrows**: Implemented enhanced SVG arrows with shadows and rounded caps pointing to best moves
- **Engine Lines**: Created interactive move analysis showing top 6 moves with quality rankings and hover effects
- **Simplified Board Highlights**: Removed distracting square highlights, keeping only selected piece highlighting
- **Improved Layout**: Reorganized interface with board and evaluation bar together, analysis results below
- **Visual Polish**: Enhanced arrow styling with better proportions and professional shadows

### January 16, 2025 - Final Layout & Local Setup
- **Clean Interface**: Removed all blue borders and selection highlighting for professional appearance
- **Legal Move Indicators**: Changed to subtle black semi-transparent circles matching chess.com style
- **Final Layout**: Board at top, control panel on right, evaluation bar and analysis sections underneath board
- **Local Setup Guide**: Created comprehensive instructions for downloading and running locally (LOCAL_SETUP.md)