import { pcName } from "../core/pitch.ts";
import type {
  BassRole,
  CadenceKind,
  ChordSymbol,
  MelodicArc,
  MotifStage,
  PhraseBarPlan,
  PhrasePlan,
  PhrasePlanSummary,
  PhraseRole,
  SectionId,
} from "../core/types.ts";
import { chordKey, formatChord } from "../theory/chords.ts";
import {
  cadenceForSection,
  dissonanceBudgetFor,
  grammarFor,
  motifStageFor,
  phraseLengthFor,
  SECTION_BARS,
  sectionAtBarFromSequence,
  spaceWetFor,
  type CompositionGrammar,
} from "./grammar.ts";
import type { SessionIdentity } from "./session.ts";

export function phraseWindow(
  session: SessionIdentity,
  barIndex: number,
  forceSection?: SectionId,
): { section: SectionId; localBar: number; startBar: number; length: number; phraseIndex: number } {
  const info = forceSection
    ? {
        id: forceSection,
        localBar: ((barIndex % SECTION_BARS[forceSection]) + SECTION_BARS[forceSection]) % SECTION_BARS[forceSection],
      }
    : sectionAtBarFromSequence(session.sectionSequence, barIndex);
  const length = phraseLengthFor(info.id);
  const phraseLocal = Math.floor(info.localBar / length) * length;
  const startBar = forceSection ? barIndex - (barIndex % length) : barIndex - (info.localBar - phraseLocal);
  const cycle = session.sectionSequence.reduce((sum, s) => sum + s.bars, 0) || 56;
  const abs = ((startBar % cycle) + cycle) % cycle;
  let cursor = 0;
  let phraseIndex = 0;
  for (const section of session.sectionSequence) {
    const plen = phraseLengthFor(section.id);
    const count = Math.max(1, Math.ceil(section.bars / plen));
    if (abs < cursor + section.bars) {
      phraseIndex += Math.floor((abs - cursor) / plen);
      break;
    }
    phraseIndex += count;
    cursor += section.bars;
  }
  return {
    section: info.id,
    localBar: info.localBar,
    startBar,
    length,
    phraseIndex,
  };
}

function roleFor(local: number, length: number, section: SectionId): PhraseRole {
  if (section === "RECOVERY" && local % 2 === 1) return "breath";
  if (length <= 4) {
    if (local <= 1) return "statement";
    if (section === "BUILD") return local === length - 1 ? "cadence" : "development";
    return local === length - 1 ? "cadence" : "response";
  }
  if (local <= 1) return "statement";
  if (local <= 3) return "response";
  if (local <= 5) return "development";
  return "cadence";
}

function arcFor(grammar: CompositionGrammar, section: SectionId): MelodicArc {
  if (grammar.world === "glaciar") return "sparse-bell";
  if (grammar.world === "lavanda") return "question-answer";
  if (grammar.world === "eclipse") return "stable-tension-release";
  if (grammar.world === "durazno") return section === "B" ? "low-repeat-expand" : "rise-peak-resolve";
  if (section === "INTRO") return "low-repeat-expand";
  if (section === "PEAK") return "rise-peak-resolve";
  return grammar.defaultArc;
}

function bassRoleFor(grammar: CompositionGrammar, section: SectionId, role: PhraseRole): BassRole {
  if (grammar.world === "glaciar") return "pedal";
  if (grammar.world === "durazno" && section !== "INTRO" && section !== "RECOVERY") return "groove-cell";
  if (section === "INTRO" || section === "RECOVERY") return "pedal";
  if (role === "cadence") return "root-motion";
  if (grammar.world === "eclipse" && (section === "PEAK" || section === "BUILD")) return "octave-pulse";
  if (grammar.world === "menta" && section === "A") return "root-motion";
  return grammar.defaultBass;
}

function tensionOwnerFor(grammar: CompositionGrammar, section: SectionId, role: PhraseRole) {
  if (grammar.dissonanceBudget <= 1) {
    if (role === "development" || section === "B") return "lead" as const;
    return "none" as const;
  }
  if (grammar.world === "lavanda") return role === "statement" ? ("pad" as const) : ("lead" as const);
  if (grammar.world === "eclipse") {
    if (section === "PEAK" || section === "BUILD") return "lead" as const;
    if (role === "cadence") return "none" as const;
    return "pad" as const;
  }
  return "none" as const;
}

