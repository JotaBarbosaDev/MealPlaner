import React, { useState } from 'react';
import { PlusCircle, Check, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Meal, MealName, Plate, Product } from "@/types/dieta";

type NutritionalValues = {
  p: number;
  f: number;
  c: number;
  cal: number;
};

type Props = {
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  plates: Plate[];
  products: Product[];
  sumPlate: (plate: Plate) => NutritionalValues;
  calculateMealTargets: (mealName: MealName) => NutritionalValues;
  ensureMealNoSurpass: (mealIndex: number) => boolean;
  calculateTotals: () => NutritionalValues;
  setCurrentPlate: React.Dispatch<React.SetStateAction<Plate>>;
  onChangeTab: (tab: string) => void;
};

export default function DietaPlano({
  meals,
  setMeals,
  plates,
  products,
  sumPlate,
  calculateMealTargets,
  ensureMealNoSurpass,
  calculateTotals,
  setCurrentPlate,
  onChangeTab
}: Props) {
  // Estados
  const [selectedMealIndex, setSelectedMealIndex] = useState<number | null>(null);
  const [expandedMealIndex, setExpandedMealIndex] = useState<number | null>(0); // Começa com o primeiro expandido
  const [showAddPlateModal, setShowAddPlateModal] = useState(false);
  const [selectedPlateToView, setSelectedPlateToView] = useState<Plate | null>(null);
  const { toast } = useToast();
  
  // Filtrar pratos para a refeição selecionada
  const filterPlatesForMeal = (mealName: MealName) => {
    return plates.filter(p => 
      p.mealType === mealName
    );
  };

  // Adicionar prato à refeição
  const handleAddPlateToMeal = (plateId: string, mealIndex: number) => {
    const plate = plates.find(p => p.id === plateId);
    if (!plate) return;
    
    const newMeals = [...meals];
    const mealPlates = [...newMeals[mealIndex].plates];
    
    // Adiciona o prato à refeição
    mealPlates.push(plate);
    newMeals[mealIndex].plates = mealPlates;
    
    setMeals(newMeals);
    setShowAddPlateModal(false);
    toast({
      title: "Sucesso",
      description: `Prato adicionado ao ${meals[mealIndex].name}`,
    });
  };

  // Remover prato da refeição
  const handleRemovePlateFromMeal = (plateIndex: number, mealIndex: number) => {
    const newMeals = [...meals];
    const mealPlates = [...newMeals[mealIndex].plates];
    
    mealPlates.splice(plateIndex, 1);
    newMeals[mealIndex].plates = mealPlates;
    
    setMeals(newMeals);
    toast({
      title: "Informação",
      description: "Prato removido da refeição",
    });
  };

  // Botão para editar prato
  const handleEditPlate = (plate: Plate) => {
    setCurrentPlate({...plate});
    onChangeTab('pratos');
  };

  // Totais diários
  const dailyTotals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Sumário diário */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Resumo Diário</CardTitle>
          <div className="grid grid-cols-4 gap-2 mt-2">
            <div className="text-center">
              <div className="text-xs text-gray-500">Calorias</div>
              <div className="font-semibold">{Math.round(dailyTotals.cal)} kcal</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 text-blue-600">Proteínas</div>
              <div className="font-semibold">{Math.round(dailyTotals.p)} g</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 text-green-600">Carboidratos</div>
              <div className="font-semibold">{Math.round(dailyTotals.c)} g</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 text-yellow-600">Gorduras</div>
              <div className="font-semibold">{Math.round(dailyTotals.f)} g</div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Refeições */}
      <div className="space-y-3">
        <h3 className="font-medium">Plano Alimentar</h3>
        
        {meals.map((meal, mealIndex) => {
          const mealName = meal.name as MealName;
          const mealTarget = calculateMealTargets(mealName);
          const isExpanded = expandedMealIndex === mealIndex;
          
          // Sumário dos valores nutricionais da refeição
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
            { p: 0, f: 0, c: 0, cal: 0 }
          );
          
          // Calcula a porcentagem da meta
          const calPerc = Math.round((mealSum.cal / mealTarget.cal) * 100) || 0;
          const pPerc = Math.round((mealSum.p / mealTarget.p) * 100) || 0;
          const cPerc = Math.round((mealSum.c / mealTarget.c) * 100) || 0;
          const fPerc = Math.round((mealSum.f / mealTarget.f) * 100) || 0;
          
          return (
            <Card key={meal.id || mealIndex} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Cabeçalho da refeição */}
                <div 
                  className="flex justify-between items-center p-3 cursor-pointer"
                  onClick={() => setExpandedMealIndex(isExpanded ? null : mealIndex)}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{meal.name}</h3>
                    <Badge variant="outline">
                      {meal.plates.length} {meal.plates.length === 1 ? 'prato' : 'pratos'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {Math.round(mealSum.cal)} / {Math.round(mealTarget.cal)} kcal
                    </span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
                
                {/* Detalhes da refeição (visíveis quando expandido) */}
                {isExpanded && (
                  <>
                    <Separator />
                    
                    {/* Progresso das metas */}
                    <div className="p-3 space-y-3 pb-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Calorias</span>
                          <span>{calPerc}%</span>
                        </div>
                        <Progress 
                          value={calPerc} 
                          indicatorClassName={calPerc > 100 ? 'bg-red-500' : ''}
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-blue-600">Proteínas</span>
                            <span>{pPerc}%</span>
                          </div>
                          <Progress 
                            value={pPerc} 
                            className="bg-blue-100" 
                            indicatorClassName={`bg-blue-500 ${pPerc > 100 ? '!bg-red-500' : ''}`} 
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600">Carbos</span>
                            <span>{cPerc}%</span>
                          </div>
                          <Progress 
                            value={cPerc} 
                            className="bg-green-100" 
                            indicatorClassName={`bg-green-500 ${cPerc > 100 ? '!bg-red-500' : ''}`} 
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-yellow-600">Gorduras</span>
                            <span>{fPerc}%</span>
                          </div>
                          <Progress 
                            value={fPerc}
                            className="bg-yellow-100" 
                            indicatorClassName={`bg-yellow-500 ${fPerc > 100 ? '!bg-red-500' : ''}`} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Lista de pratos */}
                    <div className="p-3">
                      {meal.plates.length === 0 ? (
                        <div className="text-gray-500 text-center py-3">
                          Nenhum prato adicionado
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {meal.plates.map((plate, plateIndex) => {
                            const plateSum = sumPlate(plate);
                            
                            return (
                              <div 
                                key={plateIndex} 
                                className="border rounded-md p-2 flex justify-between items-center"
                              >
                                <div>
                                  <div className="font-medium text-sm">{plate.name}</div>
                                  <div className="text-xs text-gray-500">
                                    P: {Math.round(plateSum.p)}g • 
                                    C: {Math.round(plateSum.c)}g • 
                                    G: {Math.round(plateSum.f)}g • 
                                    {Math.round(plateSum.cal)} kcal
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setSelectedPlateToView(plate);
                                    }}
                                  >
                                    <AlertCircle size={16} />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-red-500 h-8 w-8"
                                    onClick={() => handleRemovePlateFromMeal(plateIndex, mealIndex)}
                                  >
                                    <X size={16} />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Adicionar Prato botão */}
                      <Dialog 
                        open={showAddPlateModal && selectedMealIndex === mealIndex} 
                        onOpenChange={(open) => {
                          if (!open) setShowAddPlateModal(false);
                          if (!open) setSelectedMealIndex(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="mt-3 w-full"
                            onClick={() => {
                              setSelectedMealIndex(mealIndex);
                              setShowAddPlateModal(true);
                            }}
                          >
                            <PlusCircle size={16} className="mr-2" />
                            Adicionar Prato
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adicionar Prato ao {meal.name}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="py-4 space-y-4">
                            <div className="text-sm text-gray-500">
                              Selecione um prato para adicionar à refeição:
                            </div>
                            
                            {filterPlatesForMeal(mealName as MealName).length === 0 ? (
                              <div className="text-center text-gray-500 py-2">
                                <p>Nenhum prato disponível para {meal.name}.</p>
                                <Button 
                                  variant="link" 
                                  className="mt-1"
                                  onClick={() => {
                                    setCurrentPlate({
                                      id: '',
                                      name: '',
                                      items: [],
                                      mealType: mealName as MealName
                                    });
                                    onChangeTab('pratos');
                                  }}
                                >
                                  Criar um prato para esta refeição?
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {filterPlatesForMeal(mealName as MealName).map((plate) => {
                                  const plateSum = sumPlate(plate);
                                  
                                  return (
                                    <div 
                                      key={plate.id} 
                                      className="border rounded-md p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                                      onClick={() => handleAddPlateToMeal(plate.id, mealIndex)}
                                    >
                                      <div>
                                        <div className="font-medium">{plate.name}</div>
                                        <div className="text-xs text-gray-500">
                                          {Math.round(plateSum.cal)} kcal • P: {Math.round(plateSum.p)}g • 
                                          C: {Math.round(plateSum.c)}g • G: {Math.round(plateSum.f)}g
                                        </div>
                                      </div>
                                      <Check size={16} className="text-green-500" />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setShowAddPlateModal(false);
                                setSelectedMealIndex(null);
                              }}
                            >
                              Cancelar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Diálogo de detalhes do prato */}
      <Dialog 
        open={!!selectedPlateToView} 
        onOpenChange={(open) => {
          if (!open) setSelectedPlateToView(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Prato</DialogTitle>
          </DialogHeader>
          
          {selectedPlateToView && (
            <div className="py-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{selectedPlateToView.name}</h2>
                <Badge variant="outline">{selectedPlateToView.mealType}</Badge>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-3">Itens do prato:</h3>
                
                {selectedPlateToView.items.length === 0 ? (
                  <div className="text-gray-500">Nenhum item</div>
                ) : (
                  <div className="space-y-2">
                    {selectedPlateToView.items.map((item, idx) => {
                      const product = products.find(p => p.id === item.productId);
                      
                      if (!product) {
                        return (
                          <div key={idx} className="text-red-500">
                            Produto não encontrado
                          </div>
                        );
                      }
                      
                      return (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div>{product.name}</div>
                          <div className="flex items-center gap-2">
                            <span>{item.amount}g</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={() => {
                    if (selectedPlateToView) {
                      handleEditPlate(selectedPlateToView);
                      setSelectedPlateToView(null);
                    }
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  Editar Prato
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}