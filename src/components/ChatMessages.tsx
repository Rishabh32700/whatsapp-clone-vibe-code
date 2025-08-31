import { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';

type ChatMessagesProps = {
  messages: Message[];
  currentUserId: string;
};

const ChatMessages = ({ messages, currentUserId }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto bg-whatsapp-gray-50 p-4">
      <div className="space-y-2">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} currentUserId={currentUserId} />
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
