import { useEffect, useRef, useState } from 'react';
import { supabase, type LiteraryTheory } from '../lib/supabase';
import { MarkdownText } from '../lib/markdownText';
import { useEditMode } from '../context/EditContext';
import {
  LibraryBig, Feather, Layers, BookOpen, Lightbulb,
  Pencil, Trash2, Plus, X, Save, Search, ChevronDown, Loader2,
} from 'lucide-react';

/* ─── category config ─── */
const CATEGORIES = [
  { key: 'Thể loại văn học',       icon: <BookOpen   size={14} />, color: 'bg-[#1a4f99]/20 text-[#3b82c4] border-[#3b82c4]/40' },
  { key: 'Biện pháp tu từ',        icon: <Feather    size={14} />, color: 'bg-[#143d7a]/20 text-[#2d6db5] border-[#2d6db5]/40' },
  { key: 'Phương thức biểu đạt',   icon: <Layers     size={14} />, color: 'bg-[#1b2d47]/40 text-[#ccd8ef] border-[#ccd8ef]/30' },
  { key: 'Các yếu tố tự sự',       icon: <LibraryBig size={14} />, color: 'bg-[#1a4f99]/15 text-[#1a4f99] border-[#1a4f99]/40' },
  { key: 'Khái niệm cơ bản',       icon: <Lightbulb  size={14} />, color: 'bg-[#3b82c4]/10 text-[#3b82c4] border-[#3b82c4]/30' },
];

function categoryConfig(cat: string) {
  return CATEGORIES.find((c) => c.key === cat) ?? {
    icon: <Lightbulb size={14} />,
    color: 'bg-[#1b2d47]/40 text-[#ccd8ef] border-[#ccd8ef]/30',
  };
}

/* ─── card left-border accent ─── */
const BORDER_ACCENTS: Record<string, string> = {
  'Thể loại văn học':     'border-l-[#3b82c4]',
  'Biện pháp tu từ':      'border-l-[#2d6db5]',
  'Phương thức biểu đạt': 'border-l-[#ccd8ef]',
  'Các yếu tố tự sự':     'border-l-[#1a4f99]',
  'Khái niệm cơ bản':     'border-l-[#3b82c4]',
};

/* ═══════════════ Edit / Add modal ═══════════════ */
type FormData = {
  title: string; category: string; definition: string; examples: string; notes: string;
};

