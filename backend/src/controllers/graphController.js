import {
  getGraphNodes,
  getRelatedQuestions,
  getStatsForUser
} from "../services/graphService.js";

export async function graphNodes(req, res) {
  const graph = await getGraphNodes(req.user.id);
  res.json(graph);
}

export async function graphStats(req, res) {
  const stats = await getStatsForUser(req.user.id);
  res.json(stats);
}

export async function graphRelated(req, res) {
  const related = await getRelatedQuestions(req.user.id, req.params.id);
  res.json(related);
}

