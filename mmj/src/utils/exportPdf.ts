import { Message } from "../types";

export const exportChatAsPDF = async (
    title: string, messages: Message[]) => {
  const { jsPDF } = await import("jspdf");
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  const date = new Date().toLocaleString();
  doc.text(`Exported on: ${date}`, margin, yPosition);
  yPosition += 15;

  doc.setTextColor(0);

  messages.forEach((message, index) => {
    const isUser = message.sender === "user";
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(isUser ? 0 : 50);
    
    const label = isUser ? "You:" : "Assistant:";
    doc.text(label, margin, yPosition);
    yPosition += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0);

    const lines = doc.splitTextToSize(message.text, maxWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });

    yPosition += 5;

    if (index < messages.length - 1) {
      doc.setDrawColor(200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
    }
  });

  const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
  doc.save(filename);
};

