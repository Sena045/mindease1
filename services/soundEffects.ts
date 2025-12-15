/**
 * Synthesizes simple UI sounds using Web Audio API.
 * This avoids the need for external asset files and keeps the app lightweight.
 */

const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx && AudioContextClass) {
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
};

export const playChatSound = (type: 'send' | 'receive') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume context if suspended (common in browsers until user interaction)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'send') {
      // "Pop" / "Whoosh" sound: High pitch, short decay
      // Frequency ramps up slightly for a "sent" feeling
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      
      // Volume envelope
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.start(now);
      osc.stop(now + 0.1);
      
    } else if (type === 'receive') {
      // "Ding" / "Chime" sound: Clear bell-like tone, longer decay
      // Two oscillators for a richer sound
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      // Main tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      
      // Harmonics
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.50, now); // C6

      // Volume envelope (softer attack, longer tail)
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.02, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.start(now);
      osc.stop(now + 0.5);
      osc2.start(now);
      osc2.stop(now + 0.5);
    }

  } catch (error) {
    console.error("Failed to play sound effect", error);
  }
};