function melodyActive(
  grammar: CompositionGrammar,
  section: SectionId,
  role: PhraseRole,
  local: number,
  intensity: number,
): boolean {
  if (section === "TRANSITION") return false;
  if (role === "breath") return false;
  if (section === "INTRO" && local > 0 && intensity < 0.18) return false;
  if (grammar.world === "glaciar" && grammar.restBars.includes(local % 8) && role !== "statement") return false;
  if (grammar.world === "menta" && local === 3 && section !== "PEAK") return false;
  if (grammar.world === "lavanda" && local === 5 && section !== "PEAK") return false;
  if (grammar.world === "eclipse" && local === 3 && (section === "A" || section === "A_VARIATION")) return false;
  if (section === "RECOVERY" && local % 2 === 1) return false;
  return true;
}

function counterActive(
  melodyOn: boolean,
  section: SectionId,
  role: PhraseRole,
  intensity: number,
  combo: number,
  grammar: CompositionGrammar,
): boolean {
  if (section === "TRANSITION" || section === "INTRO") return false;
  if (grammar.world === "glaciar") return !melodyOn && role !== "breath";
  if (section === "PEAK") return !melodyOn || role === "response" || role === "development";
  if (section === "BUILD" && intensity > 0.45) return !melodyOn || role === "cadence";
  if (section === "B" && combo >= 12 && intensity > 0.55) return !melodyOn;
  if (melodyOn) return false;
  return role === "response" || role === "breath";
}

function arpActive(
  grammar: CompositionGrammar,
  section: SectionId,
  intensity: number,
  role: PhraseRole,
): boolean {
  if (section === "RECOVERY" || section === "TRANSITION" || section === "INTRO") return false;
  if (!grammar.palette.arp && grammar.world !== "lavanda") {
    if (grammar.world === "durazno") return (section === "BUILD" || section === "PEAK") && intensity >= 0.55;
    if (grammar.world === "eclipse") return section === "PEAK" || section === "BUILD";
    return false;
  }
  if (grammar.world === "lavanda") return role !== "breath";
  if (role === "cadence") return false;
  return intensity >= 0.38;
}

export function phrasePlanFor(
  session: SessionIdentity,
  barIndex: number,
  intensity: number,
  combo: number,
  forceSection?: SectionId,
): PhrasePlan {
  const window = phraseWindow(session, barIndex, forceSection);
  const section = window.section;
  const grammar = grammarFor(session.themeId === "procedural" ? session.dna.progressionFamily : session.themeId);
  const familyId = session.familyBySection?.[section] ?? grammar.families[0]!.id;
  const family = grammar.families.find((item) => item.id === familyId) ?? grammar.families[0]!;
  const cadence: CadenceKind = session.cadenceBySection?.[section] ?? cadenceForSection(grammar, section, family);
  const stage: MotifStage = motifStageFor(section, window.phraseIndex);
  const contour = arcFor(grammar, section);
  const budget = dissonanceBudgetFor(grammar, section);
  const motif = section === "B" ? (session.motifs[1] ?? session.motifs[0]!) : session.motifs[0]!;
  const progression = session.progressions[section] ?? family.chords;
  const space = spaceWetFor(section);
  const bars: PhraseBarPlan[] = [];

  for (let i = 0; i < window.length; i++) {
    const role = roleFor(i, window.length, section);
    const melodyOn = melodyActive(grammar, section, role, i, intensity);
    const dropPerc = section === "PEAK" && i === 4;
    const fill = (section === "BUILD" && i === window.length - 1) || (section === "PEAK" && i === window.length - 1);
    const owner = tensionOwnerFor(grammar, section, role);
    const bass = bassRoleFor(grammar, section, role);
    const dir: -1 | 0 | 1 =
      contour === "sparse-bell"
        ? 0
        : contour === "question-answer"
          ? role === "statement" || role === "development"
            ? 1
            : -1
          : contour === "rise-peak-resolve"
            ? role === "cadence"
              ? -1
              : 1
            : role === "development"
              ? 1
              : 0;
    bars.push({
      localBar: i,
      role,
      melodyActive: melodyOn,
      counterActive: counterActive(melodyOn, section, role, intensity, combo, grammar),
      arpActive: arpActive(grammar, section, intensity, role) && !dropPerc,
      pulseActive:
        !(section === "RECOVERY" && grammar.world !== "durazno") && !(grammar.world === "menta" && intensity < 0.12),
      percDensity: dropPerc ? 0.08 : percDensity(grammar, section, intensity, i),
      bassRole: bass,
      fill,
      tensionOwner: owner,
      spaceWet: space,
      motifStage: i <= 1 && stage === "transform" ? "repeat" : stage,
      melodyStartTick: i === 1 && section !== "INTRO" ? 2 : 0,
      melodyDirection: dir,
    });
  }

  return {
    phraseIndex: window.phraseIndex,
    section,
    startBar: window.startBar,
    length: window.length,
    tonalCenterPc: session.tonicPc,
    cadence,
    familyId,
    progression,
    motifId: motif.id,
    motifStage: stage,
    contour,
    bassRole: bassRoleFor(grammar, section, "statement"),
    rhythmCell: grammar.rhythmGrid.id,
    orchestration: {
      harmony: true,
      bass: true,
      melody: bars.some((b) => b.melodyActive),
      counter: bars.some((b) => b.counterActive),
      arp: bars.some((b) => b.arpActive),
      percussion: bars.some((b) => b.percDensity > 0.15),
      atmosphere: true,
      gameplay: true,
    },
    dissonanceBudget: budget,
    tensionOwner: tensionOwnerFor(grammar, section, "statement"),
    bars,
  };
}

