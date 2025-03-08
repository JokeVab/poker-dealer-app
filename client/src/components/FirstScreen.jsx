import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import GameButton from "./GameButton";

/**
 * FirstScreen component that displays the initial game screen with join and host options
 */
const FirstScreen = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  
  // Получаем данные из Telegram WebApp
  useEffect(() => {
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

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center p-6">
      {/* Основной контейнер */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl
                    rounded-2xl p-8 w-full max-w-[400px]
                    shadow-2xl
                    border border-gray-700">
        {/* Заголовок */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Poker Dealer</h1>
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
          <button
            onClick={() => navigate('/join-game')}
            className="w-full py-4 px-6 text-white text-lg font-medium rounded-lg 
                      bg-gradient-to-r from-green-800 to-green-900 
                      border border-green-700 hover:from-green-700 hover:to-green-800
                      shadow-lg transition-colors"
          >
            Join Game
          </button>
          <button
            onClick={() => navigate('/game-setup')}
            className="w-full py-4 px-6 text-white text-lg font-medium rounded-lg 
                      bg-gradient-to-r from-blue-700 to-blue-800 
                      border border-blue-600 hover:from-blue-600 hover:to-blue-700
                      shadow-lg transition-colors"
          >
            Host Game
          </button>
        </div>
      </div>

      {/* Нижний текст */}
      <div className="mt-8 text-white/60 text-sm text-center">
        Ready to play?
      </div>

      {/* Подпись */}
      <div className="absolute bottom-4 text-center text-white/40 text-xs">
        @PokerDealerGameBot
      </div>
    </div>
  );
};

export default FirstScreen; 