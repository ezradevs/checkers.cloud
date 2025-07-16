# Local Setup Instructions

## Download and Run the Checkers Analysis Tool Locally

### Prerequisites

Before you begin, make sure you have these installed on your computer:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version

2. **Git** (for downloading the code)
   - Download from: https://git-scm.com/

### Step 1: Download the Source Code

You have a few options to get the code:

#### Option A: Download as ZIP (Easiest)
1. In Replit, go to the file explorer (left sidebar)
2. Click the three dots menu (⋮) at the top
3. Select "Download as ZIP"
4. Extract the ZIP file to a folder on your computer

#### Option B: Using Git (Recommended)
1. Open terminal/command prompt
2. Navigate to where you want the project
3. If you have the code in a Git repository, clone it:
   ```bash
   git clone [your-repository-url]
   cd [project-folder-name]
   ```

### Step 2: Install Dependencies

1. Open terminal/command prompt in the project folder
2. Install all required packages:
   ```bash
   npm install
   ```

This will install all the libraries and tools needed to run the application.

### Step 3: Run the Application

Start the development server:
```bash
npm run dev
```

You should see output like:
```
[express] serving on port 5000
```

### Step 4: Open in Browser

1. Open your web browser
2. Go to: `http://localhost:5000`
3. You should see the Checkers Analysis Tool running!

### Project Structure

```
├── client/          # Frontend React application
│   ├── src/
│   │   ├── components/  # UI components (board, controls, analysis)
│   │   ├── lib/         # Game logic and AI engine
│   │   └── pages/       # Main checkers page
├── server/          # Backend Express server
├── shared/          # Types and schemas shared between frontend/backend
└── package.json     # Project configuration
```

### Key Features

- **Interactive Board**: Drag and drop pieces to make moves
- **Setup Mode**: Click to place/remove pieces for custom positions
- **AI Analysis**: Advanced minimax algorithm with configurable depth
- **Visual Analysis**: Evaluation bar, move arrows, and engine lines
- **Rule Variations**: Configure force-take and multiple capture rules

### Troubleshooting

**Port already in use?**
- The app runs on port 5000 by default
- If you get a port error, make sure nothing else is running on port 5000
- Or modify the port in `server/index.ts`

**npm install fails?**
- Make sure you have Node.js 18+ installed
- Try deleting `node_modules` folder and `package-lock.json`, then run `npm install` again

**Page won't load?**
- Make sure you see "serving on port 5000" in the terminal
- Check that you're going to `http://localhost:5000` (not a different port)

### Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript
- **Build Tools**: Vite, ESBuild
- **Game Engine**: Custom minimax AI with alpha-beta pruning

The application runs entirely locally - no internet connection needed after setup!