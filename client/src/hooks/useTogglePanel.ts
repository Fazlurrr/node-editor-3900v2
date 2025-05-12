import { create } from 'zustand';

interface TogglePanelState {
    isModelingPanelCollapsed: boolean;
    isPropertiesPanelCollapsed: boolean;
    toggleModelingPanel: () => void;
    togglePropertiesPanel: () => void;
}

export const useTogglePanel = create<TogglePanelState>((set) => ({
    isModelingPanelCollapsed: false,
    isPropertiesPanelCollapsed: false,
    toggleModelingPanel: () =>
        set((state) => ({ isModelingPanelCollapsed: !state.isModelingPanelCollapsed })),
    togglePropertiesPanel: () =>
        set((state) => ({ isPropertiesPanelCollapsed: !state.isPropertiesPanelCollapsed })),
}));
