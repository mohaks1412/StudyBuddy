// app/(frontend)/posts/[_id]/UIProvider.tsx
'use client';

import { 
  createContext, 
  useContext, 
  ReactNode, 
  useState, 
  useCallback, 
  useEffect,
  useRef
} from 'react';

interface UiState {
  zoom: number;
  panX: number;
  panY: number;
  velocityX: number;
  velocityY: number;
  autoFit: boolean;
  isDragging: boolean;
}

interface UIContextValue extends UiState {
  // ✅ EXACT REDUX ACTIONS
  fitView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  startDrag: () => void;
  updatePan: (delta: { x: number; y: number }) => void;
  endDrag: () => void;
  resetView: () => void;
  decayMomentum: () => void;

  // 🆕 ADDITIVE (non-breaking)
  zoomAtPoint: (delta: number, point: { x: number; y: number }) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export const useCanvasDrag = () => {
  const { 
    isDragging,
    startDrag,
    updatePan,
    endDrag,
    zoomIn,
    zoomOut,
    zoomAtPoint,
    decayMomentum,
    resetView
  } = useUi();

  // 🆕 TOUCH PINCH SUPPORT
  const lastDistanceRef = useRef<number | null>(null);

  // 🆕 SMOOTH MOMENTUM LOOP (runs in hook!)
  useEffect(() => {
    let rafId: number;
    
    const loop = () => {
      decayMomentum();
      rafId = requestAnimationFrame(loop);
    };
    
    loop();
    
    return () => cancelAnimationFrame(rafId);
  }, [decayMomentum]);

  // Drag handlers (EXACT Redux logic)
  const onMouseDown = useCallback((): void => {
    startDrag();
  }, [startDrag]);

  const onMouseMove = useCallback((e: React.MouseEvent): void => {
    if (isDragging) {
      updatePan({ 
        x: e.movementX * 0.8,
        y: e.movementY * 0.8 
      });
    }
  }, [isDragging, updatePan]);

  const onMouseUp = useCallback((): void => {
    endDrag();
  }, [endDrag]);

  const onMouseLeave = useCallback((): void => {
    endDrag();
  }, [endDrag]);

  // 🆕 CURSOR-CENTERED WHEEL ZOOM
  const onWheel = useCallback((e: React.WheelEvent): void => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    zoomAtPoint(zoomFactor, { x: mouseX, y: mouseY });
  }, [zoomAtPoint]);

  // 🆕 MOBILE PINCH ZOOM
  const onTouchMove = useCallback((e: React.TouchEvent): void => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

  // ─── PINCH ZOOM ───────────────────────────
  if (e.touches.length === 2) {
    
    e.preventDefault();

    const t1 = e.touches[0];
    const t2 = e.touches[1];

    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    const distance = Math.hypot(dx, dy);

    const centerX = ((t1.clientX + t2.clientX) / 2) - rect.left;
    const centerY = ((t1.clientY + t2.clientY) / 2) - rect.top;

    if (lastDistanceRef.current) {
      const delta = distance / lastDistanceRef.current;
      zoomAtPoint(delta, { x: centerX, y: centerY });
    }

    lastDistanceRef.current = distance;
    return;
  }

  // ─── PAN ───────────────────────────
  if (e.touches.length === 1 && touchOrigin.current) {
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    updatePan({
      x: (x - touchOrigin.current.x) * 0.8,
      y: (y - touchOrigin.current.y) * 0.8,
    });

    touchOrigin.current = { x, y };
  }
}, [zoomAtPoint, updatePan]);

const onTouchEnd = useCallback((): void => {
  lastDistanceRef.current = null;
  touchOrigin.current = null;
  endDrag();
}, [endDrag]);


  const touchOrigin = useRef<{x: number, y: number} | null>(null);

const onTouchStart = useCallback((e: React.TouchEvent): void => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

  if (e.touches.length === 1) {
    const t = e.touches[0];
    touchOrigin.current = {
      x: t.clientX - rect.left,
      y: t.clientY - rect.top,
    };
    startDrag();
  }
}, [startDrag]);


