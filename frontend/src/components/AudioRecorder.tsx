"use client";
import React, { useState, useRef } from "react";

export default function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    streamRef.current = stream;
    chunksRef.current = [];  // Clear previous chunks

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio", blob, "recording.wav");

      const res = await fetch("http://localhost:8000/api/speech-to-text/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setTranscript(data.transcript || data.error);

      // Stop and release stream
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
      <button onClick={recording ? stopRecording : startRecording} className="px-4 py-2 bg-blue-600 text-white rounded">
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
      {transcript && <p className="mt-2">Transcript: {transcript}</p>}
    </div>
  );
}
