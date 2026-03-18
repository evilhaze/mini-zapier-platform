'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Handle, type NodeProps, type Node, Position } from '@xyflow/react';
import { Globe, Mail, Send, Database, Code, MoreHorizontal } from 'lucide-react';
import type { FlowNodeData } from '../utils';
import { NODE_LABELS, ACTION_DESCRIPTIONS } from '../types';
import { useNodeActions } from '../NodeActionsContext';

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  http: Globe,
  email: Mail,
  telegram: Send,
  db: Database,
  transform: Code,
};

function ActionNode({ id, data, selected }: NodeProps<Node<FlowNodeData>>) {
  const { openSettings, renameNode, duplicateNode, deleteNode } = useNodeActions();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const Icon = icons[data.type] ?? Code;
  const subtype = NODE_LABELS[data.type] || data.type;
  const title = data.name || data.label || subtype;
  const description = ACTION_DESCRIPTIONS[data.type] ?? 'Process data in the workflow';

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleDocumentMouseDown = (event: MouseEvent) => {
      const target = event.target as globalThis.Node | null;
      if (target && (triggerRef.current?.contains(target) || menuRef.current?.contains(target))) {
        return;
      }
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      if (prev) {
        return false;
      }
      if (!triggerRef.current) {
        return true;
      }
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 176; // ~w-44
      const menuHeight = 168; // 4 items
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = rect.right - menuWidth;
      if (left < 8) left = 8;
      if (left + menuWidth > viewportWidth - 8) {
        left = viewportWidth - menuWidth - 8;
      }

      let top = rect.bottom + 4;
      if (top + menuHeight > viewportHeight - 8) {
        top = rect.top - menuHeight - 4;
      }

      setMenuPosition({ top, left });
      return true;
    });
  };

  const startRename = () => {
    setMenuOpen(false);
    setTempName(title);
    setIsRenaming(true);
  };

  const commitRename = () => {
    const trimmed = tempName.trim();
    if (trimmed && trimmed !== title) {
      renameNode(id, trimmed);
    }
    setIsRenaming(false);
  };

  const cancelRename = () => {
    setIsRenaming(false);
  };

  const handleSettings = () => {
    setMenuOpen(false);
    openSettings(id);
  };

  const handleDuplicate = () => {
    setMenuOpen(false);
    duplicateNode(id);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    deleteNode(id);
  };

  return (
    <div
      className={`
        relative min-w-[200px] max-w-[220px] overflow-hidden rounded-card bg-white text-left shadow-soft
        ring-1 ring-slate-200/80 transition dark:bg-slate-900 dark:ring-slate-800/80 dark:text-slate-100
        ${selected
          ? 'ring-2 ring-[#F87171] shadow-card-hover -translate-y-[1px]'
          : 'hover:ring-[#FECACA] hover:-translate-y-[1px]'}
      `}
    >
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!left-1/2 !-top-1.5 !h-3 !w-3 !-translate-x-1/2 !border-2 !border-white !bg-[#EF4444] !shadow"
      />

      {/* Left accent bar — action = soft red */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FCA5A5] to-[#EF4444]" />

      <div className="pl-4 pr-3 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#EF4444]">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Action · {subtype}
            </p>
            {isRenaming ? (
              <div className="mt-0.5">
                <input
                  ref={renameInputRef}
                  type="text"
                  className="w-full rounded-input border border-slate-300 bg-white px-1.5 py-0.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#FCA5A5] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitRename();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelRename();
                    }
                  }}
                />
              </div>
            ) : (
              <>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-300">{description}</p>
              </>
            )}
          </div>
          <button
            ref={triggerRef}
            type="button"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-[#FEF2F2] hover:text-[#EF4444] dark:text-slate-300 dark:hover:bg-[#0f172a] dark:hover:text-[#F87171]"
            title="Node actions"
            aria-label="Node actions"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleMenu();
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {menuOpen && !isRenaming && menuPosition && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[1000] w-44 rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-800 dark:bg-slate-950"
              style={{ top: menuPosition.top, left: menuPosition.left }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                onClick={handleSettings}
              >
                <span>Settings</span>
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                onClick={startRename}
              >
                <span>Rename</span>
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                onClick={handleDuplicate}
              >
                <span>Duplicate</span>
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/20"
                onClick={handleDelete}
              >
                <span>Delete</span>
              </button>
            </div>,
            document.body
          )
        : null}

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!left-1/2 !-bottom-1.5 !h-3 !w-3 !-translate-x-1/2 !border-2 !border-white !bg-[#EF4444] !shadow"
      />
    </div>
  );
}

export default memo(ActionNode);
