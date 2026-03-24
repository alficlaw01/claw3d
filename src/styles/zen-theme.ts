// Theme — Clean dark navy + white
export const zen = {
  colors: {
    sumi:       "#0F1724",  // Dark navy — main background
    charcoal:   "#1A2332",  // Slightly lighter navy — panels, cards
    surface:    "#1A2332",

    wabiGold:   "#FFFFFF",  // White — headings
    matcha:     "#34D399",  // Green — active status
    clay:       "#3B82F6",  // Blue — user bubbles

    ricePaper:  "#FFFFFF",  // White — primary text
    stone:      "#94A3B8",  // Slate — secondary text

    bamboo:     "#1E293B",  // Dark border
    bambooLight:"#334155",  // Lighter border

    matchaGreen:"#34D399",
    stoneGray:  "#64748B",
    clayWarm:   "#F59E0B",
  },
  fonts: {
    heading: '"Segoe UI Semilight", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    body:    '"Segoe UI Semilight", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    mono:    '"IBM Plex Mono", "Menlo", monospace',
  },
  topBar: {
    height: 40,
    background: "#0F1724",
    borderBottom: "1px solid #1E293B",
    paddingX: 16,
  },
  panel: {
    background: "#1A2332",
    border: "1px solid #1E293B",
  },
} as const;
export const zenCSSVariables = "";
export type ZenColors = typeof zen.colors;
