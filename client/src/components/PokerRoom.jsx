import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { isIOS } from '../utils/platformUtils';

/**
 * Компонент PokerRoom - основной экран покерной комнаты
 * Отображается по-разному в зависимости от роли пользователя (Host, Player, Dealer)
 */
const PokerRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tableRef = useRef(null);
  const { socket, movePlayer, removePlayer } = useWebSocket();
  
  // Получаем данные о комнате и роли пользователя из состояния навигации
  const { roomCode, role, roomInfo: initialRoomInfo } = location.state || {};
  
  // Состояние комнаты и участников
  const [roomInfo, setRoomInfo] = useState(initialRoomInfo || {});
  const [players, setPlayers] = useState([]);
  const [dealer, setDealer] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [draggingPlayer, setDraggingPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isIosDevice, setIsIosDevice] = useState(false);
  
  // Размеры стола
  const [tableSize, setTableSize] = useState({ width: 300, height: 150 });

  // Проверка на iOS устройство и инициализация
  useEffect(() => {
    setIsIosDevice(isIOS());
    
    // Если нет кода комнаты или роли, возвращаем на главный экран
    if (!roomCode || !role) {
      navigate('/');
      return;
    }
    
    // Инициализация данных комнаты
    if (initialRoomInfo) {
      setRoomInfo(initialRoomInfo);
      
      if (initialRoomInfo.players) {
        setPlayers(initialRoomInfo.players);
      }
      
      if (initialRoomInfo.dealer) {
        setDealer(initialRoomInfo.dealer);
      }
    }
    
    // Определяем текущего пользователя из Telegram
    const tg = window.Telegram?.WebApp;
    if (tg && tg.initDataUnsafe?.user) {
      const user = tg.initDataUnsafe.user;
      const userData = {
        id: user.id?.toString() || Date.now().toString(),
        name: user.first_name || '',
        username: user.username || user.first_name || 'Player',
        avatar: user.photo_url || null
      };
      setCurrentUser(userData);
    }
    
    // Обновляем размер стола при загрузке и изменении размера экрана
    updateTableSize();
    window.addEventListener('resize', updateTableSize);
    
    return () => {
      window.removeEventListener('resize', updateTableSize);
    };
  }, []);

  // Обработчики сокет-событий
  useEffect(() => {
    if (!socket || !roomCode) return;
    
    // Обработчик обновления комнаты
    const handleRoomUpdate = (data) => {
      if (data.roomId === roomCode) {
        setRoomInfo(data.room);
        setPlayers(data.room.players || []);
        setDealer(data.room.dealer || null);
      }
    };
    
    // Обработчик присоединения нового игрока
    const handlePlayerJoined = (data) => {
      if (data.roomId === roomCode) {
        setPlayers(prevPlayers => [...prevPlayers, data.player]);
      }
    };
    
    // Обработчик перемещения игрока
    const handlePlayerMoved = (data) => {
      if (data.roomId === roomCode) {
        setPlayers(prevPlayers => {
          const updatedPlayers = [...prevPlayers];
          const playerIndex = updatedPlayers.findIndex(p => p.id === data.playerId);
          
          if (playerIndex >= 0) {
            updatedPlayers[playerIndex].position = data.position;
          }
          
          return updatedPlayers;
        });
      }
    };
    
    // Обработчик удаления игрока
    const handlePlayerRemoved = (data) => {
      if (data.roomId === roomCode) {
        setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== data.playerId));
      }
    };
    
    // Подписываемся на события
    socket.on('room_update', handleRoomUpdate);
    socket.on('player_joined', handlePlayerJoined);
    socket.on('player_moved', handlePlayerMoved);
    socket.on('player_removed', handlePlayerRemoved);
    
    // Отписываемся при размонтировании
    return () => {
      socket.off('room_update', handleRoomUpdate);
      socket.off('player_joined', handlePlayerJoined);
      socket.off('player_moved', handlePlayerMoved);
      socket.off('player_removed', handlePlayerRemoved);
    };
  }, [socket, roomCode]);

  // Функция для обновления размера стола
  const updateTableSize = () => {
    if (tableRef.current) {
      // Для Dealer в ландшафтной ориентации - большой стол
      if (role === 'dealer') {
        const width = Math.min(window.innerWidth * 0.9, 800);
        const height = width / 2;
        setTableSize({ width, height });
      } else {
        // Для Host и Player - обычный размер стола
        const containerWidth = tableRef.current.clientWidth;
        const width = Math.min(containerWidth * 0.9, 400);
        const height = width / 2;
        setTableSize({ width, height });
      }
    }
  };

  // Функция для расчета позиции игрока за столом
  const calculatePosition = (index, totalPositions) => {
    const { width, height } = tableSize;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Для эллипса стола
    const a = width * 0.4; // горизонтальная полуось
    const b = height * 0.6; // вертикальная полуось
    
    // Специальная обработка для текущего пользователя (всегда внизу посередине)
    const isCurrentUser = role === 'player' && currentUser && players[index]?.id === currentUser.id;
    
    // Определяем угол в зависимости от позиции
    let angle;
    
    if (isCurrentUser) {
      angle = Math.PI / 2; // внизу посередине (90 градусов)
    } else {
      // Для остальных игроков распределяем по эллипсу
      // Угол зависит от позиции (index) и общего количества игроков (totalPositions)
      let adjustedIndex = index;
      
      // Если текущий пользователь есть в игроках и не совпадает с текущим индексом,
      // корректируем индексы для остальных игроков
      if (role === 'player' && currentUser) {
        const currentUserIndex = players.findIndex(p => p.id === currentUser.id);
        if (currentUserIndex >= 0 && currentUserIndex !== index) {
          if (index > currentUserIndex) {
            adjustedIndex = index - 1;
          }
        }
      }
      
      // Рассчитываем угол для текущего игрока
      angle = (Math.PI * 2 * adjustedIndex) / (totalPositions - 1) - Math.PI / 2;
    }
    
    // Вычисляем координаты на эллипсе
    const x = centerX + a * Math.cos(angle);
    const y = centerY + b * Math.sin(angle);
    
    return { left: x, top: y, hidden: false };
  };

  // Обработчик начала перетаскивания игрока (только для хоста)
  const handlePlayerDragStart = (player) => {
    if (role !== 'host') return;
    
    setDraggingPlayer(player);
    setSelectedPlayer(player);
  };

  // Обработчик перетаскивания игрока
  const handlePlayerDrag = (e) => {
    if (!draggingPlayer || role !== 'host') return;
    
    // Обновление позиции перетаскиваемого игрока
    // Реализация зависит от UI библиотеки
  };

  // Обработчик окончания перетаскивания игрока
  const handlePlayerDragEnd = (newPosition) => {
    if (!draggingPlayer || role !== 'host') return;
    
    // Обновляем позицию игрока в комнате через API
    movePlayer(roomCode, draggingPlayer.id, newPosition);
    
    setDraggingPlayer(null);
  };

  // Обработчик удаления игрока (только для хоста)
  const handleRemovePlayer = (playerId) => {
    if (role !== 'host') return;
    
    removePlayer(roomCode, playerId);
  };

  // Обработчик нажатия на игрока
  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
  };

  // Генерация кода/ссылки для приглашения (только для хоста)
  const getInviteLink = () => {
    // Используем параметр code вместо start для совместимости с JoinRoom
    return `https://t.me/PokerDealerGameBot?code=${roomCode}`;
  };

  // Функция копирования кода комнаты в буфер обмена
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    // Можно добавить уведомление о копировании
  };

  // Функция для шеринга через Telegram
  const handleTelegramShare = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.shareUrl(getInviteLink());
    }
  };

  // Функция обработки начала игры (только для хоста)
  const handleStartGame = () => {
    // Реализация начала игры
    console.log('Game started!');
  };

  // iOS-специфичные стили
  const iosContainerStyles = isIosDevice ? {
    backdropFilter: 'blur(5px)',
    borderColor: 'rgba(255, 255, 255, 0.4)'
  } : {};

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 text-white p-6">
      <div className="flex-1">
        {/* Покерный стол */}
        <div 
          ref={tableRef}
          className="relative mx-auto mt-12 mb-20 flex-shrink-0"
          style={{ 
            width: tableSize.width, 
            height: tableSize.height,
            backgroundColor: 'rgba(53, 101, 77, 0.95)',
            borderRadius: '50%',
            boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.6), 0 10px 30px rgba(0, 0, 0, 0.4)',
            border: '10px solid rgba(83, 56, 33, 0.9)'
          }}
        >
          {/* Отображение игроков вокруг стола */}
          {players.map((player, index) => {
            const position = calculatePosition(index, players.length || 1);
            
            if (position.hidden) {
              return null;
            }
            
            return (
              <div
                key={player.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${position.left}px`,
                  top: `${position.top}px`,
                  cursor: role === 'host' ? 'grab' : 'default',
                  zIndex: draggingPlayer && draggingPlayer.id === player.id ? 10 : 1
                }}
                onTouchStart={() => handlePlayerDragStart(player)}
                onMouseDown={() => handlePlayerDragStart(player)}
                onTouchEnd={handlePlayerDragEnd}
                onMouseUp={handlePlayerDragEnd}
              >
                <div className="relative">
                  {player.avatar ? (
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className={`rounded-full border-2 border-white ${player.isHost ? 'w-20 h-20' : 'w-16 h-16'}`}
                      draggable="false"
                    />
                  ) : (
                    <div className={`rounded-full bg-gray-600 border-2 border-white flex items-center justify-center 
                                   ${player.isHost ? 'w-20 h-20 text-xl' : 'w-16 h-16 text-lg'}`}>
                      {player.name[0]}
                    </div>
                  )}
                  {player.isHost && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center text-xs border border-white">
                      H
                    </div>
                  )}
                  <div className="text-center mt-1 text-white text-sm font-medium">
                    {player.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Секция для отображения информации о комнате и управления (зависит от роли) */}
        {role === 'host' && (
          <div className="w-full max-w-md mx-auto mt-12">
            <div className="mb-3 font-medium ml-1">Share Room Code:</div>
            
            <div className="flex items-center justify-center gap-2 mb-5">
              <div 
                onClick={handleCopyCode} 
                className="flex-1 bg-white/10 rounded-lg border border-white/30 px-3 overflow-hidden h-12 flex items-center cursor-pointer hover:bg-white/15 transition-colors"
                style={{ maxWidth: '280px' }}
              >
                <span className="text-lg font-mono truncate w-full text-center">{roomCode}</span>
              </div>
              
              <button
                onClick={handleTelegramShare}
                className="w-12 h-12 bg-[#0088cc] rounded-lg flex items-center justify-center shadow-md"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.665 3.717L2.93497 10.554C1.72497 11.04 1.73197 11.715 2.71297 12.016L7.26497 13.436L17.797 6.791C18.295 6.488 18.75 6.651 18.376 6.983L9.84297 14.684H9.84097L9.84297 14.685L9.52897 19.377C9.98897 19.377 10.192 19.166 10.45 18.917L12.661 16.767L17.26 20.164C18.108 20.631 18.717 20.391 18.928 19.379L21.947 5.151C22.256 3.912 21.474 3.351 20.665 3.717Z" fill="white"/>
                </svg>
              </button>
            </div>
            
            <button
              onClick={handleStartGame}
              className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
            >
              Start Game
            </button>
          </div>
        )}
        
        {/* Для игрока отображаем только информацию о ожидании начала игры */}
        {role === 'player' && (
          <div className="w-full max-w-md mx-auto mt-12 text-center">
            <div className="text-lg font-medium mb-3">Waiting for the host to start the game...</div>
            <div className="text-white/60 text-sm">
              You have joined the room. The host is currently setting up the game.
            </div>
          </div>
        )}
        
        {/* Для дилера отображаем только стол (в более крупном размере) */}
        {role === 'dealer' && (
          <div className="w-full text-center mt-4">
            <div className="text-lg font-medium mb-3">Dealer View</div>
            <div className="text-white/60 text-sm">
              Waiting for the host to start the game...
            </div>
          </div>
        )}
      </div>

      {/* Навигация с разными вариантами в зависимости от роли */}
      <div className="mt-auto">
        <div className="flex justify-between items-center py-4 relative">
          {/* Только для хоста показываем кнопку "Back" */}
          {role === 'host' && (
            <div 
              onClick={() => navigate(-1)}
              className="text-gray-300 hover:text-white cursor-pointer px-4"
            >
              Back
            </div>
          )}
          
          {/* Только для хоста показываем кнопку "Next" */}
          {role === 'host' && (
            <div 
              onClick={handleStartGame}
              className="text-white cursor-pointer px-4"
            >
              Start Game
            </div>
          )}
          
          {/* Для игрока и дилера показываем информацию */}
          {(role === 'player' || role === 'dealer') && (
            <div className="w-full text-center text-white/60 text-sm">
              Wait for the host to start the game
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokerRoom; 