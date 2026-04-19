export function groupHistoryIntoSessions(history = []) {
  const map = new Map();

  history.forEach((item) => {
    if (!map.has(item.sessionId)) {
      map.set(item.sessionId, {
        id: item.sessionId,
        title: item.sessionTitle || item.question,
        createdAt: item.sessionCreatedAt || item.createdAt,
        updatedAt: item.createdAt,
        items: []
      });
    }

    const session = map.get(item.sessionId);
    session.items.push(item);
    if (new Date(item.createdAt).getTime() > new Date(session.updatedAt).getTime()) {
      session.updatedAt = item.createdAt;
    }
  });

  return [...map.values()]
    .map((session) => ({
      ...session,
      questionCount: session.items.length,
      items: [...session.items].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    }))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function buildMessagesFromHistory(items = []) {
  return items.flatMap((item) => [
    {
      id: `${item.id}-question`,
      role: "user",
      content: item.question,
      createdAt: item.createdAt
    },
    {
      id: `${item.id}-answer`,
      role: "assistant",
      content: item.answer,
      source: item.source,
      timeTaken: item.timeTaken,
      tokensUsed: item.tokensUsed,
      relatedQuestions: item.relatedQuestions,
      questionId: item.id,
      createdAt: item.answerCreatedAt || item.createdAt
    }
  ]);
}

