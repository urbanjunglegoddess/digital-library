# Video Player (Full Build)

# The Video Player: A Senior Engineer's Complete Breakdown
The media playback component with controls, progress, and accessibility. Here's everything from first principles to production code.

**Try it live:** the interactive playground (built in a later pass) will let you configure controls, captions, quality, and playback states, then output code for every target.

**Audit a video player:** the companion audit checks keyboard controls, caption support, focus management, contrast on overlays, and ARIA states, then exports a client-ready report.

This doc follows the ⭐ COMPONENT ASSET TEMPLATE (follow this) ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).
* * *

## 1\. What a Video Player Actually Is
A **video player** is an interactive component that plays video content with user controls for playback, seeking, volume, fullscreen, and captions. It wraps the HTML `<video>` element with a custom control UI.

The distinctions:

**Video Player (this doc):** interactive video with custom controls. Play, pause, seek, volume, fullscreen, captions.
**`<video controls>`****\*\*\*\*\*\*\*\*:** the native HTML element with browser-default controls. Works but is unstyled, inconsistent cross-browser, and can't be branded.
**Background video:** looping, muted, no controls. Decorative. A simpler pattern (just `<video autoplay muted loop>`).
**Audio player:** audio-only. Similar controls (play, seek, volume) but no visual stage. See the Audio component doc.
**Video embed (iframe):** YouTube/Vimeo embed. Third-party player, limited control.

Why custom: native `<video controls>` looks different in every browser, can't be styled, doesn't match your design system, and has limited feature extensibility (no quality picker, no chapters, no branded controls).
* * *

## 2\. Why It Matters
**Video is primary content in 2026.** Product demos, course content, marketing heroes, documentation walkthroughs. If your video player is hard to use, users don't watch your content.

**Accessibility is legally required and often missing.** Captions, keyboard controls, screen-reader announcements. Most custom video players fail all three. The native player handles them; custom players must re-implement them.

**Mobile UX.** Touch targets for controls, fullscreen behavior, picture-in-picture. A desktop-designed player that's unusable on mobile fails half your audience.
* * *

## 3\. Anatomy
**Video element:** the `<video>` rendering the content. The visual stage.
**Poster frame:** the still image shown before playback starts.
**Control bar:** the overlay at the bottom containing all controls. Appears on hover/tap, auto-hides after inactivity.
**Play/Pause button:** the primary control. Often also clickable on the video itself.
**Progress bar/Seek bar:** a slider showing current position and allowing seeking. Shows buffered range and current time.
**Time display:** current time / total duration ("2:34 / 10:15").
**Volume control:** mute button + volume slider.
**Fullscreen button:** toggle fullscreen mode.
**Captions/Subtitles toggle:** show/hide subtitle tracks.
**Settings menu (optional):** quality selection (720p/1080p), playback speed.
**PiP button (optional):** picture-in-picture mode.
**Thumbnail preview (optional):** shows a frame preview on seek-bar hover.
**Loading spinner:** shown during buffering.
**Big play button:** large centered play button on the poster state.
* * *

## 4\. Sizes / Scale

| Token | Aspect Ratio | Control Bar H | Button Size | Use |
| ---| ---| ---| ---| --- |
| S | 16:9 | 36px | 28px | Inline/embedded, sidebar |
| M | 16:9 | 44px | 36px | Default |
| L | 16:9 | 52px | 44px | Hero/featured, fullscreen |

Width: 100% parent (fluid). Height: determined by aspect ratio.

Common aspect ratios: 16:9 (standard), 4:3 (legacy), 9:16 (vertical/mobile), 1:1 (social).

The big play button: 56-80px diameter, centered on the poster.
* * *

## 5\. States
**Idle (poster):** video hasn't started. Poster frame visible. Big play button centered.
**Loading/Buffering:** video is loading or rebuffering. Spinner overlay. Controls may be disabled.
**Playing:** video is playing. Control bar auto-hides after 3s of no interaction. Cursor hides.
**Paused:** video is paused. Control bar remains visible. Big play button may reappear.
**Seeking:** user is dragging the seek bar. Preview thumbnail visible. Time updates in real-time.
**Buffering (during playback):** video paused due to buffer underrun. Spinner visible. Resumes automatically.
**Ended:** video reached the end. Shows replay button, or advances to next in playlist.
**Error:** video can't load. Error message with retry button.
**Fullscreen:** video fills the viewport. Controls adapt to larger size.
**PiP:** video in a floating mini-player. Main area shows a placeholder.
**Captions active:** subtitle text overlaid on the video.
**Controls visible:** hover/tap triggered. Control bar slides up.
**Controls hidden:** auto-hidden after inactivity. Only video visible.
* * *

