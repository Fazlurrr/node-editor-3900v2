import { EdgeType } from '@/lib/types';
import { Connection, Edge } from 'reactflow';
import { create } from 'zustand';

type ConnectionState = {
  dialogOpen: boolean;
  openDialog: (blockConnection: boolean) => void;
  blockConnection: boolean;
  closeDialog: () => void;
  edgeType: EdgeType | null;
  setEdgeType: (edgeType: EdgeType | null) => void;
  params: Edge | Connection | null;
  setParams: (params: Edge | Connection | null) => void;
};

const useConnection = create<ConnectionState>()(set => ({
  dialogOpen: false,
  blockConnection: false,
  edgeType: null,
  params: null,
  setEdgeType: edgeType => set({ edgeType }),
  setParams: params => set({ params }),
  openDialog: blockConnection =>
    set({
      blockConnection,
      dialogOpen: true,
    }),
  closeDialog: () => set({ dialogOpen: false }),
}));

export default useConnection;
