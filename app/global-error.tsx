"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Fatal Root Error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-2xl">
            !
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Application Error
          </h1>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            A critical error occurred while initializing the application.
          </p>
          {error.digest && (
            <p className="mb-6 font-mono text-xs text-gray-400">
              Error Digest: {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
