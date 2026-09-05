# Code Block (Full Build)

# The Code Block: A Senior Engineer's Complete Breakdown
The syntax-highlighted code display component. Here's everything from first principles to production code.

**Try it live:** the interactive playground (built in a later pass) will let you toggle language, line numbers, theme, and copy behavior, then output code for every target.

This doc follows the ⭐ COMPONENT ASSET TEMPLATE (follow this) ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).
* * *

## 1\. What a Code Block Actually Is
A **code block** is a styled container for displaying programming code with syntax highlighting, line numbers, and a copy button. It's read-only display (not an editor).

**Code Block (this doc):** read-only, highlighted, copyable code display.
**Inline code:** backtick-wrapped code within prose (`const x = 1`). A fragment, not a block.
**Code editor:** editable with intellisense (CodeMirror, Monaco). A full application widget.
**Textarea:** plain multi-line input. No highlighting.
* * *

## 2\. Why It Matters
**Documentation lives and dies on code blocks.** API docs, tutorials, READMEs, blog posts, component libraries (this doc!). If code is hard to read or copy, the documentation fails.
**Copy-to-clipboard is mandatory.** Users read code blocks to copy them. A code block without a copy button forces manual selection (error-prone with line numbers mixed in).
**Syntax highlighting reduces cognitive load.** Color-coded keywords, strings, and comments let developers scan structure without reading every character.
* * *

## 3\. Anatomy
**Container:** the outer box with background, padding, rounded corners. Distinct from surrounding prose.
**Header (optional):** language label ("TypeScript") and/or filename tab ("Button.tsx"). Positioned at the top.
**Line numbers (optional):** a gutter column on the left with line counts.
**Code content:** monospace text with syntax highlighting (keywords colored, strings colored, comments dimmed).
**Copy button:** typically top-right. Copies raw code (without line numbers) to clipboard.
**Horizontal scroll:** long lines scroll horizontally (code NEVER wraps).
**Line highlighting (optional):** specific lines with a tinted background for emphasis.
**Diff indicators (optional):** green/red left-margin for added/removed lines.
* * *

## 4\. Sizes / Scale

| Token | Padding | Font Size | Line Height | Max Height | Use |
| ---| ---| ---| ---| ---| --- |
| S | 12px | 12px | 1.5 | 200px | Inline snippets in cards |
| M | 16px 20px | 13px | 1.6 | 400px | Default (docs, tutorials) |
| L | 20px 24px | 14px | 1.6 | 600px | Detailed examples, full files |

Width: 100% parent, with `overflow-x: auto` for horizontal scroll. Max-width governed by the content container (usually 65-80ch for prose, but code blocks can exceed this).

Line numbers gutter: 32-48px width depending on max line count (2 digits vs. 3 digits).
* * *

## 5\. States
**Default:** code displayed with highlighting. Copy button visible (always or on hover).
**Hover:** copy button appears (if hidden by default). Subtle container highlight.
**Copied:** copy button shows "Copied!" with a checkmark for 1.5-2s, then reverts.
**Focused (keyboard scroll):** the block has `tabindex="0"` and is focused for keyboard scrolling. Shows a focus ring on the container.
**Line highlighted:** specific lines have a tinted background (yellow/blue tint) to draw attention.
**Overflow:** long lines extend past the container. Horizontal scrollbar appears. Optionally, a "scroll to see more" shadow indicator on the right edge.
**Collapsed (optional):** long blocks show first N lines with "Show more" button. Expands to full height.
**Loading/Skeleton (optional):** for dynamically-loaded code. Monospace-width gray bars.
* * *

## 6\. Types / Variants
**Standard:** full block with container, padding, and highlighting.
**With header:** language label or filename displayed above the code.
**With line numbers:** numbered gutter on the left.
**With line highlighting:** specific lines have a tinted background (for drawing attention).
**Diff view:** green/red indicators for additions/deletions. Git diff style.
**Inline code:** the backtick variant for within-prose code. Much simpler (just a `<code>` with background).
**Terminal/Shell:** dark background with `$` prompt styling. Shows commands to run rather than source code.
**Collapsible:** long blocks truncated with expand/collapse.
**Multi-file/Tabbed:** multiple code files shown with tabs across the top (switching between them).
**Live preview (optional):** code block paired with a rendered output preview.
* * *

