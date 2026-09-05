# File Upload/Dropzone (Full Build)

# The File Upload/Dropzone: A Senior Engineer's Complete Breakdown
The drag-and-drop area for file selection and upload. Here's everything from first principles to production code.

**Try it live:** the interactive playground (built in a later pass) will let you toggle single/multi file, accepted types, drag state, progress simulation, and error handling, then output code for every target.

**Audit a file upload:** the companion audit checks keyboard access, drag feedback, progress announcement, error messaging, type/size validation, and CSRF protection, then exports a client-ready report.

This doc follows the Private ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the Private ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).

* * *
## 1\. What a File Upload Actually Is
A **file upload** (dropzone, file input, file picker) is a component that lets users select files from their device (via a browse button or drag-and-drop) and upload them to a server. It manages the entire lifecycle: selection, validation, progress, success, and error.

The distinctions:

**File Upload (this doc):** drag-and-drop area + browse button + file list + progress indicators. The full pattern.
**`<input type="file">`****\*\*\*\*:** the native HTML element. Functional but unstyled, offers no drag-and-drop, no progress, and no preview. The raw primitive this component wraps.
**Image picker:** a specialized file upload for images with cropping/preview. A subset of this component.
**Media upload:** a specialized variant for video/audio with transcoding status.

Every app that accepts user-generated content (avatars, documents, attachments, CSV imports, asset libraries) needs file upload. The native `<input type="file">` is the accessible foundation, but a custom upload is essential for a good experience.

* * *
## 2\. Why It Matters
**Conversion-critical in onboarding.** "Upload your avatar" or "Import your data" are often the first actions a new user takes. A clunky upload (no drag, no progress, unclear errors) kills onboarding completion.

**Error recovery is the hard UX.** Files fail: too large, wrong type, network interrupts. The upload component must communicate what went wrong AND let the user recover (retry, replace, remove) without starting over.

**Security surface.** File upload is one of the most attacked surfaces in web applications. Malicious files, oversized payloads, path traversal in filenames, and CSRF on the upload endpoint all live here.

**Accessibility complexity.** A drag-and-drop area that only works with mouse pointer excludes keyboard users entirely. The browse button (triggering the native file picker) is the accessible fallback that must ALWAYS exist alongside drag-and-drop.

* * *
## 3\. Anatomy
**Dropzone area:** a dashed-border region users drag files onto. The primary visual affordance.
**Upload icon:** cloud-arrow-up or similar, centered in the dropzone. Visual invitation to drop.
**Instructional text:** "Drag files here or click to browse." Communicates both interaction modes.
**Browse button:** triggers the native file picker dialog. The accessible path. Can be the entire dropzone (clicking anywhere opens the picker) or an explicit button within it.
**File type/size constraints text:** "PNG, JPG, or PDF up to 10MB." Sets expectations before the user tries.
**File list:** after selection, shows each file with: name, size, thumbnail (images), upload progress bar, status (uploading/complete/error), and a remove button.
**Progress bar (per file):** shows upload percentage. Deterministic (actual progress) or indeterminate (uploading with unknown progress).
**Error messages:** per-file validation errors ("File too large", "Unsupported format") and global errors ("Upload failed, please retry").
**Success indicator:** checkmark or green state per file when upload completes.
**Thumbnail preview (images):** before/during upload, show a small preview generated client-side.

* * *
## 4\. Sizes / Scale

| Token | Dropzone H | Padding | Icon | Text | Use |
| ---| ---| ---| ---| ---| --- |
| S | 80px min | 16px | 24px | 12px | Inline, sidebar, compact forms |
| M | 120px min | 24px | 32px | 14px | Default |
| L | 180px min | 32px | 48px | 16px | Full-page upload, primary action |

Width: 100% of parent container (always fluid).

File list items: 48-56px height each (to accommodate thumbnail + name + progress + remove button with ≥44px tap target).

* * *
## 5\. States
**Default (idle):** dropzone visible with dashed border, icon, and instructional text. Ready to accept files.

**Drag-over (file hovering):** a file is being dragged over the dropzone. Border changes (solid, colored), background tints, icon animates or scales up. Clear visual signal: "drop it here." This state is triggered by the browser's `dragenter`/`dragover` events.

**Drag-over invalid:** a file is hovering but it's an unsupported type (detected via `dataTransfer.types`). Show a warning state: red border, × icon, "Unsupported file type."

**Selected (files chosen, not yet uploaded):** files appear in the file list below the dropzone. User can review, remove files, and initiate upload.

**Uploading:** progress bars animate per file. The dropzone may be disabled (no more files) or remain active (add more files while uploading). Cancel button per file.

**Complete (success):** all files uploaded. Success indicators (checkmarks) on each file. The dropzone may reset to idle or show a "Upload more" state.

**Error (per file):** a specific file failed. Red indicator, error message ("Network error. Retry?"), retry button. Other files' states are unaffected.

**Error (global):** the upload endpoint is unreachable. Message above the file list. Retry-all button.

**Disabled:** the upload is not available (permissions, quota reached). Muted, cursor-not-allowed, no drag-and-drop response.

