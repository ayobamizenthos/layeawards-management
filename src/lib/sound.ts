// Synthesized UI sounds via the Web Audio API.

let context: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!context) context = new Ctor()
  if (context.state === 'suspended') void context.resume()
  return context
}

function tone(
  ctx: AudioContext,
  start: number,
  duration: number,
  fromFreq: number,
  toFreq: number,
  peak: number,
  type: OscillatorType = 'sine'
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(fromFreq, start)
  osc.frequency.exponentialRampToValueAtTime(toFreq, start + duration)

  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

export function playSuccess() {
  const ctx = audio()
  if (!ctx) return
  const now = ctx.currentTime
  tone(ctx, now, 0.16, 420, 760, 0.22, 'sine')
  tone(ctx, now + 0.04, 0.14, 760, 1180, 0.12, 'triangle')
}

export function playDone() {
  const ctx = audio()
  if (!ctx) return
  const now = ctx.currentTime
  tone(ctx, now, 0.18, 880, 880, 0.2, 'sine')
  tone(ctx, now + 0.11, 0.32, 1320, 1320, 0.2, 'sine')
}
