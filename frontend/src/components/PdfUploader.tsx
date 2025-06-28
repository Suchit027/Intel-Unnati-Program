"use client";
import React, { useState, useRef } from "react";

interface PdfUploaderProps {
  styledUpload?: boolean;
}

export default function PdfUploader({ styledUpload = false }: PdfUploaderProps) {
  const [summaries, setSummaries] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("pdf", file);
    const res = await fetch("http://localhost:8000/api/pdf-summarize/", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setSummaries(data.summaries || [data.error]);
  };

  const triggerUpload = () => inputRef.current?.click();

  return (
    <div className="space-y-2">
      {styledUpload ? (
        <>
          <button
            onClick={triggerUpload}
            className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800"
          >
            Upload PDF
          </button>
          <input
            type="file"
            accept="application/pdf"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      ) : (
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      )}

      <ul className="list-disc ml-4 max-h-40 overflow-y-auto pr-2">
        {summaries.map((s, i) => (
          <li key={i} className="text-sm leading-snug text-white">{s}</li>
        ))}
      </ul>
    </div>
  );
}
