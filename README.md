# TaskKraft

**TaskKraft** is a fully functional web application strictly built using HTML5, CSS3, and JavaScript libraries.
---

## 🌟 What Was Built

### 1. **Kanban Sprint & Task Manager ("TaskKraft")**
- **Interactive Drag-and-Drop Board**: Smooth HTML5 card movement across 4 phases: *To Do*, *In Progress*, *Review*, and *Completed*.
- **Subtask Progress Tracker**: Real-time calculated progress meters for task sub-items.
- **Priority & Search Filtering**: Instant search across titles/descriptions and priority filters (Urgent, High, Medium, Low).
- **Celebration Effects**: Confetti burst via `canvas-confetti` when a task status moves to *Completed*.

### 2. **Focus Timer & Procedural Soundscapes ("TimeKraft")**
- **SVG Radial Countdown Ring**: Smooth SVG stroke animation supporting 25m Pomodoro, 5m Short Break, and 15m Long Break.
- **Procedural Ambient Sound Generator**: Built with pure **Web Audio API** synthesis (Rainfall noise, Deep Space sine drone, White noise, Ocean waves) — requiring zero external MP3 downloads.
- **Chime Notifications**: Synthesized completion audio alerts upon timer expiry.

### 3. **Smart Markdown Workspace ("Notes")**
- **Live Dual-Pane Editor**: Real-time rendering powered by **Marked.js**.
- **Persistent Notes**: Instant auto-saving of notes to `localStorage`.

### 4. **Developer Utilities Suite ("Tools")**
- **JSON Formatter & Validator**: Format, prettify, minify, and copy JSON objects with error checking.
- **Base64 Converter**: Encode and decode Base64 strings.
- **Color Palette Generator**: Generate dynamic hex color palettes with click-to-copy.
- **Regex Matcher**: Real-time regex pattern evaluation and match highlights.

### 5. **Live Performance Analytics**
- **Interactive Charts**: Powered by **Chart.js** displaying task velocity trends and priority breakdown.

### 6. **Global Command Palette & System Integrity**
- **Quick Navigation Modal (`Ctrl+K` / `Cmd+K`)**: Instant search and view jumping.
- **Local Persistence & Workspace Export**: JSON backup & restore functionality.

---

## 📁 File Structure

Location: `Local Repository Path'

```
task-kraft/
├── index.html        # SPA shell with dark obsidian UI & view containers
├── css/
│   └── styles.css    # Complete glassmorphic design system & responsive layout
└── js/
    ├── app.js        # Core App State, LocalStorage, Views, Command Palette & Toasts
    ├── kanban.js     # Drag-and-drop Kanban card logic & modal controller
    ├── timer.js      # SVG radial countdown timer & Web Audio ambient synth
    ├── notes.js      # Live Markdown editor powered by Marked.js
    ├── tools.js      # Developer utilities (JSON, Base64, Palette, Regex)
    └── analytics.js  # Live Chart.js velocity & priority chart binding
```

---

## 🚀 How to Launch & Test

1. The app can currently served live using localhost for running it locally on your PC/Laptop: **[http://localhost:portnumber], Ex:- (http://localhost:3000)**
2. You can also directly open `index.html` located within your project directory or can open it by specifying its path in the terminal and using start keyword.
