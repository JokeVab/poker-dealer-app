import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { createRoom } = useWebSocket();

  useEffect(() => {
    // Подтягиваем данные из Telegram
    const tg = window.Telegram?.WebApp;
    if (tg && tg.initDataUnsafe?.user) {
      const user = tg.initDataUnsafe.user;
      setNickname(user.first_name || user.username || '');
      setAvatar(user.photo_url || null);
    }
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!nickname) {
        throw new Error('Nickname is required');
      }

      // Создаем комнату через useWebSocket хук
      const host = {
        id: Date.now().toString(), // Временный ID
        name: nickname,
        username: nickname,
        avatar: avatar
      };
      
      const result = await createRoom(host, {
        speed: 'normal',
        showDealer: true
      });
      
      if (result?.roomId) {
        navigate('/add-players');
      } else {
        throw new Error('Failed to create room');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 flex flex-col p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl 
                      p-6 rounded-xl shadow-xl border border-gray-700">
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <h2 className="text-2xl font-bold mb-8 text-white text-center">Game Setup</h2>

          <div className="flex items-center space-x-4 mb-6 bg-gray-800/50 p-4 rounded-lg">
            {avatar ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white">
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-xl text-white border-2 border-white">
                {nickname.charAt(0) || '?'}
              </div>
            )}
            <div className="flex-1">
              <p className="text-white/60 text-sm">Hosting as</p>
              <p className="text-white font-medium">{nickname || 'Anonymous'}</p>
            </div>
          </div>

          <div className="space-y-6 mt-8">
            <h3 className="text-lg font-medium text-white">Game Settings</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-white">Dealer Button</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer 
                              peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300"></div>
                  <span className="ml-3 text-sm font-medium text-white">Show</span>
                </label>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-white">Game Speed</span>
                <select className="bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600">
                  <option>Normal</option>
                  <option>Fast</option>
                  <option>Slow</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white text-lg font-medium mt-8
              ${!isLoading
                ? 'bg-gradient-to-r from-blue-700 to-blue-800 border border-blue-600 hover:from-blue-600 hover:to-blue-700'
                : 'bg-gray-600 cursor-not-allowed'}
              transition-colors duration-300 flex items-center justify-center`}
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : 'Create Room'}
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
          
          <div 
            onClick={!isLoading ? handleCreateRoom : undefined}
            className={`px-4 ${
              !isLoading 
                ? 'text-white cursor-pointer' 
                : 'text-gray-500 cursor-not-allowed'
            }`}
          >
            Next
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom; 