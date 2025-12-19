import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetSelectionComponent } from '../src/app/components/set-selection/set-selection.component';

describe('SetSelectionComponent', () => {
  let component: SetSelectionComponent;
  let fixture: ComponentFixture<SetSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetSelectionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SetSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit setSelected when onSelectSet is called', () => {
    spyOn(component.setSelected, 'emit');
    const setName = 'test-set';

    component.onSelectSet(setName);

    expect(component.setSelected.emit).toHaveBeenCalledWith(setName);
  });

  it('should display available sets', () => {
    component.availableSets = ['set1', 'set2'];
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelectorAll('button').length).toBe(2);
    expect(compiled.textContent).toContain('set1');
    expect(compiled.textContent).toContain('set2');
  });
});