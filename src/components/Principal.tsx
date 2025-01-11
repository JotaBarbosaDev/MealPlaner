"use client";

import React, {FormEvent, useState} from "react";
import useLocalStorage from "use-local-storage";
import {toast} from "react-toastify";

// Shadcn UI
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

/* -----------------------------------------
   Tipos/Tabelas para Treino e Dieta
-----------------------------------------*/
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
  pause: number; // em segundos
}

// Se o treino estiver no formato antigo, terá a chave "exercises" (array de Exercise)
// Se estiver no novo formato, terá "exerciseIds" (array de números)
interface Workout {
  name: string;
  exercises?: Exercise[];
  exerciseIds?: number[];
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
  date: string; // yyyy-mm-dd
  dayOfWeek: DayOfWeek;
  workoutName: string;
  exerciseLogs: ExerciseLog[];
}

// DIETA
type MealName = "Pequeno-Almoço" | "Almoço" | "Lanche da Tarde" | "Jantar";

interface Product {
  name: string;
  p: number; // Proteína/100g
  f: number; // Gordura/100g
  c: number; // Carboidratos/100g
  cal: number; // Calorias/100g
}

interface PlateItem {
  productIndex: number;
  grams: number;
}

interface Plate {
  name: string;
  mealName: MealName;
  items: PlateItem[];
}

interface PlateMeal {
  name: MealName;
  plates: Plate[];
}

