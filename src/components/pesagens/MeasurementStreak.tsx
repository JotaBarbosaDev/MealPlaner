"use client";

import React, { useEffect, useCallback } from "react";
import useLocalStorage from "use-local-storage";
import { motion } from "framer-motion";
import { Flame, Calendar, Trophy, Scale, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

// Tipos
import type { Streak, UserStreaks } from "@/types/streaks";
import type { Measurement } from "@/types/pesagens";

interface MeasurementStreakProps {
  measurements: Measurement[];
  className?: string;
}

// Definindo um valor padrão para as sequências
const DEFAULT_STREAKS: UserStreaks = {
  diet: {
    count: 0,
    lastUpdate: new Date().toISOString(),
    startDate: new Date().toISOString(),
  },
  training: {
    count: 0,
    lastUpdate: new Date().toISOString(),
    startDate: new Date().toISOString(),
  },
  measurements: {
    count: 0,
    lastUpdate: new Date().toISOString(),
    startDate: new Date().toISOString(),
  },
  steps: {
    count: 0,
    lastUpdate: new Date().toISOString(),
    startDate: new Date().toISOString(),
  }
};

export function MeasurementStreak({ measurements, className = "" }: MeasurementStreakProps) {
  // Estado para armazenar as sequências com valor padrão garantido
  const [streaks, setStreaks] = useLocalStorage<UserStreaks>("streaks", DEFAULT_STREAKS);

  // Garantir que o objeto streaks nunca seja undefined
  const safeStreaks: UserStreaks = streaks || DEFAULT_STREAKS;

  // Formatar data para exibição
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("pt-PT", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Data inválida";
    }
  };

  // Memoizar a função de atualização das sequências para evitar recriações
  const updateMeasurementStreak = useCallback(() => {
    if (!measurements || measurements.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ordenar medições por data (mais recente primeiro)
    const sortedMeasurements = [...measurements].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });

    // Data da medição mais recente
    const latestMeasurementDate = new Date(sortedMeasurements[0].date);
    latestMeasurementDate.setHours(0, 0, 0, 0);

    // Verificar se a medição mais recente foi nos últimos 15 dias
    const daysDifference = Math.floor(
      (today.getTime() - latestMeasurementDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Usar setStreaks com função de callback para evitar dependência em streaks
    setStreaks(prevStreaks => {
      // Garante que temos um objeto válido para trabalhar
      const currentStreaks = prevStreaks || DEFAULT_STREAKS;
      
      // Garante que temos um objeto measurements válido
      if (!currentStreaks.measurements) {
        currentStreaks.measurements = {
          count: 0,
          lastUpdate: new Date().toISOString(),
          startDate: new Date().toISOString(),
        };
      }
      
      const currentMeasurements = currentStreaks.measurements;
      const lastUpdate = new Date(currentMeasurements.lastUpdate || new Date().toISOString());
      lastUpdate.setHours(0, 0, 0, 0);

      // Não precisamos criar um novo objeto se não houver alterações
      if (latestMeasurementDate.getTime() <= lastUpdate.getTime()) {
        // Se não há novas medições desde a última atualização, retorna o estado anterior sem mudanças
        return prevStreaks;
      }

      // Cria um novo objeto para as atualizações
      const newStreaks = { ...currentStreaks };
      
      // Verificar se é necessário reiniciar a sequência (mais de 15 dias sem medição)
      if (daysDifference > 15) {
        // Reiniciar sequência se fez medição hoje
        if (latestMeasurementDate.getTime() === today.getTime()) {
          newStreaks.measurements = {
            count: 1,
            lastUpdate: today.toISOString(),
            startDate: today.toISOString(),
          };
        } else {
          // Quebra de sequência sem nova medição
          newStreaks.measurements = {
            count: 0,
            lastUpdate: today.toISOString(),
            startDate: today.toISOString(),
          };
        }
      } else {
        // Nova medição desde a última atualização, incrementar sequência
        newStreaks.measurements = {
          count: ((currentMeasurements?.count) || 0) + 1,
          lastUpdate: latestMeasurementDate.toISOString(),
          startDate: ((currentMeasurements?.count) || 0) === 0 
            ? latestMeasurementDate.toISOString() 
            : (currentMeasurements?.startDate) || latestMeasurementDate.toISOString(),
        };
      }

      return newStreaks;
    });
  }, [measurements, setStreaks]);

  // Executar a atualização da sequência quando o componente montar e quando as medições mudarem
  useEffect(() => {
    updateMeasurementStreak();
  }, [updateMeasurementStreak]); // Dependência estável com useCallback

  // Calcular a frequência média de medições
  const calculateMeasurementFrequency = (): string => {
    if (measurements.length < 2) return "N/A";

    const sortedMeasurements = [...measurements].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const first = new Date(sortedMeasurements[0].date);
    const last = new Date(sortedMeasurements[sortedMeasurements.length - 1].date);
    const daysBetween = Math.round((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysBetween <= 0) return "Diariamente";

    const frequency = daysBetween / (measurements.length - 1);
    
    if (frequency <= 1) return "Diariamente";
    if (frequency <= 7) return "Semanalmente";
    if (frequency <= 15) return "Quinzenalmente";
    if (frequency <= 30) return "Mensalmente";
    return "Ocasionalmente";
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <Scale size={18} className="text-blue-600" />
            Sequência de Medições
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Frequência: {calculateMeasurementFrequency()}
          </p>
        </div>

        {(safeStreaks.measurements?.count || 0) >= 3 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-blue-100 p-1.5 rounded-full"
          >
            <Trophy size={16} className="text-blue-600" />
          </motion.div>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-2 shadow-lg">
              <TrendingUp size={24} className="text-white" />
            </div>
            {(safeStreaks.measurements?.count || 0) > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-2 bg-white rounded-full px-1.5 py-0.5 text-xs font-bold border border-blue-200 shadow-sm text-blue-600"
              >
                {safeStreaks.measurements?.count || 0}
              </motion.div>
            )}
          </div>
          <div>
            <div className="font-semibold text-lg">
              {safeStreaks.measurements?.count || 0}{" "}
              {(safeStreaks.measurements?.count || 0) === 1 ? "medição" : "medições"}
            </div>
            {(safeStreaks.measurements?.count || 0) > 0 && safeStreaks.measurements?.startDate && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar size={12} />
                Desde {formatDate(safeStreaks.measurements.startDate)}
              </div>
            )}
          </div>
        </div>

        {(safeStreaks.measurements?.count || 0) > 0 && safeStreaks.measurements?.lastUpdate && (
          <div className="text-xs text-gray-500">
            Última medição: {formatDate(safeStreaks.measurements.lastUpdate)}
          </div>
        )}
      </div>
    </Card>
  );
}