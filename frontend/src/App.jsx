// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './css/App.css'
import Home from "./pages/Home.jsx";
import BoardGame from "./pages/BoardGame.jsx";
import {Routes, Route} from "react-router-dom";
import GameLobby from "./pages/GameLobby.jsx";

function App() {
  // const [count, setCount] = useState(0)

    const cardNumber = 2;

  return (
      <main className="main-content">
          <Routes>
                <Route path="/" element={<Home />}/>
                <Route path="/board_game" element={<BoardGame />}/>
                <Route path="/game_lobby" element={<GameLobby />}/>
          </Routes>
      </main>
  )
}


export default App