## 7\. When to Use (and When Not To)
**Use a code block when:**
*   Displaying programming code, config, terminal commands, or structured data (JSON, YAML)
*   Syntax highlighting aids comprehension
*   Users will copy the code
*   Preserving exact formatting (whitespace, indentation) matters

**Use something else when:**
*   Short inline code reference → inline `<code>` element
*   Users need to edit the code → code editor (CodeMirror, Monaco)
*   The content is plain text that happens to be technical → a regular pre-formatted block
*   Showing command-line interaction → consider a terminal/console component
* * *

## 8\. Across Design Systems
**Prism.js:** the standard syntax highlighter. Small, extensible, many language grammars.
**Shiki:** uses VS Code's grammar engine (TextMate). Exact same highlighting as VS Code. Server-side friendly.
**highlight.js:** another popular highlighter with auto-detection.
**rehype-pretty-code / bright:** Shiki-based, for MDX/markdown rendering.
**shadcn code blocks:** styled with Shiki or Prism + custom CSS.
**GitHub/GitLab:** the benchmark for code block UX in documentation.
* * *

## 9\. The Code
### 9.1 HTML

```plain
<figure class="code-block" role="figure" aria-label="TypeScript code example">
  <figcaption class="code-block__header">
    <span class="code-block__lang">TypeScript</span>
    <button type="button" class="code-block__copy" aria-label="Copy code">
      <svg aria-hidden="true"><!-- copy icon --></svg>
      <span class="code-block__copy-text">Copy</span>
    </button>
  </figcaption>
  <pre class="code-block__pre" tabindex="0"><code class="language-typescript">interface ButtonProps {
  variant: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({ variant, size, children }: ButtonProps) {
  return (
    <button className={`btn btn--${variant} btn--${size}`}>
      {children}
    </button>
  );
}</code></pre>
</figure>
```

Key decisions:
*   **`<figure>`** **+** **`<figcaption>`** wraps the code block semantically. AT can announce "figure, TypeScript code example."
*   **`<pre><code>`** is the semantic foundation. `<pre>` preserves whitespace. `<code>` marks it as code.
*   **`class="language-typescript"`** triggers syntax highlighting libraries.
*   **`tabindex="0"`** **on** **`<pre>`** makes the block focusable for keyboard scrolling.
*   **Copy button outside** **`<pre>`** so it's not included when the user manually selects text.
### 9.2 CSS

```css
.code-block {
  position: relative;
  margin: 24px 0;
  border-radius: 10px;
  overflow: hidden;
  background: var(--code-bg, oklch(14% 0.015 305));
  border: 1px solid var(--code-border, oklch(25% 0.02 305));
}

.code-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--code-header-bg, oklch(18% 0.015 305));
  border-bottom: 1px solid var(--code-border);
}

.code-block__lang {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-muted, oklch(55% 0.01 305));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.code-block__copy {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.72rem;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}

.code-block__copy:hover {
  background: oklch(30% 0.02 305);
  color: var(--text-primary);
}

.code-block__copy:focus-visible {
  outline: 2px solid var(--ring, oklch(78% 0.135 82));
  outline-offset: 2px;
}

.code-block__copy.is-copied {
  color: oklch(65% 0.15 145);
}

.code-block__pre {
  margin: 0;
  padding: 16px 20px;
  overflow-x: auto;
  font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--code-fg, oklch(85% 0.01 305));
  tab-size: 2;
  -webkit-font-smoothing: antialiased;
}

.code-block__pre:focus-visible {
  outline: 2px solid var(--ring) inset;
}

/* Don't wrap code lines */
.code-block__pre code {
  white-space: pre;
  word-break: normal;
  word-wrap: normal;
}

/* Line numbers variant */
.code-block--numbered .code-block__pre {
  counter-reset: line;
}

.code-block--numbered .code-block__pre code .line::before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: 2ch;
  margin-right: 16px;
  text-align: right;
  color: oklch(40% 0.01 305);
  user-select: none; /* Don't include in copy */
}

/* Line highlighting */
.code-block__pre code .line.highlighted {
  background: oklch(42% 0.08 305 / 0.1);
  margin: 0 -20px;
  padding: 0 20px;
  border-left: 3px solid oklch(42% 0.14 305);
}

/* Scroll shadow indicator */
.code-block__pre::after {
  content: '';
  position: sticky;
  right: 0;
  top: 0;
  bottom: 0;
  width: 24px;
  background: linear-gradient(90deg, transparent, var(--code-bg));
  pointer-events: none;
}
```

