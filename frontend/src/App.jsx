import './css/App.css'
import Home from "./pages/Home.jsx";
import BoardGame from "./pages/BoardGame.jsx";
import {Routes, Route, BrowserRouter, Router} from "react-router-dom";
import GameLobby from "./pages/GameLobby.jsx";
import { WebSocketProvider } from "./pages/WebSocketContext.jsx";
import {createContext} from "react";

export const AppContext = createContext(null);

function App() {

    // To determine if player is on mobile or not.
    let onMobile = window.innerWidth < 768;

  return (
          <main className="main-content">
              <AppContext.Provider
                  value={{onMobile}}>
                      <WebSocketProvider>
                          <Routes>
                                <Route path="/" element={<Home />}/>
                                <Route path="/board_game" element={<BoardGame />}/>
                                <Route path="/game_lobby" element={<GameLobby />}/>
                          </Routes>
                      </WebSocketProvider>
                  </AppContext.Provider>

          </main>
  )
}


export default App
