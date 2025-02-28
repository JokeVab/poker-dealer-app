import { useEffect, useState } from 'react';

export const useTelegram = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      const initData = tg.initDataUnsafe?.user;
      if (initData) {
        setUser({
          username: initData.username,
          first_name: initData.first_name,
          last_name: initData.last_name,
          photo_url: initData.photo_url,
          id: initData.id
        });
      }
    }
  }, []);

  return { user };
}; 