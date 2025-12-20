# Hacker Jeopardy Game Logic & Flow Analysis

## 📊 Current Game Logic & Flow Analysis

Based on examination of the codebase, here's a comprehensive analysis of the current Hacker Jeopardy game logic and flow. **Updated to reflect the speed-based queuing system and dynamic player management implemented in the latest version.**

### 🎮 Core Game Components

1. **GameService** - Central game state management
2. **GameDataService** - Loads and processes question data
3. **QuestionDisplayComponent** - Modal for showing questions and handling answers
4. **GameBoardComponent** - Grid display of available questions
5. **AppComponent** - Main orchestrator

### 📋 Data Model

**Question Object:**
- `question`: The correct question players must provide (e.g., "What is Selection Sort?")
- `answer`: The answer displayed as clue (e.g., "This algorithm sorts by repeatedly finding the minimum element")
- `available`: Boolean indicating if question can be selected
- `value`: Point value (100-500)
- `cat`: Category name
- `player`: Player who successfully answered (if any)
- `activePlayers`: Legacy field (maintained for compatibility)
- `activePlayersArr`: Legacy field (maintained for compatibility)
- `timeoutPlayers`: Set of players who timed out on this question
- `timeoutPlayersArr`: Array version of timeoutPlayers
- `availablePlayers`: Set of player IDs who can still buzz in (dynamically updated)
- `buttonsActive`: Legacy field (not actively used)
- `activePlayer`: Currently active player with timer (only one at a time)
- `activationtime`: When player became active (for potential future use)
- `hadIncorrectAnswers`: Boolean indicating if any incorrect answers were given
- `scoreChanges`: Array tracking all score modifications during question lifecycle (for reset functionality)
- `resetTimestamp`: Timestamp when question was last reset (for visual feedback)
- **NEW: `buzzQueue`**: Ordered array of QueuedPlayer objects (speed-based order)
- **NEW: `currentQueueIndex`**: Current position in the queue (0-based)
- **NEW: `queueResolved`**: Boolean indicating if question ended with correct answer

**QueuedPlayer Object (New):**
- `playerId`: Player's unique identifier
- `buzzTimestamp`: When player buzzed in (for speed ordering)
- `position`: Queue position (1-based, for display)
- `status`: 'waiting' | 'answering' | 'completed' | 'eliminated'

**Player Object:**
- `id`: Unique identifier (1-8, dynamically configurable)
- `btn`: Button identifier string
- `name`: Display name
- `score`: Current score
- `bgcolor`: Background color for UI (8 distinct colors)
- `fgcolor`: Foreground/text color
- `key`: Keyboard shortcut (1-8, dynamically mapped)
- `remainingtime`: Countdown timer when active (6 seconds)
- `activationtime`: When player became active (optional)
- `highlighted`: Boolean for visual highlighting during selection
- `selectionBuzzes`: Count of selection phase buzzes (for penalty system)

### 🔄 Game Flow

#### 1. Setup Phase
```
Configure Players (1-8) → Select Round → Load Categories → Display Game Board
```

#### 2. Question Selection
```
Player Clicks Question → Question Marked Unavailable → Display Modal
Modal Shows: "Answer:" + question.answer (the clue)
```

#### 3. Simultaneous Buzzing Phase
```
All active players can buzz simultaneously when question appears
availablePlayers = [1,2,3,...,n] (based on current player count)
Players buzz in any order - speed determines queue position
```

#### 4. Queue Formation & Turn-Based Answering
```
✅ BUZZ DETECTED:
- Player added to buzzQueue in speed order (earliest timestamp = position 1)
- Queue displays all buzzed players with positions
- First player in queue becomes activePlayer
- 6-second timer starts for activePlayer

🎯 ANSWER RESOLUTION (Only activePlayer can answer):

✅ CORRECT:
- Active player gets +points
- Question closes immediately
- Correct question auto-reveals
- Queue resolved (no more turns)

❌ INCORRECT:
- Active player gets -points
- Player permanently removed from queue
- Next player in queue becomes activePlayer
- If queue empty: Question closes

⏰ TIMEOUT:
- Active player gets -points (same as incorrect)
- Player permanently removed from queue
- Next player in queue becomes activePlayer
- If queue empty: Question closes
```

#### 5. Question Closure
```
When queue exhausted without correct answer:
- Manual "Reveal Question" button appears
- Shows what the correct question should have been
- Host can use "No One Knows" button to mark as unanswered
- Question permanently unavailable

When correct answer given:
- Question auto-resolves immediately
- No further player turns allowed
```

#### 6. Host Controls

**Question Action Buttons** (Always visible below question content):
```
"Reveal Question": Shows the correct question text (conditional)
"No One Knows": Manually closes question as unanswered (when question active)
"Close": Closes question modal and returns to game board (always available)
```

**Player Judgment Buttons** (Visible when player is answering):
```
"✓ Correct": Awards points and ends question immediately
"✗ Incorrect": Deducts points and advances to next player in queue
```

**Dynamic Player Management** (During gameplay):
```
+/- Buttons: Add/remove players without resetting round
Changes take effect immediately while preserving existing player stats
```

**Question Reset** (Long-Press on answered questions):
- Long-press (1.5 seconds) on any answered question tile
- Completely undoes the question transaction
- Reverts all score changes (points awarded/deducted)
- Returns question to initial available state on game board
- Visual feedback: red blinking animation for 1 second
- Available at any time during or after question resolution

### ⏱️ Timer Logic

- **6-second countdown** per active player in queue
- **Strict turn-based**: Only the current queue position can have an active timer
- **Timeout penalty**: Player permanently loses turn, advances to next in queue
- **No simultaneous timers**: Only one player can be "answering" at a time
- **Queue preservation**: Timer only affects current player, queue continues

