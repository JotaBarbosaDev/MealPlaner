import React, { FormEvent, useState } from "react";
import { CalendarDays, Clock, ChevronDown, ChevronUp, Edit, Trash } from "lucide-react";
import { Exercise, WorkoutLog } from "@/types/treino";
import { useToast } from "@/hooks/use-toast";

// UI do shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WorkoutLogsProps {
  exercises: Exercise[];
  workoutLogs: WorkoutLog[];
  setWorkoutLogs: React.Dispatch<React.SetStateAction<WorkoutLog[]>>;
}

export function WorkoutLogs({ exercises, workoutLogs, setWorkoutLogs }: WorkoutLogsProps) {
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [editLogIndex, setEditLogIndex] = useState<number | undefined>(undefined);
  
  const [selectedExercise, setSelectedExercise] = useState("");
  const [logDate, setLogDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");

  // Estado para visualização expandida dos logs
  const [expandedLogs, setExpandedLogs] = useState<number[]>([]);
  
  // Usando o toast do ShadcnUI
  const { toast } = useToast();

  function toggleLogExpand(index: number) {
    setExpandedLogs(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  }

  function handleAddLogSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedExercise || !logDate) {
      toast({
        title: "Campos incompletos",
        description: "Selecione um exercício e uma data.",
        variant: "destructive"
      });
      return;
    }

    const newLog: WorkoutLog = {
      exercise: selectedExercise,
      date: new Date(logDate).toISOString(),
      duration,
      notes: notes.trim() || undefined,
    };

    setWorkoutLogs([...workoutLogs, newLog]);
    clearLogFields();
    setLogDialogOpen(false);
    toast({
      title: "Registro adicionado",
      description: "Registro de treino adicionado com sucesso!",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-700"
    });
  }

  function handleEditLogClick(index: number) {
    const log = workoutLogs[index];
    setEditLogIndex(index);
    setSelectedExercise(log.exercise);
    setLogDate(format(new Date(log.date), "yyyy-MM-dd"));
    setDuration(log.duration);
    setNotes(log.notes || "");
    setLogDialogOpen(true);
  }

  function handleEditLogSubmit(e: FormEvent) {
    e.preventDefault();
    if (editLogIndex === undefined) return;
    if (!selectedExercise || !logDate) {
      toast({
        title: "Campos incompletos",
        description: "Selecione um exercício e uma data.",
        variant: "destructive"
      });
      return;
    }

    const updatedLog: WorkoutLog = {
      exercise: selectedExercise,
      date: new Date(logDate).toISOString(),
      duration,
      notes: notes.trim() || undefined,
    };

    const newLogs = [...workoutLogs];
    newLogs[editLogIndex] = updatedLog;
    setWorkoutLogs(newLogs);

    clearLogFields();
    setEditLogIndex(undefined);
    setLogDialogOpen(false);
    toast({
      title: "Registro atualizado",
      description: "Registro de treino atualizado com sucesso!",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-700"
    });
  }

  function handleDeleteLog(index: number) {
    const newLogs = [...workoutLogs];
    newLogs.splice(index, 1);
    setWorkoutLogs(newLogs);
    toast({
      title: "Registro removido",
      description: "Registro de treino removido com sucesso.",
      variant: "default",
      className: "bg-red-50 border-red-200 text-red-700"
    });
  }

  function clearLogFields() {
    setSelectedExercise("");
    setLogDate(format(new Date(), "yyyy-MM-dd"));
    setDuration(30);
    setNotes("");
  }

  // Ordenar logs do mais recente para o mais antigo
  const sortedLogs = [...workoutLogs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      {/* Lista de registros de treino */}
      <div className="space-y-3">
        {sortedLogs.length > 0 ? (
          sortedLogs.map((log, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="p-4 flex items-center justify-between bg-white">
                <div className="flex-1">
                  <h3 className="font-medium">{log.exercise}</h3>
                  <div className="flex items-center text-sm text-gray-500 gap-2 mt-1">
                    <CalendarDays size={14} />
                    <span>{format(new Date(log.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditLogClick(index)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDeleteLog(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>

              <div 
                className={`bg-gray-50 px-4 py-3 text-sm border-t transition-all ${
                  expandedLogs.includes(index) ? "max-h-40" : "max-h-0 py-0 overflow-hidden border-t-0"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-gray-500" />
                  <span>Duração: {log.duration} minutos</span>
                </div>
                
                {log.notes && (
                  <div>
                    <span className="text-gray-500 block">Anotações:</span>
                    <p>{log.notes}</p>
                  </div>
                )}
              </div>

              <div 
                onClick={() => toggleLogExpand(index)}
                className="text-center text-xs text-blue-500 p-2 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {expandedLogs.includes(index) ? (
                  <span className="flex items-center justify-center gap-1">Ocultar detalhes <ChevronUp size={14} /></span>
                ) : (
                  <span className="flex items-center justify-center gap-1">Mostrar detalhes <ChevronDown size={14} /></span>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum registro de treino adicionado.</p>
            <p className="text-sm">Adicione seu primeiro registro usando o botão abaixo.</p>
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={() => {
            if (exercises.length === 0) {
              toast({
                title: "Nenhum exercício encontrado",
                description: "Adicione exercícios antes de registrar um treino.",
                variant: "destructive"
              });
              return;
            }
            setLogDialogOpen(true);
          }}
        >
          Registrar Treino
        </Button>
      </div>

      {/* Diálogo para adicionar/editar log de treino */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editLogIndex !== undefined ? "Editar Registro de Treino" : "Registrar Treino"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={editLogIndex !== undefined ? handleEditLogSubmit : handleAddLogSubmit} className="space-y-4">
            <div>
              <Label htmlFor="exerciseSelect">Exercício</Label>
              <Select 
                value={selectedExercise} 
                onValueChange={setSelectedExercise}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um exercício" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((exercise, index) => (
                    <SelectItem key={index} value={exercise.name}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min={1}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Anotações (opcional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Aumentei o peso, Senti dificuldade..."
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setLogDialogOpen(false);
                  clearLogFields();
                  setEditLogIndex(undefined);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editLogIndex !== undefined ? "Salvar Alterações" : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}