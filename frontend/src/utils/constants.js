export const APP_NAME = "NeuroGraph";

export const SEARCH_SUGGESTIONS = [
  "Explain transformers",
  "How does Neo4j work?",
  "What is cosine similarity?",
  "When should I use graph RAG?",
  "Compare embeddings vs symbolic search"
];

export const NAV_ITEMS = [
  { label: "Search", path: "/" },
  { label: "History", path: "/history" },
  { label: "Graph", path: "/graph" },
  { label: "Dashboard", path: "/dashboard" }
];

export const SOURCE_META = {
  memory: {
    label: "From Memory",
    tone: "success"
  },
  llm: {
    label: "AI Generated",
    tone: "info"
  }
};

export const PASSWORD_STRENGTH_LEVELS = [
  { label: "Weak", minScore: 0, color: "bg-error" },
  { label: "Medium", minScore: 2, color: "bg-warning" },
  { label: "Strong", minScore: 3, color: "bg-info" },
  { label: "Very Strong", minScore: 4, color: "bg-success" }
];
