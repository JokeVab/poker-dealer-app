import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { isIOS } from '../utils/platformUtils';

/**
 * Компонент JoinRoom - экран для присоединения к существующей комнате по коду
 */
const JoinRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const { joinRoom, getRoom } = useWebSocket();

  // Проверка на iOS устройство
  useEffect(() => {
    setIsIosDevice(isIOS());
  }, []);

  // Проверяем, есть ли код в URL (для присоединения по ссылке)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const codeFromUrl = searchParams.get('code');
    
    if (codeFromUrl) {
      setRoomCode(codeFromUrl);
      handleJoinRoom(codeFromUrl);
    }
  }, [location]);

  // Получаем данные пользователя из Telegram
  const getUserData = () => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.initDataUnsafe?.user) {
      const user = tg.initDataUnsafe.user;
      return {
        id: user.id?.toString() || Date.now().toString(),
        name: user.first_name || '',
        username: user.username || user.first_name || 'Player',
        avatar: user.photo_url || null
      };
    }
    
    // Если данных из Telegram нет, создаем временного пользователя
    return {
      id: Date.now().toString(),
      name: 'Guest',
      username: 'Guest_' + Math.floor(Math.random() * 1000),
      avatar: null
    };
  };

  // Обработчик присоединения к комнате
  const handleJoinRoom = async (code = roomCode) => {
    if (!code) {
      setError('Please enter a room code');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Сначала получаем информацию о комнате
      const roomInfo = await getRoom(code);
      
      if (!roomInfo) {
        throw new Error('Invalid room code or room does not exist');
      }
      
      // Проверяем, не заполнена ли комната
      if (roomInfo.players && roomInfo.players.length >= 6) {
        throw new Error('Room is full');
      }
      
      // Получаем данные пользователя
      const userData = getUserData();
      
      // Присоединяемся к комнате
      const joinResult = await joinRoom(code, userData);
      
      if (!joinResult) {
        throw new Error('Failed to join room');
      }
      
      // Проверяем тип отображения дилера для определения следующего экрана
      if (roomInfo.settings && roomInfo.settings.showDealer === 'table') {
        // Переход на экран выбора роли
        navigate('/select-role', { state: { roomCode: code, roomInfo } });
      } else {
        // Сразу в комнату как Player
        navigate('/room', { state: { roomCode: code, role: 'player', roomInfo } });
      }
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.message || 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  // iOS-специфичные стили
  const iosContainerStyles = isIosDevice ? {
    backdropFilter: 'blur(5px)',
    borderColor: 'rgba(255, 255, 255, 0.4)'
  } : {};

  const iosInputStyles = isIosDevice ? {
    backgroundColor: 'rgba(20, 30, 70, 0.6)',
    color: 'white',
    borderColor: 'rgba(255, 255, 255, 0.4)'
  } : {};

  const iosButtonStyles = isIosDevice ? {
    backgroundColor: 'rgba(20, 30, 70, 0.6)',
    color: 'white',
    borderColor: 'rgba(255, 255, 255, 0.4)'
  } : {};

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#4B6CB7] to-[#182848] flex flex-col items-center justify-center p-6">
      <div 
        className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl
                 rounded-3xl p-8 w-full max-w-[400px]
                 shadow-[inset_0_0_30px_rgba(255,255,255,0.1),0_10px_40px_rgba(0,0,0,0.2)]
                 border border-white/30"
        style={iosContainerStyles}
      >
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Join Game</h2>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="roomCode" className="block text-white/80 mb-2">
              Enter Room Code
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white"
              style={iosInputStyles}
              maxLength={6}
            />
          </div>

          <button
            onClick={() => handleJoinRoom()}
            disabled={isLoading || !roomCode}
            className={`w-full py-3 px-4 rounded-lg text-white text-lg font-medium
                      ${!isLoading && roomCode
                        ? 'bg-gradient-to-r from-blue-700 to-blue-800 border border-blue-600 hover:from-blue-600 hover:to-blue-700'
                        : 'bg-gray-600 cursor-not-allowed'}
                      transition-colors duration-300 flex items-center justify-center`}
            style={roomCode && !isLoading ? iosButtonStyles : {}}
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Joining...
              </>
            ) : 'Join Room'}
          </button>
        </div>
      </div>

      {/* Навигация */}
      <div className="mt-auto">
        <div className="flex justify-between items-center py-4 relative">
          <div 
            onClick={() => navigate(-1)}
            className="text-gray-300 hover:text-white cursor-pointer px-4"
          >
            Back
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom; 