import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from "remotion";
import {AvatarRow, BrowserFrame, CornerIndex, Eyebrow, Photo, SceneCopy, SignalMark, SignalRings, Title, Wordmark} from "./components";
import {COLORS, beat, clamp, enter, lift} from "./design";

export function HarbourScene() {
  const frame = useCurrentFrame();
  const pulse = beat(frame, 30, 23);
  return (
    <AbsoluteFill style={{background: COLORS.ink}}>
      <Photo src="art/kochi-harbour-dawn.png" position="center 54%" shade={0.32} />
      <div style={{position: "absolute", left: 112, top: 88, ...lift(frame, 2, 22)}}><Eyebrow color={COLORS.coral}>KOCHI · 06:17 · ASIA/KOLKATA</Eyebrow></div>
      <div style={{position: "absolute", left: 112, bottom: 95, width: 1120, ...lift(frame, 12, 60)}}>
        <Title size={126}>The city is<br />already moving.</Title>
      </div>
      <div style={{position: "absolute", right: 132, top: 132, width: 26 + pulse * 60, height: 26 + pulse * 60, borderRadius: 999, background: COLORS.coral, boxShadow: `0 0 ${40 + pulse * 100}px ${COLORS.coral}`, opacity: .92 - pulse * .38}} />
      <div style={{position: "absolute", left: 0, right: 0, bottom: 42, height: 1, background: "rgba(255,255,255,.22)"}}><div style={{height: 3, width: `${interpolate(frame, [0, 90], [0, 42], clamp)}%`, background: COLORS.signal, marginTop: -1}} /></div>
    </AbsoluteFill>
  );
}

const montage = [
  {src: "art/kochi-after-rain.png", word: "DATES.", color: COLORS.signal, position: "center 55%"},
  {src: "art/kochi-harbour-dawn.png", word: "DOORS.", color: COLORS.coral, position: "center 58%"},
  {src: "art/kochi-community-night.png", word: "PEOPLE.", color: COLORS.lagoon, position: "center"},
  {src: "art/kochi-makers-night.png", word: "WORK.", color: COLORS.lavender, position: "center"},
];

export function RhythmScene() {
  const frame = useCurrentFrame();
  const active = Math.min(3, Math.floor(frame / 30));
  const item = montage[active];
  const local = frame - active * 30;
  return (
    <AbsoluteFill style={{background: COLORS.ink}}>
        <Img key={item.src} src={staticFile(item.src)} style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: item.position, transform: `scale(${interpolate(local, [0, 30], [1.05, 1.12], clamp)})`}} />
      <AbsoluteFill style={{background: "linear-gradient(90deg, rgba(11,11,18,.7), rgba(11,11,18,.14))"}} />
      <div style={{position: "absolute", left: 104, top: 78, display: "flex", gap: 12}}>
        {montage.map((candidate, index) => <span key={candidate.word} style={{width: index === active ? 86 : 18, height: 7, borderRadius: 9, background: index === active ? item.color : "rgba(255,255,255,.35)"}} />)}
      </div>
      <div style={{position: "absolute", left: 100, bottom: 84, transform: `translateX(${interpolate(enter(local, 0, 10), [0, 1], [-120, 0])}px)`, opacity: enter(local, 0, 8)}}>
        <div style={{fontFamily: "Fraunces", fontSize: 240, fontWeight: 600, lineHeight: .72, letterSpacing: "-.07em", color: item.color, textShadow: "0 14px 60px rgba(0,0,0,.35)"}}>{item.word}</div>
      </div>
      <CornerIndex number={`0${active + 1}`} label="CITY FREQUENCY" />
    </AbsoluteFill>
  );
}

