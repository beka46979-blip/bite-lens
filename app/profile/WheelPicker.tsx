'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface WheelPickerProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: number;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 3; // нечётное число, чтобы был центр

export function WheelPicker({
  min,
  max,
  value,
  onChange,
  unit = '',
  step = 1,
}: WheelPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProgrammaticScroll = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<{ startY: number; startScrollTop: number } | null>(null);

  // Список значений
  const items: number[] = [];
  for (let i = min; i <= max; i += step) {
    items.push(i);
  }

  const valueIndex = items.indexOf(value);
  const safeIndex = valueIndex >= 0 ? valueIndex : 0;

  const PADDING_HEIGHT = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT;
  const TOTAL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

  // Прокрутка к выбранному значению при изменении value снаружи
  useEffect(() => {
    if (!containerRef.current) return;
    const targetScrollTop = safeIndex * ITEM_HEIGHT;
    if (Math.abs(containerRef.current.scrollTop - targetScrollTop) > 1) {
      isProgrammaticScroll.current = true;
      containerRef.current.scrollTop = targetScrollTop;
      requestAnimationFrame(() => {
        isProgrammaticScroll.current = false;
      });
    }
  }, [safeIndex]);

  const snapToNearest = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
    const targetScrollTop = clampedIndex * ITEM_HEIGHT;

    isProgrammaticScroll.current = true;
    containerRef.current.scrollTo({ top: targetScrollTop, behavior: 'smooth' });

    const newValue = items[clampedIndex];
    if (newValue !== value) {
      onChange(newValue);
    }

    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 300);
  }, [items, value, onChange]);

  const handleScroll = useCallback(() => {
    if (isProgrammaticScroll.current) return;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(snapToNearest, 120);
  }, [snapToNearest]);

  // Drag (mouse/touch) handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    dragStateRef.current = {
      startY: e.clientY,
      startScrollTop: containerRef.current.scrollTop,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStateRef.current || !containerRef.current) return;
    const dy = e.clientY - dragStateRef.current.startY;
    containerRef.current.scrollTop = dragStateRef.current.startScrollTop - dy;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStateRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    snapToNearest();
  };

  const handleItemClick = (item: number) => {
    onChange(item);
  };

  // Кнопки +/-
  const stepUp = () => {
    if (safeIndex < items.length - 1) {
      onChange(items[safeIndex + 1]);
    }
  };

  const stepDown = () => {
    if (safeIndex > 0) {
      onChange(items[safeIndex - 1]);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Кнопка вверх / уменьшить */}
      <button
        type="button"
        onClick={stepDown}
        disabled={safeIndex === 0}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        aria-label="Уменьшить"
      >
        <ChevronDown className="w-5 h-5" />
      </button>

      {/* Колёсико */}
      <div className="relative flex-1 select-none" style={{ height: TOTAL_HEIGHT }}>
        {/* Верхний градиент */}
        <div
          className="absolute top-0 left-0 right-0 z-20 pointer-events-none bg-gradient-to-b from-gray-50 dark:from-gray-800 via-gray-50/80 dark:via-gray-800/80 to-transparent rounded-t-lg"
          style={{ height: PADDING_HEIGHT }}
        />

        {/* Нижний градиент */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none bg-gradient-to-t from-gray-50 dark:from-gray-800 via-gray-50/80 dark:via-gray-800/80 to-transparent rounded-b-lg"
          style={{ height: PADDING_HEIGHT }}
        />

        {/* Подсветка центра */}
        <div
          className="absolute left-0 right-0 z-10 pointer-events-none border-y-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-500/10"
          style={{
            top: PADDING_HEIGHT,
            height: ITEM_HEIGHT,
          }}
        />

        {/* Скролл-контейнер с видимым скроллбаром */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="wheel-scroll overflow-y-scroll h-full touch-pan-y"
          style={{
            scrollSnapType: 'y mandatory',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          <div style={{ paddingTop: PADDING_HEIGHT, paddingBottom: PADDING_HEIGHT }}>
            {items.map((item, index) => {
              const distance = Math.abs(index - safeIndex);
              const isSelected = index === safeIndex;

              const opacity = isSelected ? 1 : Math.max(0.25, 1 - distance * 0.25);
              const scale = isSelected ? 1 : Math.max(0.85, 1 - distance * 0.05);

              return (
                <div
                  key={item}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'text-gray-900 dark:text-white font-bold'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                  style={{
                    height: ITEM_HEIGHT,
                    scrollSnapAlign: 'start',
                    fontSize: isSelected ? '2rem' : '1.5rem',
                    opacity,
                    transform: `scale(${scale})`,
                    transition: isDragging ? 'none' : 'opacity 0.15s, transform 0.15s, font-size 0.15s',
                  }}
                >
                  {item}
                  {unit && (
                    <span
                      className="ml-1.5 text-xs font-medium opacity-60"
                      style={{ fontSize: isSelected ? '0.875rem' : '0.75rem' }}
                    >
                      {unit}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Кнопка вниз / увеличить */}
      <button
        type="button"
        onClick={stepUp}
        disabled={safeIndex === items.length - 1}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        aria-label="Увеличить"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      <style jsx>{`
        .wheel-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(16, 185, 129, 0.5) transparent;
        }

        .wheel-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .wheel-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .wheel-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(16, 185, 129, 0.5);
          border-radius: 3px;
        }

        .wheel-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(16, 185, 129, 0.7);
        }
      `}</style>
    </div>
  );
}
