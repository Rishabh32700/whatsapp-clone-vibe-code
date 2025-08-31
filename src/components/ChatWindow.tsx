import { Contact, Message } from '../types';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

type ChatWindowProps = {
  contact: Contact;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
  showSidebarToggle?: boolean;
  onToggleSidebar?: () => void;
  currentUserId: string;
};

const ChatWindow = ({ 
  contact, 
  messages, 
  onSendMessage, 
  onBack, 
  showBackButton = false,
  showSidebarToggle = false,
  onToggleSidebar,
  currentUserId
}: ChatWindowProps) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <ChatHeader 
        contact={contact} 
        onBack={onBack} 
        showBackButton={showBackButton}
        showSidebarToggle={showSidebarToggle}
        onToggleSidebar={onToggleSidebar}
      />
      <ChatMessages messages={messages} currentUserId={currentUserId} />
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatWindow;
