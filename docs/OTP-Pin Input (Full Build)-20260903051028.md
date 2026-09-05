# OTP/Pin Input (Full Build)

# The OTP/Pin Input: A Senior Engineer's Complete Breakdown
The verification code entry with separate digit boxes. Here's everything from first principles to production code.

**Try it live:** the interactive playground (built in a later pass) will let you toggle digit count, masked/visible, auto-submit, and error states, then output code for every target.

**Audit an OTP input:** the companion audit checks autocomplete support, keyboard behavior, paste handling, and screen-reader announcement, then exports a client-ready report.

This doc follows the ⭐ COMPONENT ASSET TEMPLATE (follow this) ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).
* * *

## 1\. What an OTP Input Actually Is
An **OTP input** (pin input, verification code input, one-time password field) is a series of 4-6 individual character fields that auto-advance as digits are entered. Used for verification codes (SMS, email, authenticator apps), PINs, and security codes.

The distinctions:

**OTP Input (this doc):** 4-6 separate visual boxes, one character each, auto-advance on entry. The separate-box pattern.
**Single text input with maxlength:** one `<input maxlength="6">` where the user types the full code. Simpler, arguably more accessible, but less guided visually.
**Password field:** a masked single input. Different purpose entirely.

The separate-box pattern exists for UX reasons: it gives visual structure to a code, reduces perceived entry effort ("just 6 taps"), provides per-digit feedback, and matches the mental model of a code as individual characters.
* * *

## 2\. Why It Matters
**Verification is conversion-critical.** 2FA flows, email verification, phone verification, password reset. If the user can't smoothly enter their code, they're locked out. Every friction point here is a lost user.

**The implementation is deceptively complex.** Auto-advance between fields, backspace across fields, paste filling all boxes, SMS autofill, autocomplete attributes, screen-reader announcements. Getting all of these right simultaneously is the challenge.

**Security surface.** OTP codes are authentication credentials. The input's autocomplete behavior, clipboard handling, and timing all have security implications.
* * *

## 3\. Anatomy
**Input cells:** 4-6 individual boxes, each holding one character. Visually separated with a gap.

**Focus indicator:** a highlighted border or background on the currently-active cell. Shows where the next character will go.

**Cursor/Caret:** visible blinking cursor in the active cell.

**Separator (optional):** a dash, dot, or space between groups of cells (e.g., 3-3 pattern: `123 - 456`).

**Label:** "Enter verification code" or "Enter your PIN" above the cells. Required for accessibility.

**Helper text:** "We sent a 6-digit code to your email" below. Context about where the code came from.

**Error state:** red borders + "Invalid code" or "Code expired" message below.

**Resend action:** "Didn't receive it? Resend" link with a cooldown timer.

**Timer (optional):** countdown showing how long the code is valid ("Expires in 4:32").
* * *

## 4\. Sizes / Scale

| Token | Cell Size | Gap | Font | Use |
| ---| ---| ---| ---| --- |
| S | 40×40px | 8px | 18px | Compact, inline verification |
| M | 48×48px | 10px | 22px | Default |
| L | 56×56px | 12px | 26px | Prominent, mobile-primary |

Cell aspect ratio: square (1:1) is standard. Some designs use wider rectangles (56×48px) for better horizontal rhythm.

Total width: (cell size + gap) × N cells. A 6-digit M-size input is ~(48+10)×6 = 348px. Fits comfortably on mobile.
* * *

## 5\. States
**Empty:** all cells blank, first cell focused. Waiting for input.

**Filling:** one or more cells have values. Focus is on the next empty cell. Previously filled cells show their digit (or a dot if masked).

**Complete:** all cells filled. May auto-submit, or show a "Verify" button.

**Error:** code was invalid. All cells get red borders. Error message appears. Cells may clear (so the user retypes) or stay filled (so the user can check their entry).

