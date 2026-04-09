'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// Socket.io connects to the server root, not the /api path
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:8080');

let socket: Socket | null = null;

export function useAnnouncementSocket(
  onNewAnnouncement: (announcement: any) => void
): void {
  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        withCredentials: true,
        reconnection: true,
      });
    }
    socket.on('new_announcement', onNewAnnouncement);
    return () => {
      socket?.off('new_announcement', onNewAnnouncement);
    };
  }, [onNewAnnouncement]);
}
