"use client";

import React, { FormEvent, useState } from "react";
import useLocalStorage from "use-local-storage";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Tipos e Interfaces para Dieta
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

// Tipos e Interfaces para Treino
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
  [key: string]: string; // Dia da semana -> Nome do Treino ou "Descanso"
}

// Tipos e Interfaces para Pesagens
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

export default function Page() {
  const [currentView, setCurrentView] = useState<"Dieta" | "Treino" | "Pesagens">(
	"Dieta"
  );

  return (
	<div className="font-sans bg-gray-50 min-h-screen">
  	<ToastContainer
    	position="top-right"
    	autoClose={3000}
    	hideProgressBar
    	closeOnClick
    	pauseOnHover={false}
    	draggable={false}
  	/>
  	<header className="bg-green-700 text-white shadow p-4 flex items-center justify-between">
    	<h1 className="text-2xl font-bold">Plano de Saúde</h1>
    	{/* Menu de Navegação */}
    	<nav>
      	<ul className="flex space-x-4">
        	<li>
          	<Button
				variant={currentView === "Dieta" ? "default" : "ghost"}
            	onClick={() => setCurrentView("Dieta")}
          	>
            	Dieta
          	</Button>
        	</li>
        	<li>
          	<Button
				variant={currentView === "Treino" ? "default" : "ghost"}
            	onClick={() => setCurrentView("Treino")}
          	>
            	Treino
          	</Button>
        	</li>
        	<li>
          	<Button
				variant={currentView === "Pesagens" ? "default" : "ghost"}
            	onClick={() => setCurrentView("Pesagens")}
          	>
            	Pesagens
          	</Button>
        	</li>
      	</ul>
    	</nav>
  	</header>

  	<main className="max-w-6xl mx-auto p-6 space-y-8">
    	{currentView === "Dieta" && <Dieta />}
    	{currentView === "Treino" && <Treino />}
    	{currentView === "Pesagens" && <Pesagens />}
  	</main>
	</div>
  );
}

// ------------------- Seção Dieta -------------------