**Disabled:** the input is non-interactive (waiting for server response after submit, or the user hasn't yet triggered the send).

**Loading/Verifying:** after the code is submitted, showing a loading state while the server validates.

**Expired:** the code's validity period has passed. Show "Code expired" + resend option.

**Success:** code verified. Brief success state (green border, checkmark) before navigation.
* * *

## 6\. Types / Variants
**Numeric (default):** only accepts digits 0-9. `inputmode="numeric"`. The vast majority of OTP codes.

**Alphanumeric:** accepts letters and digits (some authenticator codes). `inputmode="text"`.

**Masked (PIN):** shows dots instead of the actual digits. For PINs where the value should be hidden.

**4-digit:** PIN, short verification codes.

**6-digit:** the most common OTP length (Google Authenticator, SMS codes).

**8-digit:** some backup codes.

**Grouped (3+3):** a visual separator between groups. "123 - 456". Aids readability.

**Auto-submit:** verifies immediately when the last digit is entered (no submit button needed).

**With resend:** includes a "Resend code" link with a cooldown timer.
* * *

## 7\. When to Use (and When Not To)
**Use an OTP input when:**
*   The user is entering a fixed-length numeric/alphanumeric code
*   The code was sent via SMS, email, or authenticator
*   Visual structure helps accuracy (each digit in its own box)
*   You want the guided auto-advance experience

**Use a single text input instead when:**
*   The code format varies (some have dashes, some don't)
*   You need simpler accessibility (a single input is inherently more accessible)
*   The code is long (> 8 characters) — too many boxes gets unwieldy
*   You're concerned about edge cases (the single-input approach has fewer bugs)
* * *

## 8\. Across Design Systems
**No major design system ships a full OTP input.** It's always a composed pattern.

**input-otp (guilhermerodz):** the React standard. Headless, handles all keyboard edge cases, paste, SMS autofill. Used by shadcn.

**shadcn:** `<InputOTP>` built on `input-otp`. Styled cells with the pattern-matching handled by the library.

**Chakra:** `<PinInput>` with `<PinInputField>` per cell. Handles auto-advance and paste.

**MUI:** `<OtpInput>` in MUI X (newer). Community solutions before that.

**React Native:** various libraries (react-native-otp-inputs, @twotalltotems/react-native-otp-input).

**Apple:** native OTP autofill via `textContentType: .oneTimeCode` (iOS 12+). The system reads SMS codes and offers to autofill.
* * *

## 9\. The Code
### 9.1 Approach A: Hidden single input + visual cells (recommended)
The most accessible and SMS-autofill-friendly approach. One real `<input>` handles all semantics, paste, and autofill. Visual cells are presentation only.

```html
<div class="otp-input" aria-label="Verification code">
  <label for="otp" class="otp-label">Enter your 6-digit code</label>
  <div class="otp-cells" aria-hidden="true">
    <div class="otp-cell otp-cell--active">4</div>
    <div class="otp-cell">2</div>
    <div class="otp-cell"></div>
    <div class="otp-cell"></div>
    <div class="otp-cell"></div>
    <div class="otp-cell"></div>
  </div>
  <input id="otp" type="text" inputmode="numeric" autocomplete="one-time-code"
         maxlength="6" pattern="[0-9]{6}" class="otp-hidden-input"
         aria-label="6-digit verification code" />
  <p class="otp-help">Check your email for the code.</p>
</div>
```

```css
.otp-cells {
  display: flex;
  gap: 10px;
  position: relative;
}

.otp-cell {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--otp-border, oklch(35% 0.02 305));
  border-radius: 8px;
  font: 600 22px/1 system-ui;
  color: var(--text-primary);
  background: var(--otp-bg, oklch(16% 0.015 305));
  transition: border-color 0.15s;
}

.otp-cell--active {
  border-color: var(--otp-active, oklch(78% 0.135 82));
  box-shadow: 0 0 0 3px oklch(78% 0.135 82 / 0.15);
}

.otp-cell--filled {
  border-color: var(--otp-filled, oklch(50% 0.08 305));
}

.otp-cell--error {
  border-color: oklch(55% 0.22 25);
}

.otp-hidden-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  /* Overlays the cells so tap/click focuses it */
}

.otp-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 12px;
}

.otp-help {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 8px;
}
```

### 9.2 JavaScript (hidden input approach)

```javascript
class OtpInput {
  constructor(container) {
    this.container = container;
    this.input = container.querySelector('.otp-hidden-input');
    this.cells = [...container.querySelectorAll('.otp-cell')];
    this.length = this.cells.length;

    this.input.addEventListener('input', () => this.update());
    this.input.addEventListener('keydown', (e) => this.handleKey(e));
    this.input.addEventListener('paste', (e) => this.handlePaste(e));
    this.input.addEventListener('focus', () => this.updateFocus());
    this.input.addEventListener('blur', () => this.clearFocus());

    // Click on cells focuses the hidden input
    this.container.querySelector('.otp-cells').addEventListener('click', () => this.input.focus());
  }

  update() {
    const value = this.input.value.replace(/[^0-9]/g, '').slice(0, this.length);
    this.input.value = value; // Enforce numeric only

    this.cells.forEach((cell, i) => {
      cell.textContent = value[i] || '';
      cell.classList.toggle('otp-cell--filled', !!value[i]);
    });

    this.updateFocus();

    // Auto-submit when complete
    if (value.length === this.length) {
      this.container.dispatchEvent(new CustomEvent('complete', { detail: { value } }));
    }
  }

  updateFocus() {
    const pos = Math.min(this.input.value.length, this.length - 1);
    this.cells.forEach((cell, i) => {
      cell.classList.toggle('otp-cell--active', i === pos && document.activeElement === this.input);
    });
  }

  clearFocus() {
    this.cells.forEach(cell => cell.classList.remove('otp-cell--active'));
  }

  handleKey(e) {
    // Allow backspace to work naturally on the single input
    // No special handling needed with the hidden-input approach
  }

  handlePaste(e) {
    // Paste is handled automatically by the input
    // Just ensure we clean non-numeric characters in update()
  }
}
```

### 9.3 React + TypeScript

```typescript
import { useRef, useState, useCallback, ClipboardEvent, KeyboardEvent, useEffect } from "react";

interface OtpInputProps {
  length?: number;
  onComplete: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  masked?: boolean;
}

export function OtpInput({
  length = 6,
  onComplete,
  label = "Verification code",
  error,
  disabled,
  autoFocus = true,
  masked = false
}: OtpInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, length);
    setValue(cleaned);
    if (cleaned.length === length) onComplete(cleaned);
  }, [length, onComplete]);

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <div className="otp-wrapper">
      <label htmlFor="otp-input" className="otp-label">{label}</label>
      <div className="otp-container" onClick={() => inputRef.current?.focus()}>
        <div className="otp-cells" aria-hidden="true">
          {Array.from({ length }, (_, i) => (
            <div key={i} className={[
              'otp-cell',
              i === activeIndex && !disabled ? 'otp-cell--active' : '',
              value[i] ? 'otp-cell--filled' : '',
              error ? 'otp-cell--error' : ''
            ].filter(Boolean).join(' ')}>
              {value[i] ? (masked ? '•' : value[i]) : ''}
            </div>
          ))}
        </div>
        <input
          ref={inputRef}
          id="otp-input"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={length}
          pattern={`[0-9]{${length}}`}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-label={`${length}-digit verification code`}
          aria-invalid={!!error}
          aria-describedby={error ? 'otp-error' : undefined}
          className="otp-hidden-input"
        />
      </div>
      {error && <p id="otp-error" className="otp-error" role="alert">{error}</p>}
    </div>
  );
}
```

### 9.4 Approach B: Multiple inputs (common but harder)
The alternative with individual `<input>` per cell. More complex to handle keyboard navigation but gives native per-cell focus rings.

```typescript
// Simplified multi-input approach (key handlers abbreviated)
function OtpMultiInput({ length = 6, onComplete }: { length?: number; onComplete: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [values, setValues] = useState<string[]>(Array(length).fill(''));

  const handleInput = (index: number, char: string) => {
    if (!/^[0-9]$/.test(char)) return;
    const next = [...values];
    next[index] = char;
    setValues(next);
    // Auto-advance
    if (index < length - 1) refs.current[index + 1]?.focus();
    if (next.every(v => v)) onComplete(next.join(''));
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...values];
      if (values[index]) {
        next[index] = ''; setValues(next);
      } else if (index > 0) {
        next[index - 1] = ''; setValues(next);
        refs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    const next = [...values];
    pasted.split('').forEach((char, i) => { next[i] = char; });
    setValues(next);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
    if (pasted.length === length) onComplete(pasted);
  };

  return (
    <div className="otp-cells">
      {Array.from({ length }, (_, i) => (
        <input key={i} ref={el => refs.current[i] = el}
               type="text" inputMode="numeric" maxLength={1}
               value={values[i]} aria-label={`Digit ${i + 1} of ${length}`}
               onChange={e => handleInput(i, e.target.value)}
               onKeyDown={e => handleKeyDown(i, e)}
               onPaste={i === 0 ? handlePaste : undefined}
               className="otp-cell-input" />
      ))}
    </div>
  );
}
```

### 9.5 SMS Autofill
The key attributes for SMS/email code autofill:

```html
<!-- Hidden input approach -->
<input type="text" inputmode="numeric" autocomplete="one-time-code" />

<!-- iOS: reads SMS and offers autofill -->
<!-- Android: Google's SMS Retriever API or autofill framework -->
<!-- Web: WebOTP API (Chrome) for automatic SMS reading -->
```

```typescript
// WebOTP API (Chrome 84+)
if ('OTPCredential' in window) {
  const ac = new AbortController();
  navigator.credentials.get({
    otp: { transport: ['sms'] },
    signal: ac.signal
  }).then((otp) => {
    setValue(otp.code);
    onComplete(otp.code);
  }).catch(() => { /* user declined or timeout */ });

  // Abort after 60s
  setTimeout(() => ac.abort(), 60000);
}
```

### 9.7 Tailwind CSS

```html
<div class="flex flex-col items-center gap-3">
  <label for="otp" class="text-sm font-medium text-gray-200">Enter your 6-digit code</label>
  <div class="relative">
    <div class="flex gap-2.5" aria-hidden="true">
      <div class="w-12 h-12 rounded-lg border-2 border-purple-500 bg-gray-900 flex items-center justify-center text-xl font-semibold text-gray-100 shadow-[0_0_0_3px_rgba(95,44,130,0.15)]">4</div>
      <div class="w-12 h-12 rounded-lg border-2 border-gray-600 bg-gray-900 flex items-center justify-center text-xl font-semibold text-gray-100">2</div>
      <div class="w-12 h-12 rounded-lg border-2 border-gray-600 bg-gray-900"></div>
      <div class="w-12 h-12 rounded-lg border-2 border-gray-600 bg-gray-900"></div>
      <div class="w-12 h-12 rounded-lg border-2 border-gray-600 bg-gray-900"></div>
      <div class="w-12 h-12 rounded-lg border-2 border-gray-600 bg-gray-900"></div>
    </div>
    <input id="otp" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6"
           class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
           aria-label="6-digit verification code" />
  </div>
  <p class="text-xs text-gray-500">Check your email for the code.</p>
</div>
```

### 9.8 Next.js (Server Action verification)

```typescript
// app/verify/page.tsx
"use client";
import { OtpInput } from "@/components/otp-input";
import { verifyOtp } from "./actions";
import { useState, useTransition } from "react";

export default function VerifyPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleComplete(code: string) {
    setError(null);
    startTransition(async () => {
      const result = await verifyOtp(code);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="max-w-sm mx-auto py-16 text-center">
      <h1 className="text-xl font-semibold mb-2">Verify your email</h1>
      <p className="text-sm text-gray-400 mb-8">We sent a code to you@example.com</p>
      <OtpInput length={6} onComplete={handleComplete} error={error} disabled={isPending} />
    </div>
  );
}

// app/verify/actions.ts
"use server";
import { redirect } from "next/navigation";

export async function verifyOtp(code: string) {
  if (!/^\d{6}$/.test(code)) return { error: "Invalid code format" };
  const valid = await db.verifyOtp(getCurrentUserId(), code);
  if (!valid) return { error: "Invalid or expired code" };
  await db.markEmailVerified(getCurrentUserId());
  redirect("/dashboard");
}
```

### 9.9 shadcn/ui (input-otp)

```typescript
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";

export function OtpVerification({ onComplete, error }: { onComplete: (code: string) => void; error?: string }) {
  return (
    <div className="space-y-4">
      <InputOTP maxLength={6} onComplete={onComplete}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
}
```

### 9.10 Vue 3

```html
<script setup lang="ts">
import { ref, computed } from 'vue';
const props = defineProps<{ length?: number; error?: string; disabled?: boolean }>();
const emit = defineEmits<{ complete: [code: string] }>();
const length = computed(() => props.length ?? 6);
const value = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const activeIndex = computed(() => Math.min(value.value.length, length.value - 1));

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  value.value = target.value.replace(/[^0-9]/g, '').slice(0, length.value);
  target.value = value.value;
  if (value.value.length === length.value) emit('complete', value.value);
}
</script>

<template>
  <div class="otp-wrapper">
    <div class="otp-cells" aria-hidden="true" @click="inputRef?.focus()">
      <div v-for="i in length" :key="i"
           :class="['otp-cell', { 'otp-cell--active': i - 1 === activeIndex }]">
        {{ value[i - 1] || '' }}
      </div>
    </div>
    <input ref="inputRef" type="text" inputmode="numeric" autocomplete="one-time-code"
           :maxlength="length" :value="value" :disabled="disabled"
           :aria-label="`${length}-digit verification code`"
           :aria-invalid="!!error" class="otp-hidden-input" @input="handleInput" />
    <p v-if="error" class="otp-error" role="alert">{{ error }}</p>
  </div>
</template>
```

### 9.11 Svelte

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let length = 6;
  export let error: string | undefined = undefined;
  export let disabled = false;
  const dispatch = createEventDispatcher<{ complete: string }>();
  let value = '';
  let inputEl: HTMLInputElement;
  $: activeIndex = Math.min(value.length, length - 1);
  $: cells = Array.from({ length }, (_, i) => value[i] || '');

  function handleInput() {
    value = inputEl.value.replace(/[^0-9]/g, '').slice(0, length);
    inputEl.value = value;
    if (value.length === length) dispatch('complete', value);
  }
</script>

<div class="otp-wrapper">
  <div class="otp-cells" aria-hidden="true" on:click={() => inputEl.focus()}>
    {#each cells as digit, i}
      <div class="otp-cell" class:otp-cell--active={i === activeIndex && !disabled}>{digit}</div>
    {/each}
  </div>
  <input bind:this={inputEl} type="text" inputmode="numeric" autocomplete="one-time-code"
         maxlength={length} {value} {disabled}
         aria-label="{length}-digit verification code"
         class="otp-hidden-input" on:input={handleInput} />
  {#if error}<p class="otp-error" role="alert">{error}</p>{/if}
</div>
```

### 9.12 SwiftUI

```swift
import SwiftUI

struct OTPInputView: View {
    @Binding var code: String
    let length: Int
    var error: String? = nil
    var onComplete: ((String) -> Void)? = nil
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(spacing: 16) {
            HStack(spacing: 10) {
                ForEach(0..<length, id: \.self) { index in
                    let digit = index < code.count ? String(code[code.index(code.startIndex, offsetBy: index)]) : ""
                    Text(digit)
                        .font(.title2.monospacedDigit().bold())
                        .frame(width: 48, height: 48)
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                        .overlay(RoundedRectangle(cornerRadius: 8)
                            .stroke(index == code.count && isFocused ? Color.purple : (error != nil ? Color.red : Color.gray.opacity(0.3)), lineWidth: 2))
                }
            }
            .overlay {
                TextField("", text: $code)
                    .keyboardType(.numberPad)
                    .textContentType(.oneTimeCode)
                    .focused($isFocused)
                    .opacity(0.01)
                    .onChange(of: code) { newValue in
                        code = String(newValue.filter(\.isNumber).prefix(length))
                        if code.count == length { onComplete?(code) }
                    }
            }
            .onTapGesture { isFocused = true }

            if let error { Text(error).font(.caption).foregroundColor(.red) }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(length)-digit verification code")
        .onAppear { isFocused = true }
    }
}
```

### 9.13 Jetpack Compose

```kotlin
@Composable
fun OtpInput(length: Int = 6, onComplete: (String) -> Unit, error: String? = null, enabled: Boolean = true) {
    var value by remember { mutableStateOf("") }
    val focusRequester = remember { FocusRequester() }

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        BasicTextField(
            value = value,
            onValueChange = { newValue ->
                val cleaned = newValue.filter { it.isDigit() }.take(length)
                value = cleaned
                if (cleaned.length == length) onComplete(cleaned)
            },
            enabled = enabled,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.focusRequester(focusRequester).size(0.dp)
        )

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            repeat(length) { index ->
                val digit = value.getOrNull(index)?.toString() ?: ""
                val isActive = index == value.length && enabled
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier.size(48.dp).border(2.dp,
                        when { error != null -> Color.Red; isActive -> Color(0xFF5F2C82); else -> Color(0xFF444444) },
                        RoundedCornerShape(8.dp)
                    ).clickable { focusRequester.requestFocus() }
                ) { Text(digit, fontSize = 22.sp, fontWeight = FontWeight.Bold) }
            }
        }

        error?.let { Spacer(Modifier.height(8.dp)); Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }
    }

    LaunchedEffect(Unit) { focusRequester.requestFocus() }
}
```

### 9.14 Flutter

```dart
class OtpInputWidget extends StatefulWidget {
  final int length;
  final ValueChanged<String> onComplete;
  final String? error;
  final bool disabled;
  const OtpInputWidget({super.key, this.length = 6, required this.onComplete, this.error, this.disabled = false});
  @override State<OtpInputWidget> createState() => _OtpInputWidgetState();
}

class _OtpInputWidgetState extends State<OtpInputWidget> {
  late final TextEditingController _controller;
  late final FocusNode _focusNode;

  @override void initState() {
    super.initState();
    _controller = TextEditingController();
    _focusNode = FocusNode();
    WidgetsBinding.instance.addPostFrameCallback((_) => _focusNode.requestFocus());
  }
  @override void dispose() { _controller.dispose(); _focusNode.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      SizedBox(width: 0, height: 0, child: TextField(
        controller: _controller, focusNode: _focusNode,
        keyboardType: TextInputType.number,
        inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(widget.length)],
        autofillHints: const [AutofillHints.oneTimeCode],
        onChanged: (v) { setState(() {}); if (v.length == widget.length) widget.onComplete(v); },
      )),
      GestureDetector(
        onTap: () => _focusNode.requestFocus(),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(widget.length, (i) {
          final digit = i < _controller.text.length ? _controller.text[i] : '';
          final isActive = i == _controller.text.length && _focusNode.hasFocus;
          return Container(
            width: 48, height: 48, margin: const EdgeInsets.symmetric(horizontal: 5),
            decoration: BoxDecoration(
              border: Border.all(color: widget.error != null ? Colors.red : isActive ? const Color(0xFF5F2C82) : Colors.grey.shade700, width: 2),
              borderRadius: BorderRadius.circular(8),
            ),
            alignment: Alignment.center,
            child: Text(digit, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          );
        })),
      ),
      if (widget.error != null) Padding(padding: const EdgeInsets.only(top: 8),
        child: Text(widget.error!, style: TextStyle(color: Theme.of(context).colorScheme.error, fontSize: 12))),
    ]);
  }
}
```

### 9.15 Testing

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OTPInput } from "./OTPInput";

describe("OTP Input", () => {
  it("accepts numeric input and fills cells", async () => {
    const onComplete = vi.fn();
    render(<OTPInput onComplete={onComplete} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it("rejects non-numeric characters", async () => {
    render(<OTPInput onComplete={() => {}} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'abc123');
    expect(input).toHaveValue('123'); // only digits accepted
  });

  it("handles paste of full code", async () => {
    const onComplete = vi.fn();
    render(<OTPInput onComplete={onComplete} />);
    const input = screen.getByRole('textbox');
    await userEvent.click(input);
    await userEvent.paste('789012');
    expect(onComplete).toHaveBeenCalledWith('789012');
  });

  it("clears on error and refocuses", () => {
    const { rerender } = render(<OTPInput onComplete={() => {}} />);
    rerender(<OTPInput onComplete={() => {}} error="Invalid code" />);
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it("shows error message with role=alert", () => {
    render(<OTPInput onComplete={() => {}} error="Invalid code" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid code');
  });

  it("has autocomplete=one-time-code for SMS autofill", () => {
    render(<OTPInput onComplete={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'one-time-code');
  });

  it("limits input to maxLength", async () => {
    render(<OTPInput length={4} onComplete={() => {}} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '123456');
    expect(input).toHaveValue('1234'); // capped at 4
  });
});
```

