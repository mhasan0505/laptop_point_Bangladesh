"use client";

import { motion } from "framer-motion";

export default function MessengerButton() {
  const messengerUrl = "https://m.me/laptoppointbd";

  return (
    <motion.a
      href={messengerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-40 right-4 lg:bottom-20 lg:right-6 z-40 p-3 lg:p-4 bg-blue-500 text-white rounded-full shadow-lg hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center group"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1,
      }}
      title="Chat on Messenger"
    >
      {/* Facebook Messenger logo */}
      <svg
        className="w-6 h-6 lg:w-8 lg:h-8"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.928 1.42 5.54 3.644 7.255V21.5l3.338-1.834A11.5 11.5 0 0 0 12 20c5.523 0 10-4.144 10-9.741C22 6.145 17.523 2 12 2Zm1.004 13.128-2.55-2.718-4.97 2.718 5.47-5.808 2.612 2.718 4.908-2.718-5.47 5.808Z" />
      </svg>
      <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap hidden md:block">
        Message us
      </span>
    </motion.a>
  );
}
