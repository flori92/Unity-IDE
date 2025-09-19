import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Connection {
  id: string;
  name: string;
  type: 'docker' | 'kubernetes' | 'ansible';
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  config: Record<string, any>;
  lastConnected?: Date;
  error?: string;
}

interface ConnectionState {
  connections: Connection[];
  activeConnection: Connection | null;
  addConnection: (connection: Connection) => void;
  removeConnection: (id: string) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  setActiveConnection: (id: string) => void;
  getConnectionByType: (type: Connection['type']) => Connection | undefined;
  initializeConnections: () => Promise<void>;
  connectToService: (type: Connection['type'], config: Record<string, any>) => Promise<void>;
  disconnectFromService: (id: string) => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      connections: [],
      activeConnection: null,

      addConnection: (connection) =>
        set((state) => ({
          connections: [...state.connections, connection],
        })),

      removeConnection: (id) =>
        set((state) => ({
          connections: state.connections.filter((c) => c.id !== id),
          activeConnection:
            state.activeConnection?.id === id ? null : state.activeConnection,
        })),

      updateConnection: (id, updates) =>
        set((state) => ({
          connections: state.connections.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
          activeConnection:
            state.activeConnection?.id === id
              ? { ...state.activeConnection, ...updates }
              : state.activeConnection,
        })),

      setActiveConnection: (id) =>
        set((state) => ({
          activeConnection: state.connections.find((c) => c.id === id) || null,
        })),

      getConnectionByType: (type) => {
        const state = get();
        return state.connections.find((c) => c.type === type);
      },

      initializeConnections: async () => {
        // Initialize default connections
        const defaultConnections: Connection[] = [
          {
            id: 'docker-default',
            name: 'docker',
            type: 'docker',
            status: 'disconnected',
            config: {
              socket: '/var/run/docker.sock',
            },
          },
          {
            id: 'k8s-default',
            name: 'kubernetes',
            type: 'kubernetes',
            status: 'disconnected',
            config: {
              configPath: '~/.kube/config',
            },
          },
          {
            id: 'ansible-default',
            name: 'ansible',
            type: 'ansible',
            status: 'disconnected',
            config: {
              inventory: './inventory',
            },
          },
        ];

        set({ connections: defaultConnections });

        // Try to auto-connect to services
        for (const conn of defaultConnections) {
          try {
            await get().connectToService(conn.type, conn.config);
          } catch (error) {
            console.error(`Failed to connect to ${conn.type}:`, error);
          }
        }
      },

      connectToService: async (type, config) => {
        const connection = get().getConnectionByType(type);
        if (!connection) return;

        // Update status to connecting
        get().updateConnection(connection.id, { status: 'connecting' });

        try {
          // Simulate connection logic (replace with actual API calls)
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // Update status to connected
          get().updateConnection(connection.id, {
            status: 'connected',
            lastConnected: new Date(),
            config,
          });
        } catch (error) {
          // Update status to error
          get().updateConnection(connection.id, {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          throw error;
        }
      },

      disconnectFromService: async (id) => {
        const connection = get().connections.find((c) => c.id === id);
        if (!connection) return;

        try {
          // Simulate disconnection logic
          await new Promise((resolve) => setTimeout(resolve, 500));
          
          // Update status to disconnected
          get().updateConnection(id, {
            status: 'disconnected',
            error: undefined,
          });
        } catch (error) {
          console.error(`Failed to disconnect from ${connection.type}:`, error);
          throw error;
        }
      },
    }),
    {
      name: 'connection-storage',
      partialize: (state) => ({
        connections: state.connections.map((c) => ({
          ...c,
          status: 'disconnected' as const, // Reset status on load
        })),
      }),
    }
  )
);