## 6\. Types / Variants
**Standard player:** full controls, single video.
**Minimal player:** play/pause + progress only. Clean, simple.
**Autoplay (muted):** starts playing muted. Common for hero sections and social feeds. User can unmute.
**Background video:** no controls, looping, muted. Purely decorative.
**Playlist player:** multiple videos in sequence with next/previous and a playlist sidebar.
**Live stream:** no seek bar (or limited DVR seek). Live indicator. Chat sidebar.
**Inline (feed):** video within a scrollable feed. Autoplay on scroll-into-view, pause on scroll-out. Muted by default.
**Modal/Lightbox:** video opens in a centered overlay. Common for thumbnails that expand to a full player.
**Course/Chapter player:** progress tracking, chapter markers on the seek bar, next-lesson button.
* * *

## 7\. When to Use (and When Not To)
**Use a custom video player when:**
*   You need branded controls matching your design system
*   You need features beyond native (quality selector, chapters, analytics)
*   Consistent cross-browser appearance matters
*   Captions and accessibility need to be controlled precisely

**Use native** **`<video controls>`** **when:**
*   Simple one-off video embed
*   Accessibility is the top priority and you can't invest in a custom player (native is accessible by default)
*   No custom features needed

**Use an iframe embed (YouTube/Vimeo) when:**
*   You don't host the video
*   You want their CDN, adaptive streaming, and analytics
*   You don't need deep control over the player UI
* * *

## 8\. Across Design Systems
**No design system ships a full video player.** It's too complex and domain-specific. Teams use libraries.

**Video.js:** the open-source standard. Plugin architecture, skinnable, accessibility features, HLS/DASH support.
**Plyr:** lightweight, beautiful, accessible. Good for simpler needs.
**Vidstack:** modern React/Web Component video player. TypeScript, accessible, customizable.
**Mux Player:** Mux's hosted player component with analytics built in.
**Shaka Player (Google):** for DASH/HLS adaptive streaming.
**hls.js:** HLS playback in browsers that don't support it natively.

**Apple:** `AVPlayerViewController` (native). Full system player with PiP, AirPlay, captions.
**Android:** `ExoPlayer` / Media3. The standard for Android video.
* * *

## 9\. The Code
### 9.1 HTML (semantic structure)

```html
<div class="video-player" role="region" aria-label="Video player">
  <video class="video-player__video" preload="metadata" poster="/poster.jpg">
    <source src="/video.mp4" type="video/mp4" />
    <track kind="captions" src="/captions-en.vtt" srclang="en" label="English" default />
    <track kind="captions" src="/captions-es.vtt" srclang="es" label="Español" />
  </video>

  <!-- Big play button (poster state) -->
  <button class="video-player__big-play" aria-label="Play video">
    <svg aria-hidden="true"><!-- play icon --></svg>
  </button>

  <!-- Loading spinner -->
  <div class="video-player__loader" hidden aria-hidden="true">
    <svg><!-- spinner --></svg>
  </div>

  <!-- Control bar -->
  <div class="video-player__controls" role="toolbar" aria-label="Video controls">
    <button type="button" class="vp-btn" aria-label="Play" aria-pressed="false">
      <svg aria-hidden="true"><!-- play/pause icon --></svg>
    </button>

    <div class="vp-time">2:34 / 10:15</div>

    <div class="vp-progress" role="slider" tabindex="0"
         aria-label="Seek" aria-valuemin="0" aria-valuemax="615"
         aria-valuenow="154" aria-valuetext="2 minutes 34 seconds of 10 minutes 15 seconds">
      <div class="vp-progress__buffered" style="width: 45%"></div>
      <div class="vp-progress__filled" style="width: 25%"></div>
      <div class="vp-progress__thumb" style="left: 25%"></div>
    </div>

    <button type="button" class="vp-btn" aria-label="Mute">
      <svg aria-hidden="true"><!-- volume icon --></svg>
    </button>

    <div class="vp-volume" role="slider" tabindex="0"
         aria-label="Volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="80">
      <div class="vp-volume__fill" style="width: 80%"></div>
    </div>

    <button type="button" class="vp-btn" aria-label="Toggle captions" aria-pressed="true">
      <svg aria-hidden="true"><!-- CC icon --></svg>
    </button>

    <button type="button" class="vp-btn" aria-label="Fullscreen">
      <svg aria-hidden="true"><!-- fullscreen icon --></svg>
    </button>
  </div>
</div>
```

