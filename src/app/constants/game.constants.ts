/**
 * Game-wide constants for Hacker Jeopardy
 */

// Timing Constants
export const TIMING = {
  /** Player answer timeout in seconds */
  ANSWER_TIMEOUT: 6,
  /** Theme music delay in milliseconds */
  THEME_MUSIC_DELAY: 5000,
  /** Long press duration for reset actions in milliseconds */
  LONG_PRESS_DURATION: 1000,
  /** Player highlight duration in milliseconds */
  PLAYER_HIGHLIGHT_DURATION: 3000,
  /** Score animation duration in milliseconds */
  SCORE_ANIMATION_DURATION: 600,
  /** Question reset animation duration in milliseconds */
  QUESTION_RESET_ANIMATION: 1000,
  /** Matrix rain frame interval in milliseconds */
  MATRIX_RAIN_INTERVAL: 35
} as const;

// Player Constants
export const PLAYER_CONFIG = {
  /** Total number of players */
  COUNT: 8,
  /** Starting score for all players */
  INITIAL_SCORE: 0,
  /** Score adjustment increment */
  SCORE_INCREMENT: 100,
  /** Maximum selection buzzes before penalty */
  MAX_SELECTION_BUZZES: 20
} as const;

// Player Color Schemes
export const PLAYER_COLORS = [
  {
    id: 1,
    btn: 'player1',
    bgcolor: '#ff6b6b',
    fgcolor: '#9f0b0b',
    key: '1'
  },
  {
    id: 2,
    btn: 'player2',
    bgcolor: '#ff9900',
    fgcolor: '#995c00',
    key: '2'
  },
  {
    id: 3,
    btn: 'player3',
    bgcolor: '#9cfcff',
    fgcolor: '#3c9c9f',
    key: '3'
  },
  {
    id: 4,
    btn: 'player4',
    bgcolor: '#FFFF66',
    fgcolor: '#cccc00',
    key: '4'
  },
  {
    id: 5,
    btn: 'player5',
    bgcolor: '#00ff88',
    fgcolor: '#008844',
    key: '5'
  },
  {
    id: 6,
    btn: 'player6',
    bgcolor: '#ff00ff',
    fgcolor: '#880088',
    key: '6'
  },
  {
    id: 7,
    btn: 'player7',
    bgcolor: '#ff1493',
    fgcolor: '#cc3366',
    key: '7'
  },
  {
    id: 8,
    btn: 'player8',
    bgcolor: '#00ffff',
    fgcolor: '#008888',
    key: '8'
  }
] as const;

// Question Values
export const QUESTION_VALUES = {
  /** Base value multiplier for questions */
  BASE_MULTIPLIER: 100,
  /** Minimum question value */
  MIN_VALUE: 100,
  /** Maximum question value */
  MAX_VALUE: 500,
  /** Number of questions per category */
  QUESTIONS_PER_CATEGORY: 5
} as const;

// Keyboard Mappings
export const KEYBOARD = {
  /** Valid player keys */
  PLAYER_KEYS: ['1', '2', '3', '4', '5', '6', '7', '8'],
  /** Special numpad/international key mappings */
  KEY_MAPPINGS: {
    '¹': '1',
    '¡': '1',
    '²': '2',
    '³': '3',
    '¤': '4',
    '€': '4',
    '¥': '5',
    'µ': '5',
    '¶': '5',
    '§': '6',
    '÷': '6',
    '¸': '6',
    'º': '7',
    '»': '7',
    '¼': '8',
    '½': '8',
    '¾': '8'
  } as const
} as const;

// Matrix Rain Effect
export const MATRIX_RAIN = {
  /** Characters used in matrix rain effect */
  CHARACTERS: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  /** Font size for matrix characters */
  FONT_SIZE: 16,
  /** Trail fade rate (alpha) */
  FADE_RATE: 0.04,
  /** Character color */
  COLOR: '#00ff88',
  /** Reset probability threshold */
  RESET_THRESHOLD: 0.975
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  /** Maximum cache size in bytes (500MB) */
  MAX_SIZE: 500 * 1024 * 1024,
  /** Cache expiration in days */
  EXPIRATION_DAYS: 7,
  /** Cache version for invalidation */
  VERSION: 1
} as const;

// Special Button Values
export const BUTTON_VALUES = {
  /** Button value for unanswered questions */
  NONE: 'none',
  /** Button value for incorrectly answered questions */
  INCORRECT: 'incorrect'
} as const;
