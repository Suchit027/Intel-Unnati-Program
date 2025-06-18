"use client";
import React, { useState } from "react";

export default function PdfUploader() {
  const [summaries, setSummaries] = useState<string[]>([]);

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

  return (
    <div className="space-y-2">
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <ul className="list-disc ml-4">
        {summaries.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
