import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { GameRound, Category, Question } from '../models/game.models';

@Injectable({
  providedIn: 'root'
})
export class GameDataService {
  private readonly SETS_VSPACE = [
    "XMAS19_1_de",
    "XMAS19_2_de", 
    "XMAS19_3_de",
    "XMAS19_4_de",
    "Lounge_And_Chill_1_de",
    "Lounge_And_Chill_2_de",
    "Lounge_And_Chill_3_de",
    "XMAS18_1_de",
    "XMAS18_2_de",
    "XMAS22_1_en",
    "XMAS22_2_en",
    "mixed_bag_round",
    "AlexRound"
  ];

  private readonly SETS_KIT = [
    "Lounge_And_Chill_1",
    "Lounge_And_Chill_3",
    "Tim_Runde",
    "XMAS18_RND1",
    "XMAS18_RND2",
    "XMAS19-Turn3"
  ];

  constructor(private http: HttpClient) {}

  getAvailableSets(useVspace: boolean = false): string[] {
    return useVspace ? this.SETS_VSPACE : this.SETS_KIT;
  }

  loadGameRound(setName: string): Observable<Category[]> {
    return new Observable<Category[]>(observer => {
      this.http.get<GameRound>(`/assets/${setName}/turn.json`).subscribe(
        (roundData: GameRound) => {
          const categoryRequests = roundData.categories.map(categoryName =>
            this.http.get<Category>(`/assets/${setName}/${categoryName}/cat.json`)
          );

          forkJoin(categoryRequests).subscribe(
            (categories: Category[]) => {
              const processedCategories = this.processCategories(categories, setName);
              observer.next(processedCategories);
              observer.complete();
            },
            (error) => {
              observer.error(error);
            }
          );
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }

  private processCategories(categories: Category[], setName: string): Category[] {
    return categories.map(category => {
      const processedQuestions = category.questions.map((question, qIdx) => {
        const processedQuestion: Question = {
          ...question,
          available: true,
          value: (qIdx + 1) * 100,
          cat: category.name,
          activePlayers: new Set<number>(),
          activePlayersArr: [],
          timeoutPlayers: new Set<number>(),
          timeoutPlayersArr: [],
          availablePlayers: new Set<number>([1, 2, 3, 4]),
          buttonsActive: false,
          hasIncorrectAnswers: false
        };

        if (question.image && category.path) {
          processedQuestion.image = `assets/${setName}/${category.path}/${question.image}`;
        } else if (question.image && category.name) {
          processedQuestion.image = `assets/${setName}/${category.name}/${question.image}`;
        }

        return processedQuestion;
      });

      return {
        ...category,
        questions: processedQuestions
      };
    });
  }
}