* * *
## 6\. Types / Variants
**Single file:** only one file allowed. Selecting a new file replaces the previous. Avatar upload, document replacement.
**Multi-file:** unlimited (or capped) number of files. Shows a list. Attachment uploads, bulk imports.
**Image-only:** restricted to image types. Shows thumbnail previews. May include a crop step.
**Compact (button-only):** no visible dropzone area. Just a "Choose file" button with the file list below. For tight layouts.
**Avatar/Circular:** a circular dropzone (or the avatar itself) that accepts one image and shows a preview in place.
**Drag-anywhere (full-page):** the entire page is a valid drop target. Common in email clients and design tools. Shows an overlay when dragging.
**With processing:** after upload, the server processes the file (image resize, CSV parse, video transcode). Shows a processing state between upload and done.

* * *
## 7\. When to Use (and When Not To)
**Use a file upload when:**
*   Users need to provide files from their device
*   The data can't be entered any other way (images, documents, exports)
*   Bulk operations require file import (CSV, spreadsheet)

**Use something else when:**
*   Data can be entered via form fields → use form inputs
*   Content comes from another service (URL, API integration) → URL input or integration picker
*   The "upload" is actually a camera capture → use `capture` attribute or camera API
*   You need rich text content → rich text editor with paste-image support

* * *
## 8\. Across Design Systems
**Ant Design:** `<Upload>` with `<Upload.Dragger>` variant. Supports `action` (upload URL), `beforeUpload` (validation), `onChange` (status tracking), `listType` (text/picture/picture-card), `maxCount`, and `directory` (folder upload).

**Material/MUI:** No built-in upload. Teams compose from `<Button>` + custom drag logic.

**Chakra:** No dedicated upload. Community recipes exist.

**shadcn:** No built-in. The community uses `react-dropzone` or `@uploadthing/react` with shadcn styling.

**react-dropzone:** the standard React library for file drop zones. Headless (no UI), provides hooks: `getRootProps`, `getInputProps`, `isDragActive`, `acceptedFiles`, `rejectedFiles`.

**Uppy:** full-featured upload library with UI components, drag-and-drop, camera, URL import, progress, resumable uploads (tus protocol). Overkill for simple uploads, excellent for complex ones.

**Apple HIG:** native file pickers (`UIDocumentPickerViewController`). No custom dropzone; the OS handles file selection.

* * *
## 9\. The Code
### 9.1 HTML (accessible foundation)

```html
<div class="dropzone" id="dropzone" aria-describedby="upload-help">
  <input type="file" id="file-input" class="sr-only" multiple
         accept=".png,.jpg,.jpeg,.pdf" aria-label="Upload files" />
  <label for="file-input" class="dropzone__content">
    <svg class="dropzone__icon" aria-hidden="true"><!-- upload cloud icon --></svg>
    <span class="dropzone__text">
      <strong>Drag files here</strong> or <span class="dropzone__link">browse</span>
    </span>
    <span id="upload-help" class="dropzone__help">PNG, JPG, or PDF up to 10MB</span>
  </label>
</div>

<!-- File list (after selection) --><ul class="file-list" aria-label="Selected files" aria-live="polite">
  <li class="file-item">
    <img src="thumbnail.jpg" alt="" class="file-item__thumb" />
    <span class="file-item__name">photo.jpg</span>
    <span class="file-item__size">2.4 MB</span>
    <div class="file-item__progress" role="progressbar"
         aria-valuenow="65" aria-valuemin="0" aria-valuemax="100"
         aria-label="Uploading photo.jpg: 65%">
      <div class="file-item__bar" style="width: 65%"></div>
    </div>
    <button type="button" class="file-item__remove" aria-label="Remove photo.jpg">&times;</button>
  </li>
</ul>
```

Key HTML decisions:
*   **The** **`<input type="file">`** **is visually hidden (****`sr-only`****\*\*\*\*) but present in the DOM.** It's the accessible foundation. The `<label>` wrapping the dropzone content makes the entire area clickable AND gives the input an accessible name.
*   **`accept`** **attribute** limits the file picker dialog to show only valid types.
*   **`multiple`** allows multi-file selection.
*   **`aria-describedby`** links to the constraint text (types, size limit).
*   **File list uses** **`aria-live="polite"`** so new files/status changes are announced to AT.
*   **Progress bar uses** **`role="progressbar"`** with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
*   **Remove button has** **`aria-label`** including the file name ("Remove photo.jpg").
### 9.2 CSS

