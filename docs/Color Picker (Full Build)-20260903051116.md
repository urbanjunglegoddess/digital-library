# Color Picker (Full Build)

# The Color Picker: A Senior Engineer's Complete Breakdown
The component for selecting colors with precision through gradient areas, sliders, and text inputs. Here's everything from first principles to production code.

**Try it live:** the interactive playground (built in a later pass) will let you configure picker type, opacity support, preset swatches, and output format, then output code for every target.

**Audit a color picker:** the companion audit checks slider ARIA, 2D area keyboard navigation, text input fallback, and output format validation, then exports a client-ready report.

This doc follows the ⭐ COMPONENT ASSET TEMPLATE (follow this) ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).
* * *

## 1\. What a Color Picker Actually Is
A **color picker** is an interactive component that lets users select a color value through a combination of a 2D gradient area (saturation/brightness), sliders (hue, opacity), text inputs (hex, RGB, HSL), and preset swatches. It outputs a color value for use in styling, theming, or content.

**Color Picker (this doc):** full interactive picker with gradient area + sliders + inputs.
**`<input type="color">`****\*\*\*\*\*\*\*\*:** the native HTML color input. Triggers the OS color picker. Functional but uncontrollable, no opacity, can't style it.
**Swatch:** a single color indicator. Not a picker, just a display.
**Palette generator:** a tool that creates color harmonies from a seed. Related but different.
* * *

## 2\. Why It Matters
**Design tools need it.** Any app where users customize colors (themes, branding, charts, annotations, text highlighting) needs a color picker. It's foundational for creative tools.
**The 2D area is the hardest accessibility challenge in UI.** A gradient area with two axes (X = saturation, Y = brightness) navigated by dragging or arrow keys is one of the most complex interactive patterns to make accessible.
**Precision and imprecision both matter.** Designers need hex precision ("#5F2C82 exactly"); casual users need to drag and feel ("that purplish blue"). The picker must serve both.
* * *

