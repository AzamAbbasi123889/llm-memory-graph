import { useQuery } from "@tanstack/react-query";
import { getHistory, searchHistory } from "../api/queryApi";

export default function useHistory(searchTerm = "") {
  return useQuery({
    queryKey: ["history", searchTerm],
    queryFn: () => (searchTerm ? searchHistory(searchTerm) : getHistory())
  });
}

