export function normalizeAnswer(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function gradeAnswer(question, answer) {
  const normalized = normalizeAnswer(answer);
  const accepted = [question.answer, ...(question.acceptableAnswers || [])].map(normalizeAnswer);
  const correct = accepted.includes(normalized);

  return {
    correct,
    expected: question.answer,
    explanation: question.explanation,
    coachTip: question.coachTip,
  };
}

export function updateKnowledgeStatus(previous, question, isCorrect) {
  const current = previous[question.knowledge] || {
    status: "not_started",
    correct: 0,
    incorrect: 0,
    subject: question.subject,
  };
  const next = {
    ...current,
    correct: current.correct + (isCorrect ? 1 : 0),
    incorrect: current.incorrect + (isCorrect ? 0 : 1),
    subject: question.subject,
  };
  next.status = next.incorrect > 0 ? "needs_practice" : "stable";

  return {
    ...previous,
    [question.knowledge]: next,
  };
}

export function getSubjectProgress(session, questionBank, subjectId) {
  const subjectQuestions = questionBank.filter((question) => question.subject === subjectId);
  const answered = subjectQuestions.filter((question) => session.answers[question.id]);
  const correct = answered.filter((question) => session.answers[question.id].correct);

  return {
    total: subjectQuestions.length,
    answered: answered.length,
    correct: correct.length,
    complete: subjectQuestions.length > 0 && answered.length === subjectQuestions.length,
  };
}

export function getOverallProgress(session, questionBank) {
  const answered = questionBank.filter((question) => session.answers[question.id]);
  return Math.round((answered.length / questionBank.length) * 100);
}

export function buildQuestionsById(questionBank) {
  return Object.fromEntries(questionBank.map((question) => [question.id, question]));
}

export function buildSubjectsById(subjects) {
  return Object.fromEntries(subjects.map((subject) => [subject.id, subject]));
}

export function getUnstableKnowledge(session) {
  return Object.entries(session.knowledgeStatus)
    .filter(([, item]) => item.status === "needs_practice")
    .map(([knowledge, item]) => ({ knowledge, ...item }));
}

export function buildParentBrief(session, questionsById, subjectsById) {
  const answerEntries = Object.entries(session.answers);
  const completed = answerEntries.length;
  const correct = answerEntries.filter(([, answer]) => answer.correct).length;
  const reasons = answerEntries
    .map(([, answer]) => answer.reason)
    .filter(Boolean);
  const unstable = getUnstableKnowledge(session);
  const unstableText = unstable.length
    ? unstable.map((item) => item.knowledge).join("、")
    : "暂时没有明显不稳定知识点";
  const reasonText = reasons.length ? [...new Set(reasons)].join("、") : "暂无明显错因";
  const subjectSet = new Set(
    answerEntries
      .map(([questionId]) => questionsById[questionId]?.subject)
      .filter(Boolean),
  );
  const subjectText = [...subjectSet]
    .map((subjectId) => subjectsById[subjectId]?.label || subjectId)
    .join("、");

  return [
    `今日观察：孩子完成 ${completed} 题，答对 ${correct} 题，覆盖 ${subjectText || "今日任务"}。`,
    `当前需要留意：${unstableText}。主要错因：${reasonText}。`,
    session.reflection ? `孩子自己的复盘是：“${session.reflection}”` : "今天还没有填写自我复盘。",
    "明天建议：先用 10 分钟回看不稳定知识点，再进入新任务。家长只需要确认孩子开始学习，并肯定他完成闭环这件事。",
  ].join("\n");
}
