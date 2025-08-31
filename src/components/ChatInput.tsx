import { useState, KeyboardEvent } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

type ChatInputProps = {
  onSendMessage: (message: string) => void;
};

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-whatsapp-gray-200">
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-whatsapp-gray-100 rounded-lg transition-colors">
          <Smile className="w-5 h-5 text-whatsapp-gray-600" />
        </button>
        <button className="p-2 hover:bg-whatsapp-gray-100 rounded-lg transition-colors">
          <Paperclip className="w-5 h-5 text-whatsapp-gray-600" />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message"
          className="chat-input"
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="p-2 bg-whatsapp-green-500 text-white rounded-lg hover:bg-whatsapp-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