### 👥 Player Management

- **Dynamic player count**: 1-8 players configurable during setup
- **Speed-based queuing**: Fastest buzz determines queue position
- **Keyboard shortcuts**: 1-8 keys dynamically mapped to active players
- **Buzzer sounds**: 8 distinct audio cues for player identification
- **Score tracking**: +points for correct, -points for incorrect/timeout
- **Permanent elimination**: Incorrect/timeout answers remove player from queue
- **Live player adjustment**: Add/remove players during gameplay without reset

### 🎵 Audio System

- **Click sounds** for UI interactions
- **Success/fail audio** for answer judgments
- **8 distinct buzzer sounds** using advanced Web Audio API synthesis:
  - Player 1: High descending sweep
  - Player 2: Pulsing square wave
  - Player 3: Harmonic triangle
  - Player 4: Resonant filter sweep
  - Player 5: Fast trilling modulation
  - Player 6: Dual-tone chord
  - Player 7: Warbling modulation
  - Player 8: Burst sequence
- **Background theme music** during active questions

### 🎨 UI Flow

```
Game Setup → Game Board → Question Modal → Queue Formation → Turn-Based Answering → Resolution → Back to Board
     ↓          ↓             ↓              ↓                    ↓              ↓            ↓
Player Count  Category Grid  "Answer:"    Speed-Based Queue   Active Player     Correct/     Question
Configuration  w/ Points     + Clue Text   Position Display   + 6s Timer        Incorrect    Unavailable
(1-8 players)  (Green =                      (1st, 2nd, 3rd)  + Answer Input    Resolution   (Green if
                Correct,                                                         Queue        Correctly
                Red =                                                              Advances     Answered,
                Unanswered)                                                        or Ends      Red if
                                                                                   Question     Unanswered)
```

### 🔍 Current Strengths

✅ **Speed-Based Competition**: Fastest buzz determines queue position, rewarding reaction time
✅ **Fair Turn-Based Progression**: Each player gets opportunity despite incorrect answers
✅ **Dynamic Player Management**: Add/remove players (1-8) during gameplay without disruption
✅ **8 Distinct Buzzer Sounds**: Advanced audio synthesis for clear player identification
✅ **Immediate Resolution**: Correct answers end questions instantly, maintaining pace
✅ **Host Control**: Manual judgment with comprehensive button controls
✅ **Question Reset**: Long-press reset functionality for fixing gameplay issues
✅ **Score Integrity**: Complete undo of all score changes when resetting questions
✅ **Visual Queue**: Clear display of player positions and waiting order
✅ **Audio Enhancement**: Immersive sound effects with distinct player audio cues
✅ **Flexible Question Management**: Host can manually close or reset questions at any time
✅ **Responsive Design**: Adapts to different player counts and screen sizes

### ⚠️ Potential Issues/Areas for Improvement

❓ **Timer Edge Cases**: What happens if host clicks buttons during countdown? (Currently handled gracefully)
❓ **Question Persistence**: How are resolved questions tracked across sessions? (Currently session-only)
❓ **Error Handling**: What if GameService methods are called on invalid state? (Robust error handling implemented)
❓ **Network Play**: How would speed-based buzzing work in online multiplayer?
❓ **Accessibility**: Audio-based player identification may not work for hearing-impaired players

### 🔧 Key Methods Summary

| Method | Purpose |
|--------|---------|
| `activatePlayer()` | Handle initial buzzing, create speed-ordered queue |
| `addToQueue()` | Insert player into queue based on buzz timestamp |
| `advanceQueue()` | Move to next player or close question if queue empty |
| `startTimer()` | Initialize 6-second countdown for current queue position |
| `decrementTimer()` | Handle timeout, eliminate player, advance queue |
| `correctAnswer()` | Award points, mark queue resolved, close question immediately |
| `incorrectAnswer()` | Deduct points, eliminate player permanently, advance queue |
| `resetQuestion()` | Complete undo including queue reset and score restoration |
| `setPlayerCount()` | Dynamically add/remove players with state preservation |

### 📁 File Structure Impact

**Services:**
- `GameService`: Core game logic with speed-based queuing system
- `GameDataService`: Question loading and initialization with queue setup
- `GameStateService`: Centralized reactive state management for players and game state
- `AudioService`: Advanced Web Audio API synthesis for 8 distinct buzzer sounds

**Components:**
- `GameBoardComponent`: Question selection interface with long-press reset
- `QuestionDisplayComponent`: Enhanced modal with queuing display and consolidated controls
- `PlayerControlsComponent`: Individual player score and management
- `SetSelectionComponent`: Round selection with player count configuration

**Models:**
- `game.models.ts`: Extended TypeScript interfaces with QueuedPlayer and enhanced Question model

**Configuration:**
- `game.constants.ts`: Centralized configuration for timing, scoring, player colors, and keyboard mappings

### 🎯 Game Rules Implementation

1. **Speed-Based Queue Formation**: Fastest buzz determines turn order
2. **Strict Turn-Based Answering**: Only queued players can answer, one at a time
3. **Immediate Correct Resolution**: Right answers end questions instantly
4. **Permanent Elimination**: Wrong/timeout answers remove players from queue
5. **Dynamic Player Count**: 1-8 players configurable with live adjustments
6. **Host Judgment**: Manual correct/incorrect buttons with queue control
7. **Answer Reveals**: Auto-reveal on correct, manual reveal for unresolved questions
8. **8 Distinct Audio Cues**: Unique buzzer sounds for each player

This analysis provides a complete reference for understanding and maintaining the Hacker Jeopardy game logic and flow.</content>
<parameter name="filePath">GAME_LOGIC_ANALYSIS.md