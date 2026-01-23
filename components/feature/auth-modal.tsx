"use client";

import React, { useState, useRef, useEffect } from "react";
import { signInWithOtp } from "@/lib/auth";
import { X } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !success) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, success]);

  useEffect(() => {
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    const modal = modalRef.current;
    modal?.addEventListener('keydown', handleTabKey);
    return () => modal?.removeEventListener('keydown', handleTabKey);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError("Email address is required.");
      return;
    }

    setLoading(true);
    const result = await signInWithOtp(email);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error?.message || "An unknown error occurred.");
    }
  };

  if (success) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <div className="bg-white p-8 rounded-none w-full max-w-md text-center">
          <h2 id="auth-modal-title" className="text-2xl font-bold mb-4">
            Link Sent!
          </h2>
          <p>
            A connection link has been sent to your email address. Please check your inbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div ref={modalRef} className="bg-white p-8 rounded-none w-full max-w-md relative">
        {!success && (
           <button
             onClick={onClose}
             className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
             aria-label="Close"
           >
             <X size={24} />
           </button>
        )}
        <h2 id="auth-modal-title" className="text-2xl font-bold mb-4">
          Unlock Your Post
        </h2>
        <p className="mb-6">
          Enter your email to receive a secure magic link and view your personalized post.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 sr-only">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full min-h-[44px] font-mono px-3 py-2 border-b-2 border-black focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
             {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full min-h-[44px] bg-black text-white py-3 px-4 rounded-none hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
