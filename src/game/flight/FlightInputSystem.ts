/**
 * Unified Cross-Platform Flight Input System
 * Normalizes input from Keyboard, Mouse Steering, Mobile Touch, and Gamepads.
 * Provides clean, framerate-independent, normalized control values for 3D flight physics.
 */

export interface FlightInputState {
  pitch: number;      // -1.0 (dive / nose down) to +1.0 (climb / nose up)
  roll: number;       // -1.0 (bank left) to +1.0 (bank right)
  yaw: number;        // -1.0 (yaw left) to +1.0 (yaw right)
  throttle: number;   // 0.0 to 1.0 (cruising power)
  boost: boolean;     // Afterburner active
  airbrake: boolean;  // Airbrake deceleration
  fire: boolean;      // Missile fire trigger (rising edge only)
  cycleTarget: boolean;
  changeCamera: boolean;
  pause: boolean;
  reload: boolean;    // Missile rearm trigger
}

class FlightInputManager {
  // Mobile virtual joystick & buttons
  private touchStick = { x: 0, y: 0 };
  private touchThrottle = 0.0; // Default idle on ground/runway
  private touchBoost = false;
  private touchAirbrake = false;
  private touchFire = false;
  private touchCycleTarget = false;
  private touchChangeCamera = false;
  private touchPause = false;
  private touchReload = false;

  // Active keyboard keys map
  private keys: Record<string, boolean> = {};
  // Rising-edge one-shot keys pressed in the current cycle
  private justPressedKeys: Set<string> = new Set();

  // Mouse flight stick accumulator
  private mouseDelta = { x: 0, y: 0 };

  // Previous frame gamepad buttons state for rising edge detection
  private prevGamepadButtons: boolean[] = [];

