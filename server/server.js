const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createRoomInFirebase } = require('../client/src/firebase/firebase');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create_room', async (data) => {
    try {
      const roomId = generateRoomId();
      
      // Создаем комнату
      const room = {
        id: roomId,
        host: {
          id: socket.id,
          nickname: data.host.nickname,
          avatar: data.host.avatar
        },
        players: [],
        created_at: new Date(),
        status: 'waiting',
        max_players: 6
      };

      // Сохраняем комнату в Firebase
      await createRoomInFirebase(room);
      
      socket.join(roomId);
      
      // Отправляем только подтверждение создания комнаты
      socket.emit('room_created', {
        roomId,
        room
      });

    } catch (error) {
      socket.emit('error', { 
        message: 'Ошибка при создании комнаты',
        details: error.message 
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});