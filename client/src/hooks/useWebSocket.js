import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useWebSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return { socket };
}; 