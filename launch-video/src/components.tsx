import type {CSSProperties, ReactNode} from "react";
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from "remotion";
import {COLORS, beat, clamp, enter, lift} from "./design";

export function Eyebrow({children, color = COLORS.signal}: {children: ReactNode; color?: string}) {
  return (
    <div
      style={{
        color,
        fontFamily: "Geist Mono",
        fontWeight: 650,
        fontSize: 18,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

export function Title({children, size = 118, style}: {children: ReactNode; size?: number; style?: CSSProperties}) {
  return (
    <div
      style={{
        color: COLORS.white,
        fontFamily: "Fraunces",
        fontWeight: 500,
        fontSize: size,
        letterSpacing: "-0.055em",
        lineHeight: 0.9,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Wordmark({light = true, size = 52}: {light?: boolean; size?: number}) {
  return (
    <div style={{display: "flex", alignItems: "baseline", color: light ? COLORS.white : COLORS.ink, fontFamily: "Geist", fontWeight: 760, fontSize: size, letterSpacing: "-0.055em"}}>
      kochi<span style={{color: COLORS.signal, fontFamily: "Fraunces", fontStyle: "italic", fontWeight: 650}}>.buzz</span>
      <span style={{width: size * 0.18, height: size * 0.18, borderRadius: 999, background: COLORS.coral, marginLeft: size * 0.15}} />
    </div>
  );
}

export function SignalMark({size = 210, glow = true}: {size?: number; glow?: boolean}) {
  return (
    <Img
      src={staticFile("art/kochi-buzz-mark.png")}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.21,
        boxShadow: glow ? `0 0 ${size * 0.48}px rgba(215,242,75,.16)` : undefined,
      }}
    />
  );
}

export function Photo({src, position = "center", shade = 0.38}: {src: string; position?: string; shade?: number}) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: position,
          transform: `scale(${interpolate(frame, [0, 210], [1.035, 1.105], clamp)}) translateX(${interpolate(frame, [0, 210], [0, -14], clamp)}px)`,
        }}
      />
      <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(11,11,18,${shade + 0.38}) 0%, rgba(11,11,18,${shade}) 48%, rgba(11,11,18,${Math.max(0.12, shade - 0.16)}) 100%)`}} />
      <AbsoluteFill style={{background: "linear-gradient(180deg, rgba(11,11,18,.08), transparent 54%, rgba(11,11,18,.72))"}} />
    </AbsoluteFill>
  );
}

export function BrowserFrame({src, label, accent = COLORS.signal, crop = "center", children}: {src: string; label: string; accent?: string; crop?: string; children?: ReactNode}) {
  const frame = useCurrentFrame();
  const settle = interpolate(frame, [0, 26], [0, 1], clamp);
  const drift = interpolate(frame, [0, 210], [0, -12], clamp);
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        borderRadius: 30,
        background: COLORS.ink,
        border: "1px solid rgba(255,255,255,.28)",
        boxShadow: "0 50px 120px rgba(0,0,0,.48), 0 12px 40px rgba(0,0,0,.28)",
        transform: `translateY(${interpolate(settle, [0, 1], [54, 0]) + drift}px) scale(${interpolate(settle, [0, 1], [0.965, 1])})`,
        opacity: settle,
      }}
    >
      <div style={{height: 56, display: "flex", alignItems: "center", gap: 11, padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,.1)", background: "rgba(11,11,18,.98)"}}>
        {[COLORS.coral, COLORS.signal, COLORS.lagoon].map((color) => <span key={color} style={{width: 10, height: 10, borderRadius: 999, background: color}} />)}
        <div style={{marginLeft: 14, color: "rgba(255,255,255,.62)", fontFamily: "Geist Mono", fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase"}}>{label}</div>
        <div style={{marginLeft: "auto", display: "flex", alignItems: "center", gap: 9, color: accent, fontFamily: "Geist Mono", fontSize: 12, letterSpacing: ".12em"}}>
          <span style={{width: 7, height: 7, borderRadius: 999, background: accent, boxShadow: `0 0 18px ${accent}`}} /> LIVE
        </div>
      </div>
      <Img src={staticFile(src)} style={{width: "100%", height: "calc(100% - 56px)", objectFit: "cover", objectPosition: crop}} />
      {children}
    </div>
  );
}

export function SignalRings({color = COLORS.signal, side = "right", size = 760}: {color?: string; side?: "left" | "right"; size?: number}) {
  const frame = useCurrentFrame();
  const scale = 0.92 + beat(frame, 0, 26) * 0.08;
  return (
    <div style={{position: "absolute", width: size, height: size, top: "50%", [side]: -size * 0.38, transform: `translateY(-50%) scale(${scale})`, opacity: 0.22}}>
      {[0.38, 0.62, 0.88].map((ratio, index) => (
        <div key={ratio} style={{position: "absolute", left: "50%", top: "50%", width: size * ratio, height: size * ratio, transform: "translate(-50%,-50%)", border: `${14 - index * 3}px solid ${color}`, borderRadius: "50%"}} />
      ))}
    </div>
  );
}

export function SceneCopy({eyebrow, title, body, width = 820, top = 156, left = 112, accent = COLORS.signal, titleSize}: {eyebrow: string; title: ReactNode; body?: ReactNode; width?: number; top?: number; left?: number; accent?: string; titleSize?: number}) {
  const frame = useCurrentFrame();
  return (
    <div style={{position: "absolute", left, top, width, zIndex: 5}}>
      <div style={lift(frame, 0, 28)}><Eyebrow color={accent}>{eyebrow}</Eyebrow></div>
      <div style={{...lift(frame, 5, 44), marginTop: 22}}><Title size={titleSize}>{title}</Title></div>
      {body ? <div style={{...lift(frame, 10, 32), marginTop: 25, color: "rgba(255,253,248,.72)", fontFamily: "Geist", fontSize: 30, lineHeight: 1.35, maxWidth: 680}}>{body}</div> : null}
    </div>
  );
}

export function AvatarRow() {
  const frame = useCurrentFrame();
  const avatars = ["ferry.jpg", "builder.jpg", "cyclist.jpg", "artist.jpg", "host.jpg", "photographer.jpg"];
  return (
    <div style={{display: "flex", alignItems: "center"}}>
      {avatars.map((avatar, index) => {
        const p = enter(frame, 8 + index * 4, 14);
        return <Img key={avatar} src={staticFile(`art/${avatar}`)} style={{width: 74, height: 74, borderRadius: 999, objectFit: "cover", border: `4px solid ${COLORS.paper}`, marginLeft: index ? -17 : 0, transform: `translateY(${interpolate(p, [0, 1], [24, 0])}px) scale(${p})`, opacity: p, boxShadow: "0 10px 24px rgba(0,0,0,.22)"}} />;
      })}
      <div style={{marginLeft: 24, fontFamily: "Geist", fontWeight: 650, fontSize: 22, color: COLORS.ink}}>Kochi is showing up.</div>
    </div>
  );
}

export function CornerIndex({number, label}: {number: string; label: string}) {
  return (
    <div style={{position: "absolute", right: 54, bottom: 42, display: "flex", alignItems: "center", gap: 16, zIndex: 20, color: "rgba(255,255,255,.5)", fontFamily: "Geist Mono", fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase"}}>
      <span>{label}</span><span style={{color: COLORS.signal}}>{number}</span>
    </div>
  );
}

export function Grain() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        zIndex: 100,
        opacity: 0.055,
        transform: `translate(${(frame % 3) - 1}px,${((frame * 2) % 3) - 1}px)`,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.9'/%3E%3C/svg%3E\")",
        mixBlendMode: "soft-light",
      }}
    />
  );
}

export function SweepCuts({cuts}: {cuts: number[]}) {
  const frame = useCurrentFrame();
  let strongest = 0;
  let cutFrame = 0;
  for (const cut of cuts) {
    const value = beat(frame, cut, 8);
    if (value > strongest) { strongest = value; cutFrame = cut; }
  }
  if (!strongest) return null;
  const progress = interpolate(frame, [cutFrame - 8, cutFrame + 8], [0, 1], clamp);
  return (
    <AbsoluteFill style={{zIndex: 90, pointerEvents: "none"}}>
      <div style={{position: "absolute", inset: 0, transform: `translateX(${interpolate(progress, [0, .5, 1], [-110, 0, 110], clamp)}%) skewX(-7deg)`, background: COLORS.coral}} />
      <div style={{position: "absolute", left: `${interpolate(progress, [0, 1], [-20, 120], clamp)}%`, top: 0, bottom: 0, width: 22, background: COLORS.signal, boxShadow: `0 0 80px ${COLORS.signal}`}} />
    </AbsoluteFill>
  );
}

