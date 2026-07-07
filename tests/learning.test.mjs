import test from "node:test";
import assert from "node:assert/strict";

import {
  buildParentBrief,
  gradeAnswer,
  updateKnowledgeStatus,
} from "../app/learning.js";

const sampleQuestion = {
  id: "math-1",
  subject: "math",
  knowledge: "分数百分数",
  answer: "25%",
  acceptableAnswers: ["25%", "0.25", "四分之一"],
};

test("gradeAnswer accepts exact and alternate answers", () => {
  assert.equal(gradeAnswer(sampleQuestion, "25%").correct, true);
  assert.equal(gradeAnswer(sampleQuestion, " 0.25 ").correct, true);
  assert.equal(gradeAnswer(sampleQuestion, "20%").correct, false);
});

test("updateKnowledgeStatus moves knowledge between stable and needs_practice", () => {
  const stable = updateKnowledgeStatus({}, sampleQuestion, true);
  assert.equal(stable["分数百分数"].status, "stable");
  assert.equal(stable["分数百分数"].correct, 1);

  const needsPractice = updateKnowledgeStatus(stable, sampleQuestion, false);
  assert.equal(needsPractice["分数百分数"].status, "needs_practice");
  assert.equal(needsPractice["分数百分数"].incorrect, 1);
});

test("buildParentBrief summarizes completion, unstable knowledge, and next step", () => {
  const questionsById = {
    "math-1": sampleQuestion,
    "english-1": {
      id: "english-1",
      subject: "english",
      knowledge: "一般现在时",
      answer: "goes",
    },
  };
  const subjectsById = {
    math: { label: "数学" },
    english: { label: "英语" },
  };
  const session = {
    answers: {
      "math-1": { correct: false, reason: "审题错误" },
      "english-1": { correct: true, reason: "" },
    },
    reflection: "我今天分数题审题不够仔细。",
    knowledgeStatus: {
      分数百分数: { status: "needs_practice", correct: 0, incorrect: 1 },
      一般现在时: { status: "stable", correct: 1, incorrect: 0 },
    },
  };

  const brief = buildParentBrief(session, questionsById, subjectsById);
  assert.match(brief, /完成 2 题/);
  assert.match(brief, /分数百分数/);
  assert.match(brief, /审题错误/);
  assert.match(brief, /明天/);
});