```css
.dropzone {
  border: 2px dashed var(--drop-border, oklch(40% 0.02 305));
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  transition: border-color 0.2s, background 0.2s;
  cursor: pointer;
}

.dropzone:hover,
.dropzone:focus-within {
  border-color: var(--drop-border-hover, oklch(55% 0.08 305));
  background: var(--drop-bg-hover, oklch(20% 0.02 305));
}

.dropzone.is-drag-over {
  border-color: var(--drop-active, oklch(78% 0.135 82));
  border-style: solid;
  background: var(--drop-bg-active, oklch(78% 0.135 82 / 0.05));
}

.dropzone.is-drag-invalid {
  border-color: oklch(55% 0.2 25);
  background: oklch(55% 0.2 25 / 0.05);
}

.dropzone__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.dropzone__icon {
  width: 32px;
  height: 32px;
  color: var(--drop-icon, oklch(55% 0.03 305));
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.dropzone.is-drag-over .dropzone__icon {
  transform: scale(1.15);
  color: var(--drop-active);
}

.dropzone__text {
  font-size: 0.9rem;
  color: var(--text-primary);
}

.dropzone__link {
  color: var(--drop-active, oklch(78% 0.135 82));
  text-decoration: underline;
}

.dropzone__help {
  font-size: 0.75rem;
  color: var(--text-muted, oklch(55% 0.01 305));
}

/* File list */
.file-list {
  list-style: none;
  padding: 0;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--file-bg, oklch(18% 0.015 305));
  border: 1px solid var(--file-border, oklch(28% 0.02 305));
}

.file-item__thumb {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 4px;
}

.file-item__name {
  flex: 1;
  font-size: 0.82rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-item__size {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.file-item__progress {
  width: 80px;
  height: 4px;
  background: oklch(30% 0.02 305);
  border-radius: 2px;
  overflow: hidden;
}

.file-item__bar {
  height: 100%;
  background: var(--drop-active, oklch(78% 0.135 82));
  border-radius: 2px;
  transition: width 0.3s;
}

.file-item__remove {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -8px -4px -8px 0;
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 16px;
  border-radius: 4px;
}

.file-item__remove:hover { color: oklch(60% 0.2 25); }
.file-item__remove:focus-visible { outline: 2px solid var(--drop-active); outline-offset: 2px; }

.file-item--error {
  border-color: oklch(55% 0.2 25);
}

.file-item--complete .file-item__bar {
  background: oklch(55% 0.15 145);
}
```

### 9.3 JavaScript (drag-and-drop + validation)

```javascript
class Dropzone {
  constructor(element, options = {}) {
    this.el = element;
    this.input = element.querySelector('input[type="file"]');
    this.options = {
      maxSize: options.maxSize || 10 * 1024 * 1024, // 10MB
      accept: options.accept || [],
      multiple: options.multiple !== false,
      onFiles: options.onFiles || (() => {}),
      onError: options.onError || (() => {}),
    };

    this.bindEvents();
  }

  bindEvents() {
    // Drag events
    ['dragenter', 'dragover'].forEach(event => {
      this.el.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.el.classList.add('is-drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(event => {
      this.el.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.el.classList.remove('is-drag-over');
      });
    });

    this.el.addEventListener('drop', (e) => {
      const files = [...e.dataTransfer.files];
      this.handleFiles(files);
    });

    // Click/input change
    this.input.addEventListener('change', () => {
      const files = [...this.input.files];
      this.handleFiles(files);
      this.input.value = ''; // reset for re-selection of same file
    });
  }

  handleFiles(files) {
    const validated = files.map(file => this.validate(file));
    const valid = validated.filter(r => r.valid).map(r => r.file);
    const invalid = validated.filter(r => !r.valid);

    if (invalid.length) this.options.onError(invalid);
    if (valid.length) this.options.onFiles(valid);
  }

  validate(file) {
    // Size check
    if (file.size > this.options.maxSize) {
      return { file, valid: false, error: `File too large (max ${this.formatSize(this.options.maxSize)})` };
    }
    // Type check
    if (this.options.accept.length > 0) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      const typeMatch = this.options.accept.some(t =>
        t.startsWith('.') ? t === ext : file.type.startsWith(t.replace('/*', ''))
      );
      if (!typeMatch) {
        return { file, valid: false, error: `Unsupported type: ${ext}` };
      }
    }
    return { file, valid: true };
  }

  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
```

### 9.4 React + TypeScript

```typescript
import { useCallback, useState, useRef, DragEvent, ChangeEvent } from "react";

interface FileWithProgress {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
  preview?: string;
}

interface DropzoneProps {
  accept?: string[];
  maxSize?: number;
  multiple?: boolean;
  onUpload: (file: File) => Promise<void>;
  label?: string;
}

export function Dropzone({
  accept = [],
  maxSize = 10 * 1024 * 1024,
  multiple = true,
  onUpload,
  label = "Upload files"
}: DropzoneProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((file: File): string | null => {
    if (file.size > maxSize) return `File too large (max ${formatSize(maxSize)})`;
    if (accept.length > 0) {
      const ext = '.' + file.name.split('.').pop()!.toLowerCase();
      if (!accept.some(a => a.startsWith('.') ? a === ext : file.type.startsWith(a.replace('/*', ''))))
        return `Unsupported type`;
    }
    return null;
  }, [accept, maxSize]);

  const addFiles = useCallback((newFiles: File[]) => {
    const entries: FileWithProgress[] = newFiles.map(file => {
      const error = validate(file);
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      return {
        file, id: crypto.randomUUID(), progress: 0,
        status: error ? "error" : "pending",
        error: error || undefined, preview
      };
    });
    setFiles(prev => multiple ? [...prev, ...entries] : entries.slice(0, 1));

    // Auto-upload valid files
    entries.filter(e => e.status === "pending").forEach(entry => {
      uploadFile(entry);
    });
  }, [validate, multiple, onUpload]);

  const uploadFile = async (entry: FileWithProgress) => {
    setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: "uploading" } : f));
    try {
      await onUpload(entry.file);
      setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: "complete", progress: 100 } : f));
    } catch {
      setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: "error", error: "Upload failed" } : f));
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const removed = prev.find(f => f.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    addFiles([...e.dataTransfer.files]);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles([...e.target.files]);
    e.target.value = '';
  };

  return (
    <div>
      <div className={`dropzone ${isDragOver ? 'is-drag-over' : ''}`}
           onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
           onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
           onDragLeave={() => setIsDragOver(false)}
           onDrop={handleDrop}
           aria-describedby="upload-constraints">
        <input ref={inputRef} type="file" className="sr-only" multiple={multiple}
               accept={accept.join(',')} onChange={handleChange} aria-label={label} />
        <label className="dropzone__content" onClick={() => inputRef.current?.click()}>
          <UploadCloudIcon className="dropzone__icon" aria-hidden="true" />
          <span className="dropzone__text"><strong>Drag files here</strong> or <span className="dropzone__link">browse</span></span>
          <span id="upload-constraints" className="dropzone__help">
            {accept.length ? accept.join(', ') : 'Any file'} up to {formatSize(maxSize)}
          </span>
        </label>
      </div>

      {files.length > 0 && (<ul className="file-list" aria-label="Selected files" aria-live="polite">
          {files.map(f => (
            <li key={f.id} className={`file-item file-item--${f.status}`}>
              {f.preview && <img src={f.preview} alt="" className="file-item__thumb" />}
              <span className="file-item__name">{f.file.name}</span>
              <span className="file-item__size">{formatSize(f.file.size)}</span>
              {f.status === "uploading" && (
                <div className="file-item__progress" role="progressbar"
                     aria-valuenow={f.progress} aria-valuemin={0} aria-valuemax={100}
                     aria-label={`Uploading ${f.file.name}: ${f.progress}%`}>
                  <div className="file-item__bar" style={{ width: `${f.progress}%` }} />
                </div>
              )}
              {f.status === "complete" && <span aria-label="Upload complete">✓</span>}
              {f.status === "error" && <span className="file-item__error">{f.error}</span>}
              <button className="file-item__remove" aria-label={`Remove ${f.file.name}`}
                      onClick={() => removeFile(f.id)}>&times;</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
```

