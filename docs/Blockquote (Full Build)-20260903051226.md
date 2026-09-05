# Blockquote (Full Build)

# The Blockquote: A Senior Engineer's Complete Breakdown
The styled pull-quote and citation block for editorial content. Here's everything from first principles to production code.

This doc follows the ⭐ COMPONENT ASSET TEMPLATE (follow this) ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).
* * *

## 1\. What a Blockquote Actually Is
A **blockquote** is a block-level element for quoting content from another source, or pulling out a notable passage for visual emphasis. It's both a semantic HTML element (`<blockquote>`) and a design component with distinct styling.

**Blockquote (this doc):** attributed quotes, pull-quotes, testimonials, citations.
**Inline quote (****`<q>`****):** short inline quotation with automatic quotation marks. Flows within a sentence.
**Callout/Admonition:** highlighted box for tips, warnings, notes. Similar shape but different semantic purpose (not a quote).
**Card:** generic container. A testimonial card IS a blockquote inside a card.
**Aside:** supplementary content. Can contain a blockquote but isn't one.
* * *

## 2\. Why It Matters
**Credibility.** Testimonials, expert quotes, and citations build trust. The visual treatment of a blockquote signals "this is someone else's words, and they matter."
**Visual rhythm.** In long-form content, a pull-quote breaks up text walls and gives the eye a resting point. It's a typographic tool for pacing.
**Attribution matters legally and ethically.** Quoting without attribution is plagiarism. The `<cite>` element within a blockquote provides the source.
**SEO/Structured data.** Proper `<blockquote>` with `<cite>` helps search engines understand attributed content and can appear in featured snippets.
* * *

## 3\. Anatomy
**Container:** the block with distinctive styling (left border accent, background tint, extra padding, or indentation).
**Quote text:** the quoted content itself. May be one sentence or several paragraphs.
**Quotation marks (optional):** large decorative open/close quotes (“ ”). Often as CSS pseudo-elements or absolute-positioned SVGs.
**Attribution line:** who said it. Structured as `<footer>` containing `<cite>` and optionally the speaker's role/context.
**Source (optional):** where it's from (book title, URL, publication). The `<cite>` element or `cite` attribute.
**Avatar/Photo (optional):** for testimonials, the person's photo beside the quote.
**Rating (optional):** for review testimonials, stars alongside the quote.
* * *

## 4\. Sizes / Scale

| Token | Font Size | Line Height | Padding | Max Width | Use |
| ---| ---| ---| ---| ---| --- |
| S | 0.9rem (body) | 1.6 | 16px | 55ch | Compact inline quotes |
| M | 1rem (body) | 1.6 | 20px 24px | 65ch | Default (articles, docs) |
| L | 1.25-1.5rem | 1.5 | 24px 32px | 50ch | Pull-quotes, hero quotes |
| XL | 2rem+ | 1.3 | 32px+ | 40ch | Display testimonials, splash quotes |

The larger the quote text, the shorter the max-width should be (fewer characters per line for readability at large sizes).
* * *

## 5\. States
Blockquote is **non-interactive** and **display-only.** It has no hover, focus, active, or disabled states.

Variations by context:
*   **In light mode:** dark text on a tinted background.
*   **In dark mode:** light text on a darker-than-background surface.
*   **Nested quote:** a blockquote within a blockquote (less common but valid). Styled distinctly (deeper indent, different accent).
* * *

## 6\. Types / Variants
**Left-border accent (default):** a 3-4px colored left border with optional background tint. The most common web blockquote style.
**Large pull-quote:** oversized text, often centered, with decorative quotation marks. Used in editorial/magazine layouts to pull a compelling sentence out of the body.
**Testimonial:** quote + attribution with avatar, name, title, and optionally a company logo. Used on landing pages and case studies.
**Centered/Display:** centered text, large, decorative. For hero sections or single impactful quotes.
**Nested:** a quote within a quote. Deeper indent, different accent color or style.
**With source link:** attribution includes a clickable link to the original source.
**Review/Rating:** testimonial with a star rating. Common for product pages.
**Epigraph:** a short quote at the beginning of a chapter/section. Typically italic, right-aligned attribution.
* * *

