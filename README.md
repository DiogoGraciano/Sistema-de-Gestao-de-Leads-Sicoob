# Harmonika Games - Sistema de Gestão de Leads

Sistema web para gerenciamento de leads de jogos interativos, desenvolvido para o Sicoob. A aplicação permite visualizar, filtrar, exportar e gerenciar leads coletados através de diferentes jogos promocionais.

## 🚀 Funcionalidades

### Autenticação e Segurança
- Login seguro com Firebase Authentication
- Controle de acesso baseado em usuários autenticados
- Sistema de logs para auditoria de ações

### Gestão de Leads
- **Visualização de Leads**: Lista completa de leads com informações detalhadas
- **Filtros Avançados**: Filtro por jogo, plataforma, resultado, autorização de contato e período
- **Busca**: Pesquisa por nome, email, jogo ou plataforma
- **Seleção Múltipla**: Seleção e exclusão em lote de leads
- **Visualização Detalhada**: Modal com informações completas do lead

### Coleções de Dados
- **Palavras Embaralhadas v1**: Coleção de leads do jogo de palavras
- **Palavras Embaralhadas v2**: Segunda versão do jogo
- **Quiz v1**: Coleção de leads do jogo de quiz
- Troca dinâmica entre coleções

### Exportação de Dados
- **Formatos**: CSV e XLSX
- **Campos Personalizáveis**: Seleção de quais campos incluir na exportação
- **Filtros de Data**: Exportação com filtro por período
- **Dados Descriptografados**: Exportação com dados legíveis

### Sistema de Logs
- **Auditoria Completa**: Registro de todas as ações do usuário
- **Tipos de Ação**: Login, logout, exportação, exclusão, visualização, filtros
- **Filtros de Log**: Filtro por tipo de ação, usuário e período
- **Detalhes**: Informações detalhadas sobre cada ação realizada

### Estatísticas
- Total de leads
- Leads que ganharam/perderam
- Autorizações de contato
- Distribuição por plataforma
- Distribuição por jogo

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19.1.1** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS 4.1.12** - Framework de estilização
- **Lucide React** - Ícones

### Backend e Serviços
- **Firebase** - Autenticação e banco de dados
- **Firestore** - Banco de dados NoSQL
- **Firebase Auth** - Sistema de autenticação

### Utilitários
- **clsx** - Utilitário para classes CSS condicionais
- **Headless UI** - Componentes acessíveis

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta Firebase configurada

### Passos para Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd sicoob
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
   - Copie o arquivo `.env.exemple` para `.env`:
   ```bash
   cp .env.exemple .env
   ```
   - Abra o arquivo `.env` e preencha com suas credenciais:
     - **Firebase Configuration**: Obtenha essas informações no [Firebase Console](https://console.firebase.google.com)
       - Vá em Configurações do Projeto > Configurações Gerais > Seus apps
       - Copie as credenciais do Firebase para o arquivo `.env`
     - **Chave de Criptografia**: Use a mesma chave usada no sistema Unity para descriptografar os dados
   
   **⚠️ IMPORTANTE**: 
   - Nunca commite o arquivo `.env` no repositório
   - O arquivo `.env` já está no `.gitignore` para sua segurança
   - Mantenha suas credenciais seguras e não as compartilhe

4. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com)
   - Configure o Firestore Database
   - Configure o Authentication (Email/Password)

5. **Execute o projeto**
```bash
npm run dev
```

6. **Acesse a aplicação**
   - Abra [http://localhost:5173](http://localhost:5173) no navegador

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Gera build de produção
npm run preview      # Visualiza build de produção

# Linting
npm run lint         # Executa verificação de código
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes de interface reutilizáveis
│   ├── LeadsList.tsx   # Lista principal de leads
│   ├── LeadView.tsx    # Visualização detalhada do lead
│   ├── LoginForm.tsx   # Formulário de login
│   └── LogsList.tsx    # Lista de logs do sistema
├── config/
│   └── firebase.ts     # Configuração do Firebase
├── services/           # Serviços de negócio
│   ├── authService.ts  # Serviço de autenticação
│   ├── leadService.ts  # Serviço de gestão de leads
│   ├── logService.ts   # Serviço de logs
│   └── decryptService.ts # Serviço de descriptografia
├── types/
│   └── lead.ts         # Definições de tipos TypeScript
├── utils/              # Utilitários
│   ├── dateUtils.ts    # Funções de data
│   └── exportUtils.ts  # Funções de exportação
├── App.tsx             # Componente principal
└── main.tsx           # Ponto de entrada da aplicação
```

## 🔐 Configuração do Firebase

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita apenas para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Estrutura das Coleções
- `leads_word_scramble_001` - Leads do jogo Palavras Embaralhadas v1
- `leads_word_scramble_002` - Leads do jogo Palavras Embaralhadas v2
- `leads_quiz_001` - Leads do jogo Quiz v1
- `system_logs` - Logs do sistema

## 📊 Estrutura dos Dados

### Lead
```typescript
interface Lead {
  id: string;
  autorizoContato: string;    // "Sim" ou "Não"
  custom1: string;            // Campo para Cooperativa
  dataHora: string;           // Data e hora do lead
  email: string;              // Email do usuário
  encrypted: string;          // Dados criptografados
  game_name: string;          // Nome do jogo
  ganhou: string;             // "Sim" ou "Não"
  nome: string;               // Nome do usuário
  platform: string;           // Plataforma (web, mobile, etc.)
  tempo: string;              // Tempo de jogo
  unique_timestamp: string;   // Timestamp único
}
```

### System Log
```typescript
interface SystemLog {
  id: string;
  userId: string;             // ID do usuário
  userEmail: string;          // Email do usuário
  action: string;             // Descrição da ação
  actionType: string;         // Tipo da ação
  details?: string;           // Detalhes adicionais
  timestamp: number;          // Timestamp da ação
  dateTime: string;           // Data/hora formatada
  collection?: string;        // Coleção afetada
}
```

## 🎨 Interface do Usuário

### Design System
- **Cores**: Gradiente laranja/vermelho para elementos principais
- **Tipografia**: Sistema de fontes responsivo
- **Componentes**: Design consistente com Tailwind CSS
- **Responsividade**: Interface adaptável para diferentes tamanhos de tela

### Componentes Principais
- **Tabela de Leads**: Visualização em tabela com paginação
- **Painel de Filtros**: Filtros avançados colapsáveis
- **Modais**: Visualização detalhada e confirmações
- **Formulários**: Inputs estilizados e acessíveis

## 🔒 Segurança

### Criptografia
- Dados sensíveis são criptografados antes do armazenamento
- Sistema de descriptografia automática para visualização
- Chaves de criptografia gerenciadas de forma segura

### Autenticação
- Login obrigatório para acesso
- Sessões gerenciadas pelo Firebase Auth
- Logout automático em caso de inatividade

### Auditoria
- Log completo de todas as ações
- Rastreabilidade de alterações
- Controle de acesso por usuário

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Arquivos de Deploy
Os arquivos gerados estarão na pasta `dist/` e podem ser servidos por qualquer servidor web estático.

### Configuração do Servidor
- Configure o servidor para servir arquivos estáticos da pasta `dist/`
- Configure redirecionamento para `index.html` para SPA
- Configure HTTPS para produção

## 📝 Licença

Este projeto é propriedade do Sicoob e destinado ao uso interno.

## 🤝 Contribuição

Para contribuições, entre em contato com a equipe de desenvolvimento.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato com a equipe responsável.