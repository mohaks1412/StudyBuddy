'use client';
import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Maximize2,
  Plus,
  Download,
  X,
  Save,
  Delete,
  Menu
} from 'lucide-react';
import { useCallback } from 'react';
import { useMindMap } from '../../providers/MindMapProvider';
import { useCanvasDrag } from '../../providers/UiProvider';
import { createMindMapAction, updateMindMapAction } from '../../actions/mindmap.actions';
import { ConfirmOverlay } from '../ConfirmOverlay';
import { CornerLoadingOverlay } from '../BlobWaiting';
import { useSearchParams } from 'next/navigation';

interface ActionBarProps {
  isAuthor: boolean;
  title: string,
  summary: string,
  subject: string
}
export default function ActionBar(props: ActionBarProps) {
  
  const searchParams = useSearchParams();
  const communityId = searchParams.get("communityId");
  
  const {isAuthor, title, summary, subject} = props;
  const {
    postId,
    expandAll,
    collapseAll,
    drillDown,
    drillUp,
    selectedNodeId,
    editMode,
    setEditMode,
    svgRef,
    nodes,
    links,
    deleteNode
  } = useMindMap();

  const { resetView } = useCanvasDrag();

  
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishTitle, setPublishTitle] = useState<string>(title || '');
  const [publishSummary, setPublishSummary] = useState<string>(summary || '');
  const [publishSubject, setPublishSubject] = useState<string>(subject || '')
  const [isLoading, setLoading] = useState<boolean>(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);const [publishErrors, setPublishErrors] = useState<{ [key: string]: string }>({});

  // ✅ Validation helper
  const validatePublishForm = useCallback(() => {
    const errors: { [key: string]: string } = {};

    if (!publishTitle.trim()) {
      errors.title = "Title is required";
    }

    if (!publishSummary.trim()) {
      errors.summary = "Summary is required";
    }

    if (!publishSubject.trim()) {
      errors.subject = "Subject is required";
    }

    if (nodes.length === 0) {
      errors.nodes = "At least one node is required";
    }

    setPublishErrors(errors);
    return Object.keys(errors).length === 0;
  }, [publishTitle, publishSummary, publishSubject, nodes.length]);
  

    const handlePublishClick = useCallback(() => {
    setPublishOpen(true);
  }, []);

  const handlePublishCancel = useCallback(() => {
    setPublishOpen(false);
    setPublishTitle('');
    setPublishSummary('');
  }, []);

  const handlePublishSubmit = useCallback(async () => {

    if (!validatePublishForm()) {
      return; // Don't submit
    }

    setLoading(true);
    try {
      if(postId === "new"){
        await createMindMapAction({
          title: publishTitle.trim(),
          summary: publishSummary.trim(),
          subject: publishSubject.trim(),
          nodes: nodes,
          links: links,
          postId: postId,
          communityId
        });
      }
      else{
        
        await updateMindMapAction(postId, {
          title: publishTitle.trim(),
          summary: publishSummary.trim(),
          subject: publishSubject.trim(),
          nodes: nodes,
          links: links,
          postId: postId,
        })
      }
      
      console.log('✅ MindMap Published!');
    } catch (error) {
      console.error('Publish failed:', error);
      // Optional: Show error toast
    }
    finally{
      setPublishOpen(false);
      setLoading(false);
    }
  }, [publishTitle, publishSummary, nodes, links, postId, publishSubject, validatePublishForm, communityId]);


  const handleAddChildToggle = useCallback(() => {
    if (editMode === 'addChild') {
      setEditMode('none');
    } else if (selectedNodeId) {
      setEditMode('addChild', selectedNodeId);
    }
  }, [editMode, selectedNodeId, setEditMode]);

  const handleSvgDownload = useCallback(() => {
    expandAll();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const svg = svgRef?.current;
        if (!svg) return;

        const svgString = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(svg)}`;
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `mindmap-full-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    });
  }, [svgRef, expandAll]);


  const utilityBtn = `
    h-9 px-3 inline-flex items-center justify-center gap-1.5
    rounded-xl text-xs font-semibold
    bg-[rgb(var(--color-bg-soft))]
    text-[rgb(var(--color-fg))]
    border border-border
    shadow-sm

    hover:bg-[rgb(var(--color-bg-strong))]
    hover:shadow-md

    active:scale-95 active:shadow-inner
    transition-all duration-200

    disabled:opacity-40
    disabled:cursor-not-allowed
  `;

  const utilityIcon = `
    text-[rgb(var(--color-accent))]
  `;

  const primaryBtn = `
    ml-auto h-10 px-6 inline-flex items-center gap-2
    rounded-2xl text-sm font-bold uppercase tracking-wide

    bg-[rgb(var(--color-accent))]
    text-[rgb(var(--color-accent-fg))]
    border border-[rgb(var(--color-accent))/40]

    shadow-xl
    hover:brightness-110 hover:shadow-2xl

    active:scale-[0.97] active:shadow-lg
    transition-all duration-200

    ring-1 ring-[rgb(var(--color-ring))/40]
  `;

  const isAddChildMode = editMode === 'addChild';
  const canAddChild = !!selectedNodeId && editMode !== 'edit';

  return (
    <>
    <CornerLoadingOverlay isVisible={isLoading}/>
    <nav
  className="
    w-full flex items-center justify-between
    py-3 px-4
    bg-[rgb(var(--color-bg-soft))/70]
    backdrop-blur-sm
    border-b border-border
  "
>
  {/* LEFT: Desktop utility bar */}
  <div className="hidden md:flex items-center gap-1.5 flex-wrap">
    <button className={utilityBtn} onClick={expandAll} title="Expand All">
      <ChevronDown size={14} className={utilityIcon} />
      <span className="text-[rgb(var(--color-accent))] font-mono">Expand All</span>
    </button>

    <button className={utilityBtn} onClick={collapseAll} title="Collapse All">
      <ChevronUp size={14} className={utilityIcon} />
      <span className="text-[rgb(var(--color-accent))] font-mono">Collapse All</span>
    </button>

    <button className={utilityBtn} onClick={drillDown} title="Drill Down">
      <span className="text-[rgb(var(--color-accent))] font-mono">↓ Drill Down</span>
    </button>

    <button className={utilityBtn} onClick={drillUp} title="Drill Up">
      <span className="text-[rgb(var(--color-accent))] font-mono">↑ Drill Up</span>
    </button>

    <button className={utilityBtn} onClick={resetView} title="Fit View">
      <Maximize2 size={14} className={utilityIcon} />
      <span className="text-[rgb(var(--color-accent))] font-mono">Reset View</span>
    </button>

    {isAuthor && (
      <button
        className={utilityBtn}
        onClick={handleAddChildToggle}
        disabled={!canAddChild}
        title={isAddChildMode ? 'Cancel Add Child' : 'Add Child'}
      >
        {isAddChildMode ? (
          <X size={14} className="text-[rgb(var(--color-danger))]" />
        ) : (
          <Plus size={14} className={utilityIcon} />
        )}

        {isAddChildMode ? (
          <span className="text-[rgb(var(--color-accent))] font-mono">Cancel</span>
        ) : (
          <span className="text-[rgb(var(--color-accent))] font-mono">Add Child</span>
        )}
      </button>
    )}

    {isAuthor && (
      <button className={utilityBtn} onClick={deleteNode} title="Delete Node">
        <Delete size={14} className={utilityIcon} />
        <span className="text-[rgb(var(--color-accent))] font-mono">Delete Node</span>
      </button>
    )}

    <button className={utilityBtn} onClick={handleSvgDownload} title="Download SVG">
      <Download size={14} className={utilityIcon} />
      <span className="text-[rgb(var(--color-accent))] font-mono">Download</span>
    </button>
  </div>

  {/* LEFT: Mobile hamburger */}
  <button
    type="button"
    className="md:hidden inline-flex items-center justify-center rounded-xl border border-border bg-[rgb(var(--color-bg-soft))] p-2"
    onClick={() => setMobileMenuOpen((o) => !o)}
    aria-label="Toggle command center"
  >
    <Menu size={18} className="text-[rgb(var(--color-accent))]" />
  </button>

  {/* RIGHT: Primary action */}
  {isAuthor && (
    <button className={primaryBtn} onClick={handlePublishClick}>
      <Save size={16} />
      <span className="hidden sm:inline">
        {postId === 'new' ? 'Publish MindMap' : 'Update MindMap'}
      </span>
      <span className="sm:hidden">
        {postId === 'new' ? 'Publish' : 'Update'}
      </span>
    </button>
  )}
</nav>

{/* Mobile command center */}
{mobileMenuOpen && (
  <div
    className="
      md:hidden
      w-full px-4 pb-3 pt-2
      bg-[rgb(var(--color-bg-soft))]
      border-b border-border
      space-y-1.5
    "
  >
    <button className={`${utilityBtn} w-full justify-start`} onClick={expandAll}>
      <ChevronDown size={16} className={utilityIcon} />
      <span className="text-[rgb(var(--color-accent))] font-mono">Expand All</span>
    </button>

    <button className={`${utilityBtn} w-full justify-start`} onClick={collapseAll}>
      <ChevronUp size={16} className={utilityIcon} />
      <span className="text-[rgb(var(--color-accent))] font-mono">Collapse All</span>
    </button>

    <button className={`${utilityBtn} w-full justify-start`} onClick={drillDown}>
      <span className="text-[rgb(var(--color-accent))] font-mono">↓ Drill Down</span>
    </button>

    <button className={`${utilityBtn} w-full justify-start`} onClick={drillUp}>
      <span className="text-[rgb(var(--color-accent))] font-mono">↑ Drill Up</span>
    </button>

    <button className={`${utilityBtn} w-full justify-start`} onClick={resetView}>
      <Maximize2 size={16} className={utilityIcon} />
      <span className="text-[rgb(var(--color-accent))] font-mono">Reset View</span>
    </button>

    {isAuthor && (
      <button
        className={`${utilityBtn} w-full justify-start`}
        onClick={handleAddChildToggle}
        disabled={!canAddChild}
      >
        {isAddChildMode ? (
          <X size={16} className="text-[rgb(var(--color-danger))]" />
        ) : (
          <Plus size={16} className={utilityIcon} />
        )}
        <span className="text-[rgb(var(--color-accent))] font-mono">
          {isAddChildMode ? 'Cancel Add Child' : 'Add Child'}
        </span>
      </button>
    )}

    {isAuthor && (
      <button className={`${utilityBtn} w-full justify-start`} onClick={deleteNode}>
        <Delete size={16} className={utilityIcon} />
        <span className="text-[rgb(var(--color-accent))] font-mono">Delete Node</span>
      </button>
    )}

    <button className={`${utilityBtn} w-full justify-start`} onClick={handleSvgDownload}>
      <Download size={16} className={utilityIcon} />
      <span className="text-[rgb(var(--color-accent))] font-mono">Download SVG</span>
    </button>
  </div>
)}


    <ConfirmOverlay
        open={publishOpen}
        title="Publish MindMap"
        description={
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[rgb(var(--color-fg))] mb-2">
                Title *
              </label>
              <input
                value={publishTitle}
                onChange={(e) => setPublishTitle(e.target.value)}
                placeholder="Enter mindmap title..."
                className={`
                  w-full px-4 py-2.5 rounded-xl bg-[rgb(var(--color-bg-soft))] 
                  border transition-all
                  ${publishErrors.title 
                    ? 'border-[rgb(var(--color-danger))] focus:ring-[rgb(var(--color-danger))]' 
                    : 'border-[rgb(var(--color-border)/0.5)] focus:ring-[rgb(var(--color-accent)/0.5)] focus:border-[rgb(var(--color-accent))]'
                  }
                  text-[rgb(var(--color-fg))] placeholder-[rgb(var(--color-fg-muted))]
                `}
                autoFocus
              />
              {publishErrors.title && (
                <p className="mt-1 text-xs text-[rgb(var(--color-danger))] font-medium">
                  {publishErrors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-[rgb(var(--color-fg))] mb-2">
                Subject *
              </label>
              <input
                value={publishSubject}
                onChange={(e) => setPublishSubject(e.target.value)}
                placeholder="Enter mindmap Subject..."
                className={`
                  w-full px-4 py-2.5 rounded-xl bg-[rgb(var(--color-bg-soft))] 
                  border transition-all
                  ${publishErrors.subject 
                    ? 'border-[rgb(var(--color-danger))] focus:ring-[rgb(var(--color-danger))]' 
                    : 'border-[rgb(var(--color-border)/0.5)] focus:ring-[rgb(var(--color-accent)/0.5)] focus:border-[rgb(var(--color-accent))]'
                  }
                  text-[rgb(var(--color-fg))] placeholder-[rgb(var(--color-fg-muted))]
                `}
              />
              {publishErrors.subject && (
                <p className="mt-1 text-xs text-[rgb(var(--color-danger))] font-medium">
                  {publishErrors.subject}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-[rgb(var(--color-fg))] mb-2">
                Summary *
              </label>
              <textarea
                value={publishSummary}
                onChange={(e) => setPublishSummary(e.target.value)}
                placeholder="Brief description of this mindmap..."
                rows={3}
                className={`
                  w-full px-4 py-2.5 rounded-xl bg-[rgb(var(--color-bg-soft))] 
                  border transition-all resize-vertical
                  ${publishErrors.summary 
                    ? 'border-[rgb(var(--color-danger))] focus:ring-[rgb(var(--color-danger))]' 
                    : 'border-[rgb(var(--color-border)/0.5)] focus:ring-[rgb(var(--color-accent)/0.5)] focus:border-[rgb(var(--color-accent))]'
                  }
                  text-[rgb(var(--color-fg))] placeholder-[rgb(var(--color-fg-muted))]
                `}
              />
              {publishErrors.summary && (
                <p className="mt-1 text-xs text-[rgb(var(--color-danger))] font-medium">
                  {publishErrors.summary}
                </p>
              )}
            </div>

            {publishErrors.nodes && (
              <div className="p-3 rounded-xl bg-[rgb(var(--color-danger))/0.1) border border-[rgb(var(--color-danger))/0.3)]">
                <p className="text-xs text-[rgb(var(--color-danger))] font-medium">
                  {publishErrors.nodes}
                </p>
              </div>
            )}

            <p className="text-xs text-[rgb(var(--color-fg-muted))] pt-2">
              {nodes.length} nodes, {links.length} connections
            </p>
          </div>
        }
        onCancel={handlePublishCancel}
        cancelLabel="Cancel"
        primaryLabel={postId === 'new' ? 'Publish MindMap' : 'Update MindMap'}
        primaryOnClick={handlePublishSubmit}
        primaryVariant="primary"
      />
    </>
  );
}