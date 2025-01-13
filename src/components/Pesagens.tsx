"use client";

import React, {FormEvent, useState} from "react";
import useLocalStorage from "use-local-storage";
import {toast} from "react-toastify";

// Imports dos componentes shadcn (ou equivalentes)
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

/* -------------------------------------
   Tipos e Interfaces para Pesagens
--------------------------------------*/
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

/* -------------------------------------
   COMPONENTE PESAGENS
--------------------------------------*/
export default function Pesagens() {
  // Armazena todas as medições
  const [measurements, setMeasurements] = useLocalStorage<Measurement[]>(
    "measurements",
    []
  );

  // Para Adicionar/Editar
  const [measurementDialogOpen, setMeasurementDialogOpen] = useState(false);
  const [editMeasurementIndex, setEditMeasurementIndex] = useState<
    number | null
  >(null);

  // Para exibir Detalhes
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailMeasurement, setDetailMeasurement] =
    useState<Measurement | null>(null);

  // Campos do formulário
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [weight, setWeight] = useState(0);
  const [muscleMassPercent, setMuscleMassPercent] = useState(0);
  const [muscleMassKg, setMuscleMassKg] = useState(0);
  const [fatMassPercent, setFatMassPercent] = useState(0);
  const [waterPercent, setWaterPercent] = useState(0);
  const [height, setHeight] = useState(0);
  const [visceralFat, setVisceralFat] = useState(0);
  const [metabolicAge, setMetabolicAge] = useState(0);

  /* ---------------------------------------------
     1) Próxima Pesagem (opcional)
  ----------------------------------------------*/
  function getNextMeasurementDate(): string | null {
    if (measurements.length === 0) return null;
    const sorted = [...measurements].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastMeasurement = sorted[0];
    const lastDate = new Date(lastMeasurement.date);

    // Exemplo: soma 15 dias
    lastDate.setDate(lastDate.getDate() + 15);

    const year = lastDate.getFullYear();
    const month = String(lastDate.getMonth() + 1).padStart(2, "0");
    const day = String(lastDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /* ---------------------------------------------
     2) Ações: Adicionar / Editar / Apagar
  ----------------------------------------------*/
  function openAddMeasurementDialog() {
    clearFormFields();
    setEditMeasurementIndex(null);
    setMeasurementDialogOpen(true);
  }

  function handleAddMeasurementSubmit(e: FormEvent) {
    e.preventDefault();
    if (
      !date ||
      !time ||
      isNaN(weight) ||
      isNaN(muscleMassPercent) ||
      isNaN(muscleMassKg) ||
      isNaN(fatMassPercent) ||
      isNaN(waterPercent) ||
      isNaN(height) ||
      isNaN(visceralFat) ||
      isNaN(metabolicAge)
    ) {
      toast("Preencha todos os campos corretamente.");
      return;
    }

    const measurement: Measurement = {
      date,
      time,
      weight,
      muscleMassPercent,
      muscleMassKg,
      fatMassPercent,
      waterPercent,
      height,
      visceralFat,
      metabolicAge,
    };

    setMeasurements([...measurements, measurement]);
    toast("Pesagem adicionada com sucesso!");
    setMeasurementDialogOpen(false);
    clearFormFields();
  }

  function openEditMeasurementDialog(index: number) {
    const m = measurements[index];
    setEditMeasurementIndex(index);
    setDate(m.date);
    setTime(m.time);
    setWeight(m.weight);
    setMuscleMassPercent(m.muscleMassPercent);
    setMuscleMassKg(m.muscleMassKg);
    setFatMassPercent(m.fatMassPercent);
    setWaterPercent(m.waterPercent);
    setHeight(m.height);
    setVisceralFat(m.visceralFat);
    setMetabolicAge(m.metabolicAge);
    setMeasurementDialogOpen(true);
  }

  function handleEditMeasurementSubmit(e: FormEvent) {
    e.preventDefault();
    if (editMeasurementIndex === null) return;
    if (
      !date ||
      !time ||
      isNaN(weight) ||
      isNaN(muscleMassPercent) ||
      isNaN(muscleMassKg) ||
      isNaN(fatMassPercent) ||
      isNaN(waterPercent) ||
      isNaN(height) ||
      isNaN(visceralFat) ||
      isNaN(metabolicAge)
    ) {
      toast("Preencha todos os campos corretamente.");
      return;
    }

    const newMeasurements = [...measurements];
    newMeasurements[editMeasurementIndex] = {
      date,
      time,
      weight,
      muscleMassPercent,
      muscleMassKg,
      fatMassPercent,
      waterPercent,
      height,
      visceralFat,
      metabolicAge,
    };
    setMeasurements(newMeasurements);
    toast("Pesagem editada com sucesso!");
    setMeasurementDialogOpen(false);
    clearFormFields();
    setEditMeasurementIndex(null);
  }

  function handleDeleteMeasurement(index: number) {
    const newMeasurements = [...measurements];
    newMeasurements.splice(index, 1);
    setMeasurements(newMeasurements);
    toast("Pesagem apagada!");
  }

  function clearFormFields() {
    setDate("");
    setTime("");
    setWeight(0);
    setMuscleMassPercent(0);
    setMuscleMassKg(0);
    setFatMassPercent(0);
    setWaterPercent(0);
    setHeight(0);
    setVisceralFat(0);
    setMetabolicAge(0);
  }

  /* ---------------------------------------------
     3) Diferenças entre Pesagens
  ----------------------------------------------*/
  function getOrderedMeasurements() {
    return [...measurements].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  const fields = [
    {
      key: "weight",
      label: "Peso",
      unit: "Kg",
      isPositiveGood: false,
    },
    {
      key: "muscleMassPercent",
      label: "Massa Muscular (%)",
      unit: "%",
      isPositiveGood: true,
    },
    {
      key: "muscleMassKg",
      label: "Massa Muscular (kg)",
      unit: "Kg",
      isPositiveGood: true,
    },
    {
      key: "fatMassPercent",
      label: "Massa Gorda (%)",
      unit: "%",
      isPositiveGood: false,
    },
    {
      key: "waterPercent",
      label: "Água Corporal (%)",
      unit: "%",
      isPositiveGood: true,
    },
    {
      key: "height",
      label: "Altura",
      unit: "cm",
      isPositiveGood: null,
    },
    {
      key: "visceralFat",
      label: "Gordura Visceral",
      unit: "",
      isPositiveGood: false,
    },
    {
      key: "metabolicAge",
      label: "Idade Metabólica",
      unit: "anos",
      isPositiveGood: false,
    },
  ];

  interface DiffValues {
    [key: string]: number;
  }

  function getDifferences(current: Measurement): DiffValues | null {
    const ordered = getOrderedMeasurements();
    const index = ordered.findIndex(
      (m) => m.date === current.date && m.time === current.time
    );
    if (index <= 0) return null;
    const previous = ordered[index - 1];
    const diff: DiffValues = {};
    fields.forEach((field) => {
      // @ts-ignore
      diff[field.key] = current[field.key] - previous[field.key];
    });
    return diff;
  }

  // Escolhe cor consoante ganho/perda + se é desejável ou não
  function getBadgeColor(fieldKey: string, diff: number): string {
    const field = fields.find((f) => f.key === fieldKey);
    if (!field || field.isPositiveGood === null) {
      return "bg-gray-200 text-gray-600";
    }
    // Se var. positiva é boa => verde; se não, vermelha
    if (field.isPositiveGood) {
      return diff > 0
        ? "bg-green-100 text-green-800"
        : diff < 0
        ? "bg-red-100 text-red-800"
        : "bg-gray-100 text-gray-600";
    } else {
      return diff < 0
        ? "bg-green-100 text-green-800"
        : diff > 0
        ? "bg-red-100 text-red-800"
        : "bg-gray-100 text-gray-600";
    }
  }

  function formatNumber(value: number, isVisceral: boolean = false): string {
    if (isVisceral) {
      return Math.round(value).toString();
    }
    const str = value.toFixed(2);
    return str.endsWith(".00") ? value.toFixed(0) : str;
  }

  // Monta uma linha: Label | Valor + Badge ao lado, elevado
  function renderMeasurementRow(
    field: (typeof fields)[0],
    currentValue: number,
    diff: number
  ) {
    const formattedValue = formatNumber(
      currentValue,
      field.key === "visceralFat"
    );
    const formattedDiff =
      diff > 0
        ? `+${formatNumber(diff, field.key === "visceralFat")}`
        : formatNumber(diff, field.key === "visceralFat");
    const showBadge = diff !== 0;
    const badgeColor = getBadgeColor(field.key, diff);

    return (
      <div
        key={field.key}
        className="grid grid-cols-[auto_1fr] items-center gap-2 text-sm border-b last:border-none py-2"
      >
        {/* Label */}
        <div className="font-medium text-gray-600">{field.label}</div>

        {/* Valor + unidade + badge ao lado (ligeiramente elevado) */}
        <div className="inline-flex items-start justify-end w-full text-gray-800">
          <span>
            <b>
              {formattedValue}
              <span className="text-xs">{field.unit && `${field.unit}`}</span>
            </b>
          </span>

          {/* Badge ou "=" */}
          {showBadge ? (
            <Badge
              className={`
                ml-1
                text-[9px] leading-4 px-1 py-0.5
                rounded-sm shadow-sm border
                self-start
                ${badgeColor}
              `}
              style={{marginTop: "-0.35rem"}} // Ajusta para elevar mais/menos
            >
              {formattedDiff}
              {field.unit && ` ${field.unit}`}
            </Badge>
          ) : (
            <Badge
              className={`
                ml-1
                text-[9px] leading-4 px-1 py-0.5
                rounded-sm shadow-sm border
                self-start
                ${badgeColor}
              `}
              style={{marginTop: "-0.35rem"}} // Ajusta para elevar mais/menos
            >
              =
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Abre detalhes
  function openDetailDialog(measurement: Measurement) {
    setDetailMeasurement(measurement);
    setDetailDialogOpen(true);
  }

  // Função para calcular a percentagem de massa muscular
  function calculateMuscleMassPercent(
    muscleMassKg: number,
    weight: number
  ): number {
    if (!weight || !muscleMassKg) return 0;
    return (muscleMassKg / weight) * 100;
  }

  /* ---------------------------------------------
     Render Principal
  ----------------------------------------------*/
  const nextDate = getNextMeasurementDate();

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Pesagens ⚖️
          </h2>
          <Button onClick={openAddMeasurementDialog}>Adicionar Pesagem</Button>
        </div>
        {measurements.length > 0 ? (
          <p className="text-sm text-gray-700">
            Próxima pesagem sugerida:{" "}
            <strong className="text-green-700">{nextDate || "--"}</strong>
          </p>
        ) : (
          <p className="text-sm text-gray-500">Nenhuma pesagem registada.</p>
        )}
      </Card>

      {/* Histórico */}
      {measurements.length === 0 ? (
        <Card className="p-4">
          <p className="text-sm text-gray-600 italic">Sem pesagens ainda.</p>
        </Card>
      ) : (
        <Card className="p-4 space-y-4">
          <h3 className="text-base font-semibold text-green-700 flex items-center gap-2">
            <span className="text-lg">📊</span> Histórico de Pesagens
          </h3>
          <div className="grid gap-2">
            {getOrderedMeasurements().map((m, i) => (
              <div
                key={i}
                onClick={() => openDetailDialog(m)}
                className="bg-white border border-gray-200 rounded-xl p-3 cursor-pointer 
                         hover:bg-gray-50 hover:border-green-200 hover:shadow-md 
                         transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg text-green-600 opacity-70 group-hover:opacity-100">
                      📅
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">
                        {new Date(m.date).toLocaleDateString("pt-PT", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-500">{m.time}h</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 group-hover:text-green-600 transition-colors">
                      Ver detalhes →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Dialog Adição/Edição */}
      <Dialog
        open={measurementDialogOpen}
        onOpenChange={(open) => {
          setMeasurementDialogOpen(open);
          if (!open) {
            setEditMeasurementIndex(null);
            clearFormFields();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="text-green-600">⚖️</span>
              {editMeasurementIndex !== null ? "Editar" : "Nova"} Pesagem
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={
              editMeasurementIndex !== null
                ? handleEditMeasurementSubmit
                : handleAddMeasurementSubmit
            }
            className="space-y-6"
          >
            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Data</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Hora</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Medidas Principais */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl space-y-4">
              <div>
                <Label className="text-sm text-gray-700">Peso (kg)</Label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => {
                    const newWeight = Number(e.target.value);
                    setWeight(newWeight);
                    // Atualiza a percentagem quando o peso muda
                    setMuscleMassPercent(
                      calculateMuscleMassPercent(muscleMassKg, newWeight)
                    );
                  }}
                  step="0.1"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-700">
                    Massa Muscular (kg)
                  </Label>
                  <Input
                    type="number"
                    value={muscleMassKg}
                    onChange={(e) => {
                      const newMassKg = Number(e.target.value);
                      setMuscleMassKg(newMassKg);
                      // Atualiza a percentagem quando a massa muscular muda
                      setMuscleMassPercent(
                        calculateMuscleMassPercent(newMassKg, weight)
                      );
                    }}
                    step="0.1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-700">
                    % Muscular (calculado)
                  </Label>
                  <Input
                    type="number"
                    value={muscleMassPercent.toFixed(1)}
                    disabled
                    className="mt-1 bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Outras Medidas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">% Gordura</Label>
                <Input
                  type="number"
                  value={fatMassPercent}
                  onChange={(e) => setFatMassPercent(Number(e.target.value))}
                  step="0.1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600">% Água</Label>
                <Input
                  type="number"
                  value={waterPercent}
                  onChange={(e) => setWaterPercent(Number(e.target.value))}
                  step="0.1"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Altura (cm)</Label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600">
                  Gordura Visceral
                </Label>
                <Input
                  type="number"
                  value={visceralFat}
                  onChange={(e) => setVisceralFat(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm text-gray-600">Idade Metabólica</Label>
              <Input
                type="number"
                value={metabolicAge}
                onChange={(e) => setMetabolicAge(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMeasurementDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {editMeasurementIndex !== null ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Detalhes */}
      <Dialog
        open={detailDialogOpen}
        onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) setDetailMeasurement(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="text-green-600">📊</span>
              Detalhes da Pesagem
            </DialogTitle>
          </DialogHeader>

          {detailMeasurement && (
            <div className="space-y-6">
              {/* Cabeçalho do Detalhe */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl text-green-600">📅</span>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {new Date(detailMeasurement.date).toLocaleDateString(
                        "pt-PT",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {detailMeasurement.time}h
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid de Dados */}
              <div className="grid grid-cols-2 gap-4">
                {fields.map((field) => {
                  const currentValue =
                    detailMeasurement[field.key as keyof Measurement];
                  const diff =
                    getDifferences(detailMeasurement)?.[field.key] || 0;

                  return (
                    <div
                      key={field.key}
                      className="bg-white p-3 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                    >
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        {field.label}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-gray-800">
                          {formatNumber(
                            currentValue as number,
                            field.key === "visceralFat"
                          )}
                          <span className="text-sm text-gray-500 ml-1">
                            {field.unit}
                          </span>
                        </span>
                        {diff !== 0 && (
                          <Badge
                            className={`
                              text-xs px-2 py-0.5 
                              ${getBadgeColor(field.key, diff)}
                            `}
                          >
                            {diff > 0 ? "+" : ""}
                            {formatNumber(diff, field.key === "visceralFat")}
                            {field.unit}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-green-50"
                  onClick={() => {
                    if (!detailMeasurement) return;
                    const idx = measurements.findIndex(
                      (m) =>
                        m.date === detailMeasurement.date &&
                        m.time === detailMeasurement.time
                    );
                    if (idx >= 0) {
                      openEditMeasurementDialog(idx);
                      setDetailDialogOpen(false);
                    }
                  }}
                >
                  ✏️ Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (!detailMeasurement) return;
                    const idx = measurements.findIndex(
                      (m) =>
                        m.date === detailMeasurement.date &&
                        m.time === detailMeasurement.time
                    );
                    if (idx >= 0) {
                      handleDeleteMeasurement(idx);
                      setDetailDialogOpen(false);
                    }
                  }}
                >
                  🗑️ Apagar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
