import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import GameButton from "./GameButton";
import { isIOS } from '../utils/platformUtils';

/**
 * FirstScreen component that displays the initial game screen with join and host options
 */
const FirstScreen = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [isIosDevice, setIsIosDevice] = useState(false);
  
  // Получаем данные из Telegram WebApp и определяем платформу
  useEffect(() => {
    // Определяем iOS устройство
    setIsIosDevice(isIOS());
    
    const tg = window.Telegram?.WebApp;
    if (tg) {
      // Меняем тему приложения в зависимости от темы Telegram
      document.documentElement.classList.toggle('dark', tg.colorScheme === 'dark');
      
      // Если есть данные о пользователе, получаем его имя
      if (tg.initDataUnsafe?.user) {
        const { first_name, last_name } = tg.initDataUnsafe.user;
        setUserName(first_name + (last_name ? ` ${last_name}` : ''));
      }
    }
  }, []);

  // iOS-специфичные стили для контейнера, если необходимо
  const iosContainerStyles = isIosDevice ? {
    backgroundColor: 'rgba(45, 65, 120, 0.4)', 
    backdropFilter: 'blur(5px)'
  } : {};

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#4B6CB7] to-[#182848] flex flex-col items-center justify-center p-6">
      {/* Основной контейнер */}
      <div 
        className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl
                 rounded-3xl p-8 w-full max-w-[400px]
                 shadow-[inset_0_0_30px_rgba(255,255,255,0.1),0_10px_40px_rgba(0,0,0,0.2)]
                 border border-white/30"
        style={iosContainerStyles}
      >
        {/* Заголовок */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 text-shadow-lg">Poker Dealer</h1>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl text-white/80">♠</span>
            <span className="text-2xl text-red-500/80">♥</span>
            <span className="text-2xl text-white/80">♣</span>
            <span className="text-2xl text-red-500/80">♦</span>
          </div>
        </div>

        {/* Приветствие пользователя, если есть */}
        {userName && (
          <div className="mb-6 text-center">
            <p className="text-white/80 text-lg">Привет, {userName}!</p>
          </div>
        )}

        {/* Кнопки */}
        <div className="space-y-6">
          <GameButton 
            onClick={() => navigate('/join-game')}
            className="from-emerald-500/30 to-emerald-500/10 
                      hover:from-emerald-500/40 hover:to-emerald-500/20
                      border-emerald-500/30"
          >
            Join Game
          </GameButton>
          <GameButton 
            onClick={() => navigate('/game-setup')}
            className="from-blue-500/30 to-blue-500/10
                      hover:from-blue-500/40 hover:to-blue-500/20
                      border-blue-500/30"
          >
            Host Game
          </GameButton>
        </div>
      </div>

      {/* Нижний текст */}
      <div className="mt-6 text-white/60 text-sm" style={isIosDevice ? { textShadow: '0 1px 2px rgba(0,0,0,0.7)' } : {}}>
        Ready to play?
      </div>
    </div>
  );
};

export default FirstScreen; 