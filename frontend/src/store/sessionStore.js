import { create } from "zustand";

const createMessageId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const useSessionStore = create((set) => ({
  currentSessionId: null,
  messages: [],
  isLoading: false,
  setSession: (id) => set({ currentSessionId: id }),
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: createMessageId(),
          createdAt: new Date().toISOString(),
          ...message
        }
      ]
    })),
  clearSession: () => set({ currentSessionId: null, messages: [], isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  replaceMessages: (messages) => set({ messages }),
  removeMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== id)
    }))
}));

export default useSessionStore;

