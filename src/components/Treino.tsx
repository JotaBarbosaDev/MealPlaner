"use client";

import React, {FormEvent, useState} from "react";
import useLocalStorage from "use-local-storage";
import {toast} from "react-toastify";

// UI do shadcn
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
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

// Agora o Workout armazena apenas os índices dos exercícios
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
  const [exerciseDialogOpen, setExerciseDialogOpen] = useLocalStorage<boolean>(
    "exerciseDialogOpen",
    false
  );
  const [editExerciseIndex, setEditExerciseIndex] = useLocalStorage<
    number | undefined
  >("editExerciseIndex", undefined);
  const [exerciseName, setExerciseName] = useLocalStorage<string>(
    "exerciseName",
    ""
  );
  const [exerciseSeries, setExerciseSeries] = useLocalStorage<number>(
    "exerciseSeries",
    3
  );
  const [exerciseRepetitions, setExerciseRepetitions] = useLocalStorage<number>(
    "exerciseRepetitions",
    10
  );
  const [exercisePause, setExercisePause] = useLocalStorage<number>(
    "exercisePause",
    60
  );

  // Treinos
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>("workouts", []);
  const [workoutDialogOpen, setWorkoutDialogOpen] = useLocalStorage<boolean>(
    "workoutDialogOpen",
    false
  );
  const [editWorkoutIndex, setEditWorkoutIndex] = useLocalStorage<
    number | undefined
  >("editWorkoutIndex", undefined);
  const [workoutName, setWorkoutName] = useLocalStorage<string>(
    "workoutName",
    ""
  );
  // selectedExercises agora são apenas os índices
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

  // Mostrar/ocultar “Dias da Semana”
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

  /* =============================
     2) FUNÇÕES Exercícios
  ============================== */
  function handleAddExerciseSubmit(e: FormEvent) {
    e.preventDefault();
    if (!exerciseName.trim()) {
      toast("Preencha todos os campos corretamente.");
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
    toast("Exercício adicionado com sucesso!");
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
      toast("Preencha todos os campos corretamente.");
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
    toast("Exercício editado com sucesso!");
  }

  function handleDeleteExercise(index: number) {
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
    toast("Exercício apagado!");
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
      toast("Preencha o nome do treino.");
      return;
    }
    if (selectedExercises.length === 0) {
      toast("Selecione pelo menos um exercício.");
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
    toast("Treino adicionado com sucesso!");
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
      toast("Preencha o nome do treino.");
      return;
    }
    if (selectedExercises.length === 0) {
      toast("Selecione pelo menos um exercício.");
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
    toast("Treino editado com sucesso!");
  }

  function handleDeleteWorkout(index: number) {
    const newWorkouts = [...workouts];
    newWorkouts.splice(index, 1);
    setWorkouts(newWorkouts);
    toast("Treino apagado!");
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
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          🗓️ Plano Semanal
        </h2>
        <p className="text-sm text-gray-600">
          Defina o treino ou “Descanso” para cada dia:
        </p>

        <div className="space-y-2 mt-2">
          {days.map((day) => {
            const assignedWorkout = weeklyPlan[day];
            return (
              <Card key={day} className="p-2 bg-white flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm w-[130px] break-words">
                    {day}:
                  </span>
                  <span className="text-sm">{assignedWorkout}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Select
                    onValueChange={(val) =>
                      setWeeklyPlan({...weeklyPlan, [day]: val})
                    }
                    value={assignedWorkout}
                  >
                    <SelectTrigger className="w-full sm:w-[160px] text-sm">
                      <SelectValue placeholder="Selecionar Treino" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Primeira opção para definir o dia como descanso */}
                      <SelectItem value="Descanso">Descanso</SelectItem>
                      {workouts.map((wt, i) => (
                        <SelectItem key={i} value={wt.name}>
                          {wt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    );
  }

  /* =============================
     5) REGISTO DIÁRIO (séries)
  ============================== */
  function handleSaveSet() {
    if (!currentExercise || !selectedDay) {
      toast("Selecione dia e exercício.");
      return;
    }
    if (newSetReps <= 0 || newSetWeight < 0) {
      toast("Valores inválidos para repetições/peso.");
      return;
    }

    const assignedWorkout = weeklyPlan[selectedDay];
    if (!assignedWorkout || assignedWorkout === "Descanso") {
      toast("Não há treino neste dia!");
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

    toast(
      editSetIndex !== null
        ? "Set editado com sucesso!"
        : "Set adicionado ao registo de hoje!"
    );

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
        <p className="text-sm text-gray-500 italic">
          Nenhum set registado ainda.
        </p>
      );
    }

    const exLog = logEntry.exerciseLogs.find(
      (el) => el.exerciseName === currentExercise.name
    );
    if (!exLog || exLog.sets.length === 0) {
      return (
        <p className="text-sm text-gray-500 italic">
          Nenhum set registado ainda.
        </p>
      );
    }

    return (
      <div className="space-y-2 mt-2">
        {exLog.sets.map((s, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <span className="font-medium text-green-700">Set {idx + 1}</span>
              <div className="flex gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="text-xs">🔄</span>
                  {s.reps} reps
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-xs">⚖️</span>
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
          </div>
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
        <p className="text-sm text-gray-500 italic">
          Nenhum registo para este dia.
        </p>
      );
    }

    return logsOfThisDayAndWorkout.map((log, idx) => {
      const isOpen = openLogDates.includes(log.date);
      return (
        <div
          key={idx}
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
          {isOpen && (
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
                            <div className="flex items-center gap-2">
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
          )}
        </div>
      );
    });
  }

  /* =============================
     6) RENDER FINAL
  ============================== */
  return (
    <div className="space-y-8">
      {/* Seção de Exercícios */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-green-600">💪</span> Exercícios
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (expandedExercises.length === exercises.length) {
                  setExpandedExercises([]);
                } else {
                  setExpandedExercises(exercises.map((_, i) => i));
                }
              }}
              className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
            >
              {expandedExercises.length === exercises.length
                ? "Minimizar Todos"
                : "Expandir Todos"}
            </Button>
            <Button
              onClick={() => setExerciseDialogOpen(true)}
              className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
            >
              + Novo Exercício
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          {exercises.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-gray-500">Nenhum exercício cadastrado</p>
              <Button
                onClick={() => setExerciseDialogOpen(true)}
                className="mt-3 bg-green-50 text-green-600 hover:bg-green-100"
              >
                Adicionar Primeiro Exercício
              </Button>
            </div>
          ) : (
            exercises.map((ex, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 hover:border-green-200 transition-all duration-300"
              >
                <div
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => {
                    if (expandedExercises.includes(i)) {
                      setExpandedExercises(
                        expandedExercises.filter((idx) => idx !== i)
                      );
                    } else {
                      setExpandedExercises([...expandedExercises, i]);
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                      <span className="text-green-600 text-lg">💪</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{ex.name}</h3>
                      {!expandedExercises.includes(i) && (
                        <div className="flex gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="text-green-600 text-xs">🔄</span>
                            {ex.series} séries
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-green-600 text-xs">🎯</span>
                            {ex.repetitions} reps
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-gray-400 mr-2">
                      {expandedExercises.includes(i) ? "▼" : "▶"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-green-600 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditExerciseClick(i);
                      }}
                    >
                      ✏️
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
                      🗑️
                    </Button>
                  </div>
                </div>
                {expandedExercises.includes(i) && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <div className="grid gap-4">
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="text-green-600 text-xs">🔄</span>
                          {ex.series} séries
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-green-600 text-xs">🎯</span>
                          {ex.repetitions} reps
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-green-600 text-xs">⏱️</span>
                          {ex.pause}s pausa
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Seção de Treinos */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-green-600">🏋️</span> Treinos
          </h2>
          <Button
            onClick={() => setWorkoutDialogOpen(true)}
            className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
          >
            + Novo Treino
          </Button>
        </div>

        <div className="grid gap-3">
          {workouts.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-gray-500">Nenhum treino cadastrado</p>
              <Button
                onClick={() => setWorkoutDialogOpen(true)}
                className="mt-3 bg-green-50 text-green-600 hover:bg-green-100"
              >
                Criar Primeiro Treino
              </Button>
            </div>
          ) : (
            workouts.map((wt, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 hover:border-green-200 transition-all duration-300"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                        <span className="text-green-600 text-lg">🏋️</span>
                      </div>
                      <h3 className="font-medium text-gray-800">{wt.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-green-600 hover:bg-green-50"
                        onClick={() => handleEditWorkoutClick(i)}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteWorkout(i)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>

                  <div className="ml-14 grid gap-2">
                    {wt.exerciseIds
                      ? wt.exerciseIds.map((exId, j) => {
                          const ex = exercises[exId];
                          if (!ex) return null;
                          return (
                            <div
                              key={j}
                              className="bg-gray-50 rounded-lg p-2 text-sm flex justify-between items-center"
                            >
                              <span className="text-gray-600">{ex.name}</span>
                              <span className="text-xs text-gray-500">
                                {ex.series}x{ex.repetitions}
                              </span>
                            </div>
                          );
                        })
                      : wt.exercises?.map((ex, j) => (
                          <div
                            key={j}
                            className="bg-gray-50 rounded-lg p-2 text-sm flex justify-between items-center"
                          >
                            <span className="text-gray-600">{ex.name}</span>
                            <span className="text-xs text-gray-500">
                              {ex.series}x{ex.repetitions}
                            </span>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Seção do Plano Semanal */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <span className="text-green-600">📅</span> Plano Semanal
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Object.entries(weeklyPlan).map(([day, workout]) => {
            const isRest = workout === "Descanso";
            return (
              <div
                key={day}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:border-green-200 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-600">{day}</span>
                  <Select
                    value={workout}
                    onValueChange={(val) =>
                      setWeeklyPlan({...weeklyPlan, [day]: val})
                    }
                  >
                    <SelectTrigger className="w-[140px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Descanso">
                        <span className="flex items-center gap-2">
                          <span>😴</span> Descanso
                        </span>
                      </SelectItem>
                      {workouts.map((wt, i) => (
                        <SelectItem key={i} value={wt.name}>
                          <span className="flex items-center gap-2">
                            <span>🏋️</span> {wt.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div
                  className={`text-sm ${
                    isRest ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {isRest ? (
                    <span className="flex items-center gap-2">
                      <span>😴</span> Dia de Descanso
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>🏋️</span> {workout}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dialog de Exercício */}
      <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="text-green-600">💪</span>
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
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Grid de Configurações */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl space-y-4">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <span className="text-green-600">⚙️</span> Configurações
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Séries */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="text-green-600">🔄</span> Séries
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={exerciseSeries}
                      onChange={(e) =>
                        setExerciseSeries(Number(e.target.value))
                      }
                      min="1"
                      className="pr-8 bg-gradient-to-r from-green-50 to-green-100/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      x
                    </span>
                  </div>
                </div>

                {/* Repetições */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="text-green-600">🎯</span> Repetições
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={exerciseRepetitions}
                      onChange={(e) =>
                        setExerciseRepetitions(Number(e.target.value))
                      }
                      min="1"
                      className="pr-12 bg-gradient-to-r from-amber-50 to-amber-100/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      reps
                    </span>
                  </div>
                </div>

                {/* Pausa */}
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="text-green-600">⏱️</span> Tempo de Pausa
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={exercisePause}
                      onChange={(e) => setExercisePause(Number(e.target.value))}
                      min="0"
                      className="pr-16 bg-gradient-to-r from-blue-50 to-blue-100/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
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
                <span>{editExerciseIndex !== undefined ? "💾" : "➕"}</span>
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
              <span className="text-green-600">🏋️</span>
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
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Seleção de Exercícios */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl space-y-4">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <span className="text-green-600">💪</span> Exercícios do Treino
                <span className="ml-auto text-xs text-gray-500">
                  {selectedExercises.length} selecionados
                </span>
              </h3>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
                <div className="max-h-[300px] overflow-y-auto p-3 space-y-2">
                  {exercises.length === 0 ? (
                    <div className="text-center py-8">
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
                        className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
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
                          <div className="flex gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <span className="text-green-600">🔄</span>
                              {ex.series} séries
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-green-600">🎯</span>
                              {ex.repetitions} reps
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-green-600">⏱️</span>
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
                <span>{editWorkoutIndex !== undefined ? "💾" : "➕"}</span>
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
