'use client';

import { useMindMap } from '../../providers/MindMapProvider';
import { Edit3, Check, X, Info, Layers, CornerDownRight, Hash, ChevronUp, ChevronDown } from 'lucide-react';
import { useCallback, useState } from 'react';

interface SideBarProps {
  isAuthor: boolean;
}

export default function Sidebar(props: SideBarProps) {
  const { isAuthor } = props;
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed on mobile

  const {
    editMode,
    tempNodeData,
    updateTempData,
    confirmInlineEdit,
    cancelInlineEdit,
    selectedNode,
    setEditMode,
    updateNode,
  } = useMindMap();

  const handleSave = useCallback(() => {
    if (selectedNode && tempNodeData) {
      updateNode({
        id: selectedNode.id,
        label: tempNodeData.label,
        summary: tempNodeData.summary,
        description: tempNodeData.description,
      });
      setEditMode('none');
    }
  }, [updateNode, selectedNode, tempNodeData, setEditMode]);

  const SectionLabel = ({ children, icon: Icon }: { children: string; icon?: any }) => (
    <div className="flex items-center gap-2 mb-3 px-1">
      {Icon && (
        <Icon
          size={14}
          strokeWidth={2.5}
          className="text-[rgb(var(--color-accent))]"
        />
      )}
      <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-fg-muted))]">
        {children}
      </span>
    </div>
  );

  // Responsive logic: 
  // Mobile: fixed bottom sheet that slides up/down.
  // Desktop (md+): standard sidebar positioning.
  const containerClasses = `
    fixed bottom-0 left-0 right-0 w-full z-50 transition-transform duration-300 ease-in-out
    md:relative md:translate-y-0 md:w-[380px] md:h-full md:z-auto
    ${isCollapsed ? 'translate-y-[calc(100%-64px)]' : 'translate-y-0'}
    bg-gradient-to-b from-[rgb(var(--color-bg-soft))] to-[rgb(var(--color-bg))]
    border-t md:border-t-0 md:border-l border-border flex flex-col shadow-2xl ring-1 ring-[rgb(var(--color-ring))/40]
    rounded-t-[2rem] md:rounded-t-none
  `;

  // Mobile Toggle Header
  const MobileToggleHandle = () => (
    <button 
      onClick={() => setIsCollapsed(!isCollapsed)}
      className="md:hidden flex flex-col items-center w-full pt-3 pb-2 touch-none"
    >
      <div className="w-12 h-1 bg-border rounded-full mb-2" />
      {isCollapsed && selectedNode && (
        <div className="flex items-center gap-2 px-4 w-full animate-in fade-in duration-500">
           <Hash size={14} className="text-[rgb(var(--color-accent))]" />
           <span className="text-sm font-bold truncate text-[rgb(var(--color-fg))]">
            {selectedNode.label}
           </span>
           <ChevronUp size={16} className="ml-auto text-[rgb(var(--color-fg-muted))]" />
        </div>
      )}
      {!isCollapsed && <ChevronDown size={18} className="text-[rgb(var(--color-fg-muted))]" />}
    </button>
  );

  // EDIT MODE
  if (editMode !== 'none' && selectedNode) {
    return (
      <div className={containerClasses}>
        <MobileToggleHandle />
        {/* Header */}
        <div className="border-b border-border p-5 bg-gradient-to-r from-[rgb(var(--color-accent))/8] via-[rgb(var(--color-bg))] to-[rgb(var(--color-accent))/6]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[rgb(var(--color-fg))]">
                {editMode === 'edit' ? 'Edit Node' : 'Add Child'}
              </h2>
              <p className="text-xs mt-1 font-medium text-[rgb(var(--color-fg-muted))]">
                Configure node properties
              </p>
            </div>
            <button
              onClick={cancelInlineEdit}
              className="p-2 rounded-lg transition-all duration-200 text-[rgb(var(--color-fg-muted))] hover:text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))/10]"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 max-h-[70vh] md:max-h-none">
          <div>
            <SectionLabel icon={Hash}>Label</SectionLabel>
            <input
              value={tempNodeData.label}
              onChange={(e) => updateTempData({ ...tempNodeData, label: e.target.value })}
              className="w-full h-12 px-4 py-3 rounded-2xl text-lg font-semibold bg-[rgb(var(--color-bg-soft))] text-[rgb(var(--color-fg))] placeholder:text-[rgb(var(--color-fg-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-ring))] transition-all"
              placeholder="Enter node label..."
              autoFocus
            />
          </div>

          <div>
            <SectionLabel icon={Info}>Summary</SectionLabel>
            <textarea
              value={tempNodeData.summary}
              onChange={(e) => updateTempData({ ...tempNodeData, summary: e.target.value })}
              rows={3}
              className="w-full min-h-[90px] px-4 py-3 rounded-2xl resize-vertical bg-[rgb(var(--color-bg-soft))] text-[rgb(var(--color-fg))] placeholder:text-[rgb(var(--color-fg-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-ring))] transition-all"
              placeholder="Brief summary of the node..."
            />
          </div>

          <div>
            <SectionLabel icon={Layers}>Description</SectionLabel>
            <textarea
              value={tempNodeData.description}
              onChange={(e) => updateTempData({ ...tempNodeData, description: e.target.value })}
              rows={5}
              className="w-full min-h-[140px] px-4 py-3 rounded-2xl resize-vertical text-sm bg-[rgb(var(--color-bg-soft))] text-[rgb(var(--color-fg))] placeholder:text-[rgb(var(--color-fg-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-ring))] transition-all mb-0 pb-0"
              placeholder="Detailed description and notes..."
            />
          </div>

          <button
            onClick={editMode === 'addChild' ? confirmInlineEdit : handleSave}
            className="w-full h-12 rounded-2xl font-semibold text-sm uppercase tracking-wide bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-fg))] hover:brightness-110 active:scale-[0.98] transition-all ring-2 ring-[rgb(var(--color-ring))/50]"
          >
            {editMode === 'addChild' ? 'Create Child Node' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  // VIEW MODE
  return (
    <div className={containerClasses}>
      <MobileToggleHandle />
      {selectedNode ? (
        <>
          {/* Header */}
          <div className="border-b border-border p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold break-words text-[rgb(var(--color-fg))]">
                  {selectedNode.label}
                </h1>
                <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-[rgb(var(--color-accent))/15] border border-border">
                  <div className="w-2 h-2 rounded-full bg-[rgb(var(--color-accent))]" />
                  <span className="text-xs font-bold uppercase tracking-wide text-[rgb(var(--color-accent))]">
                    Active Node
                  </span>
                </div>
              </div>
              {isAuthor && (
                <button
                  onClick={() => {
                    setIsCollapsed(false); // Expand when entering edit mode
                    setEditMode('edit', selectedNode.id);
                  }}
                  className="w-11 h-11 rounded-xl flex items-center justify-center bg-[rgb(var(--color-accent))/15] text-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))] transition-all border border-border"
                >
                  <Edit3 size={17} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 max-h-[70vh] md:max-h-none">
            {selectedNode.summary && (
              <div>
                <SectionLabel icon={Info}>Summary</SectionLabel>
                <div className="p-5 rounded-2xl border border-border bg-[rgb(var(--color-bg-soft))]">
                  <p className="text-base font-medium italic leading-relaxed border-l-4 pl-4 border-[rgb(var(--color-accent))] text-[rgb(var(--color-fg))]">
                    {selectedNode.summary}
                  </p>
                </div>
              </div>
            )}

            {selectedNode.description && (
              <div>
                <SectionLabel icon={Layers}>Description</SectionLabel>
                <div className="p-5 rounded-2xl border border-border bg-[rgb(var(--color-bg-soft))]">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-[rgb(var(--color-fg-muted))]">
                    {selectedNode.description}
                  </p>
                </div>
              </div>
            )}

            {selectedNode.children?.length > 0 && (
              <div>
                <SectionLabel icon={CornerDownRight}>Connections</SectionLabel>
                <div className="p-5 rounded-2xl border border-border bg-[rgb(var(--color-accent))/10]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-fg))]">
                      <Hash size={18} />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-[rgb(var(--color-fg))]">
                        {selectedNode.children.length}
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--color-accent))]">
                        Child Nodes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center min-h-[200px] md:min-h-0">
          <div className="w-28 h-28 rounded-3xl flex items-center justify-center mb-6 bg-[rgb(var(--color-accent))/10] border border-border">
            <Layers className="w-12 h-12 text-[rgb(var(--color-accent))]" />
          </div>
          <h2 className="text-xl font-bold mb-3 text-[rgb(var(--color-fg))]">
            No Node Selected
          </h2>
          <p className="text-sm max-w-sm text-[rgb(var(--color-fg-muted))]">
            Click on any node in the mind map to view its details and configuration.
          </p>
        </div>
      )}
    </div>
  );
}