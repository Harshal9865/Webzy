'use client';

/**
 * Pure Web Audio API Indian Tanpura Drone & Auspicious Chime Synthesizer.
 * Never autoplays; only starts when explicitly triggered by a user gesture.
 * Zero external MP3 dependencies (prevents 404 audio errors across deployments).
 */
export class WeddingAmbientAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private droneOscillators: OscillatorNode[] = [];
  private openingChimeTimer: number | null = null;
  private chimeTimer: number | null = null;
  private playing = false;

  private readonly handleVisibilityChange = (): void => {
    if (typeof document === 'undefined' || !this.ctx || this.ctx.state === 'closed') return;
    if (document.hidden) {
      if (this.ctx.state === 'running') {
        void this.ctx.suspend().catch(() => undefined);
      }
    } else if (this.playing && this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => undefined);
    }
  };

  public isPlaying(): boolean {
    return this.playing;
  }

  public start(): boolean {
    if (typeof window === 'undefined') return false;
    if (this.playing) return true;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;

      if (!this.ctx || this.ctx.state === 'closed') {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume().catch(() => undefined);
      }

      const now = this.ctx.currentTime;
      const master = this.ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.055, now + 1.4);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(680, now);
      filter.Q.setValueAtTime(0.9, now);

      filter.connect(master);
      master.connect(this.ctx.destination);
      this.masterGain = master;
      this.filterNode = filter;

      // Soft C# (Sa - Pa - Sa - Ga harmonic veil) Tanpura drone
      const droneFreqs: Array<{ freq: number; type: OscillatorType; gain: number; detune: number }> = [
        { freq: 138.59, type: 'sine', gain: 0.42, detune: 0 }, // Low Sa (C#3)
        { freq: 207.65, type: 'triangle', gain: 0.22, detune: 2.5 }, // Pa (G#3)
        { freq: 277.18, type: 'sine', gain: 0.26, detune: -2.0 }, // Middle Sa (C#4)
        { freq: 277.18, type: 'triangle', gain: 0.14, detune: 3.5 }, // Shimmer Sa
      ];

      this.droneOscillators = droneFreqs.map((cfg) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();
        osc.type = cfg.type;
        osc.frequency.setValueAtTime(cfg.freq, now);
        osc.detune.setValueAtTime(cfg.detune, now);
        oscGain.gain.setValueAtTime(cfg.gain, now);
        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start(now);
        return osc;
      });

      // Gentle Raag Bhupali pentatonic chime notes (Sa, Re, Ga, Pa, Dha, high Sa)
      const pentatonicNotes = [554.37, 622.25, 698.46, 830.61, 932.33, 1108.73];
      let step = 0;

      const triggerChime = () => {
        if (!this.ctx || !this.masterGain || !this.playing || this.ctx.state !== 'running') return;
        try {
          const t = this.ctx.currentTime;
          const noteFreq = pentatonicNotes[step % pentatonicNotes.length];
          step = (step + 2) % pentatonicNotes.length;

          const osc = this.ctx.createOscillator();
          const env = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(noteFreq, t);

          env.gain.setValueAtTime(0.0001, t);
          env.gain.linearRampToValueAtTime(0.24, t + 0.04);
          env.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

          osc.connect(env);
          env.connect(this.masterGain);
          osc.onended = () => {
            try {
              osc.disconnect();
              env.disconnect();
            } catch {
              // Ignore disconnect error
            }
          };
          osc.start(t);
          osc.stop(t + 3.4);
        } catch {
          // Ignore transient Web Audio scheduling errors
        }
      };

      this.playing = true;
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
      }
      // Play an opening auspicious chime softly after 300ms, then every 4.2 seconds
      this.openingChimeTimer = window.setTimeout(() => {
        this.openingChimeTimer = null;
        triggerChime();
      }, 300);
      this.chimeTimer = window.setInterval(triggerChime, 4200);
      return true;
    } catch {
      this.playing = false;
      return false;
    }
  }

  public stop(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    if (this.openingChimeTimer !== null) {
      window.clearTimeout(this.openingChimeTimer);
      this.openingChimeTimer = null;
    }
    if (this.chimeTimer !== null) {
      window.clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }

    if (!this.playing) return;
    this.playing = false;

    const oldMaster = this.masterGain;
    const oldFilter = this.filterNode;
    this.masterGain = null;
    this.filterNode = null;

    if (this.ctx && this.ctx.state !== 'closed' && oldMaster) {
      const now = this.ctx.currentTime;
      try {
        const currentVal = Number.isFinite(oldMaster.gain.value) ? oldMaster.gain.value : 0.0001;
        oldMaster.gain.cancelScheduledValues(now);
        oldMaster.gain.setValueAtTime(Math.max(currentVal, 0.0001), now);
        oldMaster.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      } catch {
        // Ignore ramp error
      }
    }

    const oscs = this.droneOscillators;
    this.droneOscillators = [];
    window.setTimeout(() => {
      oscs.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Ignore already stopped oscillator
        }
      });
      try {
        oldFilter?.disconnect();
        oldMaster?.disconnect();
      } catch {
        // Ignore disconnect error
      }
    }, 520);
  }

  public toggle(): boolean {
    if (this.playing) {
      this.stop();
      return false;
    }
    return this.start();
  }

  public dispose(): void {
    this.stop();
    if (this.ctx) {
      const ctx = this.ctx;
      this.ctx = null;
      if (ctx.state !== 'closed') {
        window.setTimeout(() => {
          void ctx.close().catch(() => undefined);
        }, 600);
      }
    }
  }
}
