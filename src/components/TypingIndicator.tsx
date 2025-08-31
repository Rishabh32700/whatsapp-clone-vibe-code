import React from 'react';

interface TypingIndicatorProps {
  isVisible: boolean;
  userName?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible, userName }) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-surface border border-border rounded-lg max-w-xs">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      {userName && (
        <span className="text-xs text-text-secondary">
          {userName} is typing...
        </span>
      )}
    </div>
  );
};

export default TypingIndicator;