## 7\. When to Use (and When Not To)
**Use a blockquote when:**
*   Quoting another source (person, book, article)
*   Pulling out a notable passage for emphasis (pull-quote)
*   Displaying testimonials or reviews
*   Citing someone's words verbatim

**Use something else when:**
*   It's a tip, warning, or note → Callout/Admonition (not a quote)
*   It's a short inline reference → `<q>` element
*   It's your own text that you want to emphasize → use bold, heading, or a callout
*   The "quote" is actually paraphrased (not verbatim) → don't use blockquote semantics
* * *

## 8\. Across Design Systems
**HTML native:** `<blockquote>` with optional `cite` attribute (URL of source). Universally supported.
**Markdown:** `> Quote text` renders as `<blockquote>`.
**Tailwind Typography (****`prose`****):** styles blockquotes with left border and italic text by default.
**Material:** no dedicated blockquote component. Styled via typography.
**Apple HIG:** no explicit guidance; native apps rarely use blockquotes.
**Ant Design/Chakra/shadcn:** no dedicated blockquote component. Teams style it via global typography or custom classes.
**Editorial/CMS platforms:** WordPress, Ghost, and Medium all have rich blockquote styling with pull-quote variants.
* * *

## 9\. The Code
### 9.1 HTML (semantic)

```plain
<!-- Standard blockquote with attribution -->
<figure class="blockquote">
  <blockquote cite="https://source-url.com">
    <p>Design is not just what it looks like and feels like. Design is how it works.</p>
  </blockquote>
  <figcaption class="blockquote__attribution">
    — <cite>Steve Jobs</cite>, Apple Inc.
  </figcaption>
</figure>

<!-- Testimonial variant -->
<figure class="blockquote blockquote--testimonial">
  <blockquote>
    <p>Working with UJG transformed our digital presence. The systems thinking made everything click.</p>
  </blockquote>
  <figcaption class="blockquote__attribution">
    <img src="/avatar.jpg" alt="" class="blockquote__avatar" />
    <div>
      <cite class="blockquote__name">Sarah Chen</cite>
      <span class="blockquote__role">VP of Product, Acme Inc.</span>
    </div>
  </figcaption>
</figure>

<!-- Pull-quote (large, decorative) -->
<aside class="blockquote blockquote--pull" aria-label="Pull quote">
  <blockquote>
    <p>The best interface is no interface.</p>
  </blockquote>
</aside>
```

