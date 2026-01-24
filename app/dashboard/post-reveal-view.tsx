
"use client";

import { useEffect, useState } from "react";
import { LoaderMachine } from "@/components/ui/loader-machine";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Post } from "@/lib/types";

export default function PostRevealView({ post }: { post: Post | null | undefined }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    if (post) {
      const timer = setTimeout(() => {
        setIsRevealed(true);
      }, 100);
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
            className="inline-block bg-black text-white rounded-none h-12 px-6"
          >
            Retourner au Quiz
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div
        className={`bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_#000] p-6 w-full max-w-2xl transition-all duration-1000 ${
          isRevealed ? "blur-0" : "blur-sm"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="font-mono text-sm">
            <p>Theme: {post.theme}</p>
            <p>Archetype: {post.archetype}</p>
          </div>
        </div>
        <div className="whitespace-pre-wrap font-sans">{post.content}</div>
        <div className="mt-6">
          <button
            onClick={() => copy(post.content)}
            className="bg-black text-white rounded-none h-12 w-full"
          >
            {copied ? "COPIÉ !" : "[ COPIER LE TEXTE ]"}
          </button>
        </div>
      </div>
    </div>
  );
}