### 9.3 JavaScript (copy with feedback)

```javascript
document.querySelectorAll('.code-block__copy').forEach(btn => {
  btn.addEventListener('click', async () => {
    const pre = btn.closest('.code-block').querySelector('pre code');
    const text = pre.textContent; // Gets raw text without HTML tags

    try {
      await navigator.clipboard.writeText(text);
      btn.classList.add('is-copied');
      btn.querySelector('.code-block__copy-text').textContent = 'Copied!';
      setTimeout(() => {
        btn.classList.remove('is-copied');
        btn.querySelector('.code-block__copy-text').textContent = 'Copy';
      }, 1500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  });
});
```

### 9.4 React + TypeScript

```typescript
import { useState, useCallback, useRef } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  maxHeight?: number;
}

export function CodeBlock({ code, language, filename, showLineNumbers, highlightLines = [], maxHeight }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* fallback */ }
  }, [code]);

  const lines = code.split('
');

  return (
    <figure className={`code-block ${showLineNumbers ? 'code-block--numbered' : ''}`}
            role="figure" aria-label={`${language || 'Code'} example${filename ? `: ${filename}` : ''}`}>
      <figcaption className="code-block__header">
        <span className="code-block__lang">{filename || language}</span>
        <button className={`code-block__copy ${copied ? 'is-copied' : ''}`}
                onClick={handleCopy} aria-label="Copy code">
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span className="code-block__copy-text">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </figcaption>
      <pre className="code-block__pre" tabIndex={0}
           style={maxHeight ? { maxHeight, overflow: 'auto' } : undefined}>
        <code ref={codeRef} className={language ? `language-${language}` : ''}>
          {lines.map((line, i) => (
            <span key={i} className={`line ${highlightLines.includes(i + 1) ? 'highlighted' : ''}`}>
              {line}

            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
```

### 9.5 Testing

```typescript
describe("CodeBlock", () => {
  it("renders as figure with label", () => {
    render(<CodeBlock code="const x = 1;" language="typescript" />);
    expect(screen.getByRole('figure', { name: /typescript/i })).toBeInTheDocument();
  });

  it("uses pre > code semantic structure", () => {
    const { container } = render(<CodeBlock code="hello" />);
    expect(container.querySelector('pre code')).toBeInTheDocument();
  });

  it("copy button copies code to clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CodeBlock code="const x = 1;" />);
    await userEvent.click(screen.getByRole('button', { name: /copy/i }));
    expect(writeText).toHaveBeenCalledWith('const x = 1;');
  });

  it("shows 'Copied!' after copy", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    render(<CodeBlock code="x" />);
    await userEvent.click(screen.getByRole('button', { name: /copy/i }));
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it("pre is keyboard-scrollable (tabindex=0)", () => {
    const { container } = render(<CodeBlock code="long code..." />);
    expect(container.querySelector('pre')).toHaveAttribute('tabindex', '0');
  });
});
```

### 9.6 Tailwind CSS

```plain
<figure class="rounded-xl overflow-hidden border border-gray-800 bg-gray-950 my-6" role="figure" aria-label="TypeScript example">
  <!-- Header -->
  <div class="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
    <span class="text-[11px] font-medium uppercase tracking-wider text-gray-500">TypeScript</span>
    <button class="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-gray-500
                   hover:bg-gray-800 hover:text-gray-300 focus-visible:outline focus-visible:outline-2
                   focus-visible:outline-offset-2 focus-visible:outline-amber-400" aria-label="Copy code">
      <svg class="w-3.5 h-3.5" aria-hidden="true"><!-- copy icon --></svg>
      Copy
    </button>
  </div>
  <!-- Code -->
  <pre class="p-4 overflow-x-auto text-[13px] leading-relaxed text-gray-300 font-mono
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400/50 focus-visible:outline-offset-[-2px]"
       tabindex="0"><code class="language-typescript">const greeting = "Hello, world";
console.log(greeting);</code></pre>
</figure>
```

