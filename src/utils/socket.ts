import { io, Socket } from 'socket.io-client';
import { API_URL, API_WITH_CREDENTIALS } from '../services/apiConfig';

const SOCKET_URL = API_URL;

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket) { if (!this.socket.connected) this.socket.connect(); return; }

    this.socket = io(SOCKET_URL, {
      withCredentials: API_WITH_CREDENTIALS,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  isConnected() { return this.socket?.connected ?? false; }

  reconnect() {
    if (this.socket) this.socket.disconnect().connect();
    else this.connect();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    if (callback) this.socket?.off(event, callback);
    else this.socket?.off(event);
  }

  emit(event: string, data: any) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit(event, data);
  }
}

export const socketService = new SocketService();
