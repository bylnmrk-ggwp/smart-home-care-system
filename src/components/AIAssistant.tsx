import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, WifiOff, Trash2, Loader2, Bot, User, Mic, MicOff, Play, Pause, RotateCcw, Save } from 'lucide-react';
import { Language, translate } from '../utils/translations';
import { sendMessage, ChatMessage, isOnline } from '../utils/aiService';

interface AIAssistantProps {
  lang: Language;
  apiKey: string;
  enabled: boolean;
  theme?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateApiKey: (key: string) => void;
  onUpdateVoiceRecordings: (recordings: { id: string; name: string; data: string; duration: number; createdAt: string }[]) => void;
  voiceRecordings: { id: string; name: string; data: string; duration: number; createdAt: string }[];
  variant?: 'floating' | 'inline';
}

function useThemeClasses(theme?: string) {
  const isDark = theme === 'dark';
  const isNature = theme === 'nature';

  return {
    panelBg: isDark ? 'bg-slate-900' : isNature ? 'bg-[#d4ead4]' : 'bg-white',
    panelBorder: isDark ? 'border-slate-700' : isNature ? 'border-[#a5d6a7]' : 'border-slate-200',
    msgBgUser: isDark ? 'bg-indigo-700' : isNature ? 'bg-[#1b5e20]' : 'bg-indigo-600',
    msgBgAssistant: isDark ? 'bg-slate-800' : isNature ? 'bg-[#e9f3e9]' : 'bg-white',
    msgBorderAssistant: isDark ? 'border-slate-700' : isNature ? 'border-[#c8e6c9]' : 'border-slate-200',
    msgTextAssistant: isDark ? 'text-slate-100' : isNature ? 'text-[#0a1e0d]' : 'text-slate-800',
    inputBg: isDark ? 'bg-slate-800' : isNature ? 'bg-[#f1f8e9]' : 'bg-slate-50',
    inputBorder: isDark ? 'border-slate-600' : isNature ? 'border-[#81c784]' : 'border-slate-300',
    inputText: isDark ? 'text-slate-100' : isNature ? 'text-[#0a1e0d]' : 'text-slate-800',
    inputPlaceholder: isDark ? 'placeholder:text-slate-500' : isNature ? 'placeholder:text-[#557558]' : 'placeholder:text-slate-400',
    offlineBg: isDark ? 'bg-rose-900/40 border-rose-800' : isNature ? 'bg-rose-50 border-rose-100' : 'bg-rose-50 border-rose-100',
    offlineText: isDark ? 'text-rose-300' : isNature ? 'text-rose-700' : 'text-rose-700',
    offlineSubtext: isDark ? 'text-rose-400' : isNature ? 'text-rose-500' : 'text-rose-500',
    keyInputBg: isDark ? 'bg-amber-900/30 border-slate-700' : isNature ? 'bg-amber-50 border-[#a5d6a7]' : 'bg-amber-50 border-slate-200',
    keyInputText: isDark ? 'text-slate-100 bg-slate-800 border-slate-600' : isNature ? 'text-[#0a1e0d] bg-[#f1f8e9] border-[#81c784]' : 'text-slate-800 bg-white border-slate-300',
    labelText: isDark ? 'text-slate-400' : isNature ? 'text-[#1b5e20]' : 'text-slate-500',
    subtitleText: isDark ? 'text-slate-400' : isNature ? 'text-[#557558]' : 'text-slate-400',
    chatAreaBg: isDark ? 'bg-slate-950' : isNature ? 'bg-[#e6f2e6]' : 'bg-slate-100',
    dividerBorder: isDark ? 'border-slate-700' : isNature ? 'border-[#a5d6a7]' : 'border-slate-200',
    aiLabel: isDark ? 'text-indigo-400' : isNature ? 'text-[#1b5e20]' : 'text-indigo-500',
    thinkingText: isDark ? 'text-slate-400' : isNature ? 'text-[#557558]' : 'text-slate-400',
    avatarBg: isDark ? 'bg-indigo-600' : isNature ? 'bg-[#1b5e20]' : 'bg-indigo-600',
    userAvatarBg: isDark ? 'bg-slate-700' : isNature ? 'bg-[#388e3c]' : 'bg-slate-600',
    poweredBy: isDark ? 'text-slate-500' : isNature ? 'text-[#557558]' : 'text-slate-400',
    timestampText: isDark ? 'text-slate-500' : isNature ? 'text-[#557558]' : 'text-slate-400',
  };
}

