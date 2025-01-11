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
  // Hook 1: controla se já montou no cliente (para evitar problemas de SSR)
  const [hasMounted, setHasMounted] = useState(false);

  // Hook 2: marca como montado assim que estiver no cliente
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Hook 3: estado para definir a tab/visor atual
  const [currentView, setCurrentView] = useState<
    "Principal" | "Dieta" | "Treino" | "Pesagens"
  >("Principal");

  // Se quiseres mostrar um “loading” ou layout parcial antes de `hasMounted`:
  if (!hasMounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-700">Carregando...</p>
      </div>
    );
  }

  // Se preferires, podes simplesmente renderizar tudo sem este if,
  // mas com este approach não alteramos a ordem de Hooks entre renders.
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

      {/* Top Bar simples */}

      {/* Conteúdo principal (scroll interno), deixando espaço em baixo para Bottom Nav */}
      <main className="flex-1 overflow-y-auto p-3 pb-16">
        {currentView === "Principal" && <Principal />}
        {currentView === "Dieta" && <Dieta />}
        {currentView === "Treino" && <Treino />}
        {currentView === "Pesagens" && <Pesagens />}
      </main>

      {/* Bottom Navigation */}
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
