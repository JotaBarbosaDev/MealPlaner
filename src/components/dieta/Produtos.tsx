import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Product, NutritionalInfo } from "@/types/dieta";
import { useToast } from "@/hooks/use-toast";

type Props = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
};

export default function DietaProdutos({ products, setProducts }: Props) {
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    brand: "",
    baseAmount: 100,
    unit: "g"
  });

  // Filtragem de produtos
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Funções de manipulação
  function handleAddProduct() {
    if (formData.name.trim() === "") {
      toast({
        title: "Erro",
        description: "O produto precisa ter um nome!",
        variant: "destructive"
      });
      return;
    }

    const newProduct: Product = {
      id: editingIndex !== null ? products[editingIndex].id : Date.now().toString(),
      name: formData.name,
      brand: formData.brand || undefined,
      baseAmount: formData.baseAmount,
      unit: formData.unit,
      nutritionalInfo: {
        calories: formData.calories,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat
      }
    };

    if (editingIndex !== null) {
      // Editando produto existente
      const newProducts = [...products];
      newProducts[editingIndex] = newProduct;
      setProducts(newProducts);
      toast({
        description: "Produto atualizado com sucesso!"
      });
    } else {
      // Adicionando novo produto
      setProducts([...products, newProduct]);
      toast({
        description: "Produto adicionado com sucesso!"
      });
    }

    resetForm();
    setShowAddDialog(false);
  }

  function handleDeleteProduct(index: number) {
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
    toast({
      description: "Produto removido!"
    });
  }

  function handleEditProduct(index: number) {
    const product = products[index];
    setFormData({
      name: product.name,
      calories: product.nutritionalInfo.calories,
      protein: product.nutritionalInfo.protein,
      carbs: product.nutritionalInfo.carbs,
      fat: product.nutritionalInfo.fat,
      brand: product.brand || "",
      baseAmount: product.baseAmount,
      unit: product.unit
    });
    setEditingIndex(index);
    setShowAddDialog(true);
  }

  function resetForm() {
    setFormData({
      name: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      brand: "",
      baseAmount: 100,
      unit: "g"
    });
    setEditingIndex(null);
  }

  function handleViewProduct(index: number) {
    setSelectedProductIndex(index);
    setShowInfoDialog(true);
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho e pesquisa */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Produtos</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              onClick={() => {
                resetForm();
                setShowAddDialog(true);
              }}
            >
              <Plus size={16} className="mr-1" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null ? "Editar Produto" : "Adicionar Produto"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <Label htmlFor="prodName">Nome do Produto</Label>
                <Input 
                  id="prodName" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ex: Peito de Frango"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prodBrand">Marca (opcional)</Label>
                <Input 
                  id="prodBrand" 
                  value={formData.brand} 
                  onChange={(e) => setFormData({...formData, brand: e.target.value})} 
                  placeholder="Ex: Marca X"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="baseAmount">Quantidade Base</Label>
                  <div className="flex">
                    <Input 
                      id="baseAmount" 
                      type="number" 
                      value={formData.baseAmount} 
                      onChange={(e) => setFormData({...formData, baseAmount: parseFloat(e.target.value) || 0})} 
                      className="rounded-r-none"
                    />
                    <Input 
                      id="unit" 
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="max-w-[40px] rounded-l-none text-center"
                    />
                  </div>
                </div>
              </div>
              <Separator />
              <h3 className="font-medium text-sm">Valor Nutricional (por {formData.baseAmount}{formData.unit})</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="prodCal">Calorias</Label>
                  <Input 
                    id="prodCal" 
                    type="number" 
                    value={formData.calories} 
                    onChange={(e) => setFormData({...formData, calories: parseFloat(e.target.value) || 0})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prodP">Proteínas (g)</Label>
                  <Input 
                    id="prodP" 
                    type="number" 
                    value={formData.protein} 
                    onChange={(e) => setFormData({...formData, protein: parseFloat(e.target.value) || 0})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prodF">Gorduras (g)</Label>
                  <Input 
                    id="prodF" 
                    type="number" 
                    value={formData.fat} 
                    onChange={(e) => setFormData({...formData, fat: parseFloat(e.target.value) || 0})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prodC">Carboidratos (g)</Label>
                  <Input 
                    id="prodC" 
                    type="number" 
                    value={formData.carbs} 
                    onChange={(e) => setFormData({...formData, carbs: parseFloat(e.target.value) || 0})} 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm();
                setShowAddDialog(false);
              }}>Cancelar</Button>
              <Button onClick={handleAddProduct}>
                {editingIndex !== null ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative">
        <Search size={16} className="absolute left-2.5 top-2.5 text-gray-500" />
        <Input 
          placeholder="Pesquisar produtos..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Lista de produtos */}
      <div className="space-y-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
          </div>
        ) : (
          filteredProducts.map((product, index) => {
            const actualIndex = products.findIndex(p => p.id === product.id);
            
            return (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm truncate max-w-[180px]">
                        {product.name}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {product.nutritionalInfo.calories} kcal
                        </Badge>
                        <span className="text-xs text-blue-600">P: {product.nutritionalInfo.protein}g</span>
                        <span className="text-xs text-yellow-600">G: {product.nutritionalInfo.fat}g</span>
                        <span className="text-xs text-green-600">C: {product.nutritionalInfo.carbs}g</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewProduct(actualIndex)}
                      >
                        <Info size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditProduct(actualIndex)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-600"
                        onClick={() => handleDeleteProduct(actualIndex)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Diálogo de detalhes do produto */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedProductIndex !== null ? products[selectedProductIndex]?.name : 'Detalhes do Produto'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProductIndex !== null && products[selectedProductIndex] && (
            <div className="space-y-4 py-2">
              {products[selectedProductIndex].brand && (
                <div className="text-sm text-gray-500">
                  Marca: {products[selectedProductIndex].brand}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-sm text-gray-500">
                    Calorias (por {products[selectedProductIndex].baseAmount}{products[selectedProductIndex].unit})
                  </span>
                  <p className="font-semibold">{products[selectedProductIndex].nutritionalInfo.calories} kcal</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Proteínas</span>
                  <p className="font-semibold">{products[selectedProductIndex].nutritionalInfo.protein} g</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Gorduras</span>
                  <p className="font-semibold">{products[selectedProductIndex].nutritionalInfo.fat} g</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Carboidratos</span>
                  <p className="font-semibold">{products[selectedProductIndex].nutritionalInfo.carbs} g</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Distribuição de Macronutrientes</h4>
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    {(() => {
                      const prod = products[selectedProductIndex].nutritionalInfo;
                      const total = prod.protein + prod.carbs + prod.fat;
                      if (total === 0) return null;
                      
                      const pPerc = (prod.protein / total) * 100;
                      const cPerc = (prod.carbs / total) * 100;
                      const fPerc = (prod.fat / total) * 100;
                      
                      return (
                        <>
                          <div 
                            className="bg-blue-500 h-2.5 rounded-l-full" 
                            style={{ width: `${pPerc}%`, display: 'inline-block' }}
                          />
                          <div 
                            className="bg-green-500 h-2.5" 
                            style={{ width: `${cPerc}%`, display: 'inline-block' }}
                          />
                          <div 
                            className="bg-yellow-500 h-2.5 rounded-r-full" 
                            style={{ width: `${fPerc}%`, display: 'inline-block' }}
                          />
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                    <span>Proteínas</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                    <span>Carboidratos</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
                    <span>Gorduras</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowInfoDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}