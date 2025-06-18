import {createContext, useState, useContext, useEffect} from "react";


const PlayersContext = createContext();

export const usePlayerContext = () => useContext(PlayersContext);

export const PlayersProvider = () => {};