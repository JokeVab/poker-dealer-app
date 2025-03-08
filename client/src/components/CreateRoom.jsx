import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useTelegram } from '../hooks/useTelegram';

const CreateRoom = () => {
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { socket } = useWebSocket();
  const { user } = useTelegram();

  useEffect(() => {
    // Подтягиваем данные из Telegram
    if (user) {
      setNickname(user.username || '');
      setAvatar(user.photo_url || null);
    }

    socket?.on('room_created', ({ roomId, room }) => {
      localStorage.setItem('currentRoom', JSON.stringify(room));
      localStorage.setItem('userRole', 'host');
    });

    socket?.on('error', ({ message }) => {
      setError(message);
      setIsLoading(false);
    });

    return () => {
      socket?.off('room_created');
      socket?.off('error');
    };
  }, [socket, user]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (!nickname) {
        throw new Error('Nickname is required');
      }

      socket.emit('create_room', {
        host: {
          nickname,
          avatar
        }
      });
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
            {error}
          </div>
        )}
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Set Up Your Profile</h2>
        
        <div className="flex items-center space-x-4 mb-6">
          {avatar && (
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5">
              <img 
                src={avatar} 
                alt="Telegram Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <p className="text-white/80">Your Telegram Profile</p>
            <p className="text-white font-medium">{nickname}</p>
          </div>
        </div>

        <button
          onClick={handleCreateRoom}
          disabled={!nickname || isLoading}
          className={`w-full py-3 px-4 rounded-xl text-white text-lg font-semibold
            ${nickname && !isLoading
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-gray-500 cursor-not-allowed'}
            transition-colors duration-300 flex items-center justify-center`}
        >
          {isLoading ? (
            <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : null}
          {isLoading ? 'Creating...' : 'Create Room'}
        </button>
      </div>
    </div>
  );
};

export default CreateRoom; 