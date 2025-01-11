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
  exerciseIds: number[];
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
        <p className="text-sm text-gray-500">Nenhum exercício selecionado.</p>
      );
    }
    const assignedWorkout = weeklyPlan[selectedDay];
    if (!assignedWorkout || assignedWorkout === "Descanso") {
      return <p className="text-sm">Dia de descanso.</p>;
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const logEntry = trainingLogs.find(
      (log) =>
        log.date === todayDate &&
        log.dayOfWeek === selectedDay &&
        log.workoutName === assignedWorkout
    );
    if (!logEntry) {
      return <p className="text-sm">Nenhum set registado ainda.</p>;
    }

    const exLog = logEntry.exerciseLogs.find(
      (el) => el.exerciseName === currentExercise.name
    );
    if (!exLog || exLog.sets.length === 0) {
      return <p className="text-sm">Nenhum set registado ainda.</p>;
    }

    return (
      <ul className="space-y-1 mt-2">
        {exLog.sets.map((s, idx) => (
          <li key={idx} className="flex justify-between items-center text-sm">
            <span>
              Set {idx + 1}: {s.reps} rep / {s.weight} kg
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditSetIndex(idx);
                setNewSetReps(s.reps);
                setNewSetWeight(s.weight);
              }}
            >
              Editar
            </Button>
          </li>
        ))}
      </ul>
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
        <p className="text-sm text-gray-500">Nenhum registo para este dia.</p>
      );
    }

    return logsOfThisDayAndWorkout.map((log, idx) => {
      const isOpen = openLogDates.includes(log.date);
      return (
        <div key={idx} className="border p-2 rounded mt-2 bg-gray-100">
          <Button
            variant="outline"
            className="w-full text-sm justify-between"
            onClick={() => toggleLogDate(log.date)}
          >
            <span>Data: {log.date}</span>
            <span>{isOpen ? "▲" : "▼"}</span>
          </Button>
          {isOpen && (
            <div className="mt-2">
              {log.exerciseLogs.length === 0 ? (
                <p>Nenhum exercício registado.</p>
              ) : (
                <ul className="list-disc ml-4">
                  {log.exerciseLogs.map((exLog, exIdx) => (
                    <li key={exIdx} className="mb-2 text-sm">
                      <strong>{exLog.exerciseName}</strong>
                      <ul className="list-none ml-0">
                        {exLog.sets.map((s, sIdx) => (
                          <li key={sIdx}>
                            Set {sIdx + 1}: {s.reps} reps, {s.weight} kg
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
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
    <div className="space-y-6 pb-8">
      {/* (A) Registo Diário (sempre visível) */}
      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            💪 Registo Diário
          </h2>
          <Button onClick={() => setShowWeeklyTraining(!showWeeklyTraining)}>
            {showWeeklyTraining ? "Fechar Dias" : "Ver Dias"}
          </Button>
        </div>
        <p className="text-sm text-gray-700">
          Selecione o dia e clique em “Registar” no exercício para adicionar
          séries.
        </p>

        {showWeeklyTraining && (
          <div className="mt-3 space-y-4">
            {/* Botões dos dias */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(weeklyPlan) as DayOfWeek[]).map((day) => {
                const assignedWorkout = weeklyPlan[day];
                const isSelected = selectedDay === day;
                return (
                  <Button
                    key={day}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className="w-[120px] text-xs"
                    onClick={() => setSelectedDay(day)}
                  >
                    {assignedWorkout === "Descanso" ? `${day} \u{1F6CF}` : day}
                  </Button>
                );
              })}
            </div>

            {selectedDay && (
              <>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => setSelectedDay(null)}
                >
                  Limpar Dia Selecionado
                </Button>
                {selectedDay && renderDayLogHistory(weeklyPlan[selectedDay])}
              </>
            )}
          </div>
        )}
      </Card>

      {/* (B) Lista de Exercícios */}
      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            🏋️ Exercícios
          </h2>
          <Button onClick={() => setExerciseDialogOpen(true)}>Adicionar</Button>
        </div>
        {exercises.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum exercício criado.</p>
        ) : (
          <div className="space-y-2">
            {exercises.map((ex, i) => (
              <Card
                key={i}
                className="p-2 bg-white text-sm flex items-center justify-between"
              >
                <div>
                  <strong>{ex.name}</strong>
                  <br />
                  Séries: {ex.series} | Repetições: {ex.repetitions} | Pausa:{" "}
                  {ex.pause}s
                </div>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEditExerciseClick(i)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteExercise(i)}
                  >
                    Apagar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* (C) Lista de Treinos */}
      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {"\u{1F3CB}\u{FE0F}"} Treinos
          </h2>
          <Button onClick={() => setWorkoutDialogOpen(true)}>Adicionar</Button>
        </div>
        {workouts.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum treino criado.</p>
        ) : (
          <div className="space-y-2">
            {workouts.map((wt, i) => (
              <Card key={i} className="p-2 bg-white text-sm space-y-1">
                <div className="flex justify-between items-center">
                  <strong>{wt.name}</strong>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditWorkoutClick(i)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteWorkout(i)}
                    >
                      Apagar
                    </Button>
                  </div>
                </div>
                <ul className="ml-4 list-disc text-xs text-gray-700 mt-1">
                  {(Array.isArray(wt.exerciseIds) ? wt.exerciseIds : []).map(
                    (exId, j) => {
                      const ex = exercises[exId];
                      if (!ex) return null;
                      return (
                        <li key={j}>
                          {ex.name} – {ex.series}x{ex.repetitions}, pausa{" "}
                          {ex.pause}s
                        </li>
                      );
                    }
                  )}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* (D) Plano Semanal */}
      {renderWeeklyPlan()}

      {/* ====================== DIALOGs ====================== */}

      {/* Dialog Exercício */}
      <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editExerciseIndex !== undefined
                ? "Editar Exercício"
                : "Adicionar Exercício"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={
              editExerciseIndex !== undefined
                ? handleEditExerciseSubmit
                : handleAddExerciseSubmit
            }
            className="space-y-2"
          >
            <Label>Nome:</Label>
            <Input
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
            />
            <Label>Séries:</Label>
            <Input
              type="number"
              value={exerciseSeries}
              onChange={(e) => setExerciseSeries(Number(e.target.value))}
            />
            <Label>Repetições:</Label>
            <Input
              type="number"
              value={exerciseRepetitions}
              onChange={(e) => setExerciseRepetitions(Number(e.target.value))}
            />
            <Label>Pausa (segundos):</Label>
            <Input
              type="number"
              value={exercisePause}
              onChange={(e) => setExercisePause(Number(e.target.value))}
            />
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditExerciseIndex(undefined);
                  setExerciseDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editExerciseIndex !== undefined ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Treino */}
      <Dialog open={workoutDialogOpen} onOpenChange={setWorkoutDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editWorkoutIndex !== undefined
                ? "Editar Treino"
                : "Adicionar Treino"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={
              editWorkoutIndex !== undefined
                ? handleEditWorkoutSubmit
                : handleAddWorkoutSubmit
            }
            className="space-y-2"
          >
            <Label>Nome do Treino:</Label>
            <Input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
            <Label>Exercícios:</Label>
            <div className="space-y-1 max-h-40 overflow-y-auto border p-2 rounded">
              {exercises.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhum exercício disponível.
                </p>
              ) : (
                exercises.map((ex, i) => (
                  <div key={i} className="flex items-center">
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
                      className="mr-2"
                    />
                    <span>{ex.name}</span>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditWorkoutIndex(undefined);
                  setWorkoutDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editWorkoutIndex !== undefined ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Registo de Séries */}
      <Dialog
        open={exerciseLogDialogOpen}
        onOpenChange={setExerciseLogDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Registar Séries - {currentExercise?.name || ""}
            </DialogTitle>
          </DialogHeader>
          {currentExercise && (
            <div className="space-y-2">
              <div>
                <Label>Número de Repetições:</Label>
                <Input
                  type="number"
                  value={newSetReps}
                  onChange={(e) => setNewSetReps(Number(e.target.value))}
                  onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                    if (Number(e.target.value) === 0) e.target.value = "";
                  }}
                />
              </div>
              <div>
                <Label>Peso (kg):</Label>
                <Input
                  type="number"
                  value={newSetWeight}
                  onChange={(e) => setNewSetWeight(Number(e.target.value))}
                  onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                    if (Number(e.target.value) === 0) e.target.value = "";
                  }}
                />
              </div>
              <Button onClick={handleSaveSet}>
                {editSetIndex !== null ? "Salvar Set" : "Adicionar Set"}
              </Button>
              <hr className="my-2" />
              <h4 className="font-semibold">Sets de Hoje</h4>
              {renderSetsOfCurrentExercise()}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setExerciseLogDialogOpen(false);
                setEditSetIndex(null);
                setNewSetReps(0);
                setNewSetWeight(0);
              }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
