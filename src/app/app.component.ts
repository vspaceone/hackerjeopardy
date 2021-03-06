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
		$('#audiotheme').trigger('play')
		console.log("Hallo onSelect", q)
		this.selectedQuestion = q
		this.couldBeCanceled = true;
	}

	answered(q,p): void {
		console.log(q)
		$('#audiotheme').trigger('pause')
		$('#audiotheme').trigger('load')

		if(!p){
			
		}else{
			p.score = p.score + this.selectedQuestion.value;
			q.bgcolor = p.bgcolor;
			q.fgcolor = p.fgcolor;
		}
		q.available = false;
		
		this.couldBeCanceled = false;
	}

	selectSet(s): void {
		this.http.get("/assets/"+s+"/turn.json").subscribe(data => {
			this.qanda = []
			for( var i = 0; i <= data["categories"].length-1; i ++){
				this.http.get("/assets/"+s+"/"+data["categories"][i]+"/cat.json").subscribe(cat => {
					for( var qIdx = 0; qIdx < cat["questions"].length; qIdx++){
						cat["questions"][qIdx].available = true;
						cat["questions"][qIdx].value = (qIdx + 1) * 100;
						cat["questions"][qIdx].cat = cat["name"]
						if(cat["questions"][qIdx]["image"] && cat["path"]){
							cat["questions"][qIdx]["image"] = "assets/"+s+"/"+cat["path"]+"/"+cat["questions"][qIdx]["image"]
						}
						else if(cat["questions"][qIdx]["image"] && cat["name"]){
							cat["questions"][qIdx]["image"] = "assets/"+s+"/"+cat["name"]+"/"+cat["questions"][qIdx]["image"]
						}
					}
					console.log(cat);
					this.qanda.push(cat);
				});
			}
			for( var catIdx = 0; catIdx < (this.qanda.length); catIdx++){
				for( var qIdx = 0; qIdx < (this.qanda[catIdx].questions.length); qIdx++){
					this.qanda[catIdx].questions[qIdx].available = true;
					this.qanda[catIdx].questions[qIdx].value = (qIdx + 1) * 100;
					
				}
			}
		});
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
		$('#audiotheme').trigger('pause')
		$('#audiotheme').trigger('load')
		this.selectedQuestion = undefined
	}

	cancel(): void {
		$('#audiotheme').trigger('pause')
		$('#audiotheme').trigger('load')
		this.selectedQuestion = undefined
	}

	rename(p): void {
		this.renamePlayer = p
	}

	renameFinished(): void {
		this.renamePlayer = undefined
	}

	players = [
		{"name":"player1", "score": 0, "bgcolor": "#ff6b6b", "fgcolor": "#9f0b0b"},
		{"name":"player2", "score": 0, "bgcolor": "#6eff6b", "fgcolor": "#0e9f0b"},
		{"name":"player3", "score": 0, "bgcolor": "#9cfcff", "fgcolor": "#3c9c9f"}
	]

	qanda = undefined;
	sets = [
		"XMAS19-Turn1",
		"XMAS19-Turn2",
		"XMAS19-Turn3",
		"XMAS19-Turn4",
		"Lounge_And_Chill_1",
		"Lounge_And_Chill_2",
		"Lounge_And_Chill_3",
		"Tim_Runde",
		"XMAS18_RND1",
		"XMAS18_RND2"
	];

}
