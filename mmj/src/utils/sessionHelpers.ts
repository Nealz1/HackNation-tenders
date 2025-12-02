import type { Message } from "../types";
import type { NavigateFunction } from "react-router-dom";
import * as React from "react";

export const resetToWelcome = (
  welcomeMessage: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setCurrentSessionId: React.Dispatch<React.SetStateAction<number | string | null>>,
  navigate: NavigateFunction
) => {
  setMessages([{ sender: "bot", text: welcomeMessage }]);
  setCurrentSessionId(null);
  navigate('/', { replace: true });
};

export const batchSessionOperation = async (
  sessionIds: number[],
  operation: (sessionId: number) => Promise<boolean | void>,
  currentSessionId: number | string | null,
  welcomeMessage: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setCurrentSessionId: React.Dispatch<React.SetStateAction<number | string | null>>,
  navigate: NavigateFunction
) => {
  for (const sessionId of sessionIds) {
    await operation(sessionId);
  }
  
  if (currentSessionId && typeof currentSessionId === 'number' && sessionIds.includes(currentSessionId)) {
    resetToWelcome(welcomeMessage, setMessages, setCurrentSessionId, navigate);
  }
};


export const downloadFile = async (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};