export function IdentityScene() {
  const frame = useCurrentFrame();
  const mark = enter(frame, 4, 28);
  return (
    <AbsoluteFill style={{background: COLORS.ink, alignItems: "center", justifyContent: "center"}}>
      <SignalRings side="left" size={820} />
      <SignalRings color={COLORS.coral} side="right" size={640} />
      <div style={{display: "flex", alignItems: "center", gap: 54, transform: `scale(${interpolate(mark, [0, 1], [.72, 1])})`, opacity: mark}}>
        <SignalMark size={258} />
        <div>
          <Wordmark size={88} />
          <div style={{marginTop: 18, fontFamily: "Geist", fontSize: 33, color: "rgba(255,255,255,.67)", letterSpacing: "-.025em"}}>Tune into Kochi.</div>
        </div>
      </div>
      <div style={{position: "absolute", left: "50%", bottom: 90, transform: "translateX(-50%)", width: 540, height: 5, borderRadius: 9, background: "rgba(255,255,255,.14)", overflow: "hidden"}}><div style={{height: "100%", width: `${interpolate(frame, [10, 84], [0, 100], clamp)}%`, background: COLORS.signal}} /></div>
    </AbsoluteFill>
  );
}

export function CalendarScene() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 88% 0%, rgba(114,220,199,.18), transparent 40%), ${COLORS.ink}`}}>
      <SceneCopy eyebrow="THE KOCHI CALENDAR" title={<>The city,<br /><span style={{color: COLORS.signal}}>by date.</span></>} body="One clear view of what’s on." width={560} top={132} titleSize={116} />
      <div style={{position: "absolute", left: 560, right: 64, top: 92, bottom: 64}}>
        <BrowserFrame src="screens/calendar-desktop.png" label="CALENDAR · REFRESHED HOURLY" crop="center">
          <div style={{position: "absolute", left: "59.3%", top: "34.3%", width: 158, height: 140, border: `4px solid ${COLORS.signal}`, borderRadius: 18, boxShadow: `0 0 ${32 + beat(frame, 83, 28) * 50}px rgba(215,242,75,.48)`, opacity: .58 + beat(frame, 83, 28) * .4}} />
          <div style={{position: "absolute", left: "76%", top: "55%", width: 204, height: 5, borderRadius: 10, background: COLORS.coral, transformOrigin: "left", transform: `scaleX(${enter(frame, 58, 28)})`}} />
        </BrowserFrame>
      </div>
      <CornerIndex number="01" label="CALENDAR" />
    </AbsoluteFill>
  );
}

export function AttendanceScene() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: COLORS.paper}}>
      <div style={{position: "absolute", left: 94, top: 82, width: 560, zIndex: 4}}>
        <div style={lift(frame, 0, 26)}><Eyebrow color="#486157">THE PEOPLE MAKE THE DATE</Eyebrow></div>
        <div style={{...lift(frame, 4, 38), marginTop: 22}}><Title size={104} style={{color: COLORS.ink}}>See who’s<br />going.</Title></div>
        <div style={{...lift(frame, 10, 24), marginTop: 25, color: "#536170", fontFamily: "Geist", fontSize: 28, lineHeight: 1.35}}>Find familiar faces.<br />Say you’re in.</div>
        <div style={{...lift(frame, 18, 22), marginTop: 46}}><AvatarRow /></div>
      </div>
      <div style={{position: "absolute", left: 692, right: 44, top: 52, bottom: 52}}>
        <BrowserFrame src="screens/event-going.png" label="EVENT · WHO’S GOING" accent={COLORS.coral} crop="center" />
      </div>
      <div style={{position: "absolute", left: 0, bottom: 0, width: 540, height: 16, background: COLORS.lagoon}} />
      <div style={{position: "absolute", left: 540, bottom: 0, width: 190, height: 16, background: COLORS.signal}} />
    </AbsoluteFill>
  );
}

export function JobsScene() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: COLORS.ink}}>
      <SignalRings color={COLORS.lavender} side="left" size={580} />
      <SceneCopy eyebrow="OPEN ROLES · KOCHI" accent={COLORS.lavender} title={<>Find the<br /><span style={{color: COLORS.lavender}}>next move.</span></>} body="Search by role, skill and workplace." width={580} top={138} titleSize={108} />
      <div style={{position: "absolute", left: 592, right: 54, top: 75, bottom: 58}}>
        <BrowserFrame src="screens/jobs-filters.png" label="JOBS · LIVE FILTERS" accent={COLORS.lavender} crop="center top" />
      </div>
      <div style={{position: "absolute", left: 124, bottom: 120, display: "flex", gap: 12}}>
        {["ENGINEERING", "DESIGN", "BUSINESS"].map((label, index) => <span key={label} style={{padding: "11px 15px", border: "1px solid rgba(255,255,255,.16)", borderRadius: 999, color: index === Math.floor(frame / 45) % 3 ? COLORS.ink : "rgba(255,255,255,.56)", background: index === Math.floor(frame / 45) % 3 ? COLORS.lavender : "transparent", fontFamily: "Geist Mono", fontSize: 11, letterSpacing: ".12em"}}>{label}</span>)}
      </div>
      <CornerIndex number="02" label="WORK" />
    </AbsoluteFill>
  );
}

export function CommunityScene() {
  const frame = useCurrentFrame();
  const split = interpolate(enter(frame, 16, 34), [0, 1], [68, 44]);
  return (
    <AbsoluteFill style={{background: COLORS.ink}}>
      <div style={{position: "absolute", inset: 0, right: `${100 - split}%`, overflow: "hidden"}}>
        <Photo src="art/kochi-community-night.png" position="center" shade={0.18} />
        <div style={{position: "absolute", left: 90, bottom: 86, width: 650}}>
          <Eyebrow color={COLORS.lagoon}>TEN ACTIVE COMMUNITIES</Eyebrow>
          <Title size={114} style={{marginTop: 18}}>Meet your<br />people.</Title>
        </div>
      </div>
      <div style={{position: "absolute", left: `${split - 4}%`, right: 46, top: 64, bottom: 56, filter: "drop-shadow(-34px 0 42px rgba(11,11,18,.46))"}}>
        <BrowserFrame src="screens/communities.png" label="COMMUNITIES · KOCHI" accent={COLORS.lagoon} crop="center" />
      </div>
      <CornerIndex number="03" label="COMMUNITY" />
    </AbsoluteFill>
  );
}

export function BuildScene() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: COLORS.ink}}>
      <Photo src="art/kochi-makers-night.png" position="center 45%" shade={0.5} />
      <div style={{position: "absolute", left: 82, top: 72, width: 760}}>
        <Eyebrow color={COLORS.lavender}>BUILT IN KOCHI</Eyebrow>
        <div style={{marginTop: 18}}><Title size={106}>See what Kochi<br />is building.</Title></div>
      </div>
      <div style={{position: "absolute", left: 780, right: 42, top: 188, bottom: 42}}>
        <BrowserFrame src="screens/built-in-kochi.png" label="PROJECTS · MADE HERE" accent={COLORS.lavender} crop="center" />
      </div>
      <div style={{position: "absolute", left: 82, bottom: 78, width: 620, display: "flex", alignItems: "center", gap: 24, ...lift(frame, 18, 28)}}>
        <div style={{width: 70, height: 70, borderRadius: 999, background: COLORS.lavender, color: COLORS.ink, display: "grid", placeItems: "center", fontFamily: "Geist", fontWeight: 800, fontSize: 28}}>↗</div>
        <div style={{color: "rgba(255,255,255,.7)", fontFamily: "Geist", fontSize: 26}}>Products, studios and experiments<br />made across the city.</div>
      </div>
      <CornerIndex number="04" label="BUILD" />
    </AbsoluteFill>
  );
}

export function SubmitScene() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: COLORS.coral}}>
      <div style={{position: "absolute", left: 92, top: 112, width: 590, zIndex: 3}}>
        <Eyebrow color={COLORS.ink}>KNOW SOMETHING?</Eyebrow>
        <Title size={112} style={{color: COLORS.ink, marginTop: 22}}>Add your<br />signal.</Title>
        <div style={{marginTop: 25, color: "rgba(11,11,18,.7)", fontFamily: "Geist", fontSize: 27}}>Events, opportunities, communities<br />and things built here.</div>
      </div>
      <div style={{position: "absolute", left: 700, right: 56, top: 34, bottom: 34}}>
        <BrowserFrame src="screens/submit-event.png" label="CONTRIBUTE · REVIEWED" accent={COLORS.coral} crop="center top" />
      </div>
      <div style={{position: "absolute", left: 94, bottom: 82, padding: "15px 22px", borderRadius: 999, background: COLORS.ink, color: COLORS.signal, fontFamily: "Geist Mono", fontWeight: 700, fontSize: 16, letterSpacing: ".12em", transform: `translateX(${interpolate(enter(frame, 16, 24), [0, 1], [-80, 0])}px)`, opacity: enter(frame, 16, 24)}}>REFRESHED THROUGH THE DAY</div>
    </AbsoluteFill>
  );
}

export function FinalScene() {
  const frame = useCurrentFrame();
  const reveal = enter(frame, 0, 24);
  return (
    <AbsoluteFill style={{background: COLORS.ink, alignItems: "center", justifyContent: "center"}}>
      <SignalRings side="left" size={700} />
      <SignalRings color={COLORS.coral} side="right" size={520} />
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${interpolate(reveal, [0, 1], [.8, 1])})`, opacity: reveal}}>
        <SignalMark size={170} />
        <div style={{marginTop: 34}}><Wordmark size={82} /></div>
        <div style={{marginTop: 20, color: "rgba(255,255,255,.7)", fontFamily: "Geist", fontSize: 29}}>The city, by date.</div>
      </div>
      <div style={{position: "absolute", bottom: 44, fontFamily: "Geist Mono", fontSize: 15, fontWeight: 650, color: COLORS.signal, letterSpacing: ".2em"}}>KOCHI.BUZZ</div>
      <div style={{position: "absolute", left: "50%", bottom: 80, width: interpolate(frame, [2, 56], [0, 510], clamp), height: 3, background: COLORS.coral, transform: "translateX(-50%)"}} />
    </AbsoluteFill>
  );
}