## 3\. Anatomy
**Trigger/Swatch button:** a compact color swatch that opens the full picker. Shows the current selected color.
**Panel:** the expanded picker interface (rendered in a popover or inline).
**Saturation/Brightness area (2D):** the main gradient field. X = saturation (gray to fully saturated), Y = brightness (black to full brightness). A draggable thumb selects the position.
**Hue slider:** a rainbow gradient bar (0-360°). Selecting a hue changes the color of the 2D area.
**Opacity/Alpha slider (optional):** 0-100% transparency. Shown as a gradient from the current color to transparent (checkered background visible through).
**Text inputs:** hex (#5F2C82), RGB (95, 44, 130), or HSL (277, 49%, 34%) fields for precise entry. Often with a format toggle.
**Preset swatches:** a grid of predefined colors (brand palette, material colors, recent picks).
**Recent colors (optional):** last N colors the user selected. Stored in localStorage.
**Eyedropper button (optional):** activates the EyeDropper API to pick a color from anywhere on the screen.
**Preview:** shows the selected color vs. the previous color (before/after comparison).
**Format toggle:** switch between hex, RGB, HSL display/input.
* * *

## 4\. Sizes / Scale

| Element | Dimensions | Notes |
| ---| ---| --- |
| Trigger swatch | 24-36px | Small clickable color circle/square |
| Panel width | 240-300px | Compact enough for a popover |
| 2D gradient area | 200-260px W, 150-200px H | The main interaction area |
| Hue slider | Full panel width, 12-16px H | Rainbow gradient |
| Opacity slider | Full panel width, 12-16px H | Color-to-transparent gradient |
| Thumb (2D) | 12-16px circle | On the gradient area |
| Thumb (slider) | 16-20px circle | On the hue/opacity sliders |
| Swatch grid | 6-8 columns, 24px per swatch | Preset colors |
| Text input | ~60px W each (R, G, B fields) | Precise entry |

* * *

## 5\. States
**Closed:** only the trigger swatch is visible. Shows current color.
**Open:** panel visible (popover or inline). Full picker UI available.
**2D area dragging:** user is dragging the saturation/brightness thumb. Color updates in real-time.
**Hue slider dragging:** user is adjusting the hue. The 2D area updates its base color.
**Opacity slider dragging:** user is adjusting transparency.
**Text input focused:** user is typing a hex/RGB/HSL value directly.
**Invalid input:** user typed an invalid hex/RGB value. Show error state on the input.
**Eyedropper active:** the EyeDropper API is engaged; cursor has become a color picker on the screen.
**Swatch selected:** user clicked a preset swatch. All controls update to that color.
* * *

## 6\. Types / Variants
**Full picker (default):** 2D area + hue slider + opacity slider + inputs + swatches. Maximum control.
**Compact/Swatch-only:** just a grid of preset swatches. No gradient, no inputs. For simple color selection from a fixed set.
**Inline (always visible):** no trigger, the picker panel is always shown. For dedicated color settings panels.
**Without opacity:** no alpha slider. Output is always fully opaque. Simpler.
**Minimal:** hue slider + a few preset options. No 2D area. For quick, approximate color selection.
**With format toggle:** user can switch between hex, RGB, HSL, OKLCH input/output.
* * *

## 7\. When to Use (and When Not To)
**Use a color picker when:**
*   Users need to select an arbitrary color (theming, design, highlighting)
*   Precision matters (exact brand colors, design consistency)
*   A small set of presets isn't sufficient

**Use something else when:**
*   Only 5-10 predefined colors are valid → color swatch grid (no picker needed)
*   The color is set by the system/brand (users shouldn't change it) → don't offer a picker
*   Mobile-primary and the native picker is acceptable → `<input type="color">` triggers the OS picker
* * *

## 8\. Across Design Systems
**react-colorful:** lightweight (~2KB), accessible, no dependencies. The modern React standard for custom color pickers.
**@radix-ui:** no built-in color picker. Teams compose from slider + custom canvas.
**Ant Design:** `<ColorPicker>` with panel, presets, format toggle, and trigger.
**Chakra:** no built-in. Community recipes.
**Sketch/Figma pickers:** the UX benchmark. 2D saturation-brightness area + hue bar + opacity + hex input.
**Native** **`<input type="color">`****\*\*\*\*\*\*\*\*:** triggers OS picker. No control over UI, no opacity.
**EyeDropper API (Chrome 95+):** `new EyeDropper().open()` returns a color from anywhere on screen.
* * *

## 9\. The Code
### 9.1 HTML (structure)

```html
<div class="color-picker">
  <!-- Trigger -->
  <button type="button" class="cp-trigger" aria-label="Choose color: #5F2C82"
          aria-haspopup="true" aria-expanded="false">
    <span class="cp-swatch" style="background: #5F2C82"></span>
  </button>

  <!-- Panel (popover) -->
  <div class="cp-panel" role="dialog" aria-label="Color picker" hidden>
    <!-- 2D Saturation-Brightness area -->
    <div class="cp-area" role="slider" tabindex="0"
         aria-label="Saturation and brightness"
         aria-valuetext="Saturation 60%, Brightness 80%">
      <div class="cp-area__gradient"></div>
      <div class="cp-area__thumb" style="left: 60%; top: 20%"></div>
    </div>

    <!-- Hue slider -->
    <div class="cp-hue" role="slider" tabindex="0"
         aria-label="Hue" aria-valuemin="0" aria-valuemax="360" aria-valuenow="277"
         aria-valuetext="277 degrees, purple">
      <div class="cp-hue__thumb" style="left: 77%"></div>
    </div>

    <!-- Opacity slider -->
    <div class="cp-opacity" role="slider" tabindex="0"
         aria-label="Opacity" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"
         aria-valuetext="100%">
      <div class="cp-opacity__thumb" style="left: 100%"></div>
    </div>

    <!-- Text inputs -->
    <div class="cp-inputs">
      <label>
        <span>Hex</span>
        <input type="text" value="#5F2C82" maxlength="7" aria-label="Hex color value" />
      </label>
    </div>

    <!-- Eyedropper -->
    <button type="button" class="cp-eyedropper" aria-label="Pick color from screen">
      <svg aria-hidden="true"><!-- eyedropper icon --></svg>
    </button>

    <!-- Presets -->
    <div class="cp-presets" role="listbox" aria-label="Preset colors">
      <button role="option" aria-label="Night, #0A0A0A" style="background:#0A0A0A"></button>
      <button role="option" aria-label="Eminence, #5F2C82" style="background:#5F2C82" aria-selected="true"></button>
      <button role="option" aria-label="Goldenrod, #DCA424" style="background:#DCA424"></button>
      <!-- more swatches -->
    </div>
  </div>
</div>
```

### 9.2 React (react-colorful + custom)

```typescript
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { useState, useCallback } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
  showEyedropper?: boolean;
}

export function ColorPicker({ value, onChange, presets = [], showEyedropper = true }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  const pickFromScreen = useCallback(async () => {
    if (!('EyeDropper' in window)) return;
    try {
      const dropper = new (window as any).EyeDropper();
      const result = await dropper.open();
      onChange(result.sRGBHex);
    } catch { /* user cancelled */ }
  }, [onChange]);

  return (
    <div className="color-picker" style={{ position: 'relative' }}>
      <button className="cp-trigger" onClick={() => setOpen(!open)}
              aria-label={`Choose color: ${value}`} aria-haspopup="true" aria-expanded={open}>
        <span className="cp-swatch" style={{ background: value }} />
      </button>

      {open && (
        <div className="cp-panel" role="dialog" aria-label="Color picker">
          <HexColorPicker color={value} onChange={onChange} />

          <div className="cp-inputs">
            <HexColorInput color={value} onChange={onChange} prefixed alpha
                          aria-label="Hex color value" className="cp-hex-input" />
          </div>

          {showEyedropper && 'EyeDropper' in window && (
            <button className="cp-eyedropper" onClick={pickFromScreen}
                    aria-label="Pick color from screen">
              <EyeDropperIcon />
            </button>
          )}

          {presets.length > 0 && (
            <div className="cp-presets" role="listbox" aria-label="Preset colors">
              {presets.map(color => (
                <button key={color} role="option" aria-label={color}
                        aria-selected={color === value}
                        style={{ background: color }}
                        onClick={() => onChange(color)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 9.3 2D Area keyboard navigation (the hard part)

```javascript
// Arrow keys on the 2D saturation-brightness area
area.addEventListener('keydown', (e) => {
  const step = e.shiftKey ? 10 : 1; // percentage
  let { saturation, brightness } = currentColor;

  switch (e.key) {
    case 'ArrowRight': saturation = Math.min(100, saturation + step); break;
    case 'ArrowLeft': saturation = Math.max(0, saturation - step); break;
    case 'ArrowUp': brightness = Math.min(100, brightness + step); break;
    case 'ArrowDown': brightness = Math.max(0, brightness - step); break;
    default: return;
  }
  e.preventDefault();
  updateColor({ ...currentColor, saturation, brightness });
  area.setAttribute('aria-valuetext', `Saturation ${saturation}%, Brightness ${brightness}%`);
});
```

### 9.4 SwiftUI (native ColorPicker)

```swift
import SwiftUI

struct ColorPickerField: View {
    @Binding var color: Color
    var label: String = "Color"
    var presets: [Color] = []

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Native iOS/macOS color picker
            ColorPicker(label, selection: $color, supportsOpacity: true)
                .accessibilityLabel("Choose \(label)")

            // Preset swatches
            if !presets.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(Array(presets.enumerated()), id: \.offset) { _, preset in
                            Button(action: { color = preset }) {
                                Circle()
                                    .fill(preset)
                                    .frame(width: 32, height: 32)
                                    .overlay(Circle().stroke(color == preset ? Color.white : Color.clear, lineWidth: 2))
                            }
                            .accessibilityLabel("Select color")
                        }
                    }
                }
            }
        }
    }
}

