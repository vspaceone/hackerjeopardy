import { TestBed } from '@angular/core/testing';
import { AudioService } from './audio.service';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('playClick', () => {
    it('should play click sound', () => {
      spyOn(service['clicksound'], 'play');
      service.playClick();
      expect(service['clicksound'].play).toHaveBeenCalled();
    });
  });

  describe('playSuccess', () => {
    it('should play success sound', () => {
      spyOn(service['successsound'], 'play');
      service.playSuccess();
      expect(service['successsound'].play).toHaveBeenCalled();
    });
  });

  describe('playFail', () => {
    it('should play fail sound', () => {
      spyOn(service['failsound'], 'play');
      service.playFail();
      expect(service['failsound'].play).toHaveBeenCalled();
    });
  });

  describe('playClock', () => {
    it('should play clock sound', () => {
      spyOn(service['clocksound'], 'play');
      service.playClock();
      expect(service['clocksound'].play).toHaveBeenCalled();
    });
  });

  describe('startThemeMusic', () => {
    it('should start theme music after 5 seconds', () => {
      spyOn(window, 'setTimeout').and.callThrough();
      spyOn(service['themeAudio'], 'play');
      service.startThemeMusic();
      expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 5000);
    });
  });

  describe('stopThemeMusic', () => {
    it('should stop theme music and clear timer', () => {
      spyOn(window, 'clearTimeout').and.callThrough();
      spyOn(service['themeAudio'], 'pause');
      spyOn(service['themeAudio'], 'load');
      service['audiotimer'] = 123 as any;
      service.stopThemeMusic();
      expect(window.clearTimeout).toHaveBeenCalledWith(123);
      expect(service['themeAudio'].pause).toHaveBeenCalled();
      expect(service['themeAudio'].load).toHaveBeenCalled();
      expect(service['audiotimer']).toBeNull();
    });
  });
});