import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { Player, Question } from '../models/game.models';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDefaultPlayers', () => {
    it('should return 4 default players with correct properties', () => {
      const players = service.getDefaultPlayers();
      expect(players.length).toBe(4);
      expect(players[0].name).toBe('player1');
      expect(players[0].score).toBe(0);
      expect(players[0].key).toBe('1');
      expect(players[0].remainingtime).toBeNull();
    });
  });

  describe('getPlayerById', () => {
    it('should return the correct player by id', () => {
      const players = service.getDefaultPlayers();
      const player = service.getPlayerById(1, players);
      expect(player).toBe(players[0]);
    });

    it('should return null for non-existent id', () => {
      const players = service.getDefaultPlayers();
      const player = service.getPlayerById(999, players);
      expect(player).toBeNull();
    });
  });

  describe('activatePlayer', () => {
    let question: Question;
    let players: Player[];

    beforeEach(() => {
      players = service.getDefaultPlayers();
      question = {
        question: 'Test question',
        cat: 'Test category',
        value: 200,
        available: true,
        availablePlayers: new Set([1, 2, 3, 4]),
        activePlayers: new Set(),
        activePlayersArr: [],
        activePlayer: null,
        timeoutPlayers: new Set(),
        timeoutPlayersArr: [],
        player: null,
        buttonsActive: true
      };
    });

    it('should activate first player and start timer', () => {
      spyOn(window, 'setInterval').and.callThrough();
      const result = service.activatePlayer(question, 1, players);
      expect(result).toBeTruthy();
      expect(question.activePlayers.has(1)).toBeTruthy();
      expect(question.activePlayer).toBe(players[0]);
      expect(players[0].remainingtime).toBe(6);
      expect(window.setInterval).toHaveBeenCalled();
    });

    it('should not activate already active player', () => {
      question.activePlayers.add(1);
      const result = service.activatePlayer(question, 1, players);
      expect(result).toBeFalsy();
    });

    it('should add second player to active players', () => {
      service.activatePlayer(question, 1, players);
      service.clearTimer(); // clear to avoid timer
      const result = service.activatePlayer(question, 2, players);
      expect(result).toBeTruthy();
      expect(question.activePlayers.has(2)).toBeTruthy();
      expect(question.activePlayers.size).toBe(2);
    });
  });

  describe('correctAnswer', () => {
    it('should award points to active player and mark question unavailable', () => {
      const players = service.getDefaultPlayers();
      const question: Question = {
        question: 'Test question',
        cat: 'Test category',
        value: 200,
        available: true,
        availablePlayers: new Set([1]),
        activePlayers: new Set([1]),
        activePlayersArr: [1],
        activePlayer: players[0],
        timeoutPlayers: new Set(),
        timeoutPlayersArr: [],
        player: null,
        buttonsActive: true
      };

      service.correctAnswer(question);
      expect(players[0].score).toBe(200);
      expect(question.available).toBeFalsy();
      expect(question.player).toBe(players[0]);
    });
  });

  describe('incorrectAnswer', () => {
    it('should deduct points and remove from active players', () => {
      const players = service.getDefaultPlayers();
      const question: Question = {
        question: 'Test question',
        cat: 'Test category',
        value: 200,
        available: true,
        availablePlayers: new Set(),
        activePlayers: new Set([1]),
        activePlayersArr: [1],
        activePlayer: players[0],
        timeoutPlayers: new Set(),
        timeoutPlayersArr: [],
        player: null,
        buttonsActive: true
      };

      service.incorrectAnswer(question);
      expect(players[0].score).toBe(-200);
      expect(question.activePlayers.has(1)).toBeFalsy();
      expect(question.timeoutPlayers.has(1)).toBeTruthy();
    });
  });



  describe('adjustPlayerScore', () => {
    it('should adjust player score by given amount', () => {
      const player: Player = { id: 1, name: 'test', score: 100, btn: 'btn', bgcolor: '#fff', fgcolor: '#000', key: '1', remainingtime: null };
      service.adjustPlayerScore(player, 50);
      expect(player.score).toBe(150);
    });
  });

  describe('getTimeout', () => {
    it('should return timeout value', () => {
      expect(service.getTimeout()).toBe(6);
    });
  });

  describe('clearTimer', () => {
    it('should clear the timer', () => {
      spyOn(window, 'clearInterval').and.callThrough();
      service['timer'] = 123 as any;
      service.clearTimer();
      expect(service['timer']).toBeNull();
      expect(window.clearInterval).toHaveBeenCalledWith(123);
    });
  });
});