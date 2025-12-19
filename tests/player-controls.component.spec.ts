import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerControlsComponent } from '../src/app/components/player-controls/player-controls.component';
import { Player } from '../src/app/models/game.models';

describe('PlayerControlsComponent', () => {
  let component: PlayerControlsComponent;
  let fixture: ComponentFixture<PlayerControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerControlsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerControlsComponent);
    component = fixture.componentInstance;
    component.player = { id: 1, name: 'Test', score: 0, btn: 'btn1', bgcolor: '#fff', fgcolor: '#000', key: '1', remainingtime: null };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit rename event when onRename is called', () => {
    spyOn(component.rename, 'emit');
    const player: Player = { id: 1, name: 'Test', score: 0, btn: 'btn1', bgcolor: '#fff', fgcolor: '#000', key: '1', remainingtime: null };
    component.player = player;

    component.onRename();

    expect(component.rename.emit).toHaveBeenCalledWith(player);
  });

  it('should emit scoreAdjust event with positive amount for onPlus', () => {
    spyOn(component.scoreAdjust, 'emit');
    const player: Player = { id: 1, name: 'Test', score: 0, btn: 'btn1', bgcolor: '#fff', fgcolor: '#000', key: '1', remainingtime: null };
    component.player = player;

    component.onPlus();

    expect(component.scoreAdjust.emit).toHaveBeenCalledWith({ player, amount: 100 });
  });

  it('should emit scoreAdjust event with negative amount for onMinus', () => {
    spyOn(component.scoreAdjust, 'emit');
    const player: Player = { id: 1, name: 'Test', score: 0, btn: 'btn1', bgcolor: '#fff', fgcolor: '#000', key: '1', remainingtime: null };
    component.player = player;

    component.onMinus();

    expect(component.scoreAdjust.emit).toHaveBeenCalledWith({ player, amount: -100 });
  });

  it('should display player info', () => {
    const player: Player = { id: 1, name: 'Alice', score: 500, btn: 'btn1', bgcolor: '#ff0000', fgcolor: '#ffffff', key: '1', remainingtime: 5 };
    component.player = player;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.player-name').textContent).toContain('Alice');
    expect(compiled.querySelector('.score').textContent).toContain('500');
  });
});