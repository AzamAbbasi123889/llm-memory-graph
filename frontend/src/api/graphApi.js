import api from "./axios";

export const getGraphNodes = async () => {
  const response = await api.get("/graph/nodes");
  return response.data;
};

export const getStats = async () => {
  const response = await api.get("/graph/stats");
  return response.data;
};

export const getRelated = async (id) => {
  const response = await api.get(`/graph/related/${id}`);
  return response.data;
};

