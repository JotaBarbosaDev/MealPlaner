"use client";

import React from "react";
import { motion } from "framer-motion";
import { Home, Dumbbell, Apple, Weight } from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center justify-center py-2 transition-colors ${
        isActive
          ? "text-green-600"
          : "text-gray-500 hover:text-gray-800"
      }`}
    >
      <div className="relative">
        <div className="text-xl">{icon}</div>
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-green-600"
            transition={{ type: "spring", duration: 0.5 }}
          />
        )}
      </div>
      <span className="mt-1 text-xs font-medium">{label}</span>
    </button>
  );
}

interface BottomNavProps {
  currentView: "Principal" | "Dieta" | "Treino" | "Pesagens";
  onChange: (view: "Principal" | "Dieta" | "Treino" | "Pesagens") => void;
}

export function BottomNav({ currentView, onChange }: BottomNavProps) {
  const navItems = [
    { id: "Principal", icon: <Home size={22} strokeWidth={2} />, label: "Início" },
    { id: "Treino", icon: <Dumbbell size={22} strokeWidth={2} />, label: "Treino" },
    { id: "Dieta", icon: <Apple size={22} strokeWidth={2} />, label: "Dieta" },
    { id: "Pesagens", icon: <Weight size={22} strokeWidth={2} />, label: "Peso" },
  ];

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/90 backdrop-blur-md px-2 pb-safe"
    >
      <div className="flex h-16 items-center justify-between">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={currentView === item.id}
            onClick={() => onChange(item.id as "Principal" | "Dieta" | "Treino" | "Pesagens")}
          />
        ))}
      </div>
    </motion.nav>
  );
}