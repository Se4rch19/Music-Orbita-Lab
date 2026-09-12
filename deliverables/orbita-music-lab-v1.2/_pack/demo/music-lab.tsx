import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Pause,
  Play,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrbitVisualizer } from "@/components/lab/orbit-visualizer";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import {
  OrbitaMusicEngine,
  BIOMES,
  MOODS,
  type EngineDiagnostics,
  type EngineRevision,
  type GameMode,
  type OrbitaTheme,
  type PlanetBiome,
  type PlanetMood,
  type PlanetMusicProfile,
} from "@/orbita-music-lab";

const WORLDS: { id: OrbitaTheme; label: string; hint: string }[] = [
  { id: "menta", label: "Menta", hint: "Discovery" },
  { id: "durazno", label: "Durazno", hint: "Playful" },
  { id: "lavanda", label: "Lavanda", hint: "Dreamlike" },
  { id: "glaciar", label: "Glaciar", hint: "Crystal" },
  { id: "eclipse", label: "Eclipse", hint: "Final" },
  { id: "procedural", label: "Planet", hint: "Generated" },
];

const CAMPAIGN: Exclude<OrbitaTheme, "procedural">[] = [
  "menta",
  "durazno",
  "lavanda",
  "glaciar",
  "eclipse",
];

const MODES: { id: GameMode; label: string }[] = [
  { id: "expedition", label: "Expedition" },
  { id: "calm", label: "Calm" },
  { id: "daily", label: "Daily" },
  { id: "infinite", label: "Infinite" },
  { id: "anomaly", label: "Anomaly" },
];

const WORLD_CLASS: Record<string, string> = {
  menta: "data-[on=true]:border-world-menta",
  durazno: "data-[on=true]:border-world-durazno",
  lavanda: "data-[on=true]:border-world-lavanda",
  glaciar: "data-[on=true]:border-world-glaciar",
  eclipse: "data-[on=true]:border-world-eclipse",
  procedural: "data-[on=true]:border-accent",
};

const idleDiagnostics: EngineDiagnostics = {
  activeVoices: 0,
  scheduledEvents: 0,
  bpm: 0,
  currentBar: 0,
  currentBeat: 0,
  beatsPerBar: 4,
  subdivision: 4,
  section: "idle",
  theme: "idle",
  intensity: 0.35,
  combo: 0,
  mode: "expedition",
  seed: "",
  scale: "none",
  keyName: "-",
  running: false,
  paused: false,
  suspended: false,
  masterVolume: 1,
  musicVolume: 1,
  sfxVolume: 1,
  peak: 0,
  rms: 0,
  peakDbfs: -120,
  rmsDbfs: -120,
  limiterReduction: 0,
  compressorReduction: 0,
  speakerPreview: false,
  revision: "v1.2",
};

const SHOWCASE_MS = 36000;

