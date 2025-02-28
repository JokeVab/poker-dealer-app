import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FirstScreen from './components/FirstScreen';
import CreateRoom from './components/CreateRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FirstScreen />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/join-game" element={<div>Join Game Component (coming soon)</div>} />
      </Routes>
    </Router>
  );
}

export default App;