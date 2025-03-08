import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoomInFirebase, updateRoomPlayers } from '../firebase/firebase';

const AddPlayers = () => {
  const navigate = useNavigate();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [error, setError] = useState(null);
  const tableRef = useRef(null);
  const [tableSize, setTableSize] = useState({ width: 0, height: 0 });
  
  // Отслеживание размера экрана для адаптивного стола
  useEffect(() => {
    const updateTableSize = () => {
      if (tableRef.current) {
        const containerWidth = Math.min(window.innerWidth - 40, 600); // максимальная ширина 600px
        const containerHeight = Math.min(containerWidth * 0.6, 360); // соотношение сторон 5:3, максимальная высота 360px
        
        setTableSize({
          width: Math.max(containerWidth, 280), // минимальная ширина 280px
          height: Math.max(containerHeight, 168) // минимальная высота 168px
        });
      }
    };
    
    updateTableSize();
    window.addEventListener('resize', updateTableSize);
    return () => window.removeEventListener('resize', updateTableSize);
  }, []);

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        if (!window.Telegram?.WebApp) {
          throw new Error('Telegram WebApp is not available');
        }

        const tg = window.Telegram.WebApp;
        const userData = tg.initDataUnsafe?.user || {
          id: 'test_user_id',
          first_name: 'Test',
          username: 'test_user'
        };

        if (!isCreatingRoom && !roomCode) {
          setIsCreatingRoom(true);
          try {
            const host = {
              id: userData.id.toString(),
              name: userData.first_name || userData.username || 'Anonymous',
              username: userData.username || '',
              avatar: userData.photo_url || null
            };

            // Создаем начальные данные комнаты
            const roomData = {
              gameSettings: {
                speed: 'normal',
                showDealer: true
              },
              host: host,
              players: [{
                id: host.id,
                name: host.name,
                avatar: host.avatar,
                isHost: true
              }],
              status: 'waiting',
              maxPlayers: 6
            };

            // Создаем комнату в Firebase
            const roomId = await createRoomInFirebase(roomData);
            setRoomCode(roomId);
            setPlayers(roomData.players);
            setIsCreatingRoom(false);
          } catch (err) {
            console.error('Error creating room:', err);
            const errorMessage = err.message || 'Unknown error';
            if (tg.showPopup) {
              tg.showPopup({
                title: 'Error',
                message: 'Failed to create room: ' + errorMessage,
                buttons: [{ type: 'ok' }]
              });
            } else {
              alert('Failed to create room: ' + errorMessage);
            }
            setIsCreatingRoom(false);
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message || 'Unknown error');
        alert('Failed to initialize: ' + (err.message || 'Unknown error'));
        setIsCreatingRoom(false);
      }
    };

    initializeRoom();
  }, [isCreatingRoom, roomCode]);

  // Расчет позиции игрока по эллипсу стола
  const calculatePosition = (index, totalPositions) => {
    // Общее количество позиций (включая пустые)
    const maxPositions = 6; 
    
    // Если игрок хост, то ставим его внизу
    const isHost = players[index]?.isHost;
    
    // Массив всех игроков, кроме хоста
    const nonHostPlayers = players.filter(p => !p.isHost);
    
    // Ширина и высота эллипса стола
    const tableWidth = tableSize.width * 0.9;  // 90% от ширины контейнера
    const tableHeight = tableSize.height * 0.9; // 90% от высоты контейнера
    
    // Радиусы эллипса
    const a = tableWidth / 2 - 30; // Горизонтальный радиус (минус отступ для аватарок)
    const b = tableHeight / 2 - 30; // Вертикальный радиус
    
    // Центр эллипса
    const centerX = tableWidth / 2;
    const centerY = tableHeight / 2;
    
    if (isHost) {
      // Хост всегда внизу по центру
      return {
        left: centerX,
        top: centerY + b * 0.8 // Немного ближе к центру, чем край эллипса
      };
    }

    // Для остальных игроков распределяем позиции по эллипсу
    
    // Находим позицию этого игрока среди не-хостов
    const nonHostIndex = nonHostPlayers.findIndex(p => p.id === players[index]?.id);
    
    // Для пустых слотов
    const emptySlotIndex = index - players.length;
    
    // Определяем позицию на эллипсе (от 0 до 5)
    let positionIndex;
    
    if (nonHostIndex >= 0) {
      // Для реальных игроков (не хостов)
      positionIndex = nonHostIndex;
    } else if (emptySlotIndex >= 0) {
      // Для пустых слотов
      // Находим свободные позиции
      const takenPositions = nonHostPlayers.map((_, i) => i);
      const availablePositions = Array.from({length: 5}).map((_, i) => i) // 5 позиций (исключая хоста)
        .filter(pos => !takenPositions.includes(pos));
      
      if (emptySlotIndex < availablePositions.length) {
        positionIndex = availablePositions[emptySlotIndex];
      } else {
        return { left: 0, top: 0 }; // Скрываем лишние пустые слоты
      }
    } else {
      return { left: 0, top: 0 }; // Скрываем слот, если не определен
    }

    // Равномерно распределяем позиции по верхней части эллипса (от PI до 2*PI)
    // Позиция 0 - верхняя левая, позиция 4 - верхняя правая
    let angle;
    
    if (positionIndex === 0) angle = Math.PI + Math.PI/6; // Верхняя левая
    else if (positionIndex === 1) angle = Math.PI + Math.PI/3; // Верхняя левая-центр
    else if (positionIndex === 2) angle = Math.PI + Math.PI/2; // Верхняя центр
    else if (positionIndex === 3) angle = Math.PI + 2*Math.PI/3; // Верхняя правая-центр
    else if (positionIndex === 4) angle = Math.PI + 5*Math.PI/6; // Верхняя правая
    
    // Вычисляем координаты на эллипсе
    const x = centerX + a * Math.cos(angle);
    const y = centerY + b * Math.sin(angle);
    
    return { left: x, top: y };
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode).then(() => {
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
      });
    }
  };

  const handleTelegramShare = () => {
    if (!window.Telegram?.WebApp) return;
    
    const inviteLink = `https://t.me/your_bot_name?start=${roomCode}`;
    const text = 'Join my poker game! Click the link to start playing!';
    window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(text)}`);
  };

  const handlePlayerClick = (player) => {
    if (player.isHost) return;
    setSelectedPlayer(player);
    setShowDeleteZone(true);
  };

  const handlePlayerRelease = async (event) => {
    if (!selectedPlayer || selectedPlayer.isHost) return;

    const deleteZone = document.getElementById('deleteZone');
    if (deleteZone) {
      const rect = deleteZone.getBoundingClientRect();
      const { clientX, clientY } = event.changedTouches ? event.changedTouches[0] : event;

      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        const updatedPlayers = players.filter(p => p.id !== selectedPlayer.id);
        setPlayers(updatedPlayers);
        try {
          await updateRoomPlayers(roomCode, updatedPlayers);
        } catch (error) {
          console.error('Error removing player:', error);
          if (window.Telegram?.WebApp?.showAlert) {
            window.Telegram.WebApp.showAlert('Error removing player. Please try again.');
          } else {
            alert('Error removing player. Please try again.');
          }
        }
      }
    }

    setSelectedPlayer(null);
    setShowDeleteZone(false);
  };

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (selectedPlayer) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [selectedPlayer]);

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-primary-dark text-white">
      Error: {error}
    </div>;
  }

  if (isCreatingRoom) {
    return <div className="flex items-center justify-center min-h-screen bg-primary-dark text-white">
      Creating room...
    </div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      {/* Покерный стол */}
      <div 
        ref={tableRef}
        className="relative mx-auto my-8 flex-shrink-0"
        style={{
          width: `${tableSize.width}px`,
          height: `${tableSize.height}px`,
          overflow: 'visible'
        }}
      >
        {/* Овальный стол */}
        <div 
          className="absolute inset-0 rounded-[45%] bg-gradient-to-br from-green-800 to-green-900 border-[8px] border-gray-800 shadow-xl"
          style={{ 
            width: '100%', 
            height: '100%'
          }}
        />
        
        {/* Игроки */}
        {players.map((player, index) => {
          const position = calculatePosition(index, players.length);
          return (
            <div
              key={player.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 
                        ${selectedPlayer?.id === player.id ? 'z-50' : 'z-0'}
                        ${player.isHost ? '' : 'cursor-move'}
                        flex flex-col items-center`}
              style={{
                left: `${position.left}px`,
                top: `${position.top}px`
              }}
              onTouchStart={() => handlePlayerClick(player)}
              onMouseDown={() => handlePlayerClick(player)}
              onTouchEnd={handlePlayerRelease}
              onMouseUp={handlePlayerRelease}
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
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center text-black font-bold text-sm shadow-md">
                    D
                  </div>
                )}
              </div>
              <div className="mt-2 text-center text-sm max-w-[80px] truncate font-medium bg-black/60 px-2 py-0.5 rounded">
                {player.username || player.name}
              </div>
            </div>
          );
        })}
        
        {/* Пустые слоты */}
        {Array.from({ length: 5 - (players.filter(p => !p.isHost).length) }).map((_, index) => {
          const position = calculatePosition(players.length + index, 6);
          return (
            <div
              key={`empty-${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${position.left}px`,
                top: `${position.top}px`,
                display: position.left === 0 && position.top === 0 ? 'none' : 'block'
              }}
            >
              <div className="w-16 h-16 rounded-full border-2 border-white border-dashed opacity-30" />
            </div>
          );
        })}
      </div>

      {/* Секция приглашения игроков */}
      <div className="mt-auto">
        <h2 className="text-center text-xl mb-4 font-bold">Invite Players</h2>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={handleCopyCode}
            className="flex-1 bg-gradient-to-r from-gray-800 to-gray-700 backdrop-blur-md rounded-lg py-3 px-4 text-center relative border border-gray-600"
          >
            Room Code: {roomCode}
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
              📋
            </span>
          </button>
          <button
            onClick={handleTelegramShare}
            className="w-12 h-12 bg-[#0088cc] rounded-lg flex items-center justify-center shadow-md"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.665 3.717L2.93497 10.554C1.72497 11.04 1.73197 11.715 2.71297 12.016L7.26497 13.436L17.797 6.791C18.295 6.488 18.75 6.651 18.376 6.983L9.84297 14.684H9.84097L9.84297 14.685L9.52897 19.377C9.98897 19.377 10.192 19.166 10.45 18.917L12.661 16.767L17.26 20.164C18.108 20.631 18.717 20.391 18.928 19.379L21.947 5.151C22.256 3.912 21.474 3.351 20.665 3.717Z" fill="white"/>
            </svg>
          </button>
        </div>

        <p className="text-center text-sm text-gray-300 mb-4">
          Share the room code or send an invite via Telegram. Start as soon as someone joins!
        </p>

        {/* Навигационные кнопки */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 flex items-center justify-center shadow-lg"
          >
            ←
          </button>
          <button
            onClick={() => navigate('/game')}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 flex items-center justify-center shadow-lg"
          >
            →
          </button>
        </div>
      </div>

      {/* Зона удаления */}
      {showDeleteZone && (
        <div
          id="deleteZone"
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                   w-32 h-32 rounded-full border-4 border-red-500 border-dashed
                   flex items-center justify-center bg-red-500/20 z-40"
        >
          <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      )}

      {/* Уведомление о копировании */}
      {showCopiedToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default AddPlayers; 