import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className="relative inline-flex h-10 w-20 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      tabIndex={0}
    >
      <span className="sr-only">Toggle theme</span>
      
      {/* Toggle switch */}
      <span
        className={`absolute left-1 inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
          theme === 'dark' ? 'translate-x-10' : 'translate-x-0'
        }`}
      />
      
      {/* Icons */}
      <div className="relative flex w-full items-center justify-between px-2">
        <Sun 
          className={`h-5 w-5 transition-colors duration-200 ${
            theme === 'light' 
              ? 'text-yellow-500' 
              : 'text-gray-400 dark:text-gray-500'
          }`}
        />
        <Moon 
          className={`h-5 w-5 transition-colors duration-200 ${
            theme === 'dark' 
              ? 'text-blue-400' 
              : 'text-gray-400 dark:text-gray-500'
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
