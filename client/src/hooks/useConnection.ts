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
  draggingRelation: boolean;
  startDraggingRelation: () => void;
  endDraggingRelation: () => void;
};

const useConnection = create<ConnectionState>()(set => ({
  connecting: false,
  blockConnection: false,
  edgeType: null,
  params: null,
  draggingRelation: false,
  setEdgeType: edgeType => set({ edgeType }),
  setParams: params => set({ params }),
  startConnection: blockConnection =>
    set({
      blockConnection,
      connecting: true,
    }),
  endConnection: () => set({ connecting: false }),
  startDraggingRelation: () => set({ draggingRelation: true }),
  endDraggingRelation: () => set({ draggingRelation: false }),
}));

export default useConnection;