### 9.7 Next.js (Shiki server-side highlighting)

```typescript
// lib/highlight.ts (runs at build time or on server)
import { getHighlighter } from 'shiki';

let highlighter: Awaited<ReturnType<typeof getHighlighter>>;

export async function highlight(code: string, lang: string): Promise<string> {
  if (!highlighter) {
    highlighter = await getHighlighter({ themes: ['one-dark-pro'], langs: ['typescript', 'css', 'html', 'jsx', 'python'] });
  }
  return highlighter.codeToHtml(code, { lang, theme: 'one-dark-pro' });
}

// app/components/code-block.tsx (Server Component — zero client JS for highlighting!)
import { highlight } from '@/lib/highlight';

interface ServerCodeBlockProps { code: string; language: string; filename?: string; }

export async function ServerCodeBlock({ code, language, filename }: ServerCodeBlockProps) {
  const html = await highlight(code, language);

  return (
    <figure className="code-block" role="figure" aria-label={`${language} code${filename ? `: ${filename}` : ''}`}>
      <figcaption className="code-block__header">
        <span className="code-block__lang">{filename || language}</span>
        <CopyButton code={code} /> {/* Client component for the interactive button */}
      </figcaption>
      <div dangerouslySetInnerHTML={{ __html: html }} className="code-block__pre" tabIndex={0} />
    </figure>
  );
}

// components/copy-button.tsx
"use client";
export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="code-block__copy" aria-label="Copy code">
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}
```

### 9.8 shadcn/ui

```typescript
// components/ui/code-block.tsx
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CodeBlockProps { code: string; language?: string; filename?: string; className?: string; }

export function CodeBlock({ code, language, filename, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  return (
    <figure className={cn("rounded-xl overflow-hidden border bg-card", className)} role="figure"
            aria-label={`${language || 'Code'} example`}>
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{filename || language}</span>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" aria-label="Copy code"
                onClick={async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
          {copied ? <><Check className="h-3 w-3 mr-1" />Copied</> : <><Copy className="h-3 w-3 mr-1" />Copy</>}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono" tabIndex={0}>
        <code>{code}</code>
      </pre>
    </figure>
  );
}
```

### 9.9 Vue 3

```plain
<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps<{ code: string; language?: string; filename?: string }>();
const copied = ref(false);

async function copy() {
  await navigator.clipboard.writeText(props.code);
  copied.value = true;
  setTimeout(() => copied.value = false, 1500);
}
</script>

<template>
  <figure class="code-block" role="figure" :aria-label="`${language || 'Code'} example`">
    <figcaption class="code-block__header">
      <span class="code-block__lang">{{ filename || language }}</span>
      <button :class="['code-block__copy', { 'is-copied': copied }]" @click="copy" aria-label="Copy code">
        {{ copied ? '✓ Copied' : 'Copy' }}
      </button>
    </figcaption>
    <pre class="code-block__pre" tabindex="0"><code :class="language ? `language-${language}` : ''">{{ code }}</code></pre>
  </figure>
</template>
```

### 9.10 Svelte

```plain
<script lang="ts">
  export let code: string;
  export let language: string | undefined = undefined;
  export let filename: string | undefined = undefined;
  let copied = false;

  async function copy() {
    await navigator.clipboard.writeText(code);
    copied = true;
    setTimeout(() => copied = false, 1500);
  }
</script>

<figure class="code-block" role="figure" aria-label={`${language || 'Code'} example`}>
  <figcaption class="code-block__header">
    <span class="code-block__lang">{filename || language}</span>
    <button class="code-block__copy" class:is-copied={copied} on:click={copy} aria-label="Copy code">
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  </figcaption>
  <pre class="code-block__pre" tabindex="0"><code class={language ? `language-${language}` : ''}>{code}</code></pre>
</figure>
```

### 9.11 SwiftUI

