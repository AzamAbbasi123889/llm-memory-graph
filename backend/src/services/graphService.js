import { fetchHistoryRecords } from "./queryService.js";
import { runInSession } from "../config/neo4j.js";

const toNumber = (value) => {
  if (value && typeof value.toNumber === "function") {
    return value.toNumber();
  }

  return Number(value || 0);
};

const formatDay = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));

function groupSessions(history) {
  const map = new Map();

  history.forEach((item) => {
    if (!map.has(item.sessionId)) {
      map.set(item.sessionId, {
        id: item.sessionId,
        title: item.sessionTitle,
        updatedAt: item.createdAt,
        questionCount: 0
      });
    }

    const session = map.get(item.sessionId);
    session.questionCount += 1;
    if (new Date(item.createdAt).getTime() > new Date(session.updatedAt).getTime()) {
      session.updatedAt = item.createdAt;
    }
  });

  return [...map.values()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getGraphNodes(userId) {
  const records = await runInSession("READ", (session) =>
    session.run(
      `
        MATCH (:User {id: $userId})-[:OWNS]->(s:Session)-[:HAS_QUESTION]->(q:Question)-[:ANSWERED_WITH]->(a:Answer)
        OPTIONAL MATCH (q)-[:ABOUT]->(t:Topic)
        RETURN
          s.id AS sessionId,
          s.title AS sessionTitle,
          s.createdAt AS sessionCreatedAt,
          q.id AS questionId,
          q.content AS question,
          q.createdAt AS questionCreatedAt,
          a.id AS answerId,
          a.content AS answer,
          a.source AS source,
          a.createdAt AS answerCreatedAt,
          collect(DISTINCT t.name) AS topics
      `
      ,
      { userId }
    )
  );

  const nodes = new Map();
  const links = [];
  records.records.forEach((record) => {
    const sessionId = record.get("sessionId");
    const sessionTitle = record.get("sessionTitle");
    const questionId = record.get("questionId");
    const answerId = record.get("answerId");
    const question = record.get("question");
    const answer = record.get("answer");
    const source = record.get("source");
    const topics = (record.get("topics") || []).filter(Boolean);

    nodes.set(sessionId, {
      id: sessionId,
      type: "session",
      label: sessionTitle,
      preview: sessionTitle,
      content: sessionTitle,
      createdAt: record.get("sessionCreatedAt")
    });

    nodes.set(questionId, {
      id: questionId,
      type: "question",
      label: question,
      preview: question,
      content: question,
      createdAt: record.get("questionCreatedAt"),
      askText: question,
      topics
    });

    nodes.set(answerId, {
      id: answerId,
      type: "answer",
      label: answer.slice(0, 60),
      preview: answer,
      content: answer,
      source,
      createdAt: record.get("answerCreatedAt"),
      askText: question,
      topics
    });

    links.push({ source: sessionId, target: questionId, type: "session-question" });
    links.push({ source: questionId, target: answerId, type: "question-answer" });

    topics.forEach((topic) => {
      const topicId = `topic:${topic}`;
      nodes.set(topicId, {
        id: topicId,
        type: "topic",
        label: topic,
        preview: topic,
        content: `Topic cluster: ${topic}`,
        createdAt: record.get("questionCreatedAt")
      });
      links.push({ source: questionId, target: topicId, type: "question-topic" });
      links.push({ source: answerId, target: topicId, type: "answer-topic" });
    });
  });

  const similarityRecords = await runInSession("READ", (session) =>
    session.run(
      `
        MATCH (:User {id: $userId})-[:OWNS]->(:Session)-[:HAS_QUESTION]->(q1:Question)-[r:SIMILAR_TO]->(q2:Question)
        RETURN q1.id AS sourceId, q2.id AS targetId, r.score AS score
      `,
      { userId }
    )
  );

  similarityRecords.records.forEach((record) => {
    links.push({
      source: record.get("sourceId"),
      target: record.get("targetId"),
      type: "similar-question",
      score: toNumber(record.get("score"))
    });
  });

  return {
    nodes: [...nodes.values()],
    links,
    topics: [...new Set(
      [...nodes.values()]
        .filter((node) => node.type === "topic")
        .map((node) => node.label)
    )].sort()
  };
}

export async function getStatsForUser(userId) {
  const history = await fetchHistoryRecords(userId);
  const sessions = groupSessions(history);
  const memoryHits = history.filter((item) => item.source === "memory").length;
  const llmCalls = history.filter((item) => item.source === "llm").length;
  const totalQuestions = history.length;
  const cacheHitRate = totalQuestions ? Math.round((memoryHits / totalQuestions) * 100) : 0;
  const tokensSaved = history.reduce((sum, item) => sum + (item.tokensSaved || 0), 0);

  const now = new Date();
  const fourteenDays = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (13 - index));
    return {
      key: date.toISOString().slice(0, 10),
      date: formatDay(date),
      count: 0
    };
  });
  const dayMap = new Map(fourteenDays.map((item) => [item.key, item]));

  history.forEach((item) => {
    const key = item.createdAt.slice(0, 10);
    if (dayMap.has(key)) {
      dayMap.get(key).count += 1;
    }
  });

  const questionFrequency = new Map();
  history.forEach((item) => {
    questionFrequency.set(item.question, (questionFrequency.get(item.question) || 0) + 1);
  });

  const previousWeek = history.filter((item) => {
    const diff = now.getTime() - new Date(item.createdAt).getTime();
    return diff > 7 * 24 * 60 * 60 * 1000 && diff <= 14 * 24 * 60 * 60 * 1000;
  });
  const currentWeek = history.filter((item) => now.getTime() - new Date(item.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000);

  const percentChange = (current, previous) => {
    if (!previous) return current ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const previousMemoryHits = previousWeek.filter((item) => item.source === "memory").length;
  const currentMemoryHits = currentWeek.filter((item) => item.source === "memory").length;
  const previousLlmCalls = previousWeek.filter((item) => item.source === "llm").length;
  const currentLlmCalls = currentWeek.filter((item) => item.source === "llm").length;
  const previousTokensSaved = previousWeek.reduce((sum, item) => sum + (item.tokensSaved || 0), 0);
  const currentTokensSaved = currentWeek.reduce((sum, item) => sum + (item.tokensSaved || 0), 0);

  return {
    overview: {
      totalQuestions,
      cacheHitRate,
      llmCalls,
      tokensSaved,
      questionTrend: percentChange(currentWeek.length, previousWeek.length),
      cacheTrend: percentChange(currentMemoryHits, previousMemoryHits),
      llmTrend: percentChange(currentLlmCalls, previousLlmCalls),
      tokensTrend: percentChange(currentTokensSaved, previousTokensSaved)
    },
    cacheBreakdown: [
      { name: "Cache Hits", value: memoryHits },
      { name: "LLM Calls", value: llmCalls }
    ],
    dailyQuestions: fourteenDays,
    mostAskedQuestions: [...questionFrequency.entries()]
      .map(([question, count]) => ({ question, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    recentSessions: sessions.slice(0, 5)
  };
}

export async function getRelatedQuestions(userId, questionId) {
  const result = await runInSession("READ", (session) =>
    session.run(
      `
        MATCH (:User {id: $userId})-[:OWNS]->(:Session)-[:HAS_QUESTION]->(q:Question {id: $questionId})
        OPTIONAL MATCH (q)-[r:SIMILAR_TO]->(related:Question)-[:ANSWERED_WITH]->(a:Answer)
        RETURN related.id AS id, related.content AS question, a.content AS answer, r.score AS score
        ORDER BY r.score DESC
        LIMIT 5
      `,
      { userId, questionId }
    )
  );

  return result.records
    .filter((record) => record.get("id"))
    .map((record) => ({
      id: record.get("id"),
      question: record.get("question"),
      answer: record.get("answer"),
      score: toNumber(record.get("score"))
    }));
}
