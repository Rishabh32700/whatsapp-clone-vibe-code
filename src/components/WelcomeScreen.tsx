import { MessageCircle, Lock, Shield } from 'lucide-react';

const WelcomeScreen = () => {
  return (
    <div className="hidden md:flex flex-col items-center justify-center h-full bg-whatsapp-gray-50">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-20 h-20 bg-whatsapp-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-whatsapp-gray-900 mb-2">
            WhatsApp Web
          </h1>
          <p className="text-whatsapp-gray-600">
            Send and receive messages without keeping your phone online.
          </p>
        </div>
        
        <div className="space-y-4 text-sm text-whatsapp-gray-500">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4" />
            <span>End-to-end encrypted</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4" />
            <span>Your personal messages are protected</span>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-whatsapp-gray-100 rounded-lg">
          <p className="text-xs text-whatsapp-gray-600">
            Select a chat to start messaging
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
