import React from 'react';

/**
 * GameButton component - Стилизованная кнопка для основных действий в игре
 * @param {Object} props - Component props
 * @param {string} props.children - Button text content
 * @param {Function} props.onClick - Click handler function
 * @param {string} [props.className] - Additional CSS classes
 */
const GameButton = ({ children, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full py-3 px-4 rounded-xl
        text-white text-lg font-bold
        bg-gradient-to-br ${className}
        shadow-lg border
        transition-all duration-300
        active:scale-[0.98] active:opacity-80
        disabled:opacity-50 disabled:cursor-not-allowed
        text-shadow-sm
      `}
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
    >
      {children}
    </button>
  );
};

export default GameButton; 