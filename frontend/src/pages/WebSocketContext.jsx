import React from 'react';

const WebSocketContext = React.createContext(null);

export class WebSocketProvider extends React.Component {
  constructor(props) {
    super(props);
    this.sockets = new Map(); // key: id, value: WebSocket
  }

  connect = (url, id) => {
    if (!this.sockets.has(id) || this.sockets.get(id).readyState === WebSocket.CLOSED) {
      const socket = new WebSocket(url);

      // Remove socket from the map when it closes
      socket.onclose = () => {
        console.log(`Socket with id ${id} closed`);
        this.sockets.delete(id);
      };

      this.sockets.set(id, socket);
    }

    return this.sockets.get(id);
  };

  getSocket = (id) => this.sockets.get(id) || null;

  render() {
    return (
      <WebSocketContext.Provider
        value={{
          connect: this.connect,
          getSocket: this.getSocket,
        }}
      >
        {this.props.children}
      </WebSocketContext.Provider>
    );
  }
}

export const WebSocketConsumer = WebSocketContext.Consumer;
export const WebSocketContextObj = WebSocketContext; // for contextType