// Usage:
// @State private var brandColor = Color.purple
// ColorPickerField(color: $brandColor, label: "Brand color", presets: [.purple, .orange, .green])

// Native ColorPicker provides:
// - Full spectrum picker with sliders
// - Hex/RGB/HSB input
// - Opacity
// - Eyedropper (macOS)
// - Full VoiceOver accessibility
```

### 9.5 Jetpack Compose

```kotlin
// Android doesn't have a native color picker in Material 3.
// Use a custom implementation or a library.

@Composable
fun ColorPickerField(
    color: Color,
    onColorChange: (Color) -> Unit,
    presets: List<Color> = emptyList()
) {
    var showPicker by remember { mutableStateOf(false) }
    val hexValue = remember(color) { String.format("#%06X", (0xFFFFFF and color.toArgb())) }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        // Trigger swatch
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Box(
                modifier = Modifier.size(36.dp).clip(CircleShape).background(color).border(1.dp, MaterialTheme.colorScheme.outline, CircleShape)
                    .clickable { showPicker = true }
                    .semantics { contentDescription = "Choose color: $hexValue" }
            )
            OutlinedTextField(
                value = hexValue,
                onValueChange = { hex ->
                    if (hex.matches(Regex("#[0-9A-Fa-f]{6}"))) {
                        onColorChange(Color(android.graphics.Color.parseColor(hex)))
                    }
                },
                label = { Text("Hex") },
                modifier = Modifier.width(120.dp),
                singleLine = true
            )
        }

        // Preset swatches
        if (presets.isNotEmpty()) {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(presets.size) { i ->
                    Box(
                        modifier = Modifier.size(32.dp).clip(CircleShape).background(presets[i])
                            .border(2.dp, if (presets[i] == color) Color.White else Color.Transparent, CircleShape)
                            .clickable { onColorChange(presets[i]) }
                            .semantics { contentDescription = "Select preset color ${i + 1}" }
                    )
                }
            }
        }

        // Full picker dialog (simplified — use a library like compose-color-picker for production)
        if (showPicker) {
            AlertDialog(
                onDismissRequest = { showPicker = false },
                title = { Text("Choose Color") },
                text = {
                    // Hue slider
                    var hue by remember { mutableFloatStateOf(0f) }
                    Slider(value = hue, onValueChange = { hue = it; onColorChange(Color.hsv(it * 360, 1f, 1f)) },
                           modifier = Modifier.semantics { contentDescription = "Hue: ${(hue * 360).toInt()} degrees" })
                },
                confirmButton = { TextButton(onClick = { showPicker = false }) { Text("Done") } }
            )
        }
    }
}
```

### 9.6 Flutter

```dart
import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';

