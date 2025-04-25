"use client";

import React, { useState, FormEvent, useMemo } from "react";
import useLocalStorage from "use-local-storage";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Weight, 
  BarChart3, 
  Activity, 
  Calendar, 
  TrendingUp, 
  FlaskConical, 
  Save,
  PlusCircle,
  Edit,
  Trash,
  Settings,
  ChevronUp,
  ChevronDown,
  Clock
} from "lucide-react";

// Componentes compartilhados
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ExpandableCard } from "@/components/shared/ExpandableCard";

// UI Components
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
import { Badge } from "@/components/ui/badge";

interface Measurement {
  date: string;
  time: string;
  weight: number;
  muscleMassPercent: number;
  muscleMassKg: number;
  fatMassPercent: number;
  waterPercent: number;
  height: number;
  visceralFat: number;
  metabolicAge: number;
}

export default function Pesagens() {
  /* =============================
     1) ESTADOS PRINCIPAIS
  ============================== */
  const [measurements, setMeasurements] = useLocalStorage<Measurement[]>(
    "measurements",
    []
  );
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | undefined>(undefined);

  // Temporários para edição/criação
  const [formDate, setFormDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [formTime, setFormTime] = useState<string>(
    new Date().toTimeString().slice(0, 5)
  );
  const [formWeight, setFormWeight] = useState<number>(70.0);
  const [formMuscleMassPercent, setFormMuscleMassPercent] = useState<number>(0);
  const [formMuscleMassKg, setFormMuscleMassKg] = useState<number>(0);
  const [formFatMassPercent, setFormFatMassPercent] = useState<number>(0);
  const [formWaterPercent, setFormWaterPercent] = useState<number>(0);
  const [formHeight, setFormHeight] = useState<number>(170);
  const [formVisceralFat, setFormVisceralFat] = useState<number>(10);
  const [formMetabolicAge, setFormMetabolicAge] = useState<number>(25);

  // Estado para controle do filtro e ordenação
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showDetails, setShowDetails] = useState(false);

  /* =============================
     2) FUNÇÕES AUXILIARES
  ============================== */
  // Ordenar e filtrar medições
  const sortedMeasurements = useMemo(() => {
    return [...measurements].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return sortOrder === "asc" 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
  }, [measurements, sortOrder]);

  // Calcular alterações
  const calculateChanges = () => {
    if (measurements.length < 2) return null;

    // Ordenamos por data (mais antiga primeiro)
    const sorted = [...measurements].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    // Cálculo das diferenças
    return {
      weightChange: +(last.weight - first.weight).toFixed(1),
      muscleMassChange: +(last.muscleMassKg - first.muscleMassKg).toFixed(1),
      fatMassChange: +(
        last.fatMassPercent - first.fatMassPercent
      ).toFixed(1),
      daysBetween: Math.round(
        (new Date(last.date).getTime() - new Date(first.date).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    };
  };

  // Calcular IMC
  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return 0;
    const heightMeters = height / 100;
    return +(weight / (heightMeters * heightMeters)).toFixed(1);
  };

  // Classificar IMC
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Abaixo do peso", color: "text-blue-600" };
    if (bmi < 25) return { label: "Peso normal", color: "text-green-600" };
    if (bmi < 30) return { label: "Sobrepeso", color: "text-yellow-600" };
    if (bmi < 35) return { label: "Obesidade grau I", color: "text-orange-600" };
    if (bmi < 40) return { label: "Obesidade grau II", color: "text-red-600" };
    return { label: "Obesidade grau III", color: "text-red-800" };
  };

  const getBMITrend = () => {
    if (measurements.length < 2) return null;
    
    const sorted = [...measurements]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const firstBMI = calculateBMI(sorted[0].weight, sorted[0].height);
    const lastBMI = calculateBMI(
      sorted[sorted.length - 1].weight,
      sorted[sorted.length - 1].height
    );
    
    return {
      first: firstBMI,
      last: lastBMI,
      diff: +(lastBMI - firstBMI).toFixed(1)
    };
  };

  /* =============================
     3) HANDLERS
  ============================== */
  const resetForm = () => {
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormTime(new Date().toTimeString().slice(0, 5));
    setFormWeight(70.0);
    setFormMuscleMassPercent(0);
    setFormMuscleMassKg(0);
    setFormFatMassPercent(0);
    setFormWaterPercent(0);
    setFormHeight(170);
    setFormVisceralFat(10);
    setFormMetabolicAge(25);
  };

  const openAddDialog = () => {
    resetForm();
    setEditingIndex(undefined);
    setAddDialogOpen(true);
  };

  const openEditDialog = (index: number) => {
    const item = measurements[index];
    if (!item) return;

    setFormDate(item.date);
    setFormTime(item.time);
    setFormWeight(item.weight);
    setFormMuscleMassPercent(item.muscleMassPercent);
    setFormMuscleMassKg(item.muscleMassKg);
    setFormFatMassPercent(item.fatMassPercent);
    setFormWaterPercent(item.waterPercent);
    setFormHeight(item.height);
    setFormVisceralFat(item.visceralFat);
    setFormMetabolicAge(item.metabolicAge);

    setEditingIndex(index);
    setAddDialogOpen(true);
  };

  const handleDeleteMeasurement = (index: number) => {
    const newMeasurements = [...measurements];
    newMeasurements.splice(index, 1);
    setMeasurements(newMeasurements);
    toast.success("Medição removida com sucesso!");
  };

  const handleSaveMeasurement = (e: FormEvent) => {
    e.preventDefault();

    if (!formDate || !formTime) {
      toast.error("Data e hora são obrigatórios");
      return;
    }

    const newMeasurement: Measurement = {
      date: formDate,
      time: formTime,
      weight: formWeight || 0,
      muscleMassPercent: formMuscleMassPercent || 0,
      muscleMassKg: formMuscleMassKg || 0,
      fatMassPercent: formFatMassPercent || 0,
      waterPercent: formWaterPercent || 0,
      height: formHeight || 0,
      visceralFat: formVisceralFat || 0,
      metabolicAge: formMetabolicAge || 0,
    };

    if (editingIndex !== undefined) {
      // Editing existing measurement
      const updatedMeasurements = [...measurements];
      updatedMeasurements[editingIndex] = newMeasurement;
      setMeasurements(updatedMeasurements);
      toast.success("Medição atualizada com sucesso!");
    } else {
      // Adding new measurement
      setMeasurements([...measurements, newMeasurement]);
      toast.success("Nova medição adicionada com sucesso!");
    }

    setAddDialogOpen(false);
    resetForm();
  };

  // Calcular a percentagem do músculo
  const handleMuscleMassPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = Number(e.target.value);
    setFormMuscleMassPercent(percent);
    // Atualizar os kg com base na percentagem
    setFormMuscleMassKg(+(formWeight * (percent / 100)).toFixed(1));
  };

  // Calcular kg do músculo
  const handleMuscleMassKgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const kg = Number(e.target.value);
    setFormMuscleMassKg(kg);
    // Atualizar a percentagem com base nos kg
    if (formWeight > 0) {
      setFormMuscleMassPercent(+((kg / formWeight) * 100).toFixed(1));
    }
  };

  /* =============================
     4) RENDER
  ============================== */
  const changes = calculateChanges();
  const bmiTrend = getBMITrend();

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Registro de Medidas Corporais" 
        icon={<Weight size={20} className="text-blue-600" />}
        description="Acompanhe a evolução do seu corpo"
        action={
          <Button
            onClick={openAddDialog}
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            <PlusCircle size={18} />
            Nova Medição
          </Button>
        }
      />

      {/* Resumo / Estatísticas */}
      {measurements.length > 0 && (
        <Card className="p-5 bg-gradient-to-br from-white to-blue-50/30 border-blue-100 shadow-sm">
          <h3 className="font-medium text-gray-800 flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-blue-600" /> 
            Resumo de Evolução
          </h3>

          <div className="flex flex-wrap gap-3">
            <StatCard
              icon={<Weight size={18} className="text-blue-600" />}
              label="Última Medição"
              value={sortedMeasurements[0]?.weight || 0}
              unit="kg"
              delay={0.1}
              color="blue"
            />

            <StatCard
              icon={<Calendar size={18} className="text-green-600" />}
              label="Medições"
              value={measurements.length}
              unit="total"
              delay={0.2}
              color="green"
            />

            {changes && (
              <>
                <StatCard
                  icon={<TrendingUp size={18} className="text-amber-600" />}
                  label="Variação Peso"
                  value={changes.weightChange > 0 ? `+${changes.weightChange}` : changes.weightChange}
                  unit="kg"
                  delay={0.3}
                  color={changes.weightChange > 0 ? "amber" : "green"}
                />

                <StatCard
                  icon={<Activity size={18} className="text-green-600" />}
                  label="Massa Musc."
                  value={changes.muscleMassChange > 0 ? `+${changes.muscleMassChange}` : changes.muscleMassChange}
                  unit="kg"
                  delay={0.4}
                  color={changes.muscleMassChange >= 0 ? "green" : "amber"}
                />
              </>
            )}
          </div>

          {bmiTrend && (
            <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm mt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <Activity size={18} className="text-blue-600" />
                  Evolução do IMC
                </h4>
                <Badge variant="outline" className={
                  bmiTrend.diff === 0 
                    ? "bg-blue-50 text-blue-600 border-blue-200" 
                    : bmiTrend.diff < 0 
                      ? "bg-green-50 text-green-600 border-green-200" 
                      : "bg-amber-50 text-amber-600 border-amber-200"
                }>
                  {bmiTrend.diff === 0 
                    ? "Mantendo" 
                    : bmiTrend.diff < 0 
                      ? "Diminuindo" 
                      : "Aumentando"}
                </Badge>
              </div>
              
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="bg-gray-50 px-3 py-1.5 rounded-lg">
                  <span className="text-gray-500">Inicial: </span>
                  <span className="font-medium">{bmiTrend.first}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({getBMICategory(bmiTrend.first).label})
                  </span>
                </div>
                <div className="bg-blue-50 px-3 py-1.5 rounded-lg">
                  <span className="text-gray-500">Atual: </span>
                  <span className="font-medium">{bmiTrend.last}</span>
                  <span className={`ml-2 text-xs ${getBMICategory(bmiTrend.last).color}`}>
                    ({getBMICategory(bmiTrend.last).label})
                  </span>
                </div>
                <div className={
                  bmiTrend.diff === 0 
                    ? "bg-blue-50 px-3 py-1.5 rounded-lg" 
                    : bmiTrend.diff < 0 
                      ? "bg-green-50 px-3 py-1.5 rounded-lg" 
                      : "bg-amber-50 px-3 py-1.5 rounded-lg"
                }>
                  <span className="text-gray-500">Diferença: </span>
                  <span className={
                    bmiTrend.diff === 0 
                      ? "text-blue-600 font-medium" 
                      : bmiTrend.diff < 0 
                        ? "text-green-600 font-medium" 
                        : "text-amber-600 font-medium"
                  }>
                    {bmiTrend.diff > 0 ? `+${bmiTrend.diff}` : bmiTrend.diff}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Controles & Filtros */}
      {measurements.length > 0 && (
        <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className={sortOrder === "desc" ? "bg-blue-50 border-blue-200 text-blue-700" : ""}
              size="sm"
              onClick={() => setSortOrder("desc")}
            >
              Mais recentes
            </Button>
            <Button
              variant="outline"
              className={sortOrder === "asc" ? "bg-blue-50 border-blue-200 text-blue-700" : ""}
              size="sm"
              onClick={() => setSortOrder("asc")}
            >
              Mais antigas
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className={showDetails ? "text-blue-600 flex items-center gap-1" : "flex items-center gap-1"}
          >
            {showDetails ? (
              <>Ocultar detalhes <ChevronUp size={16} /></>
            ) : (
              <>Mostrar detalhes <ChevronDown size={16} /></>
            )}
          </Button>
        </div>
      )}

      {/* Lista de Medições */}
      <div className="space-y-4">
        {measurements.length === 0 ? (
          <Card className="p-8 text-center bg-white border-blue-100">
            <Weight size={48} className="text-blue-600 mx-auto mb-3 opacity-80" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma medição registrada</h3>
            <p className="text-gray-500 mb-4">Comece a registrar suas medidas para acompanhar seu progresso.</p>
            <Button
              onClick={openAddDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Adicionar Primeira Medição
            </Button>
          </Card>
        ) : (
          sortedMeasurements.map((measurement, index) => {
            const measurementDate = new Date(`${measurement.date}T${measurement.time}`);
            const formattedDate = measurementDate.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            });
            const formattedTime = measurementDate.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            
            const bmi = calculateBMI(measurement.weight, measurement.height);
            const bmiCategory = getBMICategory(bmi);
            
            // Calcular diferenças com a medição anterior
            const prevIndex = sortOrder === "desc" ? index + 1 : index - 1;
            const prevMeasurement = sortedMeasurements[prevIndex];
            const hasPrevious = !!prevMeasurement;
            
            const weightDiff = hasPrevious 
              ? +(measurement.weight - prevMeasurement.weight).toFixed(1)
              : 0;
            
            const muscleDiff = hasPrevious 
              ? +(measurement.muscleMassKg - prevMeasurement.muscleMassKg).toFixed(1)
              : 0;
              
            const fatDiff = hasPrevious 
              ? +(measurement.fatMassPercent - prevMeasurement.fatMassPercent).toFixed(1)
              : 0;
              
            return (
              <motion.div
                key={`${measurement.date}-${measurement.time}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`overflow-hidden border ${index === 0 ? "border-blue-200" : "border-gray-100"} hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md`}>
                  <ExpandableCard
                    title={
                      <div className="font-medium text-gray-800">
                        {formattedDate}
                        {index === 0 && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Mais recente</span>}
                      </div>
                    }
                    subtitle={
                      <div className="flex items-center text-gray-500">
                        <Clock size={14} className="mr-1" /> {formattedTime} 
                        <span className="mx-2">•</span> 
                        <Weight size={14} className="mr-1" /> {measurement.weight} kg
                      </div>
                    }
                    icon={<Weight size={18} className={`${index === 0 ? "text-blue-600" : "text-gray-600"}`} />}
                    defaultExpanded={index === 0}
                    actions={
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(measurements.indexOf(measurement));
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
                            handleDeleteMeasurement(measurements.indexOf(measurement));
                          }}
                        >
                          <Trash size={16} />
                        </Button>
                      </>
                    }
                  >
                    <div className="space-y-4 p-2 pt-4">
                      {/* Principais métricas */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <div className="text-xs text-gray-500 flex items-center mb-1">
                            <Weight size={12} className="mr-1 text-blue-600" /> Peso
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{measurement.weight} kg</div>
                            {hasPrevious && (
                              <Badge variant="outline" className={
                                weightDiff === 0 
                                  ? "bg-gray-50 border-gray-200" 
                                  : weightDiff < 0 
                                    ? "bg-green-50 text-green-600 border-green-200" 
                                    : "bg-amber-50 text-amber-600 border-amber-200"
                              }>
                                {weightDiff > 0 ? `+${weightDiff}` : weightDiff}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                          <div className="text-xs text-gray-500 flex items-center mb-1">
                            <Activity size={12} className="mr-1 text-green-600" /> Massa Muscular
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{measurement.muscleMassKg} kg</div>
                            {hasPrevious && (
                              <Badge variant="outline" className={
                                muscleDiff === 0 
                                  ? "bg-gray-50 border-gray-200" 
                                  : muscleDiff > 0 
                                    ? "bg-green-50 text-green-600 border-green-200" 
                                    : "bg-amber-50 text-amber-600 border-amber-200"
                              }>
                                {muscleDiff > 0 ? `+${muscleDiff}` : muscleDiff}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                          <div className="text-xs text-gray-500 flex items-center mb-1">
                            <Activity size={12} className="mr-1 text-amber-600" /> Gordura
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{measurement.fatMassPercent}%</div>
                            {hasPrevious && (
                              <Badge variant="outline" className={
                                fatDiff === 0 
                                  ? "bg-gray-50 border-gray-200" 
                                  : fatDiff < 0 
                                    ? "bg-green-50 text-green-600 border-green-200" 
                                    : "bg-amber-50 text-amber-600 border-amber-200"
                              }>
                                {fatDiff > 0 ? `+${fatDiff}` : fatDiff}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="text-xs text-gray-500 flex items-center mb-1">
                            <Activity size={12} className="mr-1 text-gray-600" /> IMC
                          </div>
                          <div className="flex flex-col">
                            <div className="font-medium">{bmi}</div>
                            <div className={`text-xs ${bmiCategory.color} font-medium`}>
                              {bmiCategory.label}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Detalhes adicionais (opcional) */}
                      {showDetails && (
                        <div className="mt-2 pt-3 border-t border-gray-100">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 text-sm">
                            <div className="bg-white p-2 rounded-md">
                              <span className="text-xs text-gray-500 block">Altura:</span>{" "}
                              <span className="font-medium">{measurement.height} cm</span>
                            </div>
                            <div className="bg-white p-2 rounded-md">
                              <span className="text-xs text-gray-500 block">Músculo (%):</span>{" "}
                              <span className="font-medium">{measurement.muscleMassPercent}%</span>
                            </div>
                            <div className="bg-white p-2 rounded-md">
                              <span className="text-xs text-gray-500 block">Água (%):</span>{" "}
                              <span className="font-medium">{measurement.waterPercent}%</span>
                            </div>
                            <div className="bg-white p-2 rounded-md">
                              <span className="text-xs text-gray-500 block">Gordura visceral:</span>{" "}
                              <span className="font-medium">{measurement.visceralFat}</span>
                            </div>
                            <div className="bg-white p-2 rounded-md">
                              <span className="text-xs text-gray-500 block">Idade metabólica:</span>{" "}
                              <span className="font-medium">{measurement.metabolicAge} anos</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ExpandableCard>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Dialog para adicionar/editar uma medição */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Weight size={20} className="text-blue-600" />
              {editingIndex !== undefined ? "Editar" : "Nova"} Medição
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Registre com precisão os dados da sua medição corporal.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveMeasurement} className="space-y-5">
            {/* Data e hora */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm text-gray-700 flex items-center gap-1">
                  <Calendar size={14} className="text-blue-600" /> Data
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="bg-white/90"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm text-gray-700 flex items-center gap-1">
                  <Clock size={14} className="text-blue-600" /> Hora
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="bg-white/90"
                />
              </div>
            </div>

            {/* Medidas primárias */}
            <div className="border border-gray-100 rounded-xl bg-white/80 p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-700">Dados Principais</h3>
                <div className="h-6 w-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <Weight size={14} className="text-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm text-gray-600 flex items-center gap-2">
                    <Weight size={14} className="text-gray-500" />
                    Peso (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formWeight}
                    onChange={(e) => setFormWeight(+e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm text-gray-600 flex items-center gap-2">
                    <Activity size={14} className="text-gray-500" />
                    Altura (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={formHeight}
                    onChange={(e) => setFormHeight(+e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Composição corporal */}
            <div className="border border-gray-100 rounded-xl bg-white/80 p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-700">Composição Corporal</h3>
                <div className="h-6 w-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <Activity size={14} className="text-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="muscleMassPercent" className="text-sm text-gray-600">
                    Massa Muscular (%)
                  </Label>
                  <Input
                    id="muscleMassPercent"
                    type="number"
                    step="0.1"
                    value={formMuscleMassPercent}
                    onChange={handleMuscleMassPercentChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="muscleMassKg" className="text-sm text-gray-600">
                    Massa Muscular (kg)
                  </Label>
                  <Input
                    id="muscleMassKg"
                    type="number"
                    step="0.1"
                    value={formMuscleMassKg}
                    onChange={handleMuscleMassKgChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatMassPercent" className="text-sm text-gray-600">
                    Massa Gorda (%)
                  </Label>
                  <Input
                    id="fatMassPercent"
                    type="number"
                    step="0.1"
                    value={formFatMassPercent}
                    onChange={(e) => setFormFatMassPercent(+e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waterPercent" className="text-sm text-gray-600">
                    Água Corporal (%)
                  </Label>
                  <Input
                    id="waterPercent"
                    type="number"
                    step="0.1"
                    value={formWaterPercent}
                    onChange={(e) => setFormWaterPercent(+e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Dados metabólicos */}
            <div className="border border-gray-100 rounded-xl bg-white/80 p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-700">Dados Metabólicos</h3>
                <div className="h-6 w-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <FlaskConical size={14} className="text-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visceralFat" className="text-sm text-gray-600">
                    Gordura Visceral
                  </Label>
                  <Input
                    id="visceralFat"
                    type="number"
                    step="0.1"
                    value={formVisceralFat}
                    onChange={(e) => setFormVisceralFat(+e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metabolicAge" className="text-sm text-gray-600">
                    Idade Metabólica
                  </Label>
                  <Input
                    id="metabolicAge"
                    type="number"
                    value={formMetabolicAge}
                    onChange={(e) => setFormMetabolicAge(+e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* IMC Calculado */}
            <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700">IMC Calculado</h4>
                  <p className="text-sm text-gray-500">Com base no peso e altura informados</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold">
                    {calculateBMI(formWeight, formHeight)}
                  </div>
                  <div className={`text-sm ${getBMICategory(calculateBMI(formWeight, formHeight)).color}`}>
                    {getBMICategory(calculateBMI(formWeight, formHeight)).label}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setAddDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                {editingIndex !== undefined ? <Save size={16} /> : <PlusCircle size={16} />}
                {editingIndex !== undefined ? "Salvar Alterações" : "Adicionar Medição"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
