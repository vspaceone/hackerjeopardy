# AGENTS.md - Hacker Jeopardy Angular App (Modernized)

## Build/Test Commands
- `ng build` - Build project to dist/ (development)
- `ng build --configuration production` - Production build with optimization
- `ng serve` - Start dev server on localhost:4200
- `ng test` - Run unit tests (Karma/Jasmine) - comprehensive test suite exists
- `ng test --watch=false` - Run tests once for CI
- `ng e2e` - Run end-to-end tests (Protractor) - outdated, migrate to Cypress recommended

## Code Style Guidelines
- **Indentation**: 2 spaces (per .editorconfig)
- **Quotes**: Single quotes for TypeScript strings
- **TypeScript**: Strict mode enabled for full type safety
- **Services**: Dependency injection with providedIn: 'root'
- **Components**: Standalone components with clean @Input/@Output patterns
- **Audio**: Howler.js via service abstraction (AudioService)
- **No jQuery**: Fully removed jQuery dependencies
- **Reactive**: Observable-based data loading with RxJS
- **Accessibility**: ARIA labels, alt text, and keyboard navigation

## Modernized Project Architecture
- **Standalone Components**: Migrated from NgModules to standalone components
  - `AppComponent`: Root orchestrator with integrated services
  - `SetSelectionComponent`: Game round selection interface
  - `GameBoardComponent`: Jeopardy-style question grid with proper CSS Grid
  - `QuestionDisplayComponent`: Modal question/answer interface
  - `PlayerControlsComponent`: Individual player score and controls
- **Service Layer**: Comprehensive business logic in services
  - `AudioService`: Howler.js audio management with theme music
  - `GameDataService`: HTTP data loading with RxJS observables
  - `GameService`: Game state, timers, and player management with RxJS
- **Type Safety**: Full TypeScript interfaces in `models/game.models.ts`
  - `Player`, `Question`, `Category`, `GameRound` interfaces
- **Data Flow**: Reactive with EventEmitter communication and RxJS
- **Responsive Design**: Mobile-friendly CSS Grid and Flexbox
- **Testing**: Unit tests for services and components
- **Dependencies**: Angular 18, Howler.js 2.2.4, RxJS 7.8.1, Zone.js 0.14.10