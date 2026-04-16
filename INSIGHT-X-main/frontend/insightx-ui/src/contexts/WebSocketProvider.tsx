import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createSSE } from '@/api/client';
import { env } from '@/config/env';
import { useAuth } from '../hooks/useAuth';

type RealtimeEventHandler = (payload: any) => void;

interface RealtimeSocket {
    on: (event: string, handler: RealtimeEventHandler) => void;
    off: (event: string, handler: RealtimeEventHandler) => void;
}

interface WebSocketContextType {
    socket: RealtimeSocket | null;
    isConnected: boolean;
    lastMessage: unknown;
}

const WebSocketContext = createContext<WebSocketContextType>({
    socket: null,
    isConnected: false,
    lastMessage: null,
});

export function useWebSocket() {
    return useContext(WebSocketContext);
}

interface WebSocketProviderProps {
    children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
    const { isAuthenticated } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<unknown>(null);
    const listenersRef = useRef<Map<string, Set<RealtimeEventHandler>>>(new Map());

    const socket = useMemo<RealtimeSocket>(() => ({
        on: (event: string, handler: RealtimeEventHandler) => {
            const handlers = listenersRef.current.get(event) ?? new Set<RealtimeEventHandler>();
            handlers.add(handler);
            listenersRef.current.set(event, handlers);
        },
        off: (event: string, handler: RealtimeEventHandler) => {
            const handlers = listenersRef.current.get(event);
            if (!handlers) return;
            handlers.delete(handler);
            if (handlers.size === 0) {
                listenersRef.current.delete(event);
            }
        },
    }), []);

    useEffect(() => {
        if (!isAuthenticated || !env.enableRealtime) {
            setIsConnected(false);
            return;
        }

        const eventSource = createSSE('/stream/trust-decisions');

        const emitEvent = (event: string, payload: unknown) => {
            const handlers = listenersRef.current.get(event);
            if (!handlers) return;
            handlers.forEach((handler) => {
                try {
                    handler(payload);
                } catch (error) {
                    console.error(`[Realtime] listener failed for event "${event}"`, error);
                }
            });
        };

        const handleData = (event: MessageEvent) => {
            try {
                const payload = JSON.parse(event.data);
                setLastMessage(payload);
                emitEvent('trust-decision', payload);
                emitEvent('message', payload);
            } catch (error) {
                console.error('[Realtime] invalid SSE payload', error);
            }
        };

        eventSource.onopen = () => {
            setIsConnected(true);
        };
        eventSource.onerror = () => {
            // EventSource will reconnect automatically; keep state accurate without noisy retries.
            setIsConnected(false);
        };
        eventSource.onmessage = handleData;
        eventSource.addEventListener('trust-decision', handleData as EventListener);

        return () => {
            eventSource.removeEventListener('trust-decision', handleData as EventListener);
            eventSource.close();
            setIsConnected(false);
        };
    }, [isAuthenticated]);

    return (
        <WebSocketContext.Provider value={{ socket, isConnected, lastMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
}
