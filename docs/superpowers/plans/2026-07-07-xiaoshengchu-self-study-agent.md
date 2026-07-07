# 小升初自学智能体 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local browser MVP for a Hangzhou Binjiang rising middle-school student to complete a 90-minute Chinese, math, English, and preview self-study loop.

**Architecture:** Use a dependency-free static web app with focused JavaScript modules for question data, learning state, scoring, and rendering. Persist daily progress in browser localStorage and make the UI feel like a child-friendly “summer learning cockpit.”

**Tech Stack:** HTML, CSS, vanilla JavaScript ES modules, localStorage, Node.js built-in test runner for pure logic tests.

## Global Constraints

- The first version runs locally on the family computer.
- No account system, no cloud deployment, no database, no OCR, no real AI API dependency.
- The app must include today task package, answering, feedback, wrong-reason selection, reflection, local record, and parent brief.
- Visual style must be layered, friendly, and more polished than an adult admin form.
- The subject colors are math `#14B8A6`, English `#8B5CF6`, Chinese `#F59E0B`, preview `#10B981`, primary action `#2563EB`, background `#F6F8FC`.
- Feedback should be coach-like, short, specific, and low-pressure.

---

## File Structure

- `app/index.html`: app shell and root containers.
- `app/styles.css`: complete responsive visual system and component styles.
- `app/data.js`: subject metadata and starter question bank.
- `app/learning.js`: pure functions for grading, progress, knowledge status, and parent brief.
- `app/main.js`: DOM rendering, event handling, and localStorage persistence.
- `tests/learning.test.mjs`: Node tests for learning logic.

### Task 1: Data And Learning Logic

**Files:**
- Create: `app/data.js`
- Create: `app/learning.js`
- Create: `tests/learning.test.mjs`

**Interfaces:**
- Produces: `subjects`, `questionBank`, `buildDefaultSession(dateIso)`
- Produces: `gradeAnswer(question, answer)`, `updateKnowledgeStatus(previous, question, isCorrect)`, `buildParentBrief(session, questionsById, subjectsById)`

- [ ] **Step 1: Write tests for grading, knowledge status, and parent brief.**
- [ ] **Step 2: Run `node --test tests/learning.test.mjs` and verify it fails before implementation.**
- [ ] **Step 3: Implement `data.js` and `learning.js`.**
- [ ] **Step 4: Run `node --test tests/learning.test.mjs` and verify it passes.**

### Task 2: App Shell And Rendering

**Files:**
- Create: `app/index.html`
- Create: `app/main.js`

**Interfaces:**
- Consumes: exports from `app/data.js` and `app/learning.js`.
- Produces: interactive study flow with dashboard, station navigation, question card, reflection, and parent brief.

- [ ] **Step 1: Build the HTML shell with root app container.**
- [ ] **Step 2: Implement localStorage loading and saving in `main.js`.**
- [ ] **Step 3: Render today's route, current station, question, feedback, knowledge status, and brief.**
- [ ] **Step 4: Verify in browser via local server or direct file open.**

### Task 3: Visual Design System

**Files:**
- Create: `app/styles.css`
- Modify: `app/index.html`
- Modify: `app/main.js`

**Interfaces:**
- Consumes: semantic class names from the shell.
- Produces: child-friendly layered UI with responsive desktop layout.

- [ ] **Step 1: Define palette, typography stack, page shell, cards, route stations, buttons, and form states.**
- [ ] **Step 2: Add subject icons and color-coded task stations.**
- [ ] **Step 3: Add subtle completion, active, and feedback micro-interactions.**
- [ ] **Step 4: Verify no text overlaps in desktop and narrow browser widths.**

### Task 4: End-To-End Verification

**Files:**
- Modify: `app/*`
- Modify: `tests/learning.test.mjs`

**Interfaces:**
- Consumes: full local app.
- Produces: verified MVP handoff path and run command.

- [ ] **Step 1: Run Node tests.**
- [ ] **Step 2: Start a local static server with `python3 -m http.server 5173 --directory app`.**
- [ ] **Step 3: Open or inspect `http://127.0.0.1:5173` and complete a sample learning flow.**
- [ ] **Step 4: Confirm localStorage persistence by refreshing and checking record remains.**
