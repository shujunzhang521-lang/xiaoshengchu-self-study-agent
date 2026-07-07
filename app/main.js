import { buildDefaultSession, questionBank, subjects } from "./data.js";
import {
  buildParentBrief,
  buildQuestionsById,
  buildSubjectsById,
  getOverallProgress,
  getSubjectProgress,
  getUnstableKnowledge,
  gradeAnswer,
  updateKnowledgeStatus,
} from "./learning.js";

const STORAGE_KEY = "xiaoshengchu-self-study-session";
const app = document.querySelector("#app");
const questionsById = buildQuestionsById(questionBank);
const subjectsById = buildSubjectsById(subjects);
const reasonOptions = ["概念不清", "方法不会", "审题错误", "计算或拼写错误", "表达不完整", "粗心"];

let session = loadSession();
let draftAnswer = "";
let activeFeedback = null;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultSession(todayIso());
    const parsed = JSON.parse(raw);
    if (parsed.dateIso !== todayIso()) return buildDefaultSession(todayIso());
    return { ...buildDefaultSession(todayIso()), ...parsed };
  } catch {
    return buildDefaultSession(todayIso());
  }
}

function saveSession() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    showToast("本次记录无法保存，但可以继续学习。");
  }
}

function setSession(nextSession) {
  session = nextSession;
  saveSession();
  render();
}

function getSubjectQuestions(subjectId) {
  return questionBank.filter((question) => question.subject === subjectId);
}

function getCurrentQuestion() {
  const subjectQuestions = getSubjectQuestions(session.currentSubject);
  return subjectQuestions.find((question) => !session.answers[question.id]) || subjectQuestions[0];
}

function getNextSubjectId() {
  const currentIndex = subjects.findIndex((subject) => subject.id === session.currentSubject);
  const next = subjects[currentIndex + 1];
  return next?.id || "reflection";
}

function submitAnswer(event) {
  event.preventDefault();
  const question = getCurrentQuestion();
  if (!question || !draftAnswer.trim()) {
    showToast("先写下答案，再提交。");
    return;
  }

  const result = gradeAnswer(question, draftAnswer);
  activeFeedback = { questionId: question.id, ...result };
  session = {
    ...session,
    answers: {
      ...session.answers,
      [question.id]: {
        value: draftAnswer,
        correct: result.correct,
        reason: result.correct ? "已掌握" : "",
      },
    },
    knowledgeStatus: updateKnowledgeStatus(session.knowledgeStatus, question, result.correct),
  };
  draftAnswer = "";
  saveSession();
  render();
}

function chooseReason(questionId, reason) {
  const answer = session.answers[questionId];
  setSession({
    ...session,
    answers: {
      ...session.answers,
      [questionId]: { ...answer, reason },
    },
  });
}

function moveNext() {
  activeFeedback = null;
  const progress = getSubjectProgress(session, questionBank, session.currentSubject);
  if (progress.complete) {
    const nextSubject = getNextSubjectId();
    if (nextSubject !== "reflection") {
      session = { ...session, currentSubject: nextSubject };
    }
  }
  draftAnswer = "";
  saveSession();
  render();
}

function setEnergy(energy) {
  setSession({ ...session, energy });
}

function setSubject(subjectId) {
  activeFeedback = null;
  draftAnswer = "";
  setSession({ ...session, currentSubject: subjectId });
}

function setReflection(value) {
  setSession({ ...session, reflection: value });
}

function generateBrief() {
  const parentBrief = buildParentBrief(session, questionsById, subjectsById);
  setSession({ ...session, parentBrief });
}

function resetToday() {
  activeFeedback = null;
  draftAnswer = "";
  setSession(buildDefaultSession(todayIso()));
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 2400);
}

function render() {
  const progress = getOverallProgress(session, questionBank);
  const currentSubject = subjectsById[session.currentSubject];
  const currentQuestion = getCurrentQuestion();
  const unstable = getUnstableKnowledge(session);

  app.innerHTML = `
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="eyebrow">杭州滨江 · 小升初暑假航线</p>
        <h1>今天把薄弱点点亮一点点</h1>
        <p class="hero-text">90 分钟完成语数英查漏和初一预习。先做题，再看反馈，最后用一句话复盘。</p>
      </div>
      <div class="mission-card">
        <span class="mission-label">今日进度</span>
        <strong>${progress}%</strong>
        <div class="progress-track"><span style="width:${progress}%"></span></div>
        <p>${session.energy ? `状态：${session.energy}` : "先选择今天的学习状态"}</p>
      </div>
    </section>

    <section class="energy-row" aria-label="今日状态">
      ${["精神很好", "状态一般", "有点累"].map((energy) => `
        <button class="energy-chip ${session.energy === energy ? "selected" : ""}" data-energy="${energy}">${energy}</button>
      `).join("")}
    </section>

    <section class="route-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">今日航线</p>
          <h2>四个站点，完成一个点亮一个</h2>
        </div>
        <button class="ghost-button" data-reset>重新开始今天</button>
      </div>
      <div class="station-grid">
        ${subjects.map(renderStation).join("")}
      </div>
    </section>

    <section class="main-grid">
      <article class="study-card" style="--subject:${currentSubject.color}">
        ${renderQuestionCard(currentSubject, currentQuestion)}
      </article>

      <aside class="side-stack">
        ${renderKnowledgePanel(unstable)}
        ${renderReflectionPanel()}
      </aside>
    </section>
  `;

  bindEvents();
}

