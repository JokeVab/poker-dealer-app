import React from 'react';
import { useNavigate } from 'react-router-dom';

const StartScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#1B2141]">
      {/* Карты на фоне */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Левая карта */}
        <div className="absolute left-[-60px] top-[20%] w-[240px] h-[340px] bg-white rounded-[20px] transform rotate-[15deg] shadow-2xl">
          <div className="absolute top-4 left-6 text-[32px] font-bold">J</div>
          <div className="absolute bottom-4 right-6 text-[32px] font-bold rotate-180">J</div>
        </div>

        {/* Правая карта */}
        <div className="absolute right-[-60px] top-[20%] w-[240px] h-[340px] bg-white rounded-[20px] transform -rotate-[15deg] shadow-2xl">
          <div className="absolute top-4 left-6 text-[32px] font-bold">2</div>
          <div className="absolute bottom-4 right-6 text-[32px] font-bold rotate-180">2</div>
        </div>
      </div>

      {/* Кнопки */}
      <div className="relative z-10 w-full max-w-[360px] px-6 space-y-4">
        <button
          onClick={() => navigate('/join-game')}
          className="w-full h-[60px] bg-[#2A3250] text-white text-xl font-medium 
                   rounded-[16px] hover:bg-[#343B5C] active:bg-[#3E466B] 
                   transition-all duration-300"
        >
          Join Game
        </button>
        
        <button
          onClick={() => navigate('/create-room')}
          className="w-full h-[60px] bg-[#2A3250] text-white text-xl font-medium 
                   rounded-[16px] hover:bg-[#343B5C] active:bg-[#3E466B] 
                   transition-all duration-300"
        >
          Host Game
        </button>
      </div>
    </div>
  );
};

export default StartScreen; 