* * *

## 10\. Accessibility

### Approach A (hidden input) is more accessible

A single `<input>` with `inputmode="numeric"` and `autocomplete="one-time-code"` is inherently accessible:

*   Screen readers see one input, announce its label
*   Native paste, autofill, and autocomplete all work
*   No complex multi-input focus management needed
*   Password managers and OTP autofill recognize it

The visual cells are `aria-hidden="true"` (decorative). The real input is the hidden one.

### Approach B (multiple inputs) accessibility challenges

If using one `<input>` per cell:

*   Each needs `aria-label="Digit N of 6"`
*   Paste only works on the first input (or needs custom handling on all)
*   `autocomplete="one-time-code"` only works on the first input
*   Backspace navigation between inputs is custom JS, not native behavior
*   Screen readers encounter 6 separate inputs, which is confusing

### Both approaches need:

*   Visible **`<label>`** above the cells: "Enter your 6-digit code"
*   **`inputmode="numeric"`** to show the number keyboard on mobile
*   **`autocomplete="one-time-code"`** for SMS/email code autofill
*   Error messages with **`role="alert"`** when the code is invalid (dynamically injected)
*   **`aria-invalid="true"`** on error
*   **`aria-describedby`** linking to helper text and error messages

### Auto-submit accessibility

If the form auto-submits when the last digit is entered, announce "Verifying..." via a live region. Don't navigate silently. Users need to know something is happening.

