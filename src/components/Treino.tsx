"use client";

import React, { FormEvent, useState } from "react";
import useLocalStorage from "use-local-storage";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { 
  Dumbbell, 
  Calendar, 
  Repeat, 
  Timer, 
  Target, 
  Save, 
  PlusCircle, 
  Edit, 
  Trash, 
  ChevronDown, 
  Weight, 
  ActivitySquare, 
  Bed, 
  Settings,
  CheckCircle2,
  Pencil,
  Plus,
  ClipboardList,
  ArrowDownCircle,
  Award,
  RefreshCw,
  FileText,
  ListChecks,
  BarChart3,
  CirclePlus,
  CircleCheck
} from "lucide-react";

// Componentes compartilhados
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ExpandableCard } from "@/components/shared/ExpandableCard";

// UI do shadcn
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

/* -------------------------------------
   TIPOS de TREINO
--------------------------------------*/
type DayOfWeek =
  | "Segunda-feira"
  | "Terça-feira"
  | "Quarta-feira"
  | "Quinta-feira"
  | "Sexta-feira"
  | "Sábado"
  | "Domingo";

interface Exercise {
  name: string;
  series: number;
  repetitions: number;
  pause: number; // seg
}

interface Workout {
  name: string;
  exerciseIds?: number[];
  exercises?: Exercise[];
}

interface WeeklyPlan {
  [key: string]: string; // Dia -> Nome do Treino ou "Descanso"
}

interface TrainingSet {
  reps: number;
  weight: number;
}
interface ExerciseLog {
  exerciseName: string;
  sets: TrainingSet[];
}
interface TrainingLogEntry {
  date: string;
  dayOfWeek: DayOfWeek;
  workoutName: string;
  exerciseLogs: ExerciseLog[];
}

