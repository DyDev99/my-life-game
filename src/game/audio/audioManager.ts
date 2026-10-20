// Web Audio API Sound Synthesizer for "ជីវិតខ្ញុំ (My Life)"
// Generates warm, charming, cozy 8-bit / lo-fi audio chimes without external asset dependencies.

class AudioManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  // Motorbike Horn (Beep beep!)
  public playHorn() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.12].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(420, now + offset);
        osc.frequency.setValueAtTime(460, now + offset + 0.04);

        gain.gain.setValueAtTime(0.18, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.09);
      });
    } catch {}
  }

  // Bicycle Bell (Ding-ding!)
  public playBicycleBell() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [
        { freq: 2093, time: now, dur: 0.18 },
        { freq: 2489, time: now + 0.11, dur: 0.28 },
      ].forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.22, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
      });
    } catch {}
  }

  // Wooden House Door Open (Creak + latch)
  public playDoorOpen() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // 1. Metal latch click
      const latch = ctx.createOscillator();
      const latchGain = ctx.createGain();
      latch.type = "triangle";
      latch.frequency.setValueAtTime(650, now);
      latch.frequency.exponentialRampToValueAtTime(220, now + 0.05);
      latchGain.gain.setValueAtTime(0.15, now);
      latchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      latch.connect(latchGain);
      latchGain.connect(ctx.destination);
      latch.start(now);
      latch.stop(now + 0.06);

      // 2. Slow wooden door hinge creak (FM synthesis modulation)
      const carrier = ctx.createOscillator();
      const mod = ctx.createOscillator();
      const modGain = ctx.createGain();
      const masterGain = ctx.createGain();

      carrier.type = "sawtooth";
      carrier.frequency.setValueAtTime(140, now + 0.04);
      carrier.frequency.linearRampToValueAtTime(185, now + 0.35);

      mod.type = "sine";
      mod.frequency.setValueAtTime(45, now + 0.04);
      modGain.gain.setValueAtTime(80, now + 0.04);

      mod.connect(carrier.frequency);
      carrier.connect(masterGain);

      masterGain.gain.setValueAtTime(0.08, now + 0.04);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      masterGain.connect(ctx.destination);

      mod.start(now + 0.04);
      carrier.start(now + 0.04);
      mod.stop(now + 0.38);
      carrier.stop(now + 0.38);
    } catch {}
  }

  // Wooden House Door Close (Solid thud + frame seal)
  public playDoorClose() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Heavy low wooden thud
      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = "sine";
      thud.frequency.setValueAtTime(120, now);
      thud.frequency.exponentialRampToValueAtTime(45, now + 0.16);
      thudGain.gain.setValueAtTime(0.24, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      thud.connect(thudGain);
      thudGain.connect(ctx.destination);
      thud.start(now);
      thud.stop(now + 0.18);

      // Latch snap
      const snap = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snap.type = "triangle";
      snap.frequency.setValueAtTime(480, now + 0.08);
      snap.frequency.exponentialRampToValueAtTime(180, now + 0.14);
      snapGain.gain.setValueAtTime(0.12, now + 0.08);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      snap.connect(snapGain);
      snapGain.connect(ctx.destination);
      snap.start(now + 0.08);
      snap.stop(now + 0.15);
    } catch {}
  }

  // Car Door Open/Close (Luxury Scissor Door pneumatic latch)
  public playCarDoor(open: boolean = true) {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      if (open) {
        // Electronic lock chirp + mechanical latch release
        const click = ctx.createOscillator();
        const clickGain = ctx.createGain();
        click.type = "sine";
        click.frequency.setValueAtTime(1100, now);
        click.frequency.exponentialRampToValueAtTime(550, now + 0.05);
        clickGain.gain.setValueAtTime(0.15, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        click.connect(clickGain);
        clickGain.connect(ctx.destination);
        click.start(now);
        click.stop(now + 0.07);
      } else {
        // Heavy sports car door shut (solid thunk + cabin pressure seal)
        const shut = ctx.createOscillator();
        const shutGain = ctx.createGain();
        shut.type = "triangle";
        shut.frequency.setValueAtTime(160, now);
        shut.frequency.exponentialRampToValueAtTime(50, now + 0.14);
        shutGain.gain.setValueAtTime(0.28, now);
        shutGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        shut.connect(shutGain);
        shutGain.connect(ctx.destination);
        shut.start(now);
        shut.stop(now + 0.15);
      }
    } catch {}
  }

  // Car Engine Ignition & Start Roar
  public playCarIgnition() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Starter crank
      [0, 0.08, 0.16].forEach((t) => {
        const crank = ctx.createOscillator();
        const crankGain = ctx.createGain();
        crank.type = "sawtooth";
        crank.frequency.setValueAtTime(180, now + t);
        crank.frequency.exponentialRampToValueAtTime(90, now + t + 0.06);
        crankGain.gain.setValueAtTime(0.14, now + t);
        crankGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.07);
        crank.connect(crankGain);
        crankGain.connect(ctx.destination);
        crank.start(now + t);
        crank.stop(now + t + 0.07);
      });

      // V8 engine roar to idle
      const roar = ctx.createOscillator();
      const roarGain = ctx.createGain();
      roar.type = "sawtooth";
      roar.frequency.setValueAtTime(80, now + 0.24);
      roar.frequency.exponentialRampToValueAtTime(260, now + 0.45);
      roar.frequency.linearRampToValueAtTime(110, now + 0.75);

      roarGain.gain.setValueAtTime(0.01, now + 0.24);
      roarGain.gain.linearRampToValueAtTime(0.22, now + 0.45);
      roarGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      roar.connect(roarGain);
      roarGain.connect(ctx.destination);
      roar.start(now + 0.24);
      roar.stop(now + 0.85);
    } catch {}
  }

  // Tire Screech / Drift Squeal
  public playTireScreech() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.linearRampToValueAtTime(720, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }

  // UI Button Click (soft pleasant tap)
  public playClick() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Audio autoplay policy or not allowed
    }
  }

  // Open Modal / Phone Slide
  public playOpen() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  // Close Modal
  public playClose() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  // Money Earned (satisfying cash / coin register chime)
  public playMoney() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Double ping: 987Hz (B5) then 1318Hz (E6)
      [
        { freq: 987, time: now, dur: 0.1 },
        { freq: 1318, time: now + 0.08, dur: 0.25 },
      ].forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
      });
    } catch {}
  }

  // Success / Achievement / Activity Complete
  public playSuccess() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.09;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.22);
      });
    } catch {}
  }

  // Positive Heart / Relationship / Happiness
  public playHeart() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Night / Sleep Chime (soothing low chord)
  public playNight() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chord = [220, 277.18, 329.63, 440]; // A3, C#4, E4, A4
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      });
    } catch {}
  }

  // Soccer Ball Kick Strike (punchy thud)
  public playBallKick() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  // Volleyball Spike / Bump Hit (snappy resonant leather slap)
  public playVolleyHit() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  // Referee Match Whistle (high-pitch dual frequency flutter)
  public playWhistle() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [2800, 3100].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      });
    } catch {}
  }

  // Goal Scored Crowd Cheer & Fanfare (triumphant stadium fanfare)
  public playGoalCheer() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // 1. Referee whistle first
      this.playWhistle();

      // 2. Brass triumphant chords (F major: F4, A4, C5, F5)
      const fanfare = [
        { freqs: [349.23, 440.0, 523.25], start: 0.1, dur: 0.25 },
        { freqs: [392.0, 493.88, 587.33], start: 0.35, dur: 0.2 },
        { freqs: [523.25, 659.25, 698.46, 1046.5], start: 0.55, dur: 0.8 },
      ];

      fanfare.forEach((chord) => {
        chord.freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + chord.start);

          gain.gain.setValueAtTime(0.1, now + chord.start);
          gain.gain.exponentialRampToValueAtTime(0.001, now + chord.start + chord.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + chord.start);
          osc.stop(now + chord.start + chord.dur);
        });
      });
    } catch {}
  }

  // Refreshing Coconut Drink Sip sound
  public playSip() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  // Sports snack / street noodle bite sound
  public playEat() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.setValueAtTime(380, now + 0.08);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  // Boxing Punch (air whoosh + glove thump; heavier punches thump lower)
  public playPunch(power: number = 1) {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      noise.buffer = buffer;
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.setValueAtTime(1800, now);
      band.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      const whooshGain = ctx.createGain();
      whooshGain.gain.setValueAtTime(0.12, now);
      whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      noise.connect(band);
      band.connect(whooshGain);
      whooshGain.connect(ctx.destination);
      noise.start(now);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140 / power, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.setValueAtTime(0.28 * Math.min(1.4, power), now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // Raising guard (short leather creak)
  public playGuard() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // Jump take-off (rising) or landing (low thud)
  public playJump(landing: boolean = false) {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = landing ? "sine" : "triangle";
      if (landing) {
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      } else {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
      }
      gain.gain.setValueAtTime(landing ? 0.22 : 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  // Missile Launch (whoosh & rising rocket motor)
  public playMissileLaunch() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.45);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.22));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.35);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.35);
      oscGain.gain.setValueAtTime(0.12, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  // Heavy Blast Explosion (low sub-bass boom + crashing blast noise + rumbling decay)
  public playExplosion() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Deep Sub-Bass Impact Thud
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(160, now);
      sub.frequency.exponentialRampToValueAtTime(28, now + 0.45);
      subGain.gain.setValueAtTime(0.48, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 0.55);

      // Fiery Blast Noise with Distorted Lowpass
      const bufferSize = Math.floor(ctx.sampleRate * 0.85);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.32));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(950, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.75);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.42, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.80);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
    } catch {}
  }

  // Realistic Vehicle Collision Crash (metal crunch + shockwave thud + plastic/glass debris)
  public playCarCrash(intensity: number = 1.0) {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const vol = Math.min(1.0, Math.max(0.15, intensity));

      // 1. Heavy Metal Impact Thud
      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = "triangle";
      thud.frequency.setValueAtTime(180, now);
      thud.frequency.exponentialRampToValueAtTime(32, now + 0.28);
      thudGain.gain.setValueAtTime(0.55 * vol, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      thud.connect(thudGain);
      thudGain.connect(ctx.destination);
      thud.start(now);
      thud.stop(now + 0.32);

      // 2. Crumpling Metal Crunch Noise
      const bufferSize = Math.floor(ctx.sampleRate * 0.45);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.16));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(650, now);
      bandpass.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.48 * vol, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
    } catch {}
  }

  // Bicycle Collision / Wall Bump (light metallic clatter + frame thud)
  public playBicycleCrash() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  // Building Structural Collapse (deep masonry rumble + shattering concrete & timber)
  public playBuildingCollapse() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;

      // 1. Deep seismic structural rumble
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = "sawtooth";
      sub.frequency.setValueAtTime(75, now);
      sub.frequency.linearRampToValueAtTime(22, now + 1.8);
      subGain.gain.setValueAtTime(0.55, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 2.0);

      // 2. Cascading Debris and Stone Smashing Noise
      const bufferSize = Math.floor(ctx.sampleRate * 1.6);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.7));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.65, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
    } catch {}
  }

  // Radar Lock-On Audio Cue (Dual high-pitch tactical lock pulses)
  public playTargetLock() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [0, 0.08].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1450, now + offset);
        osc.frequency.setValueAtTime(1900, now + offset + 0.03);
        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.07);
      });
    } catch {}
  }

  // Target Pointing / Tracking Chirp (single short radar ping)
  public playTargetBeep() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  // =========================================================================
  // JET ENGINE AUDIO LOOP (freesound_community-jet-loop-01-32474.mp3)
  // =========================================================================
  private jetAudio: HTMLAudioElement | null = null;
  private jetGain: GainNode | null = null;
  private jetAudioSource: MediaElementAudioSourceNode | null = null;
  private isJetPlaying: boolean = false;

  public startJetEngine() {
    if (typeof window === "undefined" || !this.soundEnabled) return;
    try {
      if (!this.jetAudio) {
        this.jetAudio = new Audio("/audio/jet-loop.mp3");
        this.jetAudio.loop = true;
        this.jetAudio.volume = 0.35;
      }
      this.jetAudio.currentTime = 0;
      this.jetAudio.playbackRate = 1.0;
      const playPromise = this.jetAudio.play();
      if (playPromise) {
        playPromise
          .then(() => {
            this.isJetPlaying = true;
          })
          .catch(() => {});
      }
    } catch {}
  }

  public updateJetEngine(speed: number, isAfterburner: boolean) {
    if (!this.jetAudio || !this.isJetPlaying) return;
    try {
      // Dynamic pitch and volume scaling based on airspeed & afterburner
      const normalizedSpeed = Math.min(1.0, Math.max(0, speed / 300));
      const targetRate = isAfterburner
        ? 1.35
        : 0.85 + normalizedSpeed * 0.35;
      const targetVol = this.soundEnabled
        ? isAfterburner
          ? 0.65
          : 0.25 + normalizedSpeed * 0.25
        : 0;

      this.jetAudio.playbackRate = targetRate;
      this.jetAudio.volume = Math.min(1.0, Math.max(0, targetVol));
    } catch {}
  }

  public stopJetEngine() {
    if (!this.jetAudio || !this.isJetPlaying) return;
    try {
      // Gentle fade-out
      let currentVol = this.jetAudio.volume;
      const fadeInterval = setInterval(() => {
        if (!this.jetAudio) {
          clearInterval(fadeInterval);
          return;
        }
        currentVol = Math.max(0, currentVol - 0.08);
        this.jetAudio.volume = currentVol;
        if (currentVol <= 0.02) {
          this.jetAudio.pause();
          this.isJetPlaying = false;
          clearInterval(fadeInterval);
        }
      }, 35);
    } catch {
      if (this.jetAudio) {
        this.jetAudio.pause();
        this.isJetPlaying = false;
      }
    }
  }

  // =========================================================================
  // SHOOTER WEAPON SOUND EFFECTS (PUBG / Free Fire style)
  // =========================================================================

  // Gunshot: M416, Shotgun, Sniper
  public playGunshot(weapon: "m416" | "shotgun" | "sniper" = "m416") {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (weapon === "m416") {
        // Sharp metallic punch + rapid supersonic crack
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.07);
        oscGain.gain.setValueAtTime(0.38, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);

        // Snap noise crack
        const noiseSize = Math.floor(ctx.sampleRate * 0.12);
        const noiseBuffer = ctx.createBuffer(1, noiseSize, ctx.sampleRate);
        const d = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseSize; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.035));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1800, now);
        filter.frequency.exponentialRampToValueAtTime(650, now + 0.12);
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.42, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(ctx.destination);
        noise.start(now);
      } else if (weapon === "shotgun") {
        // Heavy multi-pellet blast + deep concussive boom
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = "sine";
        sub.frequency.setValueAtTime(210, now);
        sub.frequency.exponentialRampToValueAtTime(45, now + 0.18);
        subGain.gain.setValueAtTime(0.55, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.start(now);
        sub.stop(now + 0.22);

        const noiseSize = Math.floor(ctx.sampleRate * 0.25);
        const noiseBuffer = ctx.createBuffer(1, noiseSize, ctx.sampleRate);
        const d = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseSize; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.075));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.25);
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.5, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(ctx.destination);
        noise.start(now);
      } else if (weapon === "sniper") {
        // High-power AWM thunderous crack + echoing reverb tail
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.22);
        oscGain.gain.setValueAtTime(0.65, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);

        const noiseSize = Math.floor(ctx.sampleRate * 0.55);
        const noiseBuffer = ctx.createBuffer(1, noiseSize, ctx.sampleRate);
        const d = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseSize; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.16));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(180, now + 0.55);
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.55, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(ctx.destination);
        noise.start(now);
      }
    } catch {}
  }

  // Tactical Reload Latch & Slide Rack
  public playReload() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Magazine out click
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(600, now);
      osc1.frequency.exponentialRampToValueAtTime(220, now + 0.08);
      gain1.gain.setValueAtTime(0.24, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.09);

      // Magazine in click
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(320, now + 0.45);
      osc2.frequency.exponentialRampToValueAtTime(740, now + 0.52);
      gain2.gain.setValueAtTime(0.28, now + 0.45);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.54);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.45);
      osc2.stop(now + 0.54);

      // Slide rack snap
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = "sawtooth";
      osc3.frequency.setValueAtTime(880, now + 0.85);
      osc3.frequency.exponentialRampToValueAtTime(300, now + 0.94);
      gain3.gain.setValueAtTime(0.3, now + 0.85);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.96);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.85);
      osc3.stop(now + 0.96);
    } catch {}
  }

  // Hit Marker Tick (PUBG / CoD style audio confirmation)
  public playHitMarker(isHeadshot: boolean = false) {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isHeadshot ? "triangle" : "sine";
      const freq = isHeadshot ? 2400 : 1600;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(isHeadshot ? 1200 : 900, now + 0.05);
      gain.gain.setValueAtTime(isHeadshot ? 0.35 : 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  // Practice Target Steel Plate Clang / Destroyed
  public playTargetDestroyed() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High metallic chime
      [880, 1320, 1760].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.35 + idx * 0.05);
        gain.gain.setValueAtTime(0.2 - idx * 0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      });
    } catch {}
  }
}

export const audio = new AudioManager();

