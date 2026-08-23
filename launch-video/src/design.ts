import {interpolate, spring} from "remotion";

export const COLORS = {
  ink: "#0B0B12",
  paper: "#F5F0E7",
  signal: "#D7F24B",
  coral: "#FF6542",
  lagoon: "#72DCC7",
  lavender: "#C7B4EE",
  white: "#FFFDF8",
  slate: "#78869A",
} as const;

export const FPS = 30;

export const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export function enter(frame: number, start = 0, duration = 18) {
  return interpolate(frame, [start, start + duration], [0, 1], clamp);
}

export function leave(frame: number, duration: number, length: number) {
  return interpolate(frame, [length - duration, length], [1, 0], clamp);
}

export function lift(frame: number, delay = 0, distance = 48) {
  const progress = spring({
    frame: frame - delay,
    fps: FPS,
    config: {damping: 18, mass: 0.8, stiffness: 115},
  });
  return {
    opacity: interpolate(progress, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(progress, [0, 1], [distance, 0])}px)`,
  };
}

export function beat(frame: number, at: number, width = 12) {
  return interpolate(frame, [at - width, at, at + width], [0, 1, 0], clamp);
}

