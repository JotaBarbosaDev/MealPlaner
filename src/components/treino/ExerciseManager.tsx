import React, { FormEvent, useState } from "react";
import useLocalStorage from "use-local-storage";
import { toast } from "react-toastify";
import { Dumbbell, Edit, Trash } from "lucide-react";

// Componentes compartilhados
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ExpandableCard } from "@/components/shared/ExpandableCard";

// UI do shadcn
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

// Tipos
import { Exercise } from "@/types/treino";

interface ExerciseManagerProps {
  onExerciseChange?: (exercises: Exercise[]) => void;
}

export function ExerciseManager({ onExerciseChange }: ExerciseManagerProps) {
  // Estados
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
  const [expandedExercises, setExpandedExercises] = useState<number[]>([]);

  // Funções
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
    
    const newExercises = [...exercises, exercise];
    setExercises(newExercises);
    clearExerciseFields();
    setExerciseDialogOpen(false);
    toast("Exercício adicionado com sucesso!");
    
    if (onExerciseChange) onExerciseChange(newExercises);
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

    clearExerciseFields();
    setEditExerciseIndex(undefined);
    setExerciseDialogOpen(false);
    toast("Exercício editado com sucesso!");
    
    if (onExerciseChange) onExerciseChange(newExercises);
  }

  function handleDeleteExercise(index: number) {
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
    toast("Exercício apagado!");
    
    if (onExerciseChange) onExerciseChange(newExercises);
  }

  function clearExerciseFields() {
    setExerciseName("");
    setExerciseSeries(3);
    setExerciseRepetitions(10);
    setExercisePause(60);
  }

  function toggleExerciseExpanded(index: number) {
    setExpandedExercises((current) =>
      current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index]
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Dumbbell}
        title="Exercícios"
        description="Gerencie sua biblioteca de exercícios"
        actionLabel="Adicionar"
        onAction={() => {
          clearExerciseFields();
          setEditExerciseIndex(undefined);
          setExerciseDialogOpen(true);
        }}
      />

      {exercises.length === 0 ? (
        <div className="text-center p-8 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">
            Nenhum exercício cadastrado. Clique em "Adicionar" para criar seu primeiro exercício.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {exercises.map((exercise, index) => (
            <ExpandableCard
              key={index}
              title={exercise.name}
              isExpanded={expandedExercises.includes(index)}
              onToggle={() => toggleExerciseExpanded(index)}
              actions={
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditExerciseClick(index)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteExercise(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </>
              }
            >
              <div className="px-1 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Séries:</span> {exercise.series}
                </div>
                <div>
                  <span className="font-medium">Repetições:</span> {exercise.repetitions}
                </div>
                <div>
                  <span className="font-medium">Pausa:</span> {exercise.pause} seg
                </div>
              </div>
            </ExpandableCard>
          ))}
        </div>
      )}

      {/* Dialog para adicionar/editar exercício */}
      <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editExerciseIndex !== undefined
                ? "Editar Exercício"
                : "Novo Exercício"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={
              editExerciseIndex !== undefined
                ? handleEditExerciseSubmit
                : handleAddExerciseSubmit
            }
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="exerciseName">Nome do Exercício</Label>
              <Input
                id="exerciseName"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="Ex: Supino Reto"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exerciseSeries">Séries</Label>
                <Input
                  id="exerciseSeries"
                  type="number"
                  value={exerciseSeries}
                  onChange={(e) => setExerciseSeries(Number(e.target.value))}
                  min={1}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exerciseRepetitions">Repetições</Label>
                <Input
                  id="exerciseRepetitions"
                  type="number"
                  value={exerciseRepetitions}
                  onChange={(e) => setExerciseRepetitions(Number(e.target.value))}
                  min={1}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exercisePause">Pausa (segundos)</Label>
              <Input
                id="exercisePause"
                type="number"
                value={exercisePause}
                onChange={(e) => setExercisePause(Number(e.target.value))}
                min={0}
                required
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExerciseDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editExerciseIndex !== undefined ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}