// AudioRecorder.tsx
"use client";
import React, { useState, useRef } from "react";
import { Mic, Square } from "lucide-react";

interface AudioRecorderProps {
  iconOnly?: boolean;
}

export default function AudioRecorder({ iconOnly = false }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    streamRef.current = stream;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      const res = await fetch("http://localhost:8000/api/speech-to-text/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setTranscript(data.transcript || data.error);
      streamRef.current?.getTracks().forEach(track => track.stop());
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`bg-blue-600 text-white rounded p-2 flex items-center justify-center ${iconOnly ? "w-10 h-10" : "px-4 py-2"}`}
      >
        {recording ? <Square size={iconOnly ? 18 : 20} /> : <Mic size={iconOnly ? 18 : 20} />}
      </button>
      {!iconOnly && transcript && <p className="mt-2">Transcript: {transcript}</p>}
    </div>
  );
}
