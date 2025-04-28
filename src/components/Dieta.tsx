"use client";

import React from "react";
import { useLocalStorage } from "react-use";
import { 
  LayoutDashboard, 
  Apple, 
  UtensilsCrossed, 
  Calendar, 
  Settings
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

import DietaDashboard from "@/components/dieta/Dashboard";
import DietaProdutos from "@/components/dieta/Produtos";
import DietaPratos from "@/components/dieta/Pratos";
import DietaPlano from "@/components/dieta/Plano";
import DietaConfiguracoes from "@/components/dieta/Configuracoes";

import { Product, Plate, Meal, MealName } from "@/types/dieta";

export default function Dieta() {
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
    {name: "Pequeno-Almoço", plates: [], id: uuidv4()},
    {name: "Almoço", plates: [], id: uuidv4()},
    {name: "Lanche da Tarde", plates: [], id: uuidv4()},
    {name: "Jantar", plates: [], id: uuidv4()},
  ]);
  const [plates, setPlates] = useLocalStorage<Plate[]>("plates", []);
  const [currentPlate, setCurrentPlate] = useLocalStorage<Plate>(
    "currentPlate",
    {
      id: uuidv4(),
      name: "",
      mealType: "Pequeno-Almoço",
      items: [],
    }
  );

  // Recria refeições se estiver vazio
  if (!meals || meals.length === 0) {
    setMeals([
      {name: "Pequeno-Almoço", plates: [], id: uuidv4()},
      {name: "Almoço", plates: [], id: uuidv4()},
      {name: "Lanche da Tarde", plates: [], id: uuidv4()},
      {name: "Jantar", plates: [], id: uuidv4()},
    ]);
  }

  const [currentTab, setCurrentTab] = useLocalStorage<string>(
    "dietaCurrentTab",
    "dashboard"
  );

  function calculateDailyTargets() {
    const p = (((protPercent ?? 30) / 100) * (calTarget ?? 1975)) / 4;
    const f = (((fatPercent ?? 20) / 100) * (calTarget ?? 1975)) / 9;
    const c = (((carbPercent ?? 50) / 100) * (calTarget ?? 1975)) / 4;
    return {p, f, c, cal: calTarget ?? 1975};
  }

  const [paPerc, setPaPerc] = useLocalStorage<number>("paPerc", 20);
  const [aPerc, setAPerc] = useLocalStorage<number>("aPerc", 30);
  const [lPerc, setLPerc] = useLocalStorage<number>("lPerc", 20);
  const [jPerc, setJPerc] = useLocalStorage<number>("jPerc", 30);

  function calculateMealTargets(mealName: MealName) {
    const daily = calculateDailyTargets();
    const dist = (() => {
      switch (mealName) {
        case "Pequeno-Almoço":
          return (paPerc ?? 20) / 100;
        case "Almoço":
          return (aPerc ?? 30) / 100;
        case "Lanche da Tarde":
          return (lPerc ?? 20) / 100;
        case "Jantar":
          return (jPerc ?? 30) / 100;
        default:
          return 0.25;
      }
    })();

    return {
      p: daily.p * dist,
      f: daily.f * dist,
      c: daily.c * dist,
      cal: daily.cal * dist,
    };
  }

  function sumPlate(plate: Plate) {
    return (plate.items || []).reduce(
      (acc, item) => {
        const prod = (products || []).find(p => p.id === item.productId);
        if (!prod) return acc;
        
        const factor = item.amount / prod.baseAmount;
        return {
          p: acc.p + prod.nutritionalInfo.protein * factor,
          f: acc.f + prod.nutritionalInfo.fat * factor,
          c: acc.c + prod.nutritionalInfo.carbs * factor,
          cal: acc.cal + prod.nutritionalInfo.calories * factor,
        };
      },
      {p: 0, f: 0, c: 0, cal: 0}
    );
  }

  function calculateTotals() {
    let totalP = 0,
      totalF = 0,
      totalC = 0,
      totalCal = 0;
    (meals || []).forEach((meal) => {
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

  function ensureMealNoSurpass(mealIndex: number) {
    const mealsArray = meals || [];
    if (mealIndex >= mealsArray.length) return false;
    
    const meal = mealsArray[mealIndex];
    const mt = calculateMealTargets(meal.name as MealName);
    const mealSum = meal.plates.reduce(
      (acc, plate) => {
        const ps = sumPlate(plate);
        return {
          p: acc.p + ps.p,
          f: acc.f + ps.f,
          c: acc.c + ps.c,
          cal: acc.cal + ps.cal,
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
    const mt = calculateMealTargets(plate.mealType as MealName);
    const sp = sumPlate(plate);
    return (
      Math.abs(sp.p - mt.p) < 0.0001 &&
      Math.abs(sp.f - mt.f) < 0.0001 &&
      Math.abs(sp.c - mt.c) < 0.0001 &&
      Math.abs(sp.cal - mt.cal) < 0.0001
    );
  }

  return (
    <div className="pb-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Plano Nutricional
        </h1>
      </div>
      
      <Tabs 
        value={currentTab} 
        onValueChange={(value) => setCurrentTab(value)}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-5 mb-4">
          <TabsTrigger value="dashboard" className="flex flex-col items-center py-2 px-1">
            <LayoutDashboard size={18} />
            <span className="text-xs mt-1">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="produtos" className="flex flex-col items-center py-2 px-1">
            <Apple size={18} />
            <span className="text-xs mt-1">Produtos</span>
          </TabsTrigger>
          <TabsTrigger value="pratos" className="flex flex-col items-center py-2 px-1">
            <UtensilsCrossed size={18} />
            <span className="text-xs mt-1">Pratos</span>
          </TabsTrigger>
          <TabsTrigger value="plano" className="flex flex-col items-center py-2 px-1">
            <Calendar size={18} />
            <span className="text-xs mt-1">Plano</span>
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="flex flex-col items-center py-2 px-1">
            <Settings size={18} />
            <span className="text-xs mt-1">Metas</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <DietaDashboard 
            dailyTargets={calculateDailyTargets()}
            currentTotals={calculateTotals()}
            mealTargets={{
              "Pequeno-Almoço": calculateMealTargets("Pequeno-Almoço"),
              "Almoço": calculateMealTargets("Almoço"),
              "Lanche da Tarde": calculateMealTargets("Lanche da Tarde"),
              "Jantar": calculateMealTargets("Jantar")
            }}
            meals={meals || []}
            sumPlate={sumPlate}
            onChangeTab={(tab) => setCurrentTab(tab)}
          />
        </TabsContent>
        
        <TabsContent value="produtos">
          <DietaProdutos 
            products={products || []}
            setProducts={newProducts => setProducts(newProducts as Product[])} 
          />
        </TabsContent>
        
        <TabsContent value="pratos">
          <DietaPratos 
            products={products || []}
            plates={plates || []}
            setPlates={newPlates => setPlates(newPlates as Plate[])}
            currentPlate={currentPlate || {
              id: uuidv4(),
              name: "",
              mealType: "Pequeno-Almoço",
              items: [],
            }}
            setCurrentPlate={newPlate => setCurrentPlate(newPlate as Plate)}
            meals={meals || []}
            calculateMealTargets={calculateMealTargets}
            sumPlate={sumPlate}
            plateMatchesMealTarget={plateMatchesMealTarget}
          />
        </TabsContent>
        
        <TabsContent value="plano">
          <DietaPlano 
            meals={meals || []}
            setMeals={newMeals => setMeals(newMeals as Meal[])}
            plates={plates || []}
            products={products || []}
            sumPlate={sumPlate}
            calculateMealTargets={calculateMealTargets}
            ensureMealNoSurpass={ensureMealNoSurpass}
            calculateTotals={calculateTotals}
            setCurrentPlate={newPlate => setCurrentPlate(newPlate as Plate)}
            onChangeTab={(tab) => setCurrentTab(tab)}
          />
        </TabsContent>
        
        <TabsContent value="configuracoes">
          <DietaConfiguracoes 
            calTarget={calTarget ?? 1975}
            setCalTarget={setCalTarget}
            protPercent={protPercent ?? 30}
            setProtPercent={setProtPercent}
            fatPercent={fatPercent ?? 20}
            setFatPercent={setFatPercent}
            carbPercent={carbPercent ?? 50}
            setCarbPercent={setCarbPercent}
            paPerc={paPerc ?? 20}
            setPaPerc={setPaPerc}
            aPerc={aPerc ?? 30}
            setAPerc={setAPerc}
            lPerc={lPerc ?? 20}
            setLPerc={setLPerc}
            jPerc={jPerc ?? 30}
            setJPerc={setJPerc}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
