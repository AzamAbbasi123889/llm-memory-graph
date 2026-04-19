import { useQuery } from "@tanstack/react-query";
import { getGraphNodes } from "../api/graphApi";

const nodePalette = {
  question: "#7C3AED",
  answer: "#3B82F6",
  topic: "#10B981",
  session: "#F59E0B"
};

export default function useGraphData() {
  return useQuery({
    queryKey: ["graph"],
    queryFn: getGraphNodes,
    select: (data) => ({
      ...data,
      nodes: (data?.nodes ?? []).map((node) => ({
        ...node,
        color: nodePalette[node.type] || "#8B5CF6",
        val: node.type === "topic" ? 6 : 8
      })),
      links: data?.links ?? [],
      topics: data?.topics ?? []
    })
  });
}

