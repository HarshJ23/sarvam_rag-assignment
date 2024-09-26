'use client'
import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { LuSend, LuVolume2, LuPause, LuYoutube } from "react-icons/lu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Loader from '@/components/shared/Loader';
import HomeStarter from '@/components/shared/HomeStarter';

interface Message {
  type: 'user' | 'bot';
  text: string;
  audio_base64?: string;
  suggested_video?: {
    title: string;
    link: string;
    thumbnail: string;
  };
}

const placeholders = [
  "Ask - How bats use sound?",
  "Ask - list of speed of sound in solids?",
  "Ask - Describe and answer question 10 in exercise.",
  "Ask - please explain me 11.1 activity in detail",
];

export default function Home() {
  const [userQuery, setUserQuery] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [placeholderIndex, setPlaceholderIndex] = useState<number>(0);
  const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState<number | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserQuery(e.target.value);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

    const intervalId = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [messages]);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    if (message.trim() === "") return;
  
    setMessages(prevMessages => [...prevMessages, { type: 'user', text: message }]);
  
    try {
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message,
        }),
      });
  
      if (response.ok) {
        const data: { answer: string, audio_base64?: string, suggested_video?: { title: string, link: string, thumbnail: string } } = await response.json();
        console.log('Response from backend', data);
  
        setMessages(prevMessages => [...prevMessages, { 
          type: 'bot', 
          text: data.answer, 
          audio_base64: data.audio_base64,
          suggested_video: data.suggested_video
        }]);
      } else {
        console.error('Error in response:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      setUserQuery("");
    }
  };

  const toggleAudio = (index: number, audio_base64?: string) => {
    if (audioRef.current && audio_base64) {
      if (currentlyPlayingIndex === index) {
        audioRef.current.pause();
        setCurrentlyPlayingIndex(null);
      } else {
        if (currentlyPlayingIndex !== null) {
          audioRef.current.pause();
        }
        audioRef.current.src = `data:audio/wav;base64,${audio_base64}`;
        audioRef.current.play();
        setCurrentlyPlayingIndex(index);
      }
    }
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center px-14 py-24">
        <section ref={chatContainerRef} className="w-full md:w-3/4 lg:w-2/3 h-full flex flex-col gap-3 overflow-y-auto">
          {messages.length == 0 && 
            <HomeStarter/>
          }
          {messages.map((message, index) => (
            <div key={index} className="flex flex-row gap-3 my-2 z-40">
              <Avatar className='z-20'>
                <AvatarImage src={message.type === 'user' ? "./useres.png" : "./user2.png"} />
                <AvatarFallback>{message.type === 'user' ? "CN" : "BOT"}</AvatarFallback>
              </Avatar>
              <div className='text-xs md:text-base'>
                <Markdown remarkPlugins={[remarkGfm]}>{message.text}</Markdown>
                <div className="flex items-center gap-2 mt-2">
                  {message.type === 'bot' && message.audio_base64 && (
                    <Button 
                      onClick={() => toggleAudio(index, message.audio_base64)}
                      className="p-2 h-8 w-10 rounded-2xl"
                      variant="outline"
                    >
                      {currentlyPlayingIndex === index ? (
                        <LuPause className="text-lg text-orange-500" />
                      ) : (
                        <LuVolume2 className="text-lg text-orange-500" />
                      )}
                    </Button>
                  )}
                  {message.type === 'bot' && message.suggested_video && (
                    <a 
                      href={message.suggested_video.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-2xl hover:bg-gray-100 transition-colors"
                      title={message.suggested_video.title}
                    >
                      <LuYoutube className="text-lg text-red-500" />
                      <span className="text-sm">
      Suggested video : <span> {message.suggested_video.title.length > 15
        ? `${message.suggested_video.title.slice(0, 15)}...`
        : message.suggested_video.title}</span>
    </span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <Loader />
          )}
        </section>
      </main>

      <footer className="flex justify-center z-40 bg-white mt-3">
        <div className="my-2 p-2 mx-2 w-full md:w-3/4 lg:w-2/3 fixed bottom-0 z-40 bg-white">
          <div className="flex flex-row gap-2 border-[1.5px] border-orange-600 justify-center py-2 px-4 rounded-2xl z-40 bg-white">
            <input
              type="text"
              value={userQuery}
              onChange={handleInputChange}
              className="w-full border-none outline-none z-50 text-xs md:text-sm lg:text-base border-orange-500"
              placeholder={placeholders[placeholderIndex]}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage(userQuery);
                }
              }}
            />
            <Button 
              type="submit" 
              className="rounded-xl bg-orange-400 hover:bg-orange-600 font-semibold transition ease-in-out" 
              onClick={() => sendMessage(userQuery)}
            >
              <LuSend className="text-lg text-white font-semibold" />
            </Button>
          </div>
          <p className='text-[11px] items-center text-center mt-1'>Disclaimer: The responses are AI-Generated. It may contain mistakes.</p>
        </div>
      </footer>
      <audio ref={audioRef} onEnded={() => setCurrentlyPlayingIndex(null)} />
    </>
  );
}