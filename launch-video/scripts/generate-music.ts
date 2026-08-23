import {mkdir, writeFile} from "node:fs/promises";
import {resolve} from "node:path";

const sampleRate = 48_000;
const duration = 40;
const length = sampleRate * duration;
const left = new Float32Array(length);
const right = new Float32Array(length);
const tau = Math.PI * 2;
const bpm = 108;
const beat = 60 / bpm;

let seed = 0x4b4f4348;
function noise() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) / 0xffffffff) * 2 - 1;
}

function envelope(time: number, total: number, attack: number, release: number) {
  const fadeIn = Math.min(1, time / Math.max(attack, 0.001));
  const fadeOut = Math.min(1, (total - time) / Math.max(release, 0.001));
  return Math.max(0, Math.min(fadeIn, fadeOut));
}

function mix(index: number, value: number, pan = 0) {
  const angle = (pan + 1) * Math.PI / 4;
  left[index] += value * Math.cos(angle);
  right[index] += value * Math.sin(angle);
}

function addTone({
  start,
  seconds,
  frequency,
  gain,
  pan = 0,
  attack = 0.01,
  release = 0.08,
  voice = "sine",
}: {
  start: number;
  seconds: number;
  frequency: number;
  gain: number;
  pan?: number;
  attack?: number;
  release?: number;
  voice?: "sine" | "pad" | "pluck" | "bell";
}) {
  const from = Math.max(0, Math.floor(start * sampleRate));
  const to = Math.min(length, Math.floor((start + seconds) * sampleRate));
  for (let index = from; index < to; index++) {
    const time = (index - from) / sampleRate;
    let sample = Math.sin(tau * frequency * time);
    if (voice === "pad") {
      sample =
        Math.sin(tau * frequency * time) * 0.62 +
        Math.sin(tau * frequency * 1.004 * time + 0.7) * 0.23 +
        Math.sin(tau * frequency * 2 * time + 0.2) * 0.1 +
        Math.sin(tau * frequency * 0.5 * time) * 0.05;
    } else if (voice === "pluck") {
      sample =
        Math.sin(tau * frequency * time) * 0.72 +
        Math.sin(tau * frequency * 2 * time) * 0.2 +
        Math.sin(tau * frequency * 3 * time) * 0.08;
      sample *= Math.exp(-time * 5.8);
    } else if (voice === "bell") {
      sample =
        Math.sin(tau * frequency * time) * 0.62 +
        Math.sin(tau * frequency * 2.01 * time) * 0.23 +
        Math.sin(tau * frequency * 3.97 * time) * 0.15;
      sample *= Math.exp(-time * 2.8);
    }
    const env = envelope(time, seconds, attack, release);
    mix(index, sample * gain * env, pan);
  }
}

function addKick(start: number, gain = 0.45) {
  const seconds = 0.36;
  const from = Math.floor(start * sampleRate);
  const to = Math.min(length, from + Math.floor(seconds * sampleRate));
  let phase = 0;
  for (let index = from; index < to; index++) {
    const time = (index - from) / sampleRate;
    const frequency = 48 + 82 * Math.exp(-time * 26);
    phase += tau * frequency / sampleRate;
    const body = Math.sin(phase) * Math.exp(-time * 10.5);
    const click = noise() * Math.exp(-time * 78) * 0.12;
    mix(index, (body + click) * gain);
  }
}

function addNoiseBurst(start: number, seconds: number, gain: number, pan = 0, sharpness = 18) {
  const from = Math.max(0, Math.floor(start * sampleRate));
  const to = Math.min(length, Math.floor((start + seconds) * sampleRate));
  let previous = 0;
  for (let index = from; index < to; index++) {
    const time = (index - from) / sampleRate;
    const white = noise();
    const high = white - previous * 0.92;
    previous = white;
    const env = Math.exp(-time * sharpness) * Math.min(1, time / 0.002);
    mix(index, high * env * gain, pan);
  }
}

function addWhoosh(start: number, seconds: number, gain: number, pan: number) {
  const from = Math.max(0, Math.floor(start * sampleRate));
  const to = Math.min(length, Math.floor((start + seconds) * sampleRate));
  let smoothed = 0;
  for (let index = from; index < to; index++) {
    const time = (index - from) / sampleRate;
    const progress = time / seconds;
    smoothed += (noise() - smoothed) * (0.015 + progress * 0.08);
    const env = Math.sin(Math.PI * progress) ** 1.8;
    mix(index, smoothed * env * gain, pan * (1 - progress * 0.4));
  }
}

