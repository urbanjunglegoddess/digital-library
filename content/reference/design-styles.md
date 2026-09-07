---
title: "Design Styles — Visual Languages"
slug: design-styles
group: "Design System"
order: 11
summary: "The visual languages you render components in. Same component, different aesthetic: pick per project, client, and era. This is library-wide reference, it applies to…"
---

## Design Styles
The visual languages you render components in. Same component, different aesthetic: pick per project, client, and era. This is library-wide reference, it applies to every component, not just buttons.

* * *
## How to choose
**Scales safely across a whole product (200+ screens):** Flat, Material, Swiss, Corporate, Scandinavian, and your UJG brand. These are "system" styles that work without fatigue.

**Use as accents, sparingly (seasoning, not the meal):** Glassmorphism, Neumorphism, Claymorphism, Aurora, Y2K, Duotone on photos. They carry accessibility or performance costs.

**High-personality / campaign moments (hero sections, landing pages):** Neo-Brutalism, Memphis, Cyberpunk, Aurora, Retro, Kinetic, Futurism/HUD. Exhausting across an app, perfect for a first impression.

**Layout-first styles (about structure, not surface):** Bento Grid, Editorial, Swiss. These define HOW content is arranged more than how it's decorated.

**Behavioral styles (can layer on top of any surface):** Kinetic/Motion-First, High Contrast/Accessible-First. These modify behavior, not appearance.

**Client-matching guide:**
*   Enterprise / B2B → Flat, Material, Swiss, Corporate
*   Consumer / playful → Claymorphism, Aurora, Organic, Bento Grid
*   Luxury / high-end → Art Deco, Swiss, Editorial, Scandinavian, Japanese/Wabi-Sabi
*   Tech / developer → Cyberpunk, Aurora, Minimal, Monochrome
*   Youth / culture → Y2K, Memphis, Neo-Brutalism, Hand-drawn
*   Wellness / eco → Organic, Scandinavian, Japanese/Wabi-Sabi
*   Retro / nostalgic → Skeuomorphism, Retro/Pixel, Y2K, Grunge
*   Content / media → Editorial, Swiss, Bento Grid
*   Children / education → Claymorphism, Paper Cut, Hand-drawn, Memphis
*   Art / culture institutions → Bauhaus, Swiss, Editorial, Kinetic
*   Music / entertainment → Cyberpunk, Grunge, Aurora, Neo-Brutalism
*   Craft / handmade → Hand-drawn, Organic, Paper Cut, Japanese
*   Sci-fi / gaming → Futurism/HUD, Cyberpunk, Retro/Pixel
*   Premium DTC → Scandinavian, Minimal, Bento Grid, Monochrome

* * *
## Combining styles (layering)
Most shipped products blend 2-3 styles. Rules:

1. **One base + one accent.** Example: Swiss base with Aurora hero. The base carries 80% of screens. The accent appears in 1-2 key moments.
2. **Never combine two "loud" styles.** Neo-Brutalism + Memphis + Cyberpunk = visual assault. Pick one loud, pair with one quiet.
3. **Dark mode is not a style, it's a surface.** Any style can run on dark. "Dark UI" is a modifier, not a standalone language.
4. **Behavioral layers stack.** Kinetic + any surface style works. High Contrast can overlay any style as a forced-colors fallback.
5. **Layout styles are independent of surface.** Bento Grid can use Glassmorphism cells, Flat cells, or Aurora cells. Editorial layout can carry Swiss surfaces or Art Deco surfaces.
6. **Components stay semantically identical across all styles.** Only CSS custom properties change. Structure (HTML), behavior (JS/ARIA), and spacing tokens stay fixed.
7. **Test the combination at its worst case.** If your base is Swiss and accent is Aurora, what happens when Aurora is disabled (prefers-reduced-motion)? Does the page still work? The base must carry the product alone.

**Common successful combos:**
*   Swiss base + Aurora hero + Glassmorphism nav overlay
*   Corporate base + Bento Grid feature page + Monochrome illustrations
*   Scandinavian base + Organic blob accents + Kinetic scroll reveals
*   UJG Brand base + Cyberpunk dark-mode variant + Editorial case studies
*   Flat base + Material motion + High Contrast accessibility mode

