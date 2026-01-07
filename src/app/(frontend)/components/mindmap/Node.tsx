'use client';
import { useState } from 'react';
import { Node as NodeType } from '@/app/types/mindmap';

interface NodeProps {
  node: NodeType;
  position: { x: number; y: number };
  onClick: () => void;
  isExpanded: boolean;
  childrenVisible: string[];
  isSelected: boolean;
  isNeighbor?: boolean;
}

const LEVEL_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
  '#06b6d4', '#84cc16', '#f97316', '#ea47dc'
];

export default function Node({ 
  node, 
  position, 
  onClick, 
  isExpanded, 
  childrenVisible,
  isSelected, 
  isNeighbor = false 
}: NodeProps) {
  
  const [showHover, setShowHover] = useState(false);

  const getTextWidth = (text: string): number => {
    return Math.max(text.length * 8.2 + 48, 140);
  };

  const nodeWidth = getTextWidth(node.label);
  const nodeHeight = 52;
  const radius = 12;

  const glowFilter = isSelected 
    ? 'drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]'
    : isNeighbor 
    ? 'drop-shadow-[0_0_12px_rgba(255,215,0,0.6)] drop-shadow-[0_0_24px_rgba(255,165,0,0.4)]'
    : 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]';

  const strokeColor = isSelected ? "#ffffff" : isNeighbor ? "#FFD700" : "rgba(255,255,255,0.4)";
  const strokeWidth = isSelected ? 5 : isNeighbor ? 4 : 2;

  return (
    <g 
      transform={`translate(${position.x}, ${position.y})`} 
      className={`cursor-pointer group transition-all duration-300 ${(isSelected || isNeighbor) ? 'animate-pulse' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Hover preview */}
      <g 
        onMouseEnter={() => setShowHover(true)}
        onMouseLeave={() => setShowHover(false)}
      >
        {showHover && (
          <g transform="translate(0, -75)">
            <rect x={-110} y={-25} width={220} height={50} rx={10}
              fill="rgb(var(--color-bg-strong))" stroke="rgb(var(--color-border))" strokeWidth={1} className="drop-shadow-xl" />
            <text x={0} y={5} textAnchor="middle" fill="rgb(var(--color-fg))" fontSize="11" fontWeight="500" fontFamily="Inter, sans-serif">
              {node.summary || 'No summary available'}
            </text>
            <path d="M 0 35 L -6 25 L 6 25 Z" fill="rgb(var(--color-bg-strong))" />
          </g>
        )}
      </g>

      {/* Node glow */}
      <ellipse cx={0} cy={0} rx={nodeWidth/2 + 8} ry={nodeHeight/2 + 8}
        fill="url(#nodeGlow)" opacity={isNeighbor ? 0.9 : 0.6}
        className="group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Main node */}
      <rect x={-nodeWidth/2} y={-nodeHeight/2} width={nodeWidth} height={nodeHeight}
        rx={radius} ry={radius}
        fill={isSelected ? LEVEL_COLORS[node.level % LEVEL_COLORS.length] + 'CC' : LEVEL_COLORS[node.level % LEVEL_COLORS.length]}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        className={`${glowFilter} group-hover:drop-shadow-[0_8px_24px_rgba(0,0,0,0.4)] ${isSelected ? 'ring-4 ring-white/50' : isNeighbor ? 'ring-3 ring-yellow-400/50' : ''}`} />
      
      <text x={0} y={4} textAnchor="middle" fill="white" fontWeight="700" fontSize="14"
        fontFamily="Inter, -apple-system, sans-serif" className="select-none drop-shadow-sm">
        {node.label.length > 22 ? `${node.label.substring(0, 22)}...` : node.label}
      </text>      
    </g>
  );
}