### 9.5 Vue 3

```html
<script setup lang="ts">
import { ref } from 'vue';
const isDragOver = ref(false);
const files = ref<Array<{ file: File; id: string; status: string; progress: number }>>([]); 

function handleDrop(e: DragEvent) {
  e.preventDefault();
  isDragOver.value = false;
  if (e.dataTransfer?.files) addFiles([...e.dataTransfer.files]);
}

function addFiles(newFiles: File[]) {
  newFiles.forEach(file => {
    files.value.push({ file, id: crypto.randomUUID(), status: 'pending', progress: 0 });
  });
}

function removeFile(id: string) {
  files.value = files.value.filter(f => f.id !== id);
}
</script>

<template>
  <div :class="['dropzone', { 'is-drag-over': isDragOver }]"
       @dragenter.prevent="isDragOver = true"
       @dragover.prevent="isDragOver = true"
       @dragleave="isDragOver = false"
       @drop="handleDrop">
    <input type="file" class="sr-only" multiple ref="inputEl"
           @change="addFiles([...$event.target.files])" aria-label="Upload files" />
    <label class="dropzone__content" @click="$refs.inputEl.click()">
      <UploadIcon class="dropzone__icon" aria-hidden="true" />
      <span><strong>Drag files here</strong> or <span class="dropzone__link">browse</span></span>
    </label>
  </div><ul v-if="files.length" class="file-list" aria-label="Files" aria-live="polite">
    <li v-for="f in files" :key="f.id" class="file-item">
      <span>{{ f.file.name }}</span>
      <button @click="removeFile(f.id)" :aria-label="`Remove ${f.file.name}`">&times;</button>
    </li>
  </ul>
</template>
```

### 9.6 Server-side handling (Node/Express)

```typescript
import multer from 'multer';
import { randomUUID } from 'crypto';
import path from 'path';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      // Sanitize filename: strip path, generate unique name
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext}`);
    }
  }),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      cb(new Error('Unsupported file type'));
    } else {
      cb(null, true);
    }
  }
});

app.post('/api/upload', requireAuth, csrfProtection, upload.array('files', 10), (req, res) => {
  const uploaded = req.files.map(f => ({
    id: f.filename,
    name: f.originalname,
    size: f.size,
    url: `/uploads/${f.filename}`
  }));
  res.json({ files: uploaded });
});
```

### 9.7 Tailwind CSS

```html
<div class="w-full">
  <!-- Dropzone -->
  <div class="relative border-2 border-dashed border-gray-600 rounded-xl p-8 text-center
              transition-colors hover:border-gray-500
              [&.drag-over]:border-purple-500 [&.drag-over]:border-solid [&.drag-over]:bg-purple-500/5"
       id="dropzone">
    <input type="file" multiple accept=".png,.jpg,.pdf" class="sr-only" id="file-input"
           aria-label="Upload files" aria-describedby="upload-help" />
    <label for="file-input" class="flex flex-col items-center gap-3 cursor-pointer">
      <svg class="w-8 h-8 text-gray-500" aria-hidden="true"><!-- upload cloud --></svg>
      <span class="text-sm text-gray-200"><strong>Drag files here</strong> or <span class="text-purple-400 underline">browse</span></span>
      <span id="upload-help" class="text-xs text-gray-500">PNG, JPG, or PDF up to 10MB</span>
    </label>
  </div>

  <!-- File list -->
  <ul class="mt-4 space-y-2" aria-label="Selected files" aria-live="polite">
    <li class="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
      <img src="thumb.jpg" alt="" class="w-9 h-9 rounded object-cover" />
      <span class="flex-1 text-sm text-gray-200 truncate">photo.jpg</span>
      <span class="text-xs text-gray-500">2.4 MB</span>
      <div class="w-20 h-1 rounded-full bg-gray-700 overflow-hidden" role="progressbar"
           aria-valuenow="65" aria-valuemin="0" aria-valuemax="100" aria-label="Uploading photo.jpg: 65%">
        <div class="h-full bg-amber-400 rounded-full" style="width: 65%"></div>
      </div>
      <button class="min-w-[44px] min-h-[44px] -my-2 -mr-1 flex items-center justify-center
                     text-gray-500 hover:text-red-400" aria-label="Remove photo.jpg">&times;</button>
    </li>
  </ul>
