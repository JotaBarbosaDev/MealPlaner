"use client";

import React from "react";
import { motion } from "framer-motion";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 px-4 mb-4"
    >
      <div className="container mx-auto max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-green-100 p-2 text-green-600">
            🌱
          </div>
          <h1 className="text-xl font-bold text-gray-800">
            {title}
          </h1>
        </div>
      </div>
    </motion.header>
  );
}