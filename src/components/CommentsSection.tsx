import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, BookOpen, Quote, User, Clock, Loader2, CheckCircle2, ChevronDown, Globe, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Comment, Work } from '../lib/supabase';

type TopicType = 'work' | 'museum' | 'other';

/* ─── helpers ─── */
function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

const ROTATIONS = [-2, 1.5, -1, 2.5, -1.5, 1, -2.5, 0.5];
const CARD_ACCENTS = [
  'border-l-[#3b82c4]',
  'border-l-[#1a4f99]',
  'border-l-[#2d6db5]',
  'border-l-[#143d7a]',
];

/* ─── comment wall card ─── */
function CommentCard({ comment, index, isNew }: { comment: Comment; index: number; isNew?: boolean }) {
  const rot = ROTATIONS[index % ROTATIONS.length];
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
  const delay = `${(index % 8) * 80}ms`;

  return (
    <div
      className={`relative bg-[#eff4fc] rounded-xl border-l-4 ${accent} p-4 shadow-md
        ${isNew ? 'animate-[newComment_0.5s_cubic-bezier(0.34,1.4,0.64,1)_both]' : 'animate-[cardReveal_0.45s_ease_both]'}
        overflow-hidden group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
      style={{
        transform: `rotate(${rot}deg)`,
        animationDelay: isNew ? '0ms' : delay,
      }}
    >
      {/* big quote watermark */}
      <Quote
        className="absolute -top-1 -right-1 w-14 h-14 text-[#3b82c4]/10 group-hover:text-[#3b82c4]/20 transition-colors"
        strokeWidth={1}
      />

      {/* topic badge */}
      {(comment.work || comment.topic) && (
        <div className="flex items-center gap-1.5 mb-2">
          {comment.work
            ? <BookOpen size={11} className="text-[#3b82c4] flex-shrink-0" />
            : comment.topic === 'Bảo tàng văn học'
              ? <Globe size={11} className="text-[#3b82c4] flex-shrink-0" />
              : <HelpCircle size={11} className="text-[#3b82c4] flex-shrink-0" />}
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#1a4f99] truncate">
            {comment.work ? comment.work.title : comment.topic}
          </span>
        </div>
      )}

      {/* body */}
      <p className="text-sm text-[#1c1c1c]/85 leading-relaxed line-clamp-4 relative z-10">
        "{comment.body}"
      </p>

      {/* footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#3b82c4]/15">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#1b2d47] flex items-center justify-center">
            <User size={10} className="text-[#3b82c4]" />
          </div>
          <span className="text-xs font-semibold text-[#1c1c1c]/70">{comment.author_name}</span>
        </div>
        <div className="flex items-center gap-1 text-[#1c1c1c]/40">
          <Clock size={10} />
          <span className="text-[10px]">{timeAgo(comment.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── main section ─── */
export function CommentsSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [works, setWorks] = useState<Pick<Work, 'id' | 'title'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  // form
  const [name, setName] = useState('');
  const [topicType, setTopicType] = useState<TopicType>('work');
  const [workId, setWorkId] = useState('');
  const [topicOther, setTopicOther] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const wallRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  /* load comments + works */
  useEffect(() => {
    async function load() {
      const [cRes, wRes] = await Promise.all([
        supabase
          .from('comments')
          .select('*, work:works(id, title)')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('works')
          .select('id, title')
          .order('title', { ascending: true }),
      ]);
      setComments(cRes.data || []);
      setWorks(wRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  /* realtime – subscribe to new comments */
  useEffect(() => {
    const channel = supabase
      .channel('comments-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        async (payload) => {
          const newId = (payload.new as { id: string }).id;
          const { data } = await supabase
            .from('comments')
            .select('*, work:works(id, title)')
            .eq('id', newId)
            .single();
          if (data) {
            setComments((prev) => [data, ...prev]);
            setNewIds((s) => new Set(s).add(data.id));
            setTimeout(() => setNewIds((s) => { const c = new Set(s); c.delete(data.id); return c; }), 2000);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  /* scroll-reveal for the section header */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('revealed'); },
      { threshold: 0.05 }
    );
    el.classList.add('scroll-reveal');
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function isFormValid() {
    if (!name.trim() || !body.trim()) return false;
    if (topicType === 'work') return !!workId;
    if (topicType === 'other') return !!topicOther.trim();
    return true; // museum
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid()) return;
    setSubmitting(true);
    setError('');
    const insertPayload: Record<string, unknown> = {
      author_name: name.trim(),
      body: body.trim(),
      work_id: topicType === 'work' ? workId : null,
      topic: topicType === 'museum'
        ? 'Bảo tàng văn học'
        : topicType === 'other'
          ? topicOther.trim()
          : null,
    };
    const { error: err } = await supabase.from('comments').insert(insertPayload);
    setSubmitting(false);
    if (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại.');
      return;
    }
    setDone(true);
    setName('');
    setBody('');
    setWorkId('');
    setTopicOther('');
    setTopicType('work');
    // auto-scroll to wall to see the comment appear
    setTimeout(() => {
      wallRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setDone(false);
    }, 2200);
  }

  const isEmpty = !loading && comments.length === 0;

  return (
    <section
      id="comments"
      ref={sectionRef}
      className="py-20 px-4 bg-gradient-to-b from-[#1a1a1a] via-[#1b2d47]/20 to-[#1a1a1a]"
    >
      <div className="container mx-auto max-w-7xl">
        {/* ── Section header ── */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#3b82c4]" />
            <MessageCircle className="w-8 h-8 text-[#3b82c4]" strokeWidth={1.5} />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#3b82c4]" />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#ccd8ef] tracking-wide mb-3">
            Góc Bình Luận
          </h2>
          <p className="text-[#ccd8ef]/60 max-w-xl mx-auto text-base">
            Chia sẻ cảm nhận, suy nghĩ của bạn về tác phẩm, trang web hoặc bất cứ điều gì bạn muốn góp ý
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#3b82c4] to-transparent mx-auto mt-5" />
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 xl:gap-12 items-start">

          {/* ════ LEFT: Comment wall ════ */}
          <div ref={wallRef}>
            <div className="flex items-center gap-2 mb-5">
              <Quote size={16} className="text-[#3b82c4]" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b82c4]">
                Bình luận nổi bật
              </h3>
              {!loading && (
                <span className="ml-auto text-xs text-[#ccd8ef]/40">
                  {comments.length} bình luận
                </span>
              )}
            </div>

            {loading && (
              <div className="flex items-center justify-center py-20 gap-3 text-[#ccd8ef]/40">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Đang tải bình luận...</span>
              </div>
            )}

            {isEmpty && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <MessageCircle size={48} className="text-[#3b82c4]/20" strokeWidth={1} />
                <p className="text-[#ccd8ef]/40 text-sm italic text-center">
                  Chưa có bình luận nào.<br />Hãy là người đầu tiên chia sẻ cảm nhận!
                </p>
                <ChevronDown size={18} className="text-[#3b82c4]/30 animate-bounce" />
              </div>
            )}

            {!loading && comments.length > 0 && (
              <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                {comments.map((c, i) => (
                  <div key={c.id} className="break-inside-avoid mb-4">
                    <CommentCard
                      comment={c}
                      index={i}
                      isNew={newIds.has(c.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ════ RIGHT: Submit form ════ */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-[#1b2d47]/60 backdrop-blur-sm rounded-2xl border border-[#3b82c4]/20 overflow-hidden shadow-2xl">
              {/* form header */}
              <div className="px-6 py-5 border-b border-[#3b82c4]/20 bg-[#1b2d47]/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#3b82c4]/20 flex items-center justify-center">
                    <Send size={16} className="text-[#3b82c4]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-[#ccd8ef] tracking-wide">Đóng góp bình luận</h3>
                    <p className="text-xs text-[#ccd8ef]/50 mt-0.5">Chia sẻ cảm nhận về tác phẩm văn học</p>
                  </div>
                </div>
              </div>

              {/* form body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#3b82c4] mb-2">
                    Tên học sinh
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3b82c4]/60" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập tên của bạn..."
                      maxLength={60}
                      required
                      className="w-full pl-9 pr-4 py-2.5 bg-[#1a1a1a]/60 border border-[#3b82c4]/25 rounded-lg text-[#ccd8ef] placeholder-[#ccd8ef]/30 text-sm focus:outline-none focus:border-[#3b82c4] focus:ring-1 focus:ring-[#3b82c4]/30 transition-colors"
                    />
                  </div>
                </div>

                {/* topic type selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#3b82c4] mb-2">
                    Chủ đề bình luận
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'work',    icon: <BookOpen size={13} />,  label: 'Tác phẩm' },
                      { value: 'museum',  icon: <Globe size={13} />,     label: 'Bảo tàng văn học' },
                      { value: 'other',   icon: <HelpCircle size={13} />, label: 'Khác' },
                    ] as { value: TopicType; icon: React.ReactNode; label: string }[]).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTopicType(opt.value)}
                        className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg border text-xs font-medium transition-all duration-200
                          ${
                            topicType === opt.value
                              ? 'bg-[#3b82c4]/20 border-[#3b82c4] text-[#3b82c4]'
                              : 'bg-[#1a1a1a]/60 border-[#3b82c4]/20 text-[#ccd8ef]/50 hover:border-[#3b82c4]/50 hover:text-[#ccd8ef]/80'
                          }`}
                      >
                        {opt.icon}
                        <span className="text-center leading-tight">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* conditional: work dropdown */}
                {topicType === 'work' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#3b82c4] mb-2">
                      Chọn tác phẩm
                    </label>
                    <div className="relative">
                      <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3b82c4]/60 pointer-events-none" />
                      <select
                        value={workId}
                        onChange={(e) => setWorkId(e.target.value)}
                        required
                        className="w-full pl-9 pr-8 py-2.5 bg-[#1a1a1a]/60 border border-[#3b82c4]/25 rounded-lg text-[#ccd8ef] text-sm focus:outline-none focus:border-[#3b82c4] focus:ring-1 focus:ring-[#3b82c4]/30 transition-colors appearance-none"
                      >
                        <option value="" disabled className="bg-[#1b2d47] text-[#ccd8ef]/60">
                          — Chọn tác phẩm —
                        </option>
                        {works.map((w) => (
                          <option key={w.id} value={w.id} className="bg-[#1b2d47] text-[#ccd8ef]">
                            {w.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3b82c4]/60 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* conditional: other topic input */}
                {topicType === 'other' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#3b82c4] mb-2">
                      Nêu rõ chủ đề
                    </label>
                    <div className="relative">
                      <HelpCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3b82c4]/60" />
                      <input
                        type="text"
                        value={topicOther}
                        onChange={(e) => setTopicOther(e.target.value)}
                        placeholder="Ví dụ: Giao diện website, nội dung khác..."
                        maxLength={100}
                        required
                        className="w-full pl-9 pr-4 py-2.5 bg-[#1a1a1a]/60 border border-[#3b82c4]/25 rounded-lg text-[#ccd8ef] placeholder-[#ccd8ef]/30 text-sm focus:outline-none focus:border-[#3b82c4] focus:ring-1 focus:ring-[#3b82c4]/30 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* comment body */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#3b82c4] mb-2">
                    {
                      topicType === 'work'   ? 'Cảm nhận về tác phẩm' :
                      topicType === 'museum' ? 'Nhận xét về trang web' :
                                              'Ý kiến của bạn'
                    }
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={
                      topicType === 'work'
                        ? 'Chia sẻ cảm nhận, suy nghĩ của bạn về tác phẩm này...'
                        : topicType === 'museum'
                          ? 'Bạn nghĩ gì về giao diện, nội dung hay tính năng của trang web?'
                          : 'Nêu ý kiến, góp ý hoặc câu hỏi của bạn...'
                    }
                    rows={5}
                    maxLength={600}
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-[#3b82c4]/25 rounded-lg text-[#ccd8ef] placeholder-[#ccd8ef]/30 text-sm focus:outline-none focus:border-[#3b82c4] focus:ring-1 focus:ring-[#3b82c4]/30 transition-colors resize-none leading-relaxed"
                  />
                  <p className="text-right text-[10px] text-[#ccd8ef]/30 mt-1">{body.length}/600</p>
                </div>

                {/* error */}
                {error && (
                  <p className="text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                {/* submit */}
                {done ? (
                  <div className="flex items-center justify-center gap-2 py-3 text-green-400 animate-[fadeIn_0.3s_ease]">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-medium">Bình luận đã được gửi!</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting || !isFormValid()}
                    className="w-full flex items-center justify-center gap-2.5 py-3 bg-[#3b82c4] hover:bg-[#2d6db5] disabled:opacity-50 disabled:cursor-not-allowed text-[#1a1a1a] font-semibold uppercase tracking-widest text-sm rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,196,0.4)]"
                  >
                    {submitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Đang gửi...</>
                    ) : (
                      <><Send size={15} /> Gửi bình luận</>
                    )}
                  </button>
                )}

                <p className="text-center text-[10px] text-[#ccd8ef]/25 leading-relaxed">
                  Bình luận của bạn sẽ hiển thị ngay sau khi gửi và được cộng đồng cùng đọc.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
