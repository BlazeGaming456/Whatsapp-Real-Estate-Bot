import { io } from "socket.io-client";

// Create a singleton socket connection to the backend server
// This establishes a persistent connection for real-time communication
let socket = null;

const createSocket = () => {
  if (!socket) {
    socket = io("http://localhost:3001", {
      autoConnect: false, // Don't connect automatically - we'll control when to connect
      reconnection: true, // Automatically try to reconnect if connection is lost
      reconnectionDelay: 1000, // Wait 1 second before trying to reconnect
      reconnectionAttempts: 5, // Try to reconnect up to 5 times
      timeout: 20000, // Connection timeout after 20 seconds
    });
  }
  return socket;
};

// Export the socket instance so it can be used throughout the app
export default createSocket();
