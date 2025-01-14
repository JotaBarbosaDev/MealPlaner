# 🏋️‍♂️ MealPlaner - Gestão de Treinos & Dieta

Uma aplicação web moderna e responsiva para gerir os seus treinos e plano alimentar. Desenvolvida com React, Tailwind CSS e shadcn/ui, oferecendo uma experiência fluida tanto em dispositivos móveis como em desktop.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-green)
![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Mobile](https://img.shields.io/badge/mobile-ready-success)

## 📱 Compatibilidade

- ✅ Desktop (Windows, macOS, Linux)
- ✅ Mobile (Android, iOS)
- ✅ Tablets
- ✅ PWA Ready (em breve)

## 🌟 Funcionalidades

### 💪 Treinos

- **Gestão de Exercícios**

  - Criar, editar e remover exercícios
  - Definir séries, repetições e tempo de pausa
  - Visualização expandida/minimizada dos detalhes
  - Interface intuitiva com ícones e feedback visual

- **Planos de Treino**

  - Criar treinos personalizados (ex: Treino A - Peito e Tríceps)
  - Selecionar exercícios para cada treino
  - Organizar treinos por dia da semana
  - Visualização clara do plano semanal

- **Registo de Progresso**
  - Registar séries e pesos para cada exercício
  - Histórico de treinos por data
  - Acompanhamento da evolução
  - Comparação com treinos anteriores

### 🥗 Dieta

- **Gestão de Produtos**

  - Cadastro detalhado de alimentos
  - Informação nutricional por 100g
  - Calorias, proteínas, carboidratos e gorduras
  - Edição e remoção de produtos

- **Planos de Refeição**

  - Criar e personalizar refeições
  - Adicionar produtos com quantidades específicas
  - Cálculo automático de macronutrientes
  - Distribuição por refeição (pequeno-almoço, almoço, etc.)

- **Metas Nutricionais**
  - Definir objetivos calóricos
  - Distribuição de macronutrientes
  - Acompanhamento diário
  - Visualização do progresso

### ⚖️ Pesagens

- Registo de medidas corporais
- Acompanhamento do peso
- Percentual de gordura e massa muscular
- Histórico e gráficos de evolução

## 🚀 Como Começar

1. Aceda à aplicação através do seu navegador
2. Comece por configurar seus exercícios na aba "Treino"
3. Crie seus planos de treino e organize-os na semana
4. Configure seus produtos e refeições na aba "Dieta"
5. Registe suas pesagens para acompanhar o progresso

## 💾 Armazenamento

Atualmente, todos os dados são armazenados localmente no seu dispositivo (localStorage). Em breve, será implementada uma base de dados PostgreSQL para:

- ☁️ Sincronização entre dispositivos
- 🔒 Backup seguro dos dados
- 👥 Perfis de utilizador
- 📊 Análises avançadas

## 🎨 Interface

- Design moderno e minimalista
- Cores suaves e agradáveis
- Ícones intuitivos
- Feedback visual em todas as ações
- Animações suaves
- Modo claro/escuro (em breve)

## 🛠️ Tecnologias

- ⚛️ React
- 🎨 Tailwind CSS
- 🎯 shadcn/ui
- 📱 Design Responsivo
- 🔄 LocalStorage (temporário)
- 🐘 PostgreSQL (em breve)

## 🔜 Próximas Funcionalidades

- [ ] Base de dados PostgreSQL
- [ ] Autenticação de utilizadores
- [ ] Modo escuro
- [ ] Versão PWA
- [ ] Gráficos de progresso
- [ ] Exportação de dados
- [ ] Partilha de planos
- [ ] Notificações

## 📝 Notas

- A aplicação está em constante desenvolvimento
- Feedback e sugestões são bem-vindos
- Dados são armazenados apenas localmente por enquanto
- Faça backup regular dos seus dados

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:

- 🐛 Reportar bugs
- 💡 Sugerir novas funcionalidades
- 🔧 Submeter pull requests

## 📜 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 🧮 Funcionamento dos Algoritmos

### 🥗 Sistema de Dieta

O sistema de dieta foi desenvolvido para oferecer máxima flexibilidade e precisão no controlo nutricional:

#### 📊 Cálculo de Macronutrientes

- **Base de Cálculo**: Todos os valores nutricionais são calculados por 100g de produto
- **Fórmula de Proporção**: `valor_final = (gramas_utilizadas * valor_por_100g) / 100`
- **Precisão**: Valores arredondados a 1 casa decimal para maior exatidão

#### 🎯 Sistema de Metas

1. **Distribuição Calórica**

   - Definição de calorias diárias totais
   - Distribuição percentual por refeição:
     ```
     Pequeno-Almoço: 25%
     Almoço: 35%
     Lanche: 15%
     Jantar: 25%
     ```

2. **Validação de Macros**

   - Verificação automática se os pratos atingem as metas
   - Alertas visuais quando há discrepância
   - Sugestões de ajuste baseadas nos desvios

3. **Sistema de Pratos**
   - Cada prato é uma combinação de produtos com gramagens específicas
   - Cálculo automático dos totais:
     ```typescript
     totalCalorias = Σ((produto.calorias * produto.gramas) / 100);
     totalProteinas = Σ((produto.proteinas * produto.gramas) / 100);
     totalCarboidratos = Σ((produto.carboidratos * produto.gramas) / 100);
     totalGorduras = Σ((produto.gorduras * produto.gramas) / 100);
     ```

### 💪 Sistema de Treino

O sistema de treino foi projetado para maximizar o acompanhamento e progressão:

#### 📈 Progressão de Treino

1. **Registo de Séries**

   - Armazenamento de cada série com:
     ```typescript
     interface Serie {
       repeticoes: number;
       peso: number;
       data: string;
     }
     ```
   - Histórico completo por exercício
   - Comparação com treinos anteriores

2. **Organização Semanal**

   - Sistema flexível de planeamento
   - Possibilidade de múltiplos treinos por dia
   - Rotação automática do plano semanal

3. **Validação de Volume**
   - Cálculo de volume total: `volume = series * repeticoes * peso`
   - Acompanhamento de progressão semanal
   - Alertas de sobrecarga ou estagnação

#### 🔄 Sistema de Progressão

1. **Análise de Desempenho**

   ```typescript
   interface Progresso {
     volumeAnterior: number;
     volumeAtual: number;
     variacaoPercentual: number;
   }
   ```

2. **Métricas de Evolução**
   - Comparação automática com últimas sessões
   - Cálculo de tendências de progressão
   - Sugestões de ajuste de carga

### 📱 Sincronização Local

1. **Sistema de Cache**

   - Armazenamento eficiente em localStorage
   - Estrutura de dados otimizada:
     ```typescript
     interface CacheData {
       versao: string;
       ultimaAtualizacao: string;
       dados: {
         treinos: Treino[];
         dieta: PlanoDieta;
         progresso: Progresso[];
       };
     }
     ```

2. **Gestão de Dados**
   - Compressão automática de histórico antigo
   - Backup automático a cada modificação
   - Sistema de recuperação em caso de erro

### 🔐 Validações e Segurança

1. **Validação de Dados**

   - Verificação de valores impossíveis/irreais
   - Prevenção de erros de input
   - Sanitização de dados

2. **Proteção de Dados**
   - Encriptação básica no localStorage
   - Verificação de integridade
   - Sistema de backup automático
