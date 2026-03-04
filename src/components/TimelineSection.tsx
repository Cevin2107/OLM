import { useEffect, useRef, useState } from 'react';
import { supabase, type LiteraryPeriod, type Work } from '../lib/supabase';
import { Clock, ChevronDown, ChevronUp, BookMarked, GripVertical, Pencil, Trash2, Plus, X, Save } from 'lucide-react';
import { useEditMode } from '../context/EditContext';
import { WorkDetailModal } from './WorksSection';

type PeriodFormData = {
  period_name: string;
  historical_context: string;
  start_year: string;
  end_year: string;
};

function PeriodModal({
  period,
  nextSortOrder,
  onClose,
  onSaved,
}: {
  period: LiteraryPeriod | null;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<PeriodFormData>({
    period_name: period?.period_name ?? '',
    historical_context: period?.historical_context ?? '',
    start_year: period?.start_year ?? '',
    end_year: period?.end_year ?? '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.period_name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        period_name: form.period_name.trim(),
        historical_context: form.historical_context.trim() || null,
        start_year: form.start_year.trim() || null,
        end_year: form.end_year.trim() || null,
      };
      if (period) {
        const { error } = await supabase.from('literary_periods').update(payload).eq('id', period.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('literary_periods').insert({ ...payload, sort_order: nextSortOrder });
        if (error) throw error;
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu!');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#eff4fc] rounded-lg max-w-lg w-full p-4 md:p-8 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-serif font-bold text-[#1c1c1c]">
            {period ? 'Sửa Giai Đoạn' : 'Thêm Giai Đoạn'}
          </h3>
          <button onClick={onClose} className="text-[#1c1c1c]/50 hover:text-[#1c1c1c] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">
              Tên giai đoạn <span className="text-[#1a4f99]">*</span>
            </label>
            <input
              className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4]"
              value={form.period_name}
              onChange={(e) => setForm((f) => ({ ...f, period_name: e.target.value }))}
              placeholder="Văn học trung đại"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Bắt đầu</label>
              <input
                type="text"
                className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4]"
                value={form.start_year}
                onChange={(e) => setForm((f) => ({ ...f, start_year: e.target.value }))}
                placeholder="Thế kỷ X"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Kết thúc</label>
              <input
                type="text"
                className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4]"
                value={form.end_year}
                onChange={(e) => setForm((f) => ({ ...f, end_year: e.target.value }))}
                placeholder="Thế kỷ XIX"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Bối cảnh lịch sử</label>
            <textarea
              className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4] min-h-[100px] resize-y"
              value={form.historical_context}
              onChange={(e) => setForm((f) => ({ ...f, historical_context: e.target.value }))}
              placeholder="Mô tả bối cảnh lịch sử của giai đoạn này..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving || !form.period_name.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#3b82c4] text-[#1c1c1c] font-semibold rounded hover:bg-[#2d6db5] disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#1c1c1c]/20 text-[#1c1c1c] rounded hover:bg-[#1c1c1c]/10 transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

function PeriodWorks({ periodId, onWorkClick }: { periodId: string; onWorkClick: (work: Work) => void }) {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('works')
      .select('*, author:authors(name, birth_death_year, hometown, bio_short, bio_life, bio_style, avatar_url, video_doc_id), genre:genres(id, name, sort_order)')
      .eq('period_id', periodId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setWorks(data || []);
        setLoading(false);
      });
  }, [periodId]);

  if (loading) {
    return <div className="py-4 text-center text-[#3b82c4]/60 text-sm animate-pulse">Đang tải tác phẩm...</div>;
  }

  if (works.length === 0) {
    return <p className="text-[#1c1c1c]/50 text-sm italic mt-3">Chưa có tác phẩm trong giai đoạn này.</p>;
  }

  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {works.map((work) => (
        <button
          key={work.id}
          onClick={(e) => { e.stopPropagation(); onWorkClick(work); }}
          className="flex items-start gap-3 bg-[#1b2d47] rounded-lg px-4 py-3 text-left hover:bg-[#3a2f24] hover:ring-1 hover:ring-[#3b82c4]/40 transition-all duration-200 group w-full"
        >
          <BookMarked size={16} className="text-[#3b82c4] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <p className="font-serif font-semibold text-[#ccd8ef] leading-tight group-hover:text-[#3b82c4] transition-colors">{work.title}</p>
            {work.author && (
              <p className="text-xs text-[#3b82c4]/80 mt-0.5">{work.author.name}</p>
            )}
            {work.excerpt && (
              <p className="text-xs text-[#ccd8ef]/60 italic mt-1 line-clamp-2">"{work.excerpt}"</p>
            )}
          </div>
          <span className="text-[#3b82c4]/40 group-hover:text-[#3b82c4] text-xs mt-0.5 flex-shrink-0">→</span>
        </button>
      ))}
    </div>
  );
}

