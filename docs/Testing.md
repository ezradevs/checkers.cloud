# Testing

## Overview
Testing is critical to ensure the reliability, correctness, and maintainability of the Checkers Analysis Tool. This document covers manual and automated testing strategies, test case examples, edge case handling, and future plans for test automation.

---

## Manual Testing

### User Interface (UI) Testing
- **Board Interaction:**
  - Drag-and-drop pieces in play mode; verify only legal moves are allowed.
  - Place/remove pieces in setup mode; ensure correct piece types and colors.
  - Flip board orientation and verify correct rendering.
- **Control Panel:**
  - Test all buttons (Analyze, Reset, Clear, Flip Board) for correct behavior.
  - Change analysis depth and rule variations; verify UI updates and analysis results.
- **Analysis Tools:**
  - Request AI analysis at different depths; check evaluation bar, move arrows, and engine lines.
  - Hover over engine lines to preview moves on the board.
- **Responsiveness:**
  - Test layout on various screen sizes (desktop, tablet, mobile).
- **Accessibility:**
  - Navigate all controls via keyboard.
  - Use screen reader to verify ARIA labels and roles.

### API Testing
- **Game State Endpoints:**
  - Create, retrieve, and update game states via REST API.
  - Test invalid payloads and ensure proper error messages.
- **Error Handling:**
  - Simulate server errors and verify user feedback (toasts, error messages).

### Edge Case Testing
- Multi-jump and king promotion scenarios.
- Empty board, full board, and illegal positions.
- Rapid user actions (e.g., multiple analysis requests).
- Network interruptions and recovery.

---

## Automated Testing (Planned)

### Unit Testing
- **Game Logic:**
  - Test move generation, validation, and application.
  - Test AI evaluation function for known positions.
- **UI Components:**
  - Use React Testing Library to test component rendering and interaction.

### Integration Testing
- **API Endpoints:**
  - Use Supertest or similar to test REST API routes for all CRUD operations.
- **Frontend-Backend Integration:**
  - Simulate user flows that span both client and server.

### End-to-End (E2E) Testing
- **Critical User Flows:**
  - Use Cypress or Playwright to automate full user journeys (play game, analyze, reset, etc.).

---

## Example Test Cases

### UI Test Case: Legal Move Highlight
```markdown
1. Start a new game in play mode.
2. Select a red piece; verify all legal destination squares are highlighted.
3. Attempt to move to an illegal square; verify move is blocked.
4. Complete a legal move; verify board updates and move history records the move.
```

### API Test Case: Create and Retrieve Game
```http
POST /api/games
{
  "position": { ... },
  "currentPlayer": "red",
  "gameMode": "play"
}

GET /api/games/1
Expect: 200 OK, correct game state returned.
```

### Edge Case: Multi-Jump
```markdown
1. Set up a position where a multi-jump is possible.
2. Make the first jump; verify the UI prompts for the next jump.
3. Complete the sequence; verify correct piece removal and king promotion if applicable.
```

---

## Test Data
- Use a variety of board positions: starting, midgame, endgame, custom setups.
- Test with both valid and invalid API payloads.
- Simulate slow network and server errors.

---

## Troubleshooting Tips
- **Port Conflicts:** Ensure nothing else is running on port 5000.
- **Install Errors:** Delete `node_modules` and `package-lock.json`, then reinstall.
- **Page Won't Load:** Check server logs for errors; verify correct URL.
- **Analysis Fails:** Check browser console and server logs for stack traces.

---

## Future Plans
- Integrate Jest and React Testing Library for automated unit and integration tests.
- Add Supertest for backend API route testing.
- Implement E2E tests with Cypress or Playwright.
- Add CI pipeline for automated test runs on pull requests. 