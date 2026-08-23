import {Audio} from "@remotion/media";
import {AbsoluteFill, Sequence, staticFile} from "remotion";
import {Grain, SweepCuts} from "./components";
import {COLORS} from "./design";
import {AttendanceScene, BuildScene, CalendarScene, CommunityScene, FinalScene, HarbourScene, IdentityScene, JobsScene, PosterScene, RhythmScene, SubmitScene} from "./scenes";

const CUTS = [90, 210, 300, 510, 660, 810, 960, 1080, 1140];

export function KochiBuzzLaunch() {
  return (
    <AbsoluteFill style={{background: COLORS.ink}}>
      <Audio src={staticFile("audio/city-frequency-original.wav")} volume={0.94} />
      <Sequence from={0} durationInFrames={90} premountFor={30}><HarbourScene /></Sequence>
      <Sequence from={90} durationInFrames={120} premountFor={30}><RhythmScene /></Sequence>
      <Sequence from={210} durationInFrames={90} premountFor={30}><IdentityScene /></Sequence>
      <Sequence from={300} durationInFrames={210} premountFor={30}><CalendarScene /></Sequence>
      <Sequence from={510} durationInFrames={150} premountFor={30}><AttendanceScene /></Sequence>
      <Sequence from={660} durationInFrames={150} premountFor={30}><JobsScene /></Sequence>
      <Sequence from={810} durationInFrames={150} premountFor={30}><CommunityScene /></Sequence>
      <Sequence from={960} durationInFrames={120} premountFor={30}><BuildScene /></Sequence>
      <Sequence from={1080} durationInFrames={60} premountFor={30}><SubmitScene /></Sequence>
      <Sequence from={1140} durationInFrames={60} premountFor={30}><FinalScene /></Sequence>
      <SweepCuts cuts={CUTS} />
      <Grain />
    </AbsoluteFill>
  );
}

export function KochiBuzzPoster() {
  return (
    <AbsoluteFill style={{background: COLORS.ink}}>
      <PosterScene />
      <Grain />
    </AbsoluteFill>
  );
}