function Dieta() {
  // Estados e Lógica da Dieta (Mantidos do Código Original)
  const [calTarget, setCalTarget] = useLocalStorage<number>("calTarget", 1975);
  const [protPercent, setProtPercent] = useLocalStorage<number>("protPercent", 30);
  const [fatPercent, setFatPercent] = useLocalStorage<number>("fatPercent", 20);
  const [carbPercent, setCarbPercent] = useLocalStorage<number>("carbPercent", 50);

  const [products, setProducts] = useLocalStorage<Product[]>("products", []);
  const [meals, setMeals] = useLocalStorage<Meal[]>("meals", [
	{ name: "Pequeno-Almoço", plates: [] },
	{ name: "Almoço", plates: [] },
	{ name: "Lanche da Tarde", plates: [] },
	{ name: "Jantar", plates: [] },
  ]);
  const [plates, setPlates] = useLocalStorage<Plate[]>("plates", []);
  const [currentPlate, setCurrentPlate] = useLocalStorage<Plate>("currentPlate", {
	name: "",
	mealName: "Pequeno-Almoço",
	items: [],
  });

  const [metaDialogOpen, setMetaDialogOpen] = useLocalStorage<boolean>(
	"metaDialogOpen",
	false
  );
  const [productDialogOpen, setProductDialogOpen] = useLocalStorage<boolean>(
	"productDialogOpen",
	false
  );
  const [addProductDialogOpen, setAddProductDialogOpen] = useLocalStorage<
	boolean
  >("addProductDialogOpen", false);
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
  const [viewPlanDialogOpen, setViewPlanDialogOpen] =
	useLocalStorage<boolean>("viewPlanDialogOpen", false);

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

  const [editPlateItemIndex, setEditPlateItemIndex] = useLocalStorage<
	number | undefined
  >("editPlateItemIndex", undefined);
  const [plateItemGramsField, setPlateItemGramsField] = useLocalStorage<
	number
  >("plateItemGramsField", 100);

  const [addItemProductIndex, setAddItemProductIndex] = useLocalStorage<
	number | undefined
  >("addItemProductIndex", undefined);
  const [addItemGrams, setAddItemGrams] = useLocalStorage<number>(
	"addItemGrams",
	0
  );

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

  // Percentagens manuais
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
  	{ name: "Pequeno-Almoço", plates: [] },
  	{ name: "Almoço", plates: [] },
  	{ name: "Lanche da Tarde", plates: [] },
  	{ name: "Jantar", plates: [] },
	]);
  }

  function calculateDailyTargets() {
	const p = (protPercent / 100) * calTarget / 4;
	const f = (fatPercent / 100) * calTarget / 9;
	const c = (carbPercent / 100) * calTarget / 4;
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

  function ensurePlateFitsMeal(plate: Plate): boolean {
	const mt = calculateMealTargets(plate.mealName);
	const sp = sumPlate(plate);
	// Agora sem tolerância, só diz que passa se realmente exceder
	return (
  	sp.cal <= mt.cal && sp.p <= mt.p && sp.f <= mt.f && sp.c <= mt.c
	);
  }

  function ensureMealNoSurpass(mealIndex: number) {
	const meal = meals[mealIndex];
	const mt = calculateMealTargets(meal.name);
	const mealSum = meal.plates.reduce((acc, plate) => {
  	const plateSum = sumPlate(plate);
  	return {
    	p: acc.p + plateSum.p,
    	f: acc.f + plateSum.f,
    	c: acc.c + plateSum.c,
    	cal: acc.cal + plateSum.cal,
  	};
	}, { p: 0, f: 0, c: 0, cal: 0 });
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
  	Math.abs(sp.p - mt.p) < 0.5 &&
  	Math.abs(sp.f - mt.f) < 0.5 &&
  	Math.abs(sp.c - mt.c) < 1 &&
  	Math.abs(sp.cal - mt.cal) < 5
	);
  }

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
	if (!ensurePlateFitsMeal(cp)) {
  	toast(
    	"Não é possível adicionar este produto sem ultrapassar as metas da refeição."
  	);
  	return;
	}
	setCurrentPlate(cp);
	setAddPlateItemDialogOpen(false);
	setAddItemProductIndex(undefined);
	setAddItemGrams(0);
	toast("Produto adicionado ao prato!");
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
	const cp = { ...currentPlate };
	cp.items[editPlateItemIndex].grams = plateItemGramsField;
	if (!ensurePlateFitsMeal(cp)) {
  	toast("Não é possível ajustar essa quantidade sem ultrapassar as metas.");
  	return;
	}
	setCurrentPlate(cp);
	setEditPlateItemDialogOpen(false);
	toast("Quantidade atualizada!");
  }

  function handleRemovePlateItem(index: number) {
	const cp = { ...currentPlate };
	cp.items.splice(index, 1);
	setCurrentPlate(cp);
	toast("Produto removido do prato!");
  }

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
  	toast("Este prato não corresponde exatamente às metas da refeição. Ajuste os itens.");
  	return;
	}

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

	if (editingMealIndex !== undefined && editingPlateInMealIndex !== undefined) {
  	const newMeals = [...meals];
  	newMeals[editingMealIndex].plates[editingPlateInMealIndex] =
    	JSON.parse(JSON.stringify(currentPlate));
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

  function addPlateToMealFromUI() {
	if (addPlateMealIndex === undefined || addPlatePlateIndex === undefined) {
  	toast("Selecione a refeição e o prato.");
  	return;
	}
	const chosenPlate = JSON.parse(JSON.stringify(plates[addPlatePlateIndex])) as Plate;
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
	return { p: totalP, f: totalF, c: totalC, cal: totalCal };
  }

  function renderFullPlanDetail() {
	if (meals.length === 0) {
  	return <p>Nenhum plano criado ainda.</p>;
	}
	let anyPlate = false;

	const mealElements = meals.map((m, i) => {
  	let content;
  	if (m.plates.length === 0) {
    	content = <p className="text-sm text-gray-500">Nenhum prato nesta refeição.</p>;
  	} else {
    	const note = (
      	<p className="text-sm text-blue-600 mt-2">
        	Todos os pratos desta refeição fornecem exatamente as mesmas macros.
      	</p>
    	);
    	content = (
      	<>
        	{m.plates.map((pl, j) => {
          	anyPlate = true;
          	const sp = sumPlate(pl);
          	const productLines = pl.items.map((it, k) => {
            	const prod = products[it.productIndex];
            	const factor = it.grams / 100;
            	const pVal = prod.p * factor;
            	const fVal = prod.f * factor;
            	const cVal = prod.c * factor;
            	const calVal = prod.cal * factor;
            	return (
              	<li
                	key={k}
                	className="text-sm mb-1"
              	>
                	{prod.name} {it.grams.toFixed(1)}g (HC:{cVal.toFixed(1)}g | P:
                	{pVal.toFixed(1)}g | G:{fVal.toFixed(1)}g | Cal:{calVal.toFixed(1)}kcal)
              	</li>
            	);
          	});

          	return (
            	<div
              	className="border-b border-gray-300 py-2 mb-2"
              	key={j}
            	>
              	<h4 className="text-gray-700 font-semibold">{pl.name}</h4>
              	<ul className="mb-2 list-none p-0">{productLines}</ul>
              	<div className="macro-line">
                	<strong>Prato:</strong> {sp.cal.toFixed(1)}kcal | HC:
                	{sp.c.toFixed(1)}g | P:{sp.p.toFixed(1)}g | G:
                	{sp.f.toFixed(1)}g
              	</div>
            	</div>
          	);
        	})}
        	{note}
      	</>
    	);
  	}

  	return (
    	<div
      	className="bg-gray-50 border border-gray-300 rounded p-4 mb-4"
      	key={i}
    	>
      	<h3 className="text-lg font-semibold text-green-600 border-b border-gray-300 pb-2 mb-2">
        	{m.name}
      	</h3>
      	{content}
    	</div>
  	);
	});

	let totalLine = null;
	if (anyPlate) {
  	const totals = calculateTotals();
  	totalLine = (
    	<>
      	<h4 className="font-semibold mt-4">Total Diário Garantido</h4>
      	<p className="text-sm text-gray-600 mb-2">
        	Independentemente da escolha de pratos, o resultado final será sempre o mesmo.
      	</p>
      	<div className="macro-line">
        	{totals.cal.toFixed(1)} kcal | HC:{totals.c.toFixed(1)}g | P:
        	{totals.p.toFixed(1)}g | G:{totals.f.toFixed(1)}g
      	</div>
    	</>
  	);
	} else {
  	mealElements.push(
    	<p key="noplates" className="text-sm text-gray-500">
      	Nenhum prato em qualquer refeição.
    	</p>
  	);
	}

	return (
  	<>
    	{mealElements}
    	{totalLine}
  	</>
	);
  }

  const daily = calculateDailyTargets();
  const totals = calculateTotals();
  const totalPerc = paPerc + aPerc + lPerc + jPerc;

  return (
	<div>
  	{/* Resumo Diário */}
  	<Card className="p-4 space-y-4 shadow">
    	<h2 className="text-xl font-semibold mb-2">Resumo Diário</h2>
    	<div>
      	<p className="font-semibold mb-1">Objetivo Diário:</p>
      	<div className="flex flex-wrap gap-3">
        	<div className="bg-white rounded p-2 shadow">
          	<strong>Cal:</strong> {daily.cal.toFixed(1)} kcal
        	</div>
        	<div className="bg-white rounded p-2 shadow">
          	<strong>HC:</strong> {daily.c.toFixed(1)} g
        	</div>
        	<div className="bg-white rounded p-2 shadow">
          	<strong>P:</strong> {daily.p.toFixed(1)} g
        	</div>
        	<div className="bg-white rounded p-2 shadow">
          	<strong>G:</strong> {daily.f.toFixed(1)} g
        	</div>
      	</div>
    	</div>
    	<div>
      	<p className="font-semibold mt-4 mb-1">Atual:</p>
      	<div className="flex flex-wrap gap-3">
        	<div className="bg-white rounded p-2 shadow">
          	<strong>Cal:</strong> {totals.cal.toFixed(1)} kcal
        	</div>
        	<div className="bg-white rounded p-2 shadow">
          	<strong>HC:</strong> {totals.c.toFixed(1)} g
        	</div>
        	<div className="bg-white rounded p-2 shadow">
          	<strong>P:</strong> {totals.p.toFixed(1)} g
        	</div>
        	<div className="bg-white rounded p-2 shadow">
          	<strong>G:</strong> {totals.f.toFixed(1)} g
        	</div>
      	</div>
    	</div>
  	</Card>

  	{/* Limites por Refeição */}
  	<Card className="p-4 space-y-4 shadow">
    	<h2 className="text-xl font-semibold mb-2">Limites por Refeição</h2>
    	<p className="text-sm text-gray-600">
      	Cada refeição tem limites baseados nas percentagens definidas no final.
      	Ajuste as percentagens manualmente ao fim da página.
    	</p>
    	<div className="overflow-x-auto">
      	<table className="w-full text-sm mt-4">
        	<thead>
          	<tr className="border-b">
            	<th className="text-left p-2">Refeição</th>
            	<th className="text-left p-2">Cal (kcal)</th>
            	<th className="text-left p-2">HC (g)</th>
            	<th className="text-left p-2">P (g)</th>
            	<th className="text-left p-2">G (g)</th>
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

  	{/* Botões */}
  	<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    	<Button onClick={() => setMetaDialogOpen(true)} className="w-full">
      	Gerir Metas
    	</Button>
    	<Button onClick={() => setProductDialogOpen(true)} className="w-full">
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
      	className="w-full"
    	>
      	Criar Prato
    	</Button>
    	<Button onClick={() => setMealDialogOpen(true)} className="w-full">
      	Gerir Refeições
    	</Button>
    	<Button onClick={() => setViewPlanDialogOpen(true)} className="w-full">
      	Ver Plano Atual
    	</Button>
  	</div>

  	{/* Ajuste das Percentagens no final */}
  	<Card className="p-4 space-y-4 shadow">
    	<h2 className="text-xl font-semibold">Ajustar Percentagens Manualmente</h2>
    	<p className="text-sm text-gray-600">
      	Ajuste as percentagens de calorias para cada refeição manualmente. A soma
      	deve ser 100%. Você decide onde colocar as percentagens retiradas.
    	</p>

    	<div className="mt-4 space-y-4">
      	<div>
        	<Label>Pequeno-Almoço: {paPerc}%</Label>
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
        	<Label>Almoço: {aPerc}%</Label>
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
        	<Label>Lanche da Tarde: {lPerc}%</Label>
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
        	<Label>Jantar: {jPerc}%</Label>
        	<input
          	type="range"
          	min={0}
          	max={100}
          	value={jPerc}
          	onChange={(e) => setJPerc(Number(e.target.value))}
          	className="w-full"
        	/>
      	</div>
    	</div>

    	<p className="text-sm mt-2">Soma atual: {totalPerc}%</p>
    	{totalPerc !== 100 && (
      	<p className="text-sm text-red-600">
        	A soma não é 100%. Ajuste manualmente para totalizar 100%.
      	</p>
    	)}
  	</Card>

  	{/* Diálogos */}

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
          	<p>Nenhum produto.</p>
        	) : (
          	<ul className="space-y-2">
            	{products.map((p, i) => (
              	<li
                	key={i}
                	className="border p-2 rounded bg-white text-sm flex items-center justify-between"
              	>
                	<div>
                  	<strong>{p.name}</strong>
                  	<br />
                  	HC:{p.c}g | P:{p.p}g | G:{p.f}g | Cal:{p.cal}kcal
                	</div>
                	<div className="space-x-2">
                  	<Button
                    	variant="secondary"
                    	onClick={() => handleEditProductClick(i)}
                  	>
                    	Editar
                  	</Button>
                  	<Button
                    	variant="destructive"
                    	onClick={() => handleDeleteProduct(i)}
                  	>
                    	Apagar
                  	</Button>
                	</div>
              	</li>
            	))}
          	</ul>
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
        	<Label>Nome:</Label>
        	<Input
          	value={productNameField}
          	onChange={(e) => setProductNameField(e.target.value)}
        	/>
        	<Label>Proteína (P/100g):</Label>
        	<Input
          	type="number"
          	value={productPField}
          	onChange={(e) => setProductPField(Number(e.target.value))}
        	/>
        	<Label>Gordura (G/100g):</Label>
        	<Input
          	type="number"
          	value={productFField}
          	onChange={(e) => setProductFField(Number(e.target.value))}
        	/>
        	<Label>Carboidrato (HC/100g):</Label>
        	<Input
          	type="number"
          	value={productCField}
          	onChange={(e) => setProductCField(Number(e.target.value))}
        	/>
        	<Label>Calorias (Cal/100g):</Label>
        	<Input
          	type="number"
          	value={productCalField}
          	onChange={(e) => setProductCalField(Number(e.target.value))}
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
        	<Label>Nome:</Label>
        	<Input
          	value={productNameField}
          	onChange={(e) => setProductNameField(e.target.value)}
        	/>
        	<Label>Proteína (P/100g):</Label>
        	<Input
          	type="number"
          	value={productPField}
          	onChange={(e) => setProductPField(Number(e.target.value))}
        	/>
        	<Label>Gordura (G/100g):</Label>
        	<Input
          	type="number"
          	value={productFField}
          	onChange={(e) => setProductFField(Number(e.target.value))}
        	/>
        	<Label>Carboidrato (HC/100g):</Label>
        	<Input
          	type="number"
          	value={productCField}
          	onChange={(e) => setProductCField(Number(e.target.value))}
        	/>
        	<Label>Calorias (Cal/100g):</Label>
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

      	{/* Exibir metas da refeição escolhida ao criar/editar prato */}
      	{currentPlate.mealName && (() => {
        	const mt = calculateMealTargets(currentPlate.mealName);
        	return (
          	<p className="text-sm text-gray-600 mb-2">
            	Metas da Refeição ({currentPlate.mealName}):{" "}
            	{mt.cal.toFixed(1)}kcal | HC:{mt.c.toFixed(1)}g | P:
            	{mt.p.toFixed(1)}g | G:{mt.f.toFixed(1)}g
          	</p>
        	);
      	})()}

      	<Label>Nome do Prato:</Label>
      	<Input
        	type="text"
        	value={currentPlate.name}
        	onChange={(e) =>
          	setCurrentPlate({ ...currentPlate, name: e.target.value })
        	}
      	/>

      	<Label>Refeição Destino:</Label>
      	<Select
        	onValueChange={(val) => {
          	setCurrentPlate({ ...currentPlate, mealName: val as MealName });
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
          	<p>Nenhum produto no prato.</p>
        	) : (
          	(() => {
            	let { p, f, c, cal } = sumPlate(currentPlate);
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
                      	<li
                        	key={ii}
                        	className="border p-2 rounded bg-white text-sm flex items-center justify-between"
                      	>
                        	<div>
                          	<strong>{prod.name}</strong>: {it.grams.toFixed(1)}g
                          	<br />
                          	HC:{cVal.toFixed(1)}g | P:{pVal.toFixed(1)}g | G:
                          	{fVal.toFixed(1)}g | Cal:{calVal.toFixed(1)}kcal
                        	</div>
                        	<div className="space-x-2">
                          	<Button
                            	variant="secondary"
                            	onClick={() => handleEditPlateItemClick(ii)}
                          	>
                            	Editar
                          	</Button>
                          	<Button
                            	variant="destructive"
                            	onClick={() => handleRemovePlateItem(ii)}
                          	>
                            	Remover
                          	</Button>
                        	</div>
                      	</li>
                    	);
                  	})}
                	</ul>
                	<div className="macro-line mt-2">
                  	<strong>Total do Prato:</strong> {cal.toFixed(1)}kcal |
                  	HC:{c.toFixed(1)}g | P:{p.toFixed(1)}g | G:{f.toFixed(1)}g
                	</div>
              	</>
            	);
          	})()
        	)}
      	</div>

      	<p className="text-sm text-gray-600">
        	O prato deve corresponder às metas da refeição, assegurando a
        	isonomia nutricional.
      	</p>

      	<div className="mt-4 space-x-2">
        	<Button onClick={() => setAddPlateItemDialogOpen(true)}>
          	Adicionar Produto ao Prato
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
          	className="border rounded p-1 w-full"
          	onChange={(e) =>
            	setAddItemProductIndex(
              	e.target.value === ""
                	? undefined
                	: Number(e.target.value)
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
        	Cada refeição deve conter apenas pratos com macros idênticas. Assim,
        	qualquer prato escolhido fornece sempre as mesmas macros.
      	</p>
      	<div className="space-y-2 mt-2">
        	<Label>Refeição (para adicionar prato):</Label>
        	<select
          	className="border rounded p-1 w-full"
          	onChange={(e) =>
            	setAddPlateMealIndex(
              	e.target.value === ""
                	? undefined
                	: parseInt(e.target.value)
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

        	<Label>Prato (a adicionar à refeição):</Label>
        	<select
          	className="border rounded p-1 w-full"
          	onChange={(e) =>
            	setAddPlatePlateIndex(
              	e.target.value === ""
                	? undefined
                	: parseInt(e.target.value)
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

        	<Button onClick={addPlateToMealFromUI}>
          	Adicionar Prato à Refeição
        	</Button>
      	</div>

      	<hr className="my-4" />

      	<div className="space-y-4">
        	<h3 className="font-semibold text-lg">
          	Refeições e seus Pratos (Iso-nutri)
        	</h3>
        	{meals.map((m, mi) => {
          	const mealMacros = calculateMealTargets(m.name);
          	const mealInfo = (
            	<p className="text-sm text-gray-600 mb-2">
              	Metas da Refeição: {mealMacros.cal.toFixed(1)}kcal | HC:
              	{mealMacros.c.toFixed(1)}g | P:{mealMacros.p.toFixed(1)}g | G:
              	{mealMacros.f.toFixed(1)}g
            	</p>
          	);

          	const mealContent =
            	m.plates.length === 0 ? (
              	<p>Nenhum prato nesta refeição.</p>
            	) : (
              	<>
                	{mealInfo}
                	<ul className="space-y-2">
                  	{m.plates.map((pl, pi) => {
                    	const { p, f, c, cal } = sumPlate(pl);
                    	return (
                      	<li
                        	key={pi}
                        	className="border rounded p-2 bg-gray-50 flex items-center justify-between"
                      	>
                        	<div className="text-sm">
                          	<strong>{pl.name}</strong> ({pl.mealName})
                          	<br />
                          	HC:{c.toFixed(1)}g | P:{p.toFixed(1)}g | G:
                          	{f.toFixed(1)}g | Cal:{cal.toFixed(1)}kcal
                        	</div>
                        	<div className="space-x-2">
                          	<Button
                            	variant="secondary"
                            	onClick={() => {
                              	setEditingMealIndex(mi);
                              	setEditingPlateInMealIndex(pi);
                              	setCurrentPlate({ ...pl });
                              	setCreatePlateDialogOpen(true);
                            	}}
                          	>
                            	Editar
                          	</Button>
                          	<Button
                            	variant="destructive"
                            	onClick={() =>
                              	handleRemovePlateFromMeal(mi, pi)
                            	}
                          	>
                            	Apagar
                          	</Button>
                        	</div>
                      	</li>
                    	);
                  	})}
                	</ul>
                	<p className="text-sm text-blue-500 mt-2">
                  	Todos os pratos desta refeição são idênticos em macros,
                  	garantindo resultados previsíveis.
                	</p>
              	</>
            	);

          	return (
            	<div key={mi} className="border rounded p-2 bg-white">
              	<h4 className="font-semibold text-green-700 mb-2">
                	{m.name}
              	</h4>
              	{mealContent}
            	</div>
          	);
        	})}
      	</div>

      	<DialogFooter>
        	<Button variant="secondary" onClick={() => setMealDialogOpen(false)}>
          	Fechar
        	</Button>
      	</DialogFooter>
    	</DialogContent>
  	</Dialog>

  	{/* Dialog Ver Plano Atual */}
  	<Dialog
    	open={viewPlanDialogOpen}
    	onOpenChange={setViewPlanDialogOpen}
  	>
    	<DialogContent className="max-h-[90%] overflow-auto">
      	<DialogHeader>
        	<DialogTitle>Plano Atual</DialogTitle>
      	</DialogHeader>
      	<p className="text-sm text-gray-600 mb-2">
        	Este plano foi estruturado para que, em cada refeição, todos os
        	pratos disponíveis tenham o mesmo perfil nutricional. Assim, qualquer
        	combinação diária resultará nas mesmas macros e calorias.
      	</p>
      	{renderFullPlanDetail()}
      	<DialogFooter>
        	<Button onClick={() => setViewPlanDialogOpen(false)}>Fechar</Button>
      	</DialogFooter>
    	</DialogContent>
  	</Dialog>
	</div>
  );
}

// ------------------- Seção Treino -------------------

function Treino() {
  // Estados para Exercícios
  const [exercises, setExercises] = useLocalStorage<Exercise[]>(
	"exercises",
	[]
  );
  const [exerciseDialogOpen, setExerciseDialogOpen] = useLocalStorage<
	boolean
  >("exerciseDialogOpen", false);
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
  const [exerciseRepetitions, setExerciseRepetitions] = useLocalStorage<
	number
  >("exerciseRepetitions", 10);
  const [exercisePause, setExercisePause] = useLocalStorage<number>(
	"exercisePause",
	60
  );

  // Estados para Treinos
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>(
	"workouts",
	[]
  );
  const [workoutDialogOpen, setWorkoutDialogOpen] = useLocalStorage<
	boolean
  >("workoutDialogOpen", false);
  const [editWorkoutIndex, setEditWorkoutIndex] = useLocalStorage<
	number | undefined
  >("editWorkoutIndex", undefined);
  const [workoutName, setWorkoutName] = useLocalStorage<string>(
	"workoutName",
	""
  );
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);

  // Estados para Plano Semanal
  const [weeklyPlan, setWeeklyPlan] = useLocalStorage<WeeklyPlan>(
	"weeklyPlan",
	{
  	"Segunda-feira": "Descanso",
  	"Terça-feira": "Descanso",
  	"Quarta-feira": "Descanso",
  	"Quinta-feira": "Descanso",
  	"Sexta-feira": "Descanso",
  	"Sábado": "Descanso",
  	"Domingo": "Descanso",
	}
  );

  // Funções para Exercícios
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

  // Funções para Treinos
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

  // Funções para Plano Semanal
  function handleAssignWorkout(day: DayOfWeek, workoutName: string) {
	setWeeklyPlan({ ...weeklyPlan, [day]: workoutName });
	toast(`Treino "${workoutName}" atribuído a ${day}.`);
  }

  function handleResetDay(day: DayOfWeek) {
	setWeeklyPlan({ ...weeklyPlan, [day]: "Descanso" });
	toast(`${day} marcado como Descanso.`);
  }

  // Renderização do Plano Semanal
  function renderWeeklyPlan() {
	return (
  	<Card className="p-4 space-y-4 shadow">
    	<h2 className="text-xl font-semibold">Plano Semanal</h2>
    	<div className="space-y-2">
      	{Object.keys(weeklyPlan).map((day) => (
        	<div
          	key={day}
          	className="flex items-center justify-between p-2 bg-gray-100 rounded"
        	>
          	<span className="font-semibold">{day}:</span>
          	<span>
            	{weeklyPlan[day] !== "Descanso" ? (
              	weeklyPlan[day]
            	) : (
              	<span className="text-red-500">Descanso</span>
            	)}
          	</span>
          	<div className="space-x-2">
            	<Select
              	onValueChange={(val) => handleAssignWorkout(day as DayOfWeek, val)}
              	value={
                	weeklyPlan[day] !== "Descanso" ? weeklyPlan[day] : undefined
              	}
            	>
              	<SelectTrigger className="w-[200px]">
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
              	onClick={() => handleResetDay(day as DayOfWeek)}
            	>
              	Resetar
            	</Button>
          	</div>
        	</div>
      	))}
    	</div>
  	</Card>
	);
  }

  return (
	<div>
  	{/* Lista de Exercícios */}
  	<Card className="p-4 space-y-4 shadow">
    	<div className="flex justify-between items-center">
      	<h2 className="text-xl font-semibold">Exercícios</h2>
      	<Button onClick={() => setExerciseDialogOpen(true)}>Adicionar Exercício</Button>
    	</div>
    	{exercises.length === 0 ? (
      	<p>Nenhum exercício criado.</p>
    	) : (
      	<ul className="space-y-2">
        	{exercises.map((ex, i) => (
          	<li
            	key={i}
            	className="border p-2 rounded bg-white text-sm flex items-center justify-between"
          	>
            	<div>
              	<strong>{ex.name}</strong>
              	<br />
              	Séries: {ex.series} | Repetições: {ex.repetitions} | Pausa:{" "}
              	{ex.pause}s
            	</div>
            	<div className="space-x-2">
              	<Button
                	variant="secondary"
                	onClick={() => handleEditExerciseClick(i)}
              	>
                	Editar
              	</Button>
              	<Button
                	variant="destructive"
                	onClick={() => handleDeleteExercise(i)}
              	>
                	Apagar
              	</Button>
            	</div>
          	</li>
        	))}
      	</ul>
    	)}
  	</Card>

  	{/* Lista de Treinos */}
  	<Card className="p-4 space-y-4 shadow">
    	<div className="flex justify-between items-center">
      	<h2 className="text-xl font-semibold">Treinos</h2>
      	<Button onClick={() => setWorkoutDialogOpen(true)}>Adicionar Treino</Button>
    	</div>
    	{workouts.length === 0 ? (
      	<p>Nenhum treino criado.</p>
    	) : (
      	<ul className="space-y-2">
        	{workouts.map((wt, i) => (
          	<li
            	key={i}
            	className="border p-2 rounded bg-white text-sm"
          	>
            	<div className="flex justify-between items-center">
              	<strong>{wt.name}</strong>
              	<div className="space-x-2">
                	<Button
                  	variant="secondary"
                  	onClick={() => handleEditWorkoutClick(i)}
                	>
                  	Editar
                	</Button>
                	<Button
                  	variant="destructive"
                  	onClick={() => handleDeleteWorkout(i)}
                	>
                  	Apagar
                	</Button>
              	</div>
            	</div>
            	<ul className="ml-4 mt-2 list-disc">
              	{wt.exercises.map((ex, j) => (
                	<li key={j}>
                  	{ex.name} - {ex.series} séries de {ex.repetitions} repetições
                  	com {ex.pause}s de pausa
                	</li>
              	))}
            	</ul>
          	</li>
        	))}
      	</ul>
    	)}
  	</Card>

  	{/* Plano Semanal */}
  	{renderWeeklyPlan()}

  	{/* Dialog Exercício */}
  	<Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
    	<DialogContent className="max-w-md">
      	<DialogHeader>
        	<DialogTitle>
          	{editExerciseIndex !== undefined ? "Editar Exercício" : "Adicionar Exercício"}
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
          	{editWorkoutIndex !== undefined ? "Editar Treino" : "Adicionar Treino"}
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
            	<p className="text-sm text-gray-500">Nenhum exercício disponível.</p>
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
	</div>
  );
}

// ------------------- Seção Pesagens -------------------

function Pesagens() {
  const [measurements, setMeasurements] = useLocalStorage<Measurement[]>(
	"measurements",
	[]
  );
  const [measurementDialogOpen, setMeasurementDialogOpen] = useLocalStorage<
	boolean
  >("measurementDialogOpen", false);
  const [editMeasurementIndex, setEditMeasurementIndex] = useLocalStorage<
	number | undefined
  >("editMeasurementIndex", undefined);

  const [date, setDate] = useLocalStorage<string>("date", "");
  const [time, setTime] = useLocalStorage<string>("time", "");
  const [weight, setWeight] = useLocalStorage<number>("weight", 0);
  const [muscleMassPercent, setMuscleMassPercent] = useLocalStorage<
	number
  >("muscleMassPercent", 0);
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

  return (
	<div>
  	{/* Lista de Pesagens */}
  	<Card className="p-4 space-y-4 shadow">
    	<div className="flex justify-between items-center">
      	<h2 className="text-xl font-semibold">Pesagens</h2>
      	<Button onClick={() => setMeasurementDialogOpen(true)}>
        	Adicionar Pesagem
      	</Button>
    	</div>
    	{measurements.length === 0 ? (
      	<p>Nenhuma pesagem registrada.</p>
    	) : (
      	<table className="min-w-full bg-white">
        	<thead>
          	<tr>
            	<th className="py-2">Data</th>
            	<th className="py-2">Hora</th>
            	<th className="py-2">Peso (kg)</th>
            	<th className="py-2">Massa Muscular (%)</th>
            	<th className="py-2">Massa Muscular (kg)</th>
            	<th className="py-2">Massa Gorda (%)</th>
            	<th className="py-2">Água (%)</th>
            	<th className="py-2">Altura (cm)</th>
            	<th className="py-2">Gordura Visceral</th>
            	<th className="py-2">Idade Metabólica</th>
            	<th className="py-2">Ações</th>
          	</tr>
        	</thead>
        	<tbody>
          	{measurements.map((m, i) => (
            	<tr key={i} className="text-center border-t">
              	<td className="py-2">{m.date}</td>
              	<td className="py-2">{m.time}</td>
              	<td className="py-2">{m.weight}</td>
              	<td className="py-2">{m.muscleMassPercent}</td>
              	<td className="py-2">{m.muscleMassKg}</td>
              	<td className="py-2">{m.fatMassPercent}</td>
              	<td className="py-2">{m.waterPercent}</td>
              	<td className="py-2">{m.height}</td>
              	<td className="py-2">{m.visceralFat}</td>
              	<td className="py-2">{m.metabolicAge}</td>
              	<td className="py-2 space-x-2">
                	<Button
                  	variant="secondary"
                  	size="sm"
                  	onClick={() => handleEditMeasurementClick(i)}
                	>
                  	Editar
                	</Button>
                	<Button
                  	variant="destructive"
                  	size="sm"
                  	onClick={() => handleDeleteMeasurement(i)}
                	>
                  	Apagar
                	</Button>
              	</td>
            	</tr>
          	))}
        	</tbody>
      	</table>
    	)}
  	</Card>

  	{/* Dialog Pesagem */}
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
        	/>
        	<Label>Massa Muscular (%):</Label>
        	<Input
          	type="number"
          	value={muscleMassPercent}
          	onChange={(e) =>
            	setMuscleMassPercent(Number(e.target.value))
          	}
        	/>
        	<Label>Massa Muscular (kg):</Label>
        	<Input
          	type="number"
          	value={muscleMassKg}
          	onChange={(e) => setMuscleMassKg(Number(e.target.value))}
        	/>
        	<Label>Massa Gorda (%):</Label>
        	<Input
          	type="number"
          	value={fatMassPercent}
          	onChange={(e) => setFatMassPercent(Number(e.target.value))}
        	/>
        	<Label>Água (%):</Label>
        	<Input
          	type="number"
          	value={waterPercent}
          	onChange={(e) => setWaterPercent(Number(e.target.value))}
        	/>
        	<Label>Altura (cm):</Label>
        	<Input
          	type="number"
          	value={height}
          	onChange={(e) => setHeight(Number(e.target.value))}
        	/>
        	<Label>Gordura Visceral:</Label>
        	<Input
          	type="number"
          	value={visceralFat}
          	onChange={(e) => setVisceralFat(Number(e.target.value))}
        	/>
        	<Label>Idade Metabólica:</Label>
        	<Input
          	type="number"
          	value={metabolicAge}
          	onChange={(e) => setMetabolicAge(Number(e.target.value))}
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
	</div>
  );
}


