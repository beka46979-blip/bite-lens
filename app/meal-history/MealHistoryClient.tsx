'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, Loader2, ChevronLeft, ChevronRight, Utensils, Search, ImageIcon, X } from 'lucide-react';
import { ImageViewerModal } from '@/app/components/ImageViewerModal';

// ── types ─────────────────────────────────────────────────────────────────────
interface Meal {
  id: string;
  imageUrl: string;
  dishName: string | null;
  calories: number | null;
  proteins: number | null;
  fats: number | null;
  carbs: number | null;
  weightGram: number | null;
  aiVerdict: string | null;
  confidenceScore: number | null;
  createdAt: string;
  mealType: string | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── constants ─────────────────────────────────────────────────────────────────
const V = (v: string) => `var(${v})`;

const MEAL_TYPES: Record<string, { label: string; bg: string; clr: string; bdr: string }> = {
  BREAKFAST: { label: 'Завтрак',  bg: 'rgba(245,158,11,0.12)',  clr: '#f59e0b', bdr: 'rgba(245,158,11,0.30)' },
  LUNCH:     { label: 'Обед',     bg: 'rgba(249,115,22,0.12)',  clr: '#f97316', bdr: 'rgba(249,115,22,0.30)' },
  DINNER:    { label: 'Ужин',     bg: 'rgba(124,92,252,0.12)', clr: '#7c5cfc', bdr: 'rgba(124,92,252,0.30)' },
  SNACK:     { label: 'Перекус',  bg: 'rgba(0,208,132,0.12)',  clr: '#00d084', bdr: 'rgba(0,208,132,0.30)'  },
};

const getMacros = (meal: Meal) => [
  { lbl: 'КАЛОРИИ',  val: String(meal.calories ?? 0),           unit: 'ккал', clr: '#f97316', bg: 'rgba(249,115,22,0.08)',  bdr: 'rgba(249,115,22,0.20)'  },
  { lbl: 'БЕЛКИ',    val: meal.proteins?.toFixed(1) ?? '0',     unit: 'г',    clr: '#00d084', bg: 'rgba(0,208,132,0.08)',   bdr: 'rgba(0,208,132,0.20)'   },
  { lbl: 'ЖИРЫ',     val: meal.fats?.toFixed(1) ?? '0',         unit: 'г',    clr: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  bdr: 'rgba(245,158,11,0.20)'  },
  { lbl: 'УГЛЕВОДЫ', val: meal.carbs?.toFixed(1) ?? '0',        unit: 'г',    clr: '#7c5cfc', bg: 'rgba(124,92,252,0.08)', bdr: 'rgba(124,92,252,0.20)'  },
];

// ── helpers ───────────────────────────────────────────────────────────────────
function groupByDay(meals: Meal[]): Record<string, Meal[]> {
  const groups: Record<string, Meal[]> = {};
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const meal of meals) {
    const d = new Date(meal.createdAt);
    let key: string;
    if (d.toDateString() === today.toDateString())     key = 'Сегодня';
    else if (d.toDateString() === yesterday.toDateString()) key = 'Вчера';
    else key = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(meal);
  }
  return groups;
}

function pluralRecords(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return 'запись';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'записи';
  return 'записей';
}

