---
name: premium-human-web-design
description: "Create high-quality premium web UI with a human touch. Use when users ask for modern, intentional, non-generic frontend design, visual direction, and implementation-ready UX decisions."
argument-hint: "What page, product, or feature should be designed?"
---

# Premium Human Web Design

Create web interfaces that feel premium, intentional, and human-crafted rather than template-like.

## When to Use

- User asks for premium web design quality
- User wants "human touch" in UI/UX
- User requests modern frontend design but wants to avoid generic AI-looking layouts
- User needs a full visual direction plus implementation guidance

## Inputs to Collect

1. Brand personality in 3-5 words (example: warm, precise, bold)
2. Primary audience and user intent
3. Page goal (sell, educate, convert, onboard, etc.)
4. Existing constraints: framework, design system, assets, deadlines
5. Device priorities (mobile-first, desktop-first, balanced)

If any input is missing, proceed with sensible defaults and state assumptions clearly.

Default when context is limited: use Editorial premium art direction.

## Workflow

### 1. Define Creative Direction

1. Translate brand personality into a visual thesis (one sentence).
2. Choose one art direction:
   - Editorial premium: strong typography, asymmetric rhythm, bold white space
   - Refined minimal: restrained palette, high polish, precise spacing
   - Warm crafted: textured layers, organic accents, human tone
3. Lock a direction and avoid mixing conflicting styles.

Decision point:

- If the product already has a design system, preserve it and add premium refinements only.
- If no system exists, define a compact visual system before layout work.

### 2. Build Visual System Foundations

1. Typography:
   - Use expressive type pairing (headline + body) that fits brand character.
   - Define clear type scale for hero, sections, body, and metadata.
2. Color:
   - Define semantic tokens: background, surface, text, accent, border, success, warning.
   - Create contrast-safe combinations for accessibility.
3. Spacing and geometry:
   - Define spacing scale and consistent corner radius strategy.
   - Use rhythm-based vertical spacing rather than arbitrary gaps.
4. Components:
   - Set visual rules for buttons, cards, forms, navigation, and states.

Decision point:

- If visual hierarchy feels weak, increase contrast in size, weight, spacing, or color role before adding more decoration.

### 3. Compose Layout With Narrative Flow

1. Build page as a story arc:
   - Entry: clear first impression and value
   - Trust: proof, credibility, or detail depth
   - Action: specific call to action and low-friction next step
2. Use deliberate asymmetry only when it improves focus.
3. Keep one dominant focal point per viewport.
4. Treat whitespace as active structure, not empty leftovers.

Decision point:

- If scanning is hard in 3 seconds, simplify section count and tighten hierarchy.

### 4. Add Human Touch Details

1. Microcopy:
   - Replace generic labels with contextual, human language.
2. Surfaces:
   - Add subtle depth via gradients, soft shadows, or texture hints.
3. Imperfection with control:
   - Introduce tiny irregularities (offset accents, custom icon moments, nuanced spacing) while preserving consistency.
4. Interaction states:
   - Design hover, focus, active, and loading states with personality.

Decision point:

- If details feel decorative but not meaningful, remove them and reinforce utility.

### 5. Motion and Feedback

1. Add only meaningful animations:
   - page reveal
   - staggered content entrance
   - state transitions for interactive elements
2. Keep timings intentional and calm.
3. Respect reduced-motion preferences.

Decision point:

- If motion distracts from tasks, reduce amplitude and duration.

### 6. Responsive and Accessibility Pass

1. Validate desktop, tablet, and mobile behavior.
2. Ensure tap targets, text size, and spacing are mobile-safe.
3. Verify color contrast and keyboard focus visibility.
4. Check layout integrity with long content and edge cases.

### 7. Quality Gates (Completion Checklist)

Mark complete only when all are true:

- Visual direction is clear and coherent across all sections
- Interface does not look like a default template
- Typography hierarchy is obvious at first glance
- Color system is intentional and accessible
- Components are consistent across states
- Motion supports comprehension, not decoration
- Mobile and desktop both feel designed, not compressed
- CTA path is explicit and low friction
- Final design reflects brand voice with a human tone

## Compact Execution Checklist

1. Pick one premium art direction (default: Editorial premium).
2. Define type pair, type scale, and color tokens.
3. Build narrative layout: entry, trust, action.
4. Add human-touch details: microcopy, depth, meaningful states.
5. Add restrained motion that improves comprehension.
6. Validate responsive behavior and accessibility.
7. Pass all quality gates before final delivery.

## Output Format

Provide:

1. Visual direction summary
2. Token-level style guidance (type, color, spacing, radius, elevation)
3. Section-by-section layout rationale
4. Interaction and motion notes
5. Accessibility checks performed
6. Final quality-gate status

## Prompt Starters

- Design a premium homepage for a laptop store with a warm, trustworthy human tone.
- Redesign this product detail page to feel high-end and editorial while keeping conversion strong.
- Create a mobile-first checkout flow that feels premium but simple and reassuring.
- Upgrade this existing UI so it feels crafted by a human designer, not template-generated.