/* -------------------------------------
   COMPONENTE PRINCIPAL: Treino()
--------------------------------------*/
export default function Treino() {
  /* =============================
     1) ESTADOS PRINCIPAIS
  ============================== */
  // Exercícios
  const [exercises, setExercises] = useLocalStorage<Exercise[]>(
    "exercises",
    []
  );
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);
  const [editExerciseIndex, setEditExerciseIndex] = useState<number | undefined>(undefined);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseSeries, setExerciseSeries] = useState(3);
  const [exerciseRepetitions, setExerciseRepetitions] = useState(10);
  const [exercisePause, setExercisePause] = useState(60);

  // Treinos
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>("workouts", []);
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [editWorkoutIndex, setEditWorkoutIndex] = useState<number | undefined>(undefined);
  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);

  // Plano Semanal
  const [weeklyPlan, setWeeklyPlan] = useLocalStorage<WeeklyPlan>(
    "weeklyPlan",
    {
      "Segunda-feira": "Descanso",
      "Terça-feira": "Descanso",
      "Quarta-feira": "Descanso",
      "Quinta-feira": "Descanso",
      "Sexta-feira": "Descanso",
      Sábado: "Descanso",
      Domingo: "Descanso",
    }
  );

  // Registos de treino
  const [trainingLogs, setTrainingLogs] = useLocalStorage<TrainingLogEntry[]>(
    "trainingLogs",
    []
  );

  // Mostrar/ocultar "Dias da Semana"
  const [showWeeklyTraining, setShowWeeklyTraining] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);

  // Exercício selecionado p/ registar sets
  const [exerciseLogDialogOpen, setExerciseLogDialogOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);

  // Formulário de sets
  const [newSetReps, setNewSetReps] = useState(0);
  const [newSetWeight, setNewSetWeight] = useState(0);
  const [editSetIndex, setEditSetIndex] = useState<number | null>(null);

  // Para expandir/minimizar logs por data
  const [openLogDates, setOpenLogDates] = useState<string[]>([]);

  // Adicionar estado para exercícios expandidos após os outros estados
  const [expandedExercises, setExpandedExercises] = useState<number[]>([]);

  // Estado para controlar animações de seções
  const [activeTab, setActiveTab] = useState<"exercises" | "workouts" | "weekly">("exercises");

  // Utilizando o toast do ShadcnUI ao invés do react-toastify
  const { toast } = useToast();

  /* =============================
     2) FUNÇÕES Exercícios
  ============================== */
  function handleAddExerciseSubmit(e: FormEvent) {
    e.preventDefault();
    if (!exerciseName.trim()) {
      toast({
        title: "Campos incompletos",
        description: "Preencha todos os campos corretamente.",
        variant: "destructive"
      });
      return;
    }
    const exercise: Exercise = {
      name: exerciseName.trim(),
      series: exerciseSeries,
      repetitions: exerciseRepetitions,
      pause: exercisePause,
    };
    setExercises([...exercises, exercise]);
    clearExerciseFields();
    setExerciseDialogOpen(false);
    toast({
      title: "Exercício adicionado",
      description: `${exerciseName} foi adicionado com sucesso!`,
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-700"
    });
  }

  function handleEditExerciseClick(index: number) {
    const ex = exercises[index];
    setEditExerciseIndex(index);
    setExerciseName(ex.name);
    setExerciseSeries(ex.series);
    setExerciseRepetitions(ex.repetitions);
    setExercisePause(ex.pause);
    setExerciseDialogOpen(true);
  }

  function handleEditExerciseSubmit(e: FormEvent) {
    e.preventDefault();
    if (editExerciseIndex === undefined) return;
    if (!exerciseName.trim()) {
      toast({
        title: "Campos incompletos",
        description: "Preencha todos os campos corretamente.",
        variant: "destructive"
      });
      return;
    }

    // Guarda o nome antigo para atualizar os logs
    const oldName = exercises[editExerciseIndex]?.name;

    const updatedExercise: Exercise = {
      name: exerciseName.trim(),
      series: exerciseSeries,
      repetitions: exerciseRepetitions,
      pause: exercisePause,
    };

    // Atualiza o array de exercícios
    const newExercises = [...exercises];
    newExercises[editExerciseIndex] = updatedExercise;
    setExercises(newExercises);

    // Atualiza os logs que referenciam o exercício (por nome)
    if (oldName && oldName !== updatedExercise.name) {
      const updatedLogs = trainingLogs.map((log) => {
        const updatedExerciseLogs = log.exerciseLogs.map((exLog) => {
          if (exLog.exerciseName === oldName) {
            return {...exLog, exerciseName: updatedExercise.name};
          }
          return exLog;
        });
        return {...log, exerciseLogs: updatedExerciseLogs};
      });
      setTrainingLogs(updatedLogs);
    }

    clearExerciseFields();
    setEditExerciseIndex(undefined);
    setExerciseDialogOpen(false);
    toast({
      title: "Exercício atualizado",
      description: `${exerciseName} foi atualizado com sucesso!`,
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-700"
    });
  }

  function handleDeleteExercise(index: number) {
    const newExercises = [...exercises];
    const exerciseName = newExercises[index].name;
    newExercises.splice(index, 1);
    setExercises(newExercises);
    toast({
      title: "Exercício removido",
      description: `${exerciseName} foi removido com sucesso.`,
      variant: "default",
      className: "bg-red-50 border-red-200 text-red-700"
    });
  }

  function clearExerciseFields() {
    setExerciseName("");
    setExerciseSeries(3);
    setExerciseRepetitions(10);
    setExercisePause(60);
  }

  /* =============================
     3) FUNÇÕES Treinos
  ============================== */
  function handleAddWorkoutSubmit(e: FormEvent) {
    e.preventDefault();
    if (!workoutName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Preencha o nome do treino.",
        variant: "destructive"
      });
      return;
    }
    if (selectedExercises.length === 0) {
      toast({
        title: "Exercícios necessários", 
        description: "Selecione pelo menos um exercício.",
        variant: "destructive"
      });
      return;
    }

    // Em vez de guardar o objeto todo do exercício, guardamos apenas os índices
    const workout: Workout = {
      name: workoutName.trim(),
      exerciseIds: selectedExercises,
    };
    setWorkouts([...workouts, workout]);
    clearWorkoutFields();
    setWorkoutDialogOpen(false);
    toast({
      title: "Treino adicionado",
      description: `${workoutName} foi criado com sucesso!`,
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-700"
    });
  }

  function handleEditWorkoutClick(index: number) {
    const wt = workouts[index];
    setEditWorkoutIndex(index);
    setWorkoutName(wt.name);
    // Se o treino antigo não estiver migrado, garantimos que usamos um array (ou vazio)
    setSelectedExercises(Array.isArray(wt.exerciseIds) ? wt.exerciseIds : []);
    setWorkoutDialogOpen(true);
  }

  function handleEditWorkoutSubmit(e: FormEvent) {
    e.preventDefault();
    if (editWorkoutIndex === undefined) return;
    if (!workoutName.trim()) {
      toast({
        title: "Preencha o nome do treino.",
        variant: "destructive"
      });
      return;
    }
    if (selectedExercises.length === 0) {
      toast({
        title: "Selecione pelo menos um exercício.",
        variant: "destructive"
      });
      return;
    }

    const newWorkouts = [...workouts];
    newWorkouts[editWorkoutIndex] = {
      name: workoutName.trim(),
      exerciseIds: selectedExercises,
    };
    setWorkouts(newWorkouts);
    clearWorkoutFields();
    setEditWorkoutIndex(undefined);
    setWorkoutDialogOpen(false);
    toast({
      title: "Treino editado",
      description: `${workoutName} foi atualizado com sucesso!`,
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-700"
    });
  }

  function handleDeleteWorkout(index: number) {
    const newWorkouts = [...workouts];
    const workoutName = newWorkouts[index].name;
    newWorkouts.splice(index, 1);
    setWorkouts(newWorkouts);
    toast({
      title: "Treino removido",
      description: `${workoutName} foi removido com sucesso.`,
      variant: "default",
      className: "bg-red-50 border-red-200 text-red-700"
    });
  }

  function clearWorkoutFields() {
    setWorkoutName("");
    setSelectedExercises([]);
  }

  /* =============================
     4) PLANO SEMANAL
  ============================== */
  function renderWeeklyPlan() {
    const days = Object.keys(weeklyPlan) as DayOfWeek[];
    
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {days.map((day) => {
          const assignedWorkout = weeklyPlan[day];
          const isRest = assignedWorkout === "Descanso";
          
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3,
                delay: days.indexOf(day) * 0.05
              }}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:border-green-200 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">{day}</span>
                <Badge 
                  variant="outline" 
                  className={isRest ? 
                    "bg-gray-100 text-gray-500" : 
                    "bg-green-50 text-green-600 border-green-200"}
                >
                  {isRest ? "Descanso" : "Treino"}
                </Badge>
              </div>
              
              <Select
                value={assignedWorkout}
                onValueChange={(val) => setWeeklyPlan({...weeklyPlan, [day]: val})}
              >
                <SelectTrigger className="w-full text-sm">
                  <div className="flex items-center gap-2">
                    {isRest ? 
                      <Bed size={18} className="text-gray-500" /> : 
                      <Dumbbell size={18} className="text-green-600" />
                    }
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Descanso">
                    <span className="flex items-center gap-2">
                      <Bed size={16} className="text-gray-500" /> Descanso
                    </span>
                  </SelectItem>
                  {workouts.map((wt, i) => (
                    <SelectItem key={i} value={wt.name}>
                      <span className="flex items-center gap-2">
                        <Dumbbell size={16} className="text-green-600" /> {wt.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {!isRest && (
                <div className="mt-3 text-xs text-gray-500">
                  {(() => {
                    const wt = workouts.find(w => w.name === assignedWorkout);
                    if (!wt) return "Treino não encontrado";
                    
                    let count = 0;
                    if (wt.exerciseIds) count = wt.exerciseIds.length;
                    else if (wt.exercises) count = wt.exercises.length;
                    
                    return `${count} exercício${count !== 1 ? 's' : ''}`;
                  })()}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  }

  /* =============================
     5) REGISTO DIÁRIO (séries)
  ============================== */
  function handleSaveSet() {
    if (!currentExercise || !selectedDay) {
      toast({
        title: "Campos incompletos", 
        description: "Selecione dia e exercício.",
        variant: "destructive"
      });
      return;
    }
    if (newSetReps <= 0 || newSetWeight < 0) {
      toast({
        title: "Valores inválidos",
        description: "Valores inválidos para repetições/peso.",
        variant: "destructive"
      });
      return;
    }

    const assignedWorkout = weeklyPlan[selectedDay];
    if (!assignedWorkout || assignedWorkout === "Descanso") {
      toast({
        title: "Dia de descanso",
        description: "Não há treino neste dia!",
        variant: "destructive"
      });
      return;
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const existingLogIndex = trainingLogs.findIndex(
      (log) =>
        log.date === todayDate &&
        log.dayOfWeek === selectedDay &&
        log.workoutName === assignedWorkout
    );

    let updatedLogs = [...trainingLogs];
    let targetLog: TrainingLogEntry;

    if (existingLogIndex >= 0) {
      targetLog = {...updatedLogs[existingLogIndex]};
    } else {
      targetLog = {
        date: todayDate,
        dayOfWeek: selectedDay,
        workoutName: assignedWorkout,
        exerciseLogs: [],
      };
    }

    // Localiza ou cria log para o exercício
    const exerciseLogIndex = targetLog.exerciseLogs.findIndex(
      (el) => el.exerciseName === currentExercise.name
    );
    let exLog: ExerciseLog;
    if (exerciseLogIndex >= 0) {
      exLog = {...targetLog.exerciseLogs[exerciseLogIndex]};
    } else {
      exLog = {exerciseName: currentExercise.name, sets: []};
    }

    if (editSetIndex !== null) {
      exLog.sets[editSetIndex] = {reps: newSetReps, weight: newSetWeight};
    } else {
      exLog.sets.push({reps: newSetReps, weight: newSetWeight});
    }

    if (exerciseLogIndex >= 0) {
      targetLog.exerciseLogs[exerciseLogIndex] = exLog;
    } else {
      targetLog.exerciseLogs.push(exLog);
    }

    if (existingLogIndex >= 0) {
      updatedLogs[existingLogIndex] = targetLog;
    } else {
      updatedLogs.push(targetLog);
    }
    setTrainingLogs(updatedLogs);

    toast({
      title: editSetIndex !== null ? "Set editado" : "Set registrado",
      description: editSetIndex !== null
        ? "Set editado com sucesso!"
        : "Set adicionado ao registo de hoje!",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-700"
    });

    // Reset
    setNewSetReps(0);
    setNewSetWeight(0);
    setEditSetIndex(null);
  }

  function openExerciseLogDialog(ex: Exercise) {
    setCurrentExercise(ex);
    setExerciseLogDialogOpen(true);
    setNewSetReps(0);
    setNewSetWeight(0);
    setEditSetIndex(null);
  }

  function renderSetsOfCurrentExercise() {
    if (!currentExercise || !selectedDay) {
      return (
        <p className="text-sm text-gray-500 italic">
          Nenhum exercício selecionado.
        </p>
      );
    }
    const assignedWorkout = weeklyPlan[selectedDay];
    if (!assignedWorkout || assignedWorkout === "Descanso") {
      return <p className="text-sm italic">Dia de descanso.</p>;
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const logEntry = trainingLogs.find(
      (log) =>
        log.date === todayDate &&
        log.dayOfWeek === selectedDay &&
        log.workoutName === assignedWorkout
    );
    if (!logEntry) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">
            Nenhum set registado ainda.
          </p>
        </div>
      );
    }

    const exLog = logEntry.exerciseLogs.find(
      (el) => el.exerciseName === currentExercise.name
    );
    if (!exLog || exLog.sets.length === 0) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">
            Nenhum set registado ainda para {currentExercise.name}.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2 mt-2">
        {exLog.sets.map((s, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-medium">
                {idx + 1}
              </span>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Repeat size={16} className="text-green-600" />
                  {s.reps} reps
                </span>
                <span className="flex items-center gap-1">
                  <Weight size={16} className="text-green-600" />
                  {s.weight} kg
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-green-50 hover:text-green-700 transition-colors"
              onClick={() => {
                setEditSetIndex(idx);
                setNewSetReps(s.reps);
                setNewSetWeight(s.weight);
              }}
            >
              ✏️ Editar
            </Button>
          </motion.div>
        ))}
      </div>
    );
  }

  // Expande logs passados por data
  function toggleLogDate(date: string) {
    if (openLogDates.includes(date)) {
      setOpenLogDates(openLogDates.filter((d) => d !== date));
    } else {
      setOpenLogDates([...openLogDates, date]);
    }
  }

  function renderDayLogHistory(currentWorkoutName: string) {
    const logsOfThisDayAndWorkout = trainingLogs.filter(
      (log) =>
        log.dayOfWeek === selectedDay && log.workoutName === currentWorkoutName
    );
    
    if (logsOfThisDayAndWorkout.length === 0) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">
            Nenhum registo para este dia.
          </p>
        </div>
      );
    }

    return logsOfThisDayAndWorkout.map((log, idx) => {
      const isOpen = openLogDates.includes(log.date);
      return (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <Button
            variant="ghost"
            className="w-full text-sm justify-between p-4 hover:bg-gray-50"
            onClick={() => toggleLogDate(log.date)}
          >
            <span className="font-medium text-green-700 flex items-center gap-2">
              <span className="text-lg">📅</span>
              {new Date(log.date).toLocaleDateString("pt-PT", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </Button>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
                  {log.exerciseLogs.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      Nenhum exercício registado.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {log.exerciseLogs.map((exLog, exIdx) => (
                        <div
                          key={exIdx}
                          className="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
                        >
                          <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                            <span className="text-lg">💪</span>
                            {exLog.exerciseName}
                          </h4>
                          <div className="grid gap-2">
                            {exLog.sets.map((s, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-gray-700">
                                    Set {sIdx + 1}
                                  </span>
                                </div>
                                <div className="flex gap-4">
                                  <span className="text-gray-600 flex items-center gap-1">
                                    <span className="text-xs">🔄</span>
                                    {s.reps} reps
                                  </span>
                                  <span className="text-gray-600 flex items-center gap-1">
                                    <span className="text-xs">⚖️</span>
                                    {s.weight} kg
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );
    });
  }

  /* =============================
     6) RENDER FINAL
  ============================== */
  // Tabs de navegação
  const renderTabs = () => (
    <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg mb-6">
      {[
        { id: "exercises", label: "Exercícios", icon: <ActivitySquare size={18} className={activeTab === "exercises" ? "text-white" : "text-green-600"} /> },
        { id: "workouts", label: "Treinos", icon: <Dumbbell size={18} className={activeTab === "workouts" ? "text-white" : "text-blue-600"} /> },
        { id: "weekly", label: "Plano Semanal", icon: <Calendar size={18} className={activeTab === "weekly" ? "text-white" : "text-amber-600"} /> }
      ].map((tab) => (
        <Button 
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          className={`flex-1 gap-2 ${activeTab === tab.id ? "bg-green-600 text-white" : "text-gray-600 hover:text-green-700"}`}
          onClick={() => setActiveTab(tab.id as any)}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
        </Button>
      ))}
    </div>
  );

  // Função para obter o emoji apropriado para o exercício
  const getExerciseEmoji = (exerciseName: string) => {
    const nameLower = exerciseName.toLowerCase();
    
    if (nameLower.includes("supino")) return "🏋️";
    if (nameLower.includes("agacha") || nameLower.includes("leg") || nameLower.includes("squat")) return "🦵";
    if (nameLower.includes("rosca") || nameLower.includes("bíceps") || nameLower.includes("curl")) return "💪";
    if (nameLower.includes("ombro") || nameLower.includes("shoulder")) return "🧍";
    if (nameLower.includes("peito") || nameLower.includes("chest")) return "⚡";
    if (nameLower.includes("costa") || nameLower.includes("back") || nameLower.includes("dorsal")) return "🔙";
    if (nameLower.includes("abdom") || nameLower.includes("abs")) return "🧠";
    if (nameLower.includes("corrid") || nameLower.includes("run")) return "🏃";
    if (nameLower.includes("corda") || nameLower.includes("pular")) return "⏱️";
    if (nameLower.includes("cardio")) return "❤️";
    
    // Emoji padrão para outros exercícios
    return "🏆";
  };

  return (
    <div className="space-y-6">
      {/* Tabs de navegação */}
      {renderTabs()}

      {/* Seção de Exercícios */}
      <AnimatePresence mode="wait">
        {activeTab === "exercises" && (
          <motion.div
            key="exercises"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionHeader
              title="Gerenciamento de Exercícios"
              icon={<ActivitySquare size={20} className="text-green-600" />}
              description="Cadastre exercícios para construir seus treinos"
              action={
                <Button
                  onClick={() => setExerciseDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white transition-all"
                >
                  + Novo Exercício
                </Button>
              }
            />

            <div className="bg-white p-4 rounded-xl border border-gray-100 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatCard
                  icon={<ActivitySquare size={18} className="text-amber-600" />}
                  label="Total"
                  value={exercises.length}
                  unit="exercícios"
                  size="sm"
                  color="amber"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => {
                  if (expandedExercises.length === exercises.length) {
                    setExpandedExercises([]);
                  } else {
                    setExpandedExercises(exercises.map((_, i) => i));
                  }
                }}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                {expandedExercises.length === exercises.length
                  ? "Minimizar Todos"
                  : "Expandir Todos"}
              </Button>
            </div>

            <div className="grid gap-3">
              {exercises.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <ActivitySquare size={48} className="text-green-600 mb-3 mx-auto" />
                  <p className="text-gray-600 font-medium mb-3">Nenhum exercício cadastrado</p>
                  <Button
                    onClick={() => setExerciseDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Adicionar Primeiro Exercício
                  </Button>
                </div>
              ) : (
                exercises.map((ex, i) => (
                  <ExpandableCard
                    key={i}
                    title={ex.name}
                    icon={getExerciseEmoji(ex.name)}
                    defaultExpanded={expandedExercises.includes(i)}
                    actions={
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-green-600 hover:bg-green-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditExerciseClick(i);
                          }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteExercise(i);
                          }}
                        >
                          <Trash size={16} />
                        </Button>
                      </>
                    }
                  >
                    <div className="grid gap-4">
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-lg border border-green-100">
                          <Repeat size={16} className="text-green-600" />
                          {ex.series} séries
                        </span>
                        <span className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                          <Target size={16} className="text-blue-600" />
                          {ex.repetitions} repetições
                        </span>
                        <span className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                          <Timer size={16} className="text-amber-600" />
                          {ex.pause}s pausa
                        </span>
                      </div>
                    </div>
                  </ExpandableCard>
                ))
              )}
            </div>
          </motion.div>
        )}
        
        {/* Seção de Treinos */}
        {activeTab === "workouts" && (
          <motion.div
            key="workouts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionHeader
              title="Composição de Treinos"
              icon={<Dumbbell size={20} className="text-blue-600" />}
              description="Crie treinos combinando exercícios"
              action={
                <Button
                  onClick={() => setWorkoutDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white transition-all"
                  disabled={exercises.length === 0}
                >
                  + Novo Treino
                </Button>
              }
            />

            {exercises.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-600 mb-3">
                  Você precisa cadastrar exercícios antes de criar treinos.
                </p>
                <Button
                  onClick={() => setActiveTab("exercises")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Ir para Exercícios
                </Button>
              </Card>
            ) : (
              <div className="grid gap-3">
                {workouts.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <span className="text-4xl mb-3 block">🏋️</span>
                    <p className="text-gray-600 font-medium mb-3">Nenhum treino cadastrado</p>
                    <Button
                      onClick={() => setWorkoutDialogOpen(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Criar Primeiro Treino
                    </Button>
                  </div>
                ) : (
                  workouts.map((wt, i) => (
                    <ExpandableCard
                      key={i}
                      title={wt.name}
                      icon="🏋️"
                      defaultExpanded={true}
                      actions={
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-green-600 hover:bg-green-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditWorkoutClick(i);
                            }}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWorkout(i);
                            }}
                          >
                            <Trash size={16} />
                          </Button>
                        </>
                      }
                    >
                      <div className="space-y-2">
                        {wt.exerciseIds
                          ? wt.exerciseIds.map((exId, j) => {
                              const ex = exercises[exId];
                              if (!ex) return null;
                              return (
                                <motion.div
                                  key={j}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: j * 0.05 }}
                                  className="bg-gray-50 rounded-lg p-3 flex justify-between items-center border border-gray-100 hover:border-green-200 hover:bg-white transition-all duration-200"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium">
                                      {j+1}
                                    </span>
                                    <div>
                                      <span className="text-gray-700 font-medium flex items-center gap-2">
                                        {getExerciseEmoji(ex.name)} {ex.name}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {ex.series} séries x {ex.repetitions} repetições • {ex.pause}s pausa
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })
                          : wt.exercises?.map((ex, j) => (
                              <motion.div
                                key={j}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: j * 0.05 }}
                                className="bg-gray-50 rounded-lg p-3 flex justify-between items-center border border-gray-100 hover:border-green-200 hover:bg-white transition-all duration-200"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium">
                                    {j+1}
                                  </span>
                                  <div>
                                    <span className="text-gray-700 font-medium flex items-center gap-2">
                                      {getExerciseEmoji(ex.name)} {ex.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {ex.series} séries x {ex.repetitions} repetições • {ex.pause}s pausa
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                      </div>
                    </ExpandableCard>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Seção do Plano Semanal */}
        {activeTab === "weekly" && (
          <motion.div
            key="weekly"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionHeader
              title="Plano Semanal de Treinos"
              icon={<Calendar size={20} className="text-amber-600" />}
              description="Organize seus treinos ao longo da semana"
            />

            {workouts.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-600 mb-3">
                  Você precisa criar treinos antes de montar seu plano semanal.
                </p>
                <Button
                  onClick={() => setActiveTab("workouts")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Ir para Treinos
                </Button>
              </Card>
            ) : renderWeeklyPlan()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog de Exercício */}
      <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ActivitySquare size={20} className="text-green-600" />
              {editExerciseIndex !== undefined ? "Editar" : "Novo"} Exercício
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Preencha os detalhes do exercício para{" "}
              {editExerciseIndex !== undefined ? "editar" : "adicionar"}.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={
              editExerciseIndex !== undefined
                ? handleEditExerciseSubmit
                : handleAddExerciseSubmit
            }
            className="space-y-6"
          >
            {/* Nome do Exercício */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Nome do Exercício</Label>
              <Input
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="Ex: Supino Reto"
                className="bg-white/90"
              />
            </div>

            {/* Grid de Configurações */}
            <div className="border border-gray-100 rounded-xl bg-white/80 p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-700">Configurações</h3>
                <div className="h-6 w-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <Settings size={14} className="text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Séries */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-2">
                    <Repeat size={14} className="text-gray-500" />
                    Séries
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={exerciseSeries}
                      onChange={(e) =>
                        setExerciseSeries(Number(e.target.value))
                      }
                      min="1"
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      x
                    </span>
                  </div>
                </div>

                {/* Repetições */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-2">
                    <Target size={14} className="text-gray-500" />
                    Repetições
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={exerciseRepetitions}
                      onChange={(e) =>
                        setExerciseRepetitions(Number(e.target.value))
                      }
                      min="1"
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      reps
                    </span>
                  </div>
                </div>

                {/* Pausa */}
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-2">
                    <Timer size={14} className="text-gray-500" />
                    Tempo de Pausa
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={exercisePause}
                      onChange={(e) => setExercisePause(Number(e.target.value))}
                      min="0"
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      segundos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  clearExerciseFields();
                  setEditExerciseIndex(undefined);
                  setExerciseDialogOpen(false);
                }}
                className="hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                {editExerciseIndex !== undefined ? (
                  <Save size={16} />
                ) : (
                  <Plus size={16} />
                )}
                {editExerciseIndex !== undefined
                  ? "Salvar Alterações"
                  : "Adicionar Exercício"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Treino */}
      <Dialog open={workoutDialogOpen} onOpenChange={setWorkoutDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Dumbbell size={20} className="text-green-600" />
              {editWorkoutIndex !== undefined ? "Editar" : "Novo"} Treino
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Configure os detalhes do treino e selecione os exercícios que o
              compõem.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={
              editWorkoutIndex !== undefined
                ? handleEditWorkoutSubmit
                : handleAddWorkoutSubmit
            }
            className="space-y-6"
          >
            {/* Nome do Treino */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Nome do Treino</Label>
              <Input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Ex: Treino A - Peito e Tríceps"
                className="bg-white/90"
              />
            </div>

            {/* Seleção de Exercícios */}
            <div className="border border-gray-100 rounded-xl bg-white/80 p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-700">Exercícios do Treino</h3>
                <Badge className="bg-green-600">{selectedExercises.length} selecionados</Badge>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-3 space-y-2">
                  {exercises.length === 0 ? (
                    <div className="text-center py-8">
                      <ActivitySquare size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Nenhum exercício cadastrado
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setWorkoutDialogOpen(false);
                          setExerciseDialogOpen(true);
                        }}
                        className="mt-2 text-green-600 hover:text-green-700"
                      >
                        Cadastrar Exercício
                      </Button>
                    </div>
                  ) : (
                    exercises.map((ex, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                          selectedExercises.includes(i)
                            ? "bg-green-50 border border-green-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedExercises.includes(i)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedExercises([...selectedExercises, i]);
                            } else {
                              setSelectedExercises(
                                selectedExercises.filter((idx) => idx !== i)
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-700">{ex.name}</p>
                          <div className="flex gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Repeat size={12} className="text-gray-400" />
                              {ex.series} séries
                            </span>
                            <span className="flex items-center gap-1">
                              <Target size={12} className="text-gray-400" />
                              {ex.repetitions} reps
                            </span>
                            <span className="flex items-center gap-1">
                              <Timer size={12} className="text-gray-400" />
                              {ex.pause}s
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  clearWorkoutFields();
                  setEditWorkoutIndex(undefined);
                  setWorkoutDialogOpen(false);
                }}
                className="hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
                disabled={selectedExercises.length === 0}
              >
                {editWorkoutIndex !== undefined ? (
                  <Save size={16} />
                ) : (
                  <Plus size={16} />
                )}
                {editWorkoutIndex !== undefined
                  ? "Salvar Alterações"
                  : "Adicionar Treino"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