function percDensity(
  grammar: CompositionGrammar,
  section: SectionId,
  intensity: number,
  local: number,
): number {
  const base =
    section === "INTRO"
      ? 0.22
      : section === "A"
        ? 0.55
        : section === "A_VARIATION"
          ? 0.62
          : section === "B"
            ? 0.58
            : section === "BUILD"
              ? 0.82
              : section === "PEAK"
                ? 0.95
                : section === "RECOVERY"
                  ? 0.18
                  : 0.1;
  const worldBoost = grammar.world === "durazno" || grammar.world === "eclipse" ? 0.18 : 0;
  const late = local === 7 ? 0.08 : 0;
  return Math.max(0.08, Math.min(1, base * (0.45 + intensity * 0.7) + worldBoost + late));
}

export function barPlanFrom(phrase: PhrasePlan, localBar: number): PhraseBarPlan {
  return phrase.bars[localBar % phrase.bars.length] ?? phrase.bars[0]!;
}

export function summarizePhrase(session: SessionIdentity, phrase: PhrasePlan, localBar: number): PhrasePlanSummary {
  const bar = barPlanFrom(phrase, localBar);
  return {
    section: phrase.section,
    phraseIndex: phrase.phraseIndex,
    startBar: phrase.startBar,
    length: phrase.length,
    tonalCenter: pcName(phrase.tonalCenterPc),
    chords: uniqueChordLabels(session, phrase.progression),
    cadence: phrase.cadence,
    motifVersion: `${phrase.motifId}:${phrase.motifStage}`,
    contour: phrase.contour,
    bassRole: phrase.bassRole,
    orchestration: (Object.keys(phrase.orchestration) as (keyof PhrasePlan["orchestration"])[]).filter(
      (key) => phrase.orchestration[key],
    ),
    tensionOwner: bar.tensionOwner,
    dissonanceBudget: phrase.dissonanceBudget,
    role: bar.role,
  };
}

function uniqueChordLabels(session: SessionIdentity, chords: ChordSymbol[]): string[] {
  const out: string[] = [];
  let last = "";
  for (const symbol of chords) {
    const label = `${formatChord(session.tonicPc, session.scale, symbol)} (${chordKey(symbol)})`;
    if (label !== last) out.push(label);
    last = label;
  }
  return out;
}

export function nextPhraseStart(session: SessionIdentity, barIndex: number): number {
  const window = phraseWindow(session, barIndex);
  return window.startBar + window.length;
}