// A quiet water-like bed holds the complete film together.
let water = 0;
for (let index = 0; index < length; index++) {
  water += (noise() - water) * 0.0018;
  const time = index / sampleRate;
  const tide = 0.7 + Math.sin(tau * time / 6.2) * 0.3;
  mix(index, water * 0.055 * tide, Math.sin(time * 0.19) * 0.25);
}

const chords = [
  {root: 73.42, notes: [146.83, 174.61, 220]},
  {root: 58.27, notes: [116.54, 146.83, 174.61]},
  {root: 87.31, notes: [130.81, 174.61, 220]},
  {root: 65.41, notes: [130.81, 164.81, 196]},
];

for (let section = 0; section < 8; section++) {
  const chord = chords[section % chords.length];
  const start = section * 5;
  for (const [noteIndex, note] of chord.notes.entries()) {
    addTone({
      start,
      seconds: 5.2,
      frequency: note,
      gain: start < 3 ? 0.055 : 0.072,
      pan: (noteIndex - 1) * 0.42,
      attack: 0.72,
      release: 1.1,
      voice: "pad",
    });
  }

  if (start >= 5) {
    for (let step = 0; step < Math.floor(5 / beat); step++) {
      addTone({
        start: start + step * beat,
        seconds: beat * 0.82,
        frequency: chord.root,
        gain: start >= 35 ? 0.085 : 0.12,
        attack: 0.008,
        release: 0.16,
      });
    }
  }
}

const arpeggio = [293.66, 349.23, 440, 523.25, 440, 349.23, 329.63, 261.63];
for (let time = 7; time < 37.5; time += beat / 2) {
  const step = Math.floor((time - 7) / (beat / 2));
  addTone({
    start: time,
    seconds: beat * 0.62,
    frequency: arpeggio[step % arpeggio.length],
    gain: time < 10 ? 0.065 : time > 34 ? 0.055 : 0.082,
    pan: (step % 4 - 1.5) * 0.28,
    voice: "pluck",
    release: 0.12,
  });
}

for (let time = 3; time < 38; time += beat) {
  const beatIndex = Math.round((time - 3) / beat);
  if (time < 7 && beatIndex % 2 === 1) continue;
  addKick(time, time > 34 ? 0.31 : 0.43);
  if (time > 7 && beatIndex % 4 === 2) addNoiseBurst(time, 0.24, 0.14, 0.12, 13);
  if (time > 10) addNoiseBurst(time + beat / 2, 0.08, 0.042, beatIndex % 2 ? -0.38 : 0.38, 42);
}

// Scene-change sweeps and an original four-note brand mnemonic.
for (const [time, pan] of [[2.55, -0.7], [6.55, 0.65], [9.65, -0.5], [16.65, 0.45], [21.65, -0.5], [26.65, 0.55], [31.65, -0.45], [35.65, 0.4]] as const) {
  addWhoosh(time, 0.62, 0.18, pan);
}

const motif = [587.33, 698.46, 880, 1046.5];
for (const start of [7.05, 38.05]) {
  motif.forEach((frequency, index) => {
    addTone({
      start: start + index * 0.22,
      seconds: 1.15,
      frequency,
      gain: start > 30 ? 0.13 : 0.095,
      pan: (index - 1.5) * 0.18,
      voice: "bell",
      release: 0.38,
    });
  });
}

// Master fade, gentle glue saturation and peak normalization.
let peak = 0;
for (let index = 0; index < length; index++) {
  const time = index / sampleRate;
  const fadeIn = Math.min(1, time / 1.2);
  const fadeOut = Math.min(1, (duration - time) / 1.35);
  const fade = Math.min(fadeIn, fadeOut);
  left[index] = Math.tanh(left[index] * 1.18) * fade;
  right[index] = Math.tanh(right[index] * 1.18) * fade;
  peak = Math.max(peak, Math.abs(left[index]), Math.abs(right[index]));
}

const scale = 0.91 / Math.max(peak, 0.001);
const dataSize = length * 2 * 2;
const wav = Buffer.alloc(44 + dataSize);
wav.write("RIFF", 0);
wav.writeUInt32LE(36 + dataSize, 4);
wav.write("WAVE", 8);
wav.write("fmt ", 12);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 4, 28);
wav.writeUInt16LE(4, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(dataSize, 40);

for (let index = 0; index < length; index++) {
  const offset = 44 + index * 4;
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[index] * scale)) * 32767), offset);
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[index] * scale)) * 32767), offset + 2);
}

async function main() {
  const output = resolve(process.cwd(), "public/audio/city-frequency-original.wav");
  await mkdir(resolve(process.cwd(), "public/audio"), {recursive: true});
  await writeFile(output, wav);
  console.log(`Wrote ${output} · ${duration}s · ${sampleRate}Hz stereo · original composition`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