const onTouchPanMove = useCallback((e: React.TouchEvent): void => {
  if (e.touches.length !== 1 || !touchOrigin.current) return;
  //e.preventDefault();
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const dx = (e.touches[0].clientX - rect.left) - touchOrigin.current.x;
  const dy = (e.touches[0].clientY - rect.top) - touchOrigin.current.y;
  updatePan({ x: dx * 0.8, y: dy * 0.8 });
  touchOrigin.current = {  // Continuous origin
    x: e.touches[0].clientX - rect.left,
    y: e.touches[0].clientY - rect.top
  };
}, [updatePan]);

const onTouchEndPan = useCallback((e: React.TouchEvent): void => {
  touchOrigin.current = null;
  endDrag();
}, [endDrag]);

  return {
    isDragging,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onWheel,
    onTouchMove,
    onTouchEnd,
    resetView,
    onTouchStart,
    onTouchPanMove,
    onTouchEndPan
  };
};

export function useUi(): UIContextValue {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}

export function UIProvider({ children }: { children: ReactNode }) {
  // ✅ EXACT REDUX STATE
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [velocityX, setVelocityX] = useState<number>(0);
  const [velocityY, setVelocityY] = useState<number>(0);
  const [autoFit, setAutoFit] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // ✅ EXACT REDUX ACTIONS
  const fitView = useCallback((): void => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setVelocityX(0);
    setVelocityY(0);
    setAutoFit(true);
  }, []);

  const zoomIn = useCallback((): void => {
    setZoom(prev => Math.min(prev * 1.2, 3));
    setAutoFit(false);
  }, []);

  const zoomOut = useCallback((): void => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
    setAutoFit(false);
  }, []);

  const zoomAtPoint = useCallback(
    (delta: number, point: { x: number; y: number }) => {
      setZoom(prevZoom => {
        const nextZoom = Math.min(Math.max(prevZoom * delta, 0.3), 3);
        if (nextZoom === prevZoom) return prevZoom;

        const zoomRatio = prevZoom / nextZoom;

        setPanX(prevPanX =>
          point.x - (point.x - prevPanX) * zoomRatio
        );
        setPanY(prevPanY =>
          point.y - (point.y - prevPanY) * zoomRatio
        );

        return nextZoom;
      });

      setVelocityX(0);
      setVelocityY(0);
      setAutoFit(false);
    },
    []
  );


  const startDrag = useCallback((): void => {
    setIsDragging(true);
    setVelocityX(prev => prev * 0.5);
    setVelocityY(prev => prev * 0.5);
  }, []);

  const updatePan = useCallback(({ x, y }: { x: number; y: number }): void => {
    if (isDragging) {
      setPanX(prev => prev - x * 0.8);
      setPanY(prev => prev - y * 0.8);
      setVelocityX(x * 0.3);
      setVelocityY(y * 0.3);
    }
  }, [isDragging]);

  const endDrag = useCallback((): void => {
    setIsDragging(false);
  }, []);

  const resetView = useCallback((): void => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setVelocityX(0);
    setVelocityY(0);
    setAutoFit(true);
  }, []);

  const decayMomentum = useCallback((): void => {
    if (!isDragging) {
      setVelocityX(prev => {
        const newVel = prev * 0.92;
        setPanX(panX => panX + newVel);
        return Math.abs(newVel) < 0.1 ? 0 : newVel;
      });
      setVelocityY(prev => {
        const newVel = prev * 0.92;
        setPanY(panY => panY + newVel);
        return Math.abs(newVel) < 0.1 ? 0 : newVel;
      });
    }
  }, [isDragging]);

  // ✅ MOMENTUM LOOP
  useEffect(() => {
    const interval = setInterval(decayMomentum, 16);
    return () => clearInterval(interval);
  }, [decayMomentum]);

  const value: UIContextValue = {
    zoom,
    panX,
    panY,
    velocityX,
    velocityY,
    autoFit,
    isDragging,

    fitView,
    zoomIn,
    zoomOut,
    zoomAtPoint,
    startDrag,
    updatePan,
    endDrag,
    resetView,
    decayMomentum
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}
