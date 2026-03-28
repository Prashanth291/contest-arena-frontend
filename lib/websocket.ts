// ═══════════════════════════════════════════════════════
// WebSocket Client — STOMP over SockJS
// ═══════════════════════════════════════════════════════

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { LeaderboardUpdate } from './types';

const WS_URL = 'http://localhost:8085/ws';

type UpdateCallback = (update: LeaderboardUpdate) => void;

let stompClient: Client | null = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT = 5;

export function connectWebSocket(
  contestId: string,
  onUpdate: UpdateCallback,
  onConnect?: () => void,
  onDisconnect?: () => void,
): () => void {
  // Cleanup previous connection
  if (stompClient) {
    stompClient.deactivate();
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,

    onConnect: () => {
      isConnected = true;
      reconnectAttempts = 0;
      console.log('[WS] Connected to leaderboard');

      stompClient?.subscribe(
        `/topic/leaderboard/${contestId}`,
        (message) => {
          try {
            const update: LeaderboardUpdate = JSON.parse(message.body);
            onUpdate(update);
          } catch (e) {
            console.error('[WS] Failed to parse update:', e);
          }
        },
      );

      onConnect?.();
    },

    onDisconnect: () => {
      isConnected = false;
      console.log('[WS] Disconnected');
      onDisconnect?.();
    },

    onStompError: (frame) => {
      console.error('[WS] STOMP error:', frame.headers['message']);
      reconnectAttempts++;
      if (reconnectAttempts >= MAX_RECONNECT) {
        console.error('[WS] Max reconnection attempts reached');
        stompClient?.deactivate();
      }
    },
  });

  stompClient.activate();

  // Return cleanup function
  return () => {
    stompClient?.deactivate();
    stompClient = null;
    isConnected = false;
  };
}

export function isWebSocketConnected(): boolean {
  return isConnected;
}
