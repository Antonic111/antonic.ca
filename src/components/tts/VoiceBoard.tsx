"use client";

import { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";

const aiVoices = [
  { name: 'asmr', file: 'asmr.wav' },
  { name: 'bart', file: 'bart.wav' },
  { name: 'biden', file: 'biden.wav' },
  { name: 'brian', file: 'brian.wav' },
  { name: 'chloe', file: 'chloe.wav' },
  { name: 'deadpool', file: 'deadpool.wav' },
  { name: 'ghostface', file: 'ghostface.wav' },
  { name: 'johnny', file: 'johnny.wav' },
  { name: 'linus', file: 'linus.wav' },
  { name: 'moist', file: 'moist.wav' },
  { name: 'morgan', file: 'morgan.wav' },
  { name: 'narrator', file: 'narrator.wav' },
  { name: 'obama', file: 'obama.wav' },
  { name: 'pirate', file: 'pirate.wav' },
  { name: 'plankton', file: 'plankton.wav' },
  { name: 'spongebob', file: 'spongebob.wav' },
  { name: 'squidward', file: 'squidward.wav' },
  { name: 'tired', file: 'tired.wav' },
  { name: 'trump', file: 'trump.wav' },
  { name: 'weekend', file: 'weekend.wav' },
  { name: 'witch', file: 'witch.wav' }
];

const googleVoices = [
  { name: 'defaultfemale', file: 'defaultfemale.wav' },
  { name: 'defaultmale', file: 'defaultmale.wav' },
  { name: 'japanesem', file: 'japanesem.wav' },
  { name: 'japanesef', file: 'japanesef.wav' },
  { name: 'indianm', file: 'indianm.wav' },
  { name: 'indianf', file: 'indianf.wav' },
  { name: 'russianm', file: 'russianm.wav' },
  { name: 'russianf', file: 'russianf.wav' },
  { name: 'britishm', file: 'britishm.wav' },
  { name: 'britishf', file: 'britishf.wav' },
  { name: 'frenchm', file: 'frenchm.wav' },
  { name: 'frenchf', file: 'frenchf.wav' }
];

export function VoiceBoard() {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleVoice = (file: string) => {
    // If clicking the same voice that's playing, stop it
    if (playingVoice === file && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingVoice(null);
      return;
    }

    // Stop currently playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Play new voice
    const newAudio = new Audio(`/Voices/${file}`);
    newAudio.volume = 0.75;
    
    newAudio.onended = () => {
      setPlayingVoice(null);
    };

    audioRef.current = newAudio;
    setPlayingVoice(file);
    newAudio.play().catch((e) => console.error("Error playing audio:", e));
  };

  useEffect(() => {
    return () => {
      // Cleanup audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative flex items-center justify-center fade-in-up bg-[#0f0f0f]">
      <div 
        className="w-full max-w-5xl rounded-2xl shadow-2xl p-6 md:p-8 lg:p-10 border border-white/5" 
        style={{ 
          backgroundColor: '#1a1a1a',
        }}
      >
        <header className="mb-8 border-b border-white/5 pb-5 text-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">Voices</h1>
        </header>

        <main>
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-[#9499ab] mb-5 pb-2 border-b border-white/5 uppercase tracking-wider">AI Voices</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {aiVoices.map((voice) => (
                <button
                  key={voice.file}
                  onClick={() => toggleVoice(voice.file)}
                  className="bg-[#2a2a2a] border border-white/5 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all hover:bg-[#333333] hover:-translate-y-1 hover:shadow-lg active:translate-y-0 group"
                >
                  <Play className={`w-5 h-5 flex-shrink-0 transition-colors ${playingVoice === voice.file ? 'text-[#8155e5] fill-[#8155e5]' : 'text-[#8c92a5] group-hover:text-white group-hover:fill-white'}`} />
                  <span className="text-white text-base font-semibold truncate capitalize">{voice.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#9499ab] mb-5 pb-2 border-b border-white/5 uppercase tracking-wider">Google Voices</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {googleVoices.map((voice) => (
                <button
                  key={voice.file}
                  onClick={() => toggleVoice(voice.file)}
                  className="bg-[#2a2a2a] border border-white/5 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all hover:bg-[#333333] hover:-translate-y-1 hover:shadow-lg active:translate-y-0 group"
                >
                  <Play className={`w-5 h-5 flex-shrink-0 transition-colors ${playingVoice === voice.file ? 'text-[#8155e5] fill-[#8155e5]' : 'text-[#8c92a5] group-hover:text-white group-hover:fill-white'}`} />
                  <span className="text-white text-base font-semibold truncate capitalize">{voice.name}</span>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
