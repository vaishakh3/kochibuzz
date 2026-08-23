import {loadFont as loadFraunces} from "@remotion/google-fonts/Fraunces";
import {loadFont as loadGeist} from "@remotion/google-fonts/Geist";
import {loadFont as loadGeistMono} from "@remotion/google-fonts/GeistMono";
import {Composition, Still} from "remotion";
import {KochiBuzzLaunch, KochiBuzzPoster} from "./LaunchFilm";

loadFraunces("normal", {weights: ["400", "500", "600", "700"], subsets: ["latin"]});
loadFraunces("italic", {weights: ["500", "600", "700"], subsets: ["latin"]});
loadGeist("normal", {weights: ["400", "500", "600", "700", "800"], subsets: ["latin"]});
loadGeistMono("normal", {weights: ["500", "600", "700"], subsets: ["latin"]});

export function RemotionRoot() {
  return (
    <>
      <Composition id="KochiBuzzLaunch" component={KochiBuzzLaunch} width={1920} height={1080} fps={30} durationInFrames={1200} />
      <Still id="KochiBuzzPoster" component={KochiBuzzPoster} width={1920} height={1080} />
    </>
  );
}

