import { useEffect, useRef, useState } from 'react';
import { supabase, type Author, type Work } from '../lib/supabase';
import { WorkContentView } from './WorkContentView';
import { User, MapPin, Pencil, Trash2, Plus, X, Save, Upload, Loader2 } from 'lucide-react';
import { useEditMode } from '../context/EditContext';

const STORAGE_BUCKET = 'author-avatars';

type AuthorFormData = {
  name: string;
  birth_death_year: string;
  hometown: string;
  bio_short: string;
  bio_life: string;
  bio_style: string;
  avatar_url: string;
  video_doc_id: string;
};

/* ─────────────── Edit / Add modal (với upload ảnh Supabase) ─────────────── */
function AuthorModal({
  author,
  onClose,
  onSaved,
}: {
  author: Author | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<AuthorFormData>({
    name: author?.name ?? '',
    birth_death_year: author?.birth_death_year ?? '',
    hometown: author?.hometown ?? '',
    bio_short: author?.bio_short ?? '',
    bio_life: author?.bio_life ?? '',
    bio_style: author?.bio_style ?? '',
    avatar_url: author?.avatar_url ?? '',
    video_doc_id: author?.video_doc_id ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formTab, setFormTab] = useState<'basic' | 'detail' | 'media'>('basic');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Chỉ chấp nhận file ảnh (jpg, png, webp...)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ảnh phải nhỏ hơn 5 MB');
      return;
    }

    setUploadError('');
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // Delete old avatar from storage if editing
      if (author?.avatar_url) {
        const oldPath = decodeURIComponent(
          author.avatar_url.split(`/object/public/${STORAGE_BUCKET}/`)[1] ?? ''
        );
        if (oldPath) await supabase.storage.from(STORAGE_BUCKET).remove([oldPath]);
      }

      const { error: uploadErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, { upsert: false, contentType: file.type });

      if (uploadErr) {
        if (
          uploadErr.message?.toLowerCase().includes('bucket') ||
          uploadErr.message?.toLowerCase().includes('not found') ||
          (uploadErr as { statusCode?: string }).statusCode === '404' ||
          (uploadErr as { statusCode?: string }).statusCode === '400'
        ) {
          setUploadError(
            'Bucket "author-avatars" chưa tồn tại. Hãy chạy migration SQL mới nhất trong Supabase Dashboard (SQL Editor).'
          );
          return;
        }
        throw uploadErr;
      }

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
      setForm((f) => ({ ...f, avatar_url: data.publicUrl }));
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Lỗi upload ảnh!');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (author) {
        const { error } = await supabase
          .from('authors')
          .update({
            name: form.name.trim(),
            birth_death_year: form.birth_death_year.trim() || null,
            hometown: form.hometown.trim() || null,
            bio_short: form.bio_short.trim() || null,
            bio_life: form.bio_life.trim() || null,
            bio_style: form.bio_style.trim() || null,
            avatar_url: form.avatar_url || null,
            video_doc_id: form.video_doc_id.trim() || null,
          })
          .eq('id', author.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('authors').insert({
          name: form.name.trim(),
          birth_death_year: form.birth_death_year.trim() || null,
          hometown: form.hometown.trim() || null,
          bio_short: form.bio_short.trim() || null,
          bio_life: form.bio_life.trim() || null,
          bio_style: form.bio_style.trim() || null,
          avatar_url: form.avatar_url || null,
          video_doc_id: form.video_doc_id.trim() || null,
        });
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
        className="bg-[#f4ecd8] rounded-lg max-w-lg w-full p-8 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-serif font-bold text-[#1c1c1c]">
            {author ? 'Sửa Tác Giả' : 'Thêm Tác Giả'}
          </h3>
          <button onClick={onClose} className="text-[#1c1c1c]/50 hover:text-[#1c1c1c] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form tabs */}
        <div className="flex gap-1 border-b border-[#c89b3c]/30 mb-5">
          {([['basic', 'Cơ Bản'], ['detail', 'Chi Tiết'], ['media', 'Tư Liệu']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFormTab(key)}
              className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px ${formTab === key ? 'border-[#c89b3c] text-[#8b2500]' : 'border-transparent text-[#1c1c1c]/60 hover:text-[#1c1c1c]'}`}>
              {label}
            </button>
          ))}
        </div>

        {formTab === 'basic' && (
          <div className="space-y-4">
            {/* Avatar upload */}
            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-2">Ảnh đại diện</label>
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-[#2c241b] flex-shrink-0 flex items-center justify-center border-2 border-[#c89b3c]/30">
                  {uploading ? <Loader2 size={24} className="text-[#c89b3c] animate-spin" />
                    : form.avatar_url ? <img src={form.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    : <User size={32} className="text-[#c89b3c]/50" strokeWidth={1} />}
                </div>
                <div className="flex-1">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#c89b3c]/50 rounded-lg text-sm text-[#1c1c1c]/70 hover:border-[#c89b3c] hover:text-[#8b2500] transition-colors disabled:opacity-50 w-full justify-center">
                    {uploading ? <><Loader2 size={16} className="animate-spin" />Đang tải lên...</> : <><Upload size={16} />{form.avatar_url ? 'Thay ảnh khác' : 'Chọn ảnh từ máy'}</>}
                  </button>
                  <p className="text-xs text-[#1c1c1c]/50 mt-1.5">JPG, PNG, WebP · Tối đa 5 MB</p>
                  {uploadError && <p className="text-xs text-[#8b2500] mt-1">{uploadError}</p>}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Tên tác giả <span className="text-[#8b2500]">*</span></label>
              <input className="w-full border border-[#c89b3c]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#c89b3c]"
                value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nguyễn Du" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Năm sinh – mất</label>
                <input className="w-full border border-[#c89b3c]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#c89b3c]"
                  value={form.birth_death_year} onChange={(e) => setForm((f) => ({ ...f, birth_death_year: e.target.value }))} placeholder="1765 – 1820" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Quê quán</label>
                <input className="w-full border border-[#c89b3c]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#c89b3c]"
                  value={form.hometown} onChange={(e) => setForm((f) => ({ ...f, hometown: e.target.value }))} placeholder="Hà Tĩnh" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Giới thiệu ngắn (hiển thị trên thẻ)</label>
              <textarea className="w-full border border-[#c89b3c]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#c89b3c] min-h-[80px] resize-y"
                value={form.bio_short} onChange={(e) => setForm((f) => ({ ...f, bio_short: e.target.value }))} placeholder="Mô tả ngắn hiển thị trên thẻ tác giả..." />
            </div>
          </div>
        )}

        {formTab === 'detail' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Cuộc Đời</label>
              <textarea className="w-full border border-[#c89b3c]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#c89b3c] min-h-[160px] resize-y"
                value={form.bio_life} onChange={(e) => setForm((f) => ({ ...f, bio_life: e.target.value }))}
                placeholder="Nguyễn Du sinh ngày... Ông lớn lên trong..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Phong Cách Sáng Tác</label>
              <textarea className="w-full border border-[#c89b3c]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#c89b3c] min-h-[160px] resize-y"
                value={form.bio_style} onChange={(e) => setForm((f) => ({ ...f, bio_style: e.target.value }))}
                placeholder="Phong cách thơ giàu cảm xúc, ngôn ngữ trong sáng..." />
            </div>
          </div>
        )}

        {formTab === 'media' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">YouTube Video Tư Liệu (ID)</label>
              <input className="w-full border border-[#c89b3c]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#c89b3c]"
                value={form.video_doc_id} onChange={(e) => setForm((f) => ({ ...f, video_doc_id: e.target.value }))}
                placeholder="dQw4w9WgXcQ  (chỉ nhập ID)" />
              <p className="text-xs text-[#1c1c1c]/50 mt-1">Ví dụ: https://youtube.com/watch?v=<b>dQw4w9WgXcQ</b></p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving || uploading || !form.name.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#c89b3c] text-[#1c1c1c] font-semibold rounded hover:bg-[#a07830] disabled:opacity-50 transition-colors"
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

/* ─────────────── Detail popup (click thẻ) ─────────────── */
function AuthorDetailModal({ author, onClose }: { author: Author; onClose: () => void }) {
  const [works, setWorks] = useState<Work[]>([]);
  const [loadingWorks, setLoadingWorks] = useState(true);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  useEffect(() => {
    supabase
      .from('works')
      .select('*, period:literary_periods(*), author:authors(*)')
      .eq('author_id', author.id)
      .order('composition_year', { ascending: true })
      .then(({ data }) => {
        setWorks(data || []);
        setLoadingWorks(false);
      });
  }, [author.id]);

  const TABS = [
    { key: 'life',  label: 'Cuộc Đời' },
    { key: 'style', label: 'Phong Cách' },
    { key: 'works', label: `Tác Phẩm${!loadingWorks && works.length ? ` (${works.length})` : ''}` },
    { key: 'media', label: 'Tư Liệu' },
  ] as const;
  type TabKey = typeof TABS[number]['key'];
  const [activeTab, setActiveTab] = useState<TabKey>('life');

  return (
    <div
      className="fixed inset-0 bg-black/85 z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#f4ecd8] rounded-2xl max-w-4xl w-full shadow-2xl my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header: Image + basic info ── */}
        <div className="flex flex-col md:flex-row rounded-t-2xl overflow-hidden">
          <div className="md:w-2/5 bg-[#2c241b] flex items-center justify-center min-h-[240px] md:min-h-[300px] relative flex-shrink-0">
            {author.avatar_url ? (
              <img src={author.avatar_url} alt={author.name} className="w-full h-full object-cover absolute inset-0" />
            ) : (
              <User className="w-28 h-28 text-[#c89b3c]" strokeWidth={1} />
            )}
          </div>
          <div className="flex-1 p-8 flex flex-col justify-center">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b2500] mb-1">Tác Giả</p>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1c1c1c] leading-tight tracking-wide">
                  {author.name}
                </h2>
                {author.birth_death_year && (
                  <p className="text-[#8b2500] font-semibold mt-2 tracking-wider">{author.birth_death_year}</p>
                )}
                {author.hometown && (
                  <p className="text-[#1c1c1c]/60 text-sm mt-1 flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#c89b3c]" />
                    {author.hometown}
                  </p>
                )}
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#2c241b]/10 flex items-center justify-center hover:bg-[#2c241b]/20 transition-colors flex-shrink-0 mt-1">
                <X size={16} className="text-[#1c1c1c]" />
              </button>
            </div>
            {author.bio_short && (
              <>
                <div className="w-16 h-px bg-[#c89b3c] mb-4" />
                <p className="text-[#1c1c1c]/80 leading-relaxed text-sm">{author.bio_short}</p>
              </>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="border-t border-[#c89b3c]/20 px-8 pt-5">
          <div className="flex gap-1 border-b border-[#c89b3c]/20 mb-6 overflow-x-auto">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === t.key ? 'border-[#c89b3c] text-[#8b2500]' : 'border-transparent text-[#1c1c1c]/60 hover:text-[#1c1c1c]'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab: Cuộc Đời */}
          {activeTab === 'life' && (
            <div className="pb-8 min-h-[160px]">
              {author.bio_life ? (
                <p className="text-[#1c1c1c]/80 leading-relaxed whitespace-pre-line">{author.bio_life}</p>
              ) : (
                <p className="text-[#1c1c1c]/40 italic">Chưa có thông tin cuộc đời.</p>
              )}
            </div>
          )}

          {/* Tab: Phong Cách */}
          {activeTab === 'style' && (
            <div className="pb-8 min-h-[160px]">
              {author.bio_style ? (
                <p className="text-[#1c1c1c]/80 leading-relaxed whitespace-pre-line">{author.bio_style}</p>
              ) : (
                <p className="text-[#1c1c1c]/40 italic">Chưa có thông tin phong cách sáng tác.</p>
              )}
            </div>
          )}

          {/* Tab: Tác Phẩm */}
          {activeTab === 'works' && (
            <div className="pb-8">
              {loadingWorks ? (
                <p className="text-[#1c1c1c]/40 text-sm italic">Đang tải tác phẩm...</p>
              ) : works.length === 0 ? (
                <p className="text-[#1c1c1c]/40 text-sm italic">Chưa có tác phẩm nào được liên kết.</p>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {works.map((w) => (
                    <button key={w.id}
                      onClick={() => setSelectedWork((prev) => (prev?.id === w.id ? null : w))}
                      className={`flex-shrink-0 w-44 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        selectedWork?.id === w.id
                          ? 'border-[#c89b3c] bg-[#2c241b] text-[#e0d8c8] shadow-lg'
                          : 'border-[#c89b3c]/30 bg-white text-[#1c1c1c] hover:border-[#c89b3c] hover:shadow'
                      }`}>
                      <p className="font-serif font-bold text-sm leading-snug line-clamp-2">{w.title}</p>
                      {w.genre && (
                        <p className={`text-xs mt-1.5 font-medium ${selectedWork?.id === w.id ? 'text-[#c89b3c]' : 'text-[#8b2500]'}`}>
                          {w.genre.name}
                        </p>
                      )}
                      {w.composition_year && (
                        <p className={`text-xs mt-0.5 ${selectedWork?.id === w.id ? 'text-[#e0d8c8]/60' : 'text-[#1c1c1c]/50'}`}>
                          {w.composition_year}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {selectedWork && (
                <div className="mt-6 bg-white/60 rounded-xl p-6 border border-[#c89b3c]/20">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h4 className="text-2xl font-serif font-bold text-[#1c1c1c] leading-tight">{selectedWork.title}</h4>
                    <button onClick={() => setSelectedWork(null)}
                      className="w-7 h-7 rounded-full bg-[#2c241b]/10 flex items-center justify-center hover:bg-[#2c241b]/20 transition-colors flex-shrink-0">
                      <X size={14} className="text-[#1c1c1c]" />
                    </button>
                  </div>
                  <WorkContentView work={selectedWork} />
                </div>
              )}
            </div>
          )}

          {/* Tab: Tư liệu */}
          {activeTab === 'media' && (
            <div className="pb-8 min-h-[160px]">
              {author.video_doc_id ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b2500] mb-4">Video Tư Liệu</p>
                  <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${author.video_doc_id}?rel=0&modestbranding=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen loading="lazy"
                    />
                  </div>
                </>
              ) : (
                <p className="text-[#1c1c1c]/40 italic">Chưa có video tư liệu.</p>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-8 pb-8">
          <button
            onClick={onClose}
            className="w-full px-8 py-3 bg-[#2c241b] text-[#e0d8c8] uppercase tracking-widest text-sm font-semibold rounded-lg hover:bg-[#c89b3c] hover:text-[#1c1c1c] transition-colors duration-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Tooltip preview (hover 1s) ─────────────── */
function AuthorTooltip({ author, pos }: { author: Author; pos: { x: number; y: number } }) {
  // Position: try to appear above/right of cursor, clamp to viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(pos.x + 16, window.innerWidth - 260),
    top: Math.max(pos.y - 20, 8),
    zIndex: 60,
    pointerEvents: 'none',
  };

  return (
    <div style={style}>
      <div className="w-56 bg-[#1a1a1a]/95 backdrop-blur-sm border border-[#c89b3c]/30 rounded-xl shadow-2xl overflow-hidden animate-[fadeIn_0.15s_ease]">
        {author.avatar_url ? (
          <div className="h-32 overflow-hidden">
            <img src={author.avatar_url} alt={author.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-24 bg-[#2c241b] flex items-center justify-center">
            <User size={36} className="text-[#c89b3c]" strokeWidth={1} />
          </div>
        )}
        <div className="p-3">
          <p className="font-serif font-bold text-[#e0d8c8] leading-tight">{author.name}</p>
          {author.birth_death_year && (
            <p className="text-[#c89b3c] text-xs mt-0.5 font-medium">{author.birth_death_year}</p>
          )}
          {author.bio_short && (
            <p className="text-[#e0d8c8]/60 text-xs mt-1.5 leading-relaxed line-clamp-2">
              {author.bio_short}
            </p>
          )}
          <p className="text-[#c89b3c]/50 text-xs mt-2 italic">Nhấn để xem chi tiết</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Author card with hover + click ─────────────── */
function AuthorCard({
  author,
  isEditMode,
  onEdit,
  onDelete,
  onClick,
}: {
  author: Author;
  isEditMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseEnter(e: React.MouseEvent) {
    if (isEditMode) return;
    const x = e.clientX;
    const y = e.clientY;
    hoverTimer.current = setTimeout(() => {
      setTooltip({ x, y });
    }, 1000);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (tooltip) {
      setTooltip({ x: e.clientX, y: e.clientY });
    }
  }

  function handleMouseLeave() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setTooltip(null);
  }

  return (
    <>
      <div
        ref={cardRef}
        className="spotlight-hover bg-[#f4ecd8] rounded-lg overflow-hidden relative group cursor-pointer"
        onClick={() => !isEditMode && onClick()}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {isEditMode && (
          <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="w-8 h-8 bg-[#c89b3c] rounded-full flex items-center justify-center hover:bg-[#a07830] transition-colors shadow"
              title="Sửa tác giả"
            >
              <Pencil size={14} className="text-[#1a1a1a]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-8 h-8 bg-[#8b2500] rounded-full flex items-center justify-center hover:bg-[#6b1a00] transition-colors shadow"
              title="Xóa tác giả"
            >
              <Trash2 size={14} className="text-white" />
            </button>
          </div>
        )}

        <div className="aspect-[3/4] bg-[#2c241b] flex items-center justify-center overflow-hidden">
          {author.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.name}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          ) : (
            <User className="w-16 h-16 text-[#c89b3c]" strokeWidth={1} />
          )}
        </div>

        <div className="p-4">
          <h3 className="text-base font-serif font-bold text-[#1c1c1c] mb-1 tracking-wide uppercase">
            {author.name}
          </h3>
          {author.birth_death_year && (
            <p className="text-xs text-[#8b2500] font-medium mb-2 tracking-wider">
              {author.birth_death_year}
            </p>
          )}
          {author.bio_short && (
            <p className="text-sm text-[#1c1c1c]/80 leading-relaxed line-clamp-2">
              {author.bio_short}
            </p>
          )}
          {isEditMode && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="mt-3 flex items-center gap-1.5 text-sm text-[#8b2500] hover:text-[#c89b3c] transition-colors font-medium"
            >
              <Pencil size={13} />
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>

      {tooltip && <AuthorTooltip author={author} pos={tooltip} />}
    </>
  );
}

/* ─────────────── Main section ─────────────── */
export function AuthorsSection() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAuthor, setModalAuthor] = useState<Author | null | 'new'>(null);
  const [detailAuthor, setDetailAuthor] = useState<Author | null>(null);
  const { isEditMode } = useEditMode();

  useEffect(() => {
    fetchAuthors();
  }, []);

  async function fetchAuthors() {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAuthors(data || []);
    } catch (error) {
      console.error('Error fetching authors:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(author: Author) {
    if (!confirm(`Xóa tác giả "${author.name}"? Hành động này không thể hoàn tác.`)) return;
    // Also remove avatar from storage
    if (author.avatar_url) {
      const path = author.avatar_url.split(`${STORAGE_BUCKET}/`)[1];
      if (path) await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    }
    const { error } = await supabase.from('authors').delete().eq('id', author.id);
    if (error) { alert('Lỗi khi xóa!'); return; }
    fetchAuthors();
  }

  if (loading) {
    return (
      <section id="authors" className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-pulse text-[#c89b3c]">Đang tải...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="authors" className="py-20 px-4 bg-gradient-to-b from-[#1a1a1a] to-[#2c241b]">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-[#c89b3c] tracking-wider uppercase mb-4">
            Những Ngọn Đèn Văn Chương
          </h2>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#c89b3c] to-transparent mx-auto mb-6"></div>
          <p className="text-xl text-[#e0d8c8]/80 max-w-2xl mx-auto">
            Gặp gỡ những tác giả kiệt xuất đã để lại dấu ấn sâu đậm trong lịch sử văn học Việt Nam
          </p>
        </div>

        {isEditMode && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setModalAuthor('new')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#c89b3c] text-[#1a1a1a] font-semibold rounded-lg hover:bg-[#a07830] transition-colors shadow-lg"
            >
              <Plus size={18} />
              Thêm tác giả
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {authors.map((author) => (
            <AuthorCard
              key={author.id}
              author={author}
              isEditMode={isEditMode}
              onEdit={() => setModalAuthor(author)}
              onDelete={() => handleDelete(author)}
              onClick={() => setDetailAuthor(author)}
            />
          ))}
        </div>

        {authors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#e0d8c8]/60 text-lg">
              Chưa có dữ liệu tác giả.{' '}
              {isEditMode && (
                <button onClick={() => setModalAuthor('new')} className="text-[#c89b3c] underline">
                  Thêm tác giả đầu tiên
                </button>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Detail popup */}
      {detailAuthor && (
        <AuthorDetailModal author={detailAuthor} onClose={() => setDetailAuthor(null)} />
      )}

      {/* Edit / Add modal */}
      {modalAuthor !== null && (
        <AuthorModal
          author={modalAuthor === 'new' ? null : modalAuthor}
          onClose={() => setModalAuthor(null)}
          onSaved={fetchAuthors}
        />
      )}
    </section>
  );
}
