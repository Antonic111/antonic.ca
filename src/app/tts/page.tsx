import { Metadata } from 'next';
import { VoiceBoard } from '@/components/tts/VoiceBoard';

export const metadata: Metadata = {
  title: "TTS Voices | Antonic",
  description: "Text-to-Speech soundboard featuring AI and Google Voices",
};

export default function TTSPage() {
  return <VoiceBoard />;
}