Key HTML decisions:
*   **`role="region"`** **with** **`aria-label`** on the outer container. Provides a landmark for AT.
*   **`<track>`** elements for captions. Multiple languages.
*   **Control bar as** **`role="toolbar"`** enables the toolbar keyboard pattern (arrow keys between controls).
*   **Seek bar as** **`role="slider"`** with `aria-valuemin/max/now/text`. The `aria-valuetext` provides human-readable time.
*   **Volume as** **`role="slider"`** with percentage value.
*   **Play/Pause uses** **`aria-label`** that updates dynamically ("Play" vs "Pause").
*   **Captions toggle uses** **`aria-pressed`** (it's a toggle button).
### 9.2 CSS (key parts)

```css
.video-player {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.video-player__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.video-player__controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(transparent, oklch(0% 0 0 / 0.7));
  opacity: 0;
  transition: opacity 0.3s;
}

.video-player:hover .video-player__controls,
.video-player:focus-within .video-player__controls,
.video-player.is-paused .video-player__controls {
  opacity: 1;
}

.vp-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #fff;
  cursor: pointer;
}

.vp-btn:hover { background: oklch(100% 0 0 / 0.1); }
.vp-btn:focus-visible { outline: 2px solid oklch(78% 0.135 82); outline-offset: 2px; }

.vp-progress {
  flex: 1;
  height: 4px;
  background: oklch(100% 0 0 / 0.2);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.vp-progress__buffered {
  position: absolute; top: 0; left: 0; height: 100%;
  background: oklch(100% 0 0 / 0.3);
  border-radius: inherit;
}

.vp-progress__filled {
  position: absolute; top: 0; left: 0; height: 100%;
  background: oklch(78% 0.135 82);
  border-radius: inherit;
}

.vp-progress__thumb {
  position: absolute; top: 50%; transform: translate(-50%, -50%);
  width: 12px; height: 12px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px oklch(0% 0 0 / 0.3);
  opacity: 0;
  transition: opacity 0.15s;
}

.vp-progress:hover .vp-progress__thumb,
.vp-progress:focus-visible .vp-progress__thumb {
  opacity: 1;
}

.video-player__big-play {
  position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 64px; height: 64px;
  border-radius: 50%;
  background: oklch(0% 0 0 / 0.6);
  border: none;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.video-player__big-play:hover { background: oklch(0% 0 0 / 0.8); transform: translate(-50%, -50%) scale(1.1); }
```

### 9.3 JavaScript (core player logic)

```javascript
class VideoPlayer {
  constructor(container) {
    this.container = container;
    this.video = container.querySelector('video');
    this.playBtn = container.querySelector('[aria-label="Play"]');
    this.bigPlay = container.querySelector('.video-player__big-play');
    this.progress = container.querySelector('.vp-progress');
    this.filled = container.querySelector('.vp-progress__filled');
    this.thumb = container.querySelector('.vp-progress__thumb');
    this.timeDisplay = container.querySelector('.vp-time');
    this.muteBtn = container.querySelector('[aria-label="Mute"]');
    this.fsBtn = container.querySelector('[aria-label="Fullscreen"]');
    this.ccBtn = container.querySelector('[aria-label*="captions"]');

    this.hideTimer = null;
    this.bindEvents();
  }

  bindEvents() {
    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.bigPlay.addEventListener('click', () => this.play());
    this.video.addEventListener('click', () => this.togglePlay());
    this.video.addEventListener('timeupdate', () => this.updateProgress());
    this.video.addEventListener('loadedmetadata', () => this.updateDuration());
    this.video.addEventListener('waiting', () => this.showLoader());
    this.video.addEventListener('canplay', () => this.hideLoader());
    this.video.addEventListener('ended', () => this.handleEnd());

    this.progress.addEventListener('click', (e) => this.seek(e));
    this.muteBtn.addEventListener('click', () => this.toggleMute());
    this.fsBtn.addEventListener('click', () => this.toggleFullscreen());
    this.ccBtn.addEventListener('click', () => this.toggleCaptions());

    // Keyboard on progress slider
    this.progress.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 10 : 5; // seconds
      if (e.key === 'ArrowRight') { this.video.currentTime += step; e.preventDefault(); }
      if (e.key === 'ArrowLeft') { this.video.currentTime -= step; e.preventDefault(); }
      if (e.key === 'Home') { this.video.currentTime = 0; e.preventDefault(); }
      if (e.key === 'End') { this.video.currentTime = this.video.duration; e.preventDefault(); }
    });

    // Global keyboard shortcuts
    this.container.addEventListener('keydown', (e) => {
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); this.togglePlay(); break;
        case 'm': this.toggleMute(); break;
        case 'f': this.toggleFullscreen(); break;
        case 'c': this.toggleCaptions(); break;
      }
    });

    // Auto-hide controls
    this.container.addEventListener('mousemove', () => this.showControls());
  }

  togglePlay() {
    this.video.paused ? this.play() : this.pause();
  }

  play() {
    this.video.play();
    this.playBtn.setAttribute('aria-label', 'Pause');
    this.bigPlay.hidden = true;
    this.container.classList.remove('is-paused');
  }

  pause() {
    this.video.pause();
    this.playBtn.setAttribute('aria-label', 'Play');
    this.container.classList.add('is-paused');
  }

  updateProgress() {
    const pct = (this.video.currentTime / this.video.duration) * 100;
    this.filled.style.width = `${pct}%`;
    this.thumb.style.left = `${pct}%`;
    this.progress.setAttribute('aria-valuenow', Math.round(this.video.currentTime));
    this.progress.setAttribute('aria-valuetext', `${this.formatTime(this.video.currentTime)} of ${this.formatTime(this.video.duration)}`);
    this.timeDisplay.textContent = `${this.formatTime(this.video.currentTime)} / ${this.formatTime(this.video.duration)}`;
  }

  seek(e) {
    const rect = this.progress.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    this.video.currentTime = pct * this.video.duration;
  }

  toggleMute() {
    this.video.muted = !this.video.muted;
    this.muteBtn.setAttribute('aria-label', this.video.muted ? 'Unmute' : 'Mute');
  }

  toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else this.container.requestFullscreen();
  }

  toggleCaptions() {
    const track = this.video.textTracks[0];
    if (!track) return;
    track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
    this.ccBtn.setAttribute('aria-pressed', track.mode === 'showing');
  }

  showControls() {
    this.container.querySelector('.video-player__controls').style.opacity = '1';
    clearTimeout(this.hideTimer);
    if (!this.video.paused) {
      this.hideTimer = setTimeout(() => {
        this.container.querySelector('.video-player__controls').style.opacity = '0';
      }, 3000);
    }
  }

  formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  showLoader() { this.container.querySelector('.video-player__loader').hidden = false; }
  hideLoader() { this.container.querySelector('.video-player__loader').hidden = true; }
  handleEnd() { this.bigPlay.hidden = false; this.container.classList.add('is-paused'); }
}
```

### 9.4 React + TypeScript (key structure)

```typescript
import { useRef, useState, useEffect, useCallback } from "react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  captions?: Array<{ src: string; srclang: string; label: string }>;
}

export function VideoPlayer({ src, poster, captions = [] }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);

  const togglePlay = useCallback(() => {
    const v = videoRef.current!;
    v.paused ? v.play() : v.pause();
  }, []);

  useEffect(() => {
    const v = videoRef.current!;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrentTime(v.currentTime);
    const onMeta = () => setDuration(v.duration);

    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onMeta);
    };
  }, []);

  return (
    <div className="video-player" role="region" aria-label="Video player">
      <video ref={videoRef} poster={poster} preload="metadata">
        <source src={src} type="video/mp4" />
        {captions.map(t => <track key={t.srclang} kind="captions" {...t} />)}
      </video>

      {!playing && <button className="video-player__big-play" aria-label="Play video" onClick={togglePlay}><PlayIcon /></button>}

      <div className="video-player__controls" role="toolbar" aria-label="Video controls">
        <button aria-label={playing ? "Pause" : "Play"} onClick={togglePlay}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <span className="vp-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
        <SeekSlider current={currentTime} duration={duration}
                   onSeek={(t) => { videoRef.current!.currentTime = t; }} />
        <button aria-label={muted ? "Unmute" : "Mute"}
                onClick={() => { videoRef.current!.muted = !muted; setMuted(!muted); }}>
          {muted ? <VolumeXIcon /> : <Volume2Icon />}
        </button>
        <button aria-label="Toggle captions" aria-pressed={captionsOn}
                onClick={() => setCaptionsOn(!captionsOn)}><CcIcon /></button>
        <button aria-label="Fullscreen"
                onClick={() => document.fullscreenElement ? document.exitFullscreen() : videoRef.current!.parentElement!.requestFullscreen()}>
          <MaximizeIcon />
        </button>
      </div>
    </div>
  );
}
```

### 9.5 Tailwind CSS

```html
<div class="relative aspect-video bg-black rounded-lg overflow-hidden group" role="region" aria-label="Video player">
  <video class="w-full h-full object-contain" preload="metadata" poster="/poster.jpg">
    <source src="/video.mp4" type="video/mp4" />
    <track kind="captions" src="/captions.vtt" srclang="en" label="English" default />
  </video>

  <!-- Big play button -->
  <button class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full
                 bg-black/60 text-white flex items-center justify-center hover:bg-black/80
                 hover:scale-110 transition-all focus-visible:outline focus-visible:outline-2
                 focus-visible:outline-amber-400" aria-label="Play video">
    <svg class="w-6 h-6 ml-1" aria-hidden="true"><!-- play triangle --></svg>
  </button>

  <!-- Controls (show on hover/focus) -->
  <div class="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent
              opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
       role="toolbar" aria-label="Video controls">
    <div class="flex items-center gap-2">
      <button class="w-9 h-9 rounded-md flex items-center justify-center text-white hover:bg-white/10
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
              aria-label="Play"><svg class="w-5 h-5" aria-hidden="true"><!-- play --></svg></button>
      <span class="text-xs text-white/80 tabular-nums">2:34 / 10:15</span>
      <!-- Seek bar -->
      <div class="flex-1 h-1 bg-white/20 rounded-full relative cursor-pointer group/seek"
           role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="615"
           aria-valuenow="154" aria-valuetext="2 minutes 34 seconds">
        <div class="h-full bg-white/30 rounded-full" style="width: 45%"></div>
        <div class="absolute top-0 left-0 h-full bg-amber-400 rounded-full" style="width: 25%"></div>
        <div class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow
                    opacity-0 group-hover/seek:opacity-100" style="left: 25%"></div>
      </div>
      <button class="w-9 h-9 rounded-md flex items-center justify-center text-white hover:bg-white/10"
              aria-label="Mute"><svg class="w-5 h-5" aria-hidden="true"><!-- volume --></svg></button>
      <button class="w-9 h-9 rounded-md flex items-center justify-center text-white hover:bg-white/10"
              aria-label="Toggle captions" aria-pressed="true"><svg class="w-5 h-5" aria-hidden="true"><!-- cc --></svg></button>
      <button class="w-9 h-9 rounded-md flex items-center justify-center text-white hover:bg-white/10"
              aria-label="Fullscreen"><svg class="w-5 h-5" aria-hidden="true"><!-- maximize --></svg></button>
    </div>
  </div>
</div>
```

### 9.6 Vue 3

```html
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const videoRef = ref<HTMLVideoElement | null>(null);
const playing = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const muted = ref(false);
const captionsOn = ref(true);

const progress = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0);

function togglePlay() {
  const v = videoRef.value!;
  v.paused ? v.play() : v.pause();
}

onMounted(() => {
  const v = videoRef.value!;
  v.addEventListener('play', () => playing.value = true);
  v.addEventListener('pause', () => playing.value = false);
  v.addEventListener('timeupdate', () => currentTime.value = v.currentTime);
  v.addEventListener('loadedmetadata', () => duration.value = v.duration);
});

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
</script>

<template>
  <div class="video-player" role="region" aria-label="Video player" @keydown.space.prevent="togglePlay" @keydown.k.prevent="togglePlay">
    <video ref="videoRef" preload="metadata" poster="/poster.jpg" @click="togglePlay">
      <source src="/video.mp4" type="video/mp4" />
    </video>
    <button v-if="!playing" class="video-player__big-play" aria-label="Play video" @click="togglePlay">▶</button>
    <div class="video-player__controls" role="toolbar" aria-label="Video controls">
      <button @click="togglePlay" :aria-label="playing ? 'Pause' : 'Play'">{{ playing ? '⏸' : '▶' }}</button>
      <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      <div class="vp-progress" role="slider" tabindex="0" aria-label="Seek"
           :aria-valuenow="Math.round(currentTime)" :aria-valuemax="Math.round(duration)"
           @click="seek($event)">
        <div class="vp-progress__filled" :style="{ width: progress + '%' }"></div>
      </div>
      <button @click="muted = !muted; videoRef!.muted = muted" :aria-label="muted ? 'Unmute' : 'Mute'">{{ muted ? '🔇' : '🔊' }}</button>
      <button @click="captionsOn = !captionsOn" :aria-pressed="captionsOn" aria-label="Captions">CC</button>
    </div>
  </div>
</template>
```

### 9.7 SwiftUI (native AVKit)

```swift
import SwiftUI
import AVKit

struct VideoPlayerView: View {
    let url: URL
    @State private var player: AVPlayer?

    var body: some View {
        VideoPlayer(player: player ?? AVPlayer(url: url)) {
            // Overlay content (optional)
        }
        .onAppear { player = AVPlayer(url: url) }
        .onDisappear { player?.pause() }
        .aspectRatio(16/9, contentMode: .fit)
        .cornerRadius(12)
        // Native VideoPlayer provides:
        // - Play/pause, seek, volume, AirPlay, PiP
        // - Full accessibility (VoiceOver controls)
        // - Captions via AVAsset tracks
    }
}

// Custom controls (if you need branded UI):
struct CustomVideoPlayer: View {
    @StateObject private var vm = VideoViewModel()

    var body: some View {
        ZStack {
            // Video layer
            VideoLayerView(player: vm.player)
                .aspectRatio(16/9, contentMode: .fit)
                .onTapGesture { vm.togglePlay() }

            // Controls overlay
            if vm.showControls {
                VStack {
                    Spacer()
                    HStack(spacing: 12) {
                        Button(action: vm.togglePlay) {
                            Image(systemName: vm.isPlaying ? "pause.fill" : "play.fill")
                        }
                        .accessibilityLabel(vm.isPlaying ? "Pause" : "Play")

                        Slider(value: $vm.progress, in: 0...1) { _ in vm.seek() }
                            .accessibilityLabel("Seek")
                            .accessibilityValue("\\(vm.currentTimeFormatted) of \\(vm.durationFormatted)")

                        Button(action: vm.toggleMute) {
                            Image(systemName: vm.isMuted ? "speaker.slash" : "speaker.wave.2")
                        }
                        .accessibilityLabel(vm.isMuted ? "Unmute" : "Mute")

                        Button(action: vm.toggleFullscreen) {
                            Image(systemName: "arrow.up.left.and.arrow.down.right")
                        }
                        .accessibilityLabel("Fullscreen")
                    }
                    .padding(12)
                    .background(.ultraThinMaterial)
                    .cornerRadius(8)
                    .padding(8)
                }
            }
        }
    }
}
```

### 9.8 Jetpack Compose (Media3/ExoPlayer)

```kotlin
import androidx.compose.runtime.*
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

@Composable
fun VideoPlayer(url: String, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val player = remember {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(url))
            prepare()
        }
    }

    DisposableEffect(Unit) { onDispose { player.release() } }

    // Media3 PlayerView handles all controls + accessibility natively
    AndroidView(
        factory = { ctx ->
            PlayerView(ctx).apply {
                this.player = player
                useController = true // Built-in controls with accessibility
                setShowSubtitleButton(true)
                setShowNextButton(false)
                setShowPreviousButton(false)
            }
        },
        modifier = modifier.aspectRatio(16f / 9f).clip(RoundedCornerShape(12.dp))
    )
}

// For custom controls, build on top of player state:
@Composable
fun CustomVideoControls(player: ExoPlayer) {
    val isPlaying by remember { derivedStateOf { player.isPlaying } }
    var progress by remember { mutableFloatStateOf(0f) }

    // Update progress periodically
    LaunchedEffect(isPlaying) {
        while (isPlaying) {
            progress = player.currentPosition.toFloat() / player.duration.coerceAtLeast(1)
            delay(500)
        }
    }

    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(8.dp)) {
        IconButton(onClick = { if (isPlaying) player.pause() else player.play() }) {
            Icon(if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                 contentDescription = if (isPlaying) "Pause" else "Play")
        }
        Slider(value = progress, onValueChange = { player.seekTo((it * player.duration).toLong()) },
               modifier = Modifier.weight(1f).semantics { contentDescription = "Seek: ${formatTime(player.currentPosition)}" })
        IconButton(onClick = { player.volume = if (player.volume > 0f) 0f else 1f }) {
            Icon(if (player.volume == 0f) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
                 contentDescription = if (player.volume == 0f) "Unmute" else "Mute")
        }
    }
}
```

### 9.9 Flutter (video\_player package)

```dart
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

class VideoPlayerWidget extends StatefulWidget {
  final String url;
  const VideoPlayerWidget({super.key, required this.url});
  @override State<VideoPlayerWidget> createState() => _VideoPlayerWidgetState();
}

class _VideoPlayerWidgetState extends State<VideoPlayerWidget> {
  late VideoPlayerController _controller;
  bool _showControls = true;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.url))
      ..initialize().then((_) => setState(() {}));
  }

  @override
  void dispose() { _controller.dispose(); super.dispose(); }

  void _togglePlay() {
    setState(() { _controller.value.isPlaying ? _controller.pause() : _controller.play(); });
  }

  String _formatDuration(Duration d) => '${d.inMinutes}:${(d.inSeconds % 60).toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Video player',
      child: AspectRatio(
        aspectRatio: _controller.value.isInitialized ? _controller.value.aspectRatio : 16 / 9,
        child: Stack(children: [
          // Video
          if (_controller.value.isInitialized) VideoPlayer(_controller)
          else const Center(child: CircularProgressIndicator()),

          // Controls overlay
          GestureDetector(
            onTap: () => setState(() => _showControls = !_showControls),
            child: AnimatedOpacity(
              opacity: _showControls ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 200),
              child: Container(
                decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Colors.transparent, Colors.black54])),
                child: Column(mainAxisAlignment: MainAxisAlignment.end, children: [
                  // Progress bar
                  VideoProgressIndicator(_controller, allowScrubbing: true,
                    colors: const VideoProgressColors(playedColor: Color(0xFFDCA424), bufferedColor: Colors.white30, backgroundColor: Colors.white12)),
                  // Buttons
                  Row(children: [
                    IconButton(icon: Icon(_controller.value.isPlaying ? Icons.pause : Icons.play_arrow, color: Colors.white),
                               onPressed: _togglePlay, tooltip: _controller.value.isPlaying ? 'Pause' : 'Play'),
                    Text('${_formatDuration(_controller.value.position)} / ${_formatDuration(_controller.value.duration)}',
                         style: const TextStyle(color: Colors.white70, fontSize: 12)),
                    const Spacer(),
                    IconButton(icon: Icon(_controller.value.volume == 0 ? Icons.volume_off : Icons.volume_up, color: Colors.white),
                               onPressed: () => setState(() => _controller.setVolume(_controller.value.volume == 0 ? 1 : 0)),
                               tooltip: _controller.value.volume == 0 ? 'Unmute' : 'Mute'),
                    IconButton(icon: const Icon(Icons.fullscreen, color: Colors.white), onPressed: () { /* fullscreen */ }, tooltip: 'Fullscreen'),
                  ]),
                ]),
              ),
            ),
          ),

          // Big play button (when paused)
          if (!_controller.value.isPlaying)
            Center(child: IconButton(iconSize: 64, icon: const Icon(Icons.play_circle_fill, color: Colors.white70),
                                     onPressed: _togglePlay, tooltip: 'Play video')),
        ]),
      ),
    );
  }
}
```

### 9.10 Testing

```typescript
describe("VideoPlayer", () => {
  it("has role=region with label", () => {
    render(<VideoPlayer src="/test.mp4" />);
    expect(screen.getByRole('region', { name: /video player/i })).toBeInTheDocument();
  });

  it("play button toggles to pause", async () => {
    render(<VideoPlayer src="/test.mp4" />);
    const playBtn = screen.getByRole('button', { name: /play/i });
    expect(playBtn).toHaveAttribute('aria-label', 'Play video');
  });

  it("seek slider has proper ARIA", () => {
    render(<VideoPlayer src="/test.mp4" />);
    const slider = screen.getByRole('slider', { name: /seek/i });
    expect(slider).toHaveAttribute('aria-valuemin', '0');
  });

  it("captions toggle has aria-pressed", () => {
    render(<VideoPlayer src="/test.mp4" captions={[{ src: '/en.vtt', srclang: 'en', label: 'English' }]} />);
    expect(screen.getByRole('button', { name: /captions/i })).toHaveAttribute('aria-pressed');
  });
});
```

* * *

## 10\. Accessibility
### Keyboard shortcuts (standard video player conventions)

| Key | Action |
| ---| --- |
| Space / K | Play/Pause |
| ArrowRight | Seek forward 5s |
| ArrowLeft | Seek backward 5s |
| Shift+ArrowRight | Seek forward 10s |
| Shift+ArrowLeft | Seek backward 10s |
| ArrowUp | Volume up |
| ArrowDown | Volume down |
| M | Toggle mute |
| F | Toggle fullscreen |
| C | Toggle captions |
| Home | Jump to start |
| J | Seek backward 10s |
| L | Seek forward 10s |
| End | Jump to end |
| Escape | Exit fullscreen |
| 0-9 | Jump to 0%-90% |

### ARIA for custom controls
*   **Seek bar:** `role="slider"` + `aria-valuemin="0"` + `aria-valuemax="[duration in seconds]"` + `aria-valuenow="[current seconds]"` + `aria-valuetext="2 minutes 34 seconds of 10 minutes 15 seconds"`. The valuetext is critical: "154" means nothing; "2 minutes 34 seconds" is understandable.
*   **Volume:** `role="slider"` + `aria-valuemin="0"` + `aria-valuemax="100"` + `aria-valuenow="80"`.
*   **Play/Pause:** `aria-label` updates dynamically ("Play" → "Pause").
*   **Captions toggle:** `aria-pressed="true|false"`.
*   **Fullscreen:** `aria-label` updates ("Enter fullscreen" / "Exit fullscreen").
### Captions
`<track kind="captions">` is the semantic element for closed captions. Use WebVTT format. Provide captions in multiple languages. Default to showing captions (inclusive default).
### Focus management
Controls must be focusable via Tab. The control bar uses `role="toolbar"` with roving tabindex (arrows between buttons, Tab exits). When controls auto-hide, ensure they become visible again when any button receives focus.
### Reduced motion
Autoplay MUST be disabled under `prefers-reduced-motion`. Control animations (fade in/out) can be simplified to instant transitions.
* * *

## 11\. Innovative / Emerging Ideas
*   **AI-generated chapters:** automatic chapter markers based on content analysis.
*   **Interactive video:** clickable hotspots within the video (product links, branching narratives).
*   **Transcript sidebar:** synchronized transcript that highlights the current spoken word.
*   **AI captions (real-time):** live captioning via speech recognition for videos without pre-made captions.
*   **Spatial audio controls:** for immersive/360 video.
*   **Watch together:** synchronized playback across multiple users.
*   **Speed ramping:** smooth acceleration/deceleration when changing playback speed.
*   **Ambient mode:** screen background color matches the video's dominant color (the YouTube effect).
* * *

## 12\. Conversion / UX Killers
*   **No keyboard controls:** custom player that only works with mouse. Completely excludes keyboard users.
*   **No captions:** excludes deaf/hard-of-hearing users AND anyone in a quiet environment.
*   **Controls that auto-hide with no way to bring back:** user moves mouse slightly and controls vanish. Make controls appear on any interaction (hover, tap, keyboard).
*   **Autoplay with sound:** browsers block it, and when it works it's hostile. Always muted autoplay.
*   **No loading/buffering indicator:** video freezes and users think it crashed.
*   **Tiny controls on mobile:** touch targets under 44px. Unplayable.
*   **No fullscreen option:** users want immersion for longer content.
*   **Progress bar too thin to hit:** a 2px progress bar is impossible to click on mobile. Make the hit area at least 20px tall (even if the visual bar is 4px).
*   **Fullscreen button doesn't work on iOS:** iOS Safari won't fullscreen an arbitrary element. Call `webkitEnterFullscreen()` on the `<video>` element directly for iOS.
* * *

## 13\. Advanced Patterns
### Adaptive streaming (HLS)

```typescript
import Hls from 'hls.js';

function setupHLS(videoElement: HTMLVideoElement, src: string) {
  if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
    // Native HLS (Safari)
    videoElement.src = src;
  } else if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(videoElement);
  }
}
```

### Thumbnail preview on seek hover
Use a sprite sheet of video frames. On hover over the progress bar, show the corresponding frame thumbnail:

```javascript
progressBar.addEventListener('mousemove', (e) => {
  const pct = (e.clientX - rect.left) / rect.width;
  const frameIndex = Math.floor(pct * totalFrames);
  thumbnail.style.backgroundPosition = `-${frameIndex * thumbWidth}px 0`;
  thumbnail.style.left = `${e.clientX - rect.left}px`;
});
```

### Resume playback
Store `currentTime` in `localStorage` per video. On revisit, offer to pick up where the user left off ("Resume from 2:34?").
* * *

## 14\. Performance & Bundle Cost
*   **Lazy-load the video.** Use `preload="metadata"` (loads duration/dimensions only) or `preload="none"` until user initiates playback.
*   **Poster image is critical path.** Optimize and serve via CDN. It's what users see before they click play.
*   **hls.js is ~60KB gzipped.** Only load it if the video source is HLS. Use dynamic `import()` on play.
*   **Intersection Observer for autoplay.** Only start autoplay videos when they scroll into view. Pause when out of view.
*   **Video.js is heavy (~200KB).** For a single video, a custom lightweight player (like above) is 10-20KB.
* * *

## 15\. Security
*   **DRM/Content protection:** for paid content, use Encrypted Media Extensions (EME) with a DRM provider (Widevine, FairPlay, PlayReady).
*   **Hotlink prevention:** serve videos from a CDN with signed URLs or token-based access. Don't expose direct file URLs.
*   **Prevent download (soft):** remove the download button from native controls and disable the right-click context menu. A deterrent, not real protection — use DRM for that.
*   **User-generated video:** scan uploads for malware. Validate file type by magic bytes.
*   **XSS in captions:** VTT files can contain HTML-like cue payloads. Sanitize before rendering.
*   **Autoplay abuse:** browsers restrict autoplay for good reason. Respect it.
* * *

## 16\. Senior-Level Checklist
- [ ] All controls keyboard-accessible (Space, arrows, M, F, C)
- [ ] Seek bar is `role="slider"` with `aria-valuetext` (human-readable time)
- [ ] Play/Pause `aria-label` updates dynamically
- [ ] Captions available via `<track>` element
- [ ] Captions toggle has `aria-pressed`
- [ ] Control bar uses `role="toolbar"` pattern
- [ ] Controls appear on focus (not only hover)
- [ ] Poster frame shown before playback
- [ ] Loading/buffering state visible
- [ ] Error state with message and retry
- [ ] Fullscreen works and controls adapt
- [ ] Progress bar hit area ≥20px tall for touch
- [ ] All buttons ≥44px touch target
- [ ] `prefers-reduced-motion`: no autoplay
- [ ] Video preloads metadata only (not full file)
- [ ] Responsive: controls resize for mobile
* * *

## 17\. Visual Styles
The same video player rendered across eleven aesthetics. The style is skin; keyboard controls, ARIA sliders, caption tracks, and focus behavior never change.

**Flat:** clean control bar with solid semi-transparent background. White icons. Simple progress bar. The YouTube/standard look.

**Material:** M3 icon buttons with state layers. Progress bar uses M3 linear indicator style. Control bar has M3 surface-container color.

**Glassmorphism:** control bar is frosted glass over the video. Icons glow white. Beautiful but check icon contrast against bright video frames.

**Liquid Glass (2026):** control bar uses the liquid glass material with specular rim at the top edge. Buttons get subtle refraction on hover. The Apple TV+ / macOS QuickTime feel.

**Neumorphism:** control bar raised from a soft surface below the video. Buttons are raised circles. Not ideal for video (contrast against video content is the issue).

**Skeuomorphism:** buttons look like physical VCR/remote controls. Brushed metal bar. Play button has a glossy green overlay.

**Neo-Brutalism:** thick-bordered control bar, black background. Bold white icons. Progress bar is thick and high-contrast. No subtlety.

**Claymorphism:** puffy rounded control bar. Buttons are clay circles. Playful, suitable for children's content or casual platforms.

**Aurora/Gradient:** control bar has a gradient background that subtly shifts. Active state glows. Honor `prefers-reduced-motion`.

**Minimal/Swiss:** nearly invisible controls. Thin hairline progress bar. Tiny monochrome icons. Controls appear only on hover with maximum transparency. Cinematic.

**UJG Brand:** Night control bar with Eminence accent on the progress fill. Goldenrod for the played portion and hover states. Big play button has an Eminence circle with Goldenrod play icon. The house default.

Full style definitions on the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).