import React from "react";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { Save, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = {
  calTarget: number;
  setCalTarget: (value: number) => void;
  protPercent: number;
  setProtPercent: (value: number) => void;
  fatPercent: number;
  setFatPercent: (value: number) => void;
  carbPercent: number;
  setCarbPercent: (value: number) => void;
  paPerc: number;
  setPaPerc: (value: number) => void;
  aPerc: number;
  setAPerc: (value: number) => void;
  lPerc: number;
  setLPerc: (value: number) => void;
  jPerc: number;
  setJPerc: (value: number) => void;
};

export default function DietaConfiguracoes({
  calTarget,
  setCalTarget,
  protPercent,
  setProtPercent,
  fatPercent,
  setFatPercent,
  carbPercent,
  setCarbPercent,
  paPerc,
  setPaPerc,
  aPerc,
  setAPerc,
  lPerc,
  setLPerc,
  jPerc,
  setJPerc
}: Props) {
  // Estados internos para controle temporário dos valores
  const [tempCalTarget, setTempCalTarget] = React.useState(calTarget);
  const [tempProtPercent, setTempProtPercent] = React.useState(protPercent);
  const [tempFatPercent, setTempFatPercent] = React.useState(fatPercent);
  const [tempCarbPercent, setTempCarbPercent] = React.useState(carbPercent);
  
  const [tempPaPerc, setTempPaPerc] = React.useState(paPerc);
  const [tempAPerc, setTempAPerc] = React.useState(aPerc);
  const [tempLPerc, setTempLPerc] = React.useState(lPerc);
  const [tempJPerc, setTempJPerc] = React.useState(jPerc);

  // Funções auxiliares
  function updateMacroDistribution(macro: 'prot' | 'fat' | 'carb', value: number) {
    // Garante que os valores somem 100%
    let newProt = tempProtPercent;
    let newFat = tempFatPercent;
    let newCarb = tempCarbPercent;
    
    switch (macro) {
      case 'prot':
        newProt = value;
        // Distribui o restante proporcionalmente entre gordura e carbo
        const fatCarbTotal = Math.max(100 - newProt, 0);
        if (newFat + newCarb > 0) {  // Evita divisão por zero
          const fatRatio = newFat / (newFat + newCarb);
          newFat = Math.round(fatCarbTotal * fatRatio);
          newCarb = Math.round(fatCarbTotal * (1 - fatRatio));
        } else {
          newFat = Math.round(fatCarbTotal / 2);
          newCarb = Math.round(fatCarbTotal / 2);
        }
        break;
      case 'fat':
        newFat = value;
        // Distribui o restante proporcionalmente entre proteína e carbo
        const protCarbTotal = Math.max(100 - newFat, 0);
        if (newProt + newCarb > 0) {
          const protRatio = newProt / (newProt + newCarb);
          newProt = Math.round(protCarbTotal * protRatio);
          newCarb = Math.round(protCarbTotal * (1 - protRatio));
        } else {
          newProt = Math.round(protCarbTotal / 2);
          newCarb = Math.round(protCarbTotal / 2);
        }
        break;
      case 'carb':
        newCarb = value;
        // Distribui o restante proporcionalmente entre proteína e gordura
        const protFatTotal = Math.max(100 - newCarb, 0);
        if (newProt + newFat > 0) {
          const protRatio = newProt / (newProt + newFat);
          newProt = Math.round(protFatTotal * protRatio);
          newFat = Math.round(protFatTotal * (1 - protRatio));
        } else {
          newProt = Math.round(protFatTotal / 2);
          newFat = Math.round(protFatTotal / 2);
        }
        break;
    }
    
    // Garante que a soma seja exatamente 100
    const sum = newProt + newFat + newCarb;
    if (sum !== 100) {
      const diff = 100 - sum;
      // Adiciona a diferença ao maior valor
      if (newProt >= newFat && newProt >= newCarb) {
        newProt += diff;
      } else if (newFat >= newProt && newFat >= newCarb) {
        newFat += diff;
      } else {
        newCarb += diff;
      }
    }
    
    setTempProtPercent(newProt);
    setTempFatPercent(newFat);
    setTempCarbPercent(newCarb);
  }

  function updateMealDistribution(meal: 'pa' | 'a' | 'l' | 'j', value: number) {
    // Garante que os valores somem 100%
    let newPa = tempPaPerc;
    let newA = tempAPerc;
    let newL = tempLPerc;
    let newJ = tempJPerc;
    
    switch (meal) {
      case 'pa':
        newPa = value;
        break;
      case 'a':
        newA = value;
        break;
      case 'l':
        newL = value;
        break;
      case 'j':
        newJ = value;
        break;
    }
    
    // Calcula o total atual
    const total = newPa + newA + newL + newJ;
    
    // Ajusta os valores para somar 100
    if (total > 0) {  // Evita divisão por zero
      newPa = Math.round(newPa / total * 100);
      newA = Math.round(newA / total * 100);
      newL = Math.round(newL / total * 100);
      newJ = Math.round(newJ / total * 100);
      
      // Corrige possíveis arredondamentos
      const sum = newPa + newA + newL + newJ;
      if (sum !== 100) {
        const diff = 100 - sum;
        // Adiciona a diferença ao maior valor
        if (newPa >= newA && newPa >= newL && newPa >= newJ) {
          newPa += diff;
        } else if (newA >= newPa && newA >= newL && newA >= newJ) {
          newA += diff;
        } else if (newL >= newPa && newL >= newA && newL >= newJ) {
          newL += diff;
        } else {
          newJ += diff;
        }
      }
    }
    
    setTempPaPerc(newPa);
    setTempAPerc(newA);
    setTempLPerc(newL);
    setTempJPerc(newJ);
  }

  // Salva as configurações
  function saveSettings() {
    setCalTarget(tempCalTarget);
    setProtPercent(tempProtPercent);
    setFatPercent(tempFatPercent);
    setCarbPercent(tempCarbPercent);
    
    setPaPerc(tempPaPerc);
    setAPerc(tempAPerc);
    setLPerc(tempLPerc);
    setJPerc(tempJPerc);
    
    toast.success("Configurações salvas com sucesso!");
  }

  // Calcula valores em gramas com base nas porcentagens
  const protGrams = Math.round((tempProtPercent / 100) * tempCalTarget / 4);
  const fatGrams = Math.round((tempFatPercent / 100) * tempCalTarget / 9);
  const carbGrams = Math.round((tempCarbPercent / 100) * tempCalTarget / 4);
  
  // Calcula calorias por refeição
  const paCalories = Math.round((tempPaPerc / 100) * tempCalTarget);
  const aCalories = Math.round((tempAPerc / 100) * tempCalTarget);
  const lCalories = Math.round((tempLPerc / 100) * tempCalTarget);
  const jCalories = Math.round((tempJPerc / 100) * tempCalTarget);

  return (
    <div className="space-y-6">
      {/* Meta Calórica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Meta Calórica Diária</CardTitle>
          <CardDescription>
            Defina sua meta diária de calorias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="calTarget">Calorias</Label>
              <span className="text-sm font-medium">{tempCalTarget} kcal</span>
            </div>
            <Input
              id="calTarget"
              type="number"
              min={1000}
              max={5000}
              value={tempCalTarget}
              onChange={(e) => setTempCalTarget(parseInt(e.target.value) || 0)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1000 kcal</span>
              <span>5000 kcal</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Distribuição de Macronutrientes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Macronutrientes</CardTitle>
          <CardDescription>
            Defina a proporção de macronutrientes na sua dieta diária
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Barras de proporção */}
          <div 
            className="h-6 w-full rounded-md overflow-hidden flex"
            style={{ background: 'linear-gradient(to right, #3b82f6, #22c55e, #eab308)' }}
          >
            <div 
              className="h-full bg-blue-500"
              style={{ width: `${tempProtPercent}%` }}
            ></div>
            <div 
              className="h-full bg-green-500"
              style={{ width: `${tempCarbPercent}%` }}
            ></div>
            <div 
              className="h-full bg-yellow-500"
              style={{ width: `${tempFatPercent}%` }}
            ></div>
          </div>
          
          {/* Legendas */}
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-medium text-blue-600">Proteínas</div>
              <div className="text-gray-600">{tempProtPercent}% • {protGrams}g</div>
            </div>
            <div>
              <div className="font-medium text-green-600">Hidratos de Carbono</div>
              <div className="text-gray-600">{tempCarbPercent}% • {carbGrams}g</div>
            </div>
            <div>
              <div className="font-medium text-yellow-600">Gorduras</div>
              <div className="text-gray-600">{tempFatPercent}% • {fatGrams}g</div>
            </div>
          </div>
          
          {/* Sliders para ajuste */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="protSlider">Proteínas</Label>
                <span className="text-sm font-medium text-blue-600">{tempProtPercent}%</span>
              </div>
              <Slider
                id="protSlider"
                min={10}
                max={60}
                step={1}
                value={[tempProtPercent]}
                onValueChange={(value) => updateMacroDistribution('prot', value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10%</span>
                <span>60%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="carbSlider">Hidratos de Carbono</Label>
                <span className="text-sm font-medium text-green-600">{tempCarbPercent}%</span>
              </div>
              <Slider
                id="carbSlider"
                min={10}
                max={70}
                step={1}
                value={[tempCarbPercent]}
                onValueChange={(value) => updateMacroDistribution('carb', value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10%</span>
                <span>70%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="fatSlider">Gorduras</Label>
                <span className="text-sm font-medium text-yellow-600">{tempFatPercent}%</span>
              </div>
              <Slider
                id="fatSlider"
                min={10}
                max={50}
                step={1}
                value={[tempFatPercent]}
                onValueChange={(value) => updateMacroDistribution('fat', value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10%</span>
                <span>50%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Distribuição por Refeição */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição por Refeição</CardTitle>
          <CardDescription>
            Defina como as calorias serão distribuídas entre as refeições do dia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gráfico de distribuição */}
          <div className="h-6 w-full rounded-md overflow-hidden flex">
            <div 
              className="h-full bg-indigo-300"
              style={{ width: `${tempPaPerc}%` }}
            ></div>
            <div 
              className="h-full bg-indigo-500"
              style={{ width: `${tempAPerc}%` }}
            ></div>
            <div 
              className="h-full bg-indigo-300"
              style={{ width: `${tempLPerc}%` }}
            ></div>
            <div 
              className="h-full bg-indigo-500"
              style={{ width: `${tempJPerc}%` }}
            ></div>
          </div>
          
          {/* Detalhes por refeição */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Pequeno-Almoço</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{tempPaPerc}%</span>
                  <span className="text-xs text-gray-500">{paCalories} kcal</span>
                </div>
              </div>
              <Slider
                min={5}
                max={40}
                step={1}
                value={[tempPaPerc]}
                onValueChange={(value) => updateMealDistribution('pa', value[0])}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Almoço</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{tempAPerc}%</span>
                  <span className="text-xs text-gray-500">{aCalories} kcal</span>
                </div>
              </div>
              <Slider
                min={10}
                max={50}
                step={1}
                value={[tempAPerc]}
                onValueChange={(value) => updateMealDistribution('a', value[0])}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Lanche</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{tempLPerc}%</span>
                  <span className="text-xs text-gray-500">{lCalories} kcal</span>
                </div>
              </div>
              <Slider
                min={5}
                max={30}
                step={1}
                value={[tempLPerc]}
                onValueChange={(value) => updateMealDistribution('l', value[0])}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Jantar</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{tempJPerc}%</span>
                  <span className="text-xs text-gray-500">{jCalories} kcal</span>
                </div>
              </div>
              <Slider
                min={10}
                max={50}
                step={1}
                value={[tempJPerc]}
                onValueChange={(value) => updateMealDistribution('j', value[0])}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md text-sm flex items-start">
            <Info size={16} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-blue-700">
              A distribuição percentual entre as refeições será ajustada automaticamente para totalizar 100%.
              Isso garante que suas metas calóricas diárias sejam corretamente divididas entre as refeições.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Botão de salvar */}
      <Button onClick={saveSettings} className="w-full">
        <Save size={16} className="mr-2" />
        Salvar Configurações
      </Button>
    </div>
  );
}