</div>
```

### 9.8 Next.js (with UploadThing or Server Action)

```typescript
// app/upload/page.tsx
"use client";
import { Dropzone } from "@/components/dropzone";
import { uploadFile } from "./actions";

export default function UploadPage() {
  return (
    <Dropzone
      accept={[".png", ".jpg", ".pdf"]}
      maxSize={10 * 1024 * 1024}
      onUpload={async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        await uploadFile(formData);
      }}
    />
  );
}

// app/upload/actions.ts
"use server";
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file");

  // Validate
  const ALLOWED = ["image/png", "image/jpeg", "application/pdf"];
  if (!ALLOWED.includes(file.type)) throw new Error("Invalid type");
  if (file.size > 10 * 1024 * 1024) throw new Error("Too large");

  // Save
  const ext = path.extname(file.name).toLowerCase();
  const filename = `${randomUUID()}${ext}`;
  const bytes = await file.arrayBuffer();
  await writeFile(`./uploads/${filename}`, Buffer.from(bytes));

  return { id: filename, url: `/uploads/${filename}` };
}
```

### 9.9 shadcn/ui

```typescript
// Using shadcn patterns (no official upload component, compose from primitives):
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Upload, X, FileText, CheckCircle } from "lucide-react";

export function FileUpload({ onUpload, accept, maxSize }: UploadProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
        isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
      )} onClick={() => inputRef.current?.click()}
         onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
         onDragLeave={() => setIsDragOver(false)}
         onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFiles([...e.dataTransfer.files]); }}>
        <input ref={inputRef} type="file" className="sr-only" multiple accept={accept?.join(",")}
               onChange={(e) => { if (e.target.files) handleFiles([...e.target.files]); e.target.value = ""; }} />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm"><span className="font-medium">Drag files here</span> or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF up to 10MB</p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map(f => (
            <li key={f.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm truncate">{f.file.name}</span>
              <span className="text-xs text-muted-foreground">{formatSize(f.file.size)}</span>
              {f.status === "uploading" && <Progress value={f.progress} className="w-20 h-1.5" />}
              {f.status === "complete" && <CheckCircle className="h-4 w-4 text-green-500" />}
              <Button variant="ghost" size="icon" onClick={() => removeFile(f.id)} aria-label={`Remove ${f.file.name}`}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 9.10 Svelte

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let accept: string[] = [];
  export let maxSize = 10 * 1024 * 1024;
  export let multiple = true;

  const dispatch = createEventDispatcher<{ upload: File[] }>();
  let isDragOver = false;
  let files: Array<{ file: File; id: string; status: string; progress: number }> = [];
  let inputEl: HTMLInputElement;

  function handleDrop(e: DragEvent) {
    e.preventDefault(); isDragOver = false;
    if (e.dataTransfer?.files) addFiles([...e.dataTransfer.files]);
  }

  function addFiles(newFiles: File[]) {
    const validated = newFiles.filter(f => {
      if (f.size > maxSize) return false;
      if (accept.length && !accept.some(a => f.name.toLowerCase().endsWith(a))) return false;
      return true;
    });
    files = [...files, ...validated.map(f => ({ file: f, id: crypto.randomUUID(), status: 'pending', progress: 0 }))];
    dispatch('upload', validated);
  }

  function removeFile(id: string) { files = files.filter(f => f.id !== id); }
</script>

<div class="dropzone" class:is-drag-over={isDragOver}
     on:dragenter|preventDefault={() => isDragOver = true}
     on:dragover|preventDefault={() => isDragOver = true}
     on:dragleave={() => isDragOver = false}
     on:drop={handleDrop}>
  <input bind:this={inputEl} type="file" class="sr-only" {multiple} accept={accept.join(',')}
         on:change={(e) => addFiles([...e.target.files])} aria-label="Upload files" />
  <button type="button" class="dropzone__content" on:click={() => inputEl.click()}>
    <span><strong>Drag files here</strong> or browse</span>
  </button>
</div>

{#if files.length}
  <ul class="file-list" aria-label="Files" aria-live="polite">
    {#each files as f (f.id)}
      <li class="file-item">
        <span>{f.file.name}</span>
        <button on:click={() => removeFile(f.id)} aria-label="Remove {f.file.name}">&times;</button>
      </li>
    {/each}
  </ul>
{/if}
```

### 9.11 SwiftUI

```swift
import SwiftUI
import UniformTypeIdentifiers

struct FileUploadView: View {
    @State private var selectedFiles: [URL] = []
    @State private var isImporting = false

    var body: some View {
        VStack(spacing: 16) {
            // Drop zone / picker trigger
            Button(action: { isImporting = true }) {
                VStack(spacing: 12) {
                    Image(systemName: "arrow.up.doc")
                        .font(.system(size: 32))
                        .foregroundColor(.secondary)
                    Text("Choose files to upload")
                        .font(.subheadline)
                    Text("PNG, JPG, or PDF up to 10MB")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding(32)
                .background(RoundedRectangle(cornerRadius: 12).strokeBorder(style: StrokeStyle(lineWidth: 2, dash: [8])).foregroundColor(.gray))
            }
            .fileImporter(isPresented: $isImporting, allowedContentTypes: [.png, .jpeg, .pdf], allowsMultipleSelection: true) { result in
                switch result {
                case .success(let urls): selectedFiles.append(contentsOf: urls)
                case .failure(let error): print(error)
                }
            }

            // File list
            ForEach(selectedFiles, id: \.self) { url in
                HStack {
                    Image(systemName: "doc")
                    Text(url.lastPathComponent).lineLimit(1)
                    Spacer()
                    Button(action: { selectedFiles.removeAll { $0 == url } }) {
                        Image(systemName: "xmark.circle.fill").foregroundColor(.secondary)
                    }
                    .accessibilityLabel("Remove \(url.lastPathComponent)")
                }
                .padding(12)
                .background(RoundedRectangle(cornerRadius: 8).fill(Color(.systemGray6)))
            }
        }
    }
}
```

### 9.12 Jetpack Compose

```kotlin
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun FileUploadField(
    onFilesSelected: (List<Uri>) -> Unit,
    acceptedTypes: Array<String> = arrayOf("image/png", "image/jpeg", "application/pdf"),
    maxFiles: Int = 10
) {
    var selectedFiles by remember { mutableStateOf<List<Uri>>(emptyList()) }

    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.OpenMultipleDocuments()) { uris ->
        selectedFiles = (selectedFiles + uris).take(maxFiles)
        onFilesSelected(selectedFiles)
    }

    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        // Dropzone (tap to pick)
        OutlinedButton(
            onClick = { launcher.launch(acceptedTypes) },
            modifier = Modifier.fillMaxWidth().height(120.dp),
            border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.outline)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Default.Upload, contentDescription = null, modifier = Modifier.size(32.dp))
                Spacer(Modifier.height(8.dp))
                Text("Choose files to upload")
                Text("PNG, JPG, PDF up to 10MB", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }

        // File list
        selectedFiles.forEach { uri ->
            val name = uri.lastPathSegment ?: "file"
            ListItem(
                headlineContent = { Text(name, maxLines = 1) },
                trailingContent = {
                    IconButton(onClick = { selectedFiles = selectedFiles - uri; onFilesSelected(selectedFiles) }) {
                        Icon(Icons.Default.Close, contentDescription = "Remove $name")
                    }
                },
                modifier = Modifier.border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(8.dp))
            )
        }
    }
}
```

### 9.13 Flutter

```dart
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';

