"use client";
import React, { useState } from "react";

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("text", text);
    const res = await fetch("http://localhost:8000/api/text-to-speech/", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setAudioUrl(`http://localhost:8000${data.audio_url}`);
  };

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
        placeholder="Enter text to convert to speech"
      />
      <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded">
        Generate Speech
      </button>
      {audioUrl && (
        <audio controls src={audioUrl} className="mt-2">
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}
