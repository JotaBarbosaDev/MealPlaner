"use client";

import React from "react";
import { motion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  title,
  icon,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4"
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
        {description && (
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        )}
      </div>

      {action && <div>{action}</div>}
    </motion.div>
  );
}