class FileUploadWidget extends StatefulWidget {
  final Function(List<PlatformFile>) onFilesSelected;
  final List<String> allowedExtensions;
  final int maxSizeBytes;

  const FileUploadWidget({
    super.key,
    required this.onFilesSelected,
    this.allowedExtensions = const ['png', 'jpg', 'jpeg', 'pdf'],
    this.maxSizeBytes = 10 * 1024 * 1024,
  });

  @override State<FileUploadWidget> createState() => _FileUploadWidgetState();
}

class _FileUploadWidgetState extends State<FileUploadWidget> {
  List<PlatformFile> _files = [];

  Future<void> _pickFiles() async {
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: true,
      type: FileType.custom,
      allowedExtensions: widget.allowedExtensions,
    );
    if (result != null) {
      final valid = result.files.where((f) => (f.size) <= widget.maxSizeBytes).toList();
      setState(() => _files = [..._files, ...valid]);
      widget.onFilesSelected(_files);
    }
  }

  void _removeFile(int index) {
    setState(() => _files.removeAt(index));
    widget.onFilesSelected(_files);
  }

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      // Dropzone
      InkWell(
        onTap: _pickFiles,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(32),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey.shade600, width: 2, style: BorderStyle.none),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(children: [
            Icon(Icons.cloud_upload_outlined, size: 32, color: Colors.grey.shade500),
            const SizedBox(height: 12),
            const Text('Choose files to upload', style: TextStyle(fontWeight: FontWeight.w500)),
            Text('PNG, JPG, PDF up to 10MB', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
          ]),
        ),
      ),
      // File list
      if (_files.isNotEmpty) ...[
        const SizedBox(height: 12),
        ..._files.asMap().entries.map((entry) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: const Icon(Icons.insert_drive_file_outlined),
            title: Text(entry.value.name, maxLines: 1, overflow: TextOverflow.ellipsis),
            subtitle: Text(_formatSize(entry.value.size)),
            trailing: IconButton(
              icon: const Icon(Icons.close),
              onPressed: () => _removeFile(entry.key),
              tooltip: 'Remove ${entry.value.name}',
            ),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: BorderSide(color: Colors.grey.shade700)),
            dense: true,
          ),
        )),
      ],
    ]);
  }

  String _formatSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }
}
```

### 9.14 Testing

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Dropzone } from "./Dropzone";

describe("File Upload/Dropzone", () => {
  it("has an accessible file input", () => {
    render(<Dropzone onUpload={async () => {}} />);
    expect(screen.getByLabelText(/upload/i)).toBeInTheDocument();
  });

  it("shows drag-over state on dragenter", () => {
    const { container } = render(<Dropzone onUpload={async () => {}} />);
    const zone = container.querySelector('.dropzone')!;
    fireEvent.dragEnter(zone, { dataTransfer: { files: [] } });
    expect(zone).toHaveClass('is-drag-over');
  });

  it("adds files on drop", async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<Dropzone onUpload={onUpload} />);
    const zone = container.querySelector('.dropzone')!;
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    expect(await screen.findByText('test.png')).toBeInTheDocument();
  });

  it("rejects files over maxSize", () => {
    render(<Dropzone onUpload={async () => {}} maxSize={1024} />);
    const input = screen.getByLabelText(/upload/i);
    const bigFile = new File(['x'.repeat(2000)], 'big.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [bigFile] } });
    expect(screen.getByText(/too large/i)).toBeInTheDocument();
  });

  it("remove button removes a file", async () => {
    const { container } = render(<Dropzone onUpload={async () => {}} />);
    const zone = container.querySelector('.dropzone')!;
    const file = new File(['c'], 'doc.pdf', { type: 'application/pdf' });
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    const removeBtn = await screen.findByRole('button', { name: /remove doc.pdf/i });
    await userEvent.click(removeBtn);
    expect(screen.queryByText('doc.pdf')).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Dropzone onUpload={async () => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

* * *
## 10\. Accessibility
**The** **`<input type="file">`** **IS the accessible interface.** It triggers the native OS file picker which is fully accessible (keyboard, screen reader, switch control). The dropzone is a visual enhancement ON TOP of this. If drag-and-drop disappeared tomorrow, the upload would still work via the input.

**The dropzone must be clickable AND keyboard-accessible.** Wrapping the dropzone content in a `<label for="file-input">` makes clicking anywhere trigger the file picker. The input is focusable (even when sr-only), so keyboard users can Tab to it and press Enter/Space to open the picker.

**File list updates announced via** **`aria-live="polite"`****\*\*\*\*.** When files are added, removed, or change status (uploading → complete), AT announces the change without interrupting.

**Progress bars use** **`role="progressbar"`** with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-label` ("Uploading photo.jpg: 65%"). Update `aria-valuenow` as progress changes.

