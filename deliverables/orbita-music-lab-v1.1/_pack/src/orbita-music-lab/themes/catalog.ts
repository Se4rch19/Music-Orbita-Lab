import type { OrbitaThemeId, WorldThemeDefinition } from "../core/types.ts";
import { DURAZNO } from "./durazno.ts";
import { ECLIPSE } from "./eclipse.ts";
import { GLACIAR } from "./glaciar.ts";
import { LAVANDA } from "./lavanda.ts";
import { MENTA } from "./menta.ts";

export const CURATED_THEMES: Record<Exclude<OrbitaThemeId, "procedural">, WorldThemeDefinition> = {
  menta: MENTA,
  durazno: DURAZNO,
  lavanda: LAVANDA,
  glaciar: GLACIAR,
  eclipse: ECLIPSE,
};

export function getCuratedTheme(id: Exclude<OrbitaThemeId, "procedural">): WorldThemeDefinition {
  return CURATED_THEMES[id];
}
