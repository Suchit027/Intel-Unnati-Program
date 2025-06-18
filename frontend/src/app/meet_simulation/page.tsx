import AudioRecorder from "@/components/AudioRecorder";
import PdfUploader from "@/components/PdfUploader";
import TextToSpeech from "@/components/TextToSpeech";

export default function MeetSimulation() {
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold">Classroom Simulation</h1>
      <AudioRecorder />
      <PdfUploader />
      <TextToSpeech />
    </div>
  );
}
