import AudioControls from './components/AudioControls';
import Authentication from "./pages/Auth.jsx";
import PokemonGame from "./pages/PokemonGame.jsx";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <AudioControls className="audio-controls" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Authentication />} />
          <Route path="/authentication" element={<Authentication />} />
          <Route path="/home" element={<PokemonGame />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;