* * *
## Accessibility notes per style
*   **Glass / Neu:** Watch text contrast (often fails WCAG AA). Always keep a visible focus ring since the surface swallows it. Glass needs solid-color fallback.
*   **Aurora / Kinetic:** Animation must pause under prefers-reduced-motion. Text contrast must clear 4.5:1 at every gradient stop, not just the average.
*   **Brutalism:** Thick borders actually help focus visibility, but check clashing colors still hit contrast on text.
*   **Cyberpunk / Neon / HUD:** Glow effects on text reduce readability. Glow should be decorative (borders, not replacing text contrast). Thin neon type and HUD text at 12px is illegible for most users.
*   **Y2K / Memphis:** High saturation means some combos are unreadable. Always test text-on-pattern. Busy backgrounds kill readability.
*   **Neumorphism:** Nearly unusable for low-vision users. If you must, add subtle border on interactive elements.
*   **Grunge / Hand-drawn:** Texture overlays on text destroy legibility. Keep textures on backgrounds/decorative elements, never on text areas.
*   **Paper Cut / Isometric:** Depth layering can confuse screen readers about reading order. Ensure DOM order matches visual reading order.
*   **Kinetic / Motion-First:** Must provide COMPLETE static fallback. The site must be fully usable with zero animation. No content gated behind animation completion.
*   **Japanese / Wabi-Sabi:** Extreme whitespace works for sighted users but adds scrolling burden for motor-impaired users on mobile. Balance spacing with content density.
*   **High Contrast:** This style IS the accessibility standard. Use it as the forced-colors / high-contrast mode fallback for any other style.
*   **All styles:** The component's semantics, keyboard behavior, and 44px target never change. Style is skin; behavior is the skeleton.

* * *
## Performance budget by style

| Tier | Styles | GPU Cost | Notes |
| ---| ---| ---| --- |
| Zero-cost | Flat, Swiss, Corporate, High Contrast, Bauhaus, Pixel Art | None | Pure CSS, no filters, no animation |
| Light | Material, Claymorphism, Neumorphism, Neo-Brutalism, Scandinavian, Paper Cut, Monochrome, UJG Brand | Low | Simple shadows and transitions |
| Medium | Aurora, Cyberpunk, Organic, Y2K, Bento Grid, Grunge, Futurism/HUD, Hand-drawn | Moderate | Filters, blend modes, SVG animation |
| Heavy | Glassmorphism, Kinetic/Motion-First, Isometric (3D) | High | backdrop-filter, continuous animation, 3D transforms |

**Rule of thumb:** Budget for 16ms frames (60fps). If your chosen style's effects cause jank on a mid-range Android phone, dial back or provide a simpler fallback via @media (prefers-reduced-motion) or feature detection.

* * *
**Rule:** The style serves the content and the brand, never the reverse. When in doubt, default to UJG Brand and borrow one accent style for emphasis.

* * *
_Note: The full 31 style definitions (each with Philosophy, Origin, Key CSS signatures, Typography, Color theory, Motion, Common pitfalls, Token structure, When to use, Real-world examples, Pairs with, and Performance notes) live in the source reference page. The styles are: 1. Flat, 2. Material Design, 3. Glassmorphism, 4. Liquid Glass, 5. Neumorphism, 6. Skeuomorphism, 7. Neo-Brutalism, 8. Claymorphism, 9. Aurora/Gradient, 10. Minimal/Swiss, 11. UJG Brand, 12. Retro/Pixel Art, 13. Art Deco/Luxury, 14. Organic/Biomorphic, 15. Cyberpunk/Neon, 16. Memphis/Postmodern, 17. Isometric/3D Illustration, 18. Y2K/Vaporwave, 19. Editorial/Magazine, 20. Corporate/System UI, 21. High Contrast/Accessible-First, 22. Bauhaus, 23. Scandinavian/Nordic, 24. Japanese/Wabi-Sabi, 25. Grunge/Distressed, 26. Bento Grid, 27. Kinetic/Motion-First, 28. Monochrome/Duotone, 29. Paper Cut/Layered, 30. Hand-drawn/Illustrated, 31. Futurism/HUD._
