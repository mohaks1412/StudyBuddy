'use client';
import { useMemo, useCallback, useEffect } from 'react';
import { useUi, useCanvasDrag } from "../../providers/UiProvider"
import { useMindMap } from '../../providers/MindMapProvider';
import Node from './Node';
import { Link as LinkType, Node as NodeType } from '@/app/types/mindmap';


export default function Canvas() {
  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onWheel } = useCanvasDrag();
  const { zoom, panX, panY } = useUi();

  const {
    nodes, links, selectNode, toggleExpand, expandedNodes,
    selectedNodeId, tempNodeData, updateTempData, confirmInlineEdit,
    cancelInlineEdit, editMode, svgRef, updateNode, setEditMode
  } = useMindMap();

  const canvasWidth = 7000;
  const canvasHeight = 7000;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const padding = 400;
  const nodeSize = 80;

  useEffect(() => {
  const el = svgRef.current;
  if (!el) return;

  const preventScroll = (e: Event) => {
    e.preventDefault();
  };

  el.addEventListener('wheel', preventScroll, { passive: false });
  el.addEventListener('touchmove', preventScroll, { passive: false });

  return () => {
    el.removeEventListener('wheel', preventScroll);
    el.removeEventListener('touchmove', preventScroll);
  };
}, [svgRef]);

  const layout = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const visibleNodeIds: string[] = [];
    const visibleLinks: LinkType[] = [];
    const neighborNodes: string[] = [];
    const neighborLinks: string[] = [];
    const nodeDepth: Record<string, number> = {};

    const rootNodeId = nodes.find((node) => !links.some((l) => l.target === node.id))?.id || nodes[0]?.id;
    

    function buildVisible(nodeId: string, depth = 0): void {
      if (!nodeId || depth > 15) return;
      visibleNodeIds.push(nodeId);
      nodeDepth[nodeId] = depth;
      
      const node = nodes.find((n) => n.id === nodeId);
      if (!node || !expandedNodes.includes(nodeId)) return;

      const childLinks = links.filter((link) => link.source === nodeId);
      childLinks.forEach((link) => {
        visibleLinks.push(link);
        buildVisible(link.target, depth + 1);
      });
    }

    buildVisible(rootNodeId);

    positions[rootNodeId] = { x: centerX, y: centerY };
    
    const rootChildren = nodes.find(n => n.id === rootNodeId)?.children.filter(id => visibleNodeIds.includes(id)) || [];
    const rootAngleStep = (Math.PI * 2) / Math.max(rootChildren.length, 3);
    
    rootChildren.forEach((childId, i) => {
      const angle = i * rootAngleStep;
      positions[childId] = {
        x: centerX + Math.cos(angle) * 400,
        y: centerY + Math.sin(angle) * 400,
      };
    });

    function layoutOutward(parentId: string) {
      const parentPos = positions[parentId];
      if (!parentPos) return;

      const children = nodes.find(n => n.id === parentId)?.children.filter(id => visibleNodeIds.includes(id)) || [];
      if (children.length === 0) return;

      const parentAngleFromCenter = Math.atan2(parentPos.y - centerY, parentPos.x - centerX);
      const outwardAngle = parentAngleFromCenter + Math.PI / 2;
      const depthBonus = nodeDepth[parentId]! * 40;
      const linkLength = 380 + depthBonus;
      
      const spreadAngle = Math.min(Math.PI * 0.9, 0.4 + nodeDepth[parentId]! * 0.05);
      const angleStep = spreadAngle / Math.max(children.length - 1, 1);
      
      children.forEach((childId, i) => {
        const offset = (i - (children.length - 1) / 2) * angleStep;
        const childAngle = outwardAngle + offset;
        
        positions[childId] = {
          x: parentPos.x + Math.cos(childAngle) * linkLength,
          y: parentPos.y + Math.sin(childAngle) * linkLength,
        };

        layoutOutward(childId);
      });
    }

    rootChildren.forEach(childId => layoutOutward(childId));

    function enforceOutwardFlow(iterations = 15) {
      for (let iter = 0; iter < iterations; iter++) {
        let totalMovement = 0;
        
        visibleNodeIds.forEach(nodeId => {
          if (nodeId === rootNodeId) return;
          const nodePos = positions[nodeId];
          
          const dx = nodePos.x - centerX;
          const dy = nodePos.y - centerY;
          const distanceFromCenter = Math.hypot(dx, dy);
          
          const targetDistance = 450 + (nodeDepth[nodeId]! * 80);
          if (distanceFromCenter < targetDistance * 0.85) {
            const angle = Math.atan2(dy, dx);
            const pushDist = (targetDistance - distanceFromCenter) * 0.4;
            nodePos.x += Math.cos(angle) * pushDist;
            nodePos.y += Math.sin(angle) * pushDist;
            totalMovement += pushDist;
          }
        });

        visibleNodeIds.forEach(nodeId => {
          const nodePos = positions[nodeId];
          if (!nodePos) return;

          for (const otherId of visibleNodeIds) {
            if (otherId === nodeId) continue;
            const otherPos = positions[otherId];
            const distance = Math.hypot(nodePos.x - otherPos!.x, nodePos.y - otherPos!.y);
            
            if (distance < nodeSize * 2.5) {
              const angle = Math.atan2(otherPos!.y - nodePos.y, otherPos!.x - nodePos.x);
              const pushDistance = (nodeSize * 2.5 - distance) * 0.7;
              
              nodePos.x -= Math.cos(angle) * pushDistance;
              nodePos.y -= Math.sin(angle) * pushDistance;
              totalMovement += pushDistance;
            }
          }
        });

        visibleLinks.forEach(link => {
          const parentPos = positions[link.source];
          const childPos = positions[link.target];
          if (!parentPos || !childPos) return;

          const dx = childPos.x - parentPos.x;
          const dy = childPos.y - parentPos.y;
          const currentDist = Math.hypot(dx, dy);
          const targetDist = 380 + (nodeDepth[link.target]! * 30);
          
          if (currentDist < targetDist * 0.9) {
            const angle = Math.atan2(dy, dx);
            const extendDist = (targetDist - currentDist) * 0.5;
            childPos.x += Math.cos(angle) * extendDist;
            childPos.y += Math.sin(angle) * extendDist;
            totalMovement += extendDist;
          }
        });

        if (totalMovement < 8) break;
      }
    }

    enforceOutwardFlow();

    visibleNodeIds.forEach(nodeId => {
      const pos = positions[nodeId];
      pos.x = Math.max(250, Math.min(canvasWidth - 250, pos.x));
      pos.y = Math.max(250, Math.min(canvasHeight - 250, pos.y));
    });

    if (selectedNodeId) {
      const parentLink = links.find(l => l.target === selectedNodeId);
      if (parentLink) {
        neighborNodes.push(parentLink.source);
        neighborLinks.push(parentLink.id);
      }
      const childLinks = links.filter(l => l.source === selectedNodeId);
      childLinks.forEach(l => {
        neighborNodes.push(l.target);
        neighborLinks.push(l.id);
      });
    }

    const allPositions = visibleNodeIds.map(id => positions[id]);
    if (!allPositions.length) {
      return { positions, visibleNodeIds, visibleLinks, neighborNodes, neighborLinks, viewBox: [0, 0, canvasWidth, canvasHeight] as const };
    }

    const minX = Math.min(...allPositions.map(p => p.x)) - padding;
    const maxX = Math.max(...allPositions.map(p => p.x)) + padding;
    const minY = Math.min(...allPositions.map(p => p.y)) - padding;
    const maxY = Math.max(...allPositions.map(p => p.y)) + padding;

    return {
      positions,
      visibleNodeIds,
      visibleLinks,
      neighborNodes,
      neighborLinks,
      viewBox: [minX, minY, maxX - minX, maxY - minY] as const,
    };
  }, [nodes, links, expandedNodes, selectedNodeId]);

  const handleNodeClick = useCallback((nodeId: string) => {
    selectNode(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node?.children.length) toggleExpand(nodeId);
  }, [selectNode, toggleExpand, nodes]);

  const [vbX, vbY, vbW, vbH] = layout.viewBox;
  const isNeighborNode = (nodeId: string) => layout.neighborNodes.includes(nodeId);
  const isNeighborLink = (linkId: string) => layout.neighborLinks.includes(linkId);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-none bg-bg" >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.08,
          backgroundImage: `
            linear-gradient(to right, rgb(var(--color-fg)) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(var(--color-fg)) 1px, transparent 1px)
          `,
          backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
          backgroundPosition: `${(-vbX - panX) * zoom}px ${(-vbY - panY) * zoom}px`,
        }}
      />
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox={`${vbX + panX} ${vbY + panY} ${vbW / zoom} ${vbH / zoom}`}
        style={{
          touchAction: 'none',
          overscrollBehavior: 'contain'
        }}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onWheelCapture={onWheel}
      >
        <defs>
          <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(var(--color-accent))" />
            <stop offset="100%" stopColor="rgb(var(--color-accent))" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="linkHighlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="1"/>
            <stop offset="50%" stopColor="#FFA500" stopOpacity="1"/>
            <stop offset="100%" stopColor="#FFD700" stopOpacity="1"/>
          </linearGradient>
          <filter id="linkGlow">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FFD700" floodOpacity="0.6"/>
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#FFA500" floodOpacity="0.4"/>
          </filter>
        </defs>

        {layout.visibleLinks.map((link) => {
          const s = layout.positions[link.source];
          const t = layout.positions[link.target];
          if (!s || !t) return null;

          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.hypot(dx, dy);
          const controlOffset = Math.min(100, dist * 0.4);

          const isHighlight = isNeighborLink(link.id);
          
          return (
            <path
              key={link.id}
              d={`M ${s.x},${s.y} Q ${s.x + dx * 0.45},${s.y + dy * 0.45 - controlOffset} ${t.x},${t.y}`}
              stroke={isHighlight ? "url(#linkHighlightGradient)" : "url(#linkGradient)"}
              strokeWidth={isHighlight ? 6 : 3}
              strokeLinecap="round"
              fill="none"
              opacity={isHighlight ? 1 : 0.85}
              filter={isHighlight ? "url(#linkGlow)" : "none"}
              className="transition-all duration-300 ease-out pointer-events-none group"
            />
          );
        })}

        {nodes
          .filter((n: NodeType) => layout.visibleNodeIds.includes(n.id))
          .map((node: NodeType) => (
          <Node
            key={node.id}
            node={node}
            position={layout.positions[node.id]}
            onClick={() => handleNodeClick(node.id)}
            isExpanded={expandedNodes.includes(node.id)}
            childrenVisible={layout.visibleNodeIds}
            isSelected={selectedNodeId === node.id}
            isNeighbor={isNeighborNode(node.id)}        
          />

          ))}
      </svg>
    </div>
  );
}
