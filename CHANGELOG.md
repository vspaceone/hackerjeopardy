# Changelog

All notable changes to the Hacker Jeopardy project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Major Refactoring (2024)
- **GameStateService**: New centralized reactive state management service
  - RxJS BehaviorSubjects for all game state
  - Observable streams for state changes (players$, categories$, selectedQuestion$, etc.)
  - Player lifecycle management (scoring, highlighting)
  - Round and question state management
  - State snapshot functionality for debugging

- **Constants Configuration**: `constants/game.constants.ts`
  - `TIMING`: All timing constants (answer timeout, delays, animations)
  - `PLAYER_CONFIG`: Player settings (count, initial score, score increment)
  - `PLAYER_COLORS`: Centralized color schemes for all players
  - `QUESTION_VALUES`: Question scoring configuration
  - `KEYBOARD`: Key mapping definitions
  - `MATRIX_RAIN`: Visual effect configuration
  - `CACHE_CONFIG`: Storage limits and expiration
  - `BUTTON_VALUES`: Question state markers

### Changed
- **AppComponent**: Refactored from 387-line "God Object" to focused coordinator
  - Delegates all state management to GameStateService
  - Uses RxJS `takeUntil` for proper subscription cleanup
  - Implements OnDestroy lifecycle hook
  - Removed hardcoded player initialization
  - Removed duplicate state declarations
  - Improved keyboard input handling with type-safe key mapping
  - Added comprehensive JSDoc comments

- **GameService**: Updated to use centralized constants
  - Uses `TIMING.ANSWER_TIMEOUT` instead of hardcoded value
  - Uses `BUTTON_VALUES` constants for state markers
  - Uses `PLAYER_CONFIG.COUNT` for dynamic player arrays
  - Improved code clarity and maintainability

- **GameDataService**: Updated to use centralized constants
  - Uses `QUESTION_VALUES.BASE_MULTIPLIER` for scoring
  - Uses `PLAYER_CONFIG.COUNT` for player initialization
  - Type-safe question initialization

- **PlayerControlsComponent**: Updated to use centralized constants
  - Uses `PLAYER_CONFIG.SCORE_INCREMENT` for +/- buttons
  - Uses `TIMING.SCORE_ANIMATION_DURATION` for animations
  - Removed hardcoded values

- **GameBoardComponent**: Updated to use centralized constants
  - Uses `TIMING.QUESTION_RESET_ANIMATION` for reset effects
  - Uses `BUTTON_VALUES` for question state checking
  - Fixed timer type safety with proper `window.setTimeout`

### Improved
- **Type Safety**: Removed all `any` types throughout codebase
  - Proper typing for setTimeout return values
  - Type-safe keyboard mappings
  - Explicit return types on all methods
  - Strict null checks enforced

- **Code Quality**:
  - Single Responsibility Principle throughout
  - Clear separation of concerns (UI, state, logic)
  - Centralized configuration management
  - Improved maintainability and testability
  - Better documentation with JSDoc comments

- **Architecture**:
  - Reactive state management with RxJS
  - Unidirectional data flow
  - Proper subscription lifecycle management
  - Smart/dumb component separation
  - Observable streams for state changes

### Fixed
- Removed duplicate state declarations in AppComponent
- Fixed timer type issues with proper `window.setTimeout` usage
- Corrected keyboard input handling for international layouts
- Improved memory management with proper subscription cleanup

### Build
- ✅ Production build: 479KB (compressed: 116.49 KB)
- ✅ All TypeScript strict checks passing
- ✅ No compilation errors
- ✅ ESLint compliant (except pre-existing warnings)

---

## [Previous Releases]

### Angular 18 Migration
- Upgraded to Angular 18 with standalone components
- Removed NgModules in favor of standalone architecture
- Updated all dependencies to compatible versions
- Migrated to new Angular CLI build system

### Content Management System
- Implemented multi-repository content loading
- Added IndexedDB caching for offline support
- Created content validation system
- Implemented provider fallback chain (Cache → GitHub → Local)
- Added content manager UI component

### Game Features
- Added "No One Knows" button for host control
- Implemented long-press question reset with score undo
- Added controller/gamepad support
- Implemented player highlighting during selection
- Added visual feedback for all game actions
- Improved score tracking with change history

### UI/UX Improvements
- Fixed Jeopardy-style grid layout with CSS Grid
- Enhanced button styling with proper color schemes
- Improved player badge styling
- Added hover effects and transitions
- Implemented Matrix rain background effect
- Added accessibility features (ARIA, alt text, keyboard navigation)

### Testing
- Added comprehensive unit test coverage
- Implemented test colocalization with source files
- Added automated test import management
- Set up CI/CD compatible test execution

### Code Quality
- Enabled TypeScript strict mode
- Implemented ESLint with Angular rules
- Added .editorconfig for consistent formatting
- Removed jQuery dependencies
- Refactored to service-based architecture