```swift
import SwiftUI

struct CodeBlockView: View {
    let code: String
    let language: String?
    @State private var copied = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                Text(language?.uppercased() ?? "CODE")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.secondary)
                    .tracking(1)
                Spacer()
                Button(action: copyCode) {
                    Label(copied ? "Copied" : "Copy", systemImage: copied ? "checkmark" : "doc.on.doc")
                        .font(.system(size: 11))
                }
                .buttonStyle(.plain)
                .foregroundColor(copied ? .green : .secondary)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color(.systemGray5))

            // Code
            ScrollView(.horizontal, showsIndicators: true) {
                Text(code)
                    .font(.system(size: 13, design: .monospaced))
                    .foregroundColor(Color(.label))
                    .padding(16)
                    .textSelection(.enabled)
            }
            .background(Color(.systemGray6))
        }
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2)))
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(language ?? "Code") example")
    }

    func copyCode() {
        UIPasteboard.general.string = code
        copied = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { copied = false }
    }
}
```

### 9.12 Jetpack Compose

```kotlin
@Composable
fun CodeBlock(code: String, language: String? = null, filename: String? = null) {
    val context = LocalContext.current
    var copied by remember { mutableStateOf(false) }
    val clipboardManager = LocalClipboardManager.current

    Column(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(12.dp))) {
        // Header
        Row(modifier = Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surfaceVariant).padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically) {
            Text(filename ?: language?.uppercase() ?: "CODE", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.weight(1f))
            TextButton(onClick = {
                clipboardManager.setText(AnnotatedString(code))
                copied = true
                // Reset after delay via coroutine
            }, contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)) {
                Icon(if (copied) Icons.Default.Check else Icons.Default.ContentCopy, null, modifier = Modifier.size(14.dp))
                Spacer(Modifier.width(4.dp))
                Text(if (copied) "Copied" else "Copy", style = MaterialTheme.typography.labelSmall)
            }
        }
        // Code
        val scrollState = rememberScrollState()
        Box(modifier = Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surfaceContainerLowest).horizontalScroll(scrollState).padding(16.dp)) {
            SelectionContainer {
                Text(code, fontFamily = FontFamily.Monospace, fontSize = 13.sp, lineHeight = 20.sp, color = MaterialTheme.colorScheme.onSurface)
            }
        }
    }
}
```

### 9.13 Flutter

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class CodeBlockWidget extends StatefulWidget {
  final String code;
  final String? language;
  final String? filename;
  const CodeBlockWidget({super.key, required this.code, this.language, this.filename});
  @override State<CodeBlockWidget> createState() => _CodeBlockWidgetState();
}

class _CodeBlockWidgetState extends State<CodeBlockWidget> {
  bool _copied = false;

