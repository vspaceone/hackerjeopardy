# Hacker Jeopardy Game Logic & Flow Analysis

## 📊 Current Game Logic & Flow Analysis

Based on examination of the codebase, here's a comprehensive analysis of the current Hacker Jeopardy game logic and flow.

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
- `activePlayers`: Set of currently active player IDs (only 1 in sequential mode)
- `activePlayersArr`: Array version of activePlayers for easier access
- `timeoutPlayers`: Set of players who timed out on this question
- `timeoutPlayersArr`: Array version of timeoutPlayers
- `availablePlayers`: Set of player IDs who can still buzz in
- `buttonsActive`: Legacy field (not actively used)
- `activePlayer`: Currently active player with timer
- `activationtime`: When player became active (for potential future use)
- `hadIncorrectAnswers`: Boolean indicating if any incorrect answers were given
- `scoreChanges`: Array tracking all score modifications during question lifecycle (for reset functionality)
- `resetTimestamp`: Timestamp when question was last reset (for visual feedback)

**Player Object:**
- `id`: Unique identifier (1-4)
- `btn`: Button identifier string
- `name`: Display name
- `score`: Current score
- `bgcolor`: Background color for UI
- `fgcolor`: Foreground/text color
- `key`: Keyboard shortcut (1-4)
- `remainingtime`: Countdown timer when active
- `activationtime`: When player became active (optional)

### 🔄 Game Flow

#### 1. Setup Phase
```
Select Round → Load Categories → Display Game Board
```

#### 2. Question Selection
```
Player Clicks Question → Question Marked Unavailable → Display Modal
Modal Shows: "Answer:" + question.answer (the clue)
```

#### 3. Buzzing Phase (Sequential)
```
All players eligible initially (availablePlayers = [1,2,3,4])
First player to buzz in becomes activePlayer
6-second timer starts
Other players cannot buzz until resolution
```

#### 4. Answer Resolution
```
Host Clicks "Correct" or "Incorrect":

✅ CORRECT:
- Active player gets +points
- Question closes immediately
- Correct question auto-reveals

❌ INCORRECT:
- Active player gets -points
- Player marked as timed out
- If more players available: New buzzing round begins
- If no players left: Question closes with manual reveal button

⏰ TIMEOUT:
- Active player marked as timed out
- Same logic as incorrect (new buzzing round or close)
```

#### 5. Question Closure
```
When no players can answer:
- Manual "Reveal Question" button appears (except for correct answers)
- Shows what the correct question should have been
- Host can use "No One Knows" button to mark question as unanswered/incorrect
- Question permanently unavailable
```

#### 6. Host Controls
```
"No One Knows" Button:
- Available when question is open and active
- Allows host to manually mark question as unanswered
- Sets question as having incorrect answers
- Useful for closing questions without waiting for player interaction

Question Reset (Long-Press):
- Long-press (1.5 seconds) on any answered question tile
- Completely undoes the question transaction
- Reverts all score changes (points awarded/deducted)
- Returns question to initial available state on game board
- Visual feedback: red blinking animation for 1 second
- Available at any time during or after question resolution
```

### ⏱️ Timer Logic

- **6-second countdown** per active player
- **Sequential buzzing**: Only one player active at a time
- **Timeout handling**: Player loses turn, question stays open for others
- **No automatic progression**: Host must judge each answer

### 👥 Player Management

- **4 players** by default (configurable)
- **Keyboard shortcuts**: 1-4 keys for buzzing
- **Score tracking**: +points for correct, -points for incorrect
- **Timeout penalty**: Prevents re-buzzing on same question

### 🎵 Audio System

- **Click sounds** for interactions
- **Success/fail audio** for answers
- **Background theme music** during questions

### 🎨 UI Flow

```
Game Board → Question Modal → Answer Display → Resolution → Back to Board
     ↓             ↓             ↓            ↓            ↓
  Category Grid  "Answer:"    Player Timer   Correct/     Question
   w/ Points     + Clue Text   + Countdown   Incorrect    Unavailable
   (Green =         |             |            |            (Green if
    Correct,         |             |            |            Correctly
    Red =            |             |            |            Answered,
    Unanswered)      |             |            |            Red if
                     |             |            |            Unanswered)
```

### 🔍 Current Strengths

✅ **Authentic Jeopardy Format**: Answers displayed as clues, questions revealed later
✅ **Sequential Buzzing**: Prevents simultaneous activation
✅ **Host Control**: Manual judgment of answers with "No One Knows" button for unanswered questions
✅ **Question Reset**: Long-press reset functionality for fixing gameplay issues
✅ **Score Integrity**: Complete undo of all score changes when resetting questions
✅ **Visual Feedback**: Clear indication of active players, timers, answered questions, and unanswered questions
✅ **Audio Enhancement**: Immersive sound effects
✅ **Flexible Question Management**: Host can manually close or reset questions at any time

### ⚠️ Potential Issues/Areas for Improvement

❓ **Complex State Management**: Multiple Sets (availablePlayers, activePlayers, timeoutPlayers)
❓ **Timer Edge Cases**: What happens if host clicks buttons during countdown?
❓ **Player Re-entry**: Can timed-out players buzz on same question?
❓ **Question Persistence**: How are resolved questions tracked across sessions?
❓ **Error Handling**: What if GameService methods are called on invalid state?

### 🔧 Key Methods Summary

| Method | Purpose |
|--------|---------|
| `activatePlayer()` | Handle buzzing, start timer, prevent multiple activation |
| `startTimer()` | Initialize 6-second countdown for active player |
| `decrementTimer()` | Handle timeout, shift to next player or close |
| `correctAnswer()` | Award points, close question, auto-reveal answer |
| `incorrectAnswer()` | Deduct points, allow continued buzzing or close |
| `notAnswered()` | Final closure when no valid answers |
| `markQuestionIncorrect()` | Mark question as attempted but incorrectly answered by all |
| `resetQuestion()` | Complete undo of question transaction and score changes |

### 📁 File Structure Impact

**Services:**
- `GameService`: Core game logic and state management
- `GameDataService`: Question loading and initialization
- `AudioService`: Sound effect management

**Components:**
- `GameBoardComponent`: Question selection interface
- `QuestionDisplayComponent`: Answer modal with judging controls
- `PlayerControlsComponent`: Score display and management

**Models:**
- `game.models.ts`: TypeScript interfaces for type safety

### 🎯 Game Rules Implementation

1. **Sequential Buzzing**: Only one player can be active at a time
2. **Timeout Penalty**: 6 seconds to respond, then turn passes
3. **Score Changes**: +value for correct, -value for incorrect
4. **Host Judgment**: Manual correct/incorrect buttons
5. **Answer Reveals**: Auto-reveal on correct, manual on incorrect/timeout

This analysis provides a complete reference for understanding and maintaining the Hacker Jeopardy game logic and flow.</content>
<parameter name="filePath">GAME_LOGIC_ANALYSIS.md