class ColorPickerField extends StatefulWidget {
  final Color color;
  final ValueChanged<Color> onColorChanged;
  final List<Color> presets;
  const ColorPickerField({super.key, required this.color, required this.onColorChanged, this.presets = const []});
  @override State<ColorPickerField> createState() => _ColorPickerFieldState();
}

class _ColorPickerFieldState extends State<ColorPickerField> {
  void _openPicker() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Pick a color'),
        content: SingleChildScrollView(
          child: ColorPicker(
            pickerColor: widget.color,
            onColorChanged: widget.onColorChanged,
            enableAlpha: true,
            hexInputBar: true,
            labelTypes: const [ColorLabelType.hex, ColorLabelType.rgb],
          ),
        ),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Done'))],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Trigger
      Row(children: [
        GestureDetector(
          onTap: _openPicker,
          child: Semantics(
            label: 'Choose color: #${widget.color.value.toRadixString(16).substring(2)}',
            child: Container(width: 36, height: 36,
              decoration: BoxDecoration(color: widget.color, shape: BoxShape.circle, border: Border.all(color: Colors.grey))),
          ),
        ),
        const SizedBox(width: 12),
        Text('#${widget.color.value.toRadixString(16).substring(2).toUpperCase()}',
             style: const TextStyle(fontFamily: 'monospace', fontSize: 13)),
      ]),
      // Presets
      if (widget.presets.isNotEmpty) ...[
        const SizedBox(height: 12),
        Wrap(spacing: 8, children: widget.presets.map((c) => GestureDetector(
          onTap: () => widget.onColorChanged(c),
          child: Semantics(label: 'Select preset color',
            child: Container(width: 32, height: 32,
              decoration: BoxDecoration(color: c, shape: BoxShape.circle,
                border: Border.all(color: c == widget.color ? Colors.white : Colors.transparent, width: 2)))),
        )).toList()),
      ],
    ]);
  }
}

