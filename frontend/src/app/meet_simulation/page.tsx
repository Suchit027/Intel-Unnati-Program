"use client";
import React, { useState, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Settings, Users, MessageSquare, Share, Phone, PhoneOff, Monitor, Grid3X3, Maximize2, Square } from 'lucide-react';
import LiveCam from '../../components/LiveCam';

export default function EnhancedMeetInterface() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('features');
  const [isRecording, setIsRecording] = useState(false);

  // Audio Recorder states
  const [audioRecording, setAudioRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // PDF Uploader states
  const [summaries, setSummaries] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Text to Speech states
  const [ttsText, setTtsText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  // Mock participants data
  const participants = [
    { id: 1, name: 'John Doe', isSpeaking: false, isMuted: false, isVideoOn: true },
    { id: 2, name: 'Jane Smith', isSpeaking: true, isMuted: false, isVideoOn: true },
    { id: 3, name: 'Mike Johnson', isSpeaking: false, isMuted: true, isVideoOn: false },
    { id: 4, name: 'Sarah Wilson', isSpeaking: false, isMuted: false, isVideoOn: true },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Audio Recording functions
  const startAudioRecording = async () => {
    try {
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
        try {
          const res = await fetch("http://localhost:8000/api/speech-to-text/", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          setTranscript(data.transcript || data.error);
        } catch (error) {
          setTranscript("Error: Could not connect to server");
        }
        streamRef.current?.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setAudioRecording(true);
    } catch (error) {
      setTranscript("Error: Could not access microphone");
    }
  };

  const stopAudioRecording = () => {
    mediaRecorderRef.current?.stop();
    setAudioRecording(false);
  };

  // PDF Upload functions
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("pdf", file);
    try {
      const res = await fetch("http://localhost:8000/api/pdf-summarize/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setSummaries(data.summaries || [data.error]);
    } catch (error) {
      setSummaries(["Error: Could not connect to server"]);
    }
  };

  const triggerUpload = () => inputRef.current?.click();

  // Text to Speech function
  const handleTTSSubmit = async () => {
    if (!ttsText.trim()) return;
    const formData = new FormData();
    formData.append("text", ttsText);
    try {
      const res = await fetch("http://localhost:8000/api/text-to-speech/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setAudioUrl(`http://localhost:8000${data.audio_url}`);
    } catch (error) {
      console.error("TTS Error:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Enhanced Sidebar with Glassmorphism */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} transition-all duration-300 backdrop-blur-xl bg-white/10 border-r border-white/20 shadow-2xl`}>
        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            {sidebarOpen && (
              <div>
                <h2 className="text-xl font-bold text-white">Meet Tools</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">Live Session</span>
                </div>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <Grid3X3 size={20} />
            </button>
          </div>

          {sidebarOpen && (
            <>
              {/* Tab Navigation */}
              <div className="flex gap-1 mb-4 bg-white/5 rounded-lg p-1">
                {[
                  { id: 'features', label: 'Tools', icon: Settings },
                  { id: 'participants', label: 'People', icon: Users },
                  { id: 'chat', label: 'Chat', icon: MessageSquare }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <tab.icon size={16} />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto space-y-4">
                {activeTab === 'features' && (
                  <>
                    {/* Speech to Text */}
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Mic size={18} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Speech to Text</h3>
                          <p className="text-xs text-gray-400">Real-time transcription</p>
                        </div>
                      </div>
                      <button 
                        onClick={audioRecording ? stopAudioRecording : startAudioRecording}
                        className={`w-full px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                          audioRecording 
                            ? 'bg-gradient-to-r from-red-500 to-red-600' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}
                      >
                        {audioRecording ? <Square size={18} /> : <Mic size={18} />}
                        {audioRecording ? 'Stop Recording' : 'Start Recording'}
                      </button>
                      {transcript && (
                        <div className="mt-3 p-3 bg-white/10 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">Transcript:</p>
                          <p className="text-sm text-white">{transcript}</p>
                        </div>
                      )}
                    </div>

                    {/* PDF Summarizer */}
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                          <Share size={18} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">PDF Summarizer</h3>
                          <p className="text-xs text-gray-400">Upload and summarize</p>
                        </div>
                      </div>
                      <button 
                        onClick={triggerUpload}
                        className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
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
                      {summaries.length > 0 && (
                        <div className="mt-3 max-h-32 overflow-y-auto">
                          {summaries.map((summary, i) => (
                            <div key={i} className="mb-2 p-2 bg-white/10 rounded text-xs text-white">
                              {summary}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Text to Speech */}
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                          <Settings size={18} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Text to Speech</h3>
                          <p className="text-xs text-gray-400">Generate audio</p>
                        </div>
                      </div>
                      <textarea
                        value={ttsText}
                        onChange={(e) => setTtsText(e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        placeholder="Enter text to convert..."
                        rows={3}
                      />
                      <button 
                        onClick={handleTTSSubmit}
                        className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                      >
                        Generate Speech
                      </button>
                      {audioUrl && (
                        <audio controls src={audioUrl} className="mt-3 w-full">
                          Your browser does not support the audio element.
                        </audio>
                      )}
                    </div>
                  </>
                )}

                {activeTab === 'participants' && (
                  <div className="space-y-3">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-3 p-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          participant.isSpeaking ? 'bg-green-500 ring-2 ring-green-400' : 'bg-gray-600'
                        }`}>
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{participant.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {participant.isMuted ? (
                              <MicOff size={12} className="text-red-400" />
                            ) : (
                              <Mic size={12} className="text-green-400" />
                            )}
                            {participant.isVideoOn ? (
                              <Video size={12} className="text-green-400" />
                            ) : (
                              <VideoOff size={12} className="text-red-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div className="space-y-3">
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-sm text-gray-300">Chat feature coming soon...</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 backdrop-blur-xl bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Advanced Learning Session</h1>
            {isRecording && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm font-medium">Recording</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white">
              <Monitor size={20} />
            </button>
            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white">
              <Maximize2 size={20} />
            </button>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="relative w-full max-w-5xl h-full max-h-[600px] backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
            {/* Main Video */}
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video size={40} className="text-white/80" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Teacher's Video Stream</h3>
                <p className="text-white/60">Waiting for instructor to join...</p>
              </div>
            </div>

            {/* Participant Thumbnails */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {participants.slice(0, 3).map((participant, index) => (
                <div
                  key={participant.id}
                  className={`w-32 h-20 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-white text-sm font-medium transition-all hover:scale-105 ${
                    participant.isSpeaking ? 'ring-2 ring-green-400' : ''
                  }`}
                >
                  {participant.name.split(' ')[0]}
                </div>
              ))}
            </div>

            {/* Live Badge */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 backdrop-blur-xl bg-white/5 border-t border-white/10">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
              } text-white shadow-lg`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                !isVideoOn ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
              } text-white shadow-lg`}
            >
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>

            <button className="p-4 rounded-full bg-white/20 hover:bg-white/30 text-white shadow-lg transition-all transform hover:scale-110">
              <Monitor size={24} />
            </button>

            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
              } text-white shadow-lg`}
            >
              <div className="w-6 h-6 bg-current rounded-sm"></div>
            </button>

            <button className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all transform hover:scale-110">
              <PhoneOff size={24} />
            </button>
          </div>
        </div>

        <LiveCam isVideoOn={isVideoOn} />
      </div>
    </div>
  );
}