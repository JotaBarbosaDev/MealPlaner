"use client";

import React, {useState, useEffect} from "react";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Exemplos de import de cada secção (ajusta aos teus caminhos):
import Principal from "@/components/Principal";
import Dieta from "@/components/Dieta";
import Treino from "@/components/Treino";
import Pesagens from "@/components/Pesagens";

// Import shadcn UI
import {Button} from "@/components/ui/button";

export default function Page() {
  const [hasMounted, setHasMounted] = useState(false);
  const [currentView, setCurrentView] = useState<
    "Principal" | "Dieta" | "Treino" | "Pesagens"
  >("Principal");

  useEffect(() => {
    setHasMounted(true);

    const preventKeyboardOpen = (event: TouchEvent) => {
      const target = event.target as HTMLElement;

      // Verifica se o elemento clicado é um input ou textarea
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Apenas previne o comportamento padrão se NÃO for um campo de entrada
      if (!isInputField) {
        target.blur(); // Remove o foco se estiver em outro elemento
      }
    };

    // Adiciona o evento ao document
    document.addEventListener("touchstart", preventKeyboardOpen);

    // Remove o evento ao desmontar o componente
    return () => {
      document.removeEventListener("touchstart", preventKeyboardOpen);
    };
  }, []);

  if (!hasMounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-700">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="font-sans bg-gray-50 h-screen flex flex-col">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover={false}
        draggable={false}
      />
      <main className="flex-1 overflow-y-auto p-3 pb-16">
        {currentView === "Principal" && <Principal />}
        {currentView === "Dieta" && <Dieta />}
        {currentView === "Treino" && <Treino />}
        {currentView === "Pesagens" && <Pesagens />}
      </main>
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center p-2">
        <Button
          variant={currentView === "Principal" ? "default" : "outline"}
          className="text-xs flex-1 mx-1"
          onClick={() => setCurrentView("Principal")}
        >
          Principal
        </Button>
        <Button
          variant={currentView === "Dieta" ? "default" : "outline"}
          className="text-xs flex-1 mx-1"
          onClick={() => setCurrentView("Dieta")}
        >
          Dieta
        </Button>
        <Button
          variant={currentView === "Treino" ? "default" : "outline"}
          className="text-xs flex-1 mx-1"
          onClick={() => setCurrentView("Treino")}
        >
          Treino
        </Button>
        <Button
          variant={currentView === "Pesagens" ? "default" : "outline"}
          className="text-xs flex-1 mx-1"
          onClick={() => setCurrentView("Pesagens")}
        >
          Pesagens
        </Button>
      </nav>
    </div>
  );
}
