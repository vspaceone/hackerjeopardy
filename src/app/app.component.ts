import { HostListener, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Howl, Howler } from 'howler';

declare var jquery:any;
declare var $ :any;

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
	  r: parseInt(result[1], 16),
	  g: parseInt(result[2], 16),
	  b: parseInt(result[3], 16)
	} : null;
  }



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

	constructor(private http: HttpClient) { 
	};

	selectedQuestion = undefined
	renamePlayer = undefined
	couldBeCanceled = true;
	audiotimer = null;
	activePlayer = null;
	pressedKeys = null;
	TIMEOUT = 6;
	timer = null;

	clicksoundfile = new Howl({
		src: ['assets/click.mp3']
	});
	successsoundfile = new Howl({
		src: ['assets/success_notification.mp3']
	});
	failsoundfile = new Howl({
		src: ['assets/fail_notification.mp3']
	});
	clocksoundfile = new Howl({
		src: ['assets/clock.mp3']
	});

	playerActivated(q,p):void {

	}
	playerTimeouted(q,p):void {

	}


	@HostListener('document:keydown', ['$event'])
	handleKeyboardEvent(event: KeyboardEvent) {
		console.log(event);
		var key = event.key;
		if (key != "1" && key != "2" && key != "3" && key != "4") {
			console.log("Key must be in 1,2,3,4.")
			return;
		}
		if (!this.selectedQuestion) {
			console.log("No selected question.")
		}
		this.clicksound();
		this.activate(this.selectedQuestion,parseInt(key))

	}

	startAudio(): void {
		this.audiotimer = setTimeout(() => {
			$('#audiotheme').trigger('play')
		 }, 5000);
	}

	stopAudio(): void {
		clearTimeout(this.audiotimer);
		$('#audiotheme').trigger('pause')
		$('#audiotheme').trigger('load')

	}

	clicksound(): void {
		this.clicksoundfile.play()
	}

	successsound(): void {
		this.successsoundfile.play()
	}
	failsound(): void {
		this.failsoundfile.play()
	}
	clocksound(): void {
		this.clocksoundfile.play()
	}

	onSelect(q): void {
		this.clicksound();
		this.startAudio();
		
		console.log("Hallo onSelect", q);
		this.selectedQuestion = q;
		q.activePlayers = new Set();
		q.activePlayersArr = Array.from(q.activePlayers)
		q.timeoutPlayers = new Set();
		q.timeoutPlayersArr = Array.from(q.timeoutPlayers)
		q.availablePlayers = new Set( [1,2,3,4] );

		q.buttonsActive = true;
		this.couldBeCanceled = true;
	}

	activate(q,pid): void {
		pid = parseInt(pid);
		if (q.activePlayers.has(pid)) {
			return;
		}
		if (!q.availablePlayers.has(pid)) {
			return;
		}
		if (!q.available){
			return;
		}

		q.availablePlayers.delete(pid);

		if (q.activePlayers.size == 0){
			this.clicksound();
			this.stopAudio();
			q.activePlayers.add(pid);
			q.activePlayersArr = Array.from(q.activePlayers)
			q.activePlayer = this.getPlayerByID(q.activePlayersArr[0]);
			if (!this.timer){
				this.timer = setInterval(() => {
					this.decTimer()
				},1000);
			}


		}else{
			q.activePlayers.add(pid);
			q.activePlayersArr = Array.from(q.activePlayers)
		}

		this.getPlayerByID(pid).remainingtime = this.TIMEOUT;
	}

	decTimer(): void {
		this.selectedQuestion.activePlayer.remainingtime --;
		this.clocksound();
		if (this.selectedQuestion.activePlayer.remainingtime == 0){
			this.incorrect(this.selectedQuestion);
		}
	}

	indeedcorrect(q,pid): void {
		this.clicksound();
		this.stopAudio();
		this.successsound();

		clearInterval(this.timer);
		this.timer = null;

		let p = this.getPlayerByID(pid);
		p.score = p.score + (this.selectedQuestion.value * 2);

		q.player = p;
		q.available = false;
		q.availablePlayers.clear();
		q.activePlayers.clear()
		q.activePlayersArr = Array.from(q.activePlayers)

		
		this.couldBeCanceled = false;
	}

	correct(q): void {
		this.clicksound();
		this.stopAudio();
		this.successsound();

		clearInterval(this.timer);
		this.timer = null;

		let p = this.getPlayerByID(q.activePlayersArr[0]);
		p.score = p.score + this.selectedQuestion.value;

		q.player = p;
		q.available = false;
		q.availablePlayers.clear();
		q.activePlayers.clear()
		q.activePlayersArr = Array.from(q.activePlayers)

		
		this.couldBeCanceled = false;
	}

	incorrect(q): void {
		this.clicksound();
		this.stopAudio();
		this.failsound();
		let p = this.getPlayerByID(q.activePlayersArr[0]);
		p.score = p.score - this.selectedQuestion.value;

		q.activePlayers.delete(q.activePlayersArr[0]);
		q.activePlayersArr = Array.from(q.activePlayers)

		if (!this.selectedQuestion.timeoutPlayers.has(p.id)){
			this.selectedQuestion.timeoutPlayers.add(p.id)
			this.selectedQuestion.timeoutPlayersArr = Array.from(this.selectedQuestion.timeoutPlayers)
		}
		
		if (q.availablePlayers.size == 0 && q.activePlayers.size == 0){
			this.notanswered(q);
		}

		//q.available = false
		this.couldBeCanceled = false;

		if (q.activePlayers.size > 0){
			q.activePlayer = this.getPlayerByID(Array.from(q.activePlayers)[0]);
			q.activePlayer.activationtime = (new Date()).getTime();
		}else{	
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	notanswered(q): void {
		this.clicksound();
		this.stopAudio();

		clearInterval(this.timer);
		this.timer = null;
		
		q.availablePlayers.clear();
		q.player = {"btn":"none"};
		q.available = false;
		this.couldBeCanceled = false;

		clearInterval(this.timer);

	}

	selectSet(s): void {
		this.clicksound()
		this.http.get("/assets/"+s+"/round.json").subscribe(data => {
			this.qanda = []
			for( var i = 0; i <= data["categories"].length-1; i ++){
				this.http.get("/assets/"+s+"/"+data["categories"][i]+"/cat.json").subscribe(cat => {
					for( var qIdx = 0; qIdx < cat["questions"].length; qIdx++){
						cat["questions"][qIdx].available = true;
						cat["questions"][qIdx].player = {"btn":"primary"};
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

	minus(p): void {
		p.score = p.score - 100
	}

	plus(p): void {
		p.score = p.score + 100
	}

	close(): void {
		this.clicksound()
		this.stopAudio()
		this.selectedQuestion = undefined
	}

	cancel(): void {
		this.clicksound()
		this.stopAudio()
		this.selectedQuestion = undefined
	}

	rename(p): void {
		this.clicksound()
		this.renamePlayer = p
	}

	renameFinished(): void {
		this.clicksound()
		this.renamePlayer = undefined
	}

	getPlayerByID(id){
		console.log("getPlayerById", id)
		for(var i = 0;i<4;i++) {
			if (this.players[i].id == id){
				return this.players[i];
			}
		}
		return null;
	}

	players = [
		{"id": 1, "btn": "player1", "name":"player1", "score": 0, "bgcolor": "#ff6b6b", "fgcolor": "#9f0b0b", "key": "1", "remainingtime": null},
		{"id": 2, "btn": "player2", "name":"player2", "score": 0, "bgcolor": "#6eff6b", "fgcolor": "#0e9f0b", "key": "2", "remainingtime": null},
		{"id": 3, "btn": "player3", "name":"player3", "score": 0, "bgcolor": "#9cfcff", "fgcolor": "#3c9c9f", "key": "3", "remainingtime": null},
		{"id": 4, "btn": "player4", "name":"player4", "score": 0, "bgcolor": "#ffe48c", "fgcolor": "#efb600", "key": "4", "remainingtime": null}
	]

	qanda = undefined;

	sets_vspace = [
		"XMAS19_1_de",
		"XMAS19_2_de",
		"XMAS19_3_de",
		"XMAS19_4_de",
		"Lounge_And_Chill_1_de",
		"Lounge_And_Chill_2_de",
		"Lounge_And_Chill_3_de",
		//"Tim_Runde",
		"XMAS18_0_de",
		"XMAS18_1_de",
		"XMAS22_1_en",
		"XMAS22_2_en",
		"XMAS22_3_en",
		"mixed_bag_round"
	];

	sets_kit = [
		"XMAS19_1_en",
		"XMAS19_2_en",
		"XMAS19_3_en",
		//"XMAS19_4_en",
		"Lounge_And_Chill_1_en",
		"Lounge_And_Chill_2_en",
		//"Lounge_And_Chill_3_en",
		//"Tim_Runde",
		"XMAS18_1_en",
		//"XMAS18_2_en",
		"XMAS22_1_en",
		"XMAS22_2_en",
		"XMAS22_3_en",
		"Demo"
	];

	sets = this.sets_vspace;

 }