### Success/Error feedback

After server validation, announce the result: "Code verified, redirecting" or "Invalid code, please try again." Use `role="alert"` for the error (assertive) and `role="status"` for success (polite).
* * *

## 11\. Innovative / Emerging Ideas

*   **WebOTP API:** Chrome automatically reads SMS codes and fills the input (with user permission). Zero-effort autofill.
*   **Passkey replacement:** FIDO2/WebAuthn may make OTP obsolete for many flows. But OTP remains necessary for SMS-based verification.
*   **Biometric confirmation:** instead of typing a code, confirm with Face ID/fingerprint that you received it.
*   **Magic links replacing OTP:** click a link in email instead of typing a code. Better UX for email verification.
*   **Animated cell feedback:** each cell does a subtle bounce or color pulse as it's filled. Micro-delight.
*   **Copy-paste from notification:** on mobile, the "copy code" button in the SMS notification + paste into the input.
*   **Haptic per digit (mobile):** subtle vibration on each successful digit entry — confirmation without looking.
*   **Voice input:** "Read me the code" triggers speech recognition to fill the fields hands-free.
* * *

## 12\. Conversion / UX Killers

*   **No SMS autofill support:** missing `autocomplete="one-time-code"`. Users must manually read and type the code instead of the OS offering to fill it. Massive friction.
*   **Paste doesn't work:** user copies the code from their email, tries to paste, nothing happens. Incredibly frustrating. MUST support paste filling all cells.
*   **Backspace doesn't move to previous cell:** user makes a typo, hits backspace, and nothing happens in the current empty cell. Backspace should clear AND move back.
*   **Non-numeric characters accepted:** user accidentally types a letter, it goes in, confusing. Filter to digits only.
*   **No auto-advance:** user types a digit and has to manually tap the next cell. Defeats the purpose of the pattern.
*   **No error recovery:** code fails, all cells clear, user must re-read and re-type from scratch. Consider keeping the value and letting users edit.
*   **No resend option:** code expired or never arrived, and there's no way to request a new one.
*   **Timer anxiety:** "Code expires in 0:45" counting down creates panic. Show the timer but give generous windows (5-10 minutes).
*   **Auto-submit on complete with no loading feedback:** the code auto-submits but nothing visually changes. Users think it didn't work and try to retype.
* * *

