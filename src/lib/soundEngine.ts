// Procedural Web Audio API Sound Engine & Cinematic Ambient Generator
// Fully self-contained, 0% copyright risk, responsive, supports optional custom audio files.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private isPlayingAmbient: boolean = false;
  private themeAudio: HTMLAudioElement | null = null;
  private isThemePlaying: boolean = false;
  private musicListeners: Set<(playing: boolean) => void> = new Set();
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private heartbeatInterval: number | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private volume: number = 0.75;
  private autoplayGestureAttached: boolean = false;

  constructor() {
    // Unmuted by default for automatic cinematic playback after loading
    const saved = localStorage.getItem('heist_audio_muted');
    this.isMuted = saved !== null ? saved === 'true' : false;
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio API not supported or blocked', e);
    }
  }

  private initThemeAudio(): HTMLAudioElement | null {
    if (this.themeAudio) return this.themeAudio;
    try {
      const audio = new Audio('/assets/money-heist-theme.mp3');
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = this.volume;

      audio.addEventListener('play', () => {
        this.isThemePlaying = true;
        this.notifyMusicListeners();
      });

      audio.addEventListener('pause', () => {
        this.isThemePlaying = false;
        this.notifyMusicListeners();
      });

      audio.addEventListener('ended', () => {
        this.isThemePlaying = false;
        this.notifyMusicListeners();
      });

      this.themeAudio = audio;
      return audio;
    } catch (e) {
      console.warn('Audio element initialization failed', e);
      return null;
    }
  }

  public async playThemeSong(): Promise<boolean> {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (_) {}
    }

    const audio = this.initThemeAudio();
    if (!audio) return false;

    this.isMuted = false;
    audio.volume = this.volume;

    try {
      await audio.play();
      this.isThemePlaying = true;
      this.notifyMusicListeners();
      return true;
    } catch (err) {
      // Browser autoplay policy might restrict playback until user interaction
      this.attachAutoplayOnFirstInteraction();
      return false;
    }
  }

  public pauseThemeSong() {
    if (this.themeAudio) {
      this.themeAudio.pause();
    }
    this.isThemePlaying = false;
    this.notifyMusicListeners();
  }

  public toggleThemeSong(): boolean {
    if (this.isThemePlaying) {
      this.pauseThemeSong();
      return false;
    } else {
      this.playThemeSong();
      return true;
    }
  }

  public isMusicPlaying(): boolean {
    return this.isThemePlaying;
  }

  public subscribeMusic(cb: (playing: boolean) => void): () => void {
    this.musicListeners.add(cb);
    cb(this.isThemePlaying);
    return () => this.musicListeners.delete(cb);
  }

  private notifyMusicListeners() {
    this.musicListeners.forEach((cb) => {
      try {
        cb(this.isThemePlaying);
      } catch (err) {
        console.error('Music listener callback error:', err);
      }
    });
  }

  private attachAutoplayOnFirstInteraction() {
    if (this.autoplayGestureAttached || typeof window === 'undefined') return;
    this.autoplayGestureAttached = true;

    const triggerPlay = async () => {
      window.removeEventListener('click', triggerPlay);
      window.removeEventListener('pointerdown', triggerPlay);
      window.removeEventListener('keydown', triggerPlay);
      window.removeEventListener('scroll', triggerPlay);
      window.removeEventListener('wheel', triggerPlay);
      window.removeEventListener('touchstart', triggerPlay);
      this.autoplayGestureAttached = false;

      if (!this.isThemePlaying && !this.isMuted) {
        await this.playThemeSong();
      }
    };

    window.addEventListener('click', triggerPlay, { once: true, passive: true });
    window.addEventListener('pointerdown', triggerPlay, { once: true, passive: true });
    window.addEventListener('keydown', triggerPlay, { once: true, passive: true });
    window.addEventListener('scroll', triggerPlay, { once: true, passive: true });
    window.addEventListener('wheel', triggerPlay, { once: true, passive: true });
    window.addEventListener('touchstart', triggerPlay, { once: true, passive: true });
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.masterGain && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    if (this.themeAudio) {
      this.themeAudio.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.isMuted = !this.isMuted;
    localStorage.setItem('heist_audio_muted', String(this.isMuted));

    if (this.ctx && this.masterGain) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.1);
    }

    if (this.isMuted) {
      this.pauseThemeSong();
    } else {
      this.playThemeSong();
    }

    return this.isMuted;
  }

  // Backwards compatibility helper
  public setCustomAudioUrl(url: string) {
    if (this.themeAudio) {
      this.themeAudio.src = url;
      if (!this.isMuted) {
        this.playThemeSong();
      }
    }
  }

  // Procedural Cinematic Heist Ambient Synthesizer
  // Generates deep 45Hz sub-bass drone with slow frequency sweep, analog warmth, and heartbeat pulse
  public startCinematicAmbient() {
    this.init();
    if (!this.ctx || !this.ambientGain || this.isPlayingAmbient) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const now = this.ctx.currentTime;

      // Filter for dark cinematic tone
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);
      filter.Q.setValueAtTime(3.5, now);
      this.droneFilter = filter;

      // Low sub drone (48Hz)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(46.25, now); // Low F#

      // Detuned sub drone (46.8Hz) for slow acoustic beating
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(46.9, now);

      // Low-frequency filter modulation (LFO) for breathing atmosphere
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.08, now); // 12.5s cycle
      lfoGain.gain.setValueAtTime(60, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(this.ambientGain);

      lfo.start();
      osc1.start();
      osc2.start();

      this.droneOsc1 = osc1;
      this.droneOsc2 = osc2;
      this.lfoOsc = lfo;
      this.droneFilter = filter;
      this.isPlayingAmbient = true;

      // Heartbeat pulse every 1.8 seconds
      this.startHeartbeatLoop();
    } catch (e) {
      console.warn('Could not start procedural ambient', e);
    }
  }

  public stopCinematicAmbient() {
    try {
      if (this.droneOsc1) { this.droneOsc1.stop(); this.droneOsc1.disconnect(); this.droneOsc1 = null; }
      if (this.droneOsc2) { this.droneOsc2.stop(); this.droneOsc2.disconnect(); this.droneOsc2 = null; }
      if (this.lfoOsc) { this.lfoOsc.stop(); this.lfoOsc.disconnect(); this.lfoOsc = null; }
      if (this.droneFilter) { this.droneFilter.disconnect(); this.droneFilter = null; }
      if (this.heartbeatInterval) { clearInterval(this.heartbeatInterval); this.heartbeatInterval = null; }
      this.isPlayingAmbient = false;
    } catch {}
  }

  private startHeartbeatLoop() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = window.setInterval(() => {
      if (!this.isMuted && this.isPlayingAmbient) {
        this.playHeartbeat();
      }
    }, 2200);
  }

  // Sound Effect: Low Heartbeat
  public playHeartbeat() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      // Dub-thump double pulse
      [0, 0.22].forEach((offset, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 55 : 45, now + offset);
        osc.frequency.exponentialRampToValueAtTime(30, now + offset + 0.18);

        gain.gain.setValueAtTime(0, now + offset);
        gain.gain.linearRampToValueAtTime(idx === 0 ? 0.35 : 0.22, now + offset + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + offset);
        osc.stop(now + offset + 0.22);
      });
    } catch {}
  }

  // Sound Effect: Cinematic Sub Boom (section transitions)
  public playSubBoom() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 1.2);

      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.6);
    } catch {}
  }

  // Sound Effect: Mechanical Vault Dial Click
  public playVaultClick() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200 + Math.random() * 300, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(8, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  // Sound Effect: Heavy Vault Door Unlock Clunk
  public playVaultUnlock() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      // Low metallic clunk
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }

  // Sound Effect: Surveillance Radar Beep / Node Click
  public playRadarPing(freq = 880) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // Sound Effect: Pneumatic Door Servo Hiss & Sweep
  public playDoorServo() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      // White noise buffer for pneumatic hiss
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(350, now + 0.38);
      filter.Q.setValueAtTime(4, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.4);
    } catch {}
  }

  // Sound Effect: Sequential Vault Bolt Retraction
  public playBoltRetract(index = 0) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const baseFreq = 520 + (index % 12) * 35;

      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 1.5, now);
      filter.Q.setValueAtTime(5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch {}
  }

  // Sound Effect: Heavy Mechanical Clank
  public playHeavyMechanicalClank() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.28);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  // Sound Effect: Massive Vault Door Movement Rumble
  public playVaultDoorMovement() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(42, now);
      osc.frequency.linearRampToValueAtTime(38, now + 0.8);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(95, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.9);
    } catch {}
  }

  // Sound Effect: Deep Sub Impact (Low 35Hz drop)
  public playDeepImpact() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(75, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.9);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.25);
    } catch {}
  }

  // Sound Effect: Subtle Gold Room Shimmer / Ambience
  public playGoldRoomAmbience() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      // High harmonic metallic chime
      [1320, 1760, 2640].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.65);
      });
    } catch {}
  }

  // Sound Effect: Mechanical UI Click
  public playClick() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.02);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  }

  // Sound Effect: Subtle Paper Flutter (Floating Banknotes)
  public playPaperFlutter() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      // Filtered noise burst with soft bandpass modulation
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600 + Math.random() * 400, now);
      filter.Q.setValueAtTime(4.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.15);
    } catch {}
  }

  // Sound Effect: Soft Cinematic Air Whoosh (Scroll flow & bursts)
  public playSoftWhoosh() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.45;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(750, now + 0.18);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.42);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.45);
    } catch {}
  }

  // Sound Effect: Pneumatic Seal Release (High-pressure air decompression)
  public playPneumaticHiss() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.65;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.6);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.62);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.65);
    } catch {}
  }

  // Sound Effect: Keypad Terminal Beep
  public playKeypadBeep(freq: number = 880) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // Sound Effect: Terminal ACCESS GRANTED sequence
  public playAccessGranted() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 - E5 - G5 - C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.18, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.38);
      });
    } catch {}
  }

  // Sound Effect: Terminal ACCESS DENIED alarm
  public playAccessDenied() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      [180, 150].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.16);

        gain.gain.setValueAtTime(0.28, now + idx * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.22);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + idx * 0.16);
        osc.stop(now + idx * 0.16 + 0.25);
      });
    } catch {}
  }

  // Sound Effect: Gold Bar Tumble / Resonant Metallic Ping
  public playGoldTumble() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = [1850, 2200, 2900];
      const randomFreq = freqs[Math.floor(Math.random() * freqs.length)];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(randomFreq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.48);
    } catch {}
  }

  // Sound Effect: Handwheel Ratchet Spin
  public playHandwheelSpin() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 6; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320 + i * 40, now + i * 0.05);

        gain.gain.setValueAtTime(0.06, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.04);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.05);
      }
    } catch {}
  }

  // Sound Effect: Cinematic Blimp Airship Flyover (Low turboprop drone and wind)
  public playBlimpFlyover() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      // Dual detuned low turboprop oscillators (68Hz & 72Hz)
      [68, 72].forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, now);
        filter.Q.setValueAtTime(4, now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + 4.6);
      });

      // High-altitude atmospheric wind whoosh
      this.playSoftWhoosh();
    } catch {}
  }

  // Sound Effect: Motorized CCTV Camera Servo Whine
  public playCameraServo() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(460, now + 0.12);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // Sound Effect: CRT Monitor Glitch / Surveillance Static Burst
  public playStaticGlitch() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(1.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
    } catch {}
  }

  // Sound Effect: Radio Voice Intercept squelch and chirp
  public playRadioVoiceIntercept() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      this.playStaticGlitch();
      this.playRadarPing(920);
      setTimeout(() => {
        if (!this.isMuted) this.playStaticGlitch();
      }, 350);
    } catch {}
  }

  // Sound Effect: Continuous Cascading Banknote Flutter
  public playMoneyRainCascade() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          if (!this.isMuted) {
            this.playPaperFlutter();
          }
        }, i * 220);
      }
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
