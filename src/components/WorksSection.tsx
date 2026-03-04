import { useEffect, useRef, useState } from 'react';
import { supabase, type Work, type Author, type LiteraryPeriod, type Genre, type RefLink } from '../lib/supabase';
import { WorkContentView } from './WorkContentView';
import { BookMarked, MapPin, Video, Pencil, Trash2, Plus, X, Save, Image, Clock, ExternalLink, Upload, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEditMode } from '../context/EditContext';

const COVER_BUCKET = 'work-covers';

type WorkFormData = {
  title: string;
  author_id: string;
  period_id: string;
  genre_id: string;
  excerpt: string;
  cover_image_url: string;
  writing_context: string;
  content_summary: string;
  art_features: string;
  significance: string;
  content_html: string;
  youtube_embed_id: string;
  map_coordinates: string;
  composition_year: string;
  reference_links: RefLink[];
  content_type: 'prose' | 'poem';
};

type AssetRow = { id?: string; catbox_url: string; asset_type: string; description: string };

function WorkModal({
  work,
  onClose,
  onSaved,
}: {
  work: Work | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<WorkFormData>({
    title: work?.title ?? '',
    author_id: work?.author_id ?? '',
    period_id: work?.period_id ?? '',
    genre_id: work?.genre_id ?? '',
    excerpt: work?.excerpt ?? '',
    cover_image_url: work?.cover_image_url ?? '',
    writing_context: work?.writing_context ?? '',
    content_summary: work?.content_summary ?? '',
    art_features: work?.art_features ?? '',
    significance: work?.significance ?? '',
    content_html: work?.content_html ?? '',
    youtube_embed_id: work?.youtube_embed_id ?? '',
    map_coordinates: work?.map_coordinates ?? '',
    composition_year: work?.composition_year ?? '',
    reference_links: work?.reference_links ?? [],
    content_type: (work?.content_type as 'prose' | 'poem') ?? 'prose',
  });
  const [authors, setAuthors] = useState<Author[]>([]);
  const [periods, setPeriods] = useState<LiteraryPeriod[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [newGenreName, setNewGenreName] = useState('');
  const [addingGenre, setAddingGenre] = useState(false);
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [newAsset, setNewAsset] = useState<AssetRow>({ catbox_url: '', asset_type: 'image', description: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<'info' | 'analysis' | 'extra' | 'media'>('info');

  async function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadError('Chỉ chấp nhận file ảnh'); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Ảnh phải nhỏ hơn 5 MB'); return; }
    setUploadError('');
    setUploading(true);
    try {
      // Xóa ảnh cũ nếu đang sửa
      if (work?.cover_image_url) {
        const oldPath = decodeURIComponent(
          work.cover_image_url.split(`/object/public/${COVER_BUCKET}/`)[1] ?? ''
        );
        if (oldPath) await supabase.storage.from(COVER_BUCKET).remove([oldPath]);
      }
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from(COVER_BUCKET)
        .upload(fileName, file, { upsert: false, contentType: file.type });
      if (uploadErr) throw uploadErr;
      const { data } = supabase.storage.from(COVER_BUCKET).getPublicUrl(fileName);
      setForm((f) => ({ ...f, cover_image_url: data.publicUrl }));
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Lỗi upload ảnh!');
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    supabase.from('authors').select('id,name').order('name').then(({ data }) => setAuthors(data || []));
    supabase.from('literary_periods').select('id,period_name').order('start_year').then(({ data }) => setPeriods(data || []));
    supabase.from('genres').select('*').order('sort_order').order('name').then(({ data }) => setGenres(data || []));
    if (work?.id) {
      supabase
        .from('multimedia_assets')
        .select('*')
        .eq('work_id', work.id)
        .then(({ data }) => setAssets((data || []).map((a) => ({ id: a.id, catbox_url: a.catbox_url, asset_type: a.asset_type, description: a.description || '' }))));
    }
  }, [work?.id]);

  async function handleAddGenre() {
    if (!newGenreName.trim()) return;
    setAddingGenre(true);
    const { data, error } = await supabase.from('genres')
      .insert({ name: newGenreName.trim(), sort_order: genres.length })
      .select().single();
    if (!error && data) {
      setGenres((g) => [...g, data]);
      setForm((f) => ({ ...f, genre_id: data.id }));
    }
    setNewGenreName('');
    setAddingGenre(false);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      let workId = work?.id;
      if (work) {
        const { error } = await supabase
          .from('works')
          .update({
            title: form.title.trim(),
            author_id: form.author_id || null,
            period_id: form.period_id || null,
            genre_id: form.genre_id || null,
            excerpt: form.excerpt.trim() || null,
            cover_image_url: form.cover_image_url.trim() || null,
            writing_context: form.writing_context.trim() || null,
            content_summary: form.content_summary.trim() || null,
            art_features: form.art_features.trim() || null,
            significance: form.significance.trim() || null,
            content_html: form.content_html.trim() || null,
            youtube_embed_id: form.youtube_embed_id.trim() || null,
            map_coordinates: form.map_coordinates.trim() || null,
            composition_year: form.composition_year.trim() || null,
            reference_links: form.reference_links.filter((r) => r.url.trim()),
            content_type: form.content_type,
          })
          .eq('id', work.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('works')
          .insert({
            title: form.title.trim(),
            author_id: form.author_id || null,
            period_id: form.period_id || null,
            genre_id: form.genre_id || null,
            excerpt: form.excerpt.trim() || null,
            cover_image_url: form.cover_image_url.trim() || null,
            writing_context: form.writing_context.trim() || null,
            content_summary: form.content_summary.trim() || null,
            art_features: form.art_features.trim() || null,
            significance: form.significance.trim() || null,
            content_html: form.content_html.trim() || null,
            youtube_embed_id: form.youtube_embed_id.trim() || null,
            map_coordinates: form.map_coordinates.trim() || null,
            composition_year: form.composition_year.trim() || null,
            reference_links: form.reference_links.filter((r) => r.url.trim()),
            content_type: form.content_type,
          })
          .select('id')
          .single();
        if (error) throw error;
        workId = data.id;
      }
      // Sync assets: delete removed, insert new
      if (workId) {
        const existingIds = assets.filter((a) => a.id).map((a) => a.id!);
        // Delete all old assets and re-insert (simple approach)
        await supabase.from('multimedia_assets').delete().eq('work_id', workId);
        const toInsert = assets.filter((a) => a.catbox_url.trim()).map((a) => ({
          work_id: workId,
          catbox_url: a.catbox_url.trim(),
          asset_type: a.asset_type,
          description: a.description.trim() || null,
        }));
        if (toInsert.length > 0) {
          await supabase.from('multimedia_assets').insert(toInsert);
        }
        void existingIds;
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

  function addAsset() {
    if (!newAsset.catbox_url.trim()) return;
    setAssets((a) => [...a, { ...newAsset }]);
    setNewAsset({ catbox_url: '', asset_type: 'image', description: '' });
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#eff4fc] rounded-lg max-w-2xl w-full p-4 md:p-8 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-serif font-bold text-[#1c1c1c]">
            {work ? 'Sửa Tác Phẩm' : 'Thêm Tác Phẩm'}
          </h3>
          <button onClick={onClose} className="text-[#1c1c1c]/50 hover:text-[#1c1c1c] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#3b82c4]/30 overflow-x-auto">
          {(['info', 'analysis', 'extra', 'media'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-[#3b82c4] text-[#1a4f99]'
                  : 'border-transparent text-[#1c1c1c]/60 hover:text-[#1c1c1c]'
              }`}
            >
              {t === 'info' ? 'Thông tin' : t === 'analysis' ? 'Phân tích' : t === 'extra' ? 'Tư liệu' : 'Ảnh / Video'}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">
                Tên tác phẩm <span className="text-[#1a4f99]">*</span>
              </label>
              <input
                className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4]"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Truyện Kiều"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Tác giả</label>
                <select
                  className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4]"
                  value={form.author_id}
                  onChange={(e) => setForm((f) => ({ ...f, author_id: e.target.value }))}
                >
                  <option value="">-- Chọn tác giả --</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Giai đoạn</label>
                <select
                  className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4]"
                  value={form.period_id}
                  onChange={(e) => setForm((f) => ({ ...f, period_id: e.target.value }))}
                >
                  <option value="">-- Chọn giai đoạn --</option>
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>{p.period_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Thể loại</label>
              <select
                className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4]"
                value={form.genre_id}
                onChange={(e) => setForm((f) => ({ ...f, genre_id: e.target.value }))}
              >
                <option value="">-- Chọn thể loại --</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <div className="flex gap-2 mt-2">
                <input
                  className="flex-1 border border-[#3b82c4]/40 rounded px-3 py-1.5 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4] text-sm"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGenre()}
                  placeholder="Tạo thể loại mới..."
                />
                <button type="button" onClick={handleAddGenre} disabled={!newGenreName.trim() || addingGenre}
                  className="px-3 py-1.5 bg-[#3b82c4] text-[#1a1a1a] text-sm font-semibold rounded hover:bg-[#2d6db5] disabled:opacity-40 transition-colors whitespace-nowrap">
                  + Thêm
                </button>
              </div>
            </div>

            {/* Ảnh bìa */}
            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Ảnh bìa</label>
              <input ref={coverFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFileChange} />
              <div className="flex items-start gap-3">
                {form.cover_image_url ? (
                  <img src={form.cover_image_url} alt="cover" className="w-20 h-28 object-cover rounded border border-[#3b82c4]/30 flex-shrink-0" />
                ) : (
                  <div className="w-20 h-28 rounded border-2 border-dashed border-[#3b82c4]/30 flex items-center justify-center flex-shrink-0">
                    <BookMarked size={24} className="text-[#3b82c4]/40" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <button type="button" onClick={() => coverFileInputRef.current?.click()} disabled={uploading}
                    className="w-full px-3 py-2 border border-[#3b82c4]/40 rounded text-sm text-[#1c1c1c] hover:border-[#3b82c4] transition-colors disabled:opacity-50">
                    {uploading ? 'Đang tải...' : 'Chọn ảnh từ thiết bị'}
                  </button>
                  <input
                    className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4] text-sm"
                    value={form.cover_image_url}
                    onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))}
                    placeholder="hoặc dán URL ảnh..."
                  />
                  {uploadError && <p className="text-xs text-[#1a4f99]">{uploadError}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Trích dẫn nổi bật</label>
              <textarea
                className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4] min-h-[80px] resize-y"
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="Trăm năm trong cõi người ta..."
              />
            </div>
          </div>
        )}

        {tab === 'analysis' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Hoàn cảnh sáng tác</label>
              <p className="text-xs text-[#1c1c1c]/50 mb-1.5">Bối cảnh lịch sử, cuộc đời tác giả khi viết tác phẩm</p>
              <textarea
                className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4] min-h-[100px] resize-y"
                value={form.writing_context}
                onChange={(e) => setForm((f) => ({ ...f, writing_context: e.target.value }))}
                placeholder="Truyện Kiều được Nguyễn Du sáng tác vào đầu thế kỷ XIX, trong bối cảnh..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Nội dung (tóm tắt)</label>
              <p className="text-xs text-[#1c1c1c]/50 mb-1.5">Tóm tắt cốt truyện, chủ đề, tư tưởng chính</p>
              <textarea
                className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4] min-h-[120px] resize-y"
                value={form.content_summary}
                onChange={(e) => setForm((f) => ({ ...f, content_summary: e.target.value }))}
                placeholder="Truyện kể về cuộc đời đầy bi kịch của Thúy Kiều..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Đặc sắc nghệ thuật</label>
              <p className="text-xs text-[#1c1c1c]/50 mb-1.5">Ngôn ngữ, thể thơ, hình ảnh, biện pháp nghệ thuật tiêu biểu</p>
              <textarea
                className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4] min-h-[100px] resize-y"
                value={form.art_features}
                onChange={(e) => setForm((f) => ({ ...f, art_features: e.target.value }))}
                placeholder="Sử dụng thể thơ lục bát truyền thống, ngôn ngữ tinh tế giàu hình ảnh..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Ý nghĩa / Giá trị</label>
              <p className="text-xs text-[#1c1c1c]/50 mb-1.5">Giá trị nhân đạo, hiện thực, vị trí trong văn học dân tộc</p>
              <textarea
                className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4] min-h-[100px] resize-y"
                value={form.significance}
                onChange={(e) => setForm((f) => ({ ...f, significance: e.target.value }))}
                placeholder="Truyện Kiều là đỉnh cao của văn học cổ điển Việt Nam, thể hiện tinh thần nhân đạo sâu sắc..."
              />
            </div>
          </div>
        )}

        {tab === 'extra' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">
                <span className="flex items-center gap-1.5"><Clock size={13} />Năm / Giai đoạn sáng tác</span>
              </label>
              <input
                className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4]"
                value={form.composition_year}
                onChange={(e) => setForm((f) => ({ ...f, composition_year: e.target.value }))}
                placeholder="1813–1820"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Nội dung chi tiết</label>
              {/* Loại văn bản */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-[#1c1c1c]/60">Kiểu văn bản:</span>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, content_type: 'prose' }))}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                    form.content_type === 'prose'
                      ? 'bg-[#1a4f99] text-white border-[#1a4f99]'
                      : 'bg-white text-[#1c1c1c]/60 border-[#3b82c4]/40 hover:border-[#3b82c4]'
                  }`}
                >
                  ═ Truyện (căn 2 bên)
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, content_type: 'poem' }))}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                    form.content_type === 'poem'
                      ? 'bg-[#1a4f99] text-white border-[#1a4f99]'
                      : 'bg-white text-[#1c1c1c]/60 border-[#3b82c4]/40 hover:border-[#3b82c4]'
                  }`}
                >
                  ≣ Thơ (căn giữa)
                </button>
              </div>
              <textarea
                className={`w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4] min-h-[180px] resize-y ${
                  form.content_type === 'poem' ? 'text-center' : 'text-justify'
                }`}
                value={form.content_html}
                onChange={(e) => setForm((f) => ({ ...f, content_html: e.target.value }))}
                placeholder="Nhập toàn bộ nội dung văn bản ở đây... Hỗ trợ # Tiêu đề, ## Tiêu đề 2, - danh sách"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">YouTube Embed ID</label>
                <input
                  className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4]"
                  value={form.youtube_embed_id}
                  onChange={(e) => setForm((f) => ({ ...f, youtube_embed_id: e.target.value }))}
                  placeholder="dQw4w9WgXcQ"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1c1c1c] mb-1">Tọa độ bản đồ</label>
                <input
                  className="w-full border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4]"
                  value={form.map_coordinates}
                  onChange={(e) => setForm((f) => ({ ...f, map_coordinates: e.target.value }))}
                  placeholder="16.0544,108.2022"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1c1c1c] mb-2">
                <span className="flex items-center gap-1.5"><ExternalLink size={13} />Tài liệu tham khảo</span>
              </label>
              <div className="space-y-2">
                {form.reference_links.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className="flex-1 border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4] text-sm"
                      value={link.title}
                      onChange={(e) => setForm((f) => {
                        const links = [...f.reference_links];
                        links[i] = { ...links[i], title: e.target.value };
                        return { ...f, reference_links: links };
                      })}
                      placeholder="Tiêu đề"
                    />
                    <input
                      className="flex-1 border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4] text-sm"
                      value={link.url}
                      onChange={(e) => setForm((f) => {
                        const links = [...f.reference_links];
                        links[i] = { ...links[i], url: e.target.value };
                        return { ...f, reference_links: links };
                      })}
                      placeholder="https://..."
                    />
                    <button
                      onClick={() => setForm((f) => ({ ...f, reference_links: f.reference_links.filter((_, j) => j !== i) }))}
                      className="text-[#1a4f99] hover:text-[#143d7a] flex-shrink-0 px-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setForm((f) => ({ ...f, reference_links: [...f.reference_links, { title: '', url: '' }] }))}
                  className="flex items-center gap-1.5 text-sm text-[#1a4f99] hover:text-[#3b82c4] transition-colors"
                >
                  <Plus size={14} /> Thêm liên kết
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'media' && (
          <div className="space-y-4">
            <p className="text-sm text-[#1c1c1c]/60">Thêm ảnh hoặc tài nguyên media cho tác phẩm.</p>

            {/* Existing assets */}
            <div className="space-y-2">
              {assets.map((asset, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded p-3 border border-[#3b82c4]/20">
                  {asset.asset_type === 'image' ? (
                    <img src={asset.catbox_url} className="w-12 h-12 object-cover rounded flex-shrink-0" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <Video size={24} className="text-[#1a4f99] flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#1c1c1c]/60 truncate">{asset.catbox_url}</p>
                    <p className="text-sm text-[#1c1c1c]">{asset.description || <span className="italic text-[#1c1c1c]/40">Không có mô tả</span>}</p>
                  </div>
                  <span className="text-xs bg-[#3b82c4]/20 text-[#1a4f99] px-2 py-0.5 rounded">{asset.asset_type}</span>
                  <button
                    onClick={() => setAssets((a) => a.filter((_, j) => j !== i))}
                    className="text-[#1a4f99] hover:text-[#143d7a] flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new asset */}
            <div className="border border-dashed border-[#3b82c4]/40 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-[#1c1c1c]">Thêm media mới</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4] text-sm col-span-2"
                  value={newAsset.catbox_url}
                  onChange={(e) => setNewAsset((a) => ({ ...a, catbox_url: e.target.value }))}
                  placeholder="URL ảnh/video (https://...)"
                />
                <select
                  className="border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4] text-sm"
                  value={newAsset.asset_type}
                  onChange={(e) => setNewAsset((a) => ({ ...a, asset_type: e.target.value }))}
                >
                  <option value="image">Ảnh</option>
                  <option value="video">Video</option>
                  <option value="audio">Âm thanh</option>
                  <option value="document">Tài liệu</option>
                </select>
                <input
                  className="border border-[#3b82c4]/40 rounded px-3 py-2 bg-white text-[#1c1c1c] focus:outline-none focus:border-[#3b82c4] text-sm"
                  value={newAsset.description}
                  onChange={(e) => setNewAsset((a) => ({ ...a, description: e.target.value }))}
                  placeholder="Mô tả (tùy chọn)"
                />
              </div>
              <button
                onClick={addAsset}
                disabled={!newAsset.catbox_url.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#1b2d47] text-[#ccd8ef] text-sm rounded hover:bg-[#3b82c4] hover:text-[#1c1c1c] disabled:opacity-40 transition-colors"
              >
                <Image size={14} />
                Thêm vào danh sách
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving || uploading || !form.title.trim()}
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

export function WorksSection() {
  const [works, setWorks] = useState<Work[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [modalWork, setModalWork] = useState<Work | null | 'new'>(null);
  const { isEditMode } = useEditMode();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollButtons() {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  function scrollCarousel(dir: 'left' | 'right') {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: 'smooth' });
  }

  useEffect(() => {
    fetchWorks();
    supabase.from('genres').select('*').order('sort_order').order('name')
      .then(({ data }) => setGenres(data || []));
  }, []);

  useEffect(() => {
    // Reset scroll and update buttons when filter changes
    if (carouselRef.current) carouselRef.current.scrollLeft = 0;
    setTimeout(updateScrollButtons, 50);
  }, [selectedGenreId, works]);

  async function fetchWorks() {
    try {
      const { data, error } = await supabase
        .from('works')
        .select(`*, author:authors(*), period:literary_periods(*), genre:genres(*)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setWorks(data || []);
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(work: Work) {
    if (!confirm(`Xóa tác phẩm "${work.title}"?`)) return;
    const { error } = await supabase.from('works').delete().eq('id', work.id);
    if (error) { alert('Lỗi khi xóa!'); return; }
    fetchWorks();
  }

  if (loading) {
    return (
      <section id="works" className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-pulse text-[#3b82c4]">Đang tải...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="works" className="py-20 px-4 bg-[#1a1a1a]">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-[#3b82c4] tracking-wider uppercase mb-4">
            Kho Tàng Tác Phẩm
          </h2>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#3b82c4] to-transparent mx-auto mb-6"></div>
          <p className="text-base md:text-xl text-[#ccd8ef]/80 max-w-2xl mx-auto mb-8">
            Những tác phẩm bất hủ trong chương trình văn học THCS
          </p>

          {/* Genre filter tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedGenreId(null)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                selectedGenreId === null
                  ? 'bg-[#3b82c4] text-[#1a1a1a] shadow-lg shadow-[#3b82c4]/30'
                  : 'bg-[#1b2d47] text-[#ccd8ef]/70 hover:text-[#ccd8ef] hover:bg-[#3a2f24]'
              }`}
            >
              Tất cả
            </button>
            {genres.map((g) => (
              <button key={g.id}
                onClick={() => setSelectedGenreId(g.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedGenreId === g.id
                    ? 'bg-[#3b82c4] text-[#1a1a1a] shadow-lg shadow-[#3b82c4]/30'
                    : 'bg-[#1b2d47] text-[#ccd8ef]/70 hover:text-[#ccd8ef] hover:bg-[#3a2f24]'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {isEditMode && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setModalWork('new')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3b82c4] text-[#1a1a1a] font-semibold rounded-lg hover:bg-[#2d6db5] transition-colors shadow-lg"
            >
              <Plus size={18} />
              Thêm tác phẩm
            </button>
          </div>
        )}

        {works.filter((w) => selectedGenreId === null || w.genre_id === selectedGenreId).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#ccd8ef]/60 text-lg">
              Chưa có dữ liệu tác phẩm.{' '}
              {isEditMode && (
                <button onClick={() => setModalWork('new')} className="text-[#3b82c4] underline">
                  Thêm tác phẩm đầu tiên
                </button>
              )}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Left arrow */}
            <button
              onClick={() => scrollCarousel('left')}
              disabled={!canScrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-5 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#3b82c4] text-[#1a1a1a] hidden sm:flex items-center justify-center shadow-xl hover:bg-[#2d6db5] transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none"
              aria-label="Cuộn trái"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Scroll container */}
            <div
              ref={carouselRef}
              onScroll={updateScrollButtons}
              className="flex gap-5 overflow-x-auto scroll-smooth pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
          {works
            .filter((w) => selectedGenreId === null || w.genre_id === selectedGenreId)
            .map((work) => (
            <div
              key={work.id}
              className="flex-none w-52"
            >
            <div
              className="spotlight-hover bg-[#eff4fc] rounded-lg overflow-hidden relative group cursor-pointer h-full"
              onClick={() => !isEditMode && setSelectedWork(work)}
            >
              {isEditMode && (
                <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); setModalWork(work); }}
                    className="w-8 h-8 bg-[#3b82c4] rounded-full flex items-center justify-center hover:bg-[#2d6db5] transition-colors shadow"
                    title="Sửa tác phẩm"
                  >
                    <Pencil size={14} className="text-[#1a1a1a]" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(work); }}
                    className="w-8 h-8 bg-[#1a4f99] rounded-full flex items-center justify-center hover:bg-[#143d7a] transition-colors shadow"
                    title="Xóa tác phẩm"
                  >
                    <Trash2 size={14} className="text-white" />
                  </button>
                </div>
              )}

              {/* Ảnh bìa – giống thẻ tác giả */}
              <div className="aspect-[3/4] bg-[#1b2d47] flex items-center justify-center overflow-hidden">
                {work.cover_image_url ? (
                  <img
                    src={work.cover_image_url}
                    alt={work.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                ) : (
                  <BookMarked className="w-16 h-16 text-[#3b82c4]" strokeWidth={1} />
                )}
              </div>

              <div className="p-4">
                <h3 className="text-base font-serif font-bold text-[#1c1c1c] mb-1 tracking-wide uppercase">
                  {work.title}
                </h3>
                {work.author && (
                  <p className="text-xs text-[#1a4f99] font-medium mb-2 tracking-wider">
                    {work.author.name}
                  </p>
                )}
                {work.genre && (
                  <span className="inline-block px-2 py-0.5 bg-[#3b82c4]/15 text-[#1a4f99] rounded text-xs font-medium border border-[#3b82c4]/30 mb-2">
                    {work.genre.name}
                  </span>
                )}

                {(work.period || work.composition_year) && (
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {work.period && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#1b2d47] text-[#ccd8ef] rounded text-xs">
                        {work.period.period_name}
                      </span>
                    )}
                    {work.composition_year && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#3b82c4]/15 text-[#1a4f99] rounded text-xs font-medium border border-[#3b82c4]/30">
                        <Clock size={10} />
                        {work.composition_year}
                      </span>
                    )}
                  </div>
                )}

                {work.excerpt && (
                  <p className="text-[#1c1c1c]/80 italic leading-relaxed line-clamp-2 border-l-4 border-[#3b82c4] pl-3 text-xs">
                    "{work.excerpt}"
                  </p>
                )}

                {isEditMode && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setModalWork(work); }}
                    className="mt-3 flex items-center gap-1.5 text-sm text-[#1a4f99] hover:text-[#3b82c4] transition-colors font-medium"
                  >
                    <Pencil size={13} />
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>
            </div>
          ))}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => scrollCarousel('right')}
              disabled={!canScrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-5 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#3b82c4] text-[#1a1a1a] hidden sm:flex items-center justify-center shadow-xl hover:bg-[#2d6db5] transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none"
              aria-label="Cuộn phải"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </div>

      {selectedWork && (
        <WorkDetailModal work={selectedWork} onClose={() => setSelectedWork(null)} />
      )}

      {modalWork !== null && (
        <WorkModal
          work={modalWork === 'new' ? null : modalWork}
          onClose={() => setModalWork(null)}
          onSaved={fetchWorks}
        />
      )}
    </section>
  );
}

