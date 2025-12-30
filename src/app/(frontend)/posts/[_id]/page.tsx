// app/(frontend)/posts/[_id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import PostService from "@/services/post.service";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { formatDistanceToNow } from "date-fns";
import { TextPost, DocPost } from "@/app/types/post";
import { 
  Pencil, Download, ExternalLink, Sparkles, 
  BookOpen, Clock, ChevronLeft, FileText, Image as ImageIcon 
} from "lucide-react";
import { DeletePostButton } from "@/app/(frontend)/components/post/DeletePostButton";
import PostList from "../../components/post/PostList";
import { CreateAnswerButton } from "../../components/post/CreateAnswerButton";

/**
 * Enhanced Media Renderer
 * Solves the "white space" problem by centering images and 
 * using a blurred background technique for small/aspect-ratio images.
 */
function MediaRenderer({ url, title, type }: { url: string; title: string; type: string }) {
  const isImage = url.match(/\.(jpg|jpeg|png|webp|gif)$/i);

  if (isImage) {
    return (
      <div className="relative w-full h-[60vh] md:h-[80vh] bg-[rgb(var(--color-bg-strong)/0.1)] flex items-center justify-center overflow-hidden group/viewer">
        {/* Ambient background blur (Atmospheric Effect) */}
        <div 
          className="absolute inset-0 blur-[100px] opacity-30 scale-125 transition-transform duration-700 group-hover/viewer:scale-110"
          style={{ 
            backgroundImage: `url(${url})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        />
        
        {/* Main Image Container */}
        <div className="relative z-10 w-full h-full p-6 md:p-12 flex items-center justify-center">
          <img
            src={url}
            alt={title}
            className="max-w-full max-h-full object-contain shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-lg transition-transform duration-500"
          />
        </div>

        {/* Floating Info Badge */}
        <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center gap-2">
          <ImageIcon className="w-3 h-3 text-white" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Image Preview</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[70vh] md:h-[80vh] bg-white relative">
      <iframe
        key={url}
        src={url}
        className="w-full h-full border-0"
        title={title}
      />
      {/* Mobile Helper Overlay for PDFs */}
      <div className="absolute bottom-4 right-4 md:hidden">
        <a 
          href={url} 
          target="_blank" 
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-accent))] text-white rounded-full text-xs font-bold shadow-lg"
        >
          <ExternalLink size={14} /> Open Full View
        </a>
      </div>
    </div>
  );
}

export default async function PostPage({ params }: { params: { _id: string } }) {
  const { _id } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?._id || "";
  
  const post = await PostService.fetchPostById(_id);
  if (!post) notFound();

  const isUnauthorized = !userId;
  const isAuthor = !isUnauthorized && userId === post.authorId?._id?.toString();
  const isDocPost = post.type === "notes" || post.type === "question-paper";

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] transition-colors duration-500">
      <article className="max-w-5xl mx-auto px-6 py-12 lg:py-20 space-y-16 pb-32 animate-in fade-in duration-700">
        
        {/* 1. STUDIO HEADER */}
        <header className="space-y-8">
          <Link 
            href="/posts" 
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] hover:text-[rgb(var(--color-accent))] transition-colors"
          >
            <ChevronLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
            Back to feed
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 flex-1">
              <Link href={`/dashboard/${post.authorId?._id}`}>
                <div className="flex items-center gap-3 group/author">
                  <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-bg-strong)/0.5)] border border-[rgb(var(--color-border)/0.5)] flex items-center justify-center text-sm font-black text-[rgb(var(--color-accent))] group-hover/author:border-[rgb(var(--color-accent))] transition-all">
                    {post.authorId?.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[rgb(var(--color-fg))] group-hover/author:text-[rgb(var(--color-accent))] transition-colors">
                      {post.authorId?.username || "Anonymous"}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-fg-subtle))] opacity-60">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Link>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
                {post.title}
              </h1>

              <div className="flex flex-wrap gap-2">
                {post.subject && (
                  <span className="px-3 py-1 rounded-lg bg-[rgb(var(--color-accent)/0.1)] text-[rgb(var(--color-accent))] text-[10px] font-black uppercase tracking-widest border border-[rgb(var(--color-accent)/0.2)]">
                    {post.subject}
                  </span>
                )}
                <span className="px-3 py-1 rounded-lg bg-[rgb(var(--color-bg-soft))] text-[rgb(var(--color-fg-subtle))] text-[10px] font-black uppercase tracking-widest border border-[rgb(var(--color-border)/0.5)]">
                  {post.type.replace("-", " ")}
                </span>
              </div>
            </div>

            {/* Author Actions */}
            {!isUnauthorized && isAuthor && (
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/posts/${post._id}/edit`}
                  className="px-5 py-2.5 rounded-xl bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border)/0.5)] text-sm font-bold hover:bg-[rgb(var(--color-fg))] hover:text-[rgb(var(--color-bg))] transition-all flex items-center gap-2 shadow-sm"
                >
                  <Pencil size={16} /> Edit
                </Link>
                <DeletePostButton postId={post._id.toString()} />
              </div>
            )}
          </div>

          {!isUnauthorized && post.type === "question" && (
            <div className="pt-4 border-t border-[rgb(var(--color-border)/0.3)] flex justify-end">
              <CreateAnswerButton
                questionId={post._id.toString()}
                questionTitle={post.title}
                subject={post.subject}
              />
            </div>
          )}
        </header>

        {/* 2. MAIN CONTENT AREA */}
        <main className="space-y-12">
          {/* Text Post Layout */}
          {(post.type === "question" || post.type === "answer") && (
            <section className="relative px-2">
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[rgb(var(--color-accent))] to-transparent rounded-full hidden md:block" />
              <div className="text-xl md:text-2xl leading-relaxed font-medium text-[rgb(var(--color-fg))] whitespace-pre-wrap break-words selection:bg-[rgb(var(--color-accent)/0.3)]">
                {post.content}
              </div>
            </section>
          )}

          {/* Document Post Layout */}
          {isDocPost && (
            <section className="space-y-10">
              <div className="p-8 md:p-12 rounded-[2.5rem] bg-[rgb(var(--color-bg-soft)/0.4)] border border-[rgb(var(--color-border)/0.5)] backdrop-blur-sm shadow-inner">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-accent))] mb-6 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Executive Summary
                </h2>
                {post.summary ? (
                  <p className="text-lg md:text-xl font-medium leading-relaxed text-[rgb(var(--color-fg))] whitespace-pre-wrap">
                    {post.summary}
                  </p>
                ) : (
                  <p className="text-[rgb(var(--color-fg-subtle))] italic">No summary provided.</p>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[rgb(var(--color-accent))]" />
                    Media Resource
                  </h3>
                  {post.fileUrl && (
                    <div className="flex gap-2">
                      <a 
                        href={post.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-2.5 rounded-xl bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border)/0.5)] hover:text-[rgb(var(--color-accent))] transition-all"
                        title="Open in new tab"
                      >
                        <ExternalLink size={18}/>
                      </a>
                      <a 
                        href={post.fileUrl} 
                        download 
                        className="p-2.5 rounded-xl bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border)/0.5)] hover:text-[rgb(var(--color-accent))] transition-all"
                        title="Download file"
                      >
                        <Download size={18}/>
                      </a>
                    </div>
                  )}
                </div>

                <div className="rounded-[3rem] border border-[rgb(var(--color-border)/0.5)] bg-[rgb(var(--color-bg-soft)/0.3)] overflow-hidden shadow-2xl transition-all hover:border-[rgb(var(--color-accent)/0.3)]">
                  {post.fileUrl ? (
                    <MediaRenderer url={post.fileUrl} title={post.title} type={post.type} />
                  ) : (
                    <div className="py-32 text-center bg-[rgb(var(--color-bg-soft)/0.2)]">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-fg-subtle))]">Attachment Unavailable</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>

        {/* 3. PEER INSIGHTS */}
        {!isUnauthorized && post.type === "question" && (post as any).associate?.length > 0 && (
          <section className="pt-16 border-t border-[rgb(var(--color-border)/0.3)] space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tight">
                Peer <span className="text-[rgb(var(--color-accent))]">Insights.</span>
              </h2>
              <div className="px-4 py-1.5 rounded-full bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border)/0.5)] text-[10px] font-black uppercase tracking-widest">
                {(post as any).associate.length} Solutions
              </div>
            </div>

            <PostList
              posts={(post as any).associate}
              filterType="all"
              title=""
            />
          </section>
        )}

        <footer className="pt-12 border-t border-[rgb(var(--color-border)/0.3)] flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] opacity-40">
          <div className="flex items-center gap-2">
            <Clock size={12}/> {post.updatedAt !== post.createdAt ? 'Updated' : 'Refreshed'} {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
          </div>
        </footer>
      </article>
    </div>
  );
}