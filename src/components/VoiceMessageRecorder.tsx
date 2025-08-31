import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Square, Send } from 'lucide-react';

interface VoiceMessageRecorderProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
}

const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSend = () => {
    if (audioURL) {
      fetch(audioURL)
        .then(res => res.blob())
        .then(blob => {
          onSend(blob);
          onCancel();
        });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-text mb-4 text-center">
          Voice Message
        </h3>

        <div className="space-y-4">
          {/* Recording Status */}
          <div className="text-center">
            {isRecording ? (
              <div className="flex items-center justify-center gap-2 text-red-500">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span>Recording... {formatTime(recordingTime)}</span>
              </div>
            ) : audioURL ? (
              <div className="text-text-secondary">
                Voice message recorded ({formatTime(recordingTime)})
              </div>
            ) : (
              <div className="text-text-secondary">
                Tap to start recording
              </div>
            )}
          </div>

          {/* Audio Player */}
          {audioURL && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={togglePlayback}
                className="p-3 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <audio
                ref={audioRef}
                src={audioURL}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
              />
              <span className="text-sm text-text-secondary">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            {!isRecording && !audioURL && (
              <button
                onClick={startRecording}
                className="p-4 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors"
              >
                <Mic className="w-6 h-6" />
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <Square className="w-6 h-6" />
              </button>
            )}

            {audioURL && (
              <>
                <button
                  onClick={() => {
                    setAudioURL(null);
                    setRecordingTime(0);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Re-record
                </button>
                <button
                  onClick={handleSend}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </>
            )}
          </div>

          {/* Cancel Button */}
          <div className="text-center">
            <button
              onClick={onCancel}
              className="text-text-secondary hover:text-text transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceMessageRecorder;
