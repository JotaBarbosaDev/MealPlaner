"use client";

import React, { useMemo } from "react";
import useLocalStorage from "use-local-storage";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { 
  Home, Activity, Scale, Target, Flame, 
  BarChart3, Utensils, CalendarCheck, LayoutGrid, 
  Dumbbell, Apple, Weight, Calendar, Trophy, TrendingUp
} from "lucide-react";

// Componentes partilhados
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ExpandableCard } from "@/components/shared/ExpandableCard";
import { StreakCard } from "@/components/shared/StreakCard";
import { DailyTip } from "@/components/shared/DailyTip";

// Componentes UI
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Tipos
import type { Measurement } from "@/types/pesagens";
import type { Workout, WeeklyPlan, TrainingLogEntry, Exercise } from "@/types/treino";
import type { Meal, Plate, Product } from "@/types/dieta";
import type { UserStreaks, Streak } from "@/types/streaks";

export default function Principal() {
  const { toast } = useToast();
  
  /* =============================
     1) ESTADOS (do localStorage)
  ============================== */
  // Dieta
  const [meals] = useLocalStorage<Meal[]>("meals", []);
  const [calTarget] = useLocalStorage<number>("calTarget", 1975);
  const [protPercent] = useLocalStorage<number>("protPercent", 30);
  const [fatPercent] = useLocalStorage<number>("fatPercent", 20);
  const [carbPercent] = useLocalStorage<number>("carbPercent", 50);

  // Treino
  const [exercises] = useLocalStorage<Exercise[]>("exercises", []);
  const [workouts] = useLocalStorage<Workout[]>("workouts", []);
  const [weeklyPlan] = useLocalStorage<WeeklyPlan>("weeklyPlan", {});
  const [trainingLogs] = useLocalStorage<TrainingLogEntry[]>("trainingLogs", []);

  // Pesagens
  const [measurements] = useLocalStorage<Measurement[]>("measurements", []);

  // Sequências (Streaks)
  const emptyStreak: Streak = {
    count: 0,
    lastUpdate: new Date().toISOString(),
    startDate: new Date().toISOString(),
  };
  
  const [streaks, setStreaks] = useLocalStorage<UserStreaks>("streaks", {
    diet: emptyStreak,
    training: emptyStreak
  });

  /* =============================
     2) CÁLCULOS E AUXILIARES
  ============================== */
  // Data atual
  const today = new Date();
  const dayNames = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  const currentDayOfWeek = dayNames[today.getDay()];
  const formattedDate = today.toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Verifica se hoje é dia de treino
  const todayWorkout = weeklyPlan && weeklyPlan[currentDayOfWeek];
  const isTrainingDay = todayWorkout && todayWorkout !== "Descanso";

  // Últimas medições
  const lastMeasurement = useMemo(() => {
    if (!measurements || measurements.length === 0) return null;

    return [...measurements].sort((a, b) => {
      return new Date(`${b.date}T${b.time}`).getTime() - 
             new Date(`${a.date}T${a.time}`).getTime();
    })[0];
  }, [measurements]);

  // Cálculo de IMC
  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return 0;
    const heightMeters = height / 100;
    return +(weight / (heightMeters * heightMeters)).toFixed(1);
  };

  // Classificar IMC
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Abaixo do peso", color: "text-blue-600" };
    if (bmi < 25) return { label: "Peso normal", color: "text-green-600" };
    if (bmi < 30) return { label: "Excesso de peso", color: "text-yellow-600" };
    if (bmi < 35) return { label: "Obesidade grau I", color: "text-orange-600" };
    if (bmi < 40) return { label: "Obesidade grau II", color: "text-red-600" };
    return { label: "Obesidade grau III", color: "text-red-800" };
  };

  // Cálculo de calorias diárias por macros
  const calculateDailyTargets = () => {
    const p = ((protPercent / 100) * calTarget) / 4;
    const f = ((fatPercent / 100) * calTarget) / 9;
    const c = ((carbPercent / 100) * calTarget) / 4;
    return { p, f, c, cal: calTarget };
  };

  // Contagem de treinos na semana
  const weeklyTrainingCount = useMemo(() => {
    if (!weeklyPlan) return 0;
    return Object.values(weeklyPlan).filter(val => val !== "Descanso").length;
  }, [weeklyPlan]);

  // Estatísticas de treino
  const trainingStats = useMemo(() => {
    if (!trainingLogs || trainingLogs.length === 0) return null;

    const totalWorkouts = trainingLogs.length;
    
    // Encontrar último treino
    const lastTraining = [...trainingLogs].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })[0];
    
    return {
      totalWorkouts,
      lastTrainingDate: lastTraining.date,
      lastWorkoutName: lastTraining.workoutName
    };
  }, [trainingLogs]);

  // Verificar e atualizar sequências (streaks)
  const updateTrainingStreak = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const newStreaks = { ...streaks };
    
    // Verificar se a última atualização foi há mais de 48 horas (quebra de sequência)
    const lastUpdate = new Date(streaks.training.lastUpdate);
    const hoursDiff = (today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 48) {
      // Reiniciar a sequência
      newStreaks.training = {
        count: 1,
        lastUpdate: today.toISOString(),
        startDate: today.toISOString()
      };
    } else {
      // Continuar a sequência
      newStreaks.training = {
        count: streaks.training.count + 1,
        lastUpdate: today.toISOString(),
        startDate: streaks.training.startDate
      };
    }
    
    setStreaks(newStreaks);
    return newStreaks.training.count;
  };

  const updateDietStreak = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const newStreaks = { ...streaks };
    
    // Verificar se a última atualização foi há mais de 24 horas (quebra de sequência)
    const lastUpdate = new Date(streaks.diet.lastUpdate);
    const hoursDiff = (today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      // Reiniciar a sequência
      newStreaks.diet = {
        count: 1,
        lastUpdate: today.toISOString(),
        startDate: today.toISOString()
      };
    } else {
      // Continuar a sequência
      newStreaks.diet = {
        count: streaks.diet.count + 1,
        lastUpdate: today.toISOString(),
        startDate: streaks.diet.startDate
      };
    }
    
    setStreaks(newStreaks);
    return newStreaks.diet.count;
  };

  /* =============================
     3) RENDER
  ============================== */
  const daily = calculateDailyTargets();
  
  return (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Olá!</h1>
            <p className="text-gray-500">{formattedDate}</p>
          </div>
          
          <div>
            {isTrainingDay ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 text-sm">
                Hoje é dia de treino: {todayWorkout}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 text-sm">
                Hoje é dia de descanso
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* Dica do dia */}
      <DailyTip className="mb-2" />

      {/* Sequências (Streaks) */}
      <SectionHeader
        title="As Tuas Sequências"
        icon={<Flame className="text-orange-500" size={20} />}
        description="Mantém o foco nos teus objetivos diários"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StreakCard type="training" streak={streaks.training} />
        <StreakCard type="diet" streak={streaks.diet} />
      </div>

      {/* Resumo rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Target size={24} />}
          label="Meta Calórica"
          value={calTarget}
          unit="kcal"
          color="amber"
          delay={0.1}
        />
        
        <StatCard
          icon={<Dumbbell size={24} />}
          label="Treinos Semanais"
          value={weeklyTrainingCount}
          unit="dias"
          color="green"
          delay={0.2}
        />
        
        {lastMeasurement && (
          <StatCard
            icon={<Scale size={24} />}
            label="Peso Atual"
            value={lastMeasurement.weight}
            unit="kg"
            color="blue"
            delay={0.3}
          />
        )}
        
        {lastMeasurement && (
          <StatCard
            icon={<Activity size={24} />}
            label="IMC"
            value={calculateBMI(lastMeasurement.weight, lastMeasurement.height)}
            unit=""
            color="rose"
            delay={0.4}
          />
        )}
      </div>

      {/* Treino de Hoje */}
      <SectionHeader
        title="Plano de Hoje"
        icon={<Calendar className="text-blue-500" size={20} />}
        description={`${currentDayOfWeek}, ${today.getDate()} de ${today.toLocaleDateString('pt-PT', {month: 'long'})}`}
      />

      {isTrainingDay ? (
        <ExpandableCard
          title={todayWorkout}
          icon={<Dumbbell className="text-blue-600" size={20} />}
          defaultExpanded={true}
          subtitle="Treino de Hoje"
          hideExpandButton={false}
        >
          <div className="space-y-3">
            {workouts
              .filter(w => w.name === todayWorkout)
              .map((workout, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="bg-green-50 py-2 px-3 rounded-lg text-sm text-green-700">
                    {workout.exerciseIds ? workout.exerciseIds.length : workout.exercises?.length || 0} exercícios neste treino
                  </div>
                  
                  <div className="space-y-2">
                    {workout.exerciseIds ? 
                      workout.exerciseIds.map((exId, i) => {
                        const ex = exercises[exId];
                        if (!ex) return null;
                        
                        return (
                          <div 
                            key={i} 
                            className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <span className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center font-medium text-green-700">
                                {i+1}
                              </span>
                              <span className="font-medium text-gray-700">{ex.name}</span>
                            </div>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                              {ex.series} × {ex.repetitions}
                            </span>
                          </div>
                        );
                      }) : 
                      workout.exercises?.map((ex, i) => (
                        <div 
                          key={i} 
                          className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center font-medium text-green-700">
                              {i+1}
                            </span>
                            <span className="font-medium text-gray-700">{ex.name}</span>
                          </div>
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                            {ex.series} × {ex.repetitions}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              ))}

              <div className="flex justify-end mt-4">
                <Button 
                  onClick={() => {
                    const newCount = updateTrainingStreak();
                    toast({
                      title: "Treino Registado",
                      description: `Sequência atual: ${newCount} ${newCount === 1 ? 'dia' : 'dias'}!`,
                      duration: 3000
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CalendarCheck size={16} className="mr-2" />
                  Registar treino concluído
                </Button>
              </div>
          </div>
        </ExpandableCard>
      ) : (
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-3">
            <Calendar size={32} className="text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Dia de Descanso</h3>
          <p className="text-gray-500">
            Hoje é o teu dia para recuperação. Aproveita para descansar e preparar-te para o próximo treino!
          </p>
        </Card>
      )}

      {/* Resumo de Nutrição */}
      <SectionHeader 
        title="Meta Nutricional Diária"
        icon={<Utensils className="text-green-500" size={20} />}
        description="Distribuição de macronutrientes"
      />
      
      <Card className="p-4">
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Calorias</div>
              <div className="font-medium flex items-baseline gap-1">
                <span className="text-lg">{daily.cal.toFixed(0)}</span>
                <span className="text-xs text-gray-400">kcal</span>
              </div>
            </div>
            
            <div className="bg-rose-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Proteínas</div>
              <div className="font-medium flex items-baseline gap-1">
                <span className="text-lg">{daily.p.toFixed(0)}</span>
                <span className="text-xs text-gray-400">g</span>
                <span className="text-xs text-rose-500 ml-auto">{protPercent}%</span>
              </div>
            </div>
            
            <div className="bg-amber-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Hidratos</div>
              <div className="font-medium flex items-baseline gap-1">
                <span className="text-lg">{daily.c.toFixed(0)}</span>
                <span className="text-xs text-gray-400">g</span>
                <span className="text-xs text-amber-500 ml-auto">{carbPercent}%</span>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Gorduras</div>
              <div className="font-medium flex items-baseline gap-1">
                <span className="text-lg">{daily.f.toFixed(0)}</span>
                <span className="text-xs text-gray-400">g</span>
                <span className="text-xs text-blue-500 ml-auto">{fatPercent}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-sm text-gray-500">Distribuição de macros</div>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 bg-rose-400 rounded-full"></span>
                  <span>Proteínas</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 bg-amber-400 rounded-full"></span>
                  <span>Hidratos</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 bg-blue-400 rounded-full"></span>
                  <span>Gorduras</span>
                </span>
              </div>
            </div>
            
            <div className="mt-2 flex h-4 rounded-full overflow-hidden">
              <div 
                className="bg-rose-400" 
                style={{ width: `${protPercent}%` }}
              ></div>
              <div 
                className="bg-amber-400" 
                style={{ width: `${carbPercent}%` }}
              ></div>
              <div 
                className="bg-blue-400" 
                style={{ width: `${fatPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => {
                const newCount = updateDietStreak();
                toast({
                  title: "Meta Nutricional Cumprida",
                  description: `Sequência atual: ${newCount} ${newCount === 1 ? 'dia' : 'dias'}!`,
                  duration: 3000
                });
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <CalendarCheck size={16} className="mr-2" />
              Registar meta cumprida
            </Button>
          </div>
        </div>
      </Card>

      {/* Status & Progresso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Últimas Medições */}
        <Card className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-700 flex items-center gap-2">
              <Scale size={18} className="text-green-600" /> Medição mais recente
            </h3>
            <Badge variant="outline" className="text-xs">
              {measurements.length} medições
            </Badge>
          </div>
          
          {lastMeasurement ? (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Data</span>
                  <span className="text-sm font-medium">
                    {new Date(`${lastMeasurement.date}T${lastMeasurement.time || '00:00'}`).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Peso</div>
                  <div className="font-medium text-gray-800">
                    {lastMeasurement.weight} kg
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">IMC</div>
                  <div className="font-medium text-gray-800 flex items-center gap-1">
                    {calculateBMI(lastMeasurement.weight, lastMeasurement.height)}
                    <span className={`text-xs ${getBMICategory(calculateBMI(lastMeasurement.weight, lastMeasurement.height)).color}`}>
                      ({getBMICategory(calculateBMI(lastMeasurement.weight, lastMeasurement.height)).label})
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Massa Muscular</div>
                  <div className="font-medium text-gray-800 flex items-baseline gap-1">
                    <span>{lastMeasurement.muscleMassKg} kg</span>
                    <span className="text-xs text-gray-500">
                      ({lastMeasurement.muscleMassPercent}%)
                    </span>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Massa Gorda</div>
                  <div className="font-medium text-gray-800">
                    {lastMeasurement.fatMassPercent}%
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>Nenhuma medição registada</p>
              <Button 
                variant="outline"
                className="mt-2 text-green-600 border-green-200 hover:bg-green-50"
              >
                Adicionar Primeira Medição
              </Button>
            </div>
          )}
        </Card>
        
        {/* Status de Treino */}
        <Card className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-700 flex items-center gap-2">
              <Dumbbell size={18} className="text-green-600" /> Estado do Treino
            </h3>
            <Badge variant="outline" className="text-xs">
              {weeklyTrainingCount}/7 dias
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-green-50 to-green-100/30 p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Frequência de treinos</div>
              <div className="flex gap-1">
                {['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'].map((day, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 h-8 rounded-md flex items-center justify-center text-xs ${
                      weeklyPlan && weeklyPlan[day] && weeklyPlan[day] !== 'Descanso' 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-gray-100 text-gray-400'
                    } ${currentDayOfWeek === day ? 'ring-2 ring-green-500 ring-offset-1' : ''}`}
                    title={day}
                  >
                    {day.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white border border-gray-200 p-3 rounded-lg">
                <div className="text-xs text-gray-500">Treinos registados</div>
                <div className="font-medium text-gray-800">
                  {trainingLogs?.length || 0} registos
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 p-3 rounded-lg">
                <div className="text-xs text-gray-500">Exercícios cadastrados</div>
                <div className="font-medium text-gray-800">
                  {exercises?.length || 0} exercícios
                </div>
              </div>
            </div>
            
            {trainingStats && (
              <div className="bg-white border border-gray-200 p-3 rounded-lg">
                <div className="text-xs text-gray-500">Último treino registado</div>
                <div className="font-medium text-gray-800 flex flex-col">
                  <span>{trainingStats.lastWorkoutName}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(trainingStats.lastTrainingDate).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
