  "use client";

  import React, { FormEvent, useState } from "react";
  import useLocalStorage from "use-local-storage";
  import { toast } from "react-toastify";

  // Imports “ui” do shadcn
  import { Button } from "@/components/ui/button";
  import { Card } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
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
      { name: "Pequeno-Almoço", plates: [] },
      { name: "Almoço", plates: [] },
      { name: "Lanche da Tarde", plates: [] },
      { name: "Jantar", plates: [] },
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
    const [productDialogOpen, setProductDialogOpen] =
      useLocalStorage<boolean>("productDialogOpen", false);
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
    const [mealDialogOpen, setMealDialogOpen] =
      useLocalStorage<boolean>("mealDialogOpen", false);
    const [viewPlanDialogOpen, setViewPlanDialogOpen] =
      useLocalStorage<boolean>("viewPlanDialogOpen", false);

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
    const [plateItemGramsField, setPlateItemGramsField] =
      useLocalStorage<number>("plateItemGramsField", 100);

    const [addItemProductIndex, setAddItemProductIndex] = useLocalStorage<
      number | undefined
    >("addItemProductIndex", undefined);
    const [addItemGrams, setAddItemGrams] =
      useLocalStorage<number>("addItemGrams", 0);

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
    const [editingPlateInMealIndex, setEditingPlateInMealIndex] =
      useLocalStorage<number | undefined>("editingPlateInMealIndex", undefined);

    // Distribuição calórica
    const [paPerc, setPaPerc] = useLocalStorage<number>("paPerc", 20);
    const [aPerc, setAPerc] = useLocalStorage<number>("aPerc", 30);
    const [lPerc, setLPerc] = useLocalStorage<number>("lPerc", 20);
    const [jPerc, setJPerc] = useLocalStorage<number>("jPerc", 30);

    // Se meals estiver vazio (caso reset), recria
    if (meals.length === 0) {
      setMeals([
        { name: "Pequeno-Almoço", plates: [] },
        { name: "Almoço", plates: [] },
        { name: "Lanche da Tarde", plates: [] },
        { name: "Jantar", plates: [] },
      ]);
    }

    /* ==============================
      2) Funções de Cálculo
    ============================== */
    function calculateDailyTargets() {
      const p = ((protPercent / 100) * calTarget) / 4;
      const f = ((fatPercent / 100) * calTarget) / 9;
      const c = ((carbPercent / 100) * calTarget) / 4;
      return { p, f, c, cal: calTarget };
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
        { p: 0, f: 0, c: 0, cal: 0 }
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
        { p: 0, f: 0, c: 0, cal: 0 }
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
      const cp = { ...currentPlate };
      cp.items.push({ productIndex: addItemProductIndex, grams: addItemGrams });

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
        const { productIndex, grams } = temporaryPlateItem.current;
        const cp = { ...currentPlate };
        cp.items.push({ productIndex, grams });
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

      const cp = { ...currentPlate };
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
        const { itemIndex, grams } = temporaryEditPlateItem.current;
        const cp = { ...currentPlate };
        cp.items[itemIndex].grams = grams;
        setCurrentPlate(cp);
        toast("Item editado mesmo com discrepâncias!");
        setEditPlateItemDialogOpen(false);
        temporaryEditPlateItem.current = null;
      }
    }

    function handleRemovePlateItem(index: number) {
      const cp = { ...currentPlate };
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
        const newPlates = [...plates, { ...currentPlate }];
        setPlates(newPlates);
        toast("Prato criado com sucesso!");
      }

      setCurrentPlate({ name: "", mealName: "Pequeno-Almoço", items: [] });
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

    function handleRemovePlateFromMeal(mIndex: number, pIndex: number) {
      const newMeals = [...meals];
      newMeals[mIndex].plates.splice(pIndex, 1);
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
      return { p: totalP, f: totalF, c: totalC, cal: totalCal };
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
          MOBILE FIRST: As “Cards” já são responsivas e ficam empilhadas.
          Em desktop, podemos usar “md:grid md:grid-cols-2” para colocar alguns cards lado a lado — a seu critério.
        */}

        {/* (C) Ações Rápidas */}
        <Card className="p-4 space-y-2">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            🛠️ Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Button onClick={() => setMetaDialogOpen(true)}>Gerir Metas</Button>
            <Button onClick={() => setProductDialogOpen(true)}>
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
            >
              Criar Prato
            </Button>
            <Button onClick={() => setMealDialogOpen(true)}>
              Gerir Refeições
            </Button>
            <Button onClick={() => setViewPlanDialogOpen(true)}>
              Plano Atual
            </Button>
          </div>
        </Card>

        {/* (A) Resumo Diário */}
        <Card className="p-4 space-y-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            🍕 Resumo Diário
          </h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <div className="bg-white rounded p-2 shadow w-[100px] text-center">
              <strong>Calorias 🔥</strong>
              <div>{daily.cal.toFixed(1)}</div>
            </div>
            <div className="bg-white rounded p-2 shadow w-[100px] text-center">
              <strong>Hidratos 🥔</strong>
              <div>{daily.c.toFixed(1)}</div>
            </div>
            <div className="bg-white rounded p-2 shadow w-[100px] text-center">
              <strong>Proteina 🥩</strong>
              <div>{daily.p.toFixed(1)}</div>
            </div>
            <div className="bg-white rounded p-2 shadow w-[100px] text-center">
              <strong>Gordura 🍕</strong>
              <div>{daily.f.toFixed(1)}</div>
            </div>
          </div>
        </Card>

        {/* (B) Limites por Refeição */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            🍽️ Limites por Refeição
          </h2>
          <p className="text-sm text-gray-600">
            Cada refeição tem limites baseados na % configurada abaixo.
          </p>
          <div className="overflow-x-auto text-sm">
            <table className="w-full mt-2">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Refeição</th>
                  <th className="p-2">Kcal 🔥</th>
                  <th className="p-2">HC 🥔</th>
                  <th className="p-2">P 🥩</th>
                  <th className="p-2">G 🍕</th>
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
                    <tr key={mn} className="border-b">
                      <td className="p-2 font-semibold">{mn}</td>
                      <td className="p-2">{mt.cal.toFixed(1)}</td>
                      <td className="p-2">{mt.c.toFixed(1)}</td>
                      <td className="p-2">{mt.p.toFixed(1)}</td>
                      <td className="p-2">{mt.f.toFixed(1)}</td>
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
              <DialogTitle>Gerir Metas</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateTargets();
              }}
              className="space-y-2"
            >
              <Label>Calorias alvo:</Label>
              <Input
                type="number"
                value={calTarget}
                onChange={(e) => setCalTarget(Number(e.target.value))}
              />
              <Label>% Proteínas:</Label>
              <Input
                type="number"
                value={protPercent}
                onChange={(e) => setProtPercent(Number(e.target.value))}
              />
              <Label>% Gorduras:</Label>
              <Input
                type="number"
                value={fatPercent}
                onChange={(e) => setFatPercent(Number(e.target.value))}
              />
              <Label>% Carboidratos:</Label>
              <Input
                type="number"
                value={carbPercent}
                onChange={(e) => setCarbPercent(Number(e.target.value))}
              />
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setMetaDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Produtos */}
        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
          <DialogContent className="max-w-md overflow-auto">
            <DialogHeader>
              <DialogTitle>Gerir Produtos</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Button
                onClick={() => {
                  clearProductFields();
                  setAddProductDialogOpen(true);
                }}
              >
                Adicionar Produto
              </Button>

              {products.length === 0 ? (
                <p>Nenhum produto cadastrado.</p>
              ) : (
                <div className="space-y-2">
                  {products.map((p, i) => (
                    <Card
                      key={i}
                      className="p-2 bg-white text-sm flex items-center justify-between"
                    >
                      <div>
                        <strong>{p.name}</strong>
                        <br />
                        HC:{p.c}g | P:{p.p}g | G:{p.f}g | Cal:{p.cal}kcal
                      </div>
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEditProductClick(i)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(i)}
                        >
                          Apagar
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setProductDialogOpen(false)}>
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
              <DialogTitle>Adicionar Produto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProductSubmit} className="space-y-2">
              <Label>Nome do Produto:</Label>
              <Input
                value={productNameField}
                onChange={(e) => setProductNameField(e.target.value)}
              />
              <Label>Proteína (g/100g):</Label>
              <Input
                type="number"
                value={productPField}
                onChange={(e) => setProductPField(Number(e.target.value))}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                  if (Number(e.target.value) === 0) e.target.value = "";
                }}
              />
              <Label>Gordura (g/100g):</Label>
              <Input
                type="number"
                value={productFField}
                onChange={(e) => setProductFField(Number(e.target.value))}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                  if (Number(e.target.value) === 0) e.target.value = "";
                }}
              />
              <Label>Carboidrato (g/100g):</Label>
              <Input
                type="number"
                value={productCField}
                onChange={(e) => setProductCField(Number(e.target.value))}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                  if (Number(e.target.value) === 0) e.target.value = "";
                }}
              />
              <Label>Calorias (kcal/100g):</Label>
              <Input
                type="number"
                value={productCalField}
                onChange={(e) => setProductCalField(Number(e.target.value))}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                  if (Number(e.target.value) === 0) e.target.value = "";
                }}
              />
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setAddProductDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Adicionar</Button>
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
              <DialogTitle>Editar Produto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditProductSubmit} className="space-y-2">
              <Label>Nome do Produto:</Label>
              <Input
                value={productNameField}
                onChange={(e) => setProductNameField(e.target.value)}
              />
              <Label>Proteína (g/100g):</Label>
              <Input
                type="number"
                value={productPField}
                onChange={(e) => setProductPField(Number(e.target.value))}
              />
              <Label>Gordura (g/100g):</Label>
              <Input
                type="number"
                value={productFField}
                onChange={(e) => setProductFField(Number(e.target.value))}
              />
              <Label>Carboidrato (g/100g):</Label>
              <Input
                type="number"
                value={productCField}
                onChange={(e) => setProductCField(Number(e.target.value))}
              />
              <Label>Calorias (kcal/100g):</Label>
              <Input
                type="number"
                value={productCalField}
                onChange={(e) => setProductCalField(Number(e.target.value))}
              />
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setEditProductDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
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
                                >
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRemovePlateItem(ii)}
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
              <Button onClick={() => setAddPlateItemDialogOpen(true)}>
                Adicionar Produto
              </Button>
              <Button onClick={finalizePlate}>
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
              />
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setEditPlateItemDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
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
              />
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setAddPlateItemDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Adicionar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Gerir Refeições */}
        <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
          <DialogContent className="max-w-md overflow-auto space-y-4">
            <DialogHeader>
              <DialogTitle>Gerir Refeições</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              Cada refeição só deve ter pratos idênticos (em macros).
            </p>
            <div className="space-y-2 mt-2">
              <Label className="text-sm">Refeição (p/ adicionar prato):</Label>
              <select
                className="border rounded p-1 w-full text-sm"
                onChange={(e) =>
                  setAddPlateMealIndex(
                    e.target.value === "" ? undefined : parseInt(e.target.value)
                  )
                }
              >
                <option value="">Selecione a refeição</option>
                {meals.map((m, i) => (
                  <option key={i} value={i}>
                    {m.name}
                  </option>
                ))}
              </select>

              <Label className="text-sm">Prato (a adicionar):</Label>
              <select
                className="border rounded p-1 w-full text-sm"
                onChange={(e) =>
                  setAddPlatePlateIndex(
                    e.target.value === "" ? undefined : parseInt(e.target.value)
                  )
                }
              >
                <option value="">Selecione o prato</option>
                {plates.map((pl, i) => (
                  <option key={i} value={i}>
                    {pl.name} ({pl.mealName})
                  </option>
                ))}
              </select>

              <Button onClick={addPlateToMealFromUI}>Adicionar Prato</Button>
            </div>

            <hr className="my-4" />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                Refeições &amp; Pratos (Iso-nutri)
              </h3>
              {meals.map((m, mi) => {
                const mealMacros = calculateMealTargets(m.name);
                if (m.plates.length === 0) {
                  return (
                    <Card key={mi} className="p-3 bg-white">
                      <h4 className="font-semibold text-green-700">{m.name}</h4>
                      <p>Nenhum prato nesta refeição.</p>
                    </Card>
                  );
                }
                // Se há pratos
                const platesList = m.plates.map((pl, pi) => {
                  const {p, f, c, cal} = sumPlate(pl);
                  return (
                    <Card
                      key={pi}
                      className="p-2 bg-gray-50 flex items-center justify-between mb-2 last:mb-0"
                    >
                      <div className="text-sm">
                        <strong>{pl.name}</strong> ({pl.mealName})
                        <br />
                        Cal:{cal.toFixed(1)} | HC:{c.toFixed(1)} | P:
                        {p.toFixed(1)} | G:{f.toFixed(1)}
                      </div>
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingMealIndex(mi);
                            setEditingPlateInMealIndex(pi);
                            setCurrentPlate({...pl});
                            setCreatePlateDialogOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemovePlateFromMeal(mi, pi)}
                        >
                          Apagar
                        </Button>
                      </div>
                    </Card>
                  );
                });
                return (
                  <Card key={mi} className="p-3 bg-white space-y-2">
                    <h4 className="font-semibold text-green-700">{m.name}</h4>
                    <p className="text-xs text-gray-600">
                      Metas: {mealMacros.cal.toFixed(1)}kcal | HC:
                      {mealMacros.c.toFixed(1)} | P:{mealMacros.p.toFixed(1)} |
                      G:{mealMacros.f.toFixed(1)}
                    </p>
                    {platesList}
                  </Card>
                );
              })}
            </div>

            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setMealDialogOpen(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Ver Plano Atual */}
        <Dialog open={viewPlanDialogOpen} onOpenChange={setViewPlanDialogOpen}>
          <DialogContent className="max-h-[90%] overflow-auto">
            <DialogHeader>
              <DialogTitle>Plano Atual</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              Aqui estão todas as refeições e pratos já criados. Cada refeição
              aceita apenas pratos idênticos em macros.
            </p>
            <div className="mt-2">{renderFullPlanDetail()}</div>
            <DialogFooter>
              <Button onClick={() => setViewPlanDialogOpen(false)}>
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
              >
                Continuar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
