import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { askQuestion } from "../api/queryApi";
import { getFriendlyErrorMessage } from "../api/axios";
import useSessionStore from "../store/sessionStore";

export default function useAskQuestion() {
  const queryClient = useQueryClient();
  const addMessage = useSessionStore((state) => state.addMessage);
  const setLoading = useSessionStore((state) => state.setLoading);
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: askQuestion,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      if (data?.sessionId) {
        setSession(data.sessionId);
      }

      addMessage({
        role: "assistant",
        content: data.answer,
        source: data.source,
        timeTaken: data.timeTaken,
        tokensUsed: data.tokensUsed,
        relatedQuestions: data.relatedQuestions,
        questionId: data.questionId,
        createdAt: data.createdAt
      });

      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["graph"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error, "NeuroGraph couldn't answer that just now."));
    },
    onSettled: () => {
      setLoading(false);
    }
  });
}

