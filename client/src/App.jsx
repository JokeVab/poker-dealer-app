import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import FirstScreen from './components/FirstScreen';
import CreateRoom from './components/CreateRoom';
import GameSetup from './components/GameSetup';

function App() {
  // Инициализация Telegram WebApp
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      // Сообщаем Telegram что приложение готово
      tg.ready();
      
      // Настраиваем основной цвет темы
      tg.setHeaderColor('#1F2937');
      
      // Отображаем кнопку "назад" в хедере Telegram
      tg.BackButton.show();
      
      // Обрабатываем клик по кнопке "назад"
      tg.BackButton.onClick(() => {
        if (window.history.length > 1) {
          window.history.back();
        }
      });
      
      // Очистка при размонтировании компонента
      return () => {
        tg.BackButton.offClick();
      };
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<FirstScreen />} />
        <Route path="/game-setup" element={<GameSetup />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/join-game" element={<div>Join Game Component (coming soon)</div>} />
      </Routes>
    </Router>
  );
}

export default App;