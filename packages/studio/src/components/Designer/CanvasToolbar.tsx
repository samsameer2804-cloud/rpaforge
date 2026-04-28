import React, { useCallback, useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiMoreVertical,
  FiGrid,
  FiRotateCcw,
  FiRotateCw,
  FiInfo,
} from 'react-icons/fi';
import { FaMinus, FaLongArrowAltRight } from 'react-icons/fa';
import { useReactFlow } from '@reactflow/core';
import { useProcessStore } from '../../stores/processStore';

export type EdgeTypeOption = 'smoothstep' | 'step' | 'default' | 'bendable' | 'straight';
export type AlignmentType = 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom';
export type DistributionType = 'horizontal' | 'vertical';

interface CanvasToolbarProps {
  snapToGrid: boolean;
  onToggleSnapToGrid: () => void;
  edgeType: EdgeTypeOption;
  onChangeEdgeType: (type: EdgeTypeOption) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const EDGE_TYPE_OPTIONS: { type: EdgeTypeOption; label: string; description: string }[] = [
  { type: 'smoothstep', label: 'Rounded', description: 'Lines with rounded corners' },
  { type: 'step', label: 'Sharp', description: 'Lines with right-angle corners' },
];

const BLOCK_LEGEND = [
  { name: 'Start', description: 'Entry point', color: '#22C55E' },
  { name: 'End', description: 'Exit point', color: '#EF4444' },
  { name: 'If', description: 'Decision', color: '#3B82F6' },
  { name: 'Loop', description: 'Repeat', color: '#8B5CF6' },
  { name: 'Try', description: 'Error handling', color: '#F59E0B' },
  { name: 'Activity', description: 'Action', color: '#6366F1' },
];

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  snapToGrid,
  onToggleSnapToGrid,
  edgeType,
  onChangeEdgeType,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const { getNodes, setNodes } = useReactFlow();
  const { updateNodePosition, pushHistory } = useProcessStore();
  const [showMore, setShowMore] = useState(false);
  const [showEdgeMenu, setShowEdgeMenu] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const edgeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (edgeMenuRef.current && !edgeMenuRef.current.contains(e.target as Node)) {
        setShowEdgeMenu(false);
      }
    };
    if (showEdgeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEdgeMenu]);

  const currentEdgeType = EDGE_TYPE_OPTIONS.find(opt => opt.type === edgeType) || EDGE_TYPE_OPTIONS[0];

  const getSelectedNodes = useCallback(() => {
    return getNodes().filter((node) => node.selected);
  }, [getNodes]);

  const alignNodes = useCallback(
    (type: AlignmentType) => {
      const selectedNodes = getSelectedNodes();
      if (selectedNodes.length < 2) {
        toast.warning('Select at least 2 nodes to align');
        return;
      }

      pushHistory();

      let positions: { id: string; position: { x: number; y: number } }[] = [];

      switch (type) {
        case 'left': {
          const minX = Math.min(...selectedNodes.map((n) => n.position.x));
          positions = selectedNodes.map((n) => ({
            id: n.id,
            position: { ...n.position, x: minX },
          }));
          break;
        }
        case 'right': {
          const maxX = Math.max(
            ...selectedNodes.map((n) => n.position.x + (n.width ?? 0))
          );
          positions = selectedNodes.map((n) => ({
            id: n.id,
            position: { ...n.position, x: maxX - (n.width ?? 0) },
          }));
          break;
        }
        case 'center-h': {
          const centerX =
            selectedNodes.reduce(
              (sum, n) => sum + n.position.x + (n.width ?? 0) / 2,
              0
            ) / selectedNodes.length;
          positions = selectedNodes.map((n) => ({
            id: n.id,
            position: { ...n.position, x: centerX - (n.width ?? 0) / 2 },
          }));
          break;
        }
        case 'top': {
          const minY = Math.min(...selectedNodes.map((n) => n.position.y));
          positions = selectedNodes.map((n) => ({
            id: n.id,
            position: { ...n.position, y: minY },
          }));
          break;
        }
        case 'bottom': {
          const maxY = Math.max(
            ...selectedNodes.map((n) => n.position.y + (n.height ?? 0))
          );
          positions = selectedNodes.map((n) => ({
            id: n.id,
            position: { ...n.position, y: maxY - (n.height ?? 0) },
          }));
          break;
        }
        case 'center-v': {
          const centerY =
            selectedNodes.reduce(
              (sum, n) => sum + n.position.y + (n.height ?? 0) / 2,
              0
            ) / selectedNodes.length;
          positions = selectedNodes.map((n) => ({
            id: n.id,
            position: { ...n.position, y: centerY - (n.height ?? 0) / 2 },
          }));
          break;
        }
      }

      setNodes((nodes) =>
        nodes.map((node) => {
          const newPos = positions.find((p) => p.id === node.id);
          return newPos ? { ...node, position: newPos.position } : node;
        })
      );

      positions.forEach(({ id, position }) => {
        updateNodePosition(id, position);
      });

      toast.success(`Aligned ${selectedNodes.length} nodes`);
    },
    [getSelectedNodes, setNodes, updateNodePosition, pushHistory]
  );

  const distributeNodes = useCallback(
    (type: DistributionType) => {
      const selectedNodes = getSelectedNodes();
      if (selectedNodes.length < 3) {
        toast.warning('Select at least 3 nodes to distribute');
        return;
      }

      pushHistory();

      const sortedNodes = [...selectedNodes].sort((a, b) =>
        type === 'horizontal'
          ? a.position.x - b.position.x
          : a.position.y - b.position.y
      );

      const firstNode = sortedNodes[0];
      const lastNode = sortedNodes[sortedNodes.length - 1];

      const positions: { id: string; position: { x: number; y: number } }[] = [];

      if (type === 'horizontal') {
        const totalWidth = sortedNodes.reduce(
          (sum, n) => sum + (n.width ?? 0),
          0
        );
        const startX = firstNode.position.x;
        const endX = lastNode.position.x + (lastNode.width ?? 0);
        const gap = (endX - startX - totalWidth) / (sortedNodes.length - 1);

        let currentX = startX;
        sortedNodes.forEach((node) => {
          positions.push({
            id: node.id,
            position: { ...node.position, x: currentX },
          });
          currentX += (node.width ?? 0) + gap;
        });
      } else {
        const totalHeight = sortedNodes.reduce(
          (sum, n) => sum + (n.height ?? 0),
          0
        );
        const startY = firstNode.position.y;
        const endY = lastNode.position.y + (lastNode.height ?? 0);
        const gap = (endY - startY - totalHeight) / (sortedNodes.length - 1);

        let currentY = startY;
        sortedNodes.forEach((node) => {
          positions.push({
            id: node.id,
            position: { ...node.position, y: currentY },
          });
          currentY += (node.height ?? 0) + gap;
        });
      }

      setNodes((nodes) =>
        nodes.map((node) => {
          const newPos = positions.find((p) => p.id === node.id);
          return newPos ? { ...node, position: newPos.position } : node;
        })
      );

      positions.forEach(({ id, position }) => {
        updateNodePosition(id, position);
      });

      toast.success(`Distributed ${selectedNodes.length} nodes ${type === 'horizontal' ? 'horizontally' : 'vertically'}`);
    },
    [getSelectedNodes, setNodes, updateNodePosition, pushHistory]
  );

  return (
    <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-white rounded-lg shadow-md border border-slate-200 p-1">
      <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1 mr-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 text-slate-600 hover:text-slate-900"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <FiRotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 text-slate-600 hover:text-slate-900"
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <FiRotateCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1 mr-1">
        <button
          onClick={() => alignNodes('left')}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          title="Align Left"
          aria-label="Align Left"
        >
          <FiAlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => alignNodes('center-h')}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          title="Align Center (Horizontal)"
          aria-label="Align Center (Horizontal)"
        >
          <FiAlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => alignNodes('right')}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          title="Align Right"
          aria-label="Align Right"
        >
          <FiAlignRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => alignNodes('top')}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors rotate-[-90deg]"
          title="Align Top"
          aria-label="Align Top"
        >
          <FiAlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => alignNodes('center-v')}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors rotate-[-90deg]"
          title="Align Center (Vertical)"
          aria-label="Align Center (Vertical)"
        >
          <FiAlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => alignNodes('bottom')}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors rotate-[-90deg]"
          title="Align Bottom"
          aria-label="Align Bottom"
        >
          <FiAlignRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1 mr-1">
        <button
          onClick={() => distributeNodes('horizontal')}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          title="Distribute Horizontally"
          aria-label="Distribute Horizontally"
        >
          <FiAlignJustify className="w-4 h-4" />
        </button>
        <button
          onClick={() => distributeNodes('vertical')}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors rotate-[-90deg]"
          title="Distribute Vertically"
          aria-label="Distribute Vertically"
        >
          <FiAlignJustify className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1 mr-1">
        <button
          onClick={onToggleSnapToGrid}
          className={`p-1.5 rounded transition-colors ${
            snapToGrid
              ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
          title={snapToGrid ? 'Disable Grid Snapping' : 'Enable Grid Snapping'}
          aria-label={snapToGrid ? 'Disable Grid Snapping' : 'Enable Grid Snapping'}
        >
          <FiGrid className="w-4 h-4" />
        </button>

        <div className="relative" ref={edgeMenuRef}>
          <button
            onClick={() => setShowEdgeMenu(!showEdgeMenu)}
            className="p-1.5 rounded transition-colors flex items-center gap-1 bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
            title="Line style"
            aria-label="Line style"
          >
            {edgeType === 'step' ? <FaMinus className="w-4 h-4" /> : <FaLongArrowAltRight className="w-4 h-4" />}
            <span className="text-xs font-medium hidden lg:inline">{currentEdgeType.label}</span>
          </button>

          {showEdgeMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[180px] z-50">
              {EDGE_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  onClick={() => {
                    onChangeEdgeType(option.type);
                    setShowEdgeMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 ${
                    edgeType === option.type ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                  }`}
                >
                  <span className={`w-2 h-0.5 rounded ${
                    option.type === 'step' ? 'bg-slate-600' : 'bg-indigo-500'
                  }`} />
                  <div>
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs text-slate-500">{option.description}</div>
                  </div>
                  {edgeType === option.type && (
                    <span className="ml-auto text-indigo-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          title="Block Legend"
          aria-label="Block Legend"
        >
          <FiInfo className="w-4 h-4" />
        </button>
        {showLegend && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 z-50">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
              Block Types
            </div>
            <div className="space-y-1.5">
              {BLOCK_LEGEND.map((block) => (
                <div key={block.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: block.color }}
                  />
                  <span className="font-medium">{block.name}</span>
                  <span className="text-slate-500">— {block.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMore(!showMore)}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          title="More Options"
          aria-label="More Options"
        >
          <FiMoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CanvasToolbar;