export function MusicLab() {
  const engineRef = useRef<OrbitaMusicEngine | null>(null);
  const abTimer = useRef<number | null>(null);
  const showcaseTimer = useRef<number | null>(null);
  const showcaseIndex = useRef(0);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<OrbitaTheme>("menta");
  const [seed, setSeed] = useState("MENTA-2026-001");
  const [intensity, setIntensity] = useState(50);
  const [combo, setCombo] = useState(0);
  const [mode, setMode] = useState<GameMode>("expedition");
  const [masterVol, setMasterVol] = useState(100);
  const [musicVol, setMusicVol] = useState(100);
  const [sfxVol, setSfxVol] = useState(100);
  const [muted, setMuted] = useState({ music: false, sfx: false });
  const [speaker, setSpeaker] = useState(false);
  const [diag, setDiag] = useState<EngineDiagnostics>(idleDiagnostics);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [status, setStatus] = useState("Tap play to open the lab.");
  const [labMode, setLabMode] = useState<"free" | "ab" | "showcase">("free");
  const [biome, setBiome] = useState<PlanetBiome>("crystal");
  const [mood, setMood] = useState<PlanetMood>("mysterious");
  const [danger, setDanger] = useState(25);
  const [luminosity, setLuminosity] = useState(60);
  const [anomaly, setAnomaly] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState<EngineRevision>("v1.2");

  const profile = useMemo<PlanetMusicProfile>(
    () => ({
      seed,
      biome,
      mood,
      intensity: intensity / 100,
      temperature: biome === "lava" ? 0.9 : biome === "glacial" ? 0.1 : 0.5,
      luminosity: luminosity / 100,
      danger: danger / 100,
      anomaly: anomaly / 100,
    }),
    [seed, biome, mood, intensity, luminosity, danger, anomaly],
  );

  const clearTimers = useCallback(() => {
    if (abTimer.current) {
      window.clearTimeout(abTimer.current);
      abTimer.current = null;
    }
    if (showcaseTimer.current) {
      window.clearTimeout(showcaseTimer.current);
      showcaseTimer.current = null;
    }
  }, []);

  useEffect(() => {
    const engine = new OrbitaMusicEngine({ musicVolume: 1, sfxVolume: 1, masterVolume: 1 });
    engineRef.current = engine;
    const id = window.setInterval(() => {
      setDiag(engine.getDiagnostics());
    }, 120);
    return () => {
      window.clearInterval(id);
      clearTimers();
      engine.dispose();
      engineRef.current = null;
    };
  }, [clearTimers]);

  const ensure = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return null;
    await engine.initialize();
    await engine.resumeAudioContext();
    engine.setMasterVolume(masterVol / 100);
    engine.setMusicVolume(musicVol / 100);
    engine.setSfxVolume(sfxVol / 100);
    engine.setSpeakerPreview(speaker);
    setAnalyser(engine.getAnalyser());
    setReady(true);
    return engine;
  }, [masterVol, musicVol, sfxVol, speaker]);

  const startThemeNow = useCallback(
    async (id: OrbitaTheme, nextIntensity = intensity, nextSeed = seed) => {
      const engine = await ensure();
      if (!engine) return;
      engine.setRevision(revision);
      engine.setIntensity(nextIntensity / 100);
      engine.setCombo(combo);
      engine.setGameMode(mode);
      if (id === "procedural") engine.startTheme("procedural", { seed: nextSeed, profile });
      else engine.startTheme(id, { seed: nextSeed });
    },
    [combo, ensure, intensity, mode, profile, seed, revision],
  );

  const start = useCallback(async () => {
    try {
      setError(null);
      clearTimers();
      setLabMode("free");
      await startThemeNow(theme);
      setStatus("Playing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audio failed to start");
    }
  }, [clearTimers, startThemeNow, theme]);

  const applyRevision = async (id: EngineRevision) => {
    setRevision(id);
    const engine = engineRef.current;
    if (!engine) return;
    engine.setRevision(id);
    if (ready && (diag.running || diag.paused)) {
      engine.setIntensity(intensity / 100);
      engine.setCombo(combo);
      engine.setGameMode(mode);
      if (theme === "procedural") engine.startTheme("procedural", { seed, profile });
      else engine.startTheme(theme, { seed });
      setStatus(`Playing · ${id}`);
    }
  };

  const stressListen = async () => {
    try {
      setError(null);
      clearTimers();
      setLabMode("free");
      setIntensity(92);
      setCombo(24);
      const engine = await ensure();
      if (!engine) return;
      engine.setRevision(revision);
      engine.setIntensity(0.92);
      engine.setCombo(24);
      engine.setGameMode("expedition");
      if (theme === "procedural") engine.startTheme("procedural", { seed, profile });
      else engine.startTheme(theme, { seed });
      setStatus("Stress · high intensity + combo + pickups");
      let n = 0;
      const burst = window.setInterval(() => {
        engine.triggerLightPickup();
        n += 1;
        if (n >= 10) window.clearInterval(burst);
      }, 180);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Stress failed");
    }
  };

  const onWorld = async (id: OrbitaTheme) => {
    setTheme(id);
    const engine = engineRef.current;
    if (!engine || !ready) return;
    if (labMode === "showcase") return;
    if (id === "procedural") engine.transitionToPlanet(profile);
    else engine.transitionToTheme(id, { seed });
  };

  const playAb = async (id: Exclude<OrbitaTheme, "procedural">) => {
    try {
      setError(null);
      clearTimers();
      setLabMode("ab");
      setTheme(id);
      setIntensity(50);
      setCombo(0);
      setMode("expedition");
      const engine = await ensure();
      if (!engine) return;
      engine.setIntensity(0.5);
      engine.setCombo(0);
      engine.setGameMode("expedition");
      engine.startTheme(id, { seed: `AB-${id}` });
      setStatus(`A/B · ${labelFor(id)} at 50%`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "A/B failed");
    }
  };

  const play30s = async () => {
    const id = theme === "procedural" ? "menta" : theme;
    await playAb(id);
    abTimer.current = window.setTimeout(() => {
      engineRef.current?.stop();
      setStatus("A/B 30s complete");
      setLabMode("free");
    }, 30000);
  };

  const startShowcase = async () => {
    try {
      setError(null);
      clearTimers();
      setLabMode("showcase");
      setIntensity(55);
      setCombo(0);
      setMode("expedition");
      const engine = await ensure();
      if (!engine) return;
      engine.setIntensity(0.55);
      engine.setCombo(0);
      engine.setGameMode("expedition");
      showcaseIndex.current = 0;
      const step = (index: number) => {
        if (index >= CAMPAIGN.length) {
          engine.stop();
          setLabMode("free");
          setStatus("Campaign showcase complete");
          return;
        }
        const id = CAMPAIGN[index]!;
        setTheme(id);
        if (index === 0) engine.startTheme(id, { seed: `SHOW-${id}` });
        else engine.transitionToTheme(id, { seed: `SHOW-${id}`, bars: 2 });
        setStatus(`Showcase · ${labelFor(id)} (${index + 1}/5)`);
        showcaseTimer.current = window.setTimeout(() => step(index + 1), SHOWCASE_MS);
      };
      step(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Showcase failed");
    }
  };

  useEffect(() => {
    engineRef.current?.setIntensity(intensity / 100);
  }, [intensity]);
  useEffect(() => {
    engineRef.current?.setCombo(combo);
  }, [combo]);
  useEffect(() => {
    engineRef.current?.setGameMode(mode);
  }, [mode]);
  useEffect(() => {
    engineRef.current?.setMusicVolume(musicVol / 100);
  }, [musicVol]);
  useEffect(() => {
    engineRef.current?.setSfxVolume(sfxVol / 100);
  }, [sfxVol]);
  useEffect(() => {
    engineRef.current?.setMasterVolume(masterVol / 100);
  }, [masterVol]);
  useEffect(() => {
    engineRef.current?.setSpeakerPreview(speaker);
  }, [speaker]);

  const exportJson = () => {
    const plan = engineRef.current?.exportCompositionPlan();
    if (!plan) return;
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
    downloadBlob(blob, `orbita-${theme}-${seed}.json`);
  };

  const exportWav = async (seconds: number) => {
    const engine = engineRef.current;
    if (!engine || !ready) return;
    setStatus(`Rendering ${seconds}s…`);
    try {
      const wav = await engine.renderOffline(seconds);
      downloadBlob(new Blob([new Uint8Array(wav)], { type: "audio/wav" }), `orbita-${theme}-${seconds}s.wav`);
      setStatus("Playing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Render failed");
      setStatus("Playing");
    }
  };

  const measureLoudness = async () => {
    const engine = engineRef.current;
    if (!engine || !ready) return;
    setStatus("Measuring 8s…");
    try {
      const report = await engine.measureOffline(8);
      const lufs = report.lufsUngated === null ? "n/a" : `${report.lufsUngated.toFixed(1)} LUFS*`;
      setStatus(`Peak ${report.peakDbfs.toFixed(1)} dB · RMS ${report.rmsDbfs.toFixed(1)} dB · ${lufs}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Measure failed");
    }
  };

  const peakLabel = Number.isFinite(diag.peakDbfs) ? `${diag.peakDbfs.toFixed(1)} dB` : "—";
  const rmsLabel = Number.isFinite(diag.rmsDbfs) ? `${diag.rmsDbfs.toFixed(1)} dB` : "—";
  const redLabel = `${Math.min(0, diag.limiterReduction).toFixed(1)} dB`;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 pb-16 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">Órbita · v1.2 harmony polish</p>
            <h1 className="mt-1 font-display text-4xl font-medium tracking-tight text-fg sm:text-5xl">
              Music Lab
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Original procedural soundtrack. v1.2 keeps the five world identities and cleans accidental clashes, tails, and mud.
          </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" onClick={() => void start()} className="min-w-24">
              <Play className="size-4 translate-x-px" />
              Play
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                engineRef.current?.pause();
                setStatus("Paused");
              }}
              aria-label="Pause"
            >
              <Pause className="size-4" />
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                clearTimers();
                setLabMode("free");
                engineRef.current?.stop();
                setStatus("Stopped");
                setDiag(engineRef.current?.getDiagnostics() ?? idleDiagnostics);
              }}
              aria-label="Stop"
            >
              <Square className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                const next = { ...muted, music: !muted.music };
                setMuted(next);
                engineRef.current?.setMuted(next.music, next.sfx);
              }}
              aria-label="Mute music"
            >
              {muted.music ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </Button>
          </div>
        </header>

        {error ? (
          <p className="rounded-md bg-surface px-3 py-2 text-sm text-danger shadow-border">{error}</p>
        ) : null}

        <section className="overflow-hidden rounded-xl bg-bg-elevated shadow-border">
          <div className="relative h-56 sm:h-72 lg:h-80">
            <OrbitVisualizer analyser={analyser} diagnostics={diag} theme={diag.theme} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
              <div>
                <p className="font-display text-xl text-fg">{labelFor(theme)}</p>
                <p className="text-xs text-muted">
                  {diag.keyName} {diag.scale} · {status}
                </p>
              </div>
              <Meter peak={diag.peak} running={diag.running && !diag.paused} />
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-px bg-border sm:grid-cols-6">
            <Stat label="BPM" value={diag.bpm ? diag.bpm.toFixed(0) : "—"} />
            <Stat label="Bar" value={String(diag.currentBar)} />
            <Stat label="Section" value={diag.section} />
            <Stat label="Voices" value={String(diag.activeVoices)} />
            <Stat label="Peak" value={peakLabel} />
            <Stat label="RMS" value={rmsLabel} />
          </dl>
          <dl className="grid grid-cols-3 gap-px bg-border sm:grid-cols-6">
            <Stat label="Master" value={`${Math.round(diag.masterVolume * 100)}%`} />
            <Stat label="Music" value={`${Math.round(diag.musicVolume * 100)}%`} />
            <Stat label="Events" value={`${Math.round(diag.sfxVolume * 100)}%`} />
            <Stat label="Comp" value={`${Math.min(0, diag.compressorReduction).toFixed(1)} dB`} />
            <Stat label="Limiter" value={redLabel} />
            <Stat label="Theme" value={String(diag.theme)} />
          </dl>
        </section>

        <section>
          <Label>World</Label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {WORLDS.map((world) => (
              <button
                key={world.id}
                type="button"
                data-on={theme === world.id}
                onClick={() => void onWorld(world.id)}
                className={cn(
                  "min-h-11 rounded-md bg-surface px-3 py-2 text-left shadow-border transition-[background-color,border-color] duration-150",
                  "border border-transparent hover:bg-surface-2",
                  WORLD_CLASS[world.id],
                  theme === world.id && "border-current bg-surface-2",
                )}
              >
                <span className="block text-sm font-medium">{world.label}</span>
                <span className="block text-xs text-muted">{world.hint}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg bg-surface p-4 shadow-border sm:p-5">
          <Label>Listening tests</Label>
          <p className="mt-2 text-sm text-muted">
            A/B starts every world at the same 50% intensity. Showcase plays the five campaign planets in order, ~36s each.
            Switch engine revision to hear v1.1 vs the v1.2 polish on the same identity.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["v1.2", "v1.1"] as EngineRevision[]).map((id) => (
              <Button
                key={id}
                size="sm"
                variant={revision === id ? "primary" : "secondary"}
                onClick={() => void applyRevision(id)}
              >
                {id}
              </Button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {CAMPAIGN.map((id) => (
              <Button key={id} size="sm" variant={labMode === "ab" && theme === id ? "primary" : "secondary"} onClick={() => void playAb(id)}>
                {labelFor(id)}
              </Button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => void play30s()}>Play 30 sec comparison</Button>
            <Button variant="primary" onClick={() => void startShowcase()}>
              Campaign showcase
            </Button>
            <Button onClick={() => void stressListen()}>Stress mix</Button>
            <Button
              variant={speaker ? "primary" : "secondary"}
              onClick={() => setSpeaker((v) => !v)}
            >
              {speaker ? "Speaker preview on" : "Phone speaker preview"}
            </Button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg bg-surface p-4 shadow-border sm:p-5">
            <Label>Intensity</Label>
            <SliderRow value={intensity} onChange={setIntensity} display={`${intensity}%`} />
            <div className="mt-4">
              <Label>Combo</Label>
              <SliderRow value={combo} max={40} onChange={setCombo} display={String(combo)} />
            </div>
            <div className="mt-4">
              <Label>Mode</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {MODES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={cn(
                      "min-h-11 rounded-sm px-3 text-sm shadow-border",
                      mode === item.id ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <div>
                <Label>Master output</Label>
                <SliderRow value={masterVol} onChange={setMasterVol} display={`${masterVol}%`} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Music</Label>
                  <SliderRow value={musicVol} onChange={setMusicVol} display={`${musicVol}%`} />
                </div>
                <div>
                  <Label>Events</Label>
                  <SliderRow value={sfxVol} onChange={setSfxVol} display={`${sfxVol}%`} />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg bg-surface p-4 shadow-border sm:p-5">
            <Label>Events</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <EventBtn label="Collect light" onClick={() => engineRef.current?.triggerLightPickup()} />
              <EventBtn label="Orbit in" onClick={() => engineRef.current?.triggerOrbitIn()} />
              <EventBtn label="Orbit out" onClick={() => engineRef.current?.triggerOrbitOut()} />
              <EventBtn label="Shield hit" onClick={() => engineRef.current?.triggerShieldHit()} />
              <EventBtn label="Damage" onClick={() => engineRef.current?.triggerDamage()} />
              <EventBtn label="Run end" onClick={() => engineRef.current?.triggerRunEnd()} />
            </div>
            <div className="mt-5">
              <Label htmlFor="seed">Seed</Label>
              <input
                id="seed"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="mt-2 h-11 w-full rounded-sm bg-bg px-3 font-mono text-sm text-fg shadow-border outline-none focus:ring-2 focus:ring-accent/40"
                suppressHydrationWarning
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={exportJson} size="sm">
                <Download className="size-3.5" />
                Plan JSON
              </Button>
              <Button onClick={() => void exportWav(30)} size="sm">
                Render 30s
              </Button>
              <Button onClick={() => void exportWav(60)} size="sm">
                Render 60s
              </Button>
              <Button onClick={() => void measureLoudness()} size="sm">
                Measure 8s
              </Button>
            </div>
          </section>
        </div>

        {theme === "procedural" ? (
          <section className="rounded-lg bg-surface p-4 shadow-border sm:p-5">
            <Label>Procedural planet</Label>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Biome">
                <select
                  value={biome}
                  onChange={(e) => setBiome(e.target.value as PlanetBiome)}
                  className="h-11 w-full rounded-sm bg-bg px-3 text-sm shadow-border"
                >
                  {BIOMES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Mood">
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value as PlanetMood)}
                  className="h-11 w-full rounded-sm bg-bg px-3 text-sm shadow-border"
                >
                  {MOODS.map((item) => (
                    <option key={item} value={item}>
                      {optionLabel(item)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={`Danger ${danger}%`}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={danger}
                  onChange={(e) => setDanger(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </Field>
              <Field label={`Luminosity ${luminosity}%`}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={luminosity}
                  onChange={(e) => setLuminosity(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </Field>
              <Field label={`Anomaly ${anomaly}%`}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={anomaly}
                  onChange={(e) => setAnomaly(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </Field>
            </div>
          </section>
        ) : null}

        <p className="text-center text-xs text-subtle">
          All music is generated from original grammars. No samples, no streaming, no network.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-elevated px-3 py-3">
      <dt className="text-[10px] tracking-[0.16em] text-muted uppercase">{label}</dt>
      <dd className="mt-1 font-mono text-sm tabular text-fg">{value}</dd>
    </div>
  );
}

function Meter({ peak, running }: { peak: number; running: boolean }) {
  const width = Math.max(2, Math.min(100, peak * 140));
  return (
    <div className="w-28 sm:w-40">
      <p className="mb-1 text-right text-[10px] tracking-[0.16em] text-muted uppercase">Level</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className={cn("h-full rounded-full bg-accent transition-[width] duration-150", !running && "opacity-40")}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
      {children}
    </label>
  );
}

function SliderRow({
  value,
  onChange,
  display,
  max = 100,
}: {
  value: number;
  onChange: (value: number) => void;
  display: string;
  max?: number;
}) {
  return (
    <div className="mt-2 flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full accent-accent"
        suppressHydrationWarning
      />
      <span className="w-12 text-right font-mono text-sm tabular text-fg">{display}</span>
    </div>
  );
}

function EventBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="secondary" size="sm" className="h-11 w-full" onClick={onClick}>
      {label}
    </Button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs text-muted">
      <span className="mb-2 block tracking-[0.14em] uppercase">{label}</span>
      {children}
    </label>
  );
}

function labelFor(id: OrbitaTheme) {
  return WORLDS.find((w) => w.id === id)?.label ?? id;
}

function optionLabel(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