**Error messages linked to the relevant file.** Either within the file list item (read naturally in sequence) or linked via `aria-describedby`.

**Remove buttons have descriptive labels.** Not just "×" but `aria-label="Remove photo.jpg"`. Otherwise AT reads "button, times."

**Drag-and-drop is invisible to AT.** Screen readers and keyboard users can't drag. The browse button (input) is their path. Never make drag the ONLY way to upload.

**Focus management on remove:** when a file is removed, move focus to the next file's remove button, or to the dropzone if no files remain. Don't strand focus.

* * *
## 11\. Innovative / Emerging Ideas
*   **Resumable uploads (tus protocol):** if the connection drops during a large upload, resume from where it left off instead of restarting. Huge for video/large files.
*   **Chunked upload with progress:** split large files into chunks, upload sequentially, show granular progress. Bypass server-side max-body-size limits.
*   **Drag-from-other-apps:** accept files dragged from Finder/Explorer, emails, or other browser tabs.
*   **Paste upload:** Ctrl+V to upload from clipboard (screenshots, copied images). Extremely convenient for bug reports and documentation.
*   **Camera/webcam integration:** "Take a photo" option alongside "Browse" for mobile devices.
*   **AI pre-processing:** auto-categorize uploaded files, extract metadata, generate descriptions, optimize images client-side before upload.
*   **Collaborative upload:** multiple team members uploading to the same collection in real-time.

* * *
## 12\. Conversion / UX Killers
*   **No drag-and-drop on desktop:** forcing users to click Browse and navigate the file picker every time. Drag is expected and dramatically faster.
*   **No progress indication:** the upload runs with no visual feedback. Users don't know if it's working, stuck, or failed.
*   **Silent validation failures:** file is rejected with no explanation. Users try again and again.
*   **Losing files on page navigation:** user selects 5 files, accidentally navigates away, loses everything. Confirm before leaving if uploads are in progress.
*   **No retry on failure:** a file fails and the only option is to start over from file selection.
*   **Tiny dropzone:** a 40px-tall sliver that's hard to hit with a drag. Make it generous (≥120px).
*   **No file type guidance BEFORE selecting:** users don't know what's accepted until they try and fail. Show accepted types upfront.
*   **Upload starts automatically with no confirmation:** user accidentally drops a file and it immediately uploads. Consider a "Start upload" button for sensitive contexts.
*   **Can't cancel an in-progress upload:** once it starts, users are stuck waiting.

* * *
## 13\. Advanced Patterns
### Client-side image preview

```typescript
function generatePreview(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) { resolve(''); return; }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}
// Or more efficiently: URL.createObjectURL(file) for thumbnail display
```

### XHR upload with real progress

```typescript
function uploadWithProgress(file: File, url: string, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener('load', () => xhr.status < 400 ? resolve() : reject(new Error('Upload failed')));
    xhr.addEventListener('error', () => reject(new Error('Network error')));
    xhr.open('POST', url);
    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  });
}
```

### Paste upload

```typescript
document.addEventListener('paste', (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  const files = [...items]
    .filter(item => item.kind === 'file')
    .map(item => item.getAsFile()!)
    .filter(Boolean);
  if (files.length) addFiles(files);
});
```

