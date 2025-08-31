import React, { useState, useEffect } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  senderName: string;
}

interface MessageSearchProps {
  messages: Message[];
  onClose: () => void;
  onMessageSelect: (messageId: string) => void;
}

const MessageSearch: React.FC<MessageSearchProps> = ({ 
  messages, 
  onClose, 
  onMessageSelect 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentResultIndex(0);
      return;
    }

    const results = messages.filter(message =>
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
    setCurrentResultIndex(0);
  }, [searchQuery, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0) {
        onMessageSelect(searchResults[currentResultIndex].id);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCurrentResultIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCurrentResultIndex(prev => 
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="absolute top-0 left-0 right-0 bg-surface border-b border-border p-4 z-10">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-hover rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {searchQuery && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
            <span>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </span>
            {searchResults.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentResultIndex(prev => 
                    prev > 0 ? prev - 1 : searchResults.length - 1
                  )}
                  className="p-1 hover:bg-hover rounded"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span>{currentResultIndex + 1} of {searchResults.length}</span>
                <button
                  onClick={() => setCurrentResultIndex(prev => 
                    prev < searchResults.length - 1 ? prev + 1 : 0
                  )}
                  className="p-1 hover:bg-hover rounded"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {searchResults.length > 0 ? (
            <div className="max-h-40 overflow-y-auto space-y-1">
              {searchResults.map((message, index) => (
                <div
                  key={message.id}
                  onClick={() => onMessageSelect(message.id)}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    index === currentResultIndex 
                      ? 'bg-primary bg-opacity-10 border border-primary' 
                      : 'hover:bg-hover'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                    <span>{message.senderName}</span>
                    <span>{message.timestamp}</span>
                  </div>
                  <p className="text-sm text-text">
                    {highlightText(message.content, searchQuery)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary text-center py-4">
              No messages found
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageSearch;
