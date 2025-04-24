import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Trophy, Apple, Dumbbell } from 'lucide-react';
import { Card } from '../ui/card';
import type { Streak } from '@/types/streaks';

interface StreakCardProps {
  type: 'diet' | 'training';
  streak: Streak;
  className?: string;
}

export function StreakCard({ type, streak, className = '' }: StreakCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTitle = () => {
    return type === 'diet' ? 'Sequência Alimentar' : 'Sequência de Treino';
  };

  const getDescription = () => {
    if (type === 'diet') {
      return 'Dias consecutivos cumprindo as metas calóricas';
    } else {
      return 'Dias consecutivos de treino completo';
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            {type === 'diet' ? <Apple size={18} className="text-green-600" /> : <Dumbbell size={18} className="text-blue-600" />}
            {getTitle()}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{getDescription()}</p>
        </div>

        {streak.count >= 7 && (
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
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-2 shadow-lg">
              <Flame size={24} className="text-white" />
            </div>
            {streak.count > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-2 bg-white rounded-full px-1.5 py-0.5 text-xs font-bold border border-orange-200 shadow-sm text-orange-600"
              >
                {streak.count}
              </motion.div>
            )}
          </div>
          <div>
            <div className="font-semibold text-lg">{streak.count} {streak.count === 1 ? 'dia' : 'dias'}</div>
            {streak.count > 0 && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar size={12} />
                Desde {formatDate(streak.startDate)}
              </div>
            )}
          </div>
        </div>

        {streak.count > 0 && (
          <div className="text-xs text-gray-500">
            Última atualização: {formatDate(streak.lastUpdate)}
          </div>
        )}
      </div>
    </Card>
  );
}