* * *
## 14\. Performance & Bundle Cost
*   **Client-side validation before upload.** Don't waste bandwidth uploading a 500MB file only for the server to reject it. Validate type and size client-side immediately.
*   **Compress images client-side.** Use `<canvas>` to resize/compress images before uploading. Saves bandwidth and server processing.
*   **Generate thumbnails via** **`URL.createObjectURL`** (instant, no FileReader needed) rather than `FileReader.readAsDataURL` (slower, generates a huge base64 string).
*   **Upload in parallel with limit.** Upload 3 files concurrently (not all at once, which overwhelms the network, and not sequentially, which is slow).
*   **Abort controller per upload.** When user cancels or removes a file, abort the in-flight request immediately.
*   **Clean up object URLs.** `URL.revokeObjectURL(preview)` when a file is removed or the component unmounts. Otherwise memory leaks.

* * *
## 15\. Security
File upload is one of the most attacked surfaces in web applications. Every rule here is non-negotiable.

**Server-side validation (NEVER trust the client):**
*   Validate MIME type by reading file magic bytes, not just the `Content-Type` header or extension (both are spoofable).
*   Enforce max file size server-side (client-side is a UX convenience, not security).
*   Restrict allowed extensions to a whitelist.

**Filename sanitization:**
*   Never use the original filename for storage. Generate a UUID.
*   Strip path components (`../../etc/passwd` in a filename is a path traversal attack).
*   Limit filename length.

**Storage:**
*   Store uploads outside the web root (not in `/public/uploads/`).
*   Serve uploaded files through a controlled endpoint that sets proper `Content-Type` and `Content-Disposition` headers.
*   Never execute uploaded files (disable script execution in the upload directory).

**CSRF protection:** the upload endpoint MUST have CSRF protection. A malicious page could auto-submit a form that uploads a file to your server.

**Rate limiting:** limit uploads per user per time window. Prevents storage abuse and DoS.

**Virus scanning:** for sensitive applications, scan uploaded files with ClamAV or similar before making them available.

**Content-Type sniffing:** set `X-Content-Type-Options: nosniff` on served files. Prevents browsers from executing a `.jpg` that's actually a `.html`.

* * *
## 16\. Senior-Level Checklist
- [ ] `<input type="file">` present (accessible foundation)
- [ ] Input has `aria-label` and `accept` attribute
- [ ] Dropzone is keyboard-accessible (click or Enter opens picker)
- [ ] Drag-and-drop with clear visual feedback (border/background change)
- [ ] Invalid drag state shown (wrong file type hovering)
- [ ] File type validation client-side with clear error messages
- [ ] File size validation client-side with clear error messages
- [ ] Upload progress per file (`role="progressbar"` with `aria-valuenow`)
- [ ] Cancel per file during upload
- [ ] Remove per file (with `aria-label="Remove [filename]"`)
- [ ] Error state per file with retry option
- [ ] Success indicator per file
- [ ] Image preview for image uploads
- [ ] File list uses `aria-live="polite"` for announcements
- [ ] Focus not stranded on remove (moves to next item or dropzone)
- [ ] Constraint text visible before selection (types, max size)
- [ ] Server validates type (magic bytes), size, and filename
- [ ] Filename sanitized server-side (UUID, no path traversal)
- [ ] CSRF protection on upload endpoint
- [ ] Files stored outside web root
- [ ] `X-Content-Type-Options: nosniff` on served files
- [ ] Rate limiting on upload endpoint
- [ ] Object URLs cleaned up on unmount

* * *
## 17\. Visual Styles
The same file upload rendered across eleven aesthetics. The style is skin; the `<input type="file">`, keyboard access, progress bars, and ARIA never change.

**Flat:** dashed border dropzone, solid on hover/drag. Clean icon. File list items are simple rows with thin borders. The universal default.

**Material:** outlined dropzone with M3 surface color. Ripple on click. File items are M3 list items with leading thumbnail, trailing icon button. Progress bar uses M3 linear indicator.

**Glassmorphism:** frosted glass dropzone panel over blurred content. File items have glass background. Border becomes solid frost on drag-over.

**Liquid Glass (2026):** refractive dropzone border with specular rim. On drag-over, the entire zone gets the liquid glass material fill with inner refraction. File items float on glass cards.

**Neumorphism:** dropzone is a recessed area (inset shadows) in the soft surface. On drag-over, it appears to "open" (shadows deepen). File items are flush with the surface.

**Skeuomorphism:** dropzone looks like a paper tray or inbox. File items look like physical document thumbnails with dog-ear corners and shadows.

**Neo-Brutalism:** thick dashed border (3px), hard offset shadow on the dropzone. File items have bold borders. Progress bar is thick and colored. High contrast, high personality.

**Claymorphism:** puffy rounded dropzone with soft inner glow. File items are soft rounded pills. Progress bars are thick and rounded. Playful.

**Aurora/Gradient:** dropzone border is an animated gradient on drag-over. File item progress bars use gradient fills. Honor `prefers-reduced-motion`.

**Minimal/Swiss:** thin solid border (1px), no dashes. Minimal decoration. File list is just text with a hairline between items. The icon is small and precise.

**UJG Brand:** Night surface dropzone with Eminence dashed border. On drag-over, border becomes solid Goldenrod with warm glow. File items on Night with Eminence accent. Progress bar in Goldenrod.

Full style definitions on the Private ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).