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
    // TODO: Создание покерной комнаты с выбранными параметрами
    navigate('/create-room'); // Временно, нужно будет изменить на следующий шаг
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#4B6CB7] to-[#182848] flex flex-col items-center justify-center p-6">
      <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl 
                    rounded-3xl p-8 w-full max-w-[400px]
                    shadow-[inset_0_0_30px_rgba(255,255,255,0.1),0_10px_40px_rgba(0,0,0,0.2)]
                    border border-white/30">
        
        {/* Game Type Selection */}
        <div className="flex gap-2 mb-8">
          <button
            className={`flex-1 py-3 px-6 rounded-xl backdrop-blur-sm border border-white/30
                      ${gameType === 'SnG' ? 'bg-white/20' : 'bg-white/5'} 
                      text-white font-semibold transition-all duration-300`}
            onClick={() => setGameType('SnG')}
          >
            SnG
          </button>
          <button
            className="flex-1 py-3 px-6 rounded-xl backdrop-blur-sm border border-white/30
                     bg-white/5 text-white/30 font-semibold cursor-not-allowed
                     filter blur-[0.3px]"
            disabled
          >
            Cash
          </button>
        </div>

        {/* Game Speed Selection */}
        <div className="flex gap-2 mb-8">
          {['Regular', 'Turbo', 'Hyper'].map((speed) => (
            <button
              key={speed}
              className={`flex-1 py-3 px-2 rounded-xl backdrop-blur-sm border border-white/30
                        ${gameSpeed === speed ? 'bg-white/20' : 'bg-white/5'} 
                        text-white font-semibold transition-all duration-300`}
              onClick={() => setGameSpeed(speed)}
            >
              {speed}
            </button>
          ))}
        </div>

        {/* Time/Hands Selection */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 mr-4">
            <div className="text-white/80 mb-2">Time</div>
            <button
              className={`w-full py-2 px-4 rounded-xl backdrop-blur-sm border border-white/30
                        ${timeMode === 'Time' ? 'bg-white/20' : 'bg-white/5'} 
                        text-white font-semibold transition-all duration-300`}
              onClick={() => setTimeMode('Time')}
            >
              {speedSettings[gameSpeed].time}m
            </button>
          </div>
          
          <div className="w-12 h-12 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center">
              <span className="text-white/80 text-xl">⌛</span>
            </div>
          </div>

          <div className="flex-1 ml-4">
            <div className="text-white/80 mb-2">Hands</div>
            <button
              className={`w-full py-2 px-4 rounded-xl backdrop-blur-sm border border-white/30
                        ${timeMode === 'Hands' ? 'bg-white/20' : 'bg-white/5'} 
                        text-white font-semibold transition-all duration-300`}
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
              className={`flex-1 py-3 px-6 rounded-xl backdrop-blur-sm border border-white/30
                        ${dealerDisplay === 'Individual' ? 'bg-white/20' : 'bg-white/5'} 
                        text-white font-semibold transition-all duration-300`}
              onClick={() => setDealerDisplay('Individual')}
            >
              Individual
            </button>
            <button
              className={`flex-1 py-3 px-6 rounded-xl backdrop-blur-sm border border-white/30
                        ${dealerDisplay === 'Table' ? 'bg-white/20' : 'bg-white/5'} 
                        text-white font-semibold transition-all duration-300`}
              onClick={() => setDealerDisplay('Table')}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute bottom-6 left-0 right-0 px-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm
                     border border-white/30 flex items-center justify-center
                     text-white transition-all duration-300
                     hover:bg-white/20"
          >
            ←
          </button>
          
          <div className="text-white/60 text-center text-sm px-4">
            Set your game preferences, choose card display, and proceed to the next step!
          </div>

          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-blue-500/80 backdrop-blur-sm
                     border border-blue-500/30 flex items-center justify-center
                     text-white transition-all duration-300
                     hover:bg-blue-500"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSetup; 