## 13\. Advanced Patterns

### Resend with cooldown

```typescript
function useResendCooldown(initialCooldown = 60) {
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) { setCanResend(true); return; }
    const timer = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const resend = async () => {
    await api.resendCode();
    setCooldown(initialCooldown);
    setCanResend(false);
  };

  return { cooldown, canResend, resend };
}

// In render:
{canResend ? (
  <button onClick={resend}>Resend code</button>
) : (
  <span>Resend in {cooldown}s</span>
)}
```

### Rate-limited verification

```typescript
// Server-side: track attempts per user/session
app.post('/api/verify-otp', rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }), (req, res) => {
  const { code, sessionId } = req.body;
  const attempts = getAttempts(sessionId);
  if (attempts >= 5) return res.status(429).json({ error: 'Too many attempts. Request a new code.' });
  incrementAttempts(sessionId);

  if (verifyCode(sessionId, code)) {
    clearAttempts(sessionId);
    return res.json({ success: true });
  }
  return res.status(400).json({ error: 'Invalid code', attemptsRemaining: 5 - attempts - 1 });
});
```

* * *

## 14\. Performance & Bundle Cost
*   **Lightweight component.** An OTP input is minimal DOM (6 divs + 1 input). No performance concerns.
*   **Debounce auto-submit.** If auto-submitting on complete, add a tiny delay (100ms) to handle fast paste without double-firing.
*   **WebOTP API is async.** It doesn't block the UI. The credential request runs in the background.
*   **Don't poll for SMS.** Use the WebOTP API (push) rather than polling for SMS arrival.
* * *