Key semantic decisions:
*   **`<figure>`** **+** **`<figcaption>`** wraps the quote and its attribution. More semantically rich than just `<blockquote>` alone.
*   **`<blockquote cite="URL">`** the `cite` attribute holds the source URL (machine-readable, not displayed).
*   **`<cite>`** in the attribution is the name of the work or person being quoted.
*   **`<aside>`** for pull-quotes (they're supplemental content pulled from the main flow).
*   **The dash (—) before the attribution** is a typographic convention, not part of the semantic markup.
### 9.2 CSS

```css
.blockquote {
  margin: 32px 0;
  max-width: 65ch;
}

/* Default: left border accent */
.blockquote blockquote {
  margin: 0;
  padding: 16px 0 16px 20px;
  border-left: 4px solid var(--quote-accent, oklch(42% 0.14 305));
  font-style: italic;
}

.blockquote blockquote p {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0;
}

.blockquote__attribution {
  margin-top: 12px;
  padding-left: 24px;
  font-size: 0.85rem;
  color: var(--text-secondary, oklch(70% 0.01 305));
  font-style: normal;
}

.blockquote__attribution cite {
  font-style: normal;
  font-weight: 600;
}

/* Pull-quote variant (large, centered) */
.blockquote--pull {
  text-align: center;
  max-width: 50ch;
  margin-left: auto;
  margin-right: auto;
}

.blockquote--pull blockquote {
  border-left: none;
  padding: 0;
  font-style: normal;
  position: relative;
}

.blockquote--pull blockquote p {
  font-family: 'Methanerse', serif; /* UJG display font */
  font-size: 1.5rem;
  line-height: 1.4;
  font-weight: 500;
}

.blockquote--pull blockquote::before {
  content: '\201C'; /* opening curly quote */
  display: block;
  font-size: 4rem;
  line-height: 1;
  color: var(--quote-accent, oklch(42% 0.14 305));
  opacity: 0.3;
  margin-bottom: -16px;
}

/* Testimonial variant */
.blockquote--testimonial blockquote {
  border-left: none;
  padding: 20px;
  background: var(--quote-bg, oklch(18% 0.02 305));
  border-radius: 12px;
  font-style: normal;
}

.blockquote--testimonial .blockquote__attribution {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 0;
}

.blockquote__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.blockquote__name {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
}

.blockquote__role {
  display: block;
  font-size: 0.78rem;
  color: var(--text-muted);
}
```

### 9.3 React + TypeScript

```typescript
import { ReactNode } from 'react';

interface BlockquoteProps {
  children: ReactNode;
  attribution?: string;
  cite?: string;
  source?: string;
  variant?: 'default' | 'pull' | 'testimonial';
  avatar?: string;
  name?: string;
  role?: string;
}

export function Blockquote({ children, attribution, cite, source, variant = 'default', avatar, name, role: personRole }: BlockquoteProps) {
  const Tag = variant === 'pull' ? 'aside' : 'figure';

  return (
    <Tag className={`blockquote blockquote--${variant}`}
         aria-label={variant === 'pull' ? 'Pull quote' : undefined}>
      <blockquote cite={source}>
        {typeof children === 'string' ? <p>{children}</p> : children}
      </blockquote>
      {(attribution || name) && (
        <figcaption className="blockquote__attribution">
          {avatar && <img src={avatar} alt="" className="blockquote__avatar" />}
          <div>
            {name ? (
              <>
                <cite className="blockquote__name">{name}</cite>
                {personRole && <span className="blockquote__role">{personRole}</span>}
              </>
            ) : (
              <>— <cite>{attribution}</cite>{cite && `, ${cite}`}</>
            )}
          </div>
        </figcaption>
      )}
    </Tag>
  );
}

// Usage:
<Blockquote attribution="Steve Jobs" cite="Apple Inc.">
  Design is not just what it looks like. Design is how it works.
</Blockquote>

<Blockquote variant="testimonial" name="Sarah Chen" role="VP Product, Acme" avatar="/sarah.jpg">
  Working with UJG transformed our digital presence.
</Blockquote>

<Blockquote variant="pull">
  The best interface is no interface.
</Blockquote>
```

### 9.4 Markdown rendering
In MDX/Markdown contexts, blockquotes render from `>` syntax. To add attribution, common patterns:

```markdown
> Design is how it works.
>
> — Steve Jobs
```

Or with a custom MDX component:

```plain
<Blockquote attribution="Steve Jobs">
  Design is how it works.
</Blockquote>
```

### 9.5 Tailwind CSS

```plain
<!-- Default (left border accent) -->
<figure class="my-8 max-w-[65ch]">
  <blockquote class="pl-5 border-l-4 border-purple-600 italic text-gray-200 leading-relaxed">
    <p>Design is not just what it looks like and feels like. Design is how it works.</p>
  </blockquote>
  <figcaption class="mt-3 pl-6 text-sm text-gray-400">
    — <cite class="not-italic font-semibold text-gray-300">Steve Jobs</cite>, Apple Inc.
  </figcaption>
</figure>

<!-- Pull-quote (large, centered) -->
<aside class="my-12 max-w-[50ch] mx-auto text-center" aria-label="Pull quote">
  <blockquote class="relative">
    <span class="block text-6xl leading-none text-purple-600/30 mb-[-12px]" aria-hidden="true">"</span>
    <p class="text-xl font-medium text-gray-100 leading-relaxed">The best interface is no interface.</p>
  </blockquote>
</aside>

<!-- Testimonial -->
<figure class="my-8 max-w-[65ch]">
  <blockquote class="p-5 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 text-sm leading-relaxed not-italic">
    <p>Working with UJG transformed our digital presence. The systems thinking made everything click.</p>
  </blockquote>
  <figcaption class="mt-4 flex items-center gap-3">
    <img src="/sarah.jpg" alt="" class="w-10 h-10 rounded-full" />
    <div>
      <cite class="block text-sm font-semibold text-gray-200 not-italic">Sarah Chen</cite>
      <span class="text-xs text-gray-500">VP of Product, Acme Inc.</span>
    </div>
  </figcaption>
</figure>
```

### 9.6 shadcn/ui

```typescript
// components/ui/blockquote.tsx
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface BlockquoteProps {
  children: React.ReactNode;
  attribution?: string;
  cite?: string;
  variant?: "default" | "pull" | "testimonial";
  avatar?: string;
  name?: string;
  role?: string;
  className?: string;
}

export function Blockquote({ children, attribution, cite, variant = "default", avatar, name, role: personRole, className }: BlockquoteProps) {
  const Tag = variant === "pull" ? "aside" : "figure";

  return (
    <Tag className={cn("my-8", variant === "pull" && "text-center max-w-[50ch] mx-auto my-12", className)}
         aria-label={variant === "pull" ? "Pull quote" : undefined}>
      <blockquote className={cn(
        variant === "default" && "pl-5 border-l-4 border-primary italic text-foreground leading-relaxed",
        variant === "pull" && "relative",
        variant === "testimonial" && "p-5 rounded-xl bg-muted border text-foreground text-sm leading-relaxed not-italic"
      )}>
        {variant === "pull" && <span className="block text-6xl leading-none text-primary/30 mb-[-12px]" aria-hidden="true">"</span>}
        {typeof children === "string" ? <p className={cn(variant === "pull" && "text-xl font-medium")}>{children}</p> : children}
      </blockquote>
      {(attribution || name) && (
        <figcaption className={cn("mt-3", variant === "testimonial" && "mt-4 flex items-center gap-3", variant === "default" && "pl-6 text-sm text-muted-foreground")}>
          {avatar && <Avatar className="h-10 w-10"><AvatarImage src={avatar} /><AvatarFallback>{name?.[0]}</AvatarFallback></Avatar>}
          <div>
            {name ? (
              <><cite className="block text-sm font-semibold not-italic">{name}</cite>
              {personRole && <span className="text-xs text-muted-foreground">{personRole}</span>}</>
            ) : (<>— <cite className="not-italic font-semibold">{attribution}</cite>{cite && `, ${cite}`}</>)}
          </div>
        </figcaption>
      )}
    </Tag>
  );
}
```

### 9.7 Vue 3

```plain
<script setup lang="ts">
defineProps<{
  attribution?: string; cite?: string; source?: string;
  variant?: 'default' | 'pull' | 'testimonial';
  avatar?: string; name?: string; role?: string;
}>();
</script>

<template>
  <component :is="variant === 'pull' ? 'aside' : 'figure'"
             :class="['blockquote', `blockquote--${variant ?? 'default'}`]"
             :aria-label="variant === 'pull' ? 'Pull quote' : undefined">
    <blockquote :cite="source">
      <slot />
    </blockquote>
    <figcaption v-if="attribution || name" class="blockquote__attribution">
      <img v-if="avatar" :src="avatar" alt="" class="blockquote__avatar" />
      <div>
        <template v-if="name">
          <cite class="blockquote__name">{{ name }}</cite>
          <span v-if="role" class="blockquote__role">{{ role }}</span>
        </template>
        <template v-else>— <cite>{{ attribution }}</cite><template v-if="cite">, {{ cite }}</template></template>
      </div>
    </figcaption>
  </component>
</template>
```

### 9.8 Svelte

```plain
<script lang="ts">
  export let attribution: string | undefined = undefined;
  export let cite: string | undefined = undefined;
  export let source: string | undefined = undefined;
  export let variant: 'default' | 'pull' | 'testimonial' = 'default';
  export let avatar: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let role: string | undefined = undefined;
</script>

<svelte:element this={variant === 'pull' ? 'aside' : 'figure'}
  class="blockquote blockquote--{variant}" aria-label={variant === 'pull' ? 'Pull quote' : undefined}>
  <blockquote cite={source}><slot /></blockquote>
  {#if attribution || name}
    <figcaption class="blockquote__attribution">
      {#if avatar}<img src={avatar} alt="" class="blockquote__avatar" />{/if}
      <div>
        {#if name}
          <cite class="blockquote__name">{name}</cite>
          {#if role}<span class="blockquote__role">{role}</span>{/if}
        {:else}
          — <cite>{attribution}</cite>{#if cite}, {cite}{/if}
        {/if}
      </div>
    </figcaption>
  {/if}
</svelte:element>
```

### 9.9 SwiftUI

```swift
import SwiftUI

struct BlockquoteView: View {
    let text: String
    var attribution: String? = nil
    var role: String? = nil
    var avatar: String? = nil
    var variant: Variant = .default

    enum Variant { case `default`, pull, testimonial }

    var body: some View {
        VStack(alignment: variant == .pull ? .center : .leading, spacing: 12) {
            switch variant {
            case .default:
                HStack(alignment: .top, spacing: 0) {
                    Rectangle().fill(Color.purple).frame(width: 4)
                    Text(text).italic().padding(.leading, 16).foregroundColor(.primary).lineSpacing(4)
                }
            case .pull:
                Text("\u{201C}").font(.system(size: 48)).foregroundColor(.purple.opacity(0.3))
                Text(text).font(.title3).fontWeight(.medium).multilineTextAlignment(.center).lineSpacing(4)
            case .testimonial:
                Text(text).padding(16).background(RoundedRectangle(cornerRadius: 12).fill(Color(.systemGray6)))
                    .foregroundColor(.primary).lineSpacing(4)
            }

            if let attribution {
                HStack(spacing: 12) {
                    if let avatar {
                        AsyncImage(url: URL(string: avatar)) { img in img.resizable() } placeholder: { Circle().fill(.gray) }
                            .frame(width: 40, height: 40).clipShape(Circle())
                    }
                    VStack(alignment: .leading) {
                        Text(attribution).font(.subheadline).fontWeight(.semibold)
                        if let role { Text(role).font(.caption).foregroundColor(.secondary) }
                    }
                }
            }
        }
        .frame(maxWidth: variant == .pull ? 400 : 550, alignment: variant == .pull ? .center : .leading)
    }
}
```

### 9.10 Jetpack Compose

```kotlin
@Composable
fun BlockquoteWidget(
    text: String,
    attribution: String? = null,
    role: String? = null,
    avatarUrl: String? = null,
    variant: BlockquoteVariant = BlockquoteVariant.Default
) {
    Column(modifier = Modifier.padding(vertical = 16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        when (variant) {
            BlockquoteVariant.Default -> {
                Row {
                    Box(modifier = Modifier.width(4.dp).fillMaxHeight().background(Color(0xFF5F2C82)))
                    Text(text, modifier = Modifier.padding(start = 16.dp), fontStyle = FontStyle.Italic,
                         style = MaterialTheme.typography.bodyLarge, lineHeight = 28.sp)
                }
            }
            BlockquoteVariant.Pull -> {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Text("“", fontSize = 48.sp, color = Color(0xFF5F2C82).copy(alpha = 0.3f))
                    Text(text, style = MaterialTheme.typography.titleMedium, textAlign = TextAlign.Center, lineHeight = 28.sp)
                }
            }
            BlockquoteVariant.Testimonial -> {
                Surface(shape = RoundedCornerShape(12.dp), color = MaterialTheme.colorScheme.surfaceVariant) {
                    Text(text, modifier = Modifier.padding(16.dp), style = MaterialTheme.typography.bodyMedium, lineHeight = 24.sp)
                }
            }
        }

        attribution?.let { attr ->
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                avatarUrl?.let { AsyncImage(model = it, contentDescription = null, modifier = Modifier.size(40.dp).clip(CircleShape)) }
                Column {
                    Text(attr, style = MaterialTheme.typography.labelLarge)
                    role?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
                }
            }
        }
    }
}

enum class BlockquoteVariant { Default, Pull, Testimonial }
```

### 9.11 Flutter

```dart
import 'package:flutter/material.dart';

enum BlockquoteVariant { standard, pull, testimonial }

class BlockquoteWidget extends StatelessWidget {
  final String text;
  final String? attribution;
  final String? role;
  final String? avatarUrl;
  final BlockquoteVariant variant;

  const BlockquoteWidget({
    super.key, required this.text, this.attribution, this.role, this.avatarUrl,
    this.variant = BlockquoteVariant.standard,
  });

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: variant == BlockquoteVariant.pull ? CrossAxisAlignment.center : CrossAxisAlignment.start, children: [
      _buildQuote(context),
      if (attribution != null) ...[
        const SizedBox(height: 12),
        _buildAttribution(context),
      ],
    ]);
  }

  Widget _buildQuote(BuildContext context) {
    switch (variant) {
      case BlockquoteVariant.standard:
        return IntrinsicHeight(child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Container(width: 4, decoration: BoxDecoration(color: const Color(0xFF5F2C82), borderRadius: BorderRadius.circular(2))),
          const SizedBox(width: 16),
          Expanded(child: Text(text, style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontStyle: FontStyle.italic, height: 1.6))),
        ]));
      case BlockquoteVariant.pull:
        return Column(children: [
          Text('"', style: TextStyle(fontSize: 48, color: const Color(0xFF5F2C82).withOpacity(0.3), height: 1)),
          Text(text, style: Theme.of(context).textTheme.titleMedium?.copyWith(height: 1.5), textAlign: TextAlign.center),
        ]);
      case BlockquoteVariant.testimonial:
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(12)),
          child: Text(text, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.6)),
        );
    }
  }

  Widget _buildAttribution(BuildContext context) {
    return Row(children: [
      if (avatarUrl != null) ...[
        CircleAvatar(radius: 20, backgroundImage: NetworkImage(avatarUrl!)),
        const SizedBox(width: 12),
      ],
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(attribution!, style: Theme.of(context).textTheme.labelLarge),
        if (role != null) Text(role!, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant)),
      ]),
    ]);
  }
}
```

### 9.12 Testing

```typescript
describe("Blockquote", () => {
  it("renders semantic blockquote element", () => {
    const { container } = render(<Blockquote>Quote text</Blockquote>);
    expect(container.querySelector('blockquote')).toBeInTheDocument();
  });

  it("includes cite element for attribution", () => {
    const { container } = render(<Blockquote attribution="Steve Jobs">Quote</Blockquote>);
    expect(container.querySelector('cite')).toHaveTextContent('Steve Jobs');
  });

  it("uses figure + figcaption for structured quote", () => {
    const { container } = render(<Blockquote attribution="Author">Quote</Blockquote>);
    expect(container.querySelector('figure')).toBeInTheDocument();
    expect(container.querySelector('figcaption')).toBeInTheDocument();
  });

  it("pull-quote uses aside element", () => {
    const { container } = render(<Blockquote variant="pull">Quote</Blockquote>);
    expect(container.querySelector('aside')).toBeInTheDocument();
  });

  it("testimonial shows avatar", () => {
    render(<Blockquote variant="testimonial" name="Sarah" avatar="/sarah.jpg">Quote</Blockquote>);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/sarah.jpg');
  });
});
```

* * *

## 10\. Accessibility
**`<blockquote>`** **is natively semantic.** Screen readers announce "blockquote" when entering the element and "end of blockquote" when leaving. No ARIA needed for the basic case.

**`<figure>`** **+** **`<figcaption>`** adds structure: AT can associate the attribution with the quote.

**`<cite>`** is semantic for the source name. AT reads it as regular text (no special announcement), but it provides document semantics for tools and crawlers.

**`cite`** **attribute** on `<blockquote>` holds the source URL. Not displayed visually but available to tools, search engines, and user scripts.

**Decorative quotation marks:** use CSS `::before` pseudo-elements (automatically hidden from AT) or `aria-hidden="true"` on visual-only quote marks. Don't duplicate the real quote content.

**Pull-quotes as** **`<aside>`****\*\*\*\*\*\*\*\*:** signals to AT that this is supplemental content. Users can skip it without losing main flow context.

**Avatar images:** use empty `alt=""` (decorative). The person's name is in the citation text; the photo adds no information AT needs.

**Nested blockquotes:** AT announces the nesting level. Style distinctly so sighted users also perceive the nesting.
* * *

## 11\. Innovative / Emerging Ideas
*   **Animated pull-quotes:** quote text reveals word-by-word on scroll (editorial storytelling). Honor `prefers-reduced-motion`.
*   **Interactive testimonials:** carousel of quotes with avatar, rating, and navigation. See the Carousel doc.
*   **AI-extracted pull-quotes:** automatically surface the most quotable sentence from an article.
*   **Social-share pull-quotes:** clicking a pull-quote opens a tweet/share dialog with the quote text pre-filled.
*   **Quote verification link:** inline badge showing the quote is verified/sourced (trust signal).
*   **Citation validation:** link the `cite` URL and show a preview of the source.
*   **Multi-language quotes:** show original language with translation toggle.
* * *

## 12\. Conversion / UX Killers
*   **No attribution:** quotes without a source feel untrustworthy. Always attribute.
*   **Fake testimonials:** users can tell. Use real names, real companies, real photos.
*   **Pull-quote that duplicates nearby text verbatim:** the reader just read the same sentence 2 lines ago. Pick a sentence from further away in the article, or don't use a pull-quote.
*   **Too many pull-quotes:** more than one per 500-800 words feels desperate. Use sparingly.
*   **Tiny text in a testimonial:** the quote should be prominent. Don't shrink it to fit more metadata.
*   **No visual distinction from body text:** a blockquote that looks identical to regular paragraphs. It should have clear visual differentiation (indent, border, tint, or size change).
* * *

## 13\. Advanced Patterns
### Testimonial carousel/grid
Multiple testimonials in a rotating carousel or a masonry grid. Each item is a `<Blockquote variant="testimonial">`. The carousel handles navigation; the blockquote handles semantics.
### Source-linked blockquote

```plain
<blockquote cite="https://source.com/article">
  <p>The quoted passage.</p>
</blockquote>
<figcaption>
  — Author Name, <a href="https://source.com/article"><cite>Article Title</cite></a>
</figcaption>
```

### Nested quotes

```plain
<blockquote>
  <p>She said, "The reviewer wrote:</p>
  <blockquote>
    <p>This product changed everything.</p>
  </blockquote>
  <p>And I agree."</p>
</blockquote>
```

Style nested quotes with reduced indent and a different accent color to distinguish levels.
* * *

## 14\. Performance & Bundle Cost
Nearly zero. A blockquote is pure HTML + CSS. No JavaScript needed. The only consideration is large testimonial images: use responsive `srcset` and `loading="lazy"`.
* * *

## 15\. Security
*   **XSS in user-submitted quotes/testimonials.** If quote content comes from a CMS or user input, sanitize HTML. A quote field that accepts raw HTML is an XSS vector.
*   **Attribution links:** if the `cite` attribute or attribution link comes from user input, validate the URL (no `javascript:` protocol).
* * *

## 16\. Senior-Level Checklist
- [ ] Semantic `<blockquote>` element (not a styled `<div>`)
- [ ] `<figure>` + `<figcaption>` for structured attribution
- [ ] `<cite>` on the source/author name
- [ ] `cite` attribute on `<blockquote>` for source URL (when available)
- [ ] Decorative quote marks via CSS pseudo-elements (invisible to AT)
- [ ] Pull-quotes use `<aside>` (supplemental content)
- [ ] Avatar images have empty `alt=""`
- [ ] Text contrast vs. tinted background ≥ 4.5:1
- [ ] Max-width for readability (50-65ch)
- [ ] Responsive: text size scales down on mobile, padding reduces
- [ ] Nested quotes styled distinctly from parent quotes
- [ ] Quote content sanitized if user-generated
- [ ] Brand typography applied (Methanerse for display quotes per UJG brand)
* * *

## 17\. Visual Styles
**Flat:** 4px left border in accent color, subtle background tint. Clean, universal. The web default.
**Material:** M3 surface-container tint, rounded corners, no border. Attribution uses M3 typography roles.
**Glassmorphism:** translucent quote card over blurred background. Quotation marks in frosted glass.
**Liquid Glass:** refractive quote container with specular left edge. Quote marks have a glass sheen.
**Neumorphism:** quote block inset into soft surface (recessed). Text appears engraved.
**Skeuomorphism:** old paper/parchment texture. Serif font for the quote. Realistic handwritten attribution. Decorative ornate quotation marks.
**Neo-Brutalism:** thick left border (6px+), hard offset shadow on the block, bold sans-serif quote text. High contrast, high personality.
**Claymorphism:** puffy rounded quote card. Soft inner glow. Friendly.
**Aurora/Gradient:** left border is an animated gradient. Quote marks pulse with color. Honor reduced-motion.
**Minimal/Swiss:** no border, no background. Just oversized opening quotation mark (serif) and the quote text in a slightly larger size with generous whitespace. The attribution is small caps. Maximum typographic restraint.
**UJG Brand:** Goldenrod 4px left border on Night/Eminence tinted background. Quote text in Methanerse (display) or Urbanist (body). Attribution in Alister signature variant at 25% tracking. The house default.

Full style definitions on the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).