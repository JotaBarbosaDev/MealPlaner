"use client";

import React, {FormEvent, useState} from "react";
import useLocalStorage from "use-local-storage";
import {toast} from "react-toastify";

// Imports "ui" do shadcn
import {Button} from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";

/* -------------------------------------
    Tipos e Interfaces para Dieta
  --------------------------------------*/
type MealName = "Pequeno-Almoço" | "Almoço" | "Lanche da Tarde" | "Jantar";

interface Product {
  name: string;
  p: number; // Proteína (g/100g)
  f: number; // Gordura (g/100g)
  c: number; // Carboidratos (g/100g)
  cal: number; // Calorias (kcal/100g)
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

interface Meal {
  name: MealName;
  plates: Plate[];
}

/* -------------------------------------
    Demais Tipos (Treino/Pesagens)
    (apenas para não gerar erros TS)
  --------------------------------------*/
interface Exercise {
  name: string;
  series: number;
  repetitions: number;
  pause: number; // seg
}
interface Workout {
  name: string;
  exercises: Exercise[];
}
type DayOfWeek =
  | "Segunda-feira"
  | "Terça-feira"
  | "Quarta-feira"
  | "Quinta-feira"
  | "Sexta-feira"
  | "Sábado"
  | "Domingo";
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
    COMPONENTE PRINCIPAL: Dieta()
  --------------------------------------*/
export default function Dieta() {
  /* ==============================
      1) Estados principais
    ============================== */
  const [calTarget, setCalTarget] = useLocalStorage<number>("calTarget", 1975);
  const [protPercent, setProtPercent] = useLocalStorage<number>(
    "protPercent",
    30
  );
  const [fatPercent, setFatPercent] = useLocalStorage<number>("fatPercent", 20);
  const [carbPercent, setCarbPercent] = useLocalStorage<number>(
    "carbPercent",
    50
  );

  const [products, setProducts] = useLocalStorage<Product[]>("products", []);
  const [meals, setMeals] = useLocalStorage<Meal[]>("meals", [
    {name: "Pequeno-Almoço", plates: []},
    {name: "Almoço", plates: []},
    {name: "Lanche da Tarde", plates: []},
    {name: "Jantar", plates: []},
  ]);
  const [plates, setPlates] = useLocalStorage<Plate[]>("plates", []);
  const [currentPlate, setCurrentPlate] = useLocalStorage<Plate>(
    "currentPlate",
    {
      name: "",
      mealName: "Pequeno-Almoço",
      items: [],
    }
  );

  // Diálogos
  const [metaDialogOpen, setMetaDialogOpen] = useLocalStorage<boolean>(
    "metaDialogOpen",
    false
  );
  const [productDialogOpen, setProductDialogOpen] = useLocalStorage<boolean>(
    "productDialogOpen",
    false
  );
  const [addProductDialogOpen, setAddProductDialogOpen] =
    useLocalStorage<boolean>("addProductDialogOpen", false);
  const [editProductDialogOpen, setEditProductDialogOpen] =
    useLocalStorage<boolean>("editProductDialogOpen", false);
  const [createPlateDialogOpen, setCreatePlateDialogOpen] =
    useLocalStorage<boolean>("createPlateDialogOpen", false);
  const [addPlateItemDialogOpen, setAddPlateItemDialogOpen] =
    useLocalStorage<boolean>("addPlateItemDialogOpen", false);
  const [editPlateItemDialogOpen, setEditPlateItemDialogOpen] =
    useLocalStorage<boolean>("editPlateItemDialogOpen", false);
  const [mealDialogOpen, setMealDialogOpen] = useLocalStorage<boolean>(
    "mealDialogOpen",
    false
  );
  const [viewPlanDialogOpen, setViewPlanDialogOpen] = useLocalStorage<boolean>(
    "viewPlanDialogOpen",
    false
  );

  // Discrepâncias de macros
  const [macroMismatchDialogOpen, setMacroMismatchDialogOpen] = useState(false);
  const [macroMismatchData, setMacroMismatchData] = useState<
    {
      label: string;
      diff: number;
      color: string;
    }[]
  >([]);

  // Fields para produtos
  const [editProductIndex, setEditProductIndex] = useLocalStorage<
    number | undefined
  >("editProductIndex", undefined);
  const [productNameField, setProductNameField] = useLocalStorage<string>(
    "productNameField",
    ""
  );
  const [productPField, setProductPField] = useLocalStorage<number>(
    "productPField",
    3.5
  );
  const [productFField, setProductFField] = useLocalStorage<number>(
    "productFField",
    0.2
  );
  const [productCField, setProductCField] = useLocalStorage<number>(
    "productCField",
    5.4
  );
  const [productCalField, setProductCalField] = useLocalStorage<number>(
    "productCalField",
    38
  );

  // Fields para itens do prato
  const [editPlateItemIndex, setEditPlateItemIndex] = useLocalStorage<
    number | undefined
  >("editPlateItemIndex", undefined);
  const [plateItemGramsField, setPlateItemGramsField] = useLocalStorage<number>(
    "plateItemGramsField",
    100
  );

  const [addItemProductIndex, setAddItemProductIndex] = useLocalStorage<
    number | undefined
  >("addItemProductIndex", undefined);
  const [addItemGrams, setAddItemGrams] = useLocalStorage<number>(
    "addItemGrams",
    0
  );

  // Seleção de prato/refeição
  const [addPlateMealIndex, setAddPlateMealIndex] = useLocalStorage<
    number | undefined
  >("addPlateMealIndex", undefined);
  const [addPlatePlateIndex, setAddPlatePlateIndex] = useLocalStorage<
    number | undefined
  >("addPlatePlateIndex", undefined);

  const [editingMealIndex, setEditingMealIndex] = useLocalStorage<
    number | undefined
  >("editingMealIndex", undefined);
  const [editingPlateInMealIndex, setEditingPlateInMealIndex] = useLocalStorage<
    number | undefined
  >("editingPlateInMealIndex", undefined);

  // Distribuição calórica
  const [paPerc, setPaPerc] = useLocalStorage<number>("paPerc", 20);
  const [aPerc, setAPerc] = useLocalStorage<number>("aPerc", 30);
  const [lPerc, setLPerc] = useLocalStorage<number>("lPerc", 20);
  const [jPerc, setJPerc] = useLocalStorage<number>("jPerc", 30);

  // Se meals estiver vazio (caso reset), recria
  if (meals.length === 0) {
    setMeals([
      {name: "Pequeno-Almoço", plates: []},
      {name: "Almoço", plates: []},
      {name: "Lanche da Tarde", plates: []},
      {name: "Jantar", plates: []},
    ]);
  }

  /* ==============================
      2) Funções de Cálculo
    ============================== */
  function calculateDailyTargets() {
    const p = ((protPercent / 100) * calTarget) / 4;
    const f = ((fatPercent / 100) * calTarget) / 9;
    const c = ((carbPercent / 100) * calTarget) / 4;
    return {p, f, c, cal: calTarget};
  }

  function calculateMealTargets(mealName: MealName) {
    const daily = calculateDailyTargets();
    const dist = (() => {
      if (mealName === "Pequeno-Almoço") return paPerc / 100;
      if (mealName === "Almoço") return aPerc / 100;
      if (mealName === "Lanche da Tarde") return lPerc / 100;
      if (mealName === "Jantar") return jPerc / 100;
      return 0;
    })();

    return {
      p: daily.p * dist,
      f: daily.f * dist,
      c: daily.c * dist,
      cal: daily.cal * dist,
    };
  }

  function sumPlate(plate: Plate) {
    return plate.items.reduce(
      (acc, item) => {
        const product = products[item.productIndex];
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

  function ensureMealNoSurpass(mealIndex: number) {
    const meal = meals[mealIndex];
    const mt = calculateMealTargets(meal.name);
    const mealSum = meal.plates.reduce(
      (acc, plate) => {
        const plateSum = sumPlate(plate);
        return {
          p: acc.p + plateSum.p,
          f: acc.f + plateSum.f,
          c: acc.c + plateSum.c,
          cal: acc.cal + plateSum.cal,
        };
      },
      {p: 0, f: 0, c: 0, cal: 0}
    );
    return (
      mealSum.cal <= mt.cal &&
      mealSum.p <= mt.p &&
      mealSum.f <= mt.f &&
      mealSum.c <= mt.c
    );
  }

  function plateMatchesMealTarget(plate: Plate) {
    const mt = calculateMealTargets(plate.mealName);
    const sp = sumPlate(plate);
    return (
      Math.abs(sp.p - mt.p) < 0.0001 &&
      Math.abs(sp.f - mt.f) < 0.0001 &&
      Math.abs(sp.c - mt.c) < 0.0001 &&
      Math.abs(sp.cal - mt.cal) < 0.0001
    );
  }

  function calcMacroDifferences(plate: Plate) {
    const mt = calculateMealTargets(plate.mealName);
    const sp = sumPlate(plate);

    // Converte g de p/c/f p/ kcal
    const proteinDiffKcal = (sp.p - mt.p) * 4;
    const carbDiffKcal = (sp.c - mt.c) * 4;
    const fatDiffKcal = (sp.f - mt.f) * 9;
    const totalDiffKcal = sp.cal - mt.cal;

    function getColor(diff: number): string {
      const abs = Math.abs(diff);
      if (abs <= 50) return "green";
      if (abs <= 100) return "yellow";
      return "red";
    }

    function formatDiff(val: number): string {
      return val > 0 ? `+${val.toFixed(1)}kcal` : `${val.toFixed(1)}kcal`;
    }

    const data: {
      label: string;
      diff: number;
      color: string;
    }[] = [];

    if (proteinDiffKcal !== 0) {
      data.push({
        label: `Proteína ${formatDiff(proteinDiffKcal)}`,
        diff: proteinDiffKcal,
        color: getColor(proteinDiffKcal),
      });
    }
    if (carbDiffKcal !== 0) {
      data.push({
        label: `Hidratos ${formatDiff(carbDiffKcal)}`,
        diff: carbDiffKcal,
        color: getColor(carbDiffKcal),
      });
    }
    if (fatDiffKcal !== 0) {
      data.push({
        label: `Gordura ${formatDiff(fatDiffKcal)}`,
        diff: fatDiffKcal,
        color: getColor(fatDiffKcal),
      });
    }
    if (totalDiffKcal !== 0) {
      data.push({
        label: `Calorias ${formatDiff(totalDiffKcal)}`,
        diff: totalDiffKcal,
        color: getColor(totalDiffKcal),
      });
    }

    return data;
  }

  /* ==============================
      3) Ações Principais
    ============================== */
  function handleUpdateTargets() {
    toast("Metas atualizadas com sucesso!");
    setMetaDialogOpen(false);
  }

  function clearProductFields() {
    setProductNameField("");
    setProductPField(0);
    setProductFField(0);
    setProductCField(0);
    setProductCalField(0);
  }

  // Adicionar Produto
  function handleAddProductSubmit(e: FormEvent) {
    e.preventDefault();
    if (
      !productNameField.trim() ||
      isNaN(productPField) ||
      isNaN(productFField) ||
      isNaN(productCField) ||
      isNaN(productCalField)
    ) {
      toast("Preencha todos os campos corretamente.");
      return;
    }
    const product: Product = {
      name: productNameField.trim(),
      p: productPField,
      f: productFField,
      c: productCField,
      cal: productCalField,
    };
    setProducts([...products, product]);
    clearProductFields();
    setAddProductDialogOpen(false);
    toast("Produto adicionado com sucesso!");
  }

  // Editar Produto
  function handleEditProductClick(index: number) {
    const prod = products[index];
    setEditProductIndex(index);
    setProductNameField(prod.name);
    setProductPField(prod.p);
    setProductFField(prod.f);
    setProductCField(prod.c);
    setProductCalField(prod.cal);
    setEditProductDialogOpen(true);
  }
  function handleEditProductSubmit(e: FormEvent) {
    e.preventDefault();
    if (editProductIndex === undefined) return;
    if (
      !productNameField.trim() ||
      isNaN(productPField) ||
      isNaN(productFField) ||
      isNaN(productCField) ||
      isNaN(productCalField)
    ) {
      toast("Preencha todos os campos corretamente.");
      return;
    }
    const newProducts = [...products];
    newProducts[editProductIndex] = {
      name: productNameField.trim(),
      p: productPField,
      f: productFField,
      c: productCField,
      cal: productCalField,
    };
    setProducts(newProducts);
    clearProductFields();
    setEditProductDialogOpen(false);
    toast("Produto editado com sucesso!");
  }

  // Apagar Produto
  function handleDeleteProduct(index: number) {
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
    toast("Produto apagado!");
  }

  // Adicionar Item ao prato (com checagem de macros)
  const temporaryPlateItem = React.useRef<PlateItem | null>(null);
  function handleAddPlateItemSubmit(e: FormEvent) {
    e.preventDefault();
    if (
      addItemProductIndex === undefined ||
      isNaN(addItemGrams) ||
      addItemGrams <= 0
    ) {
      toast("Selecione um produto e insira a quantidade corretamente.");
      return;
    }
    const cp = {...currentPlate};
    cp.items.push({productIndex: addItemProductIndex, grams: addItemGrams});

    const diffs = calcMacroDifferences(cp);
    if (diffs.length > 0) {
      setMacroMismatchData(diffs);
      setMacroMismatchDialogOpen(true);
      temporaryPlateItem.current = {
        productIndex: addItemProductIndex,
        grams: addItemGrams,
      };
      return;
    }

    setCurrentPlate(cp);
    setAddPlateItemDialogOpen(false);
    setAddItemProductIndex(undefined);
    setAddItemGrams(0);
    toast("Produto adicionado ao prato!");
  }

  function proceedWithAddingItemAnyway() {
    if (temporaryPlateItem.current) {
      const {productIndex, grams} = temporaryPlateItem.current;
      const cp = {...currentPlate};
      cp.items.push({productIndex, grams});
      setCurrentPlate(cp);

      toast("Produto adicionado mesmo com discrepâncias!");
      temporaryPlateItem.current = null;
      setAddPlateItemDialogOpen(false);
      setAddItemProductIndex(undefined);
      setAddItemGrams(0);
    }
  }

  // Editar Item do prato
  const temporaryEditPlateItem = React.useRef<{
    itemIndex: number;
    grams: number;
  } | null>(null);

  function handleEditPlateItemClick(index: number) {
    const it = currentPlate.items[index];
    setEditPlateItemIndex(index);
    setPlateItemGramsField(it.grams);
    setEditPlateItemDialogOpen(true);
  }

  function handleEditPlateItemSubmit(e: FormEvent) {
    e.preventDefault();
    if (editPlateItemIndex === undefined) return;
    if (isNaN(plateItemGramsField) || plateItemGramsField <= 0) {
      toast("Quantidade inválida.");
      return;
    }

    const cp = {...currentPlate};
    cp.items[editPlateItemIndex].grams = plateItemGramsField;

    const diffs = calcMacroDifferences(cp);
    if (diffs.length > 0) {
      temporaryEditPlateItem.current = {
        itemIndex: editPlateItemIndex,
        grams: plateItemGramsField,
      };
      setMacroMismatchData(diffs);
      setMacroMismatchDialogOpen(true);
      return;
    }

    setCurrentPlate(cp);
    setEditPlateItemDialogOpen(false);
    toast("Quantidade atualizada!");
  }

  function proceedWithEditingItemAnyway() {
    if (temporaryEditPlateItem.current) {
      const {itemIndex, grams} = temporaryEditPlateItem.current;
      const cp = {...currentPlate};
      cp.items[itemIndex].grams = grams;
      setCurrentPlate(cp);
      toast("Item editado mesmo com discrepâncias!");
      setEditPlateItemDialogOpen(false);
      temporaryEditPlateItem.current = null;
    }
  }

  function handleRemovePlateItem(index: number) {
    const cp = {...currentPlate};
    cp.items.splice(index, 1);
    setCurrentPlate(cp);
    toast("Produto removido do prato!");
  }

  function showMacroMismatchDialog(
    diffs: {
      label: string;
      diff: number;
      color: string;
    }[]
  ) {
    setMacroMismatchData(diffs);
    setMacroMismatchDialogOpen(true);
  }

  // Finalizar o Prato
  const [isFinishingPlate, setIsFinishingPlate] = useState(false);

  function finalizePlate() {
    if (!currentPlate.name.trim() || currentPlate.items.length === 0) {
      toast("Defina um nome e adicione ao menos um produto ao prato.");
      return;
    }

    const mt = calculateMealTargets(currentPlate.mealName);
    const sp = sumPlate(currentPlate);
    const exceeded = [];
    if (sp.cal > mt.cal) exceeded.push(`Calorias: ${sp.cal - mt.cal} kcal`);
    if (sp.p > mt.p) exceeded.push(`Proteínas: ${sp.p - mt.p} g`);
    if (sp.f > mt.f) exceeded.push(`Gorduras: ${sp.f - mt.f} g`);
    if (sp.c > mt.c) exceeded.push(`Carboidratos: ${sp.c - mt.c} g`);

    if (exceeded.length > 0) {
      toast(
        `Não é possível criar/editar este prato sem ultrapassar as metas da refeição. Excedido: ${exceeded.join(
          ", "
        )}`
      );
      return;
    }

    if (!plateMatchesMealTarget(currentPlate)) {
      const diffs = calcMacroDifferences(currentPlate);
      if (diffs.length > 0) {
        showMacroMismatchDialog(diffs);
        setIsFinishingPlate(true);
        return;
      }
    }

    proceedWithPlate();
  }

  function proceedWithPlate() {
    setIsFinishingPlate(false);

    const mealIndex = meals.findIndex((m) => m.name === currentPlate.mealName);
    if (mealIndex === -1) {
      toast("Refeição não encontrada. Verifique.");
      return;
    }

    const meal = meals[mealIndex];
    if (meal.plates.length > 0) {
      const firstPlate = meal.plates[0];
      const spCurrent = sumPlate(currentPlate);
      const spFirst = sumPlate(firstPlate);
      const diffP = Math.abs(spCurrent.p - spFirst.p);
      const diffF = Math.abs(spCurrent.f - spFirst.f);
      const diffC = Math.abs(spCurrent.c - spFirst.c);
      const diffCal = Math.abs(spCurrent.cal - spFirst.cal);

      if (diffP > 0.5 || diffF > 0.5 || diffC > 1 || diffCal > 5) {
        toast(
          "Este prato não é nutricionalmente idêntico aos outros pratos desta refeição. Ajuste novamente."
        );
        return;
      }
    }

    // Criar ou Editar
    if (
      editingMealIndex !== undefined &&
      editingPlateInMealIndex !== undefined
    ) {
      const newMeals = [...meals];
      newMeals[editingMealIndex].plates[editingPlateInMealIndex] = JSON.parse(
        JSON.stringify(currentPlate)
      );
      setMeals(newMeals);
      setEditingMealIndex(undefined);
      setEditingPlateInMealIndex(undefined);
      toast("Prato editado na refeição!");
    } else {
      const newPlates = [...plates, {...currentPlate}];
      setPlates(newPlates);
      toast("Prato criado com sucesso!");
    }

    setCurrentPlate({name: "", mealName: "Pequeno-Almoço", items: []});
    setCreatePlateDialogOpen(false);
  }

  // Adicionar prato a uma refeição
  function addPlateToMealFromUI() {
    if (addPlateMealIndex === undefined || addPlatePlateIndex === undefined) {
      toast("Selecione a refeição e o prato.");
      return;
    }
    const chosenPlate = JSON.parse(
      JSON.stringify(plates[addPlatePlateIndex])
    ) as Plate;
    const newMeals = [...meals];
    const meal = newMeals[addPlateMealIndex];
    if (chosenPlate.mealName !== meal.name) {
      toast("Este prato não corresponde à refeição selecionada.");
      return;
    }
    meal.plates.push(chosenPlate);
    if (!ensureMealNoSurpass(addPlateMealIndex)) {
      meal.plates.pop();
      toast("Não foi possível adicionar o prato sem ultrapassar as metas.");
    } else {
      toast("Prato adicionado à refeição com sucesso!");
    }
    setMeals(newMeals);
  }

  // Apagar refeição (nova função)
  function handleDeleteMeal(index: number) {
    const newMeals = [...meals];
    newMeals.splice(index, 1);
    setMeals(newMeals);
    toast("Refeição removida!");
  }

  // Editar prato na refeição
  function handleEditPlateInMeal(mealIndex: number, plateIndex: number) {
    setEditingMealIndex(mealIndex);
    setEditingPlateInMealIndex(plateIndex);
    setCurrentPlate({...meals[mealIndex].plates[plateIndex]});
    setCreatePlateDialogOpen(true);
  }

  // Renomeando handleRemovePlateFromMeal para handleDeletePlateFromMeal para manter consistência
  function handleDeletePlateFromMeal(mealIndex: number, plateIndex: number) {
    const newMeals = [...meals];
    newMeals[mealIndex].plates.splice(plateIndex, 1);
    setMeals(newMeals);
    toast("Prato removido da refeição!");
  }

  /* ==============================
      4) Renderização de Planos
    ============================== */
  function calculateTotals() {
    let totalP = 0,
      totalF = 0,
      totalC = 0,
      totalCal = 0;
    meals.forEach((meal) => {
      meal.plates.forEach((plate) => {
        const s = sumPlate(plate);
        totalP += s.p;
        totalF += s.f;
        totalC += s.c;
        totalCal += s.cal;
      });
    });
    return {p: totalP, f: totalF, c: totalC, cal: totalCal};
  }

  function renderFullPlanDetail() {
    if (meals.length === 0) {
      return <p>Nenhum plano criado ainda.</p>;
    }
    let anyPlate = false;

    const mealElements = meals.map((m, i) => {
      if (m.plates.length === 0) {
        return (
          <Card key={i} className="p-3 mb-2 bg-white">
            <h3 className="font-semibold text-green-700">{m.name}</h3>
            <p className="text-sm text-gray-500">
              Nenhum prato nesta refeição.
            </p>
          </Card>
        );
      }

      // Se há pratos
      const platesList = m.plates.map((pl, j) => {
        anyPlate = true;
        const sp = sumPlate(pl);
        return (
          <div
            key={j}
            className="border-b border-gray-300 pb-2 mb-2 last:border-none last:pb-0 last:mb-0"
          >
            <h4 className="text-sm font-semibold text-gray-700">{pl.name}</h4>
            {pl.items.map((it, k) => {
              const prod = products[it.productIndex];
              const factor = it.grams / 100;
              return (
                <p key={k} className="text-xs text-gray-600 ml-2">
                  {prod.name} – {it.grams.toFixed(1)}g | HC:
                  {(prod.c * factor).toFixed(1)}g | P:
                  {(prod.p * factor).toFixed(1)}g | G:
                  {(prod.f * factor).toFixed(1)}g | Cal:
                  {(prod.cal * factor).toFixed(1)}
                </p>
              );
            })}
            <p className="text-xs text-gray-700 mt-1">
              <strong>Subtotal:</strong> {sp.cal.toFixed(1)}kcal | HC:
              {sp.c.toFixed(1)}g | P:{sp.p.toFixed(1)}g | G:{sp.f.toFixed(1)}g
            </p>
          </div>
        );
      });

      return (
        <Card key={i} className="p-3 mb-2 bg-white">
          <h3 className="font-semibold text-green-700">{m.name}</h3>
          <div className="mt-2">{platesList}</div>
        </Card>
      );
    });

    let totalLine = null;
    if (anyPlate) {
      const totals = calculateTotals();
      totalLine = (
        <Card className="p-3 bg-white mt-2">
          <h4 className="font-semibold text-base">Total Diário</h4>
          <p className="text-sm text-gray-700 mt-1">
            {totals.cal.toFixed(1)} kcal | HC:{totals.c.toFixed(1)}g | P:
            {totals.p.toFixed(1)}g | G:{totals.f.toFixed(1)}g
          </p>
        </Card>
      );
    }

    return (
      <>
        {mealElements}
        {totalLine}
      </>
    );
  }

  /* ==============================
      5) Render Final
    ============================== */
  const daily = calculateDailyTargets();
  const totals = calculateTotals();
  const totalPerc = paPerc + aPerc + lPerc + jPerc;

  return (
    <div className="space-y-6 pb-8">
      {/* 
          MOBILE FIRST: As "Cards" já são responsivas e ficam empilhadas.
          Em desktop, podemos usar "md:grid md:grid-cols-2" para colocar alguns cards lado a lado — a seu critério.
        */}

      {/* (C) Ações Rápidas */}
      <Card className="p-4 space-y-2">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <span className="text-green-600">🛠️</span> Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Button
            onClick={() => setMetaDialogOpen(true)}
            className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-all duration-300"
          >
            Gerir Metas
          </Button>
          <Button
            onClick={() => setProductDialogOpen(true)}
            className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-all duration-300"
          >
            Gerir Produtos
          </Button>
          <Button
            onClick={() => {
              setEditingMealIndex(undefined);
              setEditingPlateInMealIndex(undefined);
              setCurrentPlate({
                name: "",
                mealName: "Pequeno-Almoço",
                items: [],
              });
              setCreatePlateDialogOpen(true);
            }}
            className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-all duration-300"
          >
            Criar Prato
          </Button>
          <Button
            onClick={() => setMealDialogOpen(true)}
            className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-all duration-300"
          >
            Gerir Refeições
          </Button>
          <Button
            onClick={() => setViewPlanDialogOpen(true)}
            className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-all duration-300"
          >
            Plano Atual
          </Button>
        </div>
      </Card>

      {/* (A) Resumo Diário */}
      <Card className="p-4 space-y-5">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-green-600">🍕</span> Resumo Diário
        </h2>
        <div className="flex flex-wrap gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 w-[130px]">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Calorias 🔥
            </div>
            <div className="text-xl font-semibold text-gray-800">
              {daily.cal.toFixed(1)}
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 w-[130px]">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Hidratos 🥔
            </div>
            <div className="text-xl font-semibold text-gray-800">
              {daily.c.toFixed(1)}
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 w-[130px]">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Proteina 🥩
            </div>
            <div className="text-xl font-semibold text-gray-800">
              {daily.p.toFixed(1)}
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 w-[130px]">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Gordura 🍕
            </div>
            <div className="text-xl font-semibold text-gray-800">
              {daily.f.toFixed(1)}
            </div>
          </div>
        </div>
      </Card>

      {/* (B) Limites por Refeição */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-green-600">🍽️</span> Limites por Refeição
        </h2>
        <p className="text-sm text-gray-600">
          Cada refeição tem limites baseados na % configurada abaixo.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2 font-medium text-gray-700">Refeição</th>
                <th className="p-2 font-medium text-gray-700">Kcal 🔥</th>
                <th className="p-2 font-medium text-gray-700">HC 🥔</th>
                <th className="p-2 font-medium text-gray-700">P 🥩</th>
                <th className="p-2 font-medium text-gray-700">G 🍕</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  "Pequeno-Almoço",
                  "Almoço",
                  "Lanche da Tarde",
                  "Jantar",
                ] as MealName[]
              ).map((mn) => {
                const mt = calculateMealTargets(mn);
                return (
                  <tr
                    key={mn}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-2 font-medium text-gray-800">{mn}</td>
                    <td className="p-2 text-gray-600">{mt.cal.toFixed(1)}</td>
                    <td className="p-2 text-gray-600">{mt.c.toFixed(1)}</td>
                    <td className="p-2 text-gray-600">{mt.p.toFixed(1)}</td>
                    <td className="p-2 text-gray-600">{mt.f.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* (D) Ajuste de Percentagens */}
      <Card className="p-4 space-y-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          📊 Percentagens por Refeição
        </h2>
        <p className="text-sm text-gray-600">
          Defina a % de calorias para cada refeição (deve somar 100%).
        </p>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-sm">Pequeno-Almoço: {paPerc}%</Label>
            <input
              type="range"
              min={0}
              max={100}
              value={paPerc}
              onChange={(e) => setPaPerc(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-sm">Almoço: {aPerc}%</Label>
            <input
              type="range"
              min={0}
              max={100}
              value={aPerc}
              onChange={(e) => setAPerc(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-sm">Lanche da Tarde: {lPerc}%</Label>
            <input
              type="range"
              min={0}
              max={100}
              value={lPerc}
              onChange={(e) => setLPerc(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-sm">Jantar: {jPerc}%</Label>
            <input
              type="range"
              min={0}
              max={100}
              value={jPerc}
              onChange={(e) => setJPerc(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <p className="text-xs mt-1">
            Soma atual: {totalPerc}%
            {totalPerc !== 100 && (
              <span className="text-red-600 ml-1">Ajustar p/ 100%</span>
            )}
          </p>
        </div>
      </Card>

      {/* ========== DIALOGOS ========== */}

      {/* Dialog Metas */}
      <Dialog open={metaDialogOpen} onOpenChange={setMetaDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="text-green-600">🎯</span> Gerir Metas
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Configure suas metas diárias de calorias e distribuição de
              macronutrientes.
            </p>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateTargets();
            }}
            className="space-y-6"
          >
            {/* Calorias */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
              <Label className="text-sm font-medium text-gray-700">
                Meta de Calorias Diárias
              </Label>
              <div className="mt-1 relative">
                <Input
                  type="number"
                  value={calTarget}
                  onChange={(e) => setCalTarget(Number(e.target.value))}
                  className="pr-12 bg-white/80 backdrop-blur-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  kcal
                </span>
              </div>
            </div>

            {/* Macros */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                <span className="text-green-600">📊</span> Distribuição de
                Macros
              </h4>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Proteínas</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={protPercent}
                      onChange={(e) => setProtPercent(Number(e.target.value))}
                      className="pr-8 bg-gradient-to-r from-rose-50 to-rose-100/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Carboidratos</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={carbPercent}
                      onChange={(e) => setCarbPercent(Number(e.target.value))}
                      className="pr-8 bg-gradient-to-r from-amber-50 to-amber-100/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Gorduras</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={fatPercent}
                      onChange={(e) => setFatPercent(Number(e.target.value))}
                      className="pr-8 bg-gradient-to-r from-blue-50 to-blue-100/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span>Total:</span>
                <span
                  className={`font-medium ${
                    protPercent + carbPercent + fatPercent === 100
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {protPercent + carbPercent + fatPercent}%
                </span>
                {protPercent + carbPercent + fatPercent !== 100 && (
                  <span className="text-red-500">(deve somar 100%)</span>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMetaDialogOpen(false)}
                className="hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <span>💾</span> Salvar Metas
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Gerir Produtos */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white pb-4 z-10">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="text-green-600">🥗</span> Gerir Produtos
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Gerencie sua lista de produtos e seus valores nutricionais por
              100g.
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Botão Adicionar - fixo no topo */}
            <div className="sticky top-[72px] bg-white py-2 z-10">
              <Button
                onClick={() => {
                  clearProductFields();
                  setAddProductDialogOpen(true);
                }}
                className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 flex items-center gap-2"
              >
                <span>➕</span> Novo Produto
              </Button>
            </div>

            {/* Lista de Produtos - scrollável */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
              {products.length === 0 ? (
                <div className="sm:col-span-2 lg:col-span-3 bg-gray-50 rounded-xl p-8 text-center">
                  <p className="text-gray-500 mb-2">
                    Nenhum produto cadastrado
                  </p>
                  <Button
                    onClick={() => {
                      clearProductFields();
                      setAddProductDialogOpen(true);
                    }}
                    className="bg-green-50 text-green-600 hover:bg-green-100"
                  >
                    Adicionar Primeiro Produto
                  </Button>
                </div>
              ) : (
                products.map((p, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-300"
                  >
                    {/* Cabeçalho do Card */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                          <span className="text-green-600 text-lg">🥗</span>
                        </div>
                        <h3 className="font-medium text-gray-800">{p.name}</h3>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-green-600 hover:bg-green-50"
                          onClick={() => handleEditProductClick(i)}
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteProduct(i)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gradient-to-r from-rose-50 to-rose-100/50 rounded-lg p-2">
                        <p className="text-xs text-gray-600">Proteína</p>
                        <p className="font-medium text-gray-800">{p.p}g</p>
                      </div>
                      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg p-2">
                        <p className="text-xs text-gray-600">Carboidratos</p>
                        <p className="font-medium text-gray-800">{p.c}g</p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg p-2">
                        <p className="text-xs text-gray-600">Gorduras</p>
                        <p className="font-medium text-gray-800">{p.f}g</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg p-2">
                        <p className="text-xs text-gray-600">Calorias</p>
                        <p className="font-medium text-gray-800">{p.cal}kcal</p>
                      </div>
                    </div>

                    {/* Nota de rodapé */}
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      Valores por 100g de produto
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-white pt-4 z-10">
            <Button
              variant="outline"
              onClick={() => setProductDialogOpen(false)}
              className="hover:bg-gray-100"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar Produto */}
      <Dialog
        open={addProductDialogOpen}
        onOpenChange={setAddProductDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="text-green-600">🥗</span> Novo Produto
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Insira os valores nutricionais por 100g de produto.
            </p>
          </DialogHeader>

          <form onSubmit={handleAddProductSubmit} className="space-y-6">
            {/* Nome do Produto */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Nome do Produto</Label>
              <Input
                value={productNameField}
                onChange={(e) => setProductNameField(e.target.value)}
                placeholder="Ex: Peito de Frango"
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Macros Grid */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl space-y-4">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <span className="text-green-600">📊</span> Valores Nutricionais
                <span className="text-xs text-gray-500 ml-auto">por 100g</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Calorias */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="text-green-600">🔥</span> Calorias
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={productCalField}
                      onChange={(e) =>
                        setProductCalField(Number(e.target.value))
                      }
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                        if (Number(e.target.value) === 0) {
                          e.target.value = "";
                        }
                      }}
                      step="1"
                      className="pr-12 bg-gradient-to-r from-green-50 to-green-100/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      kcal
                    </span>
                  </div>
                </div>

                {/* Carboidratos */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="text-amber-600">🌾</span> Carboidratos
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={productCField}
                      onChange={(e) => setProductCField(Number(e.target.value))}
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                        if (Number(e.target.value) === 0) {
                          e.target.value = "";
                        }
                      }}
                      step="0.1"
                      className="pr-8 bg-gradient-to-r from-amber-50 to-amber-100/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      g
                    </span>
                  </div>
                </div>

                {/* Proteína */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="text-rose-600">🥩</span> Proteína
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={productPField}
                      onChange={(e) => setProductPField(Number(e.target.value))}
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                        if (Number(e.target.value) === 0) {
                          e.target.value = "";
                        }
                      }}
                      step="0.1"
                      className="pr-8 bg-gradient-to-r from-rose-50 to-rose-100/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      g
                    </span>
                  </div>
                </div>

                {/* Gorduras */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="text-blue-600">🥑</span> Gorduras
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={productFField}
                      onChange={(e) => setProductFField(Number(e.target.value))}
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                        if (Number(e.target.value) === 0) {
                          e.target.value = "";
                        }
                      }}
                      step="0.1"
                      className="pr-8 bg-gradient-to-r from-blue-50 to-blue-100/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      g
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddProductDialogOpen(false)}
                className="hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <span>➕</span> Adicionar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Produto */}
      <Dialog
        open={editProductDialogOpen}
        onOpenChange={setEditProductDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="text-green-600">✏️</span> Editar Produto
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Atualize os valores nutricionais por 100g de produto.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditProductSubmit} className="space-y-6">
            {/* Nome do Produto */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Nome do Produto</Label>
              <Input
                value={productNameField}
                onChange={(e) => setProductNameField(e.target.value)}
                placeholder="Ex: Peito de Frango"
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Macros Grid */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl space-y-4">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <span className="text-green-600">📊</span> Valores Nutricionais
                <span className="text-xs text-gray-500 ml-auto">por 100g</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Calorias */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="text-green-600">🔥</span> Calorias
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={productCalField}
                      onChange={(e) =>
                        setProductCalField(Number(e.target.value))
                      }
                      step="1"
                      className="pr-12 bg-gradient-to-r from-green-50 to-green-100/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      kcal
                    </span>
                  </div>
                </div>

                {/* Carboidratos */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="text-amber-600">🌾</span> Carboidratos
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={productCField}
                      onChange={(e) => setProductCField(Number(e.target.value))}
                      step="0.1"
                      className="pr-8 bg-gradient-to-r from-amber-50 to-amber-100/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      g
                    </span>
                  </div>
                </div>

                {/* Proteína */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="text-rose-600">🥩</span> Proteína
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={productPField}
                      onChange={(e) => setProductPField(Number(e.target.value))}
                      step="0.1"
                      className="pr-8 bg-gradient-to-r from-rose-50 to-rose-100/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      g
                    </span>
                  </div>
                </div>

                {/* Gorduras */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="text-blue-600">🥑</span> Gorduras
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={productFField}
                      onChange={(e) => setProductFField(Number(e.target.value))}
                      step="0.1"
                      className="pr-8 bg-gradient-to-r from-blue-50 to-blue-100/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      g
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditProductDialogOpen(false)}
                className="hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <span>💾</span> Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Criar/Editar Prato */}
      <Dialog
        open={createPlateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Se fechar sem salvar
            setEditingMealIndex(undefined);
            setEditingPlateInMealIndex(undefined);
            setCurrentPlate({
              name: "",
              mealName: "Pequeno-Almoço",
              items: [],
            });
          }
          setCreatePlateDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-md space-y-2">
          <DialogHeader>
            <DialogTitle>
              {editingMealIndex !== undefined &&
              editingPlateInMealIndex !== undefined
                ? "Editar Prato"
                : "Criar Prato"}
            </DialogTitle>
          </DialogHeader>

          {/* Metas da Refeição */}
          {currentPlate.mealName && (
            <p className="text-sm text-gray-600 mb-2">
              Metas ({currentPlate.mealName}):{" "}
              {calculateMealTargets(currentPlate.mealName).cal.toFixed(1)}
              kcal
            </p>
          )}

          <Label>Nome do Prato:</Label>
          <Input
            type="text"
            value={currentPlate.name}
            onChange={(e) =>
              setCurrentPlate({...currentPlate, name: e.target.value})
            }
            className="mt-1 focus:ring-2 focus:ring-green-500 transition-all duration-300"
          />

          <Label>Refeição Destino:</Label>
          <Select
            onValueChange={(val) =>
              setCurrentPlate({...currentPlate, mealName: val as MealName})
            }
            value={currentPlate.mealName}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pequeno-Almoço">Pequeno-Almoço</SelectItem>
              <SelectItem value="Almoço">Almoço</SelectItem>
              <SelectItem value="Lanche da Tarde">Lanche da Tarde</SelectItem>
              <SelectItem value="Jantar">Jantar</SelectItem>
            </SelectContent>
          </Select>

          {/* Lista de produtos já no prato */}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Produtos no Prato</h3>
            {currentPlate.items.length === 0 ? (
              <p className="text-sm text-gray-700">
                Nenhum produto no prato ainda.
              </p>
            ) : (
              (() => {
                let {p, f, c, cal} = sumPlate(currentPlate);
                return (
                  <>
                    <ul className="space-y-2">
                      {currentPlate.items.map((it, ii) => {
                        const prod = products[it.productIndex];
                        const factor = it.grams / 100;
                        const pVal = prod.p * factor;
                        const fVal = prod.f * factor;
                        const cVal = prod.c * factor;
                        const calVal = prod.cal * factor;
                        return (
                          <Card
                            key={ii}
                            className="p-2 bg-white text-sm flex items-center justify-between"
                          >
                            <div>
                              <strong>{prod.name}</strong> –{" "}
                              {it.grams.toFixed(1)}g
                              <br />
                              HC:{cVal.toFixed(1)} | P:{pVal.toFixed(1)} | G:
                              {fVal.toFixed(1)} | Cal:{calVal.toFixed(1)}
                            </div>
                            <div className="space-x-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleEditPlateItemClick(ii)}
                                className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-all duration-300"
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemovePlateItem(ii)}
                                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all duration-300"
                              >
                                Remover
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </ul>
                    <p className="text-sm text-gray-700 mt-2">
                      <strong>Total do Prato:</strong> {cal.toFixed(1)}kcal |
                      HC:{c.toFixed(1)} | P:{p.toFixed(1)} | G:{f.toFixed(1)}
                    </p>
                  </>
                );
              })()
            )}
          </div>

          <div className="mt-2 text-sm text-gray-600">
            O prato deve corresponder às metas da refeição, mas podem haver
            discrepâncias. Se houver, aparecerá um aviso.
          </div>

          <div className="mt-4 space-x-2">
            <Button
              onClick={() => setAddPlateItemDialogOpen(true)}
              className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-all duration-300"
            >
              Adicionar Produto
            </Button>
            <Button
              onClick={finalizePlate}
              className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
            >
              {editingMealIndex !== undefined &&
              editingPlateInMealIndex !== undefined
                ? "Salvar Edição"
                : "Finalizar Prato"}
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setEditingMealIndex(undefined);
                setEditingPlateInMealIndex(undefined);
                setCurrentPlate({
                  name: "",
                  mealName: "Pequeno-Almoço",
                  items: [],
                });
                setCreatePlateDialogOpen(false);
              }}
              className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Item do Prato */}
      <Dialog
        open={editPlateItemDialogOpen}
        onOpenChange={setEditPlateItemDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Quantidade</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditPlateItemSubmit(e);
            }}
            className="space-y-2"
          >
            <Label>Gramas:</Label>
            <Input
              type="number"
              value={plateItemGramsField}
              onChange={(e) => setPlateItemGramsField(Number(e.target.value))}
              className="mt-1 focus:ring-2 focus:ring-green-500 transition-all duration-300"
            />
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setEditPlateItemDialogOpen(false)}
                className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
              >
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar Item ao Prato */}
      <Dialog
        open={addPlateItemDialogOpen}
        onOpenChange={setAddPlateItemDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Produto ao Prato</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPlateItemSubmit} className="space-y-2">
            <Label>Produto:</Label>
            <select
              className="border rounded p-1 w-full text-sm"
              onChange={(e) =>
                setAddItemProductIndex(
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
            >
              <option value="">Selecione</option>
              {products.map((p, i) => (
                <option key={i} value={i}>
                  {p.name}
                </option>
              ))}
            </select>
            <Label>Gramas:</Label>
            <Input
              type="number"
              value={addItemGrams}
              onChange={(e) => setAddItemGrams(Number(e.target.value))}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                if (Number(e.target.value) === 0) {
                  e.target.value = "";
                }
              }}
              className="mt-1 focus:ring-2 focus:ring-green-500 transition-all duration-300"
            />
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setAddPlateItemDialogOpen(false)}
                className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
              >
                Adicionar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Gerir Refeições */}
      <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white pb-4 z-10">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="text-green-600">🍽️</span> Gerir Refeições
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Cada refeição só deve ter pratos idênticos em macros, para
              garantir consistência nutricional.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Seção de Adicionar Prato */}
            <Card className="p-4 bg-green-50/50 border-green-100">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-semibold text-green-700">
                  Adicionar Novo Prato
                </CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Refeição Destino
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      setAddPlateMealIndex(
                        val === "placeholder" ? undefined : parseInt(val)
                      )
                    }
                    value={addPlateMealIndex?.toString() || "placeholder"}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Selecione a refeição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder" disabled>
                        Selecione a refeição
                      </SelectItem>
                      {meals.map((m, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Prato a Adicionar
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      setAddPlatePlateIndex(
                        val === "placeholder" ? undefined : parseInt(val)
                      )
                    }
                    value={addPlatePlateIndex?.toString() || "placeholder"}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Selecione o prato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder" disabled>
                        Selecione o prato
                      </SelectItem>
                      {plates.map((pl, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {pl.name} ({pl.mealName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={addPlateToMealFromUI}
                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <span>➕</span> Adicionar Prato
                </Button>
              </div>
            </Card>

            {/* Lista de Refeições */}
            <div className="space-y-4">
              {meals.map((meal, mealIndex) => (
                <Card key={mealIndex} className="p-4">
                  <CardHeader className="p-0 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        {meal.name}
                        <Badge variant="secondary" className="ml-2">
                          {meal.plates.length} pratos
                        </Badge>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMeal(mealIndex)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                      >
                        <span>🗑️</span> Remover
                      </Button>
                    </div>
                  </CardHeader>

                  <div className="space-y-3">
                    {meal.plates.map((plate, plateIndex) => (
                      <Card key={plateIndex} className="p-3 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{plate.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {sumPlate(plate).cal.toFixed(1)}kcal | P:{" "}
                              {sumPlate(plate).p.toFixed(1)}g | C:{" "}
                              {sumPlate(plate).c.toFixed(1)}g | G:{" "}
                              {sumPlate(plate).f.toFixed(1)}g
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleEditPlateInMeal(mealIndex, plateIndex)
                              }
                              className="hover:bg-green-50 gap-1"
                            >
                              <span>✏️</span> Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeletePlateFromMeal(mealIndex, plateIndex)
                              }
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                            >
                              <span>🗑️</span> Remover
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-white pt-4 z-10">
            <Button
              variant="outline"
              onClick={() => setMealDialogOpen(false)}
              className="hover:bg-gray-100"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver Plano Atual */}
      <Dialog open={viewPlanDialogOpen} onOpenChange={setViewPlanDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white pb-4 z-10">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="text-green-600">📋</span> Plano Atual
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Aqui estão todas as refeições e pratos já criados. Cada refeição
              aceita apenas pratos idênticos em macros.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {meals.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <p className="text-gray-500 mb-2">Nenhum plano criado ainda.</p>
                <Button
                  onClick={() => {
                    setViewPlanDialogOpen(false);
                    setMealDialogOpen(true);
                  }}
                  className="bg-green-50 text-green-600 hover:bg-green-100"
                >
                  Começar a Criar Plano
                </Button>
              </div>
            ) : (
              <>
                {meals.map((m, i) => {
                  const mealMacros = calculateMealTargets(m.name);

                  if (m.plates.length === 0) {
                    return (
                      <Card key={i} className="bg-white">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                              {m.name}
                              <Badge variant="outline" className="ml-2">
                                Vazia
                              </Badge>
                            </CardTitle>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Meta: {mealMacros.cal.toFixed(1)}kcal | P:{" "}
                            {mealMacros.p.toFixed(1)}g | C:{" "}
                            {mealMacros.c.toFixed(1)}g | G:{" "}
                            {mealMacros.f.toFixed(1)}g
                          </p>
                        </CardHeader>
                      </Card>
                    );
                  }

                  return (
                    <Card key={i} className="bg-white">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            {m.name}
                            <Badge variant="secondary" className="ml-2">
                              {m.plates.length}{" "}
                              {m.plates.length === 1 ? "prato" : "pratos"}
                            </Badge>
                          </CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Meta: {mealMacros.cal.toFixed(1)}kcal | P:{" "}
                          {mealMacros.p.toFixed(1)}g | C:{" "}
                          {mealMacros.c.toFixed(1)}g | G:{" "}
                          {mealMacros.f.toFixed(1)}g
                        </p>
                      </CardHeader>

                      <div className="p-6 pt-0 space-y-4">
                        {m.plates.map((pl, j) => {
                          const sp = sumPlate(pl);
                          return (
                            <Card key={j} className="bg-gray-50/50">
                              <CardHeader className="p-4">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base font-medium">
                                    {pl.name}
                                  </CardTitle>
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                                    {sp.cal.toFixed(1)} kcal
                                  </Badge>
                                </div>
                                <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                                  <span>P: {sp.p.toFixed(1)}g</span>
                                  <span>C: {sp.c.toFixed(1)}g</span>
                                  <span>G: {sp.f.toFixed(1)}g</span>
                                </div>
                              </CardHeader>

                              <div className="px-4 pb-4">
                                <div className="space-y-2">
                                  {pl.items.map((it, k) => {
                                    const prod = products[it.productIndex];
                                    const factor = it.grams / 100;
                                    return (
                                      <div
                                        key={k}
                                        className="flex items-center justify-between bg-white rounded-lg p-2 text-sm"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-green-600">
                                            🥗
                                          </span>
                                          <div>
                                            <p className="font-medium">
                                              {prod.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {it.grams.toFixed(1)}g
                                            </p>
                                          </div>
                                        </div>
                                        <div className="text-xs text-right text-muted-foreground">
                                          <p>
                                            P: {(prod.p * factor).toFixed(1)}g
                                          </p>
                                          <p>
                                            C: {(prod.c * factor).toFixed(1)}g
                                          </p>
                                          <p>
                                            G: {(prod.f * factor).toFixed(1)}g
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}

                {/* Totais */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <span className="text-green-600">📊</span> Total Diário
                    </CardTitle>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <p className="text-sm font-medium text-gray-600">
                          Calorias
                        </p>
                        <p className="text-xl font-semibold text-gray-800">
                          {calculateTotals().cal.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">kcal</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <p className="text-sm font-medium text-gray-600">
                          Proteínas
                        </p>
                        <p className="text-xl font-semibold text-gray-800">
                          {calculateTotals().p.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">gramas</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <p className="text-sm font-medium text-gray-600">
                          Carboidratos
                        </p>
                        <p className="text-xl font-semibold text-gray-800">
                          {calculateTotals().c.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">gramas</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <p className="text-sm font-medium text-gray-600">
                          Gorduras
                        </p>
                        <p className="text-xl font-semibold text-gray-800">
                          {calculateTotals().f.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">gramas</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </>
            )}
          </div>

          <DialogFooter className="sticky bottom-0 bg-white pt-4 z-10">
            <Button
              variant="outline"
              onClick={() => setViewPlanDialogOpen(false)}
              className="hover:bg-gray-100"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de discrepâncias de macros */}
      <Dialog
        open={macroMismatchDialogOpen}
        onOpenChange={(open) => {
          setMacroMismatchDialogOpen(open);
          if (!open) {
            // Se fecharmos sem Continuar, limpa flags
            setIsFinishingPlate(false);
            temporaryPlateItem.current = null;
            temporaryEditPlateItem.current = null;
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Diferenças de Calorias/Macros</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>
              As calorias ou macros não estão exatas em relação à meta. Veja
              abaixo as diferenças:
            </p>
            <ul className="list-disc ml-5">
              {macroMismatchData.map((item, idx) => (
                <li
                  key={idx}
                  style={{color: item.color}}
                  className="font-semibold"
                >
                  {item.label}
                </li>
              ))}
            </ul>
            <p className="text-gray-600 text-xs">
              Pode Ajustar p/ voltar e corrigir ou Continuar mesmo assim.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setMacroMismatchDialogOpen(false)}
              className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
            >
              Ajustar
            </Button>
            <Button
              onClick={() => {
                setMacroMismatchDialogOpen(false);
                if (isFinishingPlate) {
                  proceedWithPlate();
                } else if (temporaryPlateItem.current) {
                  proceedWithAddingItemAnyway();
                } else if (temporaryEditPlateItem.current) {
                  proceedWithEditingItemAnyway();
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
