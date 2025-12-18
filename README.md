# Hacker Jeopardy

A modern, web-based Jeopardy-style game built with Angular, featuring hacker-themed questions across various tech topics including cybersecurity, programming, hardware, and more.

## Features

- **Interactive Game Board**: Jeopardy-style grid with categories and point values
- **Authentic Jeopardy Format**: Displays answers as clues, players provide correct questions
- **Dynamic Question Sets**: Multiple themed rounds (cybersecurity, AI, blockchain, etc.)
- **Audio Feedback**: Sound effects for correct/incorrect answers and background music
- **Player Management**: Support for multiple players with score tracking
- **Host Tools**: Automatic question reveal on correct answers, manual reveal, "No One Knows" button, and long-press reset for fixing issues
- **Score Integrity**: Complete undo of score changes when resetting questions during gameplay
- **Responsive Design**: Mobile-friendly interface
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Modern Architecture**: Standalone Angular components, RxJS for reactive programming

## Prerequisites

- Node.js v18.19.0 or higher
- npm v9.0.0 or higher
- Angular CLI v18.0.0 or higher

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/krauni/hackerjeopardy.git
   cd hackerjeopardy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

1. Start the development server:
   ```bash
   ng serve
   ```
   Navigate to `http://localhost:4200/`. The app will automatically reload on file changes.

2. Build for production:
   ```bash
   ng build --configuration production
   ```
   The build artifacts will be stored in the `dist/` directory.

## Testing

- **Unit Tests**: Run `ng test` to execute unit tests via Karma
- **End-to-End Tests**: Run `ng e2e` to execute e2e tests via Protractor (deprecated, migrate to Cypress recommended)

## Architecture

### Project Structure
```
src/
├── app/
│   ├── components/          # Standalone UI components
│   │   ├── game-board/      # Question grid display
│   │   ├── question-display/# Answer modal with correct questions
│   │   ├── player-controls/ # Player score management
│   │   └── set-selection/   # Round selection screen
│   ├── services/            # Business logic services
│   │   ├── game.service.ts  # Game state management
│   │   ├── game-data.service.ts # Question loading
│   │   └── audio.service.ts # Audio playback
│   ├── models/              # TypeScript interfaces
│   │   └── game.models.ts   # Game data types
│   └── app.component.ts     # Root component
├── assets/                  # Static assets and question data
└── environments/            # Environment configurations
```

### Key Technologies
- **Angular 18**: Modern framework with standalone components
- **RxJS**: Reactive programming for async operations
- **Howler.js**: Audio library for sound effects
- **TypeScript**: Strict mode enabled for type safety
- **SCSS**: Component styling

### Recent Improvements
- Upgraded to Angular 18 with standalone components
- Added comprehensive unit test coverage
- Implemented accessibility features (ARIA, alt text)
- Refactored to clean architecture with services
- Fixed Jeopardy-style grid layout
- Updated dependencies and build tools
- Added "No One Knows" button for host control of unanswered questions
- Implemented long-press question reset functionality with complete score undo
- Improved player badge styling with blue theme consistency
- Enhanced button styling with proper color schemes and hover effects
- Fixed cancel button behavior and added proper state management
- Added comprehensive visual feedback for all game actions

## Adding New Question Rounds

1. Create a new directory in `src/assets/` (e.g., `new_round/`)
2. Add `round.json` with category names
3. Create subdirectories for each category with `cat.json` containing questions
4. Update `GameDataService.SETS_KIT` to include the new round
5. Questions should follow Jeopardy format:
   - `question`: The correct question players must provide (e.g., "What is Selection Sort?")
   - `answer`: The answer that is displayed as the clue to players (e.g., "This algorithm sorts by repeatedly finding the minimum element")
   - `image`: Optional image file path
   - Note: Correct questions are revealed automatically when answers are marked correct, or manually via the "Reveal Question" button otherwise

Example structure:
```
src/assets/new_round/
├── round.json
├── category1/
│   └── cat.json
└── category2/
    └── cat.json
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## Code Style

- Follow Angular style guide
- Use 2-space indentation (per .editorconfig)
- Single quotes for TypeScript strings
- Strict TypeScript mode enabled
- ESLint for code linting

## Deployment

Build for production and deploy the `dist/` contents to your web server:

```bash
ng build --configuration production
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original concept inspired by Jeopardy!
- Question content sourced from various tech communities
- Built with Angular CLI