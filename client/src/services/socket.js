import { io } from 'socket.io-client';

// Для GitHub Pages используем полный URL или относительный
const getSocketUrl = () => {
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://your-backend-url.vercel.app';
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

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

