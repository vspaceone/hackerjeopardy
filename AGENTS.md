# AGENTS.md - Hacker Jeopardy Angular App (Content-Separated)

## Build/Test Commands
- `ng build` - Build project to dist/ (development)
- `ng build --configuration production` - Production build with optimization (373KB bundle)
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
- **Standalone Components**: Migrated from NgModules to standalone components
  - `AppComponent`: Root orchestrator with async content initialization
  - `SetSelectionComponent`: Game round selection interface
  - `GameBoardComponent`: Jeopardy-style question grid with proper CSS Grid
  - `QuestionDisplayComponent`: Modal question/answer interface
  - `PlayerControlsComponent`: Individual player score and controls
  - `ContentManagerComponent`: Content management and caching interface
- **Service Layer**: Comprehensive business logic in services
  - `AudioService`: Howler.js audio management with theme music
  - `GameDataService`: Content-agnostic data loading facade
  - `GameService`: Game state, timers, and player management
  - `ContentManagerService`: Orchestrates content providers with fallback chain
  - `IndexedDBService`: Persistent offline caching
  - `ContentValidatorService`: Round format validation
- **Type Safety**: Full TypeScript interfaces in `models/game.models.ts`
  - `Player`, `Question`, `Category`, `GameRound` interfaces
  - `ContentProvider`, `ContentManifest`, `RoundMetadata` interfaces
- **Data Flow**: Reactive with EventEmitter communication and RxJS
- **Responsive Design**: Mobile-friendly CSS Grid and Flexbox layouts
- **Testing**: Unit tests colocated with services and components following Angular best practices
- **Dependencies**: Angular 18, Howler.js 2.2.4, RxJS 7.8.1, Zone.js 0.14.10

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