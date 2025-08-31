import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isSent: boolean;
  status: 'sent' | 'delivered' | 'read' | 'sending' | 'failed';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  content, 
  timestamp, 
  isSent, 
  status 
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />;
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <div className="w-4 h-4 text-red-500">⚠</div>;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`message-bubble ${isSent ? 'message-bubble-sent' : 'message-bubble-received'}`}>
        <p className="text-sm">{content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs opacity-70">{timestamp}</span>
          {isSent && (
            <div className="flex items-center">
              {getStatusIcon()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
