import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';


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
    q.available = false
    this.couldBeCanceled = false;
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

  category = [
    "Ports","Personen","Fremdsprachen","Zahlen","Icons"
  ]

  players = [
    {"name":"player1", "score": 0},
    {"name":"player2", "score": 0},
    {"name":"player3", "score": 0}
  ]

  qanda = [[
      {"question":"Welchen Port hat HTTP?", "answer": "80", "value":100,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":200,"available":true},
      {"question":"Welchen Port hat DNS?", "answer": "53", "value":300,"available":true},
      {"question":"Welchen Port hat NTP?", "answer": "123", "value":400,"available":true},
      {"question":"Welchen Port hat IRC?", "answer": "194", "value":500,"available":true},
    ],
    [
      {"question":"Wie sieht Bill Gates aus?", "image": "assets/gates.jpeg", "value":100,"available":true},
      {"question":"Wie sieht John von Neumann aus?", "image": "assets/neumann.gif", "value":200,"available":true},
      {"question":"Wie sieht Richard Stallman aus?", "image": "assets/stallman.JPG", "value":300,"available":true},
      {"question":"Wie sieht Donald E. Knuth aus?", "image": "assets/knuth.jpg", "value":400,"available":true},
      {"question":"Wie sieht Edsger W. Dijkstra aus?", "image": "assets/dijkstra.jpg", "value":500,"available":true},
    ],
    [
      {"question":"Wie sieht Python Code aus?", "image": "assets/python.png", "value":100,"available":true},
      {"question":"Wie sieht C++ Code aus", "image": "assets/cpp.png", "value":200,"available":true},
      {"question":"Wie sieht Perl Code aus?", "image": "assets/perl.png", "value":300,"available":true},
      {"question":"Wie sieht Shakespear Code aus?", "image": "assets/shakespear.png", "value":400,"available":true},
      {"question":"Wie sieht Brainfuck Code aus?", "image": "assets/brainfuck.png", "value":500,"available":true},
    ],
    [
      {"question":"An welchem Datum beginnt die Unix Time?", "answer": "1.Januar 1970", "value":100,"available":true},
      {"question":"Wieviel Speicherplatz hat eine 3.5 Zoll Diskette?", "answer": "3,4MB", "value":200,"available":true},
      {"question":"In welchen Jahren spielt 'Zurück in die Zukunft'?", "answer": "1885, 1955, 1985 und 2015", "value":300,"available":true},
      {"question":"Wann wurde der erste Linux Kernel released?", "answer": "17. September 1991", "value":400,"available":true},
      {"question":"Wann wurde der erste Z1 fertiggestellt?", "answer": "1938", "value":500,"available":true},
    ],
    [
      {"question":"Wie sieht das Icon von Linux aus?", "image": "assets/linux.png", "value":100,"available":true},
      {"question":"Wie sieht das Icon von Github aus?", "image": "assets/github.png", "value":200,"available":true},
      {"question":"Wie sieht das Icon vom Chaos Computer Club aus?", "image": "assets/ccc.png", "value":300,"available":true},
      {"question":"Wie sieht das Icon von Gradle aus?", "image": "assets/gradle.png", "value":400,"available":true},
      {"question":"Wie sieht das Icon von Apache aus?", "image": "assets/apache.jpeg", "value":500,"available":true},
    ]
  ]
}