  void _copy() async {
    await Clipboard.setData(ClipboardData(text: widget.code));
    setState(() => _copied = true);
    Future.delayed(const Duration(milliseconds: 1500), () { if (mounted) setState(() => _copied = false); });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade800),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        // Header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          color: Colors.grey.shade900,
          child: Row(children: [
            Text((widget.filename ?? widget.language ?? 'CODE').toUpperCase(),
                 style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Colors.grey.shade500, letterSpacing: 1)),
            const Spacer(),
            TextButton.icon(
              onPressed: _copy,
              icon: Icon(_copied ? Icons.check : Icons.copy, size: 14),
              label: Text(_copied ? 'Copied' : 'Copy', style: const TextStyle(fontSize: 11)),
              style: TextButton.styleFrom(foregroundColor: _copied ? Colors.green : Colors.grey.shade500, padding: const EdgeInsets.symmetric(horizontal: 8)),
            ),
          ]),
        ),
        // Code
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.all(16),
          child: SelectableText(
            widget.code,
            style: TextStyle(fontFamily: 'monospace', fontSize: 13, height: 1.6, color: Colors.grey.shade200),
          ),
        ),
      ]),
    );
  }
}
```

* * *

## 10\. Accessibility
**`<pre><code>`** is inherently accessible. Screen readers read the code content as text. No special ARIA needed for the basic case.

**`<figure>`** **+** **`aria-label`** provides context: "TypeScript code example" so AT users know what the block contains before reading it.

**`tabindex="0"`** **on** **`<pre>`** allows keyboard users to focus the block and scroll it with arrow keys (for horizontally-overflowing code).

**Copy button:** `aria-label="Copy code"`. The "Copied!" feedback should be announced. Either the button text changes (AT re-reads on next interaction) or use a live region.

**Line numbers:** must be excluded from copy. Use `user-select: none` in CSS AND `aria-hidden="true"` or CSS `::before` pseudo-elements (which are never in the accessible text content).

**Syntax highlighting spans:** the colored `<span>` elements used for highlighting are transparent to AT. Screen readers read the text content regardless of wrapping spans. No ARIA needed.

**High contrast mode:** syntax colors may be overridden by the user's system colors. The code should remain readable with `forced-colors: active`. Test in Windows High Contrast mode.

**Contrast:** syntax colors vs. background must pass WCAG AA (4.5:1 for normal text). This is the most common failure: dim comment colors or low-contrast keywords on dark backgrounds. Test every token color.

**Never wrap code lines.** Wrapping breaks meaning (indentation, alignment, string boundaries). Always allow horizontal scroll instead. This is a readability and semantic choice, not just aesthetic.

**Font: always monospace.** Proportional fonts break code alignment and make indentation ambiguous.

**Don't use** **`aria-label`** **on the** **`<pre>`** **itself** (it would override the actual code text for AT). The figure label provides the context; the code speaks for itself.
* * *

## 11\. Innovative / Emerging Ideas
*   **Shiki server-side rendering:** highlight at build time (zero client JS for highlighting). The standard for modern docs sites (Astro, Next.js).
*   **Diff annotations:** show added/removed lines with git-style +/- indicators.
*   **Code folding:** collapse regions (functions, classes) within a read-only block.
*   **One-click "Open in CodeSandbox/StackBlitz":** button that opens the code in an online IDE.
*   **AI-powered explanations:** hover a line and an AI tooltip explains what it does.
*   **Animated code walkthroughs:** lines highlight sequentially as a narration explains them (presentation mode).
* * *

## 12\. Conversion / UX Killers
*   **No copy button:** users must manually select, often accidentally including line numbers or surrounding text.
*   **Code wraps instead of scrolling:** wrapped code is unreadable. NEVER wrap code.
*   **Line numbers included in copy:** selecting text grabs the numbers too, breaking the pasted code.
*   **Insufficient contrast:** light gray comments on a light background, or dim keywords on a dark background. Every syntax color must pass 4.5:1.
*   **No language indicator:** users don't know what language they're looking at.
*   **Tiny font:** code under 12px is hard to read. Minimum 12px, prefer 13-14px.
*   **No horizontal scroll indicator:** code extends off-screen with no visual cue that there's more.
* * *

## 13\. Advanced Patterns
### Server-side highlighting with Shiki

```typescript
import { getHighlighter } from 'shiki';

const highlighter = await getHighlighter({ theme: 'one-dark-pro', langs: ['typescript', 'css', 'html'] });

