"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import { Sprout } from "lucide-react";

// Componentes de layout
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

// Importação das páginas principais
import Principal from "@/components/Principal";
import Dieta from "@/components/Dieta";
import Treino from "@/components/Treino";
import Pesagens from "@/components/Pesagens";

export default function Page() {
  const [hasMounted, setHasMounted] = useState(false);
  const [currentView, setCurrentView] = useState<
    "Principal" | "Dieta" | "Treino" | "Pesagens"
  >("Principal");
  
  // Lidar com carregamento inicial
  useEffect(() => {
    setHasMounted(true);

    // Evitar que o teclado abra automaticamente em dispositivos móveis
    const preventKeyboardOpen = (event: TouchEvent) => {
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (!isInputField) {
        target.blur();
      }
    };

    document.addEventListener("touchstart", preventKeyboardOpen);

    return () => {
      document.removeEventListener("touchstart", preventKeyboardOpen);
    };
  }, []);

  // Enquanto não montou, mostra carregando
  if (!hasMounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Sprout size={36} className="text-green-600 mx-auto" />
          </div>
          <p className="text-gray-600 font-medium">Carregando MealPlaner...</p>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    switch (currentView) {
      case "Principal": return "Dashboard";
      case "Dieta": return "Plano Nutricional";
      case "Treino": return "Plano de Treino";
      case "Pesagens": return "Controle de Pesagens";
      default: return "MealPlaner";
    }
  };

  return (
    <div className="font-sans min-h-screen flex flex-col">
      {/* ToastContainer com configuração otimizada para design elegante */}
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover
        theme="light"
        toastClassName="Toastify__toast--animate"
        limit={3}
      />

      <Header title={getTitle()} />

      <main className="flex-1 container mx-auto px-4 pb-24 max-w-5xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {currentView === "Principal" && <Principal />}
            {currentView === "Dieta" && <Dieta />}
            {currentView === "Treino" && <Treino />}
            {currentView === "Pesagens" && <Pesagens />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav 
        currentView={currentView}
        onChange={setCurrentView}
      />
    </div>
  );
}