  private isInitialized = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initListeners();
    }
  }

  private initListeners() {
    if (this.isInitialized || typeof window === "undefined") return;
    this.isInitialized = true;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      const code = e.code.toLowerCase();
      if (!this.keys[k] && !this.keys[code]) {
        this.justPressedKeys.add(k);
        this.justPressedKeys.add(code);
      }
      this.keys[k] = true;
      this.keys[code] = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const code = e.code.toLowerCase();
      delete this.keys[k];
      delete this.keys[code];
      this.justPressedKeys.delete(k);
      this.justPressedKeys.delete(code);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        this.mouseDelta.x += e.movementX;
        this.mouseDelta.y += e.movementY;
      }
    };

    const onBlur = () => {
      this.resetAll();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        this.resetAll();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibilityChange);
  }

  private consumeKey(...keyNames: string[]): boolean {
    for (const name of keyNames) {
      const lower = name.toLowerCase();
      if (this.justPressedKeys.has(lower)) {
        this.justPressedKeys.delete(lower);
        return true;
      }
    }
    return false;
  }

  private pollGamepadRisingEdge(btnIndex: number): boolean {
    if (typeof navigator === "undefined" || !navigator.getGamepads) return false;
    try {
      const gp = navigator.getGamepads()[0] || navigator.getGamepads()[1];
      if (!gp || !gp.connected || !gp.buttons || !gp.buttons[btnIndex]) return false;
      const isPressed = Boolean(gp.buttons[btnIndex]?.pressed);
      const wasPressed = Boolean(this.prevGamepadButtons[btnIndex]);
      this.prevGamepadButtons[btnIndex] = isPressed;
      return !wasPressed && isPressed;
    } catch {
      return false;
    }
  }

  public resetAll() {
    this.keys = {};
    this.justPressedKeys.clear();
    this.prevGamepadButtons = [];
    this.touchStick = { x: 0, y: 0 };
    this.touchBoost = false;
    this.touchAirbrake = false;
    this.touchFire = false;
    this.touchCycleTarget = false;
    this.touchChangeCamera = false;
    this.touchPause = false;
    this.touchReload = false;
    this.mouseDelta = { x: 0, y: 0 };
  }

  // --- MOBILE TOUCH BRIDGE ---
  public setTouchStick(x: number, y: number) {
    this.touchStick.x = Math.max(-1, Math.min(1, x));
    this.touchStick.y = Math.max(-1, Math.min(1, y));
  }

  public setTouchThrottle(val: number) {
    this.touchThrottle = Math.max(0, Math.min(1, val));
  }

  public setTouchBoost(active: boolean) {
    this.touchBoost = active;
  }

  public setTouchAirbrake(active: boolean) {
    this.touchAirbrake = active;
  }

  public triggerTouchFire() {
    this.touchFire = true;
  }

  public triggerTouchReload() {
    this.touchReload = true;
  }

  public triggerTouchCycleTarget() {
    this.touchCycleTarget = true;
  }

  public triggerTouchChangeCamera() {
    this.touchChangeCamera = true;
  }

  public triggerTouchPause() {
    this.touchPause = true;
  }

  // --- SAMPLE INPUT PER FRAME ---
  public sampleInput(options: {
    sensitivity: number;
    invertPitch: boolean;
    mouseFlightEnabled: boolean;
  }): FlightInputState {
    const k = this.keys;
    const sens = options.sensitivity || 1.0;

    let pitch = 0;
    let roll = 0;
    let yaw = 0;

    // 1. Keyboard Controls
    // Standard Aviation: S / Down pulls stick back (Nose UP / Climb / Rotate)
    // W / Up pushes stick forward (Nose DOWN / Dive)
    if (k["s"] || k["arrowdown"]) pitch += 1;
    if (k["w"] || k["arrowup"]) pitch -= 1;
    // A / Left: Roll Left, D / Right: Roll Right
    if (k["a"] || k["arrowleft"]) roll -= 1;
    if (k["d"] || k["arrowright"]) roll += 1;
    // Q / E: Yaw Left / Right
    if (k["q"]) yaw -= 1;
    if (k["e"]) yaw += 1;

    // 2. Touch Joystick Input (Left thumb)
    if (Math.abs(this.touchStick.x) > 0.05) {
      roll += this.touchStick.x;
    }
    if (Math.abs(this.touchStick.y) > 0.05) {
      pitch += this.touchStick.y;
    }

    // 3. Optional Mouse Flight Steering
    if (options.mouseFlightEnabled && (this.mouseDelta.x !== 0 || this.mouseDelta.y !== 0)) {
      const mouseSens = 0.02 * sens;
      roll += Math.max(-1, Math.min(1, this.mouseDelta.x * mouseSens));
      pitch -= Math.max(-1, Math.min(1, this.mouseDelta.y * mouseSens));
      this.mouseDelta.x = 0;
      this.mouseDelta.y = 0;
    }

    // 4. Gamepad Controller Support
    if (typeof navigator !== "undefined" && navigator.getGamepads) {
      const gp = navigator.getGamepads()[0] || navigator.getGamepads()[1];
      if (gp && gp.connected) {
        const deadzone = 0.12;
        const lx = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
        const ly = Math.abs(gp.axes[1]) > deadzone ? gp.axes[1] : 0;
        roll += lx;
        pitch += ly;

        // Bumpers for yaw
        if (gp.buttons[4]?.pressed) yaw -= 1;
        if (gp.buttons[5]?.pressed) yaw += 1;
      }
    }

    // Invert Pitch Option
    if (options.invertPitch) {
      pitch = -pitch;
    }

    // Apply Sensitivity & Clamp to [-1, 1]
    pitch = Math.max(-1, Math.min(1, pitch * sens));
    roll = Math.max(-1, Math.min(1, roll * sens));
    yaw = Math.max(-1, Math.min(1, yaw * sens));

    // Boost & Airbrake
    const boost = Boolean(
      k["shift"] ||
      k["shiftleft"] ||
      k["shiftright"] ||
      this.touchBoost ||
      (typeof navigator !== "undefined" && (navigator.getGamepads?.()[0]?.buttons[7]?.pressed ?? false))
    );

    const airbrake = Boolean(
      k["control"] ||
      k["controlleft"] ||
      k["controlright"] ||
      this.touchAirbrake ||
      (typeof navigator !== "undefined" && (navigator.getGamepads?.()[0]?.buttons[6]?.pressed ?? false))
    );

    // Throttle calculation
    let throttle = this.touchThrottle;
    if (boost) {
      throttle = 1.0;
    } else if (airbrake) {
      throttle = 0.0;
    } else if (k["w"] || k["arrowup"]) {
      // Holding W supplies forward engine throttle (takeoff roll and military speed)
      throttle = 1.0;
    } else if (k["control"] || k["controlleft"]) {
      throttle = 0.1;
    } else {
      // Natural cruising throttle when airborne
      throttle = Math.max(this.touchThrottle, 0.65);
    }

    // Clean Rising-Edge Actions (Never auto-repeats or spams)
    const fireKey = this.consumeKey(" ", "space", "enter", "j");
    const fireGamepad = this.pollGamepadRisingEdge(0);
    const fire = Boolean(fireKey || this.touchFire || fireGamepad);

    const cycleKey = this.consumeKey("tab");
    const cycleGamepad = this.pollGamepadRisingEdge(3);
    const cycleTarget = Boolean(cycleKey || this.touchCycleTarget || cycleGamepad);

    const camKey = this.consumeKey("c");
    const camGamepad = this.pollGamepadRisingEdge(1);
    const changeCamera = Boolean(camKey || this.touchChangeCamera || camGamepad);

    const pauseKey = this.consumeKey("escape", "p");
    const pauseGamepad = this.pollGamepadRisingEdge(9);
    const pause = Boolean(pauseKey || this.touchPause || pauseGamepad);

    const reloadKey = this.consumeKey("r");
    const reloadGamepad = this.pollGamepadRisingEdge(2);
    const reload = Boolean(reloadKey || this.touchReload || reloadGamepad);

    // Reset single-pulse touch triggers
    this.touchFire = false;
    this.touchCycleTarget = false;
    this.touchChangeCamera = false;
    this.touchPause = false;
    this.touchReload = false;

    return {
      pitch,
      roll,
      yaw,
      throttle,
      boost,
      airbrake,
      fire,
      cycleTarget,
      changeCamera,
      pause,
      reload,
    };
  }
}

export const flightInput = new FlightInputManager();
