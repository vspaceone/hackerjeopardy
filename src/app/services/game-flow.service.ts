import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { Category, Question } from '../models/game.models';

@Injectable({
  providedIn: 'root'
})
export class GameFlowService {

  constructor(private http: HttpClient) { }

  selectSet(setName: string): Observable<Category[]> {
    return this.http.get<any>(`/assets/${setName}/round.json`).pipe(
      // Process the data
    );
  }

  // Other methods
}