import { Contact } from '../types';
import { Phone, Video, MoreVertical, ArrowLeft, Menu } from 'lucide-react';

type ChatHeaderProps = {
  contact: Contact;
  onBack?: () => void;
  showBackButton?: boolean;
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
};

const ChatHeader = ({ contact, onBack, showBackButton = false, onToggleSidebar, showSidebarToggle = false }: ChatHeaderProps) => {
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleSidebarToggle = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-whatsapp-gray-200">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={handleBackClick}
            className="p-2 hover:bg-whatsapp-gray-100 rounded-lg transition-colors md:hidden"
          >
            <ArrowLeft className="w-5 h-5 text-whatsapp-gray-600" />
          </button>
        )}
        {showSidebarToggle && (
          <button
            onClick={handleSidebarToggle}
            className="p-2 hover:bg-whatsapp-gray-100 rounded-lg transition-colors md:hidden"
          >
            <Menu className="w-5 h-5 text-whatsapp-gray-600" />
          </button>
        )}
        <img
          src={contact.profileImage}
          alt={contact.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h2 className="font-semibold text-whatsapp-gray-900">{contact.name}</h2>
          <p className="text-sm text-whatsapp-gray-500">
            {contact.isOnline ? 'online' : 
             contact.lastSeen ? `last seen ${contact.lastSeen}` : 'offline'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-whatsapp-gray-100 rounded-lg transition-colors">
          <Video className="w-5 h-5 text-whatsapp-gray-600" />
        </button>
        <button className="p-2 hover:bg-whatsapp-gray-100 rounded-lg transition-colors">
          <Phone className="w-5 h-5 text-whatsapp-gray-600" />
        </button>
        <button className="p-2 hover:bg-whatsapp-gray-100 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5 text-whatsapp-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
