import React, { useState, useEffect } from 'react';
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

  const calculatePosition = (index, totalPlayers) => {
    // Новая расстановка: 3 вверху, 2 по бокам, хост внизу посередине
    const containerWidth = 300; // ширина контейнера
    const containerHeight = 300; // высота контейнера
    const topY = 40; // верхний отступ для верхних позиций
    const middleY = containerHeight / 2; // средняя линия по высоте
    const bottomY = containerHeight - 50; // нижняя позиция для хоста
    
    // Положение игроков в верхнем ряду (3 игрока)
    const topPositions = [
      { left: containerWidth * 0.25, top: topY }, // левый верхний
      { left: containerWidth * 0.5, top: topY }, // центральный верхний
      { left: containerWidth * 0.75, top: topY } // правый верхний
    ];
    
    // Положение игроков по бокам в среднем ряду (2 игрока)
    const middlePositions = [
      { left: 30, top: middleY }, // левый средний
      { left: containerWidth - 30, top: middleY } // правый средний
    ];
    
    // Положение хоста (внизу посередине)
    const hostPosition = { left: containerWidth / 2, top: bottomY };

    // Проверяем, является ли игрок хостом
    if (players[index]?.isHost) {
      return hostPosition;
    }

    // Распределяем места для обычных игроков
    const nonHostPlayers = players.filter(p => !p.isHost);
    const nonHostIndex = nonHostPlayers.findIndex(p => p.id === players[index]?.id);
    
    if (nonHostIndex < 0) {
      // Для пустых слотов
      const emptySlotIndex = index - players.filter(p => !p.isHost).length;
      
      // Распределяем пустые слоты в оставшиеся позиции
      const allPositions = [...topPositions, ...middlePositions];
      const remainingPositions = allPositions.filter((_, i) => {
        return !nonHostPlayers.some((_, playerIndex) => playerIndex === i);
      });
      
      if (emptySlotIndex < remainingPositions.length) {
        return remainingPositions[emptySlotIndex];
      }
      
      // Если больше позиций нет, возвращаем последнюю
      return remainingPositions[remainingPositions.length - 1] || hostPosition;
    }
    
    // Для реальных игроков (не хостов)
    const allPositions = [...topPositions, ...middlePositions];
    if (nonHostIndex < allPositions.length) {
      return allPositions[nonHostIndex];
    }
    
    // Если больше позиций нет, возвращаем последнюю
    return allPositions[allPositions.length - 1] || hostPosition;
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
    <div className="flex flex-col min-h-screen bg-primary-dark text-white p-4">
      {/* Круг с игроками */}
      <div className="relative w-[300px] h-[300px] mx-auto my-8">
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 
                      ${selectedPlayer?.id === player.id ? 'z-50' : 'z-0'}
                      ${player.isHost ? '' : 'cursor-move'}
                      flex flex-col items-center`}
            style={calculatePosition(index, players.length)}
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
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-primary-dark font-bold text-xs">
                  D
                </div>
              )}
            </div>
            <div className="mt-1 text-center text-xs max-w-[80px] truncate">
              {player.username || player.name}
            </div>
          </div>
        ))}
        
        {/* Пустые слоты */}
        {Array.from({ length: 5 - (players.length - 1) }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={calculatePosition(players.length + index, 6)}
          >
            <div className="w-16 h-16 rounded-full border-2 border-white border-dashed opacity-50" />
          </div>
        ))}
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

      {/* Секция приглашения игроков */}
      <div className="mt-auto">
        <h2 className="text-center text-xl mb-4">Invite Players</h2>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={handleCopyCode}
            className="flex-1 bg-white/10 backdrop-blur-md rounded-lg py-3 px-4 text-center relative"
          >
            Room Code: {roomCode}
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
              📋
            </span>
          </button>
          <button
            onClick={handleTelegramShare}
            className="w-12 h-12 bg-[#0088cc] rounded-lg flex items-center justify-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.665 3.717L2.93497 10.554C1.72497 11.04 1.73197 11.715 2.71297 12.016L7.26497 13.436L17.797 6.791C18.295 6.488 18.75 6.651 18.376 6.983L9.84297 14.684H9.84097L9.84297 14.685L9.52897 19.377C9.98897 19.377 10.192 19.166 10.45 18.917L12.661 16.767L17.26 20.164C18.108 20.631 18.717 20.391 18.928 19.379L21.947 5.151C22.256 3.912 21.474 3.351 20.665 3.717Z" fill="white"/>
            </svg>
          </button>
        </div>

        <p className="text-center text-sm text-white/60 mb-4">
          Share the room code or send an invite via Telegram. Start as soon as someone joins!
        </p>

        {/* Навигационные кнопки */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
          >
            ←
          </button>
          <button
            onClick={() => navigate('/game')}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
          >
            →
          </button>
        </div>
      </div>

      {/* Уведомление о копировании */}
      {showCopiedToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white text-primary-dark px-4 py-2 rounded-lg shadow-lg">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default AddPlayers; 