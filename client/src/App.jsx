import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import FirstScreen from './components/FirstScreen';
import CreateRoom from './components/CreateRoom';
import GameSetup from './components/GameSetup';
import AddPlayers from './components/AddPlayers';
import JoinRoom from './components/JoinRoom';
import RoleSelection from './components/RoleSelection';
import PokerRoom from './components/PokerRoom';

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
        <Route path="/add-players" element={<AddPlayers />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/join-room" element={<JoinRoom />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/poker-room" element={<PokerRoom />} />
        <Route path="/room" element={<PokerRoom />} />
      </Routes>
    </Router>
  );
}

export default App;