// ── component ─────────────────────────────────────────────────────────────────
export function MealHistoryClient() {
  const [meals, setMeals]           = useState<Meal[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDate,  setSearchDate]  = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [focused, setFocused]         = useState('');
  const [viewerImage, setViewerImage] = useState<{ url: string; name: string } | null>(null);

  const fetchMeals = async (page: number) => {
    setIsLoading(true);
    try {
      const res  = await fetch(`/api/meals/history?page=${page}&limit=20`);
      const data = await res.json();
      if (res.ok) { setMeals(data.meals); setPagination(data.pagination); }
    } catch (e) { console.error(e); }
    finally     { setIsLoading(false); }
  };

  useEffect(() => { fetchMeals(currentPage); }, [currentPage]);

  const filteredMeals = useMemo(() => meals.filter(meal => {
    if (searchDate) {
      const d = new Date(meal.createdAt).toISOString().split('T')[0];
      if (d !== searchDate) return false;
    }
    if (searchQuery.trim()) {
      if (!(meal.dishName || '').toLowerCase().includes(searchQuery.toLowerCase().trim())) return false;
    }
    return true;
  }), [meals, searchDate, searchQuery]);

  const hasFilters = !!(searchDate || searchQuery);
  const groups     = useMemo(() => groupByDay(filteredMeals), [filteredMeals]);

  // Stats computed from ALL meals (not filtered)
  const stats = useMemo(() => {
    if (!meals.length) return { total: 0, avgCal: 0, totalCal: 0, avgProt: '0' };
    const withCal  = meals.filter(m => m.calories);
    const withProt = meals.filter(m => m.proteins);
    return {
      total:    pagination?.total ?? meals.length,
      avgCal:   withCal.length  ? Math.round(withCal.reduce((s, m) => s + (m.calories  || 0), 0) / withCal.length)  : 0,
      totalCal: meals.reduce((s, m) => s + (m.calories || 0), 0),
      avgProt:  withProt.length ? (withProt.reduce((s, m) => s + (m.proteins || 0), 0) / withProt.length).toFixed(1) : '0',
    };
  }, [meals, pagination]);

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  // ── Shared input style ───────────────────────────────────────────────────
  const inpBase: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "12px 14px 12px 40px",
    background: V("--lp-bg2"),
    borderRadius: V("--lp-radius-sm"),
    color: V("--lp-text"),
    fontSize: 14, outline: "none", transition: "border-color .15s",
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading && meals.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", flexDirection: "column", gap: 12 }}>
        <Loader2 size={36} className="animate-spin" style={{ color: V("--lp-green") }} />
        <p style={{ color: V("--lp-muted"), fontSize: 14 }}>Загрузка истории...</p>
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (!isLoading && meals.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: V("--lp-green-soft"),
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Utensils size={34} style={{ color: V("--lp-green") }} />
        </div>
        <h3 style={{
          fontFamily: "var(--font-syne), sans-serif",
          fontSize: 22, fontWeight: 800, color: V("--lp-text"), marginBottom: 8,
        }}>
          История пуста
        </h3>
        <p style={{ color: V("--lp-muted"), fontSize: 14 }}>
          Начните добавлять приёмы пищи, чтобы отслеживать прогресс
        </p>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { lbl: 'ВСЕГО ЗАПИСЕЙ', val: String(hasFilters ? filteredMeals.length : stats.total), sub: 'за всё время'   },
          { lbl: 'СР. КАЛОРИИ',   val: String(stats.avgCal),   sub: 'ккал / приём' },
          { lbl: 'ВСЕГО ККАЛ',    val: String(stats.totalCal), sub: 'за период'    },
          { lbl: 'БЕЛКИ СРЕД.',   val: `${stats.avgProt}`,     sub: 'г / приём'    },
        ].map(({ lbl, val, sub }) => (
          <div key={lbl} style={{
            background: V("--lp-card"),
            border: `1px solid ${V("--lp-border")}`,
            borderRadius: V("--lp-radius-sm"),
            padding: "20px 16px",
          }}>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "1.2px",
              color: V("--lp-muted2"), textTransform: "uppercase", marginBottom: 6,
            }}>{lbl}</div>
            <div style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontSize: 28, fontWeight: 800, color: V("--lp-green"), lineHeight: 1,
            }}>{val}</div>
            <div style={{ fontSize: 11, color: V("--lp-muted"), marginTop: 5 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Search / filter row ───────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Calendar size={15} style={{
            position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
            color: V("--lp-muted2"), pointerEvents: "none",
          }} />
          <input
            type="date"
            value={searchDate}
            onChange={e => setSearchDate(e.target.value)}
            onFocus={() => setFocused("date")}
            onBlur={() => setFocused("")}
            style={{ ...inpBase, border: `1px solid ${focused === "date" ? V("--lp-green") : V("--lp-border")}` }}
          />
        </div>

        <div style={{ position: "relative", flex: 2 }}>
          <Search size={15} style={{
            position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
            color: V("--lp-muted2"), pointerEvents: "none",
          }} />
          <input
            type="text"
            placeholder="Поиск по названию блюда..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setFocused("search")}
            onBlur={() => setFocused("")}
            style={{ ...inpBase, border: `1px solid ${focused === "search" ? V("--lp-green") : V("--lp-border")}` }}
          />
        </div>

        {hasFilters && (
          <button
            onClick={() => { setSearchDate(''); setSearchQuery(''); }}
            style={{
              padding: "12px 16px",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: V("--lp-radius-sm"),
              color: "#f87171", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, fontWeight: 500, whiteSpace: "nowrap",
              transition: "background .15s",
            }}
          >
            <X size={14} /> Сбросить
          </button>
        )}
      </div>

      {/* ── Empty filtered ────────────────────────────────────────────────── */}
      {filteredMeals.length === 0 && hasFilters && (
        <div style={{
          background: V("--lp-card"), border: `1px solid ${V("--lp-border")}`,
          borderRadius: V("--lp-radius"), padding: "48px 24px", textAlign: "center",
        }}>
          <Search size={32} style={{ color: V("--lp-muted2"), margin: "0 auto 12px", display: "block" }} />
          <h3 style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontSize: 18, fontWeight: 700, color: V("--lp-text"), marginBottom: 6,
          }}>Ничего не найдено</h3>
          <p style={{ color: V("--lp-muted"), fontSize: 13 }}>Попробуйте изменить параметры поиска</p>
        </div>
      )}

      {/* ── Day groups ────────────────────────────────────────────────────── */}
      {Object.entries(groups).map(([day, dayMeals]) => (
        <div key={day}>
          {/* Day header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: "1.5px",
              color: V("--lp-muted"), textTransform: "uppercase", whiteSpace: "nowrap",
            }}>{day}</span>
            <div style={{ flex: 1, height: 1, background: V("--lp-border") }} />
            <span style={{
              fontSize: 11, color: V("--lp-muted"),
              padding: "2px 10px", borderRadius: 50,
              background: V("--lp-bg3"), border: `1px solid ${V("--lp-border")}`,
              whiteSpace: "nowrap",
            }}>
              {dayMeals.length} {pluralRecords(dayMeals.length)}
            </span>
          </div>

          {/* Meal cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {dayMeals.map(meal => {
              const mType  = meal.mealType ? MEAL_TYPES[meal.mealType] : null;
              const macros = getMacros(meal);

              return (
                <div
                  key={meal.id}
                  style={{
                    background: V("--lp-card"),
                    border: `1px solid ${V("--lp-border")}`,
                    borderRadius: V("--lp-radius"),
                    overflow: "hidden",
                    transition: "border-color .2s, transform .2s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--lp-green)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--lp-border)";
                    (e.currentTarget as HTMLElement).style.transform = "";
                  }}
                >
                  <div style={{ display: "flex" }}>
                    {/* ── Photo button ──────────────────────────────────── */}
                    <button
                      onClick={() => setViewerImage({ url: meal.imageUrl, name: meal.dishName || 'Meal' })}
                      style={{
                        width: 120, minHeight: 140, flexShrink: 0,
                        position: "relative", background: "none",
                        border: "none", padding: 0, cursor: "pointer", overflow: "hidden",
                      }}
                    >
                      {/* Blurred background */}
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: `url(${meal.imageUrl})`,
                        backgroundSize: "cover", backgroundPosition: "center",
                        filter: "blur(6px)", transform: "scale(1.15)",
                      }} />
                      {/* Overlay */}
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.50)" }} />
                      {/* Icon */}
                      <div style={{
                        position: "relative", height: "100%",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 6, padding: 12,
                      }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10,
                          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          border: "1px solid rgba(255,255,255,0.20)",
                        }}>
                          <ImageIcon size={17} style={{ color: "#fff" }} />
                        </div>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                          Фото
                        </span>
                      </div>
                    </button>

                    {/* ── Card content ──────────────────────────────────── */}
                    <div style={{ flex: 1, padding: "16px 18px", minWidth: 0 }}>
                      {/* Top row: name + time + kcal + meal type */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <h3 style={{
                            fontFamily: "var(--font-syne), sans-serif",
                            fontSize: 16, fontWeight: 700, color: V("--lp-text"),
                            margin: 0, lineHeight: 1.2,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {meal.dishName || 'Блюдо'}
                          </h3>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                            <span style={{ fontSize: 12, color: V("--lp-muted") }}>
                              🕐 {formatTime(meal.createdAt)}
                            </span>
                            {meal.weightGram && (
                              <span style={{ fontSize: 12, color: V("--lp-muted") }}>
                                · Вес: {meal.weightGram}г
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                          {/* Big calorie number */}
                          <div style={{ textAlign: "right" }}>
                            <div style={{
                              fontFamily: "var(--font-syne), sans-serif",
                              fontSize: 24, fontWeight: 800, color: V("--lp-text"), lineHeight: 1,
                            }}>
                              {meal.calories ?? 0}
                            </div>
                            <div style={{
                              fontSize: 9, color: V("--lp-muted"),
                              textTransform: "uppercase", letterSpacing: ".5px",
                            }}>ккал</div>
                          </div>
                          {/* Meal type pill */}
                          {mType && (
                            <div style={{
                              padding: "4px 12px", borderRadius: 50,
                              fontSize: 11, fontWeight: 600,
                              background: mType.bg, color: mType.clr,
                              border: `1px solid ${mType.bdr}`,
                              whiteSpace: "nowrap",
                            }}>
                              {mType.label}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Macro pills */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                        {macros.map(({ lbl, val, unit, clr, bg, bdr }) => (
                          <div key={lbl} style={{
                            background: bg, borderRadius: 10, padding: "8px 10px",
                            border: `1px solid ${bdr}`,
                          }}>
                            <div style={{
                              fontSize: 9, fontWeight: 700, letterSpacing: "1px",
                              color: clr, textTransform: "uppercase", marginBottom: 3,
                            }}>{lbl}</div>
                            <div style={{
                              fontFamily: "var(--font-syne), sans-serif",
                              fontSize: 15, fontWeight: 700, color: clr, lineHeight: 1,
                            }}>{val}</div>
                            <div style={{ fontSize: 9, color: clr, opacity: 0.7, marginTop: 2 }}>{unit}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── AI verdict ────────────────────────────────────── */}
                  {meal.aiVerdict && (
                    <div style={{
                      padding: "10px 18px",
                      borderTop: `1px solid ${V("--lp-border")}`,
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: V("--lp-green"),
                        animation: "lp-pulse 1.5s infinite",
                        flexShrink: 0, display: "inline-block",
                      }} />
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: V("--lp-green"),
                        textTransform: "uppercase", letterSpacing: ".5px",
                        marginRight: 4, whiteSpace: "nowrap",
                      }}>AI анализ</span>
                      <span style={{ fontSize: 12, color: V("--lp-muted"), lineHeight: 1.4 }}>
                        {meal.aiVerdict}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {!hasFilters && pagination && pagination.totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 8 }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 20px",
              background: V("--lp-card"), border: `1px solid ${V("--lp-border")}`,
              borderRadius: 50, color: V("--lp-text"),
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              opacity: currentPage === 1 ? 0.45 : 1, transition: "all .2s",
            }}
          >
            <ChevronLeft size={15} /> Предыдущая
          </button>
          <span style={{ fontSize: 13, color: V("--lp-muted") }}>
            {currentPage} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage === pagination.totalPages || isLoading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 20px",
              background: V("--lp-card"), border: `1px solid ${V("--lp-border")}`,
              borderRadius: 50, color: V("--lp-text"),
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              opacity: currentPage === pagination.totalPages ? 0.45 : 1, transition: "all .2s",
            }}
          >
            Следующая <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Image viewer modal */}
      {viewerImage && (
        <ImageViewerModal
          isOpen={!!viewerImage}
          imageUrl={viewerImage.url}
          userName={viewerImage.name}
          onClose={() => setViewerImage(null)}
        />
      )}
    </div>
  );
}
