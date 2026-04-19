import { v4 as uuidv4 } from "uuid";
import { runInSession } from "../config/neo4j.js";
import { AppError } from "../utils/errors.js";
import { generateAnswer } from "./groqService.js";

const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "because",
  "being",
  "between",
  "could",
  "does",
  "from",
  "have",
  "into",
  "just",
  "more",
  "over",
  "some",
  "than",
  "that",
  "their",
  "there",
  "these",
  "they",
  "this",
  "what",
  "when",
  "where",
  "which",
  "while",
  "with",
  "would",
  "your"
]);

const toNumber = (value) => {
  if (value && typeof value.toNumber === "function") {
    return value.toNumber();
  }

  return Number(value || 0);
};

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value = "") =>
  normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

const toTitle = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

const estimateTokens = (value = "") => Math.max(32, Math.round(value.split(/\s+/).length * 1.35));

const createSessionTitle = (question) =>
  question.length > 58 ? `${question.slice(0, 58).trim()}...` : question;

const similarityScore = (a, b) => {
  const left = new Set(tokenize(a));
  const right = new Set(tokenize(b));

  if (!left.size || !right.size) {
    return 0;
  }

  const intersection = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;
  return intersection / union;
};

const extractTopics = (question, answer) => {
  const frequency = new Map();
  [...tokenize(question), ...tokenize(answer)].forEach((token) => {
    frequency.set(token, (frequency.get(token) || 0) + 1);
  });

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([token]) => toTitle(token));
};

const buildRelatedQuestions = (question, candidates) => {
  const target = normalizeText(question);
  return candidates
    .filter((candidate) => normalizeText(candidate.question) !== target)
    .sort((a, b) => similarityScore(question, b.question) - similarityScore(question, a.question))
    .slice(0, 3)
    .map((candidate) => candidate.question);
};

async function ensureSession(userId, sessionId, question) {
  if (sessionId) {
    const existing = await runInSession("READ", (session) =>
      session.run(
        `
          MATCH (:User {id: $userId})-[:OWNS]->(s:Session {id: $sessionId})
          RETURN s.id AS id, s.title AS title
          LIMIT 1
        `,
        { userId, sessionId }
      )
    );

    if (existing.records.length) {
      return {
        id: existing.records[0].get("id"),
        title: existing.records[0].get("title")
      };
    }
  }

  const now = new Date().toISOString();
  const id = uuidv4();
  const title = createSessionTitle(question);

  await runInSession("WRITE", (session) =>
    session.run(
      `
        MATCH (u:User {id: $userId})
        CREATE (s:Session {
          id: $id,
          title: $title,
          createdAt: $createdAt,
          updatedAt: $updatedAt
        })
        CREATE (u)-[:OWNS]->(s)
      `,
      {
        userId,
        id,
        title,
        createdAt: now,
        updatedAt: now
      }
    )
  );

  return { id, title };
}

async function fetchCandidateMemories(userId) {
  const result = await runInSession("READ", (session) =>
    session.run(
      `
        MATCH (:User {id: $userId})-[:OWNS]->(:Session)-[:HAS_QUESTION]->(q:Question)-[:ANSWERED_WITH]->(a:Answer)
        RETURN q.id AS id, q.content AS question, q.normalized AS normalized, a.content AS answer, a.tokensUsed AS tokensUsed
        ORDER BY q.createdAt DESC
        LIMIT 80
      `,
      { userId }
    )
  );

  return result.records.map((record) => ({
    id: record.get("id"),
    question: record.get("question"),
    normalized: record.get("normalized"),
    answer: record.get("answer"),
    tokensUsed: toNumber(record.get("tokensUsed"))
  }));
}

async function saveQuestionAnswer({
  userId,
  sessionId,
  question,
  answer,
  source,
  tokensUsed,
  timeTaken,
  relatedQuestions,
  tokensSaved
}) {
  const normalizedQuestion = normalizeText(question);
  const topics = extractTopics(question, answer);
  const questionId = uuidv4();
  const answerId = uuidv4();
  const now = new Date().toISOString();

  await runInSession("WRITE", async (session) => {
    await session.run(
      `
        MATCH (:User {id: $userId})-[:OWNS]->(s:Session {id: $sessionId})
        CREATE (q:Question {
          id: $questionId,
          content: $question,
          normalized: $normalizedQuestion,
          createdAt: $createdAt
        })
        CREATE (a:Answer {
          id: $answerId,
          content: $answer,
          source: $source,
          tokensUsed: $tokensUsed,
          timeTaken: $timeTaken,
          tokensSaved: $tokensSaved,
          relatedQuestions: $relatedQuestions,
          createdAt: $createdAt
        })
        CREATE (s)-[:HAS_QUESTION]->(q)
        CREATE (q)-[:ANSWERED_WITH]->(a)
        SET s.updatedAt = $createdAt
      `,
      {
        userId,
        sessionId,
        questionId,
        answerId,
        question,
        answer,
        normalizedQuestion,
        createdAt: now,
        source,
        tokensUsed,
        timeTaken,
        tokensSaved,
        relatedQuestions
      }
    );

    if (topics.length) {
      await session.run(
        `
          MATCH (q:Question {id: $questionId})-[:ANSWERED_WITH]->(a:Answer)
          UNWIND $topics AS topicName
          MERGE (t:Topic {name: topicName})
          ON CREATE SET t.createdAt = $createdAt
          MERGE (q)-[:ABOUT]->(t)
          MERGE (a)-[:ABOUT]->(t)
        `,
        {
          questionId,
          topics,
          createdAt: now
        }
      );
    }
  });

  const candidates = await fetchCandidateMemories(userId);
  const related = candidates
    .filter((candidate) => candidate.id !== questionId)
    .map((candidate) => ({
      otherId: candidate.id,
      score: similarityScore(question, candidate.question)
    }))
    .filter((candidate) => candidate.score >= 0.28)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (related.length) {
    await runInSession("WRITE", (session) =>
      session.run(
        `
          UNWIND $related AS item
          MATCH (source:Question {id: $questionId})
          MATCH (target:Question {id: item.otherId})
          MERGE (source)-[r:SIMILAR_TO]->(target)
          SET r.score = item.score
        `,
        {
          questionId,
          related
        }
      )
    );
  }

  return {
    questionId,
    createdAt: now
  };
}