function renderStation(subject) {
  const progress = getSubjectProgress(session, questionBank, subject.id);
  const active = session.currentSubject === subject.id;
  return `
    <button class="station ${active ? "active" : ""} ${progress.complete ? "complete" : ""}" data-subject="${subject.id}" style="--subject:${subject.color}">
      <span class="station-icon">${subject.icon}</span>
      <span>
        <strong>${subject.label}</strong>
        <small>${subject.station} · ${subject.minutes} 分钟</small>
      </span>
      <em>${progress.answered}/${progress.total}</em>
    </button>
  `;
}

function renderQuestionCard(subject, question) {
  const progress = getSubjectProgress(session, questionBank, subject.id);
  const answer = session.answers[question.id];
  const feedback = activeFeedback?.questionId === question.id ? activeFeedback : null;
  const isDone = progress.complete;

  return `
    <div class="task-kicker">
      <span class="subject-mark">${subject.icon}</span>
      <div>
        <p>${subject.label} · ${subject.station}</p>
        <strong>${progress.answered}/${progress.total} 已完成</strong>
      </div>
    </div>
    <h2>${isDone ? `${subject.label}站点已点亮` : question.prompt}</h2>
    ${isDone ? `
      <p class="done-copy">这个站点今天已经完成。可以切换到下一个站点，或者回看右侧的知识状态。</p>
      <button class="primary-button" data-next>去下一个站点</button>
    ` : `
      <form class="answer-form">
        ${renderAnswerInput(question)}
        <button class="primary-button" type="submit">提交答案</button>
      </form>
    `}
    ${feedback ? renderFeedback(question, feedback, answer) : ""}
  `;
}

function renderAnswerInput(question) {
  if (question.type === "choice") {
    return `
      <div class="choice-list">
        ${question.options.map((option) => `
          <label class="choice-option">
            <input type="radio" name="answer" value="${escapeHtml(option)}" ${draftAnswer === option ? "checked" : ""} />
            <span>${option}</span>
          </label>
        `).join("")}
      </div>
    `;
  }
  return `<input class="text-answer" name="answer" value="${escapeHtml(draftAnswer)}" placeholder="在这里写答案" autocomplete="off" />`;
}

function renderFeedback(question, feedback, answer) {
  return `
    <div class="feedback ${feedback.correct ? "correct" : "incorrect"}">
      <strong>${feedback.correct ? "答对了，站点能量 +1" : "这题值得停一下"}</strong>
      <p>${feedback.correct ? feedback.coachTip : feedback.explanation}</p>
      ${feedback.correct ? "" : `
        <div class="reason-box">
          <span>这次更像是哪种原因？</span>
          <div class="reason-grid">
            ${reasonOptions.map((reason) => `
              <button class="reason-chip ${answer?.reason === reason ? "selected" : ""}" data-reason="${reason}" data-question="${question.id}">${reason}</button>
            `).join("")}
          </div>
        </div>
      `}
      <button class="secondary-button" data-next>${feedback.correct ? "继续下一题" : "记住了，继续"}</button>
    </div>
  `;
}

function renderKnowledgePanel(unstable) {
  const entries = Object.entries(session.knowledgeStatus);
  return `
    <section class="info-card">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">知识状态</p>
          <h3>今天点亮了什么</h3>
        </div>
      </div>
      ${entries.length ? `
        <div class="knowledge-list">
          ${entries.map(([knowledge, item]) => `
            <div class="knowledge-item ${item.status}">
              <span>${knowledge}</span>
              <strong>${item.status === "stable" ? "基本掌握" : "需巩固"}</strong>
            </div>
          `).join("")}
        </div>
      ` : `<p class="muted">完成第一题后，这里会出现知识点状态。</p>`}
      ${unstable.length ? `<p class="hint">优先回看：${unstable.map((item) => item.knowledge).join("、")}</p>` : ""}
    </section>
  `;
}

function renderReflectionPanel() {
  return `
    <section class="info-card reflection-card">
      <p class="eyebrow">今日复盘</p>
      <h3>用一句话告诉明天的自己</h3>
      <textarea data-reflection placeholder="我今天最容易错的是……下次我要……">${escapeHtml(session.reflection)}</textarea>
      <button class="primary-button full" data-brief>生成家长今日观察</button>
      ${session.parentBrief ? `<pre class="brief">${escapeHtml(session.parentBrief)}</pre>` : `<p class="muted">完成几道题后生成简报，会更准确。</p>`}
    </section>
  `;
}

function bindEvents() {
  app.querySelectorAll("[data-energy]").forEach((button) => {
    button.addEventListener("click", () => setEnergy(button.dataset.energy));
  });
  app.querySelectorAll("[data-subject]").forEach((button) => {
    button.addEventListener("click", () => setSubject(button.dataset.subject));
  });
  app.querySelector("[data-reset]")?.addEventListener("click", resetToday);
  app.querySelector(".answer-form")?.addEventListener("submit", submitAnswer);
  app.querySelectorAll("input[name='answer']").forEach((input) => {
    input.addEventListener("input", (event) => {
      draftAnswer = event.target.value;
    });
  });
  app.querySelectorAll("[data-reason]").forEach((button) => {
    button.addEventListener("click", () => chooseReason(button.dataset.question, button.dataset.reason));
  });
  app.querySelectorAll("[data-next]").forEach((button) => {
    button.addEventListener("click", moveNext);
  });
  app.querySelector("[data-reflection]")?.addEventListener("input", (event) => {
    session.reflection = event.target.value;
    saveSession();
  });
  app.querySelector("[data-brief]")?.addEventListener("click", generateBrief);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

render();
