# Specification: VanaNavan Color Scheme Redesign

## Goal
Replace the current blue-based color scheme with a warm golden/tan and charcoal palette inspired by the VanaNavan brand image, while preserving all existing visual effects including shadows, blurs, transforms, and rounded corners.

## User Stories
- As a user, I want the website to reflect the VanaNavan brand colors so that the visual identity is consistent with the logo and marketing materials
- As a developer, I want to maintain all existing visual effects (backdrop blur, shadows, transforms) so that the redesign only changes colors without compromising the polished UI experience

## Specific Requirements

**Color Palette Definition**
- Primary golden/tan color: `#D4A574` (extracted from brand image for main interactive elements)
- Dark charcoal background: `#3A3A3C` (for dark mode backgrounds and headers)
- Pink/red accent color: `#C85A6E` (for links and secondary accents as seen in brand image)
- Create a full scale for golden color: 50, 100, 200, 300, 400, 500 (base #D4A574), 600, 700, 800, 900, 950
- Lighter golden shades (50-400) for backgrounds and hover states
- Darker golden shades (600-950) for text and pressed states
- Use charcoal `#3A3A3C` for navbar, cards, and container backgrounds in dark mode

**CSS Variables Update in globals.css**
- Add new CSS custom properties for the golden color scale under `:root`
- Define `--color-golden-50` through `--color-golden-950` with appropriate lightness values
- Add `--color-charcoal` for the dark background
- Add `--color-accent-pink` for the link accent color
- Maintain existing `--background` and `--foreground` variables
- Ensure dark mode prefers-color-scheme media query updates background to use charcoal

**Navbar Color Updates**
- Replace `bg-blue-600` on logo container with `bg-[#D4A574]`
- Replace `shadow-blue-500/30` with `shadow-[#D4A574]/30`
- Update hover states: `hover:text-blue-600` becomes `hover:text-[#D4A574]`
- Update dark mode hover: `dark:hover:text-blue-400` becomes `dark:hover:text-[#D4A574]`
- Update "Get Started" button: `bg-blue-600` to `bg-[#D4A574]`, `hover:bg-blue-700` to `hover:bg-[#B89060]`
- Update button shadows: `shadow-blue-500/20` to `shadow-[#D4A574]/20`, `shadow-blue-500/40` to `shadow-[#D4A574]/40`
- Update mobile menu link: `text-blue-600` to `text-[#C85A6E]`
- Preserve: `backdrop-blur-md`, `transition-all`, `transform hover:-translate-y-0.5`

**Authentication Pages (Login & Register)**
- Update input focus rings: `focus:ring-blue-600` to `focus:ring-[#D4A574]`
- Update submit button: `bg-blue-600` to `bg-[#D4A574]`, `hover:bg-blue-500` to `hover:bg-[#B89060]`
- Update focus outline: `focus-visible:outline-blue-600` to `focus-visible:outline-[#D4A574]`
- Update button shadow: `shadow-blue-500/30` to `shadow-[#D4A574]/30`
- Update text links: `text-blue-600 hover:text-blue-500` to `text-[#C85A6E] hover:text-[#B54A5E]`
- Update role selection borders (register page): `hover:border-blue-500`, `peer-checked:border-blue-600`, `peer-checked:bg-blue-50` to golden equivalents
- Update checkbox color: `text-blue-600 focus:ring-blue-600` to `text-[#D4A574] focus:ring-[#D4A574]`
- Preserve: `shadow-xl`, `rounded-2xl`, `transition-all`

**Dashboard Components**
- Update license manager upload area background: `bg-blue-100 dark:bg-blue-900/30` to `bg-[#D4A574]/10 dark:bg-[#D4A574]/20`
- Update document info box: `bg-blue-50 dark:bg-blue-900/20` with `border-blue-100 dark:border-blue-800` to golden equivalents
- Update text colors in info boxes: `text-blue-800 dark:text-blue-300` and `text-blue-600` to golden shades
- Update route list hover border: `hover:border-blue-500` to `hover:border-[#D4A574]`
- Update driver profile badges: `bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300` to golden equivalents
- Update phone number links: `text-blue-600 hover:underline dark:text-blue-400` to pink accent `text-[#C85A6E]`
- Update chauffeur license badge background colors to use golden palette
- Preserve: `rounded-xl`, `shadow-sm`, `transition-all`, `hover:shadow-md`

**Parent Dashboard**
- Update driver match card hover: `hover:border-blue-500` to `hover:border-[#D4A574]`
- Update phone link colors: `text-blue-600 dark:text-blue-400` to `text-[#C85A6E] dark:text-[#C85A6E]`
- Update role badge colors for drivers from blue to golden palette
- Preserve: `hover:shadow-md`, `transition-all`, `cursor-pointer`

**Home Page (Landing)**
- Update hero badge: `bg-blue-50` with `text-blue-600` and `ring-blue-600/20` to golden equivalents
- Update gradient text: `from-blue-600 to-violet-600` to `from-[#D4A574] to-[#C85A6E]`
- Update primary CTA button: `bg-blue-600` to `bg-[#D4A574]`, `hover:bg-blue-700` to `hover:bg-[#B89060]`
- Update button shadows: `shadow-blue-500/20` and `shadow-blue-500/40` to golden equivalents
- Update feature card hover: `hover:border-blue-500/50` and `hover:shadow-blue-500/10` to golden equivalents
- Preserve: `shadow-xl`, `rounded-xl`, `transition-all`, `transform hover:-translate-y-1`, `rounded-2xl`

**UI Components**
- Update PlaceAutocomplete focus ring: `focus:ring-blue-600` to `focus:ring-[#D4A574]`
- Update notifications dropdown link: `text-blue-600 hover:text-blue-700` to pink accent colors
- Update chat interface sender message background: `bg-blue-600` to `bg-[#D4A574]`
- Update chat input focus ring: `focus:ring-blue-500` to `focus:ring-[#D4A574]`
- Update route editor stroke color: `'#2563eb'` (blue-600) to `'#D4A574'`
- Preserve: `backdrop-blur-md`, `backdrop-blur-[2px]`, `backdrop-blur-sm`, all rounded corners

**Admin Page**
- Update driver role badge: `bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300` to golden palette
- Update document view link: `text-blue-600 hover:underline` to `text-[#C85A6E] hover:underline`
- Preserve existing badge styles for parent role (green)

**Shadow Effect Preservation**
- All `shadow-lg`, `shadow-xl`, `shadow-2xl` classes must remain unchanged
- Replace only the color tint portion: `shadow-blue-500/30` becomes `shadow-[#D4A574]/30`
- Maintain opacity values (e.g., /10, /20, /30, /40) in shadow tints
- Keep all base shadow classes (shadow-sm, shadow-md, etc.) as-is

## Visual Design

**`docs/images/vananavan.jpg`**
- Dark charcoal/slate background (#3A3A3C approximate) used for top header section with logo
- Warm golden/tan color (#D4A574 approximate) used for logo icon and main text background
- Golden color is the dominant brand color for "ANANAVAN.COM" text and decorative elements
- Pink/red accent (#C85A6E approximate) used for the website URL "www.vananavan.com" creating visual hierarchy
- High contrast between dark and light sections ensures readability
- Logo features a stylized bird/wings icon in golden color on dark background
- Color scheme conveys warmth, trust, and premium service quality
- Pink accent provides call-to-action emphasis suitable for links and interactive elements

## Existing Code to Leverage

**Tailwind Color Utilities Pattern**
- Current codebase uses inline Tailwind classes like `bg-blue-600`, `text-blue-500`, `border-blue-400` throughout components
- These follow a consistent pattern of color name followed by intensity (50-950)
- Shadow tints use slash notation for opacity: `shadow-blue-500/30`
- Dark mode variants use `dark:` prefix: `dark:bg-blue-900/30`
- This pattern should be replicated for golden colors using bracket notation `bg-[#D4A574]` or after defining custom Tailwind colors

**Visual Effects Preservation Pattern**
- Components consistently use `backdrop-blur-md` on navbar for glassmorphism effect
- Modals use `backdrop-blur-[2px]` with `bg-black/60` for overlay
- All buttons and cards have multi-layer effects: background color + shadow + border + hover transforms
- Transform effects like `hover:-translate-y-0.5` and `hover:-translate-y-1` are widely used
- Transition classes `transition-all` and `transition-colors` smooth all interactions
- These should remain untouched during color replacement

**Component Shadow Pattern**
- Cards use `shadow-sm` or `shadow-xl` as base with optional color tint
- Buttons use `shadow-lg` with color tint that intensifies on hover
- Feature cards use `hover:shadow-2xl` with subtle color tint
- Pattern: `shadow-{size}` + optional `shadow-{color}/{opacity}` for tinted shadows
- When updating colors, only replace the color tint parameter, keep shadow size and structure

**Rounded Corner System**
- Small elements: `rounded-md`, `rounded-lg`
- Cards and containers: `rounded-xl`, `rounded-2xl`
- Buttons: `rounded-lg` for CTAs, `rounded-md` for utility buttons
- Full circles: `rounded-full` for avatars and badges
- This hierarchy should be maintained to preserve visual consistency

**Dark Mode Color Strategy**
- Light mode uses full color saturation: `bg-blue-600`, `bg-blue-50`
- Dark mode uses transparency layers: `dark:bg-blue-900/30`, `dark:bg-blue-900/20`
- Text colors invert intensity: light uses 600-800, dark uses 300-400
- Borders become more subtle: `border-blue-100` becomes `dark:border-blue-800`
- Apply same strategy to golden palette: lighter opacity in dark mode backgrounds, adjust text contrast

## Out of Scope
- Changing the slate/gray color scheme for neutral backgrounds and text (only blue replacements)
- Modifying the green color used for verification badges and success states
- Altering the red color used for error states, destructive actions, and expired badges
- Changing any layout, spacing, or positioning of elements
- Modifying shadow sizes or blur intensities (only color tints change)
- Updating animation timing or easing functions
- Changing border widths, radiuses, or styles (only colors)
- Modifying font sizes, weights, or families
- Altering the grid systems or responsive breakpoints
- Adding new components or features beyond color updates
