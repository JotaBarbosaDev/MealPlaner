"use client";

import React, { FormEvent } from "react";
import useLocalStorage from "use-local-storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type MealName = "Pequeno-Almoço" | "Almoço" | "Lanche da Tarde" | "Jantar";

interface Product {
  name: string;
  p: number;   // Proteínas/100g
  f: number;   // Gordura/100g
  c: number;   // Carboidratos/100g
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

export default function Page() {
  const [calTarget, setCalTarget] = useLocalStorage<number>("calTarget", 1975);
  const [protPercent, setProtPercent] = useLocalStorage<number>("protPercent", 30);
  const [fatPercent, setFatPercent] = useLocalStorage<number>("fatPercent", 20);
  const [carbPercent, setCarbPercent] = useLocalStorage<number>("carbPercent", 50);

  const [products, setProducts] = useLocalStorage<Product[]>("products", []);
  const [meals, setMeals] = useLocalStorage<Meal[]>("meals", [
    {name:"Pequeno-Almoço", plates:[]},
    {name:"Almoço", plates:[]},
    {name:"Lanche da Tarde", plates:[]},
    {name:"Jantar", plates:[]}
  ]);
  const [plates, setPlates] = useLocalStorage<Plate[]>("plates", []);
  const [currentPlate, setCurrentPlate] = useLocalStorage<Plate>("currentPlate", { name:'', mealName:'Pequeno-Almoço', items:[] });

  const [metaDialogOpen, setMetaDialogOpen] = useLocalStorage<boolean>("metaDialogOpen", false);
  const [productDialogOpen, setProductDialogOpen] = useLocalStorage<boolean>("productDialogOpen", false);
  const [addProductDialogOpen, setAddProductDialogOpen] = useLocalStorage<boolean>("addProductDialogOpen", false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useLocalStorage<boolean>("editProductDialogOpen", false);
  const [createPlateDialogOpen, setCreatePlateDialogOpen] = useLocalStorage<boolean>("createPlateDialogOpen", false);
  const [addPlateItemDialogOpen, setAddPlateItemDialogOpen] = useLocalStorage<boolean>("addPlateItemDialogOpen", false);
  const [editPlateItemDialogOpen, setEditPlateItemDialogOpen] = useLocalStorage<boolean>("editPlateItemDialogOpen", false);
  const [mealDialogOpen, setMealDialogOpen] = useLocalStorage<boolean>("mealDialogOpen", false);
  const [viewPlanDialogOpen, setViewPlanDialogOpen] = useLocalStorage<boolean>("viewPlanDialogOpen", false);

  const [editProductIndex, setEditProductIndex] = useLocalStorage<number|undefined>("editProductIndex", undefined);
  const [productNameField, setProductNameField] = useLocalStorage<string>("productNameField", "");
  const [productPField, setProductPField] = useLocalStorage<number>("productPField", 0);
  const [productFField, setProductFField] = useLocalStorage<number>("productFField", 0);
  const [productCField, setProductCField] = useLocalStorage<number>("productCField", 0);
  const [productCalField, setProductCalField] = useLocalStorage<number>("productCalField", 0);

  const [editPlateItemIndex, setEditPlateItemIndex] = useLocalStorage<number|undefined>("editPlateItemIndex", undefined);
  const [plateItemGramsField, setPlateItemGramsField] = useLocalStorage<number>("plateItemGramsField", 0);

  const [addItemProductIndex, setAddItemProductIndex] = useLocalStorage<number|undefined>("addItemProductIndex", undefined);
  const [addItemGrams, setAddItemGrams] = useLocalStorage<number>("addItemGrams", 0);

  const [addPlateMealIndex, setAddPlateMealIndex] = useLocalStorage<number|undefined>("addPlateMealIndex", undefined);
  const [addPlatePlateIndex, setAddPlatePlateIndex] = useLocalStorage<number|undefined>("addPlatePlateIndex", undefined);

  const [editingMealIndex, setEditingMealIndex] = useLocalStorage<number|undefined>("editingMealIndex", undefined);
  const [editingPlateInMealIndex, setEditingPlateInMealIndex] = useLocalStorage<number|undefined>("editingPlateInMealIndex", undefined);

  const mealDistribution: Record<MealName, number> = {
    "Pequeno-Almoço":0.2,
    "Almoço":0.3,
    "Lanche da Tarde":0.2,
    "Jantar":0.3
  };

  // Garante que existem as 4 refeições fixas
  if (meals.length === 0) {
    setMeals([
      {name:"Pequeno-Almoço", plates:[]},
      {name:"Almoço", plates:[]},
      {name:"Lanche da Tarde", plates:[]},
      {name:"Jantar", plates:[]}
    ]);
  }

  function calculateDailyTargets(){
    const p = (protPercent/100)*calTarget/4;
    const f = (fatPercent/100)*calTarget/9;
    const c = (carbPercent/100)*calTarget/4;
    return {p,f,c,cal:calTarget};
  }

  function calculateMealTargets(mealName: MealName){
    const daily=calculateDailyTargets();
    const dist=mealDistribution[mealName];
    return {
      p: daily.p*dist,
      f: daily.f*dist,
      c: daily.c*dist,
      cal: daily.cal*dist
    };
  }

  function sumPlate(plate: Plate){
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
    const mealTargets = calculateMealTargets(plate.mealName);
    const plateSum = sumPlate(plate);
    return plateSum.cal <= mealTargets.cal && plateSum.p <= mealTargets.p && plateSum.f <= mealTargets.f && plateSum.c <= mealTargets.c;
  }

  function ensureMealNoSurpass(mealIndex: number){
    const meal = meals[mealIndex];
    const mealTargets = calculateMealTargets(meal.name);
    const mealSum = meal.plates.reduce((acc, plate) => {
      const plateSum = sumPlate(plate);
      return {
        p: acc.p + plateSum.p,
        f: acc.f + plateSum.f,
        c: acc.c + plateSum.c,
        cal: acc.cal + plateSum.cal,
      };
    }, { p: 0, f: 0, c: 0, cal: 0 });
    return mealSum.cal <= mealTargets.cal && mealSum.p <= mealTargets.p && mealSum.f <= mealTargets.f && mealSum.c <= mealTargets.c;
  }

  function handleUpdateTargets(){
    toast("Metas atualizadas com sucesso!");
    setMetaDialogOpen(false);
  }

  function clearProductFields(){
    setProductNameField("");
    setProductPField(0);
    setProductFField(0);
    setProductCField(0);
    setProductCalField(0);
  }

  function handleAddProductSubmit(e: FormEvent){
    e.preventDefault();
    if(!productNameField.trim() || isNaN(productPField) || isNaN(productFField) || isNaN(productCField) || isNaN(productCalField)){
      toast("Preencha todos os campos corretamente.");
      return;
    }
    const product: Product = {
      name: productNameField.trim(),
      p: productPField,
      f: productFField,
      c: productCField,
      cal: productCalField
    };
    setProducts([...products, product]);
    clearProductFields();
    setAddProductDialogOpen(false);
    toast("Produto adicionado com sucesso!");
  }

  function handleEditProductClick(index: number){
    const prod = products[index];
    setEditProductIndex(index);
    setProductNameField(prod.name);
    setProductPField(prod.p);
    setProductFField(prod.f);
    setProductCField(prod.c);
    setProductCalField(prod.cal);
    setEditProductDialogOpen(true);
  }

  function handleEditProductSubmit(e: FormEvent){
    e.preventDefault();
    if(editProductIndex===undefined) return;
    if(!productNameField.trim() || isNaN(productPField) || isNaN(productFField) || isNaN(productCField) || isNaN(productCalField)){
      toast("Preencha todos os campos corretamente.");
      return;
    }
    const newProducts=[...products];
    newProducts[editProductIndex] = {
      name: productNameField.trim(),
      p: productPField,
      f: productFField,
      c: productCField,
      cal: productCalField
    };
    setProducts(newProducts);
    clearProductFields();
    setEditProductDialogOpen(false);
    toast("Produto editado com sucesso!");
  }

  function handleDeleteProduct(index: number){
    const newProducts=[...products];
    newProducts.splice(index,1);
    setProducts(newProducts);
    toast("Produto apagado!");
  }

  function handleAddPlateItemSubmit(e: FormEvent){
    e.preventDefault();
    if(addItemProductIndex===undefined || isNaN(addItemGrams) || addItemGrams<=0){
      toast("Selecione um produto e insira a quantidade corretamente.");
      return;
    }
    const cp={...currentPlate};
    cp.items.push({productIndex:addItemProductIndex,grams:addItemGrams});
    if(!ensurePlateFitsMeal(cp)){
      toast("Não é possível adicionar este produto sem ultrapassar as metas da refeição.");
      return;
    }
    setCurrentPlate(cp);
    setAddPlateItemDialogOpen(false);
    setAddItemProductIndex(undefined); setAddItemGrams(0);
    toast("Produto adicionado ao prato com sucesso!");
  }

  function handleEditPlateItemClick(index: number){
    const it = currentPlate.items[index];
    setEditPlateItemIndex(index);
    setPlateItemGramsField(it.grams);
    setEditPlateItemDialogOpen(true);
  }

  function handleEditPlateItemSubmit(e: FormEvent){
    e.preventDefault();
    if(editPlateItemIndex===undefined) return;
    if(isNaN(plateItemGramsField) || plateItemGramsField<=0){
      toast("Quantidade inválida.");
      return;
    }
    const cp={...currentPlate};
    cp.items[editPlateItemIndex].grams = plateItemGramsField;
    if(!ensurePlateFitsMeal(cp)){
      toast("Não é possível ajustar essa quantidade sem ultrapassar as metas.");
      return;
    }
    setCurrentPlate(cp);
    setEditPlateItemDialogOpen(false);
    toast("Quantidade atualizada!");
  }

  function handleRemovePlateItem(index: number){
    const cp={...currentPlate};
    cp.items.splice(index,1);
    setCurrentPlate(cp);
    toast("Produto removido do prato!");
  }

  function finalizePlate(){
    if(!currentPlate.name.trim()||currentPlate.items.length===0){
      toast("Defina um nome e adicione ao menos um produto ao prato.");
      return;
    }
    if(!ensurePlateFitsMeal(currentPlate)){
      toast("Não é possível criar/editar este prato sem ultrapassar as metas.");
      setCurrentPlate({name:'',mealName:'Pequeno-Almoço',items:[]});
      return;
    }

    if(editingMealIndex!==undefined && editingPlateInMealIndex!==undefined){
      const newMeals=[...meals];
      newMeals[editingMealIndex].plates[editingPlateInMealIndex]=JSON.parse(JSON.stringify(currentPlate));
      setMeals(newMeals);
      setEditingMealIndex(undefined);
      setEditingPlateInMealIndex(undefined);
      toast("Prato editado na refeição!");
    } else {
      const newPlates=[...plates, {...currentPlate}];
      setPlates(newPlates);
      toast("Prato criado com sucesso!");
    }

    setCurrentPlate({name:'',mealName:'Pequeno-Almoço',items:[]});
    setCreatePlateDialogOpen(false);
  }

  function addPlateToMealFromUI(){
    if(addPlateMealIndex===undefined || addPlatePlateIndex===undefined){
      toast("Selecione a refeição e o prato.");
      return;
    }
    const chosenPlate=JSON.parse(JSON.stringify(plates[addPlatePlateIndex])) as Plate;
    const newMeals=[...meals];
    const meal=newMeals[addPlateMealIndex];
    if(chosenPlate.mealName!==meal.name){
      toast("Este prato não corresponde à refeição selecionada.");
      return;
    }
    meal.plates.push(chosenPlate);
    if(!ensureMealNoSurpass(addPlateMealIndex)){
      meal.plates.pop();
      toast("Não foi possível adicionar o prato sem ultrapassar as metas.");
    } else {
      toast("Prato adicionado à refeição com sucesso!");
    }
    setMeals(newMeals);
  }

  function handleRemovePlateFromMeal(mIndex: number, pIndex: number){
    const newMeals=[...meals];
    newMeals[mIndex].plates.splice(pIndex,1);
    setMeals(newMeals);
    toast("Prato removido da refeição!");
  }

  function calculateTotals(){
    let totalP=0, totalF=0, totalC=0, totalCal=0;
    meals.forEach(meal=>{
      meal.plates.forEach((plate: Plate) => {
        const s=sumPlate(plate);
        totalP+=s.p; totalF+=s.f; totalC+=s.c; totalCal+=s.cal;
      });
    });
    return {p:totalP, f:totalF, c:totalC, cal:totalCal};
  }

  function renderFullPlanDetail(){
    if(meals.length===0) {
      return <p>Nenhum plano criado ainda.</p>;
    }
    let totalP=0,totalF=0,totalC=0,totalCal=0;
    let anyPlate=false;

    const mealElements=meals.map((m,i)=>{
      let mealP=0,mealF=0,mealC=0,mealCal=0;
      let content;
      if(m.plates.length===0){
        content=<p className="text-sm text-gray-500">Nenhum prato nesta refeição.</p>;
      } else {
        content = m.plates.map((pl, j)=>{
          const sp=sumPlate(pl);
          mealP+=sp.p; mealF+=sp.f; mealC+=sp.c; mealCal+=sp.cal;
          anyPlate=true;
          const productLines = pl.items.map((it, k) => {
            const prod=products[it.productIndex];
            const factor=it.grams/100;
            const pVal=prod.p*factor;
            const fVal=prod.f*factor;
            const cVal=prod.c*factor;
            const calVal=prod.cal*factor;
            return <li key={k} className="text-sm mb-1">{prod.name} {it.grams.toFixed(1)}g (HC:{cVal.toFixed(1)}g | P:{pVal.toFixed(1)}g | G:{fVal.toFixed(1)}g | Cal:{calVal.toFixed(1)}kcal)</li>;
          });

          return <div className="border-b border-gray-300 py-2 mb-2" key={j}>
            <h4 className="text-gray-700 font-semibold">{pl.name}</h4>
            <ul className="mb-2 list-none p-0">{productLines}</ul>
            <div className="macro-line"><strong>Prato:</strong> {sp.cal.toFixed(1)}kcal | HC:{sp.c.toFixed(1)}g | P:{sp.p.toFixed(1)}g | G:{sp.f.toFixed(1)}g</div>
          </div>;
        });
        content=<>
          {content}
          <div className="macro-line mt-2"><strong>Total da Refeição ({m.name}):</strong> {mealCal.toFixed(1)}kcal | HC:{(mealC).toFixed(1)}g | P:{(mealP).toFixed(1)}g | G:{(mealF).toFixed(1)}g</div>
        </>;
      }

      totalP+=mealP; totalF+=mealF; totalC+=mealC; totalCal+=mealCal;

      return <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-4" key={i}>
        <h3 className="text-lg font-semibold text-green-600 border-b border-gray-300 pb-2 mb-2">{m.name}</h3>
        {content}
      </div>;
    });

    let totalLine = null;
    if(anyPlate){
      totalLine=<><h4 className="font-semibold mt-4">Total Diário</h4>
      <div className="macro-line">{totalCal.toFixed(1)} kcal | HC:{totalC.toFixed(1)}g | P:{totalP.toFixed(1)}g | G:{totalF.toFixed(1)}g</div></>;
    } else {
      mealElements.push(<p key="noplates" className="text-sm text-gray-500">Nenhum prato em qualquer refeição.</p>);
    }

    return <>
      {mealElements}
      {totalLine}
    </>;
  }

  const daily = calculateDailyTargets();
  const totals = calculateTotals();

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick pauseOnHover={false} draggable={false} />

      <header className="bg-green-700 text-white shadow p-4 flex items-center justify-center">
        <h1 className="text-2xl font-bold">Plano Alimentar Atual Personalizado</h1>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <Card className="p-4 space-y-4 shadow">
          <h2 className="text-xl font-semibold mb-2">Resumo Diário</h2>
          <div>
            <p className="font-semibold mb-1">Objetivo Diário:</p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white rounded p-2 shadow"><strong>Cal:</strong> {daily.cal.toFixed(1)} kcal</div>
              <div className="bg-white rounded p-2 shadow"><strong>HC:</strong> {daily.c.toFixed(1)} g</div>
              <div className="bg-white rounded p-2 shadow"><strong>P:</strong> {daily.p.toFixed(1)} g</div>
              <div className="bg-white rounded p-2 shadow"><strong>G:</strong> {daily.f.toFixed(1)} g</div>
            </div>
          </div>
          <div>
            <p className="font-semibold mt-4 mb-1">Atual:</p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white rounded p-2 shadow"><strong>Cal:</strong> {totals.cal.toFixed(1)} kcal</div>
              <div className="bg-white rounded p-2 shadow"><strong>HC:</strong> {totals.c.toFixed(1)} g</div>
              <div className="bg-white rounded p-2 shadow"><strong>P:</strong> {totals.p.toFixed(1)} g</div>
              <div className="bg-white rounded p-2 shadow"><strong>G:</strong> {totals.f.toFixed(1)} g</div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Button onClick={()=>setMetaDialogOpen(true)} className="w-full">Gerir Metas</Button>
          <Button onClick={()=>setProductDialogOpen(true)} className="w-full">Gerir Produtos</Button>
          <Button onClick={()=>{
            setEditingMealIndex(undefined);
            setEditingPlateInMealIndex(undefined);
            setCurrentPlate({name:'',mealName:'Pequeno-Almoço',items:[]});
            setCreatePlateDialogOpen(true);
          }} className="w-full">Criar Prato</Button>
          <Button onClick={()=>setMealDialogOpen(true)} className="w-full">Gerir Refeições</Button>
          <Button onClick={()=>setViewPlanDialogOpen(true)} className="w-full">Ver Plano Atual</Button>
        </div>

        { /* Dialog Metas */ }
<Dialog open={metaDialogOpen} onOpenChange={setMetaDialogOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Gerir Metas</DialogTitle>
    </DialogHeader>
    <form onSubmit={(e)=>{e.preventDefault(); handleUpdateTargets();}} className="space-y-2">
      <Label>Calorias alvo:</Label><Input type="number" value={calTarget} onChange={e=>setCalTarget(Number(e.target.value))}/>
      <Label>% Proteínas:</Label><Input type="number" value={protPercent} onChange={e=>setProtPercent(Number(e.target.value))}/>
      <Label>% Gorduras:</Label><Input type="number" value={fatPercent} onChange={e=>setFatPercent(Number(e.target.value))}/>
      <Label>% Carboidratos:</Label><Input type="number" value={carbPercent} onChange={e=>setCarbPercent(Number(e.target.value))}/>
      <DialogFooter>
        <Button variant="secondary" onClick={()=>setMetaDialogOpen(false)}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

{ /* Dialog Produtos */ }
<Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
  <DialogContent className="max-w-md overflow-auto">
    <DialogHeader>
      <DialogTitle>Gerir Produtos</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <Button onClick={()=>{
        clearProductFields();
        setAddProductDialogOpen(true);
      }}>Adicionar Produto</Button>
      {products.length===0?<p>Nenhum produto.</p>:
        <ul className="space-y-2">
          {products.map((p,i)=>
            <li key={i} className="border p-2 rounded bg-white text-sm flex items-center justify-between">
              <div>
                <strong>{p.name}</strong><br/>
                HC:{p.c}g | P:{p.p}g | G:{p.f}g | Cal:{p.cal}kcal
              </div>
              <div className="space-x-2">
                <Button variant="secondary" onClick={()=>handleEditProductClick(i)}>Editar</Button>
                <Button variant="destructive" onClick={()=>handleDeleteProduct(i)}>Apagar</Button>
              </div>
            </li>
          )}
        </ul>
      }
    </div>
    <DialogFooter>
      <Button onClick={()=>setProductDialogOpen(false)}>Fechar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{ /* Dialog Adicionar Produto */ }
<Dialog open={addProductDialogOpen} onOpenChange={setAddProductDialogOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Adicionar Produto</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleAddProductSubmit} className="space-y-2">
      <Label>Nome:</Label><Input value={productNameField} onChange={e=>setProductNameField(e.target.value)}/>
      <Label>Proteína (P/100g):</Label><Input type="number" value={productPField} onChange={e=>setProductPField(Number(e.target.value))}/>
      <Label>Gordura (G/100g):</Label><Input type="number" value={productFField} onChange={e=>setProductFField(Number(e.target.value))}/>
      <Label>Carboidrato (HC/100g):</Label><Input type="number" value={productCField} onChange={e=>setProductCField(Number(e.target.value))}/>
      <Label>Calorias (Cal/100g):</Label><Input type="number" value={productCalField} onChange={e=>setProductCalField(Number(e.target.value))}/>
      <DialogFooter>
        <Button variant="secondary" onClick={()=>setAddProductDialogOpen(false)}>Cancelar</Button>
        <Button type="submit">Adicionar</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

{ /* Dialog Editar Produto */ }
<Dialog open={editProductDialogOpen} onOpenChange={setEditProductDialogOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Editar Produto</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleEditProductSubmit} className="space-y-2">
      <Label>Nome:</Label><Input value={productNameField} onChange={e=>setProductNameField(e.target.value)}/>
      <Label>Proteína (P/100g):</Label><Input type="number" value={productPField} onChange={e=>setProductPField(Number(e.target.value))}/>
      <Label>Gordura (G/100g):</Label><Input type="number" value={productFField} onChange={e=>setProductFField(Number(e.target.value))}/>
      <Label>Carboidrato (HC/100g):</Label><Input type="number" value={productCField} onChange={e=>setProductCField(Number(e.target.value))}/>
      <Label>Calorias (Cal/100g):</Label><Input type="number" value={productCalField} onChange={e=>setProductCalField(Number(e.target.value))}/>
      <DialogFooter>
        <Button variant="secondary" onClick={()=>setEditProductDialogOpen(false)}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

{ /* Dialog Criar/Editar Prato */ }
<Dialog open={createPlateDialogOpen} onOpenChange={(open)=>{
  if(!open){
    setEditingMealIndex(undefined);
    setEditingPlateInMealIndex(undefined);
    setCurrentPlate({name:'',mealName:'Pequeno-Almoço',items:[]});
  }
  setCreatePlateDialogOpen(open);
}}>
  <DialogContent className="max-w-md space-y-2">
    <DialogHeader>
      <DialogTitle>{(editingMealIndex!==undefined && editingPlateInMealIndex!==undefined)?"Editar Prato":"Criar Prato"}</DialogTitle>
    </DialogHeader>
    <Label>Nome do Prato:</Label>
    <Input type="text" value={currentPlate.name} onChange={e=>setCurrentPlate({...currentPlate,name:e.target.value})}/>
    
    <Label>Refeição Destino:</Label>
    <Select onValueChange={(val)=>{setCurrentPlate({...currentPlate, mealName: val as MealName});}} value={currentPlate.mealName}>
      <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="Pequeno-Almoço">Pequeno-Almoço</SelectItem>
        <SelectItem value="Almoço">Almoço</SelectItem>
        <SelectItem value="Lanche da Tarde">Lanche da Tarde</SelectItem>
        <SelectItem value="Jantar">Jantar</SelectItem>
      </SelectContent>
    </Select>

    <div className="mt-4">
      <h3 className="font-semibold mb-2">Produtos no Prato</h3>
      {currentPlate.items.length===0?<p>Nenhum produto no prato.</p>:
        (()=>{ 
          let {p,f,c,cal}=sumPlate(currentPlate);
          return <>
            <ul className="space-y-2">
            {currentPlate.items.map((it, ii) => {
              const prod=products[it.productIndex];
              const factor=it.grams/100;
              const pVal=prod.p*factor;
              const fVal=prod.f*factor;
              const cVal=prod.c*factor;
              const calVal=prod.cal*factor;
              return <li key={ii} className="border p-2 rounded bg-white text-sm flex items-center justify-between">
                <div>
                  <strong>{prod.name}</strong>: {it.grams.toFixed(1)}g<br/>
                  HC:{cVal.toFixed(1)}g | P:{pVal.toFixed(1)}g | G:{fVal.toFixed(1)}g | Cal:{calVal.toFixed(1)}kcal
                </div>
                <div className="space-x-2">
                  <Button variant="secondary" onClick={()=>handleEditPlateItemClick(ii)}>Editar</Button>
                  <Button variant="destructive" onClick={()=>handleRemovePlateItem(ii)}>Remover</Button>
                </div>
              </li>;
            })}
            </ul>
            <div className="macro-line mt-2"><strong>Total do Prato:</strong> {cal.toFixed(1)}kcal | HC:{c.toFixed(1)}g | P:{p.toFixed(1)}g | G:{f.toFixed(1)}g</div>
          </>;
        })()
      }
    </div>

    <div className="mt-4 space-x-2">
      <Button onClick={()=>{setAddPlateItemDialogOpen(true);}}>Adicionar Produto ao Prato</Button>
      <Button onClick={finalizePlate}>{(editingMealIndex!==undefined && editingPlateInMealIndex!==undefined)?"Salvar Edição":"Finalizar Prato"}</Button>
    </div>
    <DialogFooter>
      <Button variant="secondary" onClick={()=>{
        setEditingMealIndex(undefined);
        setEditingPlateInMealIndex(undefined);
        setCurrentPlate({name:'',mealName:'Pequeno-Almoço',items:[]});
        setCreatePlateDialogOpen(false);
      }}>Fechar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{ /* Dialog Editar Item do Prato */ }
<Dialog open={editPlateItemDialogOpen} onOpenChange={setEditPlateItemDialogOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Editar Quantidade</DialogTitle>
    </DialogHeader>
    <form onSubmit={(e)=>{e.preventDefault(); handleEditPlateItemSubmit(e);}} className="space-y-2">
      <Label>Gramas:</Label>
      <Input type="number" value={plateItemGramsField} onChange={e=>setPlateItemGramsField(Number(e.target.value))}/>
      <DialogFooter>
        <Button variant="secondary" onClick={()=>setEditPlateItemDialogOpen(false)}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

{ /* Dialog Adicionar Item ao Prato */ }
<Dialog open={addPlateItemDialogOpen} onOpenChange={setAddPlateItemDialogOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Adicionar Produto ao Prato</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleAddPlateItemSubmit} className="space-y-2">
      <Label>Produto:</Label>
      <select className="border rounded p-1 w-full"
        onChange={e=> setAddItemProductIndex(e.target.value===''?undefined:Number(e.target.value))}>
        <option value="">Selecione</option>
        {products.map((p,i)=><option key={i} value={i}>{p.name}</option>)}
      </select>
      <Label>Gramas:</Label><Input type="number" value={addItemGrams} onChange={e=>setAddItemGrams(Number(e.target.value))}/>
      <DialogFooter>
        <Button variant="secondary" onClick={()=>setAddPlateItemDialogOpen(false)}>Cancelar</Button>
        <Button type="submit">Adicionar</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

{ /* Dialog Gerir Refeições */ }
<Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
  <DialogContent className="max-w-md overflow-auto space-y-4">
    <DialogHeader>
      <DialogTitle>Gerir Refeições</DialogTitle>
    </DialogHeader>
    <div className="space-y-2">
      <Label>Refeição (para adicionar prato):</Label>
      <select className="border rounded p-1 w-full" onChange={e=>setAddPlateMealIndex(e.target.value===''?undefined:Number(e.target.value))}>
        <option value="">Selecione a refeição</option>
        {meals.map((m,i)=><option key={i} value={i}>{m.name}</option>)}
      </select>

      <Label>Prato (a adicionar à refeição):</Label>
      <select className="border rounded p-1 w-full" onChange={e=>setAddPlatePlateIndex(e.target.value===''?undefined:Number(e.target.value))}>
        <option value="">Selecione o prato</option>
        {plates.map((pl, i)=><option key={i} value={i}>{pl.name} ({pl.mealName})</option>)}
      </select>

      <Button onClick={addPlateToMealFromUI}>Adicionar Prato à Refeição</Button>
    </div>

    <hr className="my-4" />

    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Refeições e seus Pratos</h3>
      {meals.map((m,mi)=>{
        const mealContent = m.plates.length===0
          ? <p>Nenhum prato nesta refeição.</p>
          : <ul className="space-y-2">
              {m.plates.map((pl,pi)=>{
                const {p,f,c,cal}=sumPlate(pl);
                return <li key={pi} className="border rounded p-2 bg-gray-50 flex items-center justify-between">
                  <div className="text-sm">
                    <strong>{pl.name}</strong> ({pl.mealName})<br/>
                    HC:{c.toFixed(1)}g | P:{p.toFixed(1)}g | G:{f.toFixed(1)}g | Cal:{cal.toFixed(1)}kcal
                  </div>
                  <div className="space-x-2">
                    <Button variant="secondary" onClick={()=>{
                      setEditingMealIndex(mi);
                      setEditingPlateInMealIndex(pi);
                      setCurrentPlate({...pl});
                      setCreatePlateDialogOpen(true);
                    }}>Editar</Button>
                    <Button variant="destructive" onClick={()=>handleRemovePlateFromMeal(mi,pi)}>Apagar</Button>
                  </div>
                </li>;
              })}
            </ul>;

        return <div key={mi} className="border rounded p-2 bg-white">
          <h4 className="font-semibold text-green-700 mb-2">{m.name}</h4>
          {mealContent}
        </div>;
      })}
    </div>

    <DialogFooter>
      <Button variant="secondary" onClick={()=>setMealDialogOpen(false)}>Fechar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{ /* Dialog Ver Plano Atual */ }
<Dialog open={viewPlanDialogOpen} onOpenChange={setViewPlanDialogOpen}>
  <DialogContent className="max-h-[90%] overflow-auto">
    <DialogHeader>
      <DialogTitle>Plano Atual</DialogTitle>
    </DialogHeader>
    {renderFullPlanDetail()}
    <DialogFooter>
      <Button onClick={()=>setViewPlanDialogOpen(false)}>Fechar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

        
      </main>
    </div>
  );
}
