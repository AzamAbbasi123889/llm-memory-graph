import { jsPDF } from "jspdf";
import { formatDateTime } from "./formatDate";

export default function exportPdf(items) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4"
  });

  const width = pdf.internal.pageSize.getWidth();
  let cursorY = 48;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("NeuroGraph AI History", 40, cursorY);
  cursorY += 24;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(100);
  pdf.text(`Exported ${formatDateTime(new Date().toISOString())}`, 40, cursorY);
  cursorY += 28;

  items.forEach((item, index) => {
    if (cursorY > 700) {
      pdf.addPage();
      cursorY = 48;
    }

    pdf.setDrawColor(220);
    pdf.roundedRect(32, cursorY - 18, width - 64, 110, 14, 14);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(30);
    const questionLines = pdf.splitTextToSize(`Q: ${item.question}`, width - 96);
    pdf.text(questionLines, 48, cursorY + 4);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(70);
    const answerPreview = `${item.answer}`.slice(0, 220);
    const answerLines = pdf.splitTextToSize(`A: ${answerPreview}`, width - 96);
    pdf.text(answerLines, 48, cursorY + 34);

    pdf.setTextColor(120);
    pdf.text(
      `${formatDateTime(item.createdAt)} • ${item.source === "memory" ? "From Memory" : "AI Generated"}`,
      48,
      cursorY + 82
    );

    cursorY += index === items.length - 1 ? 128 : 134;
  });

  pdf.save("neurograph-history.pdf");
}

