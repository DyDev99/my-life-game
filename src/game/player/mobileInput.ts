/**
 * Lightweight transient input bridge for mobile touch controls.
 * Avoids store-setting on every touchmove event to maintain locked 60/120 FPS.
 */

class MobileInputBridge {
  private joyX: number = 0;
  private joyY: number = 0;

  private lookDeltaX: number = 0;
  private lookDeltaY: number = 0;

  public isFiring: boolean = false;
  public shootOnce: boolean = false;
  public isAiming: boolean = false;
  public isJumping: boolean = false;
  public isCrouching: boolean = false;

  public setJoystick(x: number, y: number) {
    this.joyX = Math.max(-1, Math.min(1, x));
    this.joyY = Math.max(-1, Math.min(1, y));
  }

  public getJoystick(): { x: number; y: number } {
    return { x: this.joyX, y: this.joyY };
  }

  public addLookDelta(dx: number, dy: number) {
    this.lookDeltaX += dx;
    this.lookDeltaY += dy;
  }

  public consumeLookDelta(): { dx: number; dy: number } {
    const dx = this.lookDeltaX;
    const dy = this.lookDeltaY;
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
    return { dx, dy };
  }

  public triggerJump() {
    this.isJumping = true;
  }

  public consumeJump(): boolean {
    const j = this.isJumping;
    this.isJumping = false;
    return j;
  }

  public toggleCrouch() {
    this.isCrouching = !this.isCrouching;
  }
}

export const mobileInput = new MobileInputBridge();
