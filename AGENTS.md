# AGENTS.md - Hacker Jeopardy Angular App (Content-Separated)

## Build/Test Commands
- `ng build` - Build project to dist/ (development)
- `ng build --configuration production` - Production build with optimization (479KB bundle)
- `ng serve` - Start dev server on localhost:4200
- `npm run watch` - Build with watch mode for development
- `ng test` - Run unit tests (Karma/Jasmine) - comprehensive test suite exists with tests colocated alongside source files
- `ng test --watch=false` - Run tests once for CI with automated import management
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

## Content Separation Architecture

### Repository Structure
```
hackerjeopardy/ (main app repo)
├── src/assets/          # Minimal fallback content (2-3 rounds)
├── src/app/services/content/  # Content management system
└── dist/                # Built application

hackerjeopardy-content/ (separate GitHub repo)
├── rounds/             # All 176+ question sets
├── manifest.json       # Content metadata
├── assets/             # Images and media
└── docs/               # Contribution guidelines
```

### Content Provider System
- **GitHubContentProvider**: Loads from GitHub Pages (primary)
- **CachedContentProvider**: IndexedDB offline cache (highest priority)
- **LocalContentProvider**: Bundled fallback content (lowest priority)

### Content Management Features
- **Offline-First**: 500MB IndexedDB cache for offline gameplay
- **User-Controlled Updates**: Manual content updates, no auto-downloads
- **Configurable Preloading**: Select which rounds to cache locally
- **Content Validation**: Client-side validation for round format compliance
- **Progress Tracking**: Download progress and cache management UI

## Modernized Project Architecture

### Components (Standalone)
- **AppComponent**: Root orchestrator and UI coordinator
  - Manages view state (showContentManager, loading)
  - Delegates game state to GameStateService
  - Handles keyboard/controller input routing
  - Coordinates between services
  - Implements proper cleanup with OnDestroy
- **SetSelectionComponent**: Game round selection interface
- **GameBoardComponent**: Jeopardy-style question grid with CSS Grid
  - Long-press reset functionality for questions
  - Dynamic button styling based on question state
- **QuestionDisplayComponent**: Modal question/answer interface
- **PlayerControlsComponent**: Individual player score and controls
  - Uses constants for score adjustments
- **ContentManagerComponent**: Content management and caching interface

### Service Layer
- **GameStateService**: ⭐ NEW - Centralized reactive state management
  - Manages all game state with RxJS BehaviorSubjects
  - Provides observable streams for state changes
  - Handles player lifecycle (scoring, highlighting)
  - Round and question state management
  - State snapshots for debugging
- **GameService**: Game logic and rules engine
  - Player activation and buzzing logic
  - Timer management (6-second countdown)
  - Score calculation and validation
  - Question lifecycle (correct/incorrect/reset)
  - Uses constants for all timing and configuration
- **GameDataService**: Content loading facade
  - Wraps ContentManagerService
  - Initializes question state with proper values
  - Uses constants for player and question configuration
- **AudioService**: Howler.js audio management
  - Theme music with configurable delay
  - Unique buzzer sounds per player (Web Audio API)
  - Sound effect management
- **ContentManagerService**: Content provider orchestration
  - Multi-repository support
  - Provider fallback chain (Cache → GitHub → Local)
  - Content validation and caching
- **IndexedDBService**: Persistent offline caching
- **ContentValidatorService**: Round format validation
- **ControllerService**: Gamepad/controller integration

### Configuration
- **constants/game.constants.ts**: ⭐ NEW - Centralized configuration
  - `TIMING`: All timing constants (timeouts, delays, animations)
  - `PLAYER_CONFIG`: Player settings (count, scores, limits)
  - `PLAYER_COLORS`: Color schemes for all players
  - `QUESTION_VALUES`: Scoring configuration
  - `KEYBOARD`: Key mappings for input
  - `MATRIX_RAIN`: Visual effect settings
  - `CACHE_CONFIG`: Storage limits
  - `BUTTON_VALUES`: State markers

### Type Safety
- **models/game.models.ts**: Full TypeScript interfaces
  - `Player`, `Question`, `Category`, `GameRound` interfaces
  - `ContentProvider`, `ContentManifest`, `RoundMetadata` interfaces
- **Strict Mode**: Enabled throughout project
- **No any types**: All types explicitly defined
- **Proper null handling**: Strict null checks enforced

### Data Flow
- **Reactive State**: RxJS Observables for all state changes
- **Unidirectional Flow**: State flows from services to components
- **Proper Cleanup**: takeUntil pattern for subscription management
- **Type-Safe Events**: Strongly typed @Input/@Output decorators

### Architecture Patterns
- **Separation of Concerns**: UI, state, logic clearly separated
- **Single Responsibility**: Each service has one clear purpose
- **Dependency Injection**: All services provided at root
- **Observable Streams**: Reactive programming throughout
- **Smart/Dumb Components**: Container vs presentational separation

### Testing & Quality
- **Unit Tests**: Colocated with services and components
- **Type Safety**: Full TypeScript strict mode
- **Linting**: ESLint with Angular rules
- **Build Validation**: Production build tested (479KB)

### Dependencies
- Angular 18, Howler.js 2.2.4, RxJS 7.8.1, Zone.js 0.14.10

## Content Management Guidelines

### For Contributors (Content Repository)
1. **Round Structure**: Each round in `rounds/[roundId]/` directory
2. **Required Files**: `round.json` (metadata) + `cat.json` files for each category
3. **Validation**: Use provided validation scripts before PR
4. **Images**: Place in category subdirectories, reference relatively
5. **Testing**: Test rounds in application before submitting

### For Developers (Main Repository)
1. **Content Loading**: Use `ContentManagerService` instead of direct HTTP calls
2. **Offline Support**: Content automatically cached for offline use
3. **Error Handling**: Provider chain handles network failures gracefully
4. **Updates**: Content updates managed through UI, not automatic
5. **Validation**: All content validated before caching

### Deployment Strategy
1. **App Deployment**: Standard Angular build and deploy
2. **Content Updates**: Independent of app releases
3. **GitHub Pages**: Content served from `username.github.io/hackerjeopardy-content`
4. **Versioning**: Content versions managed separately
5. **Caching**: 7-day expiration with 500MB size limit