import { EdgeType } from '@/lib/types';
import { Connection, Edge } from 'reactflow';
import { create } from 'zustand';

type ConnectionState = {
  connecting: boolean;
  startConnection: (blockConnection: boolean) => void;
  blockConnection: boolean;
  endConnection: () => void;
  edgeType: EdgeType | null;
  setEdgeType: (edgeType: EdgeType | null) => void;
  params: Edge | Connection | null;
  setParams: (params: Edge | Connection | null) => void;
};

const useConnection = create<ConnectionState>()(set => ({
  connecting: false,
  blockConnection: false,
  edgeType: null,
  params: null,
  setEdgeType: edgeType => set({ edgeType }),
  setParams: params => set({ params }),
  startConnection: blockConnection =>
    set({
      blockConnection,
      connecting: true,
    }),
  endConnection: () => set({ connecting: false }),
}));

export default useConnection;
