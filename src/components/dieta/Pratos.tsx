import React, { useState } from 'react';
import { Plus, Save, Trash2, Edit, ArrowLeft, Salad, Scale, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { Product, Plate, PlateItem, MealName, Meal } from "@/types/dieta";
import { v4 as uuidv4 } from 'uuid';

type NutritionalValues = {
  p: number;
  f: number;
  c: number;
  cal: number;
};

// Custom Progress component para não depender do @radix-ui/react-progress
const Progress = ({ 
  value, 
  className = "", 
  indicatorClassName = ""
}: { 
  value: number, 
  className?: string, 
  indicatorClassName?: string 
}) => (
  <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
    <div 
      className={`h-full bg-primary transition-all ${indicatorClassName}`} 
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

type Props = {
  products: Product[];
  plates: Plate[];
  setPlates: React.Dispatch<React.SetStateAction<Plate[]>>;
  currentPlate: Plate;
  setCurrentPlate: React.Dispatch<React.SetStateAction<Plate>>;
  meals: Meal[];
  calculateMealTargets: (mealName: MealName) => NutritionalValues;
  sumPlate: (plate: Plate) => NutritionalValues;
  plateMatchesMealTarget: (plate: Plate) => boolean;
};

export default function DietaPratos({
  products,
  plates,
  setPlates,
  currentPlate,
  setCurrentPlate,
  meals,
  calculateMealTargets,
  sumPlate,
  plateMatchesMealTarget
}: Props) {
  // Estados
  const [isEditing, setIsEditing] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemAmount, setItemAmount] = useState<number>(100);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Determina o tipo de refeição atual
  const mealType = currentPlate.mealType || "Pequeno-Almoço" as MealName;

  // Valores nutricionais do prato atual
  const plateValues = sumPlate(currentPlate);
  const mealTarget = calculateMealTargets(mealType);
  
  // Filtragem de produtos para adicionar
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Funções de manipulação de itens do prato
  function handleAddItem() {
    if (selectedProductId === null) return;
    
    const newItems = [...currentPlate.items];
    
    // Verifica se o produto já está no prato
    const existingItemIndex = newItems.findIndex(
      item => item.productId === selectedProductId
    );
    
    if (existingItemIndex !== -1) {
      // Atualiza a quantidade se já existir
      newItems[existingItemIndex].amount += itemAmount;
    } else {
      // Adiciona novo item
      newItems.push({
        productId: selectedProductId,
        amount: itemAmount
      });
    }
    
    setCurrentPlate({
      ...currentPlate,
      items: newItems
    });
    
    setShowAddItemModal(false);
    setSelectedProductId(null);
    setItemAmount(100);
  }

  function handleRemoveItem(index: number) {
    const newItems = [...currentPlate.items];
    newItems.splice(index, 1);
    setCurrentPlate({
      ...currentPlate,
      items: newItems
    });
  }

  function handleQuantityChange(index: number, amount: number) {
    const newItems = [...currentPlate.items];
    newItems[index].amount = amount;
    setCurrentPlate({
      ...currentPlate,
      items: newItems
    });
  }

  // Funções de gerenciamento de pratos
  function startNewPlate() {
    setCurrentPlate({
      id: uuidv4(),
      name: "",
      items: [],
      mealType: "Pequeno-Almoço"
    });
    setIsEditing(false);
  }

  function savePlate() {
    if (!currentPlate.name.trim()) {
      toast.error("O prato precisa ter um nome!");
      return;
    }

    if (currentPlate.items.length === 0) {
      toast.error("Adicione pelo menos um item ao prato!");
      return;
    }

    // Garante que o prato tenha um ID
    const plateToSave = {
      ...currentPlate,
      id: currentPlate.id || uuidv4()
    };

    const isEditingExisting = isEditing && plates.some(p => p.id === plateToSave.id);

    if (isEditingExisting) {
      // Atualiza prato existente
      const newPlates = plates.map(p => 
        p.id === plateToSave.id ? plateToSave : p
      );
      setPlates(newPlates);
      toast.success("Prato atualizado com sucesso!");
    } else {
      // Adiciona novo prato
      setPlates([...plates, plateToSave]);
      toast.success("Prato salvo com sucesso!");
    }

    startNewPlate();
    setShowSaveModal(false);
  }

  function handleEditPlate(plate: Plate) {
    setCurrentPlate({...plate});
    setIsEditing(true);
  }

  function handleDeletePlate(plateId: string) {
    setPlates(plates.filter(p => p.id !== plateId));
    toast.info("Prato removido!");
  }

  // Calcula a porcentagem em relação ao target da refeição
  function calculatePercentage(value: number, target: number): number {
    return Math.min(Math.round((value / target) * 100), 100);
  }

  // Encontra um produto pelo ID
  function findProduct(id: string): Product | undefined {
    return products.find(p => p.id === id);
  }

  return (
    <div className="space-y-5">
      {/* Área de criação/edição de prato */}
      <div>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {isEditing ? "Editar Prato" : "Criar Novo Prato"}
                </CardTitle>
                <CardDescription>
                  {isEditing 
                    ? `Editando: ${currentPlate.name}` 
                    : "Crie um prato combinando diferentes alimentos"}
                </CardDescription>
              </div>
              {isEditing && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={startNewPlate}
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Criar novo
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plateName">Nome do Prato</Label>
                <Input 
                  id="plateName"
                  placeholder="Ex: Peito de frango com arroz"
                  value={currentPlate.name}
                  onChange={(e) => setCurrentPlate({...currentPlate, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plateMeal">Refeição</Label>
                <Select 
                  value={mealType} 
                  onValueChange={(value: MealName) => 
                    setCurrentPlate({...currentPlate, mealType: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a refeição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pequeno-Almoço">Pequeno-Almoço</SelectItem>
                    <SelectItem value="Almoço">Almoço</SelectItem>
                    <SelectItem value="Lanche da Tarde">Lanche da Tarde</SelectItem>
                    <SelectItem value="Jantar">Jantar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Itens do Prato</Label>
                <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus size={14} className="mr-1" />
                      Adicionar Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-xl">
                        <Plus size={20} className="text-green-600" />
                        Adicionar Item ao Prato
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-5 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="searchProduct">Procurar Produto</Label>
                        <Input
                          id="searchProduct"
                          placeholder="Digite para pesquisar..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      
                      <div className="border border-gray-100 rounded-xl bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-700">Produtos Disponíveis</h3>
                          <div className="h-6 w-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                            <Salad size={14} className="text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg border border-gray-200 h-[200px] overflow-y-auto p-1">
                          {filteredProducts.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                              Nenhum produto encontrado
                            </div>
                          ) : (
                            filteredProducts.map((product) => {
                              return (
                                <div 
                                  key={product.id}
                                  className={`p-2 border rounded-md cursor-pointer flex justify-between items-center mb-1 transition-colors ${
                                    selectedProductId === product.id 
                                      ? 'border-green-500 bg-green-50' 
                                      : 'hover:bg-gray-50'
                                  }`}
                                  onClick={() => setSelectedProductId(product.id)}
                                >
                                  <div>
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-xs text-gray-500">{product.nutritionalInfo.calories} kcal/{product.baseAmount}{product.unit}</div>
                                  </div>
                                  <Badge variant="outline">
                                    P: {product.nutritionalInfo.protein}g • C: {product.nutritionalInfo.carbs}g • G: {product.nutritionalInfo.fat}g
                                  </Badge>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                      
                      <div className="border border-gray-100 rounded-xl bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-700">Quantidade</h3>
                          <div className="h-6 w-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                            <Scale size={14} className="text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="itemQuantity">Quantidade (gramas)</Label>
                            {selectedProductId && findProduct(selectedProductId) && (
                              <span className="text-xs text-gray-600">
                                Base: {findProduct(selectedProductId)?.baseAmount}{findProduct(selectedProductId)?.unit}
                              </span>
                            )}
                          </div>
                          <Input
                            id="itemQuantity"
                            type="number"
                            min="1"
                            value={itemAmount}
                            onChange={(e) => setItemAmount(parseInt(e.target.value) || 0)}
                            className="bg-white"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter className="gap-2">
                      <Button variant="outline" onClick={() => setShowAddItemModal(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleAddItem}
                        disabled={selectedProductId === null}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Plus size={16} className="mr-1" />
                        Adicionar ao Prato
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-2">
                {currentPlate.items.length === 0 ? (
                  <div className="text-center text-gray-500 p-4 border border-dashed rounded-md">
                    Nenhum item adicionado
                  </div>
                ) : (
                  currentPlate.items.map((item, index) => {
                    const product = findProduct(item.productId);
                    if (!product) return null;
                    
                    // Calcula os valores nutricionais do item
                    const factor = item.amount / product.baseAmount;
                    const itemCals = product.nutritionalInfo.calories * factor;
                    const itemProtein = product.nutritionalInfo.protein * factor;
                    const itemCarbs = product.nutritionalInfo.carbs * factor;
                    const itemFat = product.nutritionalInfo.fat * factor;
                    
                    return (
                      <div key={index} className="flex items-center justify-between border p-2 rounded-md">
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            P: {itemProtein.toFixed(1)}g • 
                            C: {itemCarbs.toFixed(1)}g • 
                            G: {itemFat.toFixed(1)}g • 
                            {Math.round(itemCals)} kcal
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-20 h-8 text-sm"
                            value={item.amount}
                            onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                          />
                          <span className="text-xs">g</span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-500 h-8 w-8"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            <Separator />
            
            {/* Sumário do Prato */}
            <div className="space-y-3">
              <h3 className="font-medium">Sumário Nutricional</h3>
              
              {/* Calorias */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Calorias</span>
                  <span>{Math.round(plateValues.cal)} / {Math.round(mealTarget.cal)} kcal</span>
                </div>
                <Progress value={calculatePercentage(plateValues.cal, mealTarget.cal)} className="h-2" />
              </div>
              
              {/* Macros */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Proteínas</span>
                    <span>{Math.round(plateValues.p)}g / {Math.round(mealTarget.p)}g</span>
                  </div>
                  <Progress value={calculatePercentage(plateValues.p, mealTarget.p)} className="h-1.5 bg-blue-100" indicatorClassName="bg-blue-500" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Carboidratos</span>
                    <span>{Math.round(plateValues.c)}g / {Math.round(mealTarget.c)}g</span>
                  </div>
                  <Progress value={calculatePercentage(plateValues.c, mealTarget.c)} className="h-1.5 bg-green-100" indicatorClassName="bg-green-500" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Gorduras</span>
                    <span>{Math.round(plateValues.f)}g / {Math.round(mealTarget.f)}g</span>
                  </div>
                  <Progress value={calculatePercentage(plateValues.f, mealTarget.f)} className="h-1.5 bg-yellow-100" indicatorClassName="bg-yellow-500" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
              <DialogTrigger asChild>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Save size={16} className="mr-2" />
                  {isEditing ? "Atualizar Prato" : "Salvar Prato"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Save size={20} className="text-green-600" />
                    {isEditing ? "Atualizar" : "Salvar"} Prato
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  {plateMatchesMealTarget(currentPlate) ? (
                    <div className="bg-green-50 p-4 rounded-xl flex items-center text-green-700 border border-green-200">
                      <div className="bg-green-100 rounded-full p-2 mr-3">
                        <CheckCircle2 size={20} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Perfeito!</h3>
                        <p className="text-sm text-green-600">Este prato corresponde exatamente às suas metas para esta refeição.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-700">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={18} className="text-amber-600" />
                        <h3 className="font-medium">Atenção: Macronutrientes Fora da Meta</h3>
                      </div>
                      <p className="mb-2 mt-2 text-sm">Este prato não corresponde exatamente às metas para {mealType}:</p>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {plateValues.cal > mealTarget.cal + 0.01 && 
                          <li>Calorias acima da meta (+{Math.round(plateValues.cal - mealTarget.cal)} kcal)</li>}
                        {plateValues.cal < mealTarget.cal - 0.01 && 
                          <li>Calorias abaixo da meta (-{Math.round(mealTarget.cal - plateValues.cal)} kcal)</li>}
                          
                        {plateValues.p > mealTarget.p + 0.01 && 
                          <li>Proteínas acima da meta (+{Math.round(plateValues.p - mealTarget.p)}g)</li>}
                        {plateValues.p < mealTarget.p - 0.01 && 
                          <li>Proteínas abaixo da meta (-{Math.round(mealTarget.p - plateValues.p)}g)</li>}
                          
                        {plateValues.c > mealTarget.c + 0.01 && 
                          <li>Carboidratos acima da meta (+{Math.round(plateValues.c - mealTarget.c)}g)</li>}
                        {plateValues.c < mealTarget.c - 0.01 && 
                          <li>Carboidratos abaixo da meta (-{Math.round(mealTarget.c - plateValues.c)}g)</li>}
                          
                        {plateValues.f > mealTarget.f + 0.01 && 
                          <li>Gorduras acima da meta (+{Math.round(plateValues.f - mealTarget.f)}g)</li>}
                        {plateValues.f < mealTarget.f - 0.01 && 
                          <li>Gorduras abaixo da meta (-{Math.round(mealTarget.f - plateValues.f)}g)</li>}
                      </ul>
                    </div>
                  )}
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                    {plateMatchesMealTarget(currentPlate) 
                      ? "Este prato está com os macronutrientes perfeitamente balanceados para a refeição selecionada!" 
                      : "Deseja salvar o prato mesmo com os macronutrientes fora da meta ideal?"}
                  </p>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setShowSaveModal(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={savePlate} 
                    className="bg-green-600 hover:bg-green-700 text-white gap-1"
                  >
                    <Save size={16} />
                    {isEditing ? "Atualizar" : "Salvar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>
      
      {/* Lista de pratos salvos */}
      <div className="space-y-3">
        <h3 className="font-medium">Pratos Salvos</h3>
        {plates.length === 0 ? (
          <div className="text-center text-gray-500 p-6 border border-dashed rounded-md">
            Nenhum prato salvo
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plates.map((plate) => {
              const plateSum = sumPlate(plate);
              
              return (
                <Card key={plate.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{plate.name}</h3>
                        <Badge variant="outline" className="mt-1">
                          {plate.mealType || "Sem categoria"}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditPlate(plate)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-600"
                          onClick={() => handleDeletePlate(plate.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-sm">
                        <span>Calorias:</span>
                        <span className="font-medium">{Math.round(plateSum.cal)} kcal</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>P: {Math.round(plateSum.p)}g</span>
                        <span>C: {Math.round(plateSum.c)}g</span>
                        <span>G: {Math.round(plateSum.f)}g</span>
                      </div>
                    </div>
                    
                    {plateMatchesMealTarget(plate) && (
                      <Badge className="bg-green-100 text-green-700 mt-2 w-full justify-center">
                        Correspondência perfeita com a meta
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}