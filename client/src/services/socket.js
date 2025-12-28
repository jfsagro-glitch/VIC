import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
      });
    }
    return this.socket;
  }

  subscribeToProject(projectId, callback) {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket.emit('subscribe-project', projectId);
    this.socket.on('progress', callback);
    
    return () => {
      this.socket.off('progress', callback);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();

