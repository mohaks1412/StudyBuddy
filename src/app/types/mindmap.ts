export interface Node {
  id: string;
  label: string;
  summary: string;
  children: string[]; 
  description?: string,
  expanded?: boolean;
  level: number;
  x?: number;
  y?: number;
}

export interface Link {
  id: string;
  source: string;
  target: string;
}



export interface MindmapState {
  nodes: Node[];
  links: Link[];
  selectedNodeId: string | null;
  expandedNodes: string[];
  editMode: boolean;
  nodePositions: Record<string, { x: number; y: number }>;
  currentLevel: number;
  documentation: string;
  tempNodeData: {
    label: string;
    summary?: string;
    description?: string;
  };
}
