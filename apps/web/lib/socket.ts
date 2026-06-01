'use client';

import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useScanFeedStore, type LiveScanEvent } from '@/stores/scan-feed-store';

let socket: Socket | null = null;

export function getSocket() {
  socket ??= io({
    path: '/socket.io',
    withCredentials: true,
    autoConnect: false,
  });
  return socket;
}

export function useScanFeed() {
  const pushEvent = useScanFeedStore((state) => state.pushEvent);
  const events = useScanFeedStore((state) => state.events);

  useEffect(() => {
    const activeSocket = getSocket();
    if (!activeSocket.connected) activeSocket.connect();
    activeSocket.emit('join:monitoring');

    const onScan = (event: LiveScanEvent) => pushEvent(event);
    activeSocket.on('scan:live', onScan);

    return () => {
      activeSocket.off('scan:live', onScan);
    };
  }, [pushEvent]);

  return events;
}
