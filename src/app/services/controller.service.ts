import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ControllerService {
  private playerActivated = new Subject<number>();
  public playerActivated$ = this.playerActivated.asObservable();

  private gamepads: (Gamepad | null)[] = [];
  private lastButtonStates: boolean[][] = [];
  private animationFrameId: number | null = null;

  // Public observable for UI
  private connectedControllers = new Subject<Gamepad[]>();
  public connectedControllers$ = this.connectedControllers.asObservable();

  // WebHID for LED control
  private hidDevice: any = null;

  constructor() {
    this.startPolling();
  }

  private startPolling(): void {
    const poll = () => {
      this.updateGamepads();
      this.animationFrameId = requestAnimationFrame(poll);
    };
    poll();
  }

  private updateGamepads(): void {
    const currentGamepads = navigator.getGamepads();
    const buzzGamepads: { index: number; gamepad: Gamepad }[] = [];

    // Find Buzz controllers (first 2 detected, supporting up to 8 players)
    for (let i = 0; i < currentGamepads.length && buzzGamepads.length < 2; i++) {
      const gp = currentGamepads[i];
      if (gp && this.isBuzzController(gp)) {
        buzzGamepads.push({ index: i, gamepad: gp });
      }
    }

    // Update our tracked gamepads
    this.gamepads = buzzGamepads.map(bg => bg.gamepad);

    // Emit connected controllers for UI
    this.connectedControllers.next([...this.gamepads]);

    // Initialize button states if needed
    while (this.lastButtonStates.length < this.gamepads.length) {
      this.lastButtonStates.push([]);
    }
    this.lastButtonStates = this.lastButtonStates.slice(0, this.gamepads.length);

    // Check for button presses
    for (let i = 0; i < this.gamepads.length; i++) {
      const gp = this.gamepads[i];
      if (!gp) continue;

      // Initialize last states for this gamepad
      if (this.lastButtonStates[i].length !== gp.buttons.length) {
        this.lastButtonStates[i] = gp.buttons.map(b => b.pressed);
      }

      // Check each button
      for (let btnIdx = 0; btnIdx < gp.buttons.length; btnIdx++) {
        const isPressed = gp.buttons[btnIdx].pressed;
        const wasPressed = this.lastButtonStates[i][btnIdx];

        if (isPressed && !wasPressed) {
          // Button press detected
          // Map buttons to players: controller 0 buttons 0,5,10,15 → players 1-4
          // controller 1 buttons 0,5,10,15 → players 5-8
          if (btnIdx % 5 === 0) {
            const playerId = Math.floor(btnIdx / 5) + 1 + (i * 4); // i=0: 1-4, i=1: 5-8
            // Only activate if player exists (checked by subscriber, but limit to reasonable max)
            if (playerId <= 8) {
              this.playerActivated.next(playerId);
              this.setLed(playerId);
            }
          }
        }

        this.lastButtonStates[i][btnIdx] = isPressed;
      }
    }
  }

  private isBuzzController(gamepad: Gamepad): boolean {
    // Check gamepad ID for Buzz-related strings
    const id = gamepad.id.toLowerCase();
    return id.includes('buzz') || id.includes('sony') || id.includes('wireless');
  }

  async connectHID(): Promise<boolean> {
    if (!('hid' in navigator)) {
      console.error('WebHID not supported');
      return false;
    }
    try {
      // Check for already connected devices
      const existingDevices = await (navigator as any).hid.getDevices();
      console.log('Existing HID devices:', existingDevices);
      const buzzDevice = existingDevices.find((d: any) => d.vendorId === 0x054c && d.productId === 0x1000);
      if (buzzDevice) {
        this.hidDevice = buzzDevice;
        await this.hidDevice.open();
        console.log('Buzz HID device connected (existing)');
        return true;
      }

      console.log('Requesting HID device...');
      const devices = await (navigator as any).hid.requestDevice();
      console.log('HID devices returned:', devices);
      if (devices.length > 0) {
        this.hidDevice = devices[0];
        console.log('Opening device:', this.hidDevice.productName);
        await this.hidDevice.open();
        console.log('Buzz HID device connected');
        return true;
      } else {
        console.log('No matching HID devices found');
      }
    } catch (e) {
      console.error('HID connect failed', e);
    }
    return false;
  }

  private async setLed(playerId: number): Promise<void> {
    if (!this.hidDevice) return;
    try {
      // Assume output report ID 0, data [mask] where mask = 1 << (playerId - 1)
      // Supports up to 8 players with 8-bit mask
      const mask = 1 << (playerId - 1);
      await this.hidDevice.sendReport(0, new Uint8Array([mask]));
    } catch (e) {
      console.error('LED control failed', e);
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.hidDevice) {
      this.hidDevice.close();
    }
  }
}