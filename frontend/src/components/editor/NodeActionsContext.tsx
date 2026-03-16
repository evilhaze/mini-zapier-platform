import { createContext, useContext } from 'react';

type NodeActionsContextValue = {
  openSettings: (nodeId: string) => void;
  renameNode: (nodeId: string, newName: string) => void;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
};

export const NodeActionsContext = createContext<NodeActionsContextValue | null>(null);

export function useNodeActions() {
  const ctx = useContext(NodeActionsContext);
  if (!ctx) {
    throw new Error('useNodeActions must be used within NodeActionsContext.Provider');
  }
  return ctx;
}

