---
name: Helio-Metric Precision
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#44474a'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#75777a'
  outline-variant: '#c5c6ca'
  surface-tint: '#5d5e61'
  primary: '#000101'
  on-primary: '#ffffff'
  primary-container: '#1a1c1e'
  on-primary-container: '#838486'
  inverse-primary: '#c6c6c9'
  secondary: '#a04100'
  on-secondary: '#ffffff'
  secondary-container: '#fe6b00'
  on-secondary-container: '#572000'
  tertiary: '#000001'
  on-tertiary: '#ffffff'
  tertiary-container: '#001a41'
  on-tertiary-container: '#2480ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e5'
  primary-fixed-dim: '#c6c6c9'
  on-primary-fixed: '#1a1c1e'
  on-primary-fixed-variant: '#454749'
  secondary-fixed: '#ffdbcc'
  secondary-fixed-dim: '#ffb693'
  on-secondary-fixed: '#351000'
  on-secondary-fixed-variant: '#7a3000'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a41'
  on-tertiary-fixed-variant: '#004493'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-main:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  data-label:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  caption:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 16px
  container-max: 1440px
---

## Brand & Style

This design system is built on the principles of Swiss Design (International Typographic Style), prioritizing clarity, objectivity, and a rigorous underlying grid. The brand personality is professional, precise, and intellectually honest, catering specifically to architects and environmental engineers who manage complex climate data.

The aesthetic is **Modern Minimalist** with a technical edge. It avoids decorative elements in favor of functional structure. The UI should evoke a sense of structural integrity and scientific accuracy, utilizing heavy whitespace to reduce cognitive load when viewing dense datasets. Every visual choice is driven by information hierarchy and legibility.

## Colors

The palette is rooted in a "Cold Neutral" spectrum to maintain a clinical, professional environment. 

- **Neutral & Backgrounds:** We use a range of cool grays and pure whites to establish a sterile, high-contrast canvas. Grays are used to distinguish between different information containers without introducing visual noise.
- **Solar Orange (Primary Accent):** Used exclusively for critical climate data, heat maps, and primary calls to action. It represents solar energy and thermal intensity.
- **Data Blue (Secondary Accent):** Used for hydro-data, cooling systems, and interactive state indicators (links, focus states).
- **Ink Black:** Used for typography and structural iconography to ensure maximum legibility against the light surfaces.

## Typography

The system utilizes **Hanken Grotesk** for its geometric purity and contemporary Swiss feel. It provides a neutral but sharp voice for both headers and body text. 

For technical data points, coordinates, and climate metrics, **JetBrains Mono** is employed. The monospaced nature of the font ensures that numerical data aligns perfectly in tables and dashboard widgets, reinforcing the feeling of engineering precision.

- **Scale:** High contrast between display sizes and body text is encouraged to create a clear entry point into data-heavy pages.
- **Alignment:** Always align text to a strict vertical grid. Avoid center alignment for body copy; stick to flush-left/ragged-right for maximum readability.

## Layout & Spacing

This design system uses a **12-column Fluid Grid** for desktop and a **4-column grid** for mobile. The layout is inspired by architectural blueprints—every element must align to a 4px baseline grid.

- **Margins:** Generous outer margins (64px+) on desktop create a "frame" for the work, emphasizing the content as a precise instrument.
- **Gutters:** Fixed 24px gutters ensure breathing room between data modules.
- **Modules:** Content should be organized into clear modular blocks. Components often span 3, 4, 6, or 12 columns to maintain mathematical harmony.

## Elevation & Depth

To maintain the minimalist Swiss aesthetic, depth is conveyed through **Tonal Layering** and **Low-Contrast Outlines** rather than traditional shadows.

- **Stacking:** Use background color shifts (e.g., White to Light Gray) to indicate a change in surface level.
- **Borders:** 1px solid strokes in `#DEE2E6` are the primary method for defining card boundaries and input fields.
- **Focus:** When an element is active or focused, use a 2px "Data Blue" border or a subtle 4px blur shadow with 5% opacity to indicate elevation without breaking the flat aesthetic.
- **Glassmorphism:** Use sparingly for floating panels (like a map legend) with a 20px backdrop blur and 80% opacity white fill to allow the underlying data to remain visible.

## Shapes

The shape language is **Sharp**. In line with architectural precision and technical drawings, all UI elements (buttons, cards, inputs) feature 0px border-radii. 

Rounded corners are perceived as "friendly" or "soft," which conflicts with the goal of being a "precise instrument." The only exception is for circular status indicators or specific map markers where geometry dictates a circle for symbolic clarity.

## Components

- **Buttons:** Sharp-edged, high-contrast blocks. Primary buttons use Ink Black with White text. Secondary buttons use a 1px border. Hover states should involve a simple color inversion.
- **Data Cards:** Minimalist containers with no shadow. Use a 1px border and a `caption` style header to label the data being displayed.
- **Input Fields:** Bottom-border only or full 1px border. Use JetBrains Mono for input text to signify data entry. Label text should be small, uppercase, and positioned above the field.
- **Chips/Tags:** Used for filtering climate variables (e.g., "Wind Speed", "Solar Gain"). These should be rectangular with a light gray background and no border.
- **Lists:** High-density, separated by 1px horizontal dividers. Use monospaced fonts for any numerical values within the list.
- **Climate Graphs:** Lines should be thin (1px to 1.5px). Use Solar Orange and Data Blue for the plot lines. Grid lines within charts should be ultra-faint (`#F1F3F5`).
- **Navigation:** A structural sidebar or top bar using a strict grid. Active states are indicated by a bold 2px underline or side-bar accent in Solar Orange.