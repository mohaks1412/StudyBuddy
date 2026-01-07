// app/(frontend)/posts/[_id]/MindMapProvider.tsx
'use client';

import { 
  createContext, useContext, ReactNode, useState, useCallback, 
  useRef, useTransition, useEffect, useMemo 
} from 'react';
import type { Node, Link, MindmapState } from '@/app/types/mindmap';

// ✅ UPDATED CONTEXT TYPE WITH MODES
export const MindMapContext = createContext<{
  nodes: Node[];
  links: Link[];
  selectedNodeId: string | null;
  selectedNode: Node|null;
  expandedNodes: string[];
  currentLevel: number;
  documentation: string;
  tempNodeData: { label: string; summary: string; description: string };
  editMode: 'none' | 'edit' | 'addChild'; 
  postId: string;
  isPending: boolean;
  svgRef: React.RefObject<SVGSVGElement | null>;

  setMindmapData: (data: { nodes: Node[]; links: Link[] } | null) => void;
  setNodes: (nodes: Node[]) => void;
  setLinks: (links: Link[]) => void;
  selectNode: (nodeId: string) => void;
  toggleExpand: (id: string) => void;
  toggleEditMode: () => void;
  expandAll: () => void;  
  collapseAll: () => void;
  drillDown: () => void;  
  drillUp: () => void;      
  generateDocumentation: () => string;
  startInlineEdit: () => void;
  updateTempData: (data: {label: string, summary: string, description: string}) => void;
  confirmInlineEdit: () => void;
  cancelInlineEdit: () => void;
  updateNode: (updates: { id: string; label: string; summary: string; description: string }) => void;
  togglePublic?: () => Promise<void>;  
  downloadSVG?: () => void;             
  resetView?: () => void;     
  setEditMode: (mode: 'none' | 'edit' | 'addChild', nodeId?: string) => void; 
  deleteNode: ()=> void
} | null>(null);

interface ProviderProps {
  children: ReactNode;
  initialData: {
    nodes: Node[];
    links: Link[];
    postId: string;
    title?: string;
    isPrivate?: boolean;
    authorId?: string;
    isAuthor?: boolean;
  };
}

export function useMindMap() {
  const context = useContext(MindMapContext);
  if (!context) throw new Error('useMindMap must be used within MindMapProvider');
  return context;
}

