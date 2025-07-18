import React, { FormEvent, useState } from "react";
import useLocalStorage from "use-local-storage";
import { LucideIcon, ListChecks, Edit, Trash, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Componentes compartilhados
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ExpandableCard } from "@/components/shared/ExpandableCard";

// UI do shadcnev
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tipos
import { Exercise, Workout } from "@/types/treino";

interface WorkoutManagerProps {
  onWorkoutChange?: (workouts: Workout[]) => void;
}

export function WorkoutManager({ onWorkoutChange }: WorkoutManagerProps) {
  // Estados
  const [exercises, setExercises] = useLocalStorage<Exercise[]>("exercises", []);
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>("workouts", []);
  
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [editWorkoutIndex, setEditWorkoutIndex] = useState<number | undefined>(undefined);
  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [expandedWorkouts, setExpandedWorkouts] = useState<number[]>([]);
  
  // Usando o toast do ShadcnUI
  const { toast } = useToast();
  
  // Função para toggle de expansion
  function toggleWorkoutExpanded(index: number) {
    setExpandedWorkouts((current) =>
      current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index]
    );
  }

  // Funções para gerenciamento de treinos
  function handleAddWorkoutSubmit(e: FormEvent) {
    e.preventDefault();
    if (!workoutName.trim() || selectedExercises.length === 0) {
      toast({
        title: "Campos incompletos",
        description: "Preencha todos os campos corretamente e adicione pelo menos um exercício.",
        variant: "destructive"
      });
      return;
    }
    
    const workout: Workout = {
      name: workoutName.trim(),
      exercises: selectedExercises,
    };
    
    const newWorkouts = [...workouts, workout];
    setWorkouts(newWorkouts);
    clearWorkoutFields();
    setWorkoutDialogOpen(false);
    toast({
      title: "Treino adicionado",
      description: `${workoutName} foi adicionado com sucesso!`,
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-700"
    });
    
    if (onWorkoutChange) onWorkoutChange(newWorkouts);
  }

  function handleEditWorkoutClick(index: number) {
    const workout = workouts[index];
    setEditWorkoutIndex(index);
    setWorkoutName(workout.name);
    setSelectedExercises(workout.exercises || []);
    setWorkoutDialogOpen(true);
  }

  function handleEditWorkoutSubmit(e: FormEvent) {
    e.preventDefault();
    if (editWorkoutIndex === undefined) return;
    if (!workoutName.trim() || selectedExercises.length === 0) {
      toast({
        title: "Campos incompletos",
        description: "Preencha todos os campos corretamente e adicione pelo menos um exercício.",
        variant: "destructive"
      });
      return;
    }

    const updatedWorkout: Workout = {
      name: workoutName.trim(),
      exercises: selectedExercises,
    };

    // Atualiza o array de treinos
    const newWorkouts = [...workouts];
    newWorkouts[editWorkoutIndex] = updatedWorkout;
    setWorkouts(newWorkouts);

    clearWorkoutFields();
    setEditWorkoutIndex(undefined);
    setWorkoutDialogOpen(false);
    toast({
      title: "Treino atualizado",
      description: `${workoutName} foi editado com sucesso!`,
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-700"
    });
    
    if (onWorkoutChange) onWorkoutChange(newWorkouts);
  }

  function handleDeleteWorkout(index: number) {
    const workoutName = workouts[index].name;
    const newWorkouts = [...workouts];
    newWorkouts.splice(index, 1);
    setWorkouts(newWorkouts);
    toast({
      title: "Treino removido",
      description: `${workoutName} foi removido com sucesso.`,
      variant: "default",
      className: "bg-red-50 border-red-200 text-red-700"
    });
    
    if (onWorkoutChange) onWorkoutChange(newWorkouts);
  }

  function clearWorkoutFields() {
    setWorkoutName("");
    setSelectedExercises([]);
  }

  function handleAddExerciseToWorkout(exerciseId: string) {
    const exercise = exercises.find((e, idx) => idx.toString() === exerciseId);
    if (exercise) {
      // Verifica se o exercício já está adicionado
      if (!selectedExercises.some((e) => e.name === exercise.name)) {
        setSelectedExercises([...selectedExercises, exercise]);
      } else {
        toast({
          title: "Exercício duplicado",
          description: "Este exercício já foi adicionado ao treino.",
          variant: "destructive"
        });
      }
    }
  }

  function handleRemoveExerciseFromWorkout(index: number) {
    const newSelectedExercises = [...selectedExercises];
    newSelectedExercises.splice(index, 1);
    setSelectedExercises(newSelectedExercises);
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<ListChecks className="h-5 w-5" />}
        title="Treinos"
        description="Organize seus treinos"
        action={
          <Button onClick={() => {
            clearWorkoutFields();
            setEditWorkoutIndex(undefined);
            setWorkoutDialogOpen(true);
          }}>
            Criar treino
          </Button>
        }
      />

      {workouts.length === 0 ? (
        <div className="text-center p-8 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">
            Nenhum treino cadastrado. Clique em "Criar treino" para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {workouts.map((workout, index) => (
            <ExpandableCard
              key={index}
              title={workout.name}
              subtitle={`${workout.exercises?.length || 0} exercícios`}
              defaultExpanded={expandedWorkouts.includes(index)}
              actions={
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditWorkoutClick(index)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteWorkout(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </>
              }
            >
              <div className="px-1 space-y-2">
                {workout.exercises?.map((exercise, exIndex) => (
                  <div key={exIndex} className="border p-2 rounded-md bg-muted/20">
                    <div className="font-medium">{exercise.name}</div>
                    <div className="text-sm grid grid-cols-3 gap-1">
                      <span>{exercise.series} séries</span>
                      <span>{exercise.repetitions} reps</span>
                      <span>{exercise.pause}s pausa</span>
                    </div>
                  </div>
                ))}
              </div>
            </ExpandableCard>
          ))}
        </div>
      )}
      
      {/* Resto do código */}
      {/* Dialog para adicionar/editar treino */}
      <Dialog open={workoutDialogOpen} onOpenChange={setWorkoutDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editWorkoutIndex !== undefined
                ? "Editar Treino"
                : "Novo Treino"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={
              editWorkoutIndex !== undefined
                ? handleEditWorkoutSubmit
                : handleAddWorkoutSubmit
            }
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="workoutName">Nome do Treino</Label>
              <Input
                id="workoutName"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Ex: Treino A - Peito e Tríceps"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Exercícios do Treino</Label>
              
              {/* Lista de exercícios selecionados */}
              <div className="space-y-2 mb-4">
                {selectedExercises.length > 0 ? (
                  selectedExercises.map((exercise, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 border rounded-md">
                      <div>{exercise.name}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveExerciseFromWorkout(idx)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground text-sm">
                      Nenhum exercício adicionado
                    </p>
                  </div>
                )}
              </div>
              
              {/* Adicionar exercícios */}
              {exercises.length > 0 && (
                <div className="flex gap-2">
                  <Select
                    onValueChange={(value) => handleAddExerciseToWorkout(value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecionar exercício" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercises.map((exercise, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>
                          {exercise.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      // TODO: Implementar navegação para a tela de exercícios
                      setWorkoutDialogOpen(false);
                      toast({
                        title: "Informação",
                        description: "Vá para a aba de Exercícios para adicionar novos exercícios.",
                        variant: "default",
                        className: "bg-blue-50 border-blue-200 text-blue-700"
                      });
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {exercises.length === 0 && (
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground text-sm">
                    Você não tem exercícios cadastrados. Vá para a aba de Exercícios para adicionar.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setWorkoutDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={selectedExercises.length === 0}>
                {editWorkoutIndex !== undefined ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

