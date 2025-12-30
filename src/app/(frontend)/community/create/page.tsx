// app/(frontend)/communities/create/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { createCommunityAction } from '@/app/(frontend)/actions/community.actions';
import Input from '@/app/(frontend)/components/Input';
import Button from '@/app/(frontend)/components/Button'; 
import Link from 'next/link';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Plus, Sparkles, ArrowLeft, Globe } from 'lucide-react';

export default async function CreateCommunityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) redirect('/sign-in');

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] transition-colors duration-500 selection:bg-[rgb(var(--color-accent)/0.2)]">
      <div className="max-w-3xl mx-auto px-6 py-12 lg:py-20 pb-32">
        
        {/* 1. STUDIO HEADER */}
        <header className="flex flex-col items-center text-center space-y-6 mb-16">
          <Link 
            href="/community/explore" 
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] hover:text-[rgb(var(--color-accent))] transition-colors"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
            Back to Explore
          </Link>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-[rgb(var(--color-accent))] to-[rgb(var(--color-success))] rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative w-20 h-20 rounded-[2rem] bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center shadow-sm">
              <Plus className="w-8 h-8 text-[rgb(var(--color-accent))]" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
              New <span className="text-[rgb(var(--color-accent))]">Collective.</span>
            </h1>
            <p className="text-[rgb(var(--color-fg-muted))] max-w-md mx-auto font-medium">
              Establish a dedicated hub for study resources, shared notes, and peer collaboration.
            </p>
          </div>
        </header>

        {/* 2. FORM CONTAINER */}
        <form action={createCommunityAction} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="p-8 md:p-12 rounded-[3rem] bg-[rgb(var(--color-bg-soft)/0.4)] border border-[rgb(var(--color-border)/0.5)] backdrop-blur-xl shadow-sm space-y-10">
            
            <div className="space-y-8">
              {/* Name */}
              <div className="group">
                <Input
                  label="Community Name"
                  name="name"
                  required
                  placeholder="e.g. Advanced Calculus Study Group"
                  className="bg-transparent border-0 border-b rounded-none px-0 focus:border-[rgb(var(--color-accent))] transition-all text-xl font-bold"
                />
                <p className="mt-2 text-[10px] font-bold text-[rgb(var(--color-fg-subtle))] uppercase tracking-widest opacity-50">
                  This will be the primary display name.
                </p>
              </div>

              {/* Slug */}
              <div className="group">
                <div className="flex items-center gap-2 mb-1">
                   <Globe className="w-3.5 h-3.5 text-[rgb(var(--color-accent))]" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-accent))]">Identifier</span>
                </div>
                <Input
                  name="slug"
                  required
                  placeholder="calc-101"
                  className="bg-transparent border-0 border-b rounded-none px-0 focus:border-[rgb(var(--color-accent))] transition-all font-mono text-sm"
                />
                <p className="mt-2 text-[10px] font-bold text-[rgb(var(--color-fg-subtle))] uppercase tracking-widest opacity-50">
                  Unique URL handle (alphanumeric and dashes only).
                </p>
              </div>

              {/* Description */}
              <div className="group">
                <Input
                  label="Manifesto"
                  name="description"
                  multiline
                  placeholder="Define the goals and culture of this space..."
                  className="bg-transparent border-0 border-b rounded-none px-0 focus:border-[rgb(var(--color-accent))] transition-all min-h-[100px] text-base font-medium"
                />
              </div>
            </div>

            {/* 3. ACTIONS */}
            <footer className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-[rgb(var(--color-border)/0.5)]">
              <button 
                type="submit" 
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))] font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Establish Space
              </button>
              
              <Link 
                href="/communities/explore"
                className="flex items-center justify-center px-8 py-4 bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border)/0.5)] text-[rgb(var(--color-fg-muted))] hover:text-[rgb(var(--color-fg))] font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all"
              >
                Dismiss
              </Link>
            </footer>
          </div>
        </form>

        {/* Decorative Background Element */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[rgb(var(--color-accent)/0.02)] blur-[120px] rounded-full pointer-events-none -z-10" />
      </div>
    </div>
  );
}