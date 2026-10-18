// Tesela UI — tipos de los tokens (generado). No editar a mano.
export type TokenName = "bg" | "bg-elevated" | "bg-glass" | "surface" | "surface-hover" | "surface-strong" | "fg" | "fg-muted" | "fg-subtle" | "border" | "border-strong" | "backdrop" | "accent" | "accent-fg" | "success" | "warning" | "danger" | "info" | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "chart-6" | "chart-7" | "chart-8" | "shadow" | "shadow-lg" | "radius" | "radius-sm" | "radius-xs" | "font-mono" | "font-sans" | "font-heading" | "ease" | "ring";
export interface TokenSet { dark: Record<TokenName, string>; light: Record<TokenName, string>; names: Record<TokenName, string>; vars: Record<TokenName, string>; }
export interface Preset { label: string; description: string; common: Partial<Record<TokenName, string>>; dark: Partial<Record<TokenName, string>>; light: Partial<Record<TokenName, string>>; }
export declare const tokens: TokenSet;
export declare const presets: Record<"tesela" | "esmeralda" | "ambar" | "cielo" | "rosa" | "violeta" | "medianoche" | "papel" | "alto-contraste" | "brutalista" | "suave", Preset>;
export default tokens;
