"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mail, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("newsletterPopupSeen");

    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("newsletterPopupSeen", "true");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription logic here
    handleClose();
    alert("Thanks for subscribing!");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden relative"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Image Side (Hidden on small screens) */}
              <div className="hidden md:block w-1/3 bg-gray-100 relative">
                {/* You could put an image here */}
                <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                  <Mail size={64} />
                </div>
              </div>

              {/* Content Side */}
              <div className="w-full md:w-2/3 p-8">
                <div className="text-center md:text-left">
                  <div className="md:hidden flex justify-center text-primary mb-4">
                    <Mail size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Join Our Newsletter
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    Subscribe now to get the latest updates, special offers, and
                    tech news delivered straight to your inbox.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-md"
                  >
                    Subscribe Now
                  </button>
                </form>

                <p className="mt-4 text-xs text-center text-gray-400">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
