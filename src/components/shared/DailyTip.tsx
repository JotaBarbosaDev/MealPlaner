import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

// Array de dicas sobre nutrição
const nutritionTips = [
  "Bebe pelo menos 2 litros de água por dia para manter uma boa hidratação.",
  "Come proteína em todas as refeições para ajudar na recuperação muscular.",
  "Adiciona legumes coloridos a cada refeição para aumentar a ingestão de vitaminas.",
  "Evita alimentos processados e prioriza alimentos integrais.",
  "Os frutos secos são ótimos para lanches rápidos e saudáveis.",
  "Não saltes o pequeno-almoço! É uma refeição importante para o metabolismo.",
  "Planeia as refeições com antecedência para evitar escolhas alimentares impulsivas.",
  "Come devagar e mastiga bem os alimentos para melhorar a digestão.",
  "O azeite é uma excelente fonte de gorduras saudáveis para o coração.",
  "Limita o consumo de açúcar adicionado para melhorar a saúde geral."
];

// Array de dicas sobre treino
const workoutTips = [
  "A consistência é mais importante que a intensidade no início de um plano de treino.",
  "Inclui exercícios de força pelo menos 2 vezes por semana para todos os grupos musculares principais.",
  "Não te esqueças do aquecimento antes e do alongamento depois do treino.",
  "O descanso entre os treinos é essencial para a recuperação muscular.",
  "Aumenta gradualmente a intensidade dos treinos para evitar lesões.",
  "Varia os treinos para evitar o planalto e manter o progresso.",
  "A técnica correta é mais importante que o peso utilizado.",
  "Escuta o teu corpo: dor aguda não é normal durante o exercício.",
  "Treinar com um parceiro pode aumentar a motivação e a consistência.",
  "Define objetivos SMART: específicos, mensuráveis, atingíveis, relevantes e temporais."
];

// Array de dicas sobre saúde geral
const generalHealthTips = [
  "Dormir 7-9 horas por noite ajuda na recuperação e na composição corporal.",
  "Pequenas caminhadas após as refeições podem ajudar na digestão e no metabolismo.",
  "Pratica técnicas de respiração para reduzir o stress.",
  "Estabelece uma rotina regular para melhorar a qualidade do sono.",
  "Faz uma pausa de ecrãs pelo menos 1 hora antes de dormir para melhor qualidade de sono.",
  "A meditação regular pode melhorar a concentração e reduzir a ansiedade.",
  "Mantém um registo do teu progresso para te manteres motivado.",
  "Celebra pequenas vitórias no teu percurso de saúde e fitness.",
  "Tira um dia por semana para descontrair completamente do treino.",
  "Lembra-te que a consistência a longo prazo é mais importante que a perfeição a curto prazo."
];

interface DailyTipProps {
  className?: string;
}

export function DailyTip({ className = '' }: DailyTipProps) {
  const [tip, setTip] = useState('');
  const [tipType, setTipType] = useState<'nutrition' | 'workout' | 'general'>('general');
  const [dismissed, setDismissed] = useState(false);
  
  // Função para selecionar uma dica aleatória
  const getRandomTip = () => {
    // Escolhe aleatoriamente entre os três tipos de dicas
    const typeIndex = Math.floor(Math.random() * 3);
    let selectedTip = '';
    
    if (typeIndex === 0) {
      setTipType('nutrition');
      const randomIndex = Math.floor(Math.random() * nutritionTips.length);
      selectedTip = nutritionTips[randomIndex];
    } else if (typeIndex === 1) {
      setTipType('workout');
      const randomIndex = Math.floor(Math.random() * workoutTips.length);
      selectedTip = workoutTips[randomIndex];
    } else {
      setTipType('general');
      const randomIndex = Math.floor(Math.random() * generalHealthTips.length);
      selectedTip = generalHealthTips[randomIndex];
    }
    
    setTip(selectedTip);
  };
  
  // Seleciona uma dica quando o componente é montado
  useEffect(() => {
    getRandomTip();
    
    // Verifica se uma dica já foi mostrada hoje
    const lastTipDate = localStorage.getItem('lastTipDate');
    const today = new Date().toDateString();
    
    if (lastTipDate === today) {
      const wasDismissed = localStorage.getItem('tipDismissed') === 'true';
      setDismissed(wasDismissed);
    } else {
      localStorage.setItem('lastTipDate', today);
      localStorage.setItem('tipDismissed', 'false');
      setDismissed(false);
    }
  }, []);
  
  // Função para dispensar a dica
  const dismissTip = () => {
    setDismissed(true);
    localStorage.setItem('tipDismissed', 'true');
  };
  
  // Função para mostrar uma nova dica
  const showNewTip = () => {
    getRandomTip();
  };
  
  if (dismissed) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${className}`}
    >
      <Card className="relative border-l-4 p-4 shadow-sm overflow-hidden bg-white" 
            style={{ 
              borderLeftColor: 
                tipType === 'nutrition' ? '#10b981' : 
                tipType === 'workout' ? '#3b82f6' : '#f59e0b' 
            }}>
        <div className="flex gap-3">
          <div className={`p-2 rounded-full ${
            tipType === 'nutrition' ? 'bg-green-100 text-green-600' : 
            tipType === 'workout' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
          }`}>
            <Lightbulb size={18} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">
              {tipType === 'nutrition' ? 'Dica de Nutrição' : 
               tipType === 'workout' ? 'Dica de Treino' : 'Dica de Saúde'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {tip}
            </p>
            
            <div className="flex justify-end mt-2">
              <Button variant="ghost" size="sm" onClick={showNewTip} className="text-xs">
                Nova dica
              </Button>
            </div>
          </div>
        </div>
        
        <button 
          onClick={dismissTip} 
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          aria-label="Dispensar dica"
        >
          <X size={16} />
        </button>
      </Card>
    </motion.div>
  );
}