function TheoryModal({
  entry, nextSort, onClose, onSaved,
}: {
  entry: LiteraryTheory | null;
  nextSort: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormData>({
    title:      entry?.title      ?? '',
    category:   entry?.category   ?? CATEGORIES[0].key,
    definition: entry?.definition ?? '',
    examples:   entry?.examples   ?? '',
    notes:      entry?.notes      ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'basic' | 'examples' | 'notes'>('basic');

  function set(k: keyof FormData, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title:      form.title.trim(),
        category:   form.category,
        definition: form.definition.trim() || null,
        examples:   form.examples.trim()   || null,
        notes:      form.notes.trim()      || null,
      };
      if (entry) {
        const { error } = await supabase.from('literary_theory').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', entry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('literary_theory').insert({ ...payload, sort_order: nextSort });
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

  const TABS = [
    { key: 'basic' as const,    label: 'Cơ bản' },
    { key: 'examples' as const, label: 'Ví dụ' },
    { key: 'notes' as const,    label: 'Ghi chú' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="modal-enter bg-[#eff4fc] rounded-2xl max-w-xl w-full shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#3b82c4]/20">
          <h3 className="text-xl font-serif font-bold text-[#1c1c1c]">
            {entry ? 'Sửa khái niệm' : 'Thêm khái niệm mới'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#1b2d47]/10 flex items-center justify-center hover:bg-[#1b2d47]/20 transition-colors">
            <X size={16} className="text-[#1c1c1c]" />
          </button>
        </div>

        {/* form tabs */}
        <div className="flex gap-0.5 border-b border-[#3b82c4]/20 px-6 pt-4">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === t.key ? 'border-[#3b82c4] text-[#1a4f99]' : 'border-transparent text-[#1c1c1c]/50 hover:text-[#1c1c1c]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {tab === 'basic' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#1a4f99] mb-1.5">Tên khái niệm *</label>
                <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="VD: Ẩn dụ, Thơ lục bát, Tự sự..." maxLength={120}
                  className="w-full px-4 py-2.5 border border-[#3b82c4]/30 rounded-lg bg-white text-[#1c1c1c] text-sm focus:outline-none focus:border-[#3b82c4] focus:ring-1 focus:ring-[#3b82c4]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#1a4f99] mb-1.5">Phân loại</label>
                <div className="relative">
                  <select value={form.category} onChange={(e) => set('category', e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#3b82c4]/30 rounded-lg bg-white text-[#1c1c1c] text-sm focus:outline-none focus:border-[#3b82c4] appearance-none">
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>{c.key}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1c1c1c]/40 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#1a4f99] mb-1.5">Định nghĩa</label>
                <textarea value={form.definition} onChange={(e) => set('definition', e.target.value)}
                  placeholder="Hỗ trợ # Tiêu đề, - Danh sách..." rows={5}
                  className="w-full px-4 py-2.5 border border-[#3b82c4]/30 rounded-lg bg-white text-[#1c1c1c] text-sm focus:outline-none focus:border-[#3b82c4] focus:ring-1 focus:ring-[#3b82c4]/20 resize-none" />
              </div>
            </>
          )}
          {tab === 'examples' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#1a4f99] mb-1.5">Ví dụ minh họa</label>
              <textarea value={form.examples} onChange={(e) => set('examples', e.target.value)}
                placeholder="Trích các câu thơ, đoạn văn, tác phẩm tiêu biểu..." rows={10}
                className="w-full px-4 py-2.5 border border-[#3b82c4]/30 rounded-lg bg-white text-[#1c1c1c] text-sm focus:outline-none focus:border-[#3b82c4] focus:ring-1 focus:ring-[#3b82c4]/20 resize-none" />
            </div>
          )}
          {tab === 'notes' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#1a4f99] mb-1.5">Ghi chú / Mở rộng</label>
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
                placeholder="Phân biệt với các khái niệm tương tự, lưu ý đặc biệt..." rows={10}
                className="w-full px-4 py-2.5 border border-[#3b82c4]/30 rounded-lg bg-white text-[#1c1c1c] text-sm focus:outline-none focus:border-[#3b82c4] focus:ring-1 focus:ring-[#3b82c4]/20 resize-none" />
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-[#3b82c4]/30 rounded-lg text-[#1c1c1c]/70 text-sm hover:bg-[#1b2d47]/5 transition-colors">Huỷ</button>
          <button onClick={handleSave} disabled={saving || !form.title.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3b82c4] hover:bg-[#2d6db5] disabled:opacity-50 text-[#1a1a1a] font-semibold text-sm rounded-lg transition-colors">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ Detail modal ═══════════════ */
function TheoryDetailModal({ entry, onClose }: { entry: LiteraryTheory; onClose: () => void }) {
  const cfg = categoryConfig(entry.category);
  const [tab, setTab] = useState<'def' | 'examples' | 'notes'>('def');
  const TABS = [
    { key: 'def' as const,      label: 'Định nghĩa' },
    { key: 'examples' as const, label: 'Ví dụ minh họa' },
    { key: 'notes' as const,    label: 'Ghi chú' },
  ].filter((t) =>
    t.key === 'def' ? !!entry.definition :
    t.key === 'examples' ? !!entry.examples :
    !!entry.notes
  );

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="modal-enter bg-[#eff4fc] rounded-2xl max-w-3xl w-full shadow-2xl my-6" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="px-6 md:px-8 pt-6 pb-4 border-b border-[#3b82c4]/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color} mb-3`}>
                {cfg.icon} {entry.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1c1c1c] leading-tight">
                {entry.title}
              </h2>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1b2d47]/10 flex items-center justify-center hover:bg-[#1b2d47]/20 transition-colors flex-shrink-0">
              <X size={16} className="text-[#1c1c1c]" />
            </button>
          </div>
        </div>

        {/* tabs */}
        {TABS.length > 0 && (
          <div className="px-6 md:px-8 pt-4">
            <div className="flex gap-0.5 border-b border-[#3b82c4]/20 mb-6">
              {TABS.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                    tab === t.key ? 'border-[#3b82c4] text-[#1a4f99]' : 'border-transparent text-[#1c1c1c]/50 hover:text-[#1c1c1c]'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div key={tab} className="tab-panel pb-8 min-h-[120px]">
              {tab === 'def'      && <MarkdownText text={entry.definition ?? ''} />}
              {tab === 'examples' && <MarkdownText text={entry.examples   ?? ''} />}
              {tab === 'notes'    && <MarkdownText text={entry.notes      ?? ''} />}
            </div>
          </div>
        )}

        {TABS.length === 0 && (
          <p className="px-8 py-10 text-[#1c1c1c]/40 italic text-sm">Chưa có nội dung chi tiết.</p>
        )}

        <div className="px-6 md:px-8 pb-6 md:pb-8">
          <button onClick={onClose}
            className="w-full px-8 py-3 bg-[#1b2d47] text-[#ccd8ef] uppercase tracking-widest text-sm font-semibold rounded-lg hover:bg-[#3b82c4] hover:text-[#1a1a1a] transition-colors duration-300">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ Theory card ═══════════════ */
function TheoryCard({
  entry, isEditMode, onEdit, onDelete, onClick,
}: {
  entry: LiteraryTheory;
  isEditMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  const cfg = categoryConfig(entry.category);
  const accent = BORDER_ACCENTS[entry.category] ?? 'border-l-[#3b82c4]';

  return (
    <div
      className={`relative bg-[#eff4fc] rounded-xl border-l-4 ${accent} p-5 shadow-sm
        hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer
        animate-[cardReveal_0.4s_ease_both]`}
      onClick={() => !isEditMode && onClick()}
    >
      {isEditMode && (
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="w-7 h-7 bg-[#3b82c4] rounded-full flex items-center justify-center hover:bg-[#2d6db5] transition-colors shadow"
            title="Sửa">
            <Pencil size={12} className="text-[#1a1a1a]" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-7 h-7 bg-[#1a4f99] rounded-full flex items-center justify-center hover:bg-[#143d7a] transition-colors shadow"
            title="Xóa">
            <Trash2 size={12} className="text-white" />
          </button>
        </div>
      )}

      {/* category badge */}
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.color} mb-3`}>
        {cfg.icon} {entry.category}
      </span>

      {/* title */}
      <h3 className="font-serif font-bold text-[#1c1c1c] text-base leading-snug mb-2 group-hover:text-[#1a4f99] transition-colors">
        {entry.title}
      </h3>

      {/* definition preview */}
      {entry.definition && (
        <p className="text-sm text-[#1c1c1c]/65 leading-relaxed line-clamp-3">
          {entry.definition.replace(/^#+\s*/gm, '').replace(/^-\s*/gm, '').slice(0, 160)}
        </p>
      )}

      {/* hint */}
      {!isEditMode && (
        <p className="text-[10px] text-[#3b82c4]/50 mt-3 italic">Nhấn để xem chi tiết →</p>
      )}
    </div>
  );
}

/* ═══════════════ Main section ═══════════════ */
export function LiteraryTheorySection() {
  const { isEditMode } = useEditMode();
  const [entries, setEntries] = useState<LiteraryTheory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<LiteraryTheory | null>(null);
  const [editing, setEditing]   = useState<LiteraryTheory | null | undefined>(undefined); // undefined = closed, null = new
  const sectionRef = useRef<HTMLElement>(null);

  async function load() {
    const { data } = await supabase
      .from('literary_theory')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    setEntries(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  /* scroll-reveal header */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add('revealed'); },
      { threshold: 0.05 }
    );
    el.classList.add('scroll-reveal');
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  async function handleDelete(entry: LiteraryTheory) {
    if (!confirm(`Xóa "${entry.title}"?`)) return;
    await supabase.from('literary_theory').delete().eq('id', entry.id);
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
  }

  /* filter */
  const filtered = entries.filter((e) => {
    const matchCat = activeCategory === 'all' || e.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || e.title.toLowerCase().includes(q) || (e.definition ?? '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  /* used categories */
  const usedCategories = CATEGORIES.filter((c) => entries.some((e) => e.category === c.key));

  return (
    <section
      id="theory"
      ref={sectionRef}
      className="py-20 px-4 bg-gradient-to-b from-[#1b2d47]/20 to-[#1a1a1a]"
    >
      <div className="container mx-auto max-w-7xl">

        {/* ── Section header ── */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#3b82c4]" />
            <LibraryBig className="w-8 h-8 text-[#3b82c4]" strokeWidth={1.5} />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#3b82c4]" />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#ccd8ef] tracking-wide mb-3">
            Lí Luận Văn Học
          </h2>
          <p className="text-[#ccd8ef]/60 max-w-xl mx-auto text-base">
            Các khái niệm, thể loại và biện pháp nghệ thuật trong văn học THCS
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#3b82c4] to-transparent mx-auto mt-5" />
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3b82c4]/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm khái niệm..."
              className="w-full pl-9 pr-4 py-2 bg-[#1b2d47]/60 border border-[#3b82c4]/25 rounded-lg text-[#ccd8ef] placeholder-[#ccd8ef]/30 text-sm focus:outline-none focus:border-[#3b82c4] transition-colors"
            />
          </div>

          {/* category tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                activeCategory === 'all'
                  ? 'bg-[#3b82c4] border-[#3b82c4] text-[#1a1a1a]'
                  : 'bg-transparent border-[#3b82c4]/30 text-[#ccd8ef]/70 hover:border-[#3b82c4] hover:text-[#ccd8ef]'
              }`}>
              Tất cả {entries.length > 0 && `(${entries.length})`}
            </button>
            {usedCategories.map((c) => {
              const count = entries.filter((e) => e.category === c.key).length;
              return (
                <button key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    activeCategory === c.key
                      ? 'bg-[#3b82c4] border-[#3b82c4] text-[#1a1a1a]'
                      : 'bg-transparent border-[#3b82c4]/30 text-[#ccd8ef]/70 hover:border-[#3b82c4] hover:text-[#ccd8ef]'
                  }`}>
                  {c.icon} {c.key} ({count})
                </button>
              );
            })}
          </div>

          {/* add button */}
          {isEditMode && (
            <button
              onClick={() => setEditing(null)}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#3b82c4] hover:bg-[#2d6db5] text-[#1a1a1a] font-semibold text-sm rounded-lg transition-colors flex-shrink-0">
              <Plus size={16} /> Thêm khái niệm
            </button>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-[#ccd8ef]/40">
            <Loader2 size={22} className="animate-spin" />
            <span>Đang tải...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <LibraryBig size={52} className="text-[#3b82c4]/20" strokeWidth={1} />
            <p className="text-[#ccd8ef]/40 text-sm italic text-center">
              {entries.length === 0
                ? isEditMode ? 'Chưa có khái niệm nào. Nhấn "Thêm khái niệm" để bắt đầu.' : 'Chưa có nội dung.'
                : 'Không tìm thấy kết quả phù hợp.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((e) => (
              <TheoryCard
                key={e.id}
                entry={e}
                isEditMode={isEditMode}
                onEdit={() => setEditing(e)}
                onDelete={() => handleDelete(e)}
                onClick={() => setSelected(e)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {selected && (
        <TheoryDetailModal entry={selected} onClose={() => setSelected(null)} />
      )}
      {editing !== undefined && (
        <TheoryModal
          entry={editing}
          nextSort={entries.length}
          onClose={() => setEditing(undefined)}
          onSaved={load}
        />
      )}
    </section>
  );
}
