"use client";

import React, { useState } from "react";
import useLocalStorage from "use-local-storage";
import { motion } from "framer-motion";
import { 
  Target, 
  Trash, 
  PlusCircle, 
  Calendar,
  Weight,
  Activity,
  Ruler,
  CheckCircle2,
  Trophy,
  BarChart3
} from "lucide-react";

// Componentes UI
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

// Tipos
import type { BodyTarget, BodyTargets, Measurement } from "@/types/pesagens";

interface BodyTargetsProps {
  measurements: Measurement[];
}

interface TargetFormData {
  type: keyof BodyTargets;
  value: number;
  targetDate: string;
  initialValue?: number;
  description: string;
}

export default function BodyTargetsComponent({ measurements }: BodyTargetsProps) {
  // Estados 
  const [bodyTargets, setBodyTargets] = useLocalStorage<BodyTargets>("bodyTargets", {});
  const [addTargetDialogOpen, setAddTargetDialogOpen] = useState(false);
  const [editingTargetType, setEditingTargetType] = useState<keyof BodyTargets | null>(null);
  const [formData, setFormData] = useState<TargetFormData>({
    type: "weightTarget",
    value: 0,
    targetDate: new Date().toISOString().slice(0, 10),
    initialValue: undefined,
    description: "",
  });

  // Obter a medição mais recente para comparar com as metas
  const getLastMeasurement = (): Measurement | null => {
    if (measurements.length === 0) return null;
    
    return [...measurements].sort((a, b) => {
      return new Date(`${b.date}T${b.time}`).getTime() - 
             new Date(`${a.date}T${a.time}`).getTime();
    })[0];
  };

  const lastMeasurement = getLastMeasurement();

  // Funções auxiliares
  const getTargetTypeLabel = (type: keyof BodyTargets): string => {
    switch(type) {
      case "weightTarget": return "Peso";
      case "fatPercentTarget": return "% de Gordura";
      case "musclePercentTarget": return "% de Músculo";
      case "waistCircumferenceTarget": return "Cintura";
      case "hipCircumferenceTarget": return "Quadril";
      case "armCircumferenceTarget": return "Braço";
      case "thighCircumferenceTarget": return "Coxa";
      case "chestCircumferenceTarget": return "Peito";
      case "neckCircumferenceTarget": return "Pescoço";
      case "calfCircumferenceTarget": return "Panturrilha";
      default: return "Meta";
    }
  };

  const getTargetTypeUnit = (type: keyof BodyTargets): string => {
    switch(type) {
      case "fatPercentTarget":
      case "musclePercentTarget":
        return "%";
      default:
        return type === "weightTarget" ? "kg" : "cm";
    }
  };

  const getTargetTypeIcon = (type: keyof BodyTargets) => {
    switch(type) {
      case "weightTarget": return <Weight size={16} className="text-blue-600" />;
      case "fatPercentTarget": return <Activity size={16} className="text-amber-600" />;
      case "musclePercentTarget": return <Activity size={16} className="text-green-600" />;
      default: return <Ruler size={16} className="text-purple-600" />;
    }
  };

  const getTargetCurrentValue = (type: keyof BodyTargets): number | undefined => {
    if (!lastMeasurement) return undefined;

    switch(type) {
      case "weightTarget": return lastMeasurement.weight;
      case "fatPercentTarget": return lastMeasurement.fatMassPercent;
      case "musclePercentTarget": return lastMeasurement.muscleMassPercent;
      case "waistCircumferenceTarget": return lastMeasurement.waistCircumference;
      case "hipCircumferenceTarget": return lastMeasurement.hipCircumference;
      case "armCircumferenceTarget": return lastMeasurement.armCircumference;
      case "thighCircumferenceTarget": return lastMeasurement.thighCircumference;
      case "chestCircumferenceTarget": return lastMeasurement.chestCircumference;
      case "neckCircumferenceTarget": return lastMeasurement.neckCircumference;
      case "calfCircumferenceTarget": return lastMeasurement.calfCircumference;
      default: return undefined;
    }
  };

  const calculateProgress = (target: BodyTarget, currentValue: number): number => {
    // Se a meta já foi atingida, retorna 100%
    if (target.achieved) return 100;

    const { value, initialValue } = target;
    
    // Se não tiver valor inicial, usa valor atual para calcular progresso
    const startValue = initialValue ?? currentValue;
    
    // Determina se a meta é para aumentar ou diminuir
    const isIncreasing = value > startValue;
    
    // Meta é aumentar e valor atual já passou da meta, ou
    // Meta é diminuir e valor atual já passou da meta
    if ((isIncreasing && currentValue >= value) || 
        (!isIncreasing && currentValue <= value)) {
      return 100;
    }
    
    // Calcular a diferença total
    const totalDiff = Math.abs(value - startValue);
    
    // Calcular a diferença atual
    const currentDiff = Math.abs(currentValue - startValue);
    
    // Calcular a porcentagem
    const percentage = (currentDiff / totalDiff) * 100;
    
    return Math.min(Math.max(percentage, 0), 100);
  };

  // Verificar se uma meta foi atingida
  const checkTargetAchievement = (type: keyof BodyTargets): void => {
    const target = bodyTargets[type];
    if (!target || target.achieved) return;

    const currentValue = getTargetCurrentValue(type);
    if (currentValue === undefined) return;

    const { value, initialValue } = target;
    const startValue = initialValue ?? currentValue;
    const isIncreasing = value > startValue;

    // Verificar se a meta foi atingida
    const achieved = isIncreasing 
      ? currentValue >= value 
      : currentValue <= value;

    if (achieved) {
      // Marcar meta como atingida e atualizar data
      setBodyTargets({
        ...bodyTargets,
        [type]: {
          ...target,
          achieved: true
        }
      });
    }
  };

  // Verificar todas as metas quando medições mudarem
  React.useEffect(() => {
    if (!lastMeasurement) return;

    // Verificar cada tipo de meta
    (Object.keys(bodyTargets) as Array<keyof BodyTargets>).forEach(type => {
      checkTargetAchievement(type);
    });
  }, [lastMeasurement, bodyTargets]);

  // Funções para manipulação de metas
  const openAddTargetDialog = (type?: keyof BodyTargets) => {
    // Se estiver editando, carrega dados da meta existente
    if (type && bodyTargets[type]) {
      const target = bodyTargets[type]!;
      setFormData({
        type,
        value: target.value,
        targetDate: target.targetDate,
        initialValue: target.initialValue,
        description: target.description || "",
      });
      setEditingTargetType(type);
    } else {
      // Caso contrário, reset do formulário
      const initialType = type || "weightTarget";
      const currentValue = getTargetCurrentValue(initialType);
      
      setFormData({
        type: initialType,
        value: currentValue ? currentValue * (initialType.includes("Percent") ? 0.9 : 0.95) : 0,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        initialValue: currentValue,
        description: "",
      });
      setEditingTargetType(null);
    }
    
    setAddTargetDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "type") {
      // Quando o tipo muda, atualizamos o valor atual e inicial
      const type = value as keyof BodyTargets;
      const currentValue = getTargetCurrentValue(type);
      
      setFormData({
        ...formData,
        type,
        value: currentValue ? currentValue * (type.includes("Percent") ? 0.9 : 0.95) : 0,
        initialValue: currentValue,
      });
    } else if (name === "value" || name === "initialValue") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDeleteTarget = (type: keyof BodyTargets) => {
    const updatedTargets = { ...bodyTargets };
    delete updatedTargets[type];
    setBodyTargets(updatedTargets);
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulário
    if (!formData.targetDate || formData.value <= 0) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const newTarget: BodyTarget = {
      value: formData.value,
      targetDate: formData.targetDate,
      createdAt: new Date().toISOString(),
      achieved: false,
      description: formData.description,
      ...(formData.initialValue !== undefined && { initialValue: formData.initialValue }),
    };

    // Atualizar ou adicionar meta
    setBodyTargets({
      ...bodyTargets,
      [formData.type]: newTarget,
    });

    setAddTargetDialogOpen(false);
  };

  // Calcular progresso em direção a data alvo
  const calculateDateProgress = (target: BodyTarget): number => {
    const now = new Date();
    const creationDate = new Date(target.createdAt);
    const targetDate = new Date(target.targetDate);
    
    const totalDuration = targetDate.getTime() - creationDate.getTime();
    const elapsedTime = now.getTime() - creationDate.getTime();
    
    const progress = (elapsedTime / totalDuration) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  // Formatar a data para exibição
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calcular dias restantes
  const getDaysRemaining = (targetDate: string): number => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <Target size={18} className="text-blue-600" /> Metas Corporais
        </h3>
        <Button 
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => openAddTargetDialog()}
        >
          <PlusCircle size={16} /> Nova Meta
        </Button>
      </div>

      {/* Lista de metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(bodyTargets).length === 0 ? (
          <Card className="col-span-full p-8 text-center border-dashed border-gray-300">
            <Target size={32} className="mx-auto mb-3 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma meta definida</h3>
            <p className="text-sm text-gray-500 mb-4">Defina metas específicas para acompanhar seu progresso corporal.</p>
            <Button 
              variant="outline" 
              className="mx-auto"
              onClick={() => openAddTargetDialog()}
            >
              <PlusCircle size={16} className="mr-2" /> Adicionar Meta
            </Button>
          </Card>
        ) : (
          Object.entries(bodyTargets).map(([type, target]) => {
            const typedKey = type as keyof BodyTargets;
            const currentValue = getTargetCurrentValue(typedKey);
            const progress = currentValue !== undefined ? calculateProgress(target, currentValue) : 0;
            const dateProgress = calculateDateProgress(target);
            const daysRemaining = getDaysRemaining(target.targetDate);
            
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`p-4 ${target.achieved ? 'border-green-300 bg-green-50' : 'border-blue-100'}`}>
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getTargetTypeIcon(typedKey)}
                      <span className="font-medium">
                        {getTargetTypeLabel(typedKey)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {target.achieved && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle2 size={14} className="mr-1" /> Atingida
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDeleteTarget(typedKey)}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  {target.description && (
                    <p className="text-xs text-gray-600 mb-3">{target.description}</p>
                  )}
                  
                  <div className="space-y-3">
                    {/* Valor atual vs objetivo */}
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-600 flex items-center gap-1">
                          <BarChart3 size={14} /> Progresso
                        </span>
                        <span className="font-medium">
                          {target.achieved ? (
                            <span className="text-green-600">Meta atingida!</span>
                          ) : (
                            <>
                              {currentValue !== undefined ? (
                                <span>
                                  {currentValue.toFixed(1)}{getTargetTypeUnit(typedKey)} 
                                  <span className="text-gray-400 mx-1">de</span>
                                  {target.value.toFixed(1)}{getTargetTypeUnit(typedKey)}
                                </span>
                              ) : (
                                <span className="text-gray-500">Sem medições</span>
                              )}
                            </>
                          )}
                        </span>
                      </div>
                      <Progress value={progress} className={target.achieved ? "bg-green-200" : ""} />
                    </div>
                    
                    {/* Tempo restante */}
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Calendar size={14} /> Prazo
                        </span>
                        <span className="font-medium">
                          {target.achieved ? (
                            <span className="text-green-600">Concluída</span>
                          ) : (
                            <>
                              {daysRemaining > 0 ? (
                                <span>
                                  {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"}
                                </span>
                              ) : (
                                <span className="text-amber-600">Prazo expirado</span>
                              )}
                            </>
                          )}
                        </span>
                      </div>
                      <Progress value={target.achieved ? 100 : dateProgress} className={target.achieved ? "bg-green-200" : ""} />
                    </div>

                    {/* Informações */}
                    <div className="flex justify-between text-xs pt-2">
                      <span className="text-gray-500">
                        Criada em {formatDate(target.createdAt)}
                      </span>
                      <span className="text-gray-500">
                        Meta para {formatDate(target.targetDate)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Diálogo para adicionar/editar meta */}
      <Dialog open={addTargetDialogOpen} onOpenChange={setAddTargetDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTargetType ? `Editar Meta: ${getTargetTypeLabel(editingTargetType)}` : "Nova Meta Corporal"}
            </DialogTitle>
            <DialogDescription>
              Defina metas específicas para acompanhar seu progresso.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveTarget} className="space-y-4">
            {!editingTargetType && (
              <div className="space-y-2">
                <Label htmlFor="targetType">Tipo de Meta</Label>
                <select 
                  id="targetType"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="weightTarget">Peso</option>
                  <option value="fatPercentTarget">Percentual de Gordura</option>
                  <option value="musclePercentTarget">Percentual de Músculo</option>
                  <option value="waistCircumferenceTarget">Circunferência da Cintura</option>
                  <option value="hipCircumferenceTarget">Circunferência do Quadril</option>
                  <option value="armCircumferenceTarget">Circunferência do Braço</option>
                  <option value="thighCircumferenceTarget">Circunferência da Coxa</option>
                  <option value="chestCircumferenceTarget">Circunferência do Peito</option>
                  <option value="neckCircumferenceTarget">Circunferência do Pescoço</option>
                  <option value="calfCircumferenceTarget">Circunferência da Panturrilha</option>
                </select>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="initialValue">
                  Valor Inicial {formData.initialValue !== undefined ? `(${getTargetTypeUnit(formData.type)})` : ""}
                </Label>
                <Input
                  id="initialValue"
                  name="initialValue"
                  type="number"
                  step="0.1"
                  value={formData.initialValue || ""}
                  onChange={handleFormChange}
                  placeholder={`Ex: 80 ${getTargetTypeUnit(formData.type)}`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetValue">
                  Valor Alvo ({getTargetTypeUnit(formData.type)})
                </Label>
                <Input
                  id="targetValue"
                  name="value"
                  type="number"
                  step="0.1"
                  value={formData.value}
                  onChange={handleFormChange}
                  placeholder={`Ex: 75 ${getTargetTypeUnit(formData.type)}`}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetDate">Data Alvo</Label>
              <Input
                id="targetDate"
                name="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={handleFormChange}
                min={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Ex: Perder 5kg até o verão"
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddTargetDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingTargetType ? "Atualizar" : "Adicionar"} Meta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}