export async function askQuestionWithMemory({ userId, question, sessionId }) {
  const trimmedQuestion = question?.trim();

  if (!trimmedQuestion) {
    throw new AppError("Please ask a question first.", 400);
  }

  const session = await ensureSession(userId, sessionId, trimmedQuestion);
  const startedAt = Date.now();
  const candidates = await fetchCandidateMemories(userId);
  const normalizedQuestion = normalizeText(trimmedQuestion);
  const rankedCandidates = candidates
    .map((candidate) => ({
      ...candidate,
      score:
        candidate.normalized === normalizedQuestion
          ? 1
          : similarityScore(trimmedQuestion, candidate.question)
    }))
    .sort((a, b) => b.score - a.score);

  const bestMatch = rankedCandidates[0];
  const relatedQuestions = buildRelatedQuestions(trimmedQuestion, rankedCandidates);

  if (bestMatch && bestMatch.score >= 0.84) {
    const timeTaken = Date.now() - startedAt;
    const saved = await saveQuestionAnswer({
      userId,
      sessionId: session.id,
      question: trimmedQuestion,
      answer: bestMatch.answer,
      source: "memory",
      tokensUsed: 0,
      timeTaken,
      relatedQuestions,
      tokensSaved: bestMatch.tokensUsed || estimateTokens(bestMatch.answer)
    });

    return {
      answer: bestMatch.answer,
      source: "memory",
      timeTaken,
      tokensUsed: 0,
      relatedQuestions,
      sessionId: session.id,
      questionId: saved.questionId,
      createdAt: saved.createdAt
    };
  }

  const generation = await generateAnswer({
    question: trimmedQuestion,
    memorySnippets: rankedCandidates.slice(0, 3)
  });
  const timeTaken = Date.now() - startedAt;
  const saved = await saveQuestionAnswer({
    userId,
    sessionId: session.id,
    question: trimmedQuestion,
    answer: generation.answer,
    source: "llm",
    tokensUsed: generation.tokensUsed,
    timeTaken,
    relatedQuestions,
    tokensSaved: 0
  });

  return {
    answer: generation.answer,
    source: "llm",
    timeTaken,
    tokensUsed: generation.tokensUsed,
    relatedQuestions,
    sessionId: session.id,
    questionId: saved.questionId,
    createdAt: saved.createdAt
  };
}

export async function fetchHistoryRecords(userId, search = "") {
  const result = await runInSession("READ", (session) =>
    session.run(
      `
        MATCH (:User {id: $userId})-[:OWNS]->(s:Session)-[:HAS_QUESTION]->(q:Question)-[:ANSWERED_WITH]->(a:Answer)
        WHERE $search = "" OR toLower(q.content) CONTAINS $search OR toLower(a.content) CONTAINS $search
        RETURN
          q.id AS id,
          s.id AS sessionId,
          s.title AS sessionTitle,
          s.createdAt AS sessionCreatedAt,
          q.content AS question,
          a.content AS answer,
          a.source AS source,
          a.tokensUsed AS tokensUsed,
          a.timeTaken AS timeTaken,
          a.relatedQuestions AS relatedQuestions,
          a.tokensSaved AS tokensSaved,
          q.createdAt AS createdAt,
          a.createdAt AS answerCreatedAt
        ORDER BY q.createdAt DESC
      `,
      {
        userId,
        search: search.trim().toLowerCase()
      }
    )
  );

  return result.records.map((record) => ({
    id: record.get("id"),
    sessionId: record.get("sessionId"),
    sessionTitle: record.get("sessionTitle"),
    sessionCreatedAt: record.get("sessionCreatedAt"),
    question: record.get("question"),
    answer: record.get("answer"),
    source: record.get("source"),
    tokensUsed: toNumber(record.get("tokensUsed")),
    timeTaken: toNumber(record.get("timeTaken")),
    tokensSaved: toNumber(record.get("tokensSaved")),
    relatedQuestions: record.get("relatedQuestions") || [],
    createdAt: record.get("createdAt"),
    answerCreatedAt: record.get("answerCreatedAt")
  }));
}

export async function deleteHistoryItem(userId, questionId) {
  const result = await runInSession("WRITE", (session) =>
    session.run(
      `
        MATCH (:User {id: $userId})-[:OWNS]->(s:Session)-[:HAS_QUESTION]->(q:Question {id: $questionId})
        OPTIONAL MATCH (q)-[:ANSWERED_WITH]->(a:Answer)
        WITH s, q, a
        DETACH DELETE q, a
        WITH s
        OPTIONAL MATCH (s)-[:HAS_QUESTION]->(remaining:Question)
        WITH s, count(remaining) AS remainingCount
        FOREACH (_ IN CASE WHEN remainingCount = 0 THEN [1] ELSE [] END | DETACH DELETE s)
        RETURN remainingCount
      `,
      { userId, questionId }
    )
  );

  if (!result.records.length) {
    throw new AppError("That history item was not found.", 404);
  }

  return { success: true };
}

