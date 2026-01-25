"use client";

import { useEffect, useState } from "react";
import { LoaderMachine } from "@/components/ui/loader-machine";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Post } from "@/lib/types";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function PostRevealView({ post }: { post: Post | null | undefined }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    if (post) {
      const timer = setTimeout(() => {
        setIsRevealed(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [post]);

  if (post === undefined) {
    return <LoaderMachine />;
  }

  if (post === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_#000] p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Aucun post généré</h2>
          <p className="mb-6">
            Il semble que vous n'ayez pas encore de post. Complétez le quiz pour
            en générer un !
          </p>
          <a
            href="/quiz"
            className="inline-block bg-black text-white rounded-none h-12 px-6 flex items-center justify-center"
          >
            Retourner au Quiz
          </a>
        </div>
      </div>
    );
  }

  const meta = post?.equalizer_settings as any;
  const components = meta?.generated_components;
  // Fallback chain for archetype label: profile.label_final -> post.archetype -> meta.archetype.name -> "Unknown"
  const archetypeLabel = meta?.profile?.label_final || post.archetype || meta?.archetype?.name || "Archetype Inconnu";
  const styleAnalysis = components?.style_analysis;
  
  // Use structured content if available, otherwise fallback to standard content
  const contentToCopy = components
    ? `${components.hook}\n\n${components.content}\n\n${components.cta}`
    : post.content;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-50">
      <div
        className={`bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_#000] p-8 md:p-12 w-full max-w-3xl transition-all duration-[2500ms] ease-out ${
          isRevealed ? "blur-0 opacity-100" : "blur-sm opacity-50 select-none"
        }`}
        data-testid="post-content"
      >
        {/* Header Section matching FinalReveal */}
        <div className="w-full text-center mb-8 space-y-4">
             {/* Profile & Analysis Toggle */}
             <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-zinc-500 uppercase tracking-wide">
                   ÉCRIT PAR VOTRE BINÔME NUMÉRIQUE
                </span>
                
                {styleAnalysis && (
                  <>
                    <button 
                       onClick={() => setShowAnalysis(!showAnalysis)}
                       className="text-xs font-mono text-zinc-400 hover:text-black flex items-center gap-1 transition-colors border-b border-dashed border-zinc-300 pb-0.5"
                    >
                       {showAnalysis ? 'Masquer l\'analyse' : 'Voir l\'analyse de style'}
                       {showAnalysis ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {/* Collapsible Analysis Drawer */}
                    {showAnalysis && (
                       <div className="mt-4 w-full bg-zinc-100 border-l-2 border-zinc-300 p-4 text-left animate-in slide-in-from-top-2 duration-200">
                          <p className="text-sm text-zinc-600 italic leading-relaxed">
                             "{styleAnalysis}"
                          </p>
                       </div>
                    )}
                  </>
                )}
             </div>

             {/* Archetype Label Display */}
             {archetypeLabel && (
                <div className="mt-2 text-zinc-400 font-serif italic text-sm">
                  Tone: {archetypeLabel}
                </div>
             )}

             {/* Theme Display - Highly Visible */}
             <h2 className="text-3xl md:text-4xl font-black text-black mt-6 mb-2 leading-tight">
                {post.theme}
             </h2>
          </div>

        {/* Post Content */}
        {components ? (
          <div className="font-serif text-lg leading-relaxed text-zinc-900 mb-8">
             <div className="font-bold mb-6 text-xl">{components.hook}</div>
             <div className="whitespace-pre-wrap font-sans">{components.content}</div>
             <div className="mt-6 italic font-medium">{components.cta}</div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap font-sans text-lg leading-relaxed mb-8">{post.content}</div>
        )}

        <div className="mt-6">
          <button
            onClick={() => copy(contentToCopy)}
            className="bg-black text-white rounded-none h-12 w-full hover:bg-zinc-800 transition-colors uppercase font-bold tracking-wider"
            data-testid="copy-button"
          >
            {copied ? "Texte copié !" : "Copier le texte"}
          </button>
        </div>
        
        <div className="mt-4 text-center">
             <a href="/quiz" className="text-sm text-zinc-500 hover:text-black underline">
                 Générer un nouveau post
             </a>
        </div>
      </div>
    </div>
  );
}
