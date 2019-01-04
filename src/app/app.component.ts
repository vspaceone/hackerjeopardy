import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
declare var jquery:any;
declare var $ :any;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(private http: HttpClient) { };

  selectedQuestion = undefined
  renamePlayer = undefined
  couldBeCanceled = true;


  onSelect(q): void {
    console.log("Hallo onSelect", q)
    this.selectedQuestion = q
    this.couldBeCanceled = true;
  }

  answered(q,p): void {
    console.log(q)

    if(!p){

    }else{
      p.score = p.score + this.selectedQuestion.value;
    }
    q.available = false;
    q.color = p.color;
    this.couldBeCanceled = false;
  }

  selectSet(s): void {
    this.http.get("/assets/"+s).subscribe(data => {
      this.qanda = data;
    })
  }

  notanswered(q,p): void {
    console.log(q)

    if(!p){

    }else{
      p.score = p.score - this.selectedQuestion.value;
    }
    //q.available = false
    this.couldBeCanceled = false;
  }

  minus(p): void {
    p.score = p.score - 100
  }

  plus(p): void {
    p.score = p.score + 100
  }

  close(): void {
    this.selectedQuestion = undefined
  }

  cancel(): void {
    this.selectedQuestion = undefined
  }

  rename(p): void {
    this.renamePlayer = p
  }

  renameFinished(): void {
    this.renamePlayer = undefined
  }

  players = [
    {"name":"player1", "score": 0, "color": "#ff6b6b"},
    {"name":"player2", "score": 0, "color": "#6eff6b"},
    {"name":"player3", "score": 0, "color": "#6771f1"}
  ]

  qanda = undefined;
  sets = ["xmas18_rnd1.json", "xmas18_rnd2.json"];

}
