"use client";

import React, {FormEvent, useState} from "react";
import useLocalStorage from "use-local-storage";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
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
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {Separator} from "@/components/ui/separator";

/* -------------------------------------
   Tipos e Interfaces para Dieta
--------------------------------------*/
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

interface Meal {
  name: MealName;
  plates: Plate[];
}

/* -------------------------------------
   Tipos e Interfaces para Treino
--------------------------------------*/
interface Exercise {
  name: string;
  series: number;
  repetitions: number;
  pause: number; // em segundos
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

/* -------------------------------------
   Tipagem para registos de treino
--------------------------------------*/
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
   COMPONENTE PRINCIPAL
--------------------------------------*/
export default function Page() {
  // Tabs principais: Principal, Dieta, Treino e Pesagens
  const [currentView, setCurrentView] = useState<
    "Principal" | "Dieta" | "Treino" | "Pesagens"
  >("Principal");

  return (
    <div className="font-sans bg-gray-50 h-screen flex flex-col">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover={false}
        draggable={false}
      />

      {/* Top Bar simples */}
      <header className="bg-green-700 text-white p-3">
        <h1 className="text-lg font-bold text-center">
          Plano Nutricional + Treino
        </h1>
      </header>

      {/* Conteúdo principal (scroll interno), deixando espaço em baixo para Bottom Nav */}
      <main className="flex-1 overflow-y-auto p-3 pb-16">
        {currentView === "Principal" && <Principal />}
        {currentView === "Dieta" && <Dieta />}
        {currentView === "Treino" && <Treino />}
        {currentView === "Pesagens" && <Pesagens />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center p-2">
        <Button
          variant={currentView === "Principal" ? "default" : "outline"}
          className="text-xs flex-1 mx-1"
          onClick={() => setCurrentView("Principal")}
        >
          Principal
        </Button>
        <Button
          variant={currentView === "Dieta" ? "default" : "outline"}
          className="text-xs flex-1 mx-1"
          onClick={() => setCurrentView("Dieta")}
        >
          Dieta
        </Button>
        <Button
          variant={currentView === "Treino" ? "default" : "outline"}
          className="text-xs flex-1 mx-1"
          onClick={() => setCurrentView("Treino")}
        >
          Treino
        </Button>
        <Button
          variant={currentView === "Pesagens" ? "default" : "outline"}
          className="text-xs flex-1 mx-1"
          onClick={() => setCurrentView("Pesagens")}
        >
          Pesagens
        </Button>
      </nav>
    </div>
  );
}

/* -------------------------------------
   SEPARADOR PRINCIPAL (Resumo)
--------------------------------------*/
function Principal() {
  // Exemplo de exibir o “Plano Semanal” no Principal (resumo)
  const [weeklyPlan] = useLocalStorage<WeeklyPlan>("weeklyPlan", {
    "Segunda-feira": "Descanso",
    "Terça-feira": "Descanso",
    "Quarta-feira": "Descanso",
    "Quinta-feira": "Descanso",
    "Sexta-feira": "Descanso",
    Sábado: "Descanso",
    Domingo: "Descanso",
  });

  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Bem-vindo!</h2>
        <p className="text-sm text-gray-800">
          Use esta página para apresentar um resumo geral da aplicação, links
          rápidos ou estatísticas recentes.
        </p>
      </Card>

      {/* Plano Semanal (só um resumo) */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Plano Semanal</h2>
        <div className="space-y-2">
          {Object.keys(weeklyPlan).map((day) => (
            <div
              key={day}
              className="p-2 bg-gray-100 rounded text-sm flex justify-between"
            >
              <span className="font-semibold">{day}:</span>
              <span>
                {weeklyPlan[day] !== "Descanso" ? weeklyPlan[day] : "Descanso"}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------
   SEÇÃO DIETA (Listas melhoradas)
--------------------------------------*/
function Dieta() {
  // ---------- Estados e Lógica da Dieta ----------
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

  // Dialog states
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

  // ** Estado para lidar com discrepância de calorias/macros em qualquer ação **
  const [macroMismatchDialogOpen, setMacroMismatchDialogOpen] = useState(false);
  const [macroMismatchData, setMacroMismatchData] = useState<
    {
      label: string;
      diff: number;
      color: string; // "green" | "yellow" | "red"
    }[]
  >([]);

  // Product fields
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

  // Plate items
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

  // Meal & Plate selection
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

  // Percentagens manuais (para dividir calorias pelas refeições)
  const [paPerc, setPaPerc] = useLocalStorage<number>("paPerc", 20);
  const [aPerc, setAPerc] = useLocalStorage<number>("aPerc", 30);
  const [lPerc, setLPerc] = useLocalStorage<number>("lPerc", 20);
  const [jPerc, setJPerc] = useLocalStorage<number>("jPerc", 30);

  const mealNames: MealName[] = [
    "Pequeno-Almoço",
    "Almoço",
    "Lanche da Tarde",
    "Jantar",
  ];

  if (meals.length === 0) {
    setMeals([
      {name: "Pequeno-Almoço", plates: []},
      {name: "Almoço", plates: []},
      {name: "Lanche da Tarde", plates: []},
      {name: "Jantar", plates: []},
    ]);
  }

  /* ------------------------------
     Funções de Cálculo
  -------------------------------*/
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

  // Soma macros do prato
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

  function ensurePlateFitsMeal(plate: Plate): boolean {
    const mt = calculateMealTargets(plate.mealName);
    const sp = sumPlate(plate);
    return sp.cal <= mt.cal && sp.p <= mt.p && sp.f <= mt.f && sp.c <= mt.c;
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

    // Podes ajustar a “tolerância” aqui se desejado
    return (
      Math.abs(sp.p - mt.p) < 0.0001 &&
      Math.abs(sp.f - mt.f) < 0.0001 &&
      Math.abs(sp.c - mt.c) < 0.0001 &&
      Math.abs(sp.cal - mt.cal) < 0.0001
    );
  }

  /**
   * Calcula as diferenças de cada macro em Kcal e retorna um array com
   * label, diff e cor para mostrar no dialog.
   */
  function calcMacroDifferences(plate: Plate) {
    const mt = calculateMealTargets(plate.mealName);
    const sp = sumPlate(plate);

    // Convertemos g de p/c/f em Kcal para comparar
    const proteinDiffKcal = (sp.p - mt.p) * 4;
    const carbDiffKcal = (sp.c - mt.c) * 4;
    const fatDiffKcal = (sp.f - mt.f) * 9;
    const totalDiffKcal = sp.cal - mt.cal;

    // Função para determinar cor
    function getColor(diff: number): string {
      const abs = Math.abs(diff);
      if (abs <= 50) return "green";
      if (abs <= 100) return "yellow";
      return "red";
    }

    // Formata a diferença em sinal + ou -
    function formatDiff(val: number): string {
      if (val > 0) return `+${val.toFixed(1)}kcal`;
      return `${val.toFixed(1)}kcal`;
    }

    const data: {
      label: string;
      diff: number;
      color: string;
    }[] = [];

    // Só exibe cada macro se a diferença for != 0
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

  /* ------------------------------
     Ações (Metas, Produtos, etc.)
  -------------------------------*/
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

  function handleDeleteProduct(index: number) {
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
    toast("Produto apagado!");
  }

  /**
   * Esta função agora lida com a adição de produto ao prato:
   * se exceder as metas, abre modal com opção de “continuar” ou “ajustar”.
   */
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
    // Criamos uma cópia do prato para “simular”
    const cp = {...currentPlate};
    cp.items.push({productIndex: addItemProductIndex, grams: addItemGrams});

    // Se as calorias ultrapassam muito, abriremos modal
    const diffs = calcMacroDifferences(cp);
    if (diffs.length > 0) {
      // Há discrepâncias (para mais ou para menos)
      setMacroMismatchData(diffs);

      // Abrimos um “mini-flow”: se clicar em “Continuar” no modal,
      // de facto adicionamos o produto; se clicar em “Ajustar”, não adicionamos.
      setMacroMismatchDialogOpen(true);

      // Guardamos temporariamente o “produto em espera”
      // e, se o usuário confirmar, aplicamos depois.
      // Uma forma simples: guardar no state e, no “continuar” do modal,
      // aplicamos de fato setCurrentPlate(cp).
      temporaryPlateItem.current = {
        productIndex: addItemProductIndex,
        grams: addItemGrams,
      };
      return;
    }

    // Se chegou aqui sem discrepâncias, adiciona de vez
    setCurrentPlate(cp);
    setAddPlateItemDialogOpen(false);
    setAddItemProductIndex(undefined);
    setAddItemGrams(0);
    toast("Produto adicionado ao prato!");
  }

  // Vamos guardar temporariamente um item “em espera”, caso usuário clique “Continuar”
  const temporaryPlateItem = React.useRef<PlateItem | null>(null);

  /**
   * Ao clicar em “Continuar” dentro do modal de mismatch
   * quando estávamos a adicionar item no prato.
   */
  function proceedWithAddingItemAnyway() {
    if (temporaryPlateItem.current) {
      const {productIndex, grams} = temporaryPlateItem.current;
      const cp = {...currentPlate};
      cp.items.push({productIndex, grams});
      setCurrentPlate(cp);

      toast("Produto adicionado mesmo com discrepâncias!");
      // limpamos e fechamos
      temporaryPlateItem.current = null;
      setAddPlateItemDialogOpen(false);
      setAddItemProductIndex(undefined);
      setAddItemGrams(0);
    }
  }

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

    // Vamos simular a edição
    const cp = {...currentPlate};
    cp.items[editPlateItemIndex].grams = plateItemGramsField;

    // Checamos discrepâncias
    const diffs = calcMacroDifferences(cp);
    if (diffs.length > 0) {
      // Salvar item em “aguardo”
      temporaryEditPlateItem.current = {
        itemIndex: editPlateItemIndex,
        grams: plateItemGramsField,
      };
      setMacroMismatchData(diffs);
      setMacroMismatchDialogOpen(true);
      return;
    }

    // Se sem discrepâncias, conclui
    setCurrentPlate(cp);
    setEditPlateItemDialogOpen(false);
    toast("Quantidade atualizada!");
  }

  const temporaryEditPlateItem = React.useRef<{
    itemIndex: number;
    grams: number;
  } | null>(null);

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

  /**
   * Mostra o diálogo de discrepâncias (macroMismatchDialog).
   * Caso o utilizador clique em Ajustar => Cancela
   * Caso clique em Continuar => Aplica de fato (proceedWithPlate).
   */
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

  /**
   * Finalizar o prato completo.
   */
  function finalizePlate() {
    if (!currentPlate.name.trim() || currentPlate.items.length === 0) {
      toast("Defina um nome e adicione ao menos um produto ao prato.");
      return;
    }

    // Verifica se excedeu macros completamente
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

    // Agora, se não "encaixa" 100%…
    if (!plateMatchesMealTarget(currentPlate)) {
      const diffs = calcMacroDifferences(currentPlate);
      if (diffs.length > 0) {
        showMacroMismatchDialog(diffs);
        // Precisamos de um “estado” para saber que estamos finalizando o prato
        // e não apenas adicionando item. Podemos ter outro ref ou bool:
        setIsFinishingPlate(true);
        return;
      }
    }

    // Se estiver tudo certo, prossegue
    proceedWithPlate();
  }

  // Para sabermos se estamos finalizando prato ou apenas adicionando item
  const [isFinishingPlate, setIsFinishingPlate] = useState(false);

  /**
   * Salva de fato o prato (após o mismatch ou se não houve mismatch).
   */
  function proceedWithPlate() {
    // Se não for mismatch do finalizePlate, reset a flag
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

    // Decidir se estamos em modo “Editar prato numa refeição” ou “Criar prato”
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

    // Limpa e fecha
    setCurrentPlate({name: "", mealName: "Pequeno-Almoço", items: []});
    setCreatePlateDialogOpen(false);
  }

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

  /* ------------------------------
     Renderização de Planos
  -------------------------------*/
  function calculateTotals() {
    let totalP = 0,
      totalF = 0,
      totalC = 0,
      totalCal = 0;
    meals.forEach((meal) => {
      meal.plates.forEach((plate: Plate) => {
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
              const pVal = prod.p * factor;
              const fVal = prod.f * factor;
              const cVal = prod.c * factor;
              const calVal = prod.cal * factor;
              return (
                <p key={k} className="text-xs text-gray-600 ml-2">
                  {prod.name} – {it.grams.toFixed(1)}g | HC:{cVal.toFixed(1)}g |
                  P:
                  {pVal.toFixed(1)}g | G:{fVal.toFixed(1)}g | Cal:
                  {calVal.toFixed(1)}
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

  /* ------------------------------
     Renderização final da secção Dieta
  -------------------------------*/
  const daily = calculateDailyTargets();
  const totals = calculateTotals();
  const totalPerc = paPerc + aPerc + lPerc + jPerc;

  return (
    <div className="space-y-6">
      {/* 1) Cartão de Resumo Diário */}
      <Card className="p-4 space-y-5">
        <h2 className="text-lg font-semibold">Resumo Diário</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <div className="bg-white rounded p-2 shadow">
            <strong>Alvo Calorias:</strong> {daily.cal.toFixed(1)}
          </div>
          <div className="bg-white rounded p-2 shadow">
            <strong>Alvo Hidratos:</strong> {daily.c.toFixed(1)}
          </div>
          <div className="bg-white rounded p-2 shadow">
            <strong>Alvo Proteina:</strong> {daily.p.toFixed(1)}
          </div>
          <div className="bg-white rounded p-2 shadow">
            <strong>Alvo Gordura:</strong> {daily.f.toFixed(1)}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <div className="bg-white rounded p-2 shadow">
            <strong>Atual Calorias:</strong> {totals.cal.toFixed(1)}
          </div>
          <div className="bg-white rounded p-2 shadow">
            <strong>Atual Hidratos:</strong> {totals.c.toFixed(1)}
          </div>
          <div className="bg-white rounded p-2 shadow">
            <strong>Atual Proteina:</strong> {totals.p.toFixed(1)}
          </div>
          <div className="bg-white rounded p-2 shadow">
            <strong>Atual Gordura:</strong> {totals.f.toFixed(1)}
          </div>
        </div>
      </Card>

      {/* 2) Cartão de Limites por Refeição */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Limites por Refeição</h2>
        <p className="text-sm text-gray-600">
          Cada refeição tem limites baseados nas percentagens definidas no
          final.
        </p>
        <div className="overflow-x-auto text-sm">
          <table className="w-full mt-2">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Refeição</th>
                <th className="p-2 text-left">Cal</th>
                <th className="p-2 text-left">HC</th>
                <th className="p-2 text-left">P</th>
                <th className="p-2 text-left">G</th>
              </tr>
            </thead>
            <tbody>
              {mealNames.map((mn) => {
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

      {/* 3) Cartão de Ações Rápidas */}
      <Card className="p-4 space-y-2">
        <h2 className="text-lg font-semibold mb-2">Ações Rápidas</h2>
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

      {/* 4) Cartão de Ajuste de Percentagens */}
      <Card className="p-4 space-y-2">
        <h2 className="text-lg font-semibold">Percentagens por Refeição</h2>
        <p className="text-sm text-gray-600">
          Ajuste a distribuição (em %) das calorias diárias para cada refeição.
          A soma deve ser 100%.
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
            Soma atual: {totalPerc}%{" "}
            {totalPerc !== 100 && (
              <span className="text-red-600">— Ajuste para somar 100%</span>
            )}
          </p>
        </div>
      </Card>

      {/* Diálogos (Metas, Produtos, Pratos, etc.) */}
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
            <Button onClick={() => setProductDialogOpen(false)}>Fechar</Button>
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
                if (Number(e.target.value) === 0) {
                  e.target.value = "";
                }
              }}
            />
            <Label>Gordura (g/100g):</Label>
            <Input
              type="number"
              value={productFField}
              onChange={(e) => setProductFField(Number(e.target.value))}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                if (Number(e.target.value) === 0) {
                  e.target.value = "";
                }
              }}
            />
            <Label>Carboidrato (g/100g):</Label>
            <Input
              type="number"
              value={productCField}
              onChange={(e) => setProductCField(Number(e.target.value))}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                if (Number(e.target.value) === 0) {
                  e.target.value = "";
                }
              }}
            />
            <Label>Calorias (kcal/100g):</Label>
            <Input
              type="number"
              value={productCalField}
              onChange={(e) => setProductCalField(Number(e.target.value))}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                if (Number(e.target.value) === 0) {
                  e.target.value = "";
                }
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
            // Cancelar a criação/edição do prato
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

          {/* Metas da refeição escolhida */}
          {currentPlate.mealName && (
            <p className="text-sm text-gray-600 mb-2">
              Metas da Refeição ({currentPlate.mealName}):{" "}
              {calculateMealTargets(currentPlate.mealName).cal.toFixed(1)}
              kcal | HC:
              {calculateMealTargets(currentPlate.mealName).c.toFixed(1)}g | P:
              {calculateMealTargets(currentPlate.mealName).p.toFixed(1)}g | G:
              {calculateMealTargets(currentPlate.mealName).f.toFixed(1)}g
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
            onValueChange={(val) => {
              setCurrentPlate({...currentPlate, mealName: val as MealName});
            }}
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

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Produtos no Prato</h3>
            {currentPlate.items.length === 0 ? (
              <p className="text-sm text-gray-700">Nenhum produto no prato.</p>
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
                              HC:{cVal.toFixed(1)}g | P:{pVal.toFixed(1)}g | G:
                              {fVal.toFixed(1)}g | Cal:{calVal.toFixed(1)}
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
                      HC:{c.toFixed(1)}g | P:{p.toFixed(1)}g | G:{f.toFixed(1)}g
                    </p>
                  </>
                );
              })()
            )}
          </div>

          <div className="mt-2 text-sm text-gray-600">
            O prato deve corresponder às metas da refeição, mas pode haver
            pequenas discrepâncias. Se houver diferenças, surgirá um aviso para
            Ajustar ou Continuar.
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
            Cada refeição só deve ter pratos idênticos em macros, para garantir
            isonomia.
          </p>
          <div className="space-y-2 mt-2">
            <Label className="text-sm">Refeição (para adicionar prato):</Label>
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
                      Cal:{cal.toFixed(1)} | HC:{c.toFixed(1)}g | P:
                      {p.toFixed(1)}g | G:{f.toFixed(1)}g
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
                    {mealMacros.c.toFixed(1)}g | P:{mealMacros.p.toFixed(1)}g |
                    G:{mealMacros.f.toFixed(1)}g
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
            Aqui estão todas as refeições e pratos criados. Cada refeição apenas
            aceita pratos idênticos em macros, garantindo intercambialidade.
          </p>
          <div className="mt-2">{renderFullPlanDetail()}</div>
          <DialogFooter>
            <Button onClick={() => setViewPlanDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de discrepâncias de macros */}
      <Dialog
        open={macroMismatchDialogOpen}
        onOpenChange={(open) => {
          setMacroMismatchDialogOpen(open);
          if (!open) {
            // Se fecharmos sem Continuar, cancela a “finalização do prato”
            // e também limpa os refs de item temporário
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
              Pode Ajustar para voltar e corrigir os valores ou Continuar para
              aceitar esta diferença.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                // Fechar o mismatchDialog e NÃO prosseguir
                setMacroMismatchDialogOpen(false);
              }}
            >
              Ajustar
            </Button>
            <Button
              onClick={() => {
                setMacroMismatchDialogOpen(false);
                if (isFinishingPlate) {
                  // Se estamos a finalizar prato
                  proceedWithPlate();
                } else if (temporaryPlateItem.current) {
                  // Se estávamos a adicionar item
                  proceedWithAddingItemAnyway();
                } else if (temporaryEditPlateItem.current) {
                  // Se estávamos a editar item
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

/* -------------------------------------
   SEÇÃO TREINO (Listas melhoradas)
--------------------------------------*/
function Treino() {
  // Estados para Exercícios
  const [exercises, setExercises] = useLocalStorage<Exercise[]>(
    "exercises",
    []
  );
  const [exerciseDialogOpen, setExerciseDialogOpen] = useLocalStorage<boolean>(
    "exerciseDialogOpen",
    false
  );
  const [editExerciseIndex, setEditExerciseIndex] = useLocalStorage<
    number | undefined
  >("editExerciseIndex", undefined);
  const [exerciseName, setExerciseName] = useLocalStorage<string>(
    "exerciseName",
    ""
  );
  const [exerciseSeries, setExerciseSeries] = useLocalStorage<number>(
    "exerciseSeries",
    3
  );
  const [exerciseRepetitions, setExerciseRepetitions] = useLocalStorage<number>(
    "exerciseRepetitions",
    10
  );
  const [exercisePause, setExercisePause] = useLocalStorage<number>(
    "exercisePause",
    60
  );

  // Estados para Treinos
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>("workouts", []);
  const [workoutDialogOpen, setWorkoutDialogOpen] = useLocalStorage<boolean>(
    "workoutDialogOpen",
    false
  );
  const [editWorkoutIndex, setEditWorkoutIndex] = useLocalStorage<
    number | undefined
  >("editWorkoutIndex", undefined);
  const [workoutName, setWorkoutName] = useLocalStorage<string>(
    "workoutName",
    ""
  );
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);

  // Plano Semanal
  const [weeklyPlan, setWeeklyPlan] = useLocalStorage<WeeklyPlan>(
    "weeklyPlan",
    {
      "Segunda-feira": "Descanso",
      "Terça-feira": "Descanso",
      "Quarta-feira": "Descanso",
      "Quinta-feira": "Descanso",
      "Sexta-feira": "Descanso",
      Sábado: "Descanso",
      Domingo: "Descanso",
    }
  );

  /* ------------------------------
     Funções de Exercícios
  -------------------------------*/
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
    setExercises([...exercises, exercise]);
    clearExerciseFields();
    setExerciseDialogOpen(false);
    toast("Exercício adicionado com sucesso!");
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
    const newExercises = [...exercises];
    newExercises[editExerciseIndex] = {
      name: exerciseName.trim(),
      series: exerciseSeries,
      repetitions: exerciseRepetitions,
      pause: exercisePause,
    };
    setExercises(newExercises);
    clearExerciseFields();
    setEditExerciseIndex(undefined);
    setExerciseDialogOpen(false);
    toast("Exercício editado com sucesso!");
  }

  function handleDeleteExercise(index: number) {
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
    toast("Exercício apagado!");
  }

  function clearExerciseFields() {
    setExerciseName("");
    setExerciseSeries(3);
    setExerciseRepetitions(10);
    setExercisePause(60);
  }

  /* ------------------------------
     Funções de Treinos
  -------------------------------*/
  function handleAddWorkoutSubmit(e: FormEvent) {
    e.preventDefault();
    if (!workoutName.trim()) {
      toast("Preencha o nome do treino.");
      return;
    }
    const selectedExs = selectedExercises.map((i) => exercises[i]);
    if (selectedExs.length === 0) {
      toast("Selecione pelo menos um exercício.");
      return;
    }
    const workout: Workout = {
      name: workoutName.trim(),
      exercises: selectedExs,
    };
    setWorkouts([...workouts, workout]);
    clearWorkoutFields();
    setWorkoutDialogOpen(false);
    toast("Treino adicionado com sucesso!");
  }

  function handleEditWorkoutClick(index: number) {
    const wt = workouts[index];
    setEditWorkoutIndex(index);
    setWorkoutName(wt.name);
    const exIndices = wt.exercises.map((ex) => exercises.indexOf(ex));
    setSelectedExercises(exIndices);
    setWorkoutDialogOpen(true);
  }

  function handleEditWorkoutSubmit(e: FormEvent) {
    e.preventDefault();
    if (editWorkoutIndex === undefined) return;
    if (!workoutName.trim()) {
      toast("Preencha o nome do treino.");
      return;
    }
    const selectedExs = selectedExercises.map((i) => exercises[i]);
    if (selectedExs.length === 0) {
      toast("Selecione pelo menos um exercício.");
      return;
    }
    const newWorkouts = [...workouts];
    newWorkouts[editWorkoutIndex] = {
      name: workoutName.trim(),
      exercises: selectedExs,
    };
    setWorkouts(newWorkouts);
    clearWorkoutFields();
    setEditWorkoutIndex(undefined);
    setWorkoutDialogOpen(false);
    toast("Treino editado com sucesso!");
  }

  function handleDeleteWorkout(index: number) {
    const newWorkouts = [...workouts];
    newWorkouts.splice(index, 1);
    setWorkouts(newWorkouts);
    toast("Treino apagado!");
  }

  function clearWorkoutFields() {
    setWorkoutName("");
    setSelectedExercises([]);
  }

  /* ------------------------------
     Plano Semanal (render)
  -------------------------------*/
  function renderWeeklyPlan() {
    return (
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Plano Semanal</h2>
        <p className="text-sm text-gray-600">
          Defina o treino ou “Descanso” para cada dia da semana:
        </p>

        <div className="space-y-2 mt-2">
          {(Object.keys(weeklyPlan) as DayOfWeek[]).map((day) => {
            const assignedWorkout = weeklyPlan[day];
            return (
              <Card key={day} className="p-2 bg-white flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">{day}:</span>
                  <span className="text-sm">
                    {assignedWorkout !== "Descanso"
                      ? assignedWorkout
                      : "Descanso"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Select
                    onValueChange={(val) =>
                      setWeeklyPlan({...weeklyPlan, [day]: val})
                    }
                    value={
                      assignedWorkout !== "Descanso" ? assignedWorkout : ""
                    }
                  >
                    <SelectTrigger className="w-full sm:w-[160px] text-sm">
                      <SelectValue placeholder="Selecionar Treino" />
                    </SelectTrigger>
                    <SelectContent>
                      {workouts.map((wt, i) => (
                        <SelectItem key={i} value={wt.name}>
                          {wt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setWeeklyPlan({...weeklyPlan, [day]: "Descanso"})
                    }
                  >
                    Definir Descanso
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    );
  }

  /* ------------------------------
     Registo Diário
  -------------------------------*/
  const [showWeeklyTraining, setShowWeeklyTraining] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);

  function renderWeeklyTraining() {
    return (
      <Card className="p-4 space-y-4 mt-4">
        <h2 className="text-lg font-semibold">Dias da Semana (Registo)</h2>
        <p className="text-sm text-gray-700">
          Selecione o dia para ver o treino atribuído e registar séries.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {(Object.keys(weeklyPlan) as DayOfWeek[]).map((day) => (
            <Button
              key={day}
              onClick={() => setSelectedDay(day)}
              variant="outline"
              className="text-xs"
            >
              {day}
            </Button>
          ))}
        </div>
      </Card>
    );
  }

  function renderSelectedDayWorkout() {
    if (!selectedDay) return null;
    const assignedWorkout = weeklyPlan[selectedDay];
    if (assignedWorkout === "Descanso") {
      return (
        <Card className="p-4 space-y-4 mt-4">
          <h3 className="text-lg font-semibold">{selectedDay} - Descanso</h3>
          <p className="text-sm text-gray-700">
            Não há treino atribuído neste dia.
          </p>
        </Card>
      );
    }
    const workout = workouts.find((w) => w.name === assignedWorkout);
    if (!workout) {
      return (
        <Card className="p-4 space-y-4 mt-4">
          <h3 className="text-lg font-semibold">
            {selectedDay} - Nenhum treino encontrado
          </h3>
          <p className="text-sm text-gray-700">
            Foi atribuído “{assignedWorkout}”, mas ele não existe mais na lista
            de treinos.
          </p>
        </Card>
      );
    }
    return (
      <Card className="p-4 space-y-4 mt-4">
        <h3 className="text-lg font-semibold">
          {selectedDay} - {workout.name}
        </h3>
        <ul className="space-y-2">
          {workout.exercises.map((ex, i) => (
            <li
              key={i}
              className="border p-2 rounded bg-white text-sm flex items-center justify-between"
            >
              <div>
                <strong>{ex.name}</strong>
                <br />
                Séries sugeridas: {ex.series} | Repetições sugeridas:{" "}
                {ex.repetitions} | Pausa: {ex.pause}s
              </div>
              <Button size="sm" onClick={() => openExerciseLogDialog(ex)}>
                Registar
              </Button>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <h4 className="font-semibold text-base">Histórico do Dia</h4>
          {renderDayLogHistory(workout.name)}
        </div>
      </Card>
    );
  }

  /* ------------------------------
     Registo de Séries
  -------------------------------*/
  const [exerciseLogDialogOpen, setExerciseLogDialogOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);

  const [newSetReps, setNewSetReps] = useState(0);
  const [newSetWeight, setNewSetWeight] = useState(0);
  const [editSetIndex, setEditSetIndex] = useState<number | null>(null);

  function openExerciseLogDialog(ex: Exercise) {
    setCurrentExercise(ex);
    setExerciseLogDialogOpen(true);
    setNewSetReps(0);
    setNewSetWeight(0);
    setEditSetIndex(null);
  }

  const [trainingLogs, setTrainingLogs] = useLocalStorage<TrainingLogEntry[]>(
    "trainingLogs",
    []
  );

  function handleSaveSet() {
    if (!currentExercise || !selectedDay) return;
    if (newSetReps <= 0 || newSetWeight < 0) {
      toast("Valores inválidos para repetições/peso.");
      return;
    }
    const assignedWorkout = weeklyPlan[selectedDay];
    if (!assignedWorkout || assignedWorkout === "Descanso") return;

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

    const exerciseLogIndex = targetLog.exerciseLogs.findIndex(
      (el) => el.exerciseName === currentExercise.name
    );

    let exLog: ExerciseLog;
    if (exerciseLogIndex >= 0) {
      exLog = {...targetLog.exerciseLogs[exerciseLogIndex]};
    } else {
      exLog = {exerciseName: currentExercise.name, sets: []};
    }

    if (editSetIndex !== null) {
      exLog.sets[editSetIndex] = {
        reps: newSetReps,
        weight: newSetWeight,
      };
    } else {
      exLog.sets.push({
        reps: newSetReps,
        weight: newSetWeight,
      });
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

    if (editSetIndex !== null) {
      toast("Set editado com sucesso!");
    } else {
      toast("Set adicionado ao registo de hoje!");
    }

    setNewSetReps(0);
    setNewSetWeight(0);
    setEditSetIndex(null);
  }

  function renderSetsOfCurrentExercise() {
    if (!currentExercise || !selectedDay) return null;
    const assignedWorkout = weeklyPlan[selectedDay];
    if (!assignedWorkout || assignedWorkout === "Descanso") return null;

    const todayDate = new Date().toISOString().slice(0, 10);
    const logEntry = trainingLogs.find(
      (log) =>
        log.date === todayDate &&
        log.dayOfWeek === selectedDay &&
        log.workoutName === assignedWorkout
    );
    if (!logEntry) return <p>Nenhum set registado ainda.</p>;

    const exLog = logEntry.exerciseLogs.find(
      (el) => el.exerciseName === currentExercise.name
    );
    if (!exLog || exLog.sets.length === 0) {
      return <p>Nenhum set registado ainda.</p>;
    }

    return (
      <ul className="space-y-1 mt-2">
        {exLog.sets.map((s, idx) => (
          <li key={idx} className="flex justify-between items-center text-sm">
            <span>
              Set {idx + 1}: {s.reps} repetições | {s.weight} kg
            </span>
            <div className="space-x-2">
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
            </div>
          </li>
        ))}
      </ul>
    );
  }

  function renderDayLogHistory(currentWorkoutName: string) {
    const logsOfThisDayAndWorkout = trainingLogs.filter(
      (log) =>
        log.dayOfWeek === selectedDay && log.workoutName === currentWorkoutName
    );
    if (logsOfThisDayAndWorkout.length === 0) {
      return (
        <p className="text-sm text-gray-500">Nenhum registo para este dia.</p>
      );
    }

    return logsOfThisDayAndWorkout.map((log, idx) => (
      <div key={idx} className="border p-2 rounded mt-2 bg-gray-100">
        <h5 className="font-semibold mb-1 text-gray-700">Data: {log.date}</h5>
        {log.exerciseLogs.length === 0 ? (
          <p>Nenhum exercício registado.</p>
        ) : (
          <ul className="list-disc ml-4">
            {log.exerciseLogs.map((exLog, exIdx) => (
              <li key={exIdx} className="mb-2 text-sm">
                <strong>{exLog.exerciseName}</strong>
                <ul className="list-none ml-0">
                  {exLog.sets.map((s, sIdx) => (
                    <li key={sIdx}>
                      Set {sIdx + 1}: {s.reps} reps, {s.weight} kg
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    ));
  }

  return (
    <div className="space-y-6">
      {/* Lista de Exercícios (cartões) */}
      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Exercícios</h2>
          <Button onClick={() => setExerciseDialogOpen(true)}>
            Adicionar Exercício
          </Button>
        </div>
        {exercises.length === 0 ? (
          <p>Nenhum exercício criado.</p>
        ) : (
          <div className="space-y-2">
            {exercises.map((ex, i) => (
              <Card
                key={i}
                className="p-2 bg-white text-sm flex items-center justify-between"
              >
                <div>
                  <strong>{ex.name}</strong>
                  <br />
                  Séries: {ex.series} | Repetições: {ex.repetitions} | Pausa:{" "}
                  {ex.pause}s
                </div>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEditExerciseClick(i)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteExercise(i)}
                  >
                    Apagar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Lista de Treinos (cartões) */}
      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Treinos</h2>
          <Button onClick={() => setWorkoutDialogOpen(true)}>
            Adicionar Treino
          </Button>
        </div>
        {workouts.length === 0 ? (
          <p>Nenhum treino criado.</p>
        ) : (
          <div className="space-y-2">
            {workouts.map((wt, i) => (
              <Card key={i} className="p-2 bg-white text-sm space-y-1">
                <div className="flex justify-between items-center">
                  <strong>{wt.name}</strong>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditWorkoutIndex(i);
                        setWorkoutName(wt.name);
                        const exIndices = wt.exercises.map((ex) =>
                          exercises.indexOf(ex)
                        );
                        setSelectedExercises(exIndices);
                        setWorkoutDialogOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteWorkout(i)}
                    >
                      Apagar
                    </Button>
                  </div>
                </div>
                <ul className="ml-4 list-disc text-xs text-gray-700 mt-1">
                  {wt.exercises.map((ex, j) => (
                    <li key={j}>
                      {ex.name} – {ex.series}x{ex.repetitions}, pausa {ex.pause}
                      s
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Plano Semanal */}
      {renderWeeklyPlan()}

      {/* Registo Diário */}
      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Registo Diário</h2>
          <Button onClick={() => setShowWeeklyTraining(!showWeeklyTraining)}>
            {showWeeklyTraining
              ? "Fechar Dias da Semana"
              : "Ver Dias da Semana"}
          </Button>
        </div>
        {showWeeklyTraining && (
          <div>
            {renderWeeklyTraining()}
            {selectedDay && (
              <div>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => setSelectedDay(null)}
                >
                  Voltar
                </Button>
                {renderSelectedDayWorkout()}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Dialog Exercício */}
      <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editExerciseIndex !== undefined
                ? "Editar Exercício"
                : "Adicionar Exercício"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={
              editExerciseIndex !== undefined
                ? handleEditExerciseSubmit
                : handleAddExerciseSubmit
            }
            className="space-y-2"
          >
            <Label>Nome:</Label>
            <Input
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
            />
            <Label>Séries:</Label>
            <Input
              type="number"
              value={exerciseSeries}
              onChange={(e) => setExerciseSeries(Number(e.target.value))}
            />
            <Label>Repetições:</Label>
            <Input
              type="number"
              value={exerciseRepetitions}
              onChange={(e) => setExerciseRepetitions(Number(e.target.value))}
            />
            <Label>Pausa (segundos):</Label>
            <Input
              type="number"
              value={exercisePause}
              onChange={(e) => setExercisePause(Number(e.target.value))}
            />
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditExerciseIndex(undefined);
                  setExerciseDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editExerciseIndex !== undefined ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Treino */}
      <Dialog open={workoutDialogOpen} onOpenChange={setWorkoutDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editWorkoutIndex !== undefined
                ? "Editar Treino"
                : "Adicionar Treino"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={
              editWorkoutIndex !== undefined
                ? handleEditWorkoutSubmit
                : handleAddWorkoutSubmit
            }
            className="space-y-2"
          >
            <Label>Nome do Treino:</Label>
            <Input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
            <Label>Exercícios:</Label>
            <div className="space-y-1 max-h-40 overflow-y-auto border p-2 rounded">
              {exercises.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhum exercício disponível.
                </p>
              ) : (
                exercises.map((ex, i) => (
                  <div key={i} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedExercises.includes(i)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedExercises([...selectedExercises, i]);
                        } else {
                          setSelectedExercises(
                            selectedExercises.filter((idx) => idx !== i)
                          );
                        }
                      }}
                      className="mr-2"
                    />
                    <span>{ex.name}</span>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditWorkoutIndex(undefined);
                  setWorkoutDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editWorkoutIndex !== undefined ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Registo de Séries */}
      <Dialog
        open={exerciseLogDialogOpen}
        onOpenChange={setExerciseLogDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registar Séries - {currentExercise?.name}</DialogTitle>
          </DialogHeader>
          {currentExercise && (
            <div className="space-y-2">
              <div>
                <Label>Número de Repetições:</Label>
                <Input
                  type="number"
                  value={newSetReps}
                  onChange={(e) => setNewSetReps(Number(e.target.value))}
                  onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                    if (Number(e.target.value) === 0) {
                      e.target.value = "";
                    }
                  }}
                />
              </div>
              <div>
                <Label>Peso (kg):</Label>
                <Input
                  type="number"
                  value={newSetWeight}
                  onChange={(e) => setNewSetWeight(Number(e.target.value))}
                  onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                    if (Number(e.target.value) === 0) {
                      e.target.value = "";
                    }
                  }}
                />
              </div>
              <Button onClick={handleSaveSet}>
                {editSetIndex !== null ? "Salvar Set" : "Adicionar Set"}
              </Button>
              <hr className="my-2" />
              <h4 className="font-semibold">Sets de Hoje</h4>
              {renderSetsOfCurrentExercise()}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setExerciseLogDialogOpen(false);
                setEditSetIndex(null);
                setNewSetReps(0);
                setNewSetWeight(0);
              }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------
   SEÇÃO PESAGENS (Listas melhoradas)
--------------------------------------*/
function Pesagens() {
  const [measurements, setMeasurements] = useLocalStorage<Measurement[]>(
    "measurements",
    []
  );

  // Diálogo para adicionar/editar
  const [measurementDialogOpen, setMeasurementDialogOpen] =
    useLocalStorage<boolean>("measurementDialogOpen", false);
  const [editMeasurementIndex, setEditMeasurementIndex] = useLocalStorage<
    number | undefined
  >("editMeasurementIndex", undefined);

  // Diálogo para visualizar detalhes
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailMeasurement, setDetailMeasurement] =
    useState<Measurement | null>(null);

  // Campos do form de pesagem
  const [date, setDate] = useLocalStorage<string>("date", "");
  const [time, setTime] = useLocalStorage<string>("time", "");
  const [weight, setWeight] = useLocalStorage<number>("weight", 0);
  const [muscleMassPercent, setMuscleMassPercent] = useLocalStorage<number>(
    "muscleMassPercent",
    0
  );
  const [muscleMassKg, setMuscleMassKg] = useLocalStorage<number>(
    "muscleMassKg",
    0
  );
  const [fatMassPercent, setFatMassPercent] = useLocalStorage<number>(
    "fatMassPercent",
    0
  );
  const [waterPercent, setWaterPercent] = useLocalStorage<number>(
    "waterPercent",
    0
  );
  const [height, setHeight] = useLocalStorage<number>("height", 0);
  const [visceralFat, setVisceralFat] = useLocalStorage<number>(
    "visceralFat",
    0
  );
  const [metabolicAge, setMetabolicAge] = useLocalStorage<number>(
    "metabolicAge",
    0
  );

  /* ------------------------------
     Ações: Adicionar, Editar, etc.
  -------------------------------*/
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
    clearMeasurementFields();
    setMeasurementDialogOpen(false);
    toast("Pesagem adicionada com sucesso!");
  }

  function handleEditMeasurementClick(index: number) {
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
    if (editMeasurementIndex === undefined) return;
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
    clearMeasurementFields();
    setEditMeasurementIndex(undefined);
    setMeasurementDialogOpen(false);
    toast("Pesagem editada com sucesso!");
  }

  function handleDeleteMeasurement(index: number) {
    const newMeasurements = [...measurements];
    newMeasurements.splice(index, 1);
    setMeasurements(newMeasurements);
    toast("Pesagem apagada!");
  }

  function clearMeasurementFields() {
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

  // Ao clicar numa pesagem, abrimos o diálogo de detalhes
  function openMeasurementDetail(m: Measurement) {
    setDetailMeasurement(m);
    setDetailDialogOpen(true);
  }

  /* ------------------------------
     Renderização final de Pesagens
  -------------------------------*/
  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Pesagens</h2>
          <Button onClick={() => setMeasurementDialogOpen(true)}>
            Adicionar Pesagem
          </Button>
        </div>

        {measurements.length === 0 ? (
          <p>Nenhuma pesagem registrada.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {measurements.map((m, i) => (
              <Button
                key={i}
                variant="outline"
                className="justify-between text-sm"
                onClick={() => openMeasurementDetail(m)}
              >
                <span>Data: {m.date}</span>
                <span className="ml-2 text-gray-600 text-xs">
                  Hora: {m.time}
                </span>
              </Button>
            ))}
          </div>
        )}
      </Card>

      {/* Dialog Adicionar/Editar Pesagem */}
      <Dialog
        open={measurementDialogOpen}
        onOpenChange={setMeasurementDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMeasurementIndex !== undefined
                ? "Editar Pesagem"
                : "Adicionar Pesagem"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={
              editMeasurementIndex !== undefined
                ? handleEditMeasurementSubmit
                : handleAddMeasurementSubmit
            }
            className="space-y-2"
          >
            <Label>Data:</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Label>Hora:</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <Label>Peso (kg):</Label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                if (Number(e.target.value) === 0) {
                  e.target.value = "";
                }
              }}
            />
            <Label>Massa Muscular (%):</Label>
            <Input
              type="number"
              value={muscleMassPercent}
              onChange={(e) => setMuscleMassPercent(Number(e.target.value))}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                if (Number(e.target.value) === 0) {
                  e.target.value = "";
                }
              }}
            />
            <Label>Massa Muscular (kg):</Label>
            <Input
              type="number"
              value={muscleMassKg}
              onChange={(e) => setMuscleMassKg(Number(e.target.value))}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                if (Number(e.target.value) === 0) {
                  e.target.value = "";
                }
              }}
            />
            <Label>Massa Gorda (%):</Label>
            <Input
              type="number"
              value={fatMassPercent}
              onChange={(e) => setFatMassPercent(Number(e.target.value))}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                if (Number(e.target.value) === 0) {
                  e.target.value = "";
                }
              }}
            />
            <Label>Água (%):</Label>
            <Input
              type="number"
              value={waterPercent}
              onChange={(e) => setWaterPercent(Number(e.target.value))}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                if (Number(e.target.value) === 0) {
                  e.target.value = "";
                }
              }}
            />
            <Label>Altura (cm):</Label>
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                if (Number(e.target.value) === 0) {
                  e.target.value = "";
                }
              }}
            />
            <Label>Gordura Visceral:</Label>
            <Input
              type="number"
              value={visceralFat}
              onChange={(e) => setVisceralFat(Number(e.target.value))}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                if (Number(e.target.value) === 0) {
                  e.target.value = "";
                }
              }}
            />
            <Label>Idade Metabólica:</Label>
            <Input
              type="number"
              value={metabolicAge}
              onChange={(e) => setMetabolicAge(Number(e.target.value))}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                if (Number(e.target.value) === 0) {
                  e.target.value = "";
                }
              }}
            />
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditMeasurementIndex(undefined);
                  setMeasurementDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editMeasurementIndex !== undefined ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalhes da Pesagem */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Pesagem</DialogTitle>
          </DialogHeader>
          {detailMeasurement && (
            <div className="text-sm space-y-2">
              <p>
                <strong>Data:</strong> {detailMeasurement.date}
              </p>
              <p>
                <strong>Hora:</strong> {detailMeasurement.time}
              </p>
              <p>
                <strong>Peso:</strong> {detailMeasurement.weight} kg
              </p>
              <p>
                <strong>Massa Muscular (%):</strong>{" "}
                {detailMeasurement.muscleMassPercent}
              </p>
              <p>
                <strong>Massa Muscular (kg):</strong>{" "}
                {detailMeasurement.muscleMassKg}
              </p>
              <p>
                <strong>Massa Gorda (%):</strong>{" "}
                {detailMeasurement.fatMassPercent}
              </p>
              <p>
                <strong>Água (%):</strong> {detailMeasurement.waterPercent}
              </p>
              <p>
                <strong>Altura (cm):</strong> {detailMeasurement.height}
              </p>
              <p>
                <strong>Gordura Visceral:</strong>{" "}
                {detailMeasurement.visceralFat}
              </p>
              <p>
                <strong>Idade Metabólica:</strong>{" "}
                {detailMeasurement.metabolicAge}
              </p>

              <div className="flex justify-end space-x-2 mt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const idx = measurements.indexOf(detailMeasurement);
                    if (idx >= 0) {
                      handleEditMeasurementClick(idx);
                      setDetailDialogOpen(false);
                    }
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const idx = measurements.indexOf(detailMeasurement);
                    if (idx >= 0) {
                      handleDeleteMeasurement(idx);
                      setDetailDialogOpen(false);
                    }
                  }}
                >
                  Apagar
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDetailDialogOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