## 15\. Security
*   **Rate-limit verification attempts.** Cap at 3-5 attempts per code. After that, invalidate the code and require a new one. Prevents brute-force.
*   **Code expiration.** OTP codes should expire in 5-10 minutes. Never allow unlimited validity.
*   **One-use codes.** Once verified (or expired), the code can never be used again.
*   **Don't log OTP codes.** They're credentials. Don't write them to application logs, analytics, or error reporters.
*   **Constant-time comparison.** Compare the submitted code to the stored code using a timing-safe comparison function. Prevents timing attacks.
*   **Secure transport.** OTP codes should only be submitted over HTTPS.
*   **Don't echo the code.** Never show the correct code in an error message ("The correct code was 123456").
*   **CSRF protection.** The verification endpoint needs CSRF protection if using cookies for the session.
*   **Clipboard security.** The code in the user's clipboard may persist. Consider clearing it after successful verification (though this is a UX vs. security tradeoff).
* * *

## 16\. Senior-Level Checklist
- [ ] `inputmode="numeric"` (number keyboard on mobile)
- [ ] `autocomplete="one-time-code"` (SMS/email autofill)
- [ ] Visible `<label>` paired to the input
- [ ] Paste fills all cells from clipboard
- [ ] Auto-advance to next cell on digit entry
- [ ] Backspace clears current AND moves to previous cell
- [ ] Non-numeric characters filtered out
- [ ] Error state with `role="alert"` announcement
- [ ] `aria-invalid` on error
- [ ] Auto-submit announces "Verifying" via live region
- [ ] Success/error result announced to AT
- [ ] Resend option with cooldown timer
- [ ] Works with password managers and autofill
- [ ] WebOTP API used when available (Chrome)
- [ ] Server: rate-limited (3-5 attempts per code)
- [ ] Server: codes expire in 5-10 minutes
- [ ] Server: constant-time comparison
- [ ] Server: one-use (code invalidated after verify or expiry)
- [ ] Error clears on new input (don't keep stale error)
- [ ] `prefers-reduced-motion`: no cell animations
* * *

## 17\. Visual Styles
The same OTP input rendered across eleven aesthetics. The style is skin; `inputmode`, `autocomplete`, paste behavior, and ARIA never change.

**Flat:** solid-bordered cells, 1px border, clean focus ring on active cell. Universal default.

**Material:** outlined cells following M3 text-field shape. Active cell has a thicker bottom border (or full border) in the primary color. Filled variant: subtle background tint.

**Glassmorphism:** translucent cells over blurred content. Active cell border glows through the glass.

**Liquid Glass (2026):** refractive cell borders with specular highlight on the active cell. Premium auth screen aesthetic.

**Neumorphism:** cells pressed into soft surface (inset shadow). Active cell has a deeper inset. Digits feel engraved.

**Skeuomorphism:** cells look like a mechanical counter or combination lock. Each digit sits in a recessed slot with metallic edges.

**Neo-Brutalism:** thick 2-3px borders on cells, hard offset shadow. Active cell in a bold accent color. Strong, confident.

**Claymorphism:** puffy rounded cells with soft inner glow. Active cell has a brighter glow. Playful.

**Aurora/Gradient:** active cell has an animated gradient border. Filled cells get a subtle gradient fill. Honor `prefers-reduced-motion`.

**Minimal/Swiss:** bottom-border only (no box). Just a line under each digit position. Active line thicker/colored. Maximum restraint.

**UJG Brand:** Night cell background, Eminence border. Active cell gets Goldenrod border with warm glow. Digits in Platinum. The house default.

Full style definitions on the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).