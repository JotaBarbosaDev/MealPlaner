# 🏋️‍♂️ MealPlaner - Gestão de Treinos & Dieta

Uma aplicação web para gerir os seus treinos e plano alimentar. Desenvolvida com React, Tailwind CSS e shadcn/ui, oferecendo uma experiência fluida tanto em computador como em telemóvel.

![Estado](https://img.shields.io/badge/estado-em%20desenvolvimento-green)
![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Telemóvel](https://img.shields.io/badge/telemóvel-pronto-success)

## 📱 Compatibilidade

- ✅ Computador (Windows, macOS, Linux)
- ✅ Telemóvel (Android, iOS)
- ✅ Tablets
- ✅ PWA (em breve)

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

  - Registo detalhado de alimentos
  - Informação nutricional por 100g
  - Calorias, proteínas, hidratos de carbono e gorduras
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
- Percentagem de gordura e massa muscular
- Histórico e gráficos de evolução

## 🚀 Como Começar

### 🌐 Acesso à Aplicação

- URL: [http://mealplaner.marquesserver.freeddns.org:7171/](http://mealplaner.marquesserver.freeddns.org:7171/)
- Horário do Servidor: 07:00 - 00:00 (GMT+1)
  > Nota: O servidor está desligado entre as 00:00 e as 07:00 para otimização energética.

### 📋 Guia de Utilização Detalhado

#### 🥗 Gestão da Dieta

1. **Configurar Metas Nutricionais**

   - Aceda ao separador "Dieta"
   - Em "Gerir Metas":
     - Introduza a sua meta calórica diária
     - Personalize a distribuição por refeição (ex: pequeno-almoço 25%, almoço 35%, etc.)
     - Ajuste as percentagens de macronutrientes (proteínas, hidratos, gorduras)
       > Nota: As percentagens são totalmente personalizáveis de acordo com as suas preferências

2. **Criar Base de Produtos**

   - Em "Gerir Produtos":
     - Adicione produtos com informação nutricional por 100g
     - Inclua calorias, proteínas, hidratos e gorduras
     - Edite ou remova produtos conforme necessário

3. **Criar Pratos**

   - Em "Gerir Pratos":
     - Combine produtos com gramagens específicas
     - O sistema calcula automaticamente os valores nutricionais
     - Crie vários pratos para cada tipo de refeição

4. **Gerir Refeições**
   - Em "Gerir Refeições":
     - Adicione pratos às suas refeições
     - Cada refeição pode ter múltiplos pratos disponíveis
     - Escolha um prato por refeição diariamente
       > Importante: Independentemente do prato escolhido, o total calórico diário mantém-se de acordo com as suas metas

#### 💪 Gestão de Treinos

1. **Configurar Exercícios**

   - No separador "Treino":
     - Adicione novos exercícios
     - Defina séries, repetições e tempo de pausa
     - Organize por grupos musculares

2. **Criar Planos de Treino**

   - Em "Gerir Treinos":
     - Crie treinos específicos (ex: Treino A - Peito)
     - Selecione exercícios para cada treino
     - Defina a ordem dos exercícios

3. **Organizar Semana**

   - Atribua treinos aos dias da semana
   - Os dias sem treino são automaticamente definidos como descanso
   - Possibilidade de múltiplos treinos por dia

4. **Registar Progresso**
   - Na página inicial:
     - Registe os sets de cada treino
     - Acompanhe o peso e repetições
     - Visualize o histórico de progressão
       > Dica: Registe sempre os seus sets para um melhor controlo da progressão de carga

#### ⚖️ Gestão de Peso

- Registe pesagens regularmente
- Acompanhe medidas corporais
- Visualize gráficos de progresso

### 💡 Dicas de Utilização

- Configure primeiro as suas metas antes de criar pratos
- Mantenha uma biblioteca variada de produtos e pratos
- Registe os treinos logo após a sua conclusão
- Faça pesagens sempre nas mesmas condições para maior precisão

## 💾 Armazenamento

Atualmente, todos os dados são guardados localmente no seu dispositivo (localStorage). Em breve, será implementada uma base de dados PostgreSQL para:

- ☁️ Sincronização entre dispositivos
- 🔒 Cópia de segurança dos dados
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

## 🧮 Funcionamento dos Algoritmos

### 🥗 Sistema de Dieta

O sistema de dieta foi desenvolvido para oferecer máxima flexibilidade e precisão no controlo nutricional:

#### 📊 Cálculo de Macronutrientes

- **Base de Cálculo**: Todos os valores nutricionais são calculados por 100g de produto
- **Fórmula de Proporção**: `valor_final = (gramas_utilizadas * valor_por_100g) / 100`
- **Precisão**: Valores arredondados a 1 casa decimal para maior exatidão

#### 🎯 Sistema de Metas

1. **Distribuição Calórica Personalizada**

   - Definição flexível de calorias diárias totais
   - Objetivos personalizáveis para diferentes fases:
     ```
     Cutting (Perda de Peso)
     Bulking (Ganho de Massa)
     Manutenção
     ```
   - Distribuição percentual personalizável por refeição
   - Ajuste livre das percentagens de acordo com as preferências e rotina do utilizador
   - Exemplo de distribuição (totalmente configurável):
     ```
     Pequeno-Almoço: 25%
     Almoço: 35%
     Lanche: 15%
     Jantar: 25%
     ```

2. **Distribuição de Macronutrientes Flexível**

   - Percentagens ajustáveis para cada macronutriente:
     - Proteínas
     - Hidratos de Carbono
     - Gorduras
   - Cálculo automático baseado nas preferências do utilizador
   - Adaptável a diferentes estratégias nutricionais:
     - Baixo em Hidratos
     - Alto em Proteína
     - Equilibrado
     - Personalizado

3. **Validação de Macros**

   - Verificação automática se os pratos atingem as metas
   - Alertas visuais quando há discrepância
   - Sugestões de ajuste baseadas nos desvios

4. **Sistema de Pratos**
   - Cada prato é uma combinação de produtos com gramagens específicas
   - Cálculo automático dos totais:
     ```typescript
     totalCalorias = Σ((produto.calorias * produto.gramas) / 100);
     totalProteinas = Σ((produto.proteinas * produto.gramas) / 100);
     totalHidratos = Σ((produto.hidratos * produto.gramas) / 100);
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
     interface DadosCache {
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
   - Cópia de segurança automática a cada modificação
   - Sistema de recuperação em caso de erro

### 🔐 Validações e Segurança

1. **Validação de Dados**

   - Verificação de valores impossíveis/irreais
   - Prevenção de erros de introdução
   - Sanitização de dados

2. **Proteção de Dados**
   - Encriptação básica no localStorage
   - Verificação de integridade
   - Sistema de cópia de segurança automática

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
- Opiniões e sugestões são bem-vindas
- Dados são guardados apenas localmente por enquanto
- Faça cópias de segurança regulares dos seus dados

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:

- 🐛 Reportar problemas
- 💡 Sugerir novas funcionalidades
- 🔧 Submeter alterações

## 📜 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).
