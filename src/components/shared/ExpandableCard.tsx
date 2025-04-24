"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

interface ExpandableCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  actions?: React.ReactNode;
  hideExpandButton?: boolean;
}

export function ExpandableCard({
  title,
  subtitle,
  icon,
  children,
  defaultExpanded = false,
  actions,
  hideExpandButton = false,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <div
        className={`flex items-center justify-between p-4 ${
          !hideExpandButton ? "cursor-pointer" : ""
        }`}
        onClick={() => !hideExpandButton && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-800">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions}
          {!hideExpandButton && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <ChevronDown size={16} />
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 bg-white p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}