function highlightCode(code: string, lang: string): string {
  return highlighter.codeToHtml(code, { lang });
  // Returns complete <pre><code> with colored spans. Zero client JS needed.
}
```

### Collapsible long blocks

```typescript
function CollapsibleCodeBlock({ code, maxLines = 15, ...props }: CodeBlockProps & { maxLines?: number }) {
  const [expanded, setExpanded] = useState(false);
  const lines = code.split('
');
  const needsCollapse = lines.length > maxLines;
  const displayCode = expanded ? code : lines.slice(0, maxLines).join('
');

  return (
    <div className="code-block-wrapper">
      <CodeBlock code={displayCode} {...props} />
      {needsCollapse && (
        <button className="code-block__expand" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : `Show ${lines.length - maxLines} more lines`}
        </button>
      )}
    </div>
  );
}
```

* * *

## 14\. Performance & Bundle Cost
*   **Shiki at build time: zero runtime cost.** Pre-highlighted HTML served statically.
*   **Prism.js: ~5KB core + ~1-2KB per language.** Load only needed languages.
*   **highlight.js: ~30KB for common languages.** Heavier than Prism.
*   **Long code blocks:** if the page has 50 code blocks, lazy-highlight below-the-fold blocks with IntersectionObserver.
*   **Font loading:** monospace fonts (Fira Code, JetBrains Mono) add 50-100KB. Consider system monospace (`'SF Mono', 'Cascadia Code', monospace`) for zero cost.
* * *

## 15\. Security
*   **XSS in code content.** If displaying user-submitted code, escape HTML entities (`<`, `>`, `&`, `"`). Syntax highlighters like Shiki escape by default (they parse and re-render, not innerHTML), but if you build the `<code>` content manually, escape it yourself and never use `innerHTML` with unescaped user content.
*   **Copy button clipboard API** requires secure context (HTTPS). Provide a fallback for HTTP.
*   **Don't execute displayed code.** A code block showing `<script>alert('xss')</script>` must be displayed as text, never rendered as HTML.
*   **Sandbox any "Run" button.** If the block executes user-submitted code, sandbox it (iframe sandbox, Web Workers, or a server-side runner). Never `eval()` user code on the main thread.
* * *

## 16\. Senior-Level Checklist
- [ ] Semantic `<pre><code>` structure
- [ ] `<figure>` wrapper with `aria-label` (language + context)
- [ ] `tabindex="0"` on `<pre>` for keyboard scrolling
- [ ] Copy button with accessible label and success feedback
- [ ] Code NEVER wraps (horizontal scroll always)
- [ ] Line numbers excluded from copy (`user-select: none` or `::before`)
- [ ] Monospace font (system or loaded)
- [ ] Syntax colors pass 4.5:1 contrast against background
- [ ] Horizontal scroll indicator (shadow or scrollbar visible)
- [ ] Language/filename displayed in header
- [ ] Long blocks: max-height with scroll or collapse
- [ ] `forced-colors` / high-contrast mode tested
- [ ] Server-side highlighting preferred (zero client JS)
- [ ] Code content HTML-escaped (no XSS)
* * *

## 17\. Visual Styles
The same code block rendered across eleven aesthetics. The style is skin; `<pre><code>` semantics, `tabindex`, copy, and contrast requirements never change.

**Flat:** solid dark background, 1px border, standard radius. Clean syntax colors on a near-black field. The VS Code/GitHub default. Most common, most readable.

**Material:** surface-container-highest background. Header has elevation. Copy button follows M3 icon-button spec. Syntax colors use M3 tonal palette.

**Glassmorphism:** frosted glass code container over blurred page content. Light 1px border. DANGEROUS for contrast. Only viable if the blur creates a consistent dark background. Strongly recommend a solid backing layer behind the glass.

**Liquid Glass (2026):** refractive container border with specular rim. Code sits on a solid dark backing behind the glass material. Header bar uses the glass treatment. Gorgeous but contrast is non-negotiable: the text layer must have a solid opaque background.

**Neumorphism:** code container recessed into the soft surface (inset shadow creating a "screen" or "terminal" look). Works surprisingly well for code since the inset metaphor matches a display/screen.

**Skeuomorphism:** terminal window chrome (title bar with red/yellow/green dots, or IDE-style tabs). The code area looks like an actual application window. High personality.

**Neo-Brutalism:** thick black border, hard offset shadow. Monospace pushed to bold weight. Header text is loud. Zero radius. The "zine" aesthetic applied to code.

**Claymorphism:** puffy rounded container with soft shadow. Code has generous padding and rounded corners. Feels approachable for beginner-focused documentation.

**Aurora/Gradient:** container border or header has a subtle animated gradient accent. Syntax colors are slightly more vibrant. Honor `prefers-reduced-motion` for the border animation.

**Minimal/Swiss:** no border, no background difference (or barely-there tint). Just the monospace text, a thin top rule, and whitespace. The code speaks for itself. Maximum typographic purity.

**UJG Brand:** Night background (`oklch(12%)`) with Eminence border. Header in surface-1 with Goldenrod language label. Syntax: keywords in Eminence-light, strings in Dark Green, functions in Goldenrod, comments in text-muted. Copy button accent in Goldenrod. The house default. (Alternate token mapping in use elsewhere: Goldenrod keywords, Spanish Orange strings, Platinum body text.)

Full style definitions on the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).