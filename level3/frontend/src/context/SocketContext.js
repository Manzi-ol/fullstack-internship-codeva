import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Connect to socket server
    const socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Join user's room
      if (user && user._id) {
        socket.emit('join', { userId: user._id });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for real-time product events
    socket.on('product_created', (data) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'product_created',
        message: `New product added: ${data.product?.name || 'Unknown'}`,
        data: data.product,
        read: false,
        timestamp: new Date(),
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
    });

    socket.on('product_updated', (data) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'product_updated',
        message: `Product updated: ${data.product?.name || 'Unknown'}`,
        data: data.product,
        read: false,
        timestamp: new Date(),
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
    });

    socket.on('product_deleted', (data) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'product_deleted',
        message: `Product deleted: ${data.product?.name || data.productId || 'Unknown'}`,
        data: data,
        read: false,
        timestamp: new Date(),
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, token, user]);

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount: notifications.filter((n) => !n.read).length,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;
