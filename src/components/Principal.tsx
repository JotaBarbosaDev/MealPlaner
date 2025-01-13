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
        <p className="text-sm text-gray-500 italic">
          Selecione um exercício para registrar os sets.
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

    const exLog = logEntry?.exerciseLogs.find(
      (el) => el.exerciseName === selectedExercise.name
    );

    if (!exLog || exLog.sets.length === 0) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">
            Nenhum set registado ainda para {selectedExercise.name}.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Use o formulário acima para adicionar sets.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {exLog.sets.map((s, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="p-3 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-medium">
                  {idx + 1}
                </span>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="text-green-600">🔄</span>
                    {s.reps} reps
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-green-600">⚖️</span>
                    {s.weight} kg
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="hover:bg-green-50 text-green-600"
                onClick={() => {
                  setEditSetIndex(idx);
                  setNewSetReps(s.reps);
                  setNewSetWeight(s.weight);
                }}
              >
                ✏️
              </Button>
            </div>
          </div>
        ))}
      </div>
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
      return (
        <p className="text-sm text-gray-500 italic">
          Selecione um dia acima para ver o treino.
        </p>
      );
    }

    const assignedWorkout = weeklyPlan[selectedDay];
    if (!assignedWorkout || assignedWorkout === "Descanso") {
      return (
        <div className="bg-gray-50 p-4 rounded-xl text-center">
          <span className="text-2xl mb-2 block">😴</span>
          <p className="text-sm text-gray-600">Dia de descanso.</p>
        </div>
      );
    }

    const wt = workouts.find((w) => w.name === assignedWorkout);
    if (!wt) {
      return (
        <p className="text-sm text-gray-600 italic">
          Treino "{assignedWorkout}" não encontrado.
        </p>
      );
    }

    let workoutExercises: Exercise[] = [];
    if (Array.isArray(wt.exercises)) {
      workoutExercises = wt.exercises;
    } else if (Array.isArray(wt.exerciseIds)) {
      workoutExercises = wt.exerciseIds
        .map((id) => exercises[id])
        .filter(Boolean);
    }

    if (workoutExercises.length === 0) {
      return (
        <p className="text-sm text-gray-500 italic">
          Nenhum exercício neste treino.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl">
          <h3 className="text-green-700 font-medium flex items-center gap-2">
            <span className="text-lg">🏋️</span>
            Treino: {assignedWorkout}
          </h3>
        </div>

        <div className="grid gap-2">
          {workoutExercises.map((ex, i) => {
            const isSelected =
              selectedExercise && selectedExercise.name === ex.name;
            return (
              <div
                key={i}
                className={`bg-white border rounded-xl transition-all duration-300 overflow-hidden
                  ${
                    isSelected
                      ? "border-green-200 shadow-md"
                      : "border-gray-200 hover:border-green-200 hover:shadow-sm"
                  }`}
              >
                <Button
                  className={`w-full justify-between p-4 h-auto
                    ${isSelected ? "bg-green-50" : "hover:bg-gray-50"}`}
                  variant="ghost"
                  onClick={() => {
                    setSelectedExercise(ex);
                    setNewSetReps(0);
                    setNewSetWeight(0);
                    setEditSetIndex(null);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 text-lg">
                      {isSelected ? "🎯" : "💪"}
                    </span>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">{ex.name}</p>
                      <div className="flex gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <span className="text-green-600">🔄</span>
                          {ex.series}x{ex.repetitions}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-green-600">⏱️</span>
                          {ex.pause}s pausa
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-green-600">
                    {isSelected ? "▼" : "▶"}
                  </span>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
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
        <p className="text-sm text-gray-600 italic">
          Nenhuma refeição definida.
        </p>
      );
    }
    return meals.map((meal, i) => (
      <div
        key={i}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300"
      >
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50">
          <h3 className="text-base font-semibold text-green-700 flex items-center gap-2">
            <span className="text-lg">🍽️</span>
            {meal.name}
          </h3>
        </div>

        {meal.plates.length === 0 ? (
          <p className="text-sm text-gray-500 italic p-4">
            Nenhum prato nesta refeição.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {meal.plates.map((pl, j) => {
              const isOpen = openPlates.includes(pl.name);
              return (
                <div key={j} className="p-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-between hover:bg-green-50 transition-colors"
                    onClick={() => togglePlate(pl.name)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-green-600">
                        {isOpen ? "🔽" : "▶️"}
                      </span>
                      {pl.name}
                    </span>
                  </Button>

                  {isOpen && (
                    <div className="mt-2 space-y-2">
                      {pl.items.length === 0 ? (
                        <p className="text-sm text-gray-500 italic ml-6">
                          Nenhum produto neste prato.
                        </p>
                      ) : (
                        <div className="ml-6 space-y-2">
                          {pl.items.map((it, idx) => {
                            const product = products[it.productIndex];
                            if (!product) return null;
                            const factor = it.grams / 100;
                            const pVal = product.p * factor;
                            const fVal = product.f * factor;
                            const cVal = product.c * factor;
                            const calVal = product.cal * factor;

                            return (
                              <div
                                key={idx}
                                className="bg-gray-50 p-2 rounded-lg text-sm"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-700">
                                    {product.name}
                                  </span>
                                  <span className="text-gray-500">
                                    {it.grams}g
                                  </span>
                                </div>
                                <div className="mt-1 text-xs text-gray-600 flex gap-3">
                                  <span>HC: {cVal.toFixed(1)}g</span>
                                  <span>P: {pVal.toFixed(1)}g</span>
                                  <span>G: {fVal.toFixed(1)}g</span>
                                  <span>Cal: {calVal.toFixed(1)}</span>
                                </div>
                              </div>
                            );
                          })}

                          <div className="bg-green-50 p-2 rounded-lg mt-3">
                            <p className="text-sm font-medium text-green-700">
                              Total do Prato
                            </p>
                            {(() => {
                              const sp = sumPlate(pl);
                              return (
                                <div className="text-xs text-gray-600 flex gap-3 mt-1">
                                  <span>Cal: {sp.cal.toFixed(1)}kcal</span>
                                  <span>HC: {sp.c.toFixed(1)}g</span>
                                  <span>P: {sp.p.toFixed(1)}g</span>
                                  <span>G: {sp.f.toFixed(1)}g</span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    ));
  }

  /* ----------------------
     RENDER FINAL
  -----------------------*/
  return (
    <div className="min-h-screen flex flex-col">
      {/* TOPO */}
      <header className="bg-gradient-to-r from-green-500 via-green-400 to-emerald-400 text-white p-4 sm:p-6 shadow-lg rounded-xl mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-center flex items-center justify-center gap-3">
          <span className="text-2xl sm:text-3xl">🌱</span>
          Plano Nutricional + Treino
        </h1>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1 space-y-6">
        {/* Cartão de boas-vindas */}
        <Card className="p-4 sm:p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-3">
            Olá! <span className="text-2xl">👋</span>
          </h2>
          <p className="text-gray-600 mt-2">
            Aqui tens uma visão geral do teu treino e da tua dieta.
          </p>
        </Card>

        {/* TREINO */}
        <Card className="p-4 sm:p-6 bg-white space-y-4 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <span className="text-green-600">💪</span> Registo Diário de Treino
          </h2>

          {/* Renderiza os dias com design atualizado */}
          <div className="w-full overflow-x-auto py-2">
            <div className="flex space-x-2 whitespace-nowrap">
              {Object.keys(weeklyPlan).map((day) => {
                const isSelected = day === selectedDay;
                const assignedWorkout = weeklyPlan[day];
                const isRest = assignedWorkout === "Descanso";
                return (
                  <Button
                    key={day}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className={`min-w-[110px] sm:min-w-[140px] transition-all duration-300 ${
                      isSelected
                        ? "bg-green-600 hover:bg-green-700 text-white transform scale-105"
                        : isRest
                        ? "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        : "bg-white text-green-700 border-green-600 hover:bg-green-50"
                    }`}
                    onClick={() => setSelectedDay(day as DayOfWeek)}
                  >
                    {isRest ? `😴 ${day}` : `🏋️ ${day}`}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Renderiza os exercícios do dia selecionado */}
          {renderExercisesOfSelectedDay()}

          {/* Renderiza os inputs para registo de sets somente se houver dia e exercício selecionados */}
          {selectedDay && selectedExercise && (
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <span className="text-lg">📝</span>
                Registrar Set
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-gray-600">Repetições</Label>
                  <Input
                    type="number"
                    value={newSetReps}
                    onChange={(e) => setNewSetReps(Number(e.target.value))}
                    onFocus={(e) => {
                      if (Number(e.target.value) === 0) e.target.value = "";
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Peso (kg)</Label>
                  <Input
                    type="number"
                    value={newSetWeight}
                    onChange={(e) => setNewSetWeight(Number(e.target.value))}
                    onFocus={(e) => {
                      if (Number(e.target.value) === 0) e.target.value = "";
                    }}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSaveSet}
              >
                {editSetIndex !== null
                  ? "💾 Salvar Alteração"
                  : "➕ Adicionar Set"}
              </Button>

              <div className="mt-4">
                <h4 className="font-medium text-green-700 flex items-center gap-2 mb-3">
                  <span className="text-lg">📊</span>
                  Sets de Hoje
                </h4>
                {renderSetsOfSelectedExercise()}
              </div>
            </div>
          )}
        </Card>

        {/* DIETA */}
        <Card className="p-4 sm:p-6 bg-white space-y-4 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <span className="text-green-600">🍎</span> Plano Alimentar
          </h2>
          <p className="text-sm text-gray-600">
            Clica num prato para ver os produtos e totais de macros.
          </p>
          <div>{renderDietPlan()}</div>
        </Card>
      </main>
    </div>
  );
}
