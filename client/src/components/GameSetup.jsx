import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GameSetup = () => {
  const navigate = useNavigate();
  
  // Состояния для параметров игры
  const [gameType, setGameType] = useState('SnG');
  const [gameSpeed, setGameSpeed] = useState('Regular');
  const [timeMode, setTimeMode] = useState('Hands');
  const [dealerDisplay, setDealerDisplay] = useState('Individual');
  
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 flex flex-col p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl 
                      p-6 rounded-xl shadow-xl border border-gray-700">
          
          <h2 className="text-2xl font-bold mb-8 text-white text-center">Game Setup</h2>

          {/* Game Type Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Game Type</h3>
            <div className="flex gap-2">
              <button
                className={`flex-1 h-10 rounded-lg backdrop-blur-sm 
                          ${gameType === 'SnG' 
                            ? 'bg-blue-600 border border-blue-500 shadow-lg' 
                            : 'bg-gray-700/70 border border-gray-600'}
                          text-white font-medium transition-all duration-300
                          hover:bg-blue-700 active:scale-95 touch-none`}
                onClick={() => setGameType('SnG')}
              >
                SnG
              </button>
              <button
                className="flex-1 h-10 rounded-lg backdrop-blur-sm 
                         bg-gray-700/70 border border-gray-600 text-gray-400 font-medium cursor-pointer
                         hover:bg-gray-600/70 transition-all duration-300
                         active:scale-95 touch-none"
                onClick={handleCashClick}
              >
                Cash
              </button>
            </div>
          </div>

          {/* Game Speed Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Game Speed</h3>
            <div className="flex gap-2">
              {['Regular', 'Turbo', 'Hyper'].map((speed) => (
                <button
                  key={speed}
                  className={`flex-1 h-10 rounded-lg backdrop-blur-sm 
                            ${gameSpeed === speed 
                              ? 'bg-blue-600 border border-blue-500 shadow-lg' 
                              : 'bg-gray-700/70 border border-gray-600'}
                            text-white font-medium transition-all duration-300
                            hover:bg-blue-700 active:scale-95 touch-none`}
                  onClick={() => setGameSpeed(speed)}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* Time/Hands Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Mode Selection</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <div className="text-white/80 mb-2">Time</div>
                <button
                  className={`w-full h-10 rounded-lg backdrop-blur-sm
                            ${timeMode === 'Time' 
                              ? 'bg-blue-600 border border-blue-500 shadow-lg' 
                              : 'bg-gray-700/70 border border-gray-600'}
                            text-white font-medium transition-all duration-300
                            hover:bg-blue-700 active:scale-95 touch-none`}
                  onClick={() => setTimeMode('Time')}
                >
                  {speedSettings[gameSpeed].time}m
                </button>
              </div>

              <div className="h-10 flex items-center justify-center">
                <span className="text-white/80 text-3xl leading-none">
                  {timeMode === 'Time' ? '⏱' : '🃏'}
                </span>
              </div>

              <div className="flex-1">
                <div className="text-white/80 mb-2">Hands</div>
                <button
                  className={`w-full h-10 rounded-lg backdrop-blur-sm
                            ${timeMode === 'Hands' 
                              ? 'bg-blue-600 border border-blue-500 shadow-lg' 
                              : 'bg-gray-700/70 border border-gray-600'}
                            text-white font-medium transition-all duration-300
                            hover:bg-blue-700 active:scale-95 touch-none`}
                  onClick={() => setTimeMode('Hands')}
                >
                  {speedSettings[gameSpeed].hands}
                </button>
              </div>
            </div>
          </div>

          {/* Dealer Display Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Dealer Display</h3>
            <div className="flex gap-2">
              <button
                className={`flex-1 h-10 rounded-lg backdrop-blur-sm
                          ${dealerDisplay === 'Individual' 
                            ? 'bg-blue-600 border border-blue-500 shadow-lg' 
                            : 'bg-gray-700/70 border border-gray-600'}
                          text-white font-medium transition-all duration-300
                          hover:bg-blue-700 active:scale-95 touch-none`}
                onClick={() => setDealerDisplay('Individual')}
              >
                Individual
              </button>
              <button
                className={`flex-1 h-10 rounded-lg backdrop-blur-sm
                          ${dealerDisplay === 'Table' 
                            ? 'bg-blue-600 border border-blue-500 shadow-lg' 
                            : 'bg-gray-700/70 border border-gray-600'}
                          text-white font-medium transition-all duration-300
                          hover:bg-blue-700 active:scale-95 touch-none`}
                onClick={() => setDealerDisplay('Table')}
              >
                Table
              </button>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3 px-4 rounded-lg text-white text-lg font-medium mt-8
                     bg-gradient-to-r from-blue-700 to-blue-800 border border-blue-600 
                     hover:from-blue-600 hover:to-blue-700
                     transition-colors duration-300 flex items-center justify-center"
          >
            Continue to Player Setup
          </button>
        </div>
      </div>

      {/* Навигация */}
      <div className="mt-auto">
        <div className="flex justify-between items-center py-4 relative">
          <div 
            onClick={handleBack}
            className="text-gray-300 hover:text-white cursor-pointer px-4"
          >
            Back
          </div>
          
          <div 
            onClick={handleNext}
            className="text-white cursor-pointer px-4"
          >
            Next
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSetup; 