// Usage:
// ColorPickerField(color: _color, onColorChanged: (c) => setState(() => _color = c),
//   presets: [Color(0xFF5F2C82), Color(0xFFDCA424), Color(0xFFE86100)])
```

### 9.7 Testing

```typescript
describe("ColorPicker", () => {
  it("trigger shows current color and opens panel", async () => {
    render(<ColorPicker value="#5F2C82" onChange={() => {}} />);
    const trigger = screen.getByRole('button', { name: /choose color/i });
    await userEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: /color picker/i })).toBeInTheDocument();
  });

  it("hex input updates color", async () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#5F2C82" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /choose color/i }));
    const input = screen.getByLabelText(/hex/i);
    await userEvent.clear(input);
    await userEvent.type(input, '#DCA424');
    expect(onChange).toHaveBeenCalledWith('#DCA424');
  });

  it("preset swatch fires onChange", async () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#000" onChange={onChange} presets={['#FF0000', '#00FF00']} />);
    await userEvent.click(screen.getByRole('button', { name: /choose color/i }));
    await userEvent.click(screen.getByRole('option', { name: /#FF0000/i }));
    expect(onChange).toHaveBeenCalledWith('#FF0000');
  });
});
```

* * *

## 10\. Accessibility
### The 2D gradient area challenge
The saturation/brightness area has TWO axes controlled simultaneously. This is rare in UI and has no perfect ARIA pattern. Options:

**Option A:** **`role="slider"`** **with** **`aria-valuetext`** describing both axes: "Saturation 60%, Brightness 80%." Arrow keys adjust one axis at a time (Left/Right = saturation, Up/Down = brightness). Not standard slider behavior but functional.

**Option B:** **`role="application"`** and custom keyboard handling. AT passes all keys through. You document the interaction ("Use arrow keys to adjust color").

**Option C: Rely on the hex/RGB text inputs as the accessible path.** The 2D area is a convenience for sighted users; keyboard/AT users can type exact values. This is the react-colorful approach.

In practice: **text inputs are the accessible primary path.** The 2D area and sliders are enhancements. Every color the sliders can produce, the text inputs can too.
### Hue and opacity sliders
Standard `role="slider"` with `aria-valuemin/max/now/text`. Arrow keys ± 1 (or ± 10 with Shift). Hue range: 0-360. Opacity: 0-100.

`aria-valuetext` should be descriptive: "277 degrees, purple" (not just "277"). For opacity: "75%" or "75% opaque."
### Preset swatches
`role="listbox"` with `role="option"` on each swatch. `aria-label` on each swatch with the color name or hex value. `aria-selected` on the currently-matching swatch.
### Trigger button
`aria-label="Choose color: #5F2C82"` (includes the current value). Updates dynamically when color changes.
### Panel
`role="dialog"` with `aria-label="Color picker"`. Escape closes. Focus management: moves into panel on open, returns to trigger on close.
### Announcing changes
Announce the selected color to assistive technology via an `aria-live="polite"` region (e.g. "Selected: Eminence, #5F2C82") so non-visual users get spoken feedback as the value updates, not just a silent visual change.
### Colorblind users
Never convey the chosen color by hue alone. Always show the value numerically (hex/RGB/HSL) — and, where possible, the nearest named color — so colorblind users can select and confirm precisely from the values, not just the visual.
* * *

## 11\. Innovative / Emerging Ideas
*   **OKLCH-native pickers:** pick in perceptually uniform color space (lightness/chroma/hue) instead of HSL/HSV. Colors that "look" evenly distributed.
*   **AI color suggestions:** "Give me a color that complements #5F2C82" with AI-generated harmony suggestions.
*   **Palette generation from image:** upload an image, extract dominant colors as swatches.
*   **Color contrast checker built in:** real-time WCAG contrast ratio display as you pick.
*   **Color name display:** show the nearest named color ("Eminence", "Goldenrod") as you pick.
*   **Gradient picker:** extend to pick a gradient (two+ color stops) rather than a single color.
* * *

## 12\. Conversion / UX Killers
*   **No text input fallback:** the only way to pick is drag. Keyboard users are locked out.
*   **No copy/paste of hex values:** users can't paste "#5F2C82" from their brand guide.
*   **Tiny interaction areas:** the 2D thumb or slider track is too small to hit accurately.
*   **No preset swatches for common brand colors:** users must manually enter values they use repeatedly.
*   **Closing the picker loses the selection:** user picks a color, panel closes, and the previous color remains. Selection should persist.
*   **No opacity control when needed:** the design requires alpha, but the picker doesn't support it.
* * *

## 13\. Advanced Patterns
### Color format conversion

```typescript
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map(v => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
```

### EyeDropper API

```typescript
async function pickFromScreen(): Promise<string | null> {
  if (!('EyeDropper' in window)) return null;
  try {
    const dropper = new (window as any).EyeDropper();
    const { sRGBHex } = await dropper.open();
    return sRGBHex;
  } catch {
    return null; // user pressed Escape
  }
}
```

### Recent colors in localStorage

```typescript
function useRecentColors(max = 8) {
  const [recent, setRecent] = useState<string[]>(() => {
    const stored = localStorage.getItem('recent-colors');
    return stored ? JSON.parse(stored) : [];
  });

  const addRecent = (color: string) => {
    const next = [color, ...recent.filter(c => c !== color)].slice(0, max);
    setRecent(next);
    localStorage.setItem('recent-colors', JSON.stringify(next));
  };

  return { recent, addRecent };
}
```

* * *

## 14\. Performance & Bundle Cost
*   **react-colorful: ~2KB gzipped.** Extremely lightweight. The recommended default.
*   **Canvas-based pickers** (rendering the gradient) are cheap. The 2D area is a single `<canvas>` draw or CSS gradients.
*   **Color math is cheap.** HSL→RGB→Hex conversions are simple math, no library needed.
*   **Panel lazy-mount.** Don't render the picker panel until it opens.
*   **EyeDropper is free** (browser-native, no bundle cost).
* * *

## 15\. Security
*   **Validate color values server-side.** A submitted "color" could be any string. Validate it's a legal CSS color before storing/using.
*   **XSS via color values.** Never inject a user-provided color string directly into HTML without validation. `style="color: ${userInput}"` where userInput is `expression(alert(1))` was historically an XSS vector (IE only, but validate anyway).
*   **The EyeDropper API requires secure context (HTTPS)** and a user gesture. It can't be activated automatically.
* * *

## 16\. Senior-Level Checklist
- [ ] Text input (hex/RGB) as accessible primary path (not just 2D drag)
- [ ] Hue slider: `role="slider"` with `aria-valuemin/max/now/text`
- [ ] Opacity slider: same ARIA treatment
- [ ] 2D area: keyboard navigable (arrows adjust S/B) with `aria-valuetext`
- [ ] Panel: `role="dialog"`, close on Escape, focus management
- [ ] Trigger: `aria-label` includes current color value
- [ ] Preset swatches: `role="listbox"` with `role="option"` + labels
- [ ] Selected color announced to AT via `aria-live`
- [ ] Colorblind-friendly: values shown numerically, not conveyed by hue alone
- [ ] EyeDropper used when available
- [ ] Color format conversion (hex ↔ RGB ↔ HSL) accurate
- [ ] Invalid hex input shows error, doesn't crash
- [ ] Recent colors persisted (localStorage)
- [ ] Positioned with collision detection (popover pattern)
- [ ] Server validates color values
- [ ] Works without JavaScript degradation (native `<input type="color">` fallback)
* * *

## 17\. Visual Styles
The color picker's chrome (panel, sliders, buttons) is styled per the eleven aesthetics. The gradient area itself is always a gradient (can't be themed, it IS the content).

**Flat:** solid panel border, clean slider tracks, minimal controls.
**Material:** elevated panel with M3 surface color. Slider thumbs follow M3 spec.
**Glassmorphism:** frosted panel. Slider tracks are translucent.
**Liquid Glass:** refractive panel border. Slider thumbs have specular highlights.
**Neumorphism:** panel flush with surface. Slider tracks are grooves.
**Skeuomorphism:** panel looks like a physical paint palette. Slider is a metallic rail.
**Neo-Brutalism:** thick panel border, hard shadow. Bold swatch grid.
**Claymorphism:** puffy panel, rounded sliders, soft glow.
**Aurora/Gradient:** panel border is gradient. Slider track highlights are gradient.
**Minimal/Swiss:** hairline panel border, minimal controls, maximum whitespace.
**UJG Brand:** Night panel, Eminence border, Goldenrod slider thumbs and active states.

Full style definitions on the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).