export function TimelineSection() {
  const [periods, setPeriods] = useState<LiteraryPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalPeriod, setModalPeriod] = useState<LiteraryPeriod | null | 'new'>(null);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const { isEditMode } = useEditMode();

  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPeriods();
  }, []);

  async function fetchPeriods() {
    try {
      const { data, error } = await supabase
        .from('literary_periods')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      setPeriods(data || []);
    } catch (error) {
      console.error('Error fetching periods:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(period: LiteraryPeriod) {
    if (!confirm(`Xóa giai đoạn "${period.period_name}"?`)) return;
    const { error } = await supabase.from('literary_periods').delete().eq('id', period.id);
    if (error) { alert('Lỗi khi xóa!'); return; }
    if (expandedId === period.id) setExpandedId(null);
    fetchPeriods();
  }

  async function handleDrop(toIndex: number) {
    if (dragIndex.current === null || dragIndex.current === toIndex) {
      setDragOverIndex(null);
      return;
    }
    const next = [...periods];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(toIndex, 0, moved);
    setPeriods(next);
    setDragOverIndex(null);
    dragIndex.current = null;
    try {
      await Promise.all(
        next.map((p, i) => supabase.from('literary_periods').update({ sort_order: i }).eq('id', p.id))
      );
    } catch (err) {
      console.error('Lỗi khi lưu thứ tự:', err);
    }
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (loading) {
    return (
      <section id="timeline" className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-pulse text-[#3b82c4]">Đang tải...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="timeline" className="py-20 px-4 bg-gradient-to-b from-[#1b2d47] to-[#1a1a1a]">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-[#3b82c4] tracking-wider uppercase mb-4">
            Dòng Thời Gian Văn Học
          </h2>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#3b82c4] to-transparent mx-auto mb-6"></div>
          <p className="text-base md:text-xl text-[#ccd8ef]/80 max-w-2xl mx-auto">
            Hành trình phát triển của văn học Việt Nam qua các giai đoạn lịch sử
          </p>
        </div>

        {isEditMode && (
          <div className="flex justify-end mb-6 max-w-4xl mx-auto">
            <button
              onClick={() => setModalPeriod('new')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3b82c4] text-[#1a1a1a] font-semibold rounded-lg hover:bg-[#2d6db5] transition-colors shadow-lg"
            >
              <Plus size={18} />
              Thêm giai đoạn
            </button>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {periods.map((period, index) => {
            const isExpanded = expandedId === period.id;
            const isDragOver = isEditMode && dragOverIndex === index;
            return (
              <div
                key={period.id}
                className={`relative mb-12 last:mb-0 transition-opacity duration-150`}
                draggable={isEditMode}
                onDragStart={(e) => { dragIndex.current = index; e.dataTransfer.effectAllowed = 'move'; }}
                onDragEnter={() => isEditMode && setDragOverIndex(index)}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDrop={() => handleDrop(index)}
                onDragEnd={() => { setDragOverIndex(null); dragIndex.current = null; }}
              >
                <div className="flex items-start gap-3 md:gap-6">
                  <div className="flex-shrink-0 relative">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-[#3b82c4] rounded-full flex items-center justify-center shadow-lg shadow-[#3b82c4]/30">
                      <Clock className="w-6 h-6 md:w-8 md:h-8 text-[#1a1a1a]" strokeWidth={2} />
                    </div>
                    {index < periods.length - 1 && (
                      <div className="absolute top-12 md:top-16 left-6 md:left-8 w-px h-full bg-gradient-to-b from-[#3b82c4] to-transparent"></div>
                    )}
                  </div>

                  <div className="flex-1 pb-8">
                    <div
                    className={`bg-[#eff4fc] rounded-lg p-4 md:p-6 spotlight-hover cursor-pointer transition-all duration-200 ${
                      isExpanded ? 'ring-2 ring-[#3b82c4]' : ''
                    } ${
                      isDragOver ? 'border-2 border-dashed border-[#3b82c4] opacity-70' : ''
                    }`}
                    onClick={() => toggleExpand(period.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3 mb-2">
                          {isEditMode && (
                            <GripVertical size={16} className="text-[#1c1c1c]/30 hover:text-[#3b82c4] cursor-grab active:cursor-grabbing flex-shrink-0 self-center" onClick={(e) => e.stopPropagation()} />
                          )}
                            <h3 className="text-xl md:text-2xl font-serif font-bold text-[#1c1c1c]">
                              {period.period_name}
                            </h3>
                            {period.start_year && period.end_year && (
                              <span className="text-[#1a4f99] font-medium text-sm">
                                ({period.start_year} – {period.end_year})
                              </span>
                            )}
                          </div>

                          {period.historical_context && (
                            <p className="text-[#1c1c1c]/80 leading-relaxed">
                              {period.historical_context}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isEditMode && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); setModalPeriod(period); }}
                                className="w-7 h-7 bg-[#3b82c4] rounded-full flex items-center justify-center hover:bg-[#2d6db5] transition-colors"
                                title="Sửa giai đoạn"
                              >
                                <Pencil size={12} className="text-[#1a1a1a]" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(period); }}
                                className="w-7 h-7 bg-[#1a4f99] rounded-full flex items-center justify-center hover:bg-[#143d7a] transition-colors"
                                title="Xóa giai đoạn"
                              >
                                <Trash2 size={12} className="text-white" />
                              </button>
                            </>
                          )}
                          <button
                            className="w-7 h-7 rounded-full bg-[#1b2d47] flex items-center justify-center text-[#3b82c4] hover:bg-[#3b82c4] hover:text-[#1a1a1a] transition-colors"
                            title={isExpanded ? 'Thu gọn' : 'Xem tác phẩm'}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Works panel */}
                      {isExpanded && (
                        <div
                          className="mt-4 border-t border-[#3b82c4]/20 pt-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-xs font-semibold text-[#1a4f99] uppercase tracking-widest mb-2">
                            Tác phẩm trong giai đoạn này
                          </p>
                          <PeriodWorks periodId={period.id} onWorkClick={setSelectedWork} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {periods.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#ccd8ef]/60 text-lg">
              Chưa có dữ liệu dòng thời gian.{' '}
              {isEditMode && (
                <button onClick={() => setModalPeriod('new')} className="text-[#3b82c4] underline">
                  Thêm giai đoạn đầu tiên
                </button>
              )}
            </p>
          </div>
        )}
      </div>

      {modalPeriod !== null && (
        <PeriodModal
          period={modalPeriod === 'new' ? null : modalPeriod}
          nextSortOrder={periods.length}
          onClose={() => setModalPeriod(null)}
          onSaved={fetchPeriods}
        />
      )}

      {selectedWork && (
        <WorkDetailModal work={selectedWork} onClose={() => setSelectedWork(null)} />
      )}
    </section>
  );
}