export function WorkDetailModal({ work, onClose }: { work: Work; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/90 z-[60] flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="modal-enter bg-[#eff4fc] rounded-2xl max-w-4xl w-full shadow-2xl my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1a4f99] mb-1">
                Tác Phẩm
              </p>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#1c1c1c] leading-tight mb-2">
                {work.title}
              </h2>
              {work.author && (
                <p className="text-base md:text-xl text-[#1a4f99] font-semibold">
                  {work.author.name}
                </p>
              )}
              {work.genre && (
                <span className="inline-block mt-2 px-3 py-1 bg-[#3b82c4]/15 text-[#1a4f99] rounded-full text-sm font-medium border border-[#3b82c4]/30">
                  {work.genre.name}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#1b2d47]/10 flex items-center justify-center hover:bg-[#1b2d47]/20 transition-colors flex-shrink-0"
            >
              <X size={18} className="text-[#1c1c1c]" />
            </button>
          </div>

          <div className="w-24 h-px bg-[#3b82c4] mb-6" />

          <WorkContentView work={work} />

          <button
            onClick={onClose}
            className="w-full mt-8 px-8 py-4 bg-[#1b2d47] text-[#ccd8ef] uppercase tracking-widest font-semibold rounded-lg hover:bg-[#3b82c4] hover:text-[#1c1c1c] transition-colors duration-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

