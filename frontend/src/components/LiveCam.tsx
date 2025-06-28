"use client";
import React, { useRef, useState, useEffect } from "react";
import { Video, VideoOff } from "lucide-react";

export default function LiveCam({ isVideoOn }: { isVideoOn: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const enableStream = async () => {
      try {
        if (isVideoOn) {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user" // Explicitly request front camera
            }
          });
          
          setStream(mediaStream);
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            // Add event listener to handle when stream is ready
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(err => {
                console.error("Error playing video:", err);
                setError("Error displaying video");
              });
            };
          }
        } else {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            if (videoRef.current) {
              videoRef.current.srcObject = null;
            }
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera");
      }
    };

    enableStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoOn]);

  return (
    <div className="absolute bottom-20 right-6 w-48 h-32 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl overflow-hidden shadow-xl">
      {error ? (
        <div className="w-full h-full flex items-center justify-center bg-red-900/50 text-white p-2 text-center text-sm">
          {error}
        </div>
      ) : isVideoOn ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover transform scaleX(-1)" // Mirror the video
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-indigo-900/50">
          <div className="text-center text-white">
            <VideoOff size={24} className="mx-auto mb-2 text-white/60" />
            <p className="text-sm text-white/80">Camera Off</p>
          </div>
        </div>
      )}
      <div className={`absolute top-2 left-2 px-2 py-1 text-white text-xs rounded ${
        isVideoOn ? 'bg-green-500' : 'bg-red-500'
      }`}>
        {isVideoOn ? 'Camera ON' : 'Camera OFF'}
      </div>
    </div>
  );
}