# Hacker Jeopardy

## 🎮 Overview

A modern, web-based implementation of Jeopardy with a tech/hacker theme. Built with Angular and featuring speed-based queuing, dynamic player management, and advanced audio synthesis for buzzer sounds.

**🎯 [How to Play](HOW_TO_PLAY.md)** - Complete game rules and instructions

## ✨ Features

- **Dynamic Player Management**: Support for 1-8 players with live addition/removal
- **Speed-Based Queuing**: Fastest buzz determines turn order with fair progression
- **Advanced Audio**: 8 distinct buzzer sounds using Web Audio API synthesis
- **Host Controls**: Comprehensive moderation tools and question management
- **Question Reset**: Long-press functionality to undo scoring errors
- **Content System**: Separate question repository with multiple round support
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

Visit `http://localhost:4200` to play!

## 📁 Project Structure

```
hackerjeopardy/
├── src/
│   ├── app/
│   │   ├── components/          # UI components
│   │   │   ├── game-board/      # Question selection grid
│   │   │   ├── question-display/# Answer modal with controls
│   │   │   ├── player-controls/ # Individual player management
│   │   │   └── content-manager/ # Round/content management
│   │   ├── services/            # Business logic
│   │   │   ├── game.service.ts  # Core game mechanics
│   │   │   ├── game-state.service.ts # Reactive state management
│   │   │   ├── audio.service.ts # Sound effects & synthesis
│   │   │   └── content/         # Question loading system
│   │   └── constants/           # Configuration & settings
│   └── assets/                  # Static files (sounds, images)
├── hackerjeopardy-content/      # Separate question repository
└── docs/                        # Documentation
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Key Scripts
- `npm start` - Development server
- `npm run build` - Production build
- `npm test` - Unit tests
- `npm run lint` - Code linting

### Architecture

**Reactive State Management**: Uses RxJS BehaviorSubjects for real-time UI updates
**Service Layer**: Clean separation of concerns with dependency injection
**Component Design**: Standalone Angular components with reactive inputs
**Audio Synthesis**: Web Audio API for custom buzzer sounds and effects

## 📚 Documentation

- **[Game Logic Analysis](GAME_LOGIC_ANALYSIS.md)** - Technical implementation details
- **[How to Play](HOW_TO_PLAY.md)** - Complete rules and gameplay guide
- **[Content Management](HOW_TO_ADD_ROUNDS.md)** - Adding new questions and rounds
- **[API Reference](AGENTS.md)** - Component and service documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source. See individual files for license information.

## 🙏 Acknowledgments

Inspired by the classic TV game show Jeopardy, adapted for technical education and competitive play.</content>
<parameter name="filePath">HOW_TO_PLAY.md