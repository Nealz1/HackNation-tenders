import type { Message } from "../types";
import * as React from "react";
import { API_BASE_URL } from '../config/constants';

export const handleDocumentResponse = async (
  res: Response,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  downloadFile: (blob: Blob, filename: string) => Promise<void>,
  formGeneratedText: string
) => {
  const disposition = res.headers.get("content-disposition");
  const filename = disposition?.split("filename=")[1] || "formularz.docx";
  const blob = await res.blob();

  setMessages((prev) => [...prev, { sender: "bot", text: formGeneratedText }]);
  await downloadFile(blob, filename);
};

export const handleHtmlResponse = async (
  res: Response,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  routeGeneratedText: string
) => {
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  setMessages((prev) => [...prev, { sender: "bot", text: routeGeneratedText }]);
  window.open(url, "_blank");
};

export const handleEmailUrlResponse = (
  text: string,
  email_url: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  emailPageOpenedText: string
) => {
  setMessages((prev) => [
    ...prev,
    { sender: "bot", text: `${text}\n\n${emailPageOpenedText}` }
  ]);
  window.open(email_url, "_blank");
};

export const handleFileDownloadMetadata = async (
  fileInfo: { filename: string; path: string },
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  downloadFile: (blob: Blob, filename: string) => Promise<void>,
  token: string | null,
  downloadingText: string,
  successText: string,
  errorText: string
) => {
  const filename = fileInfo.filename;
  // Add placeholder message with download action
  setMessages(prev => [...prev, { sender: 'bot', text: successText, fileDownload: { filename, status: 'ready' } }]);

  if (!token) {
    // Update status to error for unauthenticated
    setMessages(prev => prev.map(m => m.fileDownload?.filename === filename ? { ...m, text: successText + '\n(Niezalogowany - pobieranie niedostępne)', fileDownload: { filename, status: 'error' } } : m));
    return;
  }

  try {
    setMessages(prev => prev.map(m => m.fileDownload?.filename === filename ? { ...m, fileDownload: { filename, status: 'downloading' }, text: downloadingText } : m));
    const res = await fetch(`${API_BASE_URL}/download/form/${encodeURIComponent(filename)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    await downloadFile(blob, filename);
    setMessages(prev => prev.map(m => m.fileDownload?.filename === filename ? { ...m, fileDownload: { filename, status: 'done' }, text: successText } : m));
  } catch (e) {
    console.error('File download error', e);
    setMessages(prev => prev.map(m => m.fileDownload?.filename === filename ? { ...m, fileDownload: { filename, status: 'error' }, text: errorText } : m));
  }
};
