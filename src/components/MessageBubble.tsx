import { Message } from '../types';
import { Check, CheckCheck } from 'lucide-react';

type MessageBubbleProps = {
  message: Message;
  currentUserId: string;
};

const MessageBubble = ({ message, currentUserId }: MessageBubbleProps) => {
  const isSent = message.senderId === currentUserId;

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-whatsapp-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-whatsapp-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`message-bubble ${isSent ? 'message-bubble-sent' : 'message-bubble-received'}`}>
        <p className="text-sm">{message.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-xs ${isSent ? 'text-whatsapp-green-100' : 'text-whatsapp-gray-500'}`}>
            {message.timestamp}
          </span>
          {isSent && getStatusIcon(message.status)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