export function PosterScene() {
  return (
    <AbsoluteFill style={{background: COLORS.ink}}>
      <Img src={staticFile("art/kochi-harbour-dawn.png")} style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 56%"}} />
      <AbsoluteFill style={{background: "linear-gradient(90deg, rgba(11,11,18,.93) 0%, rgba(11,11,18,.62) 53%, rgba(11,11,18,.24) 100%)"}} />
      <AbsoluteFill style={{background: "linear-gradient(180deg, rgba(11,11,18,.12), transparent 55%, rgba(11,11,18,.74))"}} />
      <div style={{position: "absolute", left: 96, top: 72}}><Wordmark size={58} /></div>
      <div style={{position: "absolute", left: 96, top: 260, width: 960}}>
        <Eyebrow color={COLORS.coral}>KOCHI · LIVE CITY CALENDAR</Eyebrow>
        <Title size={142} style={{marginTop: 26}}>The city,<br /><span style={{color: COLORS.signal}}>by date.</span></Title>
        <div style={{marginTop: 34, color: "rgba(255,255,255,.7)", fontFamily: "Geist", fontSize: 31}}>Events. People. Work. Things made here.</div>
      </div>
      <div style={{position: "absolute", right: 110, top: 88}}><SignalMark size={154} /></div>
      <div style={{position: "absolute", left: 96, right: 96, bottom: 54, height: 4, background: "rgba(255,255,255,.18)"}}>
        <div style={{width: "42%", height: "100%", background: COLORS.signal}} />
        <div style={{position: "absolute", right: 0, top: -12, width: 28, height: 28, borderRadius: 99, background: COLORS.coral}} />
      </div>
    </AbsoluteFill>
  );
}
