import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isIOS } from '../utils/platformUtils';

const GameSetup = () => {
  const navigate = useNavigate();
  const [isIosDevice, setIsIosDevice] = useState(false);
  
  // Состояния для параметров игры
  const [gameType, setGameType] = useState('SnG');
  const [gameSpeed, setGameSpeed] = useState('Regular');
  const [timeMode, setTimeMode] = useState('Hands');
  const [dealerDisplay, setDealerDisplay] = useState('Individual');
  
  // Определяем iOS устройство
  useEffect(() => {
    setIsIosDevice(isIOS());
  }, []);

  // iOS-специфичные стили фона для кнопок - более темные для лучшей видимости текста
  const iosBaseStyles = {
    backgroundColor: 'rgba(20, 30, 70, 0.6)', // Темный фон для контраста с белым текстом
    backdropFilter: 'blur(10px)',
    borderColor: 'rgba(255, 255, 255, 0.4)'
  };

  // Стили для активных кнопок на iOS - темнее, но без резких теней и обводок
  const iosActiveStyles = {
    backgroundColor: 'rgba(45, 80, 150, 0.7)', // Более насыщенный и темный синий
    boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(100, 150, 255, 0.6)'
  };

  // Константы для значений времени и раздач
  const speedSettings = {
    Regular: { time: 15, hands: 8 },
    Turbo: { time: 10, hands: 5 },
    Hyper: { time: 5, hands: 3 }
  };

  // Обработчик для кнопки "Назад"
  const handleBack = () => {
    navigate('/');
  };

  // Обработчик для кнопки "Далее"
  const handleNext = () => {
    const gameSettings = {
      gameType,
      gameSpeed,
      timeMode,
      dealerDisplay,
      speedSettings: speedSettings[gameSpeed]
    };
    
    navigate('/add-players', { state: { gameSettings } });
  };

  // Обработчик для кнопки Cash
  const handleCashClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.showPopup({
        title: 'Coming Soon',
        message: 'Cash game mode will be available in the next update!',
        buttons: [{ type: 'close' }]
      });
    } else {
      alert('Cash game mode will be available in the next update!');
    }
  };

  // Получаем стили для кнопок в зависимости от состояния и платформы
  const getButtonStyles = (isActive) => {
    if (!isIosDevice) return {};
    return isActive ? iosActiveStyles : iosBaseStyles;
  };

  // Стили для нижних навигационных кнопок на iOS
  const iosNavStyles = isIosDevice ? { 
    color: 'rgba(255, 255, 255, 0.8)'
  } : {};

  // Стили специально для кнопки Next на iOS - голубой цвет
  const iosNextStyles = isIosDevice ? {
    color: '#60A5FA' // Голубой цвет для кнопки Next на iOS
  } : {};

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#4B6CB7] to-[#182848] flex flex-col items-center justify-center p-6">
      <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl 
                    rounded-3xl p-8 w-full max-w-[400px] mb-24
                    shadow-[inset_0_0_30px_rgba(255,255,255,0.1),0_10px_40px_rgba(0,0,0,0.2)]
                    border border-white/30">
        
        {/* Game Type Selection */}
        <div className="flex gap-2 mb-8">
          <button
            className={`flex-1 h-10 rounded-xl backdrop-blur-sm border border-white/30
                      ${gameType === 'SnG' ? 'bg-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5'} 
                      text-white font-semibold transition-all duration-300
                      active:scale-95 active:bg-blue-500/50 touch-none`}
            style={getButtonStyles(gameType === 'SnG')}
            onClick={() => setGameType('SnG')}
          >
            SnG
          </button>
          <button
            className="flex-1 h-10 rounded-xl backdrop-blur-sm border border-white/30
                     bg-white/5 text-white/30 font-semibold cursor-pointer
                     hover:bg-white/10 transition-all duration-300
                     active:scale-95 active:bg-white/20 touch-none"
            style={isIosDevice ? { ...iosBaseStyles, opacity: 0.5 } : {}}
            onClick={handleCashClick}
          >
            Cash
          </button>
        </div>

        {/* Game Speed Selection */}
        <div className="flex gap-2 mb-8">
          {['Regular', 'Turbo', 'Hyper'].map((speed) => (
            <button
              key={speed}
              className={`flex-1 h-10 rounded-xl backdrop-blur-sm border border-white/30
                        ${gameSpeed === speed ? 'bg-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5'} 
                        text-white font-semibold transition-all duration-300
                        active:scale-95 active:bg-blue-500/50 touch-none`}
              style={getButtonStyles(gameSpeed === speed)}
              onClick={() => setGameSpeed(speed)}
            >
              {speed}
            </button>
          ))}
        </div>

        {/* Time/Hands Selection */}
        <div className="flex items-end gap-4 mb-8">
          <div className="flex-1">
            <div className="text-white/80 mb-2">Time</div>
            <button
              className={`w-full h-10 rounded-xl backdrop-blur-sm border border-white/30
                        ${timeMode === 'Time' ? 'bg-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5'} 
                        text-white font-semibold transition-all duration-300
                        active:scale-95 active:bg-blue-500/50 touch-none`}
              style={getButtonStyles(timeMode === 'Time')}
              onClick={() => setTimeMode('Time')}
            >
              {speedSettings[gameSpeed].time}m
            </button>
          </div>

          <div className="h-10 flex items-center justify-center">
            <span className="text-white/80 text-3xl leading-none">
              {timeMode === 'Time' ? '⏱' : '♠'}
            </span>
          </div>

          <div className="flex-1">
            <div className="text-white/80 mb-2">Hands</div>
            <button
              className={`w-full h-10 rounded-xl backdrop-blur-sm border border-white/30
                        ${timeMode === 'Hands' ? 'bg-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5'} 
                        text-white font-semibold transition-all duration-300
                        active:scale-95 active:bg-blue-500/50 touch-none`}
              style={getButtonStyles(timeMode === 'Hands')}
              onClick={() => setTimeMode('Hands')}
            >
              {speedSettings[gameSpeed].hands}
            </button>
          </div>
        </div>

        {/* Dealer Display Selection */}
        <div className="mb-8">
          <div className="text-white/80 mb-2">Dealer Display</div>
          <div className="flex gap-2">
            <button
              className={`flex-1 h-10 rounded-xl backdrop-blur-sm border border-white/30
                        ${dealerDisplay === 'Individual' ? 'bg-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5'} 
                        text-white font-semibold transition-all duration-300
                        active:scale-95 active:bg-blue-500/50 touch-none`}
              style={getButtonStyles(dealerDisplay === 'Individual')}
              onClick={() => setDealerDisplay('Individual')}
            >
              Individual
            </button>
            <button
              className={`flex-1 h-10 rounded-xl backdrop-blur-sm border border-white/30
                        ${dealerDisplay === 'Table' ? 'bg-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5'} 
                        text-white font-semibold transition-all duration-300
                        active:scale-95 active:bg-blue-500/50 touch-none`}
              style={getButtonStyles(dealerDisplay === 'Table')}
              onClick={() => setDealerDisplay('Table')}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-6 left-0 right-0 px-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-white/60 transition-colors duration-300
                     hover:text-white active:text-white/40"
            style={iosNavStyles}
          >
            Back
          </button>
          
          <div className="text-white/60 text-center text-sm px-4">
            Set your game preferences, choose card display, and proceed to the next step!
          </div>

          <button
            onClick={handleNext}
            className="text-blue-400 transition-colors duration-300
                     hover:text-blue-300 active:text-blue-500"
            style={iosNextStyles}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSetup; 