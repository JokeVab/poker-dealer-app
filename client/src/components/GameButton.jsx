import React, { useState, useEffect } from 'react';
import { isIOS } from '../utils/platformUtils';

/**
 * GameButton component for large, styled buttons used in the game interface
 * @param {Object} props - Component props
 * @param {string} props.children - Button text content
 * @param {Function} props.onClick - Click handler function
 * @param {string} [props.className] - Additional CSS classes
 */
const GameButton = ({ children, onClick, className = '' }) => {
  const [isIosDevice, setIsIosDevice] = useState(false);
  
  useEffect(() => {
    // Определяем iOS устройство только на стороне клиента
    setIsIosDevice(isIOS());
  }, []);

  // Базовый класс для фона
  const bgClasses = isIosDevice 
    ? 'from-white/40 to-white/10 backdrop-blur-xl' // Более контрастный фон для iOS
    : 'from-white/20 to-white/5 backdrop-blur-xl'; // Оригинальный фон для других устройств

  return (
    <button
      onClick={onClick}
      className={`w-full py-5 text-xl font-medium text-white
                 bg-gradient-to-br ${bgClasses}
                 border border-white/30
                 rounded-2xl
                 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]
                 transition-all duration-300
                 hover:from-white/30 hover:to-white/10
                 hover:shadow-[inset_0_0_30px_rgba(255,255,255,0.2),0_10px_30px_rgba(255,255,255,0.1)]
                 hover:border-white/40
                 active:transform active:scale-[0.98]
                 ${className}`}
    >
      {children}
    </button>
  );
};

export default GameButton; 