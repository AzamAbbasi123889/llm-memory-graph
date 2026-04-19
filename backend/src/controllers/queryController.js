import {
  askQuestionWithMemory,
  deleteHistoryItem,
  fetchHistoryRecords
} from "../services/queryService.js";

export async function askQuestion(req, res) {
  const response = await askQuestionWithMemory({
    userId: req.user.id,
    question: req.body.question,
    sessionId: req.body.sessionId
  });

  res.status(201).json(response);
}

export async function getHistory(req, res) {
  const history = await fetchHistoryRecords(req.user.id, req.query.q || "");
  res.json(history);
}

export async function deleteQuestion(req, res) {
  const result = await deleteHistoryItem(req.user.id, req.params.id);
  res.json(result);
}