export function AIAssistant({ lang, apiKey, enabled, theme, isOpen, onOpenChange, onUpdateApiKey, onUpdateVoiceRecordings, voiceRecordings, variant = 'floating' }: AIAssistantProps) {
  const c = useThemeClasses(theme);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [online, setOnline] = useState(true);
  const [showKeyInput, setShowKeyInput] = useState(!apiKey && enabled);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [recordingName, setRecordingName] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    setShowKeyInput(!apiKey && enabled);
  }, [apiKey, enabled]);

  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setShowKeyInput(false);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: translate('aiWelcome', lang) }]);
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, lang]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    if (!online) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let fullContent = '';
      await sendMessage(apiKey, updatedMessages, (chunk) => {
        fullContent += chunk;
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: fullContent };
          return copy;
        });
      });

      if (!fullContent.trim()) {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: translate('aiError', lang) };
          return copy;
        });
      }
    } catch (err: any) {
      setMessages(prev => {
        const copy = [...prev];
        const errorMsg = err?.message === 'offline'
          ? translate('aiUnavailable', lang) + '. ' + translate('aiUnavailableDesc', lang)
          : translate('aiError', lang);
        copy.push({ role: 'assistant', content: errorMsg });
        return copy;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: translate('aiWelcome', lang) }]);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert(lang === 'tl' ? 'Hindi ma-access ang microphone. Paki-check ang permissions.' : 'Cannot access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const playRecording = () => {
    if (recordedBlob) {
      const audioUrl = URL.createObjectURL(recordedBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.play();
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const saveRecording = () => {
    if (recordedBlob && recordingName.trim()) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const newRecording = {
          id: Date.now().toString(),
          name: recordingName.trim(),
          data: dataUrl,
          duration: recordingTime,
          createdAt: new Date().toISOString()
        };
        onUpdateVoiceRecordings([...voiceRecordings, newRecording]);
        setRecordedBlob(null);
        setRecordingName('');
        setRecordingTime(0);
        setShowVoiceRecorder(false);
      };
      reader.readAsDataURL(recordedBlob);
    }
  };

  const deleteRecording = (id: string) => {
    onUpdateVoiceRecordings(voiceRecordings.filter(r => r.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!enabled) return null;

  const keyInputSection = showKeyInput ? (
    <div className={`px-4 py-3 border-b ${c.dividerBorder} ${c.keyInputBg}`}>
      <label className={`text-xs font-bold ${c.labelText} uppercase tracking-wider block mb-1.5`}>
        {translate('aiApiKey', lang)}
      </label>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => onUpdateApiKey(e.target.value)}
        placeholder={translate('aiApiKeyPlaceholder', lang)}
        className={`w-full px-3 py-2 text-xs rounded-xl border ${c.keyInputText} focus:outline-none focus:border-indigo-500 font-mono`}
      />
      <p className={`text-xs ${c.subtitleText} mt-1.5`}>
        {translate('aiApiKeyDesc', lang)}
      </p>
    </div>
  ) : null;

  const chatContent = (
    <div className={`flex flex-col overflow-hidden h-full ${c.panelBg} ${variant === 'inline' ? 'rounded-3xl border ' + c.panelBorder : ''}`}>
      {/* Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">
              {translate('aiAssistant', lang)}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className="text-xs text-white/60 font-semibold uppercase tracking-wider">
                {online ? 'Online' : 'Offline'}
              </span>
              <span className="text-xs text-white/30 mx-1">·</span>
                      <span className="text-xs text-white/50 font-mono">GPT-4o Mini</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-2 hover:bg-white/15 rounded-xl transition cursor-pointer"
            title={translate('aiClearChat', lang)}
          >
            <Trash2 size={15} className="text-white/70" />
          </button>
          {variant === 'floating' && (
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-white/15 rounded-xl transition cursor-pointer"
            >
              <X size={17} className="text-white/70" />
            </button>
          )}
        </div>
      </div>

      {keyInputSection}

      {/* Offline banner */}
      {!online && (
        <div className={`px-5 py-3 ${c.offlineBg} border-b flex items-center gap-3`}>
          <WifiOff size={16} className={`${c.offlineText} shrink-0`} />
          <div>
            <p className={`text-xs font-bold ${c.offlineText}`}>
              {translate('aiUnavailable', lang)}
            </p>
            <p className={`text-xs ${c.offlineSubtext}`}>
              {translate('aiUnavailableDesc', lang)}
            </p>
          </div>
        </div>
      )}

      {/* Voice Recording Section */}
      <div className={`px-4 py-3 border-b ${c.dividerBorder}`}>
        <button
          onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
          className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
        >
          <Mic size={14} />
          {lang === 'tl' ? 'Custom Voice Recording' : 'Custom Voice Recording'}
        </button>
        
        {showVoiceRecorder && (
          <div className="mt-3 space-y-3">
            {/* Recording Controls */}
            <div className="flex items-center gap-2">
              {!isRecording && !recordedBlob && (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition"
                >
                  <Mic size={14} />
                  {lang === 'tl' ? 'Mag-record' : 'Record'}
                </button>
              )}
              
              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition animate-pulse"
                >
                  <MicOff size={14} />
                  {lang === 'tl' ? 'Itigil' : 'Stop'} ({formatTime(recordingTime)})
                </button>
              )}
              
              {recordedBlob && !isRecording && (
                <>
                  <button
                    onClick={playRecording}
                    disabled={isPlaying}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition"
                  >
                    <Play size={14} />
                    {lang === 'tl' ? 'I-play' : 'Play'}
                  </button>
                  <button
                    onClick={stopPlayback}
                    disabled={!isPlaying}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-500 hover:bg-slate-600 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition"
                  >
                    <Pause size={14} />
                    {lang === 'tl' ? 'Pause' : 'Pause'}
                  </button>
                  <button
                    onClick={() => setRecordedBlob(null)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-400 hover:bg-slate-500 text-white rounded-xl text-xs font-bold transition"
                  >
                    <RotateCcw size={14} />
                    {lang === 'tl' ? 'Ulitin' : 'Retry'}
                  </button>
                </>
              )}
            </div>

            {/* Save Recording */}
            {recordedBlob && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={recordingName}
                  onChange={(e) => setRecordingName(e.target.value)}
                  placeholder={lang === 'tl' ? 'Pangalan ng recording...' : 'Recording name...'}
                  className={`flex-1 px-3 py-2 text-xs rounded-xl border ${c.inputBorder} ${c.inputBg} ${c.inputText} focus:outline-none focus:border-indigo-500`}
                />
                <button
                  onClick={saveRecording}
                  disabled={!recordingName.trim()}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition"
                >
                  <Save size={14} />
                  {lang === 'tl' ? 'I-save' : 'Save'}
                </button>
              </div>
            )}

            {/* Saved Recordings */}
            {voiceRecordings.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {lang === 'tl' ? 'Mga Naka-save na Recording' : 'Saved Recordings'}
                </span>
                {voiceRecordings.map(recording => (
                  <div key={recording.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <button
                      onClick={() => {
                        const audio = new Audio(recording.data);
                        audio.play();
                      }}
                      className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg transition"
                    >
                      <Play size={12} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-700 truncate">{recording.name}</div>
                      <div className="text-xs text-slate-400">{formatTime(recording.duration)}</div>
                    </div>
                    <button
                      onClick={() => deleteRecording(recording.id)}
                      className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-lg transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-5 ${c.chatAreaBg}`}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm ${
              msg.role === 'user' ? c.userAvatarBg : c.avatarBg
            }`}>
              {msg.role === 'user'
                ? <User size={15} className="text-white" />
                : <Bot size={15} className="text-white" />
              }
            </div>
            <div className="flex flex-col max-w-[80%]">
              <span className={`text-xs font-bold ${c.timestampText} uppercase tracking-wider mb-1 ${
                msg.role === 'user' ? 'text-right' : 'text-left'
              }`}>
                        {msg.role === 'user' ? (lang === 'tl' ? 'Ikaw' : 'You') : 'ChatGPT'}
              </span>
              <div
                className={`px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? `${c.msgBgUser} text-white rounded-2xl rounded-tr-md shadow-sm`
                    : `${c.msgBgAssistant} ${c.msgTextAssistant} rounded-2xl rounded-tl-md shadow-xs border ${c.msgBorderAssistant}`
                }`}
              >
                <span className="whitespace-pre-wrap">{msg.content}</span>
              </div>
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.content !== '' && (
          <div className="flex gap-3">
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm ${c.avatarBg}`}>
              <Bot size={15} className="text-white" />
            </div>
            <div className="flex flex-col max-w-[80%]">
              <span className={`text-xs font-bold ${c.timestampText} uppercase tracking-wider mb-1`}>Gemini</span>
              <div className={`px-4 py-3 rounded-2xl rounded-tl-md ${c.msgBgAssistant} border ${c.msgBorderAssistant} shadow-xs`}>
                <div className={`flex items-center gap-2 ${c.thinkingText} text-xs`}>
                  <Loader2 size={14} className="animate-spin text-indigo-500" />
                  <span>{translate('aiThinking', lang)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`px-4 md:px-6 py-3.5 border-t ${c.dividerBorder} ${c.panelBg} shrink-0`}>
        <div className="flex items-end gap-2 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-1.5 shadow-xs">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={online ? translate('aiAskQuestion', lang) : translate('aiUnavailable', lang)}
            disabled={!online}
            rows={1}
            className={`flex-1 px-3 py-2 text-sm bg-transparent border-none outline-none resize-none ${c.inputText} ${c.inputPlaceholder} disabled:opacity-50`}
            style={{ maxHeight: '120px' }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !online}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white flex items-center justify-center transition shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-sm"
          >
            <Send size={16} />
          </button>
        </div>
        <p className={`text-[8px] text-center ${c.poweredBy} mt-2 font-medium`}>
          {translate('aiPoweredBy', lang)}
        </p>
      </div>
    </div>
  );

  if (variant === 'inline') {
    return chatContent;
  }

  return (
    <>
      <button
        onClick={() => onOpenChange(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center border-2 border-indigo-400/30"
        aria-label="Open AI Assistant"
      >
        <Sparkles size={22} className="drop-shadow-sm" />
        {!online && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center">
            <WifiOff size={10} className="text-white" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className={`fixed bottom-0 left-0 right-0 z-50 h-[92vh] md:h-[700px] md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:bottom-8 md:rounded-3xl md:shadow-2xl ${c.panelBg} border-t md:border ${c.panelBorder} flex flex-col overflow-hidden shadow-xl`}
            >
              {chatContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
