// Zen Theme — Japanese Minka House aesthetic for Claw3D
// Colours inspired by sumi ink, aged bronze, matcha, and rice paper

export const zen = {
  colors: {
    // Backgrounds
    sumi:       "#1A1A18",  // Sumi ink — dark wood, main background
    charcoal:   "#242422",  // Charcoal wood — panels, cards
    surface:    "#242422",  // Alias for charcoal (semantic)

    // Accents
    wabiGold:   "#B8A07E",  // Aged bronze — headings, highlights
    matcha:     "#7D8C6C",  // Muted green — status, active
    clay:       "#A67C5B",  // Warm earth — user bubbles, highlights

    // Text
    ricePaper:  "#E8E0D4",  // Warm white — primary text
    stone:      "#7A7A72",  // Stone — secondary text, muted

    // Borders
    bamboo:     "#3A3A36",  // Bamboo — subtle dividers
    bambooLight:"#4A4A46",  // Lighter bamboo variant

    // Status dots
    matchaGreen:"#7D8C6C",  // Matcha (active)
    stoneGray:  "#7A7A72",  // Stone (standby)
    clayWarm:   "#A67C5B",  // Clay (building)
  },

  fonts: {
    heading: '"Segoe UI Semilight", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    body:    '"Segoe UI Semilight", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    mono:    '"IBM Plex Mono", "Menlo", monospace',
  },

  // Shared top bar styles
  topBar: {
    height: 40,
    background: "#1A1A18",
    borderBottom: "1px solid #3A3A36",
    paddingX: 16,
  },

  // Shared panel styles
  panel: {
    background: "#242422",
    border: "1px solid #3A3A36",
  },
} as const;

// CSS variable string to inject via globals.css
export const zenCSSVariables = `
  --zen-sumi: #1A1A18;
  --zen-charcoal: #242422;
  --zen-wabi-gold: #B8A07E;
  --zen-matcha: #7D8C6C;
  --zen-clay: #A67C5B;
  --zen-rice-paper: #E8E0D4;
  --zen-stone: #7A7A72;
  --zen-bamboo: #3A3A36;
  --zen-bamboo-light: #4A4A46;
`;

// Type helpers
export type ZenColors = typeof zen.colors;
