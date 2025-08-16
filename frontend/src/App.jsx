import './css/App.css'
import Home from "./pages/Home.jsx";
import BoardGame from "./pages/BoardGame.jsx";
import {Routes, Route, BrowserRouter, Router} from "react-router-dom";
import GameLobby from "./pages/GameLobby.jsx";
import { WebSocketProvider } from "./pages/WebSocketContext.jsx";

function App() {

  return (
          <main className="main-content">
                  <WebSocketProvider>
                      <Routes>
                            <Route path="/" element={<Home />}/>
                            <Route path="/board_game" element={<BoardGame />}/>
                            <Route path="/game_lobby" element={<GameLobby />}/>
                      </Routes>
                  </WebSocketProvider>

          </main>
  )
}


export default App
