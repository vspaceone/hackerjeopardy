export interface Player {
  id: number;
  btn: string;
  name: string;
  score: number;
  bgcolor: string;
  fgcolor: string;
  key: string;
  remainingtime: number | null;
  activationtime?: number;
  highlighted?: boolean;
}

export interface Question {
  question: string;
  answer?: string;
  image?: string;
  available: boolean;
  value: number;
  cat: string;
  roundId?: string; // Add round ID for image URL construction
  player?: Player;
  activePlayers: Set<number>;
  activePlayersArr: number[];
  timeoutPlayers: Set<number>;
  timeoutPlayersArr: number[];
  availablePlayers: Set<number>;
  buttonsActive: boolean;
  activePlayer?: Player;
  activationtime?: number;
  hadIncorrectAnswers?: boolean;
  scoreChanges?: Array<{playerId: number, change: number, timestamp: number}>;
  resetTimestamp?: number;
}

export interface Category {
  name: string;
  path?: string;
  lang: string;
  difficulty?: string;
  author?: string;
  licence?: string;
  date?: string;
  email?: string;
  questions: Question[];
}

export interface GameRound {
  id?: string; // Added for multi-repository support
  name: string;
  categories: string[];
  comment?: string;
}

export interface GameState {
  selectedQuestion?: Question;
  renamePlayer?: Player;
  couldBeCanceled: boolean;
  audiotimer: number | null;
  activePlayer?: Player;
  pressedKeys: Set<string> | null;
  TIMEOUT: number;
  timer: number | null;
  qanda?: Category[];
  sets: string[];
}