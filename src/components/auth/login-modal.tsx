"use client";

import { signIn } from "next-auth/react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  const handleLogin = async () => {
    await signIn("discord", { callbackUrl: "/" });
  };

  return (
    <div
      className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Sign In</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <button
          onClick={handleLogin}
          className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Sign in with Discord
        </button>
      </div>
    </div>
  );
}
