import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';


  selectedQuestion = undefined

  onSelect(q): void {
    console.log("Hallo onSelect", q)
    this.selectedQuestion = q
  }

  answered(q,p): void {
    console.log(q)

    if(!p){

    }else{
      p.score = p.score + this.selectedQuestion.value;
    }
    q.available = false
  }

  notanswered(q,p): void {
    console.log(q)

    if(!p){

    }else{
      p.score = p.score - this.selectedQuestion.value;
    }
    q.available = false
  }


  close(): void {
    this.selectedQuestion = undefined
  }

  cancel(): void {
    this.selectedQuestion = undefined
  }

  category = [
    "ports","ports","ports","ports","ports"
  ]

  players = [
    {"name":"max", "score": 0},
    {"name":"nils", "score": 0},
    {"name":"tom", "score": 0}
  ]

  qanda = [[
      {"question":"Welchen Port hat SSH?333", "answer": "223", "value":100,"available":true},
      {"question":"Welchen Port hat SSH?", "image": "https://www.gettyimages.com/gi-resources/images/CreativeLandingPage/HP_Sept_24_2018/CR3_GettyImages-159018836.jpg", "value":200,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":300,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":400,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":500,"available":true},
    ],
    [
      {"question":"Welchen Port hat SSH?", "answer": "Was soll ich für einen Satz schrieben?", "value":100,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":200,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":300,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":400,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":500,"available":true},
    ],
    [
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":100,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":200,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":300,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":400,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":500,"available":true},
    ],
    [
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":100,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":200,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":300,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":400,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":500,"available":true},
    ],
    [
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":100,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":200,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":300,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":400,"available":true},
      {"question":"Welchen Port hat SSH?", "answer": "22", "value":500,"available":true},
    ]
  ]
}
