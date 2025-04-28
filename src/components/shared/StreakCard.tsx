import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Trophy, Apple, Dumbbell, Activity } from 'lucide-react';
import { Card } from '../ui/card';
import type { Streak } from '@/types/streaks';

interface StreakCardProps {
  type: 'diet' | 'training' | 'steps';
  streak?: Streak;  // Tornando opcional para lidar com casos onde pode ser undefined
  className?: string;
}

// Valor padrão para streak quando é undefined
const DEFAULT_STREAK: Streak = {
  count: 0,
  lastUpdate: new Date().toISOString(),
  startDate: new Date().toISOString()
};

export function StreakCard({ type, streak = DEFAULT_STREAK, className = '' }: StreakCardProps) {
  // Garantindo que streak nunca será undefined
  const safeStreak = streak || DEFAULT_STREAK;
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return "Data inválida";
    }
  };

  const getTitle = () => {
    if (type === 'diet') return 'Sequência Alimentar';
    if (type === 'training') return 'Sequência de Treino';
    if (type === 'steps') return 'Sequência de Passos';
    return '';
  };

  const getDescription = () => {
    if (type === 'diet') {
      return 'Dias consecutivos cumprindo as metas calóricas';
    } else if (type === 'training') {
      return 'Dias consecutivos de treino completo';
    } else if (type === 'steps') {
      return 'Dias consecutivos atingindo a meta de passos';
    }
    return '';
  };
  
  const getIcon = () => {
    if (type === 'diet') return <Apple size={18} className="text-green-600" />;
    if (type === 'training') return <Dumbbell size={18} className="text-blue-600" />;
    if (type === 'steps') return <Activity size={18} className="text-cyan-600" />;
    return null;
  };

  // Valores seguros para evitar erros de acesso a propriedades
  const count = safeStreak?.count || 0;
  const startDate = safeStreak?.startDate || "";
  const lastUpdate = safeStreak?.lastUpdate || "";

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{getDescription()}</p>
        </div>

        {count >= 7 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-amber-100 p-1.5 rounded-full"
          >
            <Trophy size={16} className="text-amber-600" />
          </motion.div>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className={`bg-gradient-to-br rounded-full p-2 shadow-lg ${
              type === 'diet' 
                ? 'from-green-500 to-green-600'
                : type === 'training'
                  ? 'from-blue-500 to-blue-600'
                  : 'from-cyan-500 to-cyan-600'
            }`}>
              <Flame size={24} className="text-white" />
            </div>
            {count > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-2 bg-white rounded-full px-1.5 py-0.5 text-xs font-bold border border-orange-200 shadow-sm text-orange-600"
              >
                {count}
              </motion.div>
            )}
          </div>
          <div>
            <div className="font-semibold text-lg">{count} {count === 1 ? 'dia' : 'dias'}</div>
            {count > 0 && startDate && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar size={12} />
                Desde {formatDate(startDate)}
              </div>
            )}
          </div>
        </div>

        {count > 0 && lastUpdate && (
          <div className="text-xs text-gray-500">
            Última atualização: {formatDate(lastUpdate)}
          </div>
        )}
      </div>
    </Card>
  );
}