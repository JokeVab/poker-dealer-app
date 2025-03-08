import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { isIOS } from '../utils/platformUtils';

/**
 * Компонент RoleSelection - экран для выбора роли (Player или Dealer)
 */
const RoleSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const { updateUserRole } = useWebSocket();
  
  // Получаем данные о комнате из состояния навигации
  const { roomCode, roomInfo } = location.state || {};
  
  // Проверка на iOS устройство
  useEffect(() => {
    setIsIosDevice(isIOS());
    console.log('RoleSelection: Инициализация компонента');
    console.log('RoleSelection: Данные комнаты:', { roomCode, roomInfo });
    
    // Если нет кода комнаты или информации о комнате, возвращаем на главный экран
    if (!roomCode || !roomInfo) {
      console.log('RoleSelection: Отсутствуют данные комнаты, возвращаемся на главный экран');
      navigate('/');
    }
  }, []);

  // Обработчик выбора роли
  const handleRoleSelection = async (role) => {
    if (!roomCode) {
      setError('Room information is missing');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    console.log(`RoleSelection: Выбрана роль: ${role}`);
    
    try {
      // Проверяем, есть ли уже дилер в комнате, если выбрана роль дилера
      if (role === 'dealer' && roomInfo.dealer) {
        console.log('RoleSelection: Дилер уже присутствует в комнате');
        throw new Error('A dealer has already joined this room');
      }
      
      // Обновляем роль пользователя в комнате
      console.log(`RoleSelection: Отправляем запрос на обновление роли: ${role}`);
      const result = await updateUserRole(roomCode, role);
      
      if (!result) {
        console.log('RoleSelection: Не удалось обновить роль');
        throw new Error(`Failed to join as ${role}`);
      }
      
      console.log('RoleSelection: Роль успешно обновлена:', result);
      
      // Если роль дилера, показываем инструкцию для поворота устройства
      if (role === 'dealer') {
        console.log('RoleSelection: Показываем уведомление о повороте устройства для дилера');
        alert('Please rotate your device to landscape mode for the best experience as a dealer');
      }
      
      // Перенаправляем на экран комнаты с выбранной ролью
      console.log('RoleSelection: Переходим в покерную комнату');
      navigate('/poker-room', { state: { roomCode, role, roomInfo } });
      
    } catch (err) {
      console.error('Error selecting role:', err);
      setError(err.message || `Failed to join as ${role}`);
    } finally {
      setIsLoading(false);
    }
  };

  // iOS-специфичные стили
  const iosContainerStyles = isIosDevice ? {
    backdropFilter: 'blur(5px)',
    borderColor: 'rgba(255, 255, 255, 0.4)'
  } : {};

  const iosButtonStyles = isIosDevice ? {
    backgroundColor: 'rgba(20, 30, 70, 0.6)',
    color: 'white',
    borderColor: 'rgba(255, 255, 255, 0.4)'
  } : {};

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center p-6">
      <div 
        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl
                 rounded-3xl p-8 w-full max-w-[400px]
                 shadow-[inset_0_0_30px_rgba(255,255,255,0.1),0_10px_40px_rgba(0,0,0,0.2)]
                 border border-white/30"
        style={iosContainerStyles}
      >
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Choose Your Role</h2>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="mb-4 text-white/80 text-center">
            Select your role in the poker game
          </div>

          <button
            onClick={() => handleRoleSelection('player')}
            disabled={isLoading}
            className={`w-full py-4 px-4 rounded-lg text-white text-lg font-medium
                      bg-gradient-to-r from-blue-700 to-blue-800 border border-blue-600 
                      hover:from-blue-600 hover:to-blue-700
                      transition-colors duration-300 flex items-center justify-center mb-4`}
            style={!isLoading ? iosButtonStyles : {}}
          >
            Join as Player
          </button>

          <button
            onClick={() => handleRoleSelection('dealer')}
            disabled={isLoading}
            className={`w-full py-4 px-4 rounded-lg text-white text-lg font-medium
                      bg-gradient-to-r from-green-700 to-green-800 border border-green-600 
                      hover:from-green-600 hover:to-green-700
                      transition-colors duration-300 flex items-center justify-center`}
            style={!isLoading ? iosButtonStyles : {}}
          >
            Join as Dealer
          </button>
        </div>

        <div className="mt-6 text-white/60 text-sm text-center">
          <p className="mb-2">
            <span className="font-semibold">Player:</span> Join the game and get a seat at the poker table
          </p>
          <p>
            <span className="font-semibold">Dealer:</span> Manage the cards and oversee the game
          </p>
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

export default RoleSelection; 