export function MindMapProvider({ children, initialData }: ProviderProps) {

  // ✅ UPDATED: editMode now uses mode type
  const [nodes, setNodes] = useState<Node[]>(initialData.nodes);
  const [links, setLinks] = useState<Link[]>(initialData.links);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [editMode, setEditModeState] = useState<'none' | 'edit' | 'addChild'>('none');
  //const [nodePositions, setNodePositions] = useState<Record<string, {x: number, y: number}>({});
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [documentation, setDocumentation] = useState<string>('');
  const [tempNodeData, setTempNodeData] = useState<{label: string, summary: string, description: string}>(
    { label: '', summary: '', description: '' }
  );

  const postId : string = initialData.postId;


  useEffect(() => {
    if (editMode === 'edit' && selectedNode) {
      setTempNodeData({
        label: selectedNode.label,
        summary: selectedNode.summary || '',
        description: selectedNode.description || '',
      });
    }

    if (editMode === 'addChild') {
      // For new child, you can start from empty or inherit summary/description
      setTempNodeData({
        label: '',
        summary: '',
        description: '',
      });
    }
  }, [editMode, selectedNodeId]);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPending, startTransition] = useTransition();


    // ✅ AUTO-ADD LEVELS to nodes
  const addLevelsToNodes = useCallback((inputNodes: Node[]): Node[] => {
    const nodeMap = new Map(inputNodes.map(n => [n.id, { ...n, level: 0 }]));
    
    const assignLevels = (nodeId: string, level: number): void => {
      const node = nodeMap.get(nodeId);
      if (!node) return;
      node.level = level;
      
      node.children?.forEach(childId => assignLevels(childId, level + 1));
    };

    const rootId = inputNodes.find(n => !inputNodes.some(m => m.children?.includes(n.id)))?.id || inputNodes[0]?.id;
    if (rootId) assignLevels(rootId, 0);

    return Array.from(nodeMap.values());
  }, []);

  // ✅ Initialize with levels
  useEffect(() => {
    const leveledNodes = addLevelsToNodes(initialData.nodes);
    setNodes(leveledNodes);
    setSelectedNodeId(leveledNodes[0]?.id || null);
  }, [initialData.nodes, addLevelsToNodes]);


  // ✅ EXACT REDUX HELPERS
  const getMaxDepth = useCallback((nodesParam: Node[]): number => {
    let maxDepth = 0;
    const findDepth = (nodeId: string, depth: number): void => {
      const node = nodesParam.find(n => n.id === nodeId);
      if (!node) return;
      maxDepth = Math.max(maxDepth, depth);
      node.children.forEach(childId => findDepth(childId, depth + 1));
    };
    const rootId = getRootNode(nodesParam);
    findDepth(rootId, 0);
    return maxDepth;
  }, []);

  const getRootNode = useCallback((nodesParam: Node[] = nodes): string => {
    const allTargets = new Set<string>();
    nodesParam.forEach(node => node.children.forEach(childId => allTargets.add(childId)));
    return nodesParam.find(node => !allTargets.has(node.id))?.id || nodesParam[0]?.id || '';
  }, [nodes]);

  const generateMindmapDocs = useCallback((): string => {
    const rootId = getRootNode(nodes);
    const buildSummary = (nodeId: string, depth: number = 0): string => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return '';
      const indent = '  '.repeat(depth);
      let summary = `${indent}**${node.label}**\n${indent}  Summary: ${node.summary}\n${indent}  Description: ${node.description}\n\n`;
      node.children.forEach(childId => {
        summary += buildSummary(childId, depth + 1);
      });
      return summary;
    };
    return `# Mindmap Documentation\n\n${buildSummary(rootId)}\n\n*Generated: ${new Date().toLocaleString()}*\n*Root: ${rootId}*\n*Total Nodes: ${nodes.length}*`;
  }, [nodes, getRootNode]);

  const updateLevel = useCallback((targetLevel: number): void => {
    const newExpanded: string[] = [];
    const expandUpToLevel = (nodeId: string, depth: number): void => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      if (depth < targetLevel) newExpanded.push(nodeId);
      node.children.forEach(childId => expandUpToLevel(childId, depth + 1));
    };
    const rootId = getRootNode(nodes);
    expandUpToLevel(rootId, 0);
    setExpandedNodes(newExpanded);
    setCurrentLevel(targetLevel);
  }, [nodes, getRootNode]);

  const setEditMode = useCallback((mode: 'none' | 'edit' | 'addChild', nodeId?: string) => {
    setEditModeState(mode);
    if (nodeId) {
      setSelectedNodeId(nodeId);
    }
  }, []);

  // ✅ EXACT REDUX ACTIONS (identical logic)
  const setMindmapData = useCallback((data: { nodes: Node[]; links: Link[] } | null): void => {
    if (!data) {
      setNodes([]);
      setLinks([]);
      setExpandedNodes([]);
      setSelectedNodeId(null);
      setEditModeState('none');
      return;
    }
    setNodes(data.nodes);
    setLinks(data.links);
    setExpandedNodes([]);
    setSelectedNodeId(data.nodes[0]?.id || null);
    setEditModeState('none');
  }, []);

  const setNodesAction = useCallback((newNodes: Node[]): void => {
    setNodes(newNodes);
  }, []);

  const setLinksAction = useCallback((newLinks: Link[]): void => {
    setLinks(newLinks);
  }, []);

  const selectNodeAction = useCallback((nodeId: string): void => {
    setSelectedNodeId(nodeId);
  }, []);

  const toggleExpandAction = useCallback((id: string): void => {
    setExpandedNodes(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  }, []);

  // ✅ UPDATED: toggleEditMode now cycles through modes
  const toggleEditMode = useCallback((): void => {
    setEditModeState(prev => {
      switch (prev) {
        case 'none': return 'edit';
        case 'edit': return 'addChild';
        case 'addChild': return 'none';
        default: return 'none';
      }
    });
  }, []);

  const expandAllAction = useCallback((): void => {
    const maxDepth = getMaxDepth(nodes);
    updateLevel(maxDepth);
  }, [nodes, getMaxDepth, updateLevel]);

  const collapseAllAction = useCallback((): void => {
    setCurrentLevel(0);
    setExpandedNodes([]);
  }, []);

  const drillDownAction = useCallback((): void => {
    const maxDepth = getMaxDepth(nodes);
    const nextLevel = Math.min((currentLevel as number) + 1, maxDepth);
    updateLevel(nextLevel);
  }, [nodes, getMaxDepth, currentLevel, updateLevel]);

  const drillUpAction = useCallback((): void => {
    const nextLevel = Math.max((currentLevel as number) - 1, 0);
    updateLevel(nextLevel);
  }, [currentLevel, updateLevel]);

  const generateDocumentationAction = useCallback((): string => {
    const docs = generateMindmapDocs();
    setDocumentation(docs);
    return docs;
  }, [generateMindmapDocs]);

  const startInlineEditAction = useCallback((): void => {
    if (!selectedNodeId) return;
    setEditMode('edit');
  }, [selectedNodeId, setEditMode]);

  const updateTempDataAction = useCallback((
    data: {label: string, summary: string, description: string}
  ): void => {
    setTempNodeData(data);
  }, []);

  const confirmInlineEditAction = useCallback((): void => {
    if (editMode !== 'addChild') return;
    
    const { label, summary, description } = tempNodeData;
    if (!label.trim() || !selectedNodeId) return;

    const parent = nodes.find(n => n.id === selectedNodeId!);
    if (!parent) return;

    const newNodeId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNode: Node = {
      id: newNodeId,
      label: label.trim(),
      summary: summary.trim() || "New node summary",
      description: description.trim() || "New node description",
      children: [],
      level: parent.level + 1,
    };

    setNodes(prev => {
      const newNodes = [...prev, newNode];
      const parentIndex = newNodes.findIndex(n => n.id === selectedNodeId!);
      if (parentIndex !== -1) {
        newNodes[parentIndex] = {
          ...newNodes[parentIndex],
          children: [...newNodes[parentIndex].children, newNodeId]
        };
      }
      return newNodes;
    });

    setLinks(prev => [...prev, {
      id: `link-${newNodeId}`,
      source: selectedNodeId!,
      target: newNodeId
    }]);

    if (!expandedNodes.includes(selectedNodeId!)) {
      setExpandedNodes(prev => [...prev, selectedNodeId!]);
    }

    setTempNodeData({ label: '', summary: '', description: '' });
    setEditMode('none');
  }, [tempNodeData, selectedNodeId, nodes, expandedNodes, editMode]);

  const cancelInlineEditAction = useCallback((): void => {
    setTempNodeData({ label: '', summary: '', description: '' });
    setEditMode('none');
  }, []);

  const updateNodeAction = useCallback((
    updates: { id: string; label: string; summary: string; description: string }
  ): void => {
    const { id, label, summary, description } = updates;
    setNodes(prev => prev.map(node =>
      node.id === id ? {
        ...node,
        label: label.trim(),
        summary: summary.trim(),
        description: description.trim()
      } : node
    ));
  }, []);

  
  
const collectSubtreeIds = useCallback((nodeId: string): string[] => {
const subtree: string[] = [nodeId];
const node = nodes.find(n => n.id === nodeId);

node?.children?.forEach(childId => {
subtree.push(...collectSubtreeIds(childId));
});

return subtree;
}, [nodes]);

const deleteNodeAction = useCallback((): void => {

  if(nodes.length === 1){
    return;
  }
  
if (!selectedNodeId) return;

const idsToDelete = collectSubtreeIds(selectedNodeId);

setNodes(prevNodes => {
const filteredNodes = prevNodes.filter(n => !idsToDelete.includes(n.id));
return filteredNodes.map(node => ({
...node,
children: node.children?.filter(id => !idsToDelete.includes(id)) || []
}));
});

setLinks(prevLinks => prevLinks.filter(link =>
!idsToDelete.includes(link.source) && !idsToDelete.includes(link.target)
));

setSelectedNodeId(null);
setExpandedNodes(prev => prev.filter(id => !idsToDelete.includes(id)));
setEditModeState('none');
setTempNodeData({ label: '', summary: '', description: '' });
}, [selectedNodeId, collectSubtreeIds]);


  const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;

  const value = {
    
    nodes,
    links,
    selectedNodeId,
    expandedNodes,
    editMode,
    currentLevel,
    documentation,
    tempNodeData,
    selectedNode,
    postId,
    
    setMindmapData,
    setNodes: setNodesAction,
    setLinks: setLinksAction,
    selectNode: selectNodeAction,
    toggleExpand: toggleExpandAction,
    toggleEditMode,
    expandAll: expandAllAction,
    collapseAll: collapseAllAction,
    drillDown: drillDownAction,
    drillUp: drillUpAction,
    generateDocumentation: generateDocumentationAction,
    startInlineEdit: startInlineEditAction,
    updateTempData: updateTempDataAction,
    confirmInlineEdit: confirmInlineEditAction,
    cancelInlineEdit: cancelInlineEditAction,
    updateNode: updateNodeAction,
    setEditMode,
    deleteNode: deleteNodeAction,
    
    isPending,
    svgRef
  };

  return (
    <MindMapContext.Provider value={value}>
      {children}
    </MindMapContext.Provider>
  );
}
