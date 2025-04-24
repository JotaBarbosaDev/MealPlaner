"use client";

import React from "react";
import { motion } from "framer-motion";

type StatCardColor = "green" | "blue" | "amber" | "rose" | "purple";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  unit?: string;
  delay?: number;
  color?: StatCardColor;
  size?: "sm" | "md" | "lg";
}

export function StatCard({
  icon,
  label,
  value,
  unit,
  delay = 0,
  color = "green",
  size = "md",
}: StatCardProps) {
  const colorClassMap: Record<StatCardColor, string> = {
    green: "bg-green-50 text-green-600 border-green-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  const sizeClassMap = {
    sm: "p-3",
    md: "p-4",
    lg: "p-5",
  };

  const iconSizeMap = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  const valueSizeMap = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`${sizeClassMap[size]} rounded-xl border ${colorClassMap[color]} hover:shadow-md transition-shadow duration-300`}
    >
      <div className="flex items-center gap-3">
        <div className={`${iconSizeMap[size]}`}>{icon}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`font-semibold ${valueSizeMap[size]}`}>
          {typeof value === "number" ? 
            Number.isInteger(value) ? value : value.toFixed(1) : 
            value}
        </span>
        {unit && <span className="text-xs text-gray-400">{unit}</span>}
      </div>
    </motion.div>
  );
}