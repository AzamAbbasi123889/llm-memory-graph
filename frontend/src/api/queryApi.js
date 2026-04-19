import api from "./axios";

export const askQuestion = async (data) => {
  const response = await api.post("/query/ask", data);
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get("/query/history");
  return response.data;
};

export const searchHistory = async (q) => {
  const response = await api.get("/query/history", {
    params: { q }
  });
  return response.data;
};

export const deleteQuestion = async (id) => {
  const response = await api.delete(`/query/history/${id}`);
  return response.data;
};

