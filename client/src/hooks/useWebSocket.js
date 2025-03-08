import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  
  // Определяем API URL в зависимости от окружения
  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://poker-dealer-api.vercel.app' 
    : 'http://localhost:3001';

  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    // Установка обработчиков событий
    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setError(error);
    });

    return () => newSocket.close();
  }, []);

  // Метод для создания новой комнаты
  const createRoom = async (host, settings = {}) => {
    try {
      const response = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host,
          settings
        }),
      });

      if (!response.ok) {
        console.error('Failed to create room:', response.status, response.statusText);
        throw new Error('Failed to create room');
      }

      const data = await response.json();
      
      // Подключаемся к созданной комнате через сокет
      if (socket && data.roomId) {
        socket.emit('join_room', { roomId: data.roomId, user: host });
      }
      
      return data;
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err.message);
      throw err;
    }
  };

  // Метод для получения информации о комнате по коду
  const getRoom = async (roomCode) => {
    try {
      const response = await fetch(`${API_URL}/api/rooms/${roomCode}`);
      
      if (!response.ok) {
        console.error('Failed to get room:', response.status, response.statusText);
        throw new Error('Room not found');
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error getting room:', err);
      setError(err.message);
      throw err;
    }
  };

  // Метод для присоединения к комнате
  const joinRoom = async (roomCode, userData) => {
    try {
      const response = await fetch(`${API_URL}/api/rooms/${roomCode}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: userData }),
      });
      
      if (!response.ok) {
        console.error('Failed to join room:', response.status, response.statusText);
        throw new Error('Failed to join room');
      }
      
      const data = await response.json();
      
      // Подключаемся к комнате через сокет
      if (socket && data.roomId) {
        socket.emit('join_room', { roomId: data.roomId, user: userData });
      }
      
      return data;
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.message);
      throw err;
    }
  };

  // Метод для обновления роли пользователя в комнате
  const updateUserRole = async (roomCode, role) => {
    try {
      const response = await fetch(`${API_URL}/api/rooms/${roomCode}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });
      
      if (!response.ok) {
        console.error('Failed to update role:', response.status, response.statusText);
        throw new Error(`Failed to update role to ${role}`);
      }
      
      const data = await response.json();
      
      // Уведомляем всех участников комнаты о смене роли
      if (socket && data.success) {
        socket.emit('update_role', { roomId: roomCode, role });
      }
      
      return data;
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err.message);
      throw err;
    }
  };

  // Метод для перемещения игрока (для хоста)
  const movePlayer = async (roomCode, playerId, position) => {
    try {
      const response = await fetch(`${API_URL}/api/rooms/${roomCode}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId, position }),
      });
      
      if (!response.ok) {
        console.error('Failed to move player:', response.status, response.statusText);
        throw new Error('Failed to move player');
      }
      
      const data = await response.json();
      
      // Уведомляем всех участников комнаты о перемещении игрока
      if (socket && data.success) {
        socket.emit('player_moved', { roomId: roomCode, playerId, position });
      }
      
      return data;
    } catch (err) {
      console.error('Error moving player:', err);
      setError(err.message);
      throw err;
    }
  };

  // Метод для удаления игрока из комнаты (для хоста)
  const removePlayer = async (roomCode, playerId) => {
    try {
      const response = await fetch(`${API_URL}/api/rooms/${roomCode}/player/${playerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        console.error('Failed to remove player:', response.status, response.statusText);
        throw new Error('Failed to remove player');
      }
      
      const data = await response.json();
      
      // Уведомляем всех участников комнаты об удалении игрока
      if (socket && data.success) {
        socket.emit('player_removed', { roomId: roomCode, playerId });
      }
      
      return data;
    } catch (err) {
      console.error('Error removing player:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    socket,
    error,
    createRoom,
    getRoom,
    joinRoom,
    updateUserRole,
    movePlayer,
    removePlayer
  };
}; 