/* -----------------------------------------
   COMPONENTE PRINCIPAL
-----------------------------------------*/
export default function Principal() {
  /* ----------------------
     ESTADOS - TREINO
  -----------------------*/
  const [exercises] = useLocalStorage<Exercise[]>("exercises", []);
  const [workouts] = useLocalStorage<Workout[]>("workouts", []);
  const [weeklyPlan] = useLocalStorage<WeeklyPlan>("weeklyPlan", {
    "Segunda-feira": "Descanso",
    "Terça-feira": "Descanso",
    "Quarta-feira": "Descanso",
    "Quinta-feira": "Descanso",
    "Sexta-feira": "Descanso",
    Sábado: "Descanso",
    Domingo: "Descanso",
  });
  const [trainingLogs, setTrainingLogs] = useLocalStorage<TrainingLogEntry[]>(
    "trainingLogs",
    []
  );

  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [newSetReps, setNewSetReps] = useState(0);
  const [newSetWeight, setNewSetWeight] = useState(0);
  const [editSetIndex, setEditSetIndex] = useState<number | null>(null);

  /* ----------------------
     FUNÇÃO: Adicionar/Editar Set
  -----------------------*/
  function handleSaveSet() {
    // Só tenta salvar se tanto o dia quanto o exercício estiverem selecionados
    if (!selectedDay || !selectedExercise) return;
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

    // Procura pelo log do exercício selecionado ou cria um novo
    const exerciseLogIndex = targetLog.exerciseLogs.findIndex(
      (el) => el.exerciseName === selectedExercise.name
    );
    let exLog: ExerciseLog;
    if (exerciseLogIndex >= 0) {
      exLog = {...targetLog.exerciseLogs[exerciseLogIndex]};
    } else {
      exLog = {exerciseName: selectedExercise.name, sets: []};
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

    // Reseta os inputs
    setNewSetReps(0);
    setNewSetWeight(0);
    setEditSetIndex(null);
  }

  /* ----------------------
     FUNÇÃO: Renderizar Sets do Exercício Selecionado
  -----------------------*/
  function renderSetsOfSelectedExercise() {
    if (!selectedDay || !selectedExercise) {
      return (
        <p className="text-sm text-gray-500">
          Selecione um exercício para registrar os sets.
        </p>
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
      (el) => el.exerciseName === selectedExercise.name
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

  /* ----------------------
     FUNÇÃO: Renderizar Dias da Semana
  -----------------------*/
  function renderWeeklyDays() {
    const days = Object.keys(weeklyPlan) as DayOfWeek[];
    return (
      <div className="w-full overflow-x-auto py-2">
        <div className="flex space-x-2 whitespace-nowrap">
          {days.map((day) => {
            const isSelected = day === selectedDay;
            const assignedWorkout = weeklyPlan[day];
            const isRest = assignedWorkout === "Descanso";
            return (
              <Button
                key={day}
                size="sm"
                variant={isSelected ? "default" : "outline"}
                className={`min-w-[110px] sm:min-w-[140px] transition-transform active:scale-95 ${
                  isRest
                    ? "bg-gray-100 text-gray-600"
                    : "bg-white text-green-700 border-green-700"
                }`}
                onClick={() => setSelectedDay(day)}
              >
                {isRest ? `😴 ${day}` : `🏋️ ${day}`}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ----------------------
     FUNÇÃO: Renderizar Exercícios do Dia Selecionado
  -----------------------*/
  function renderExercisesOfSelectedDay() {
    if (!selectedDay) {
      return <p className="text-sm">Selecione um dia acima.</p>;
    }

    const assignedWorkout = weeklyPlan[selectedDay];
    if (!assignedWorkout || assignedWorkout === "Descanso") {
      return <p className="text-sm text-gray-700">Dia de descanso.</p>;
    }

    const wt = workouts.find((w) => w.name === assignedWorkout);
    if (!wt) {
      return (
        <p className="text-sm text-gray-700">
          Treino “{assignedWorkout}” não encontrado.
        </p>
      );
    }

    // Detecta a estrutura do treino: antigo (exercises) ou novo (exerciseIds)
    let workoutExercises: Exercise[] = [];
    if (Array.isArray(wt.exercises)) {
      workoutExercises = wt.exercises;
    } else if (Array.isArray(wt.exerciseIds)) {
      workoutExercises = wt.exerciseIds
        .map((id) => exercises[id])
        .filter(Boolean);
    }

    if (workoutExercises.length === 0) {
      return <p className="text-sm">Nenhum exercício neste treino.</p>;
    }

    return (
      <ul className="mt-2 space-y-1">
        {workoutExercises.map((ex, i) => {
          const isSelected =
            selectedExercise && selectedExercise.name === ex.name;
          return (
            <li key={i} className="text-sm flex items-center gap-2">
              <Button
                size="sm"
                variant={isSelected ? "default" : "outline"}
                onClick={() => {
                  setSelectedExercise(ex);
                  setNewSetReps(0);
                  setNewSetWeight(0);
                  setEditSetIndex(null);
                }}
              >
                {ex.name}
              </Button>
              <span className="text-xs text-gray-500">
                {ex.series}x{ex.repetitions}, pausa {ex.pause}s
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  /* ----------------------
     DIETA
  -----------------------*/
  const [products] = useLocalStorage<Product[]>("products", []);
  const [meals] = useLocalStorage<PlateMeal[]>("meals", [
    {name: "Pequeno-Almoço", plates: []},
    {name: "Almoço", plates: []},
    {name: "Lanche da Tarde", plates: []},
    {name: "Jantar", plates: []},
  ]);

  const [openPlates, setOpenPlates] = useState<string[]>([]);

  function sumPlate(plate: Plate) {
    return plate.items.reduce(
      (acc, item) => {
        const product = products[item.productIndex];
        if (!product) return acc;
        const factor = item.grams / 100;
        return {
          p: acc.p + product.p * factor,
          f: acc.f + product.f * factor,
          c: acc.c + product.c * factor,
          cal: acc.cal + product.cal * factor,
        };
      },
      {p: 0, f: 0, c: 0, cal: 0}
    );
  }

  function togglePlate(plateName: string) {
    if (openPlates.includes(plateName)) {
      setOpenPlates(openPlates.filter((n) => n !== plateName));
    } else {
      setOpenPlates([...openPlates, plateName]);
    }
  }

  function renderDietPlan() {
    if (!meals || meals.length === 0) {
      return (
        <p className="text-sm text-gray-700">Nenhuma refeição definida.</p>
      );
    }
    return meals.map((meal, i) => (
      <Card
        key={i}
        className="p-2 bg-white mb-2 transition-colors hover:bg-gray-50"
      >
        <h3 className="text-base font-semibold text-green-700 mb-1">
          {meal.name}
        </h3>
        {meal.plates.length === 0 ? (
          <p className="text-xs text-gray-500">Nenhum prato nesta refeição.</p>
        ) : (
          <ul className="ml-4 mt-1 space-y-2">
            {meal.plates.map((pl, j) => {
              const isOpen = openPlates.includes(pl.name);
              return (
                <li key={j} className="border-b pb-2 last:border-none">
                  <Button
                    size="sm"
                    variant="outline"
                    className="transition-colors hover:bg-gray-100"
                    onClick={() => togglePlate(pl.name)}
                  >
                    {isOpen ? "▼" : "►"} {pl.name}
                  </Button>
                  {isOpen && (
                    <div className="mt-2 ml-4 border-l pl-2 border-gray-300 text-xs text-gray-700">
                      {pl.items.length === 0 ? (
                        <p>Nenhum produto neste prato.</p>
                      ) : (
                        <>
                          {pl.items.map((it, idx) => {
                            const product = products[it.productIndex];
                            if (!product) return null;
                            const factor = it.grams / 100;
                            const pVal = product.p * factor;
                            const fVal = product.f * factor;
                            const cVal = product.c * factor;
                            const calVal = product.cal * factor;
                            return (
                              <p key={idx} className="my-1">
                                • {product.name} – {it.grams}g | HC:{" "}
                                {cVal.toFixed(1)} | P: {pVal.toFixed(1)} | G:{" "}
                                {fVal.toFixed(1)} | Cal: {calVal.toFixed(1)}
                              </p>
                            );
                          })}
                          <div className="mt-1 font-semibold">
                            {(() => {
                              const sp = sumPlate(pl);
                              return (
                                <p>
                                  Total: {sp.cal.toFixed(1)}kcal | HC:{" "}
                                  {sp.c.toFixed(1)} | P: {sp.p.toFixed(1)} | G:{" "}
                                  {sp.f.toFixed(1)}
                                </p>
                              );
                            })()}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    ));
  }

  /* ----------------------
     RENDER FINAL
  -----------------------*/
  return (
    <div className="min-h-screen flex flex-col">
      {/* TOPO */}
      <header className="bg-gradient-to-r from-green-500 to-teal-400 text-white p-3 sm:p-4 shadow">
        <h1 className="text-lg sm:text-xl font-bold text-center flex items-center justify-center gap-2">
          <span>🌱</span>
          Plano Nutricional + Treino
        </h1>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1 p-2 sm:p-4 space-y-4 sm:space-y-6">
        {/* Cartão de boas-vindas */}
        <Card className="p-3 sm:p-4 bg-white shadow hover:shadow-md transition-shadow">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            Olá! <span className="text-xl">👋</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Aqui tens uma visão geral do teu treino e da tua dieta.
          </p>
        </Card>

        {/* TREINO */}
        <Card className="p-3 sm:p-4 bg-white space-y-3 shadow hover:shadow-md transition-shadow">
          <h2 className="text-base sm:text-lg font-semibold">
            Registo Diário de Treino
          </h2>
          {/* Renderiza os dias */}
          {renderWeeklyDays()}
          {/* Renderiza os exercícios do dia selecionado */}
          {renderExercisesOfSelectedDay()}

          {/* Renderiza os inputs para registo de sets somente se houver dia e exercício selecionados */}
          {selectedDay && selectedExercise && (
            <div className="mt-3 border p-2 rounded bg-gray-50 text-sm space-y-2">
              <p className="font-semibold">
                Dia: {selectedDay} | Exercício: {selectedExercise.name}
              </p>
              <div>
                <Label className="text-xs">Repetições:</Label>
                <Input
                  type="number"
                  value={newSetReps}
                  onChange={(e) => setNewSetReps(Number(e.target.value))}
                  onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                    // Evita que o input preencha automaticamente com "0"
                    if (Number(e.target.value) === 0) e.target.value = "";
                  }}
                />
              </div>
              <div>
                <Label className="text-xs">Peso (kg):</Label>
                <Input
                  type="number"
                  value={newSetWeight}
                  onChange={(e) => setNewSetWeight(Number(e.target.value))}
                  onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                    if (Number(e.target.value) === 0) e.target.value = "";
                  }}
                />
              </div>
              <Button size="sm" onClick={handleSaveSet}>
                {editSetIndex !== null ? "Salvar Alteração" : "Adicionar Set"}
              </Button>
              <div className="mt-2">
                <h4 className="text-sm font-semibold">Sets de Hoje</h4>
                {renderSetsOfSelectedExercise()}
              </div>
            </div>
          )}
        </Card>

        {/* DIETA */}
        <Card className="p-3 sm:p-4 bg-white space-y-2 shadow hover:shadow-md transition-shadow">
          <h2 className="text-base sm:text-lg font-semibold">
            Plano Alimentar
          </h2>
          <p className="text-xs sm:text-sm text-gray-700">
            Clica num prato para ver os produtos e totais de macros.
          </p>
          <div>{renderDietPlan()}</div>
        </Card>
      </main>
    </div>
  );
}
