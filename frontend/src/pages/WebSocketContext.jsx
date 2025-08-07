import React from 'react';

const WebSocketContext = React.createContext(null);

export class WebSocketProvider extends React.Component {
  constructor(props) {
    super(props);
    this.socket = null;
  }

  connect = (url) => {
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.socket = new WebSocket(url);
    }
    return this.socket;
  };

  getSocket = () => this.socket;

  render() {
    return (
      <WebSocketContext.Provider value={{
        connect: this.connect,
        getSocket: this.getSocket,
      }}>
        {this.props.children}
      </WebSocketContext.Provider>
    );
  }
}

export const WebSocketConsumer = WebSocketContext.Consumer;
export const WebSocketContextObj = WebSocketContext; // for contextType