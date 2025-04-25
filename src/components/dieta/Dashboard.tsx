import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Meal, Plate, MealName, NutritionalInfo } from "@/types/dieta";

type NutritionalValues = {
  p: number;
  f: number;
  c: number;
  cal: number;
};

type Props = {
  dailyTargets: NutritionalValues;
  currentTotals: NutritionalValues;
  mealTargets: Record<MealName, NutritionalValues>;
  meals: Meal[];
  sumPlate: (plate: Plate) => NutritionalValues;
  onChangeTab: (tab: string) => void;
};

export default function DietaDashboard({
  dailyTargets,
  currentTotals,
  mealTargets,
  meals,
  sumPlate,
  onChangeTab
}: Props) {
  
  function calculatePercentage(current: number, target: number): number {
    return Math.min(Math.round((current / target) * 100), 100);
  }

  function getMealTotal(mealName: MealName): NutritionalValues {
    const meal = meals.find(m => m.name === mealName);
    if (!meal) return { p: 0, f: 0, c: 0, cal: 0 };
    
    return meal.plates.reduce(
      (acc, plate) => {
        const ps = sumPlate(plate);
        return {
          p: acc.p + ps.p,
          f: acc.f + ps.f,
          c: acc.c + ps.c,
          cal: acc.cal + ps.cal,
        };
      },
      { p: 0, f: 0, c: 0, cal: 0 }
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Resumo diário */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Resumo Diário</CardTitle>
          <CardDescription>Progresso das suas metas nutricionais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calorias */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Calorias</span>
              <span className="text-sm font-medium">{Math.round(currentTotals.cal)} / {dailyTargets.cal} kcal</span>
            </div>
            <Progress value={calculatePercentage(currentTotals.cal, dailyTargets.cal)} className="h-2" />
          </div>
          
          {/* Macronutrientes */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs">Proteínas</span>
                <span className="text-xs">{Math.round(currentTotals.p)}g</span>
              </div>
              <Progress value={calculatePercentage(currentTotals.p, dailyTargets.p)} className="h-1.5 bg-blue-100" indicatorClassName="bg-blue-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs">Gorduras</span>
                <span className="text-xs">{Math.round(currentTotals.f)}g</span>
              </div>
              <Progress value={calculatePercentage(currentTotals.f, dailyTargets.f)} className="h-1.5 bg-yellow-100" indicatorClassName="bg-yellow-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs">Carbos</span>
                <span className="text-xs">{Math.round(currentTotals.c)}g</span>
              </div>
              <Progress value={calculatePercentage(currentTotals.c, dailyTargets.c)} className="h-1.5 bg-green-100" indicatorClassName="bg-green-500" />
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-2 justify-between"
            onClick={() => onChangeTab('configuracoes')}
          >
            <span>Editar metas</span>
            <ChevronRight size={16} />
          </Button>
        </CardContent>
      </Card>
      
      {/* Refeições */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Refeições</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7 px-2"
            onClick={() => onChangeTab('plano')}
          >
            Ver todas
            <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
        
        {meals.map((meal) => {
          const mealTotal = getMealTotal(meal.name as MealName);
          const target = mealTargets[meal.name as MealName];
          const hasPlates = meal.plates.length > 0;
          
          return (
            <Card key={meal.id} className={`overflow-hidden ${!hasPlates ? 'opacity-70' : ''}`}>
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm">{meal.name}</h4>
                  <Badge variant={hasPlates ? "default" : "outline"}>
                    {Math.round(mealTotal.cal)} / {Math.round(target.cal)} kcal
                  </Badge>
                </div>
                
                {hasPlates ? (
                  <div className="space-y-2">
                    {meal.plates.slice(0, 2).map((plate, idx) => {
                      const plateValues = sumPlate(plate);
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="truncate flex-1">{plate.name}</span>
                          <span className="text-muted-foreground">{Math.round(plateValues.cal)} kcal</span>
                        </div>
                      );
                    })}
                    {meal.plates.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        + {meal.plates.length - 2} mais
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Nenhum prato adicionado
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        <Button 
          variant="outline" 
          className="w-full mt-2 justify-between"
          onClick={() => onChangeTab('plano')}
        >
          <span>Gerenciar plano alimentar</span>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}