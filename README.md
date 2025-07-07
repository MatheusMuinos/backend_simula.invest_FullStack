# Backend Simula.Invest 📈

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-5.1.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![Jest](https://img.shields.io/badge/Jest-Testing-red)

API RESTful para simulação de investimentos financeiros, permitindo aos usuários criar e gerenciar simulações de ações e renda fixa.

## 🎯 Funcionalidades

- **Autenticação de Usuários**: Sistema completo de registro e login com JWT
- **Simulações de Investimentos**: 
  - Ações com valor variável
  - Renda fixa com taxa de retorno
- **Gestão de Simulações**: CRUD completo (criar, listar, editar, deletar)
- **Validação de Dados**: Validação robusta de entrada
- **Documentação API**: Swagger UI integrado
- **Testes**: Cobertura completa com testes unitários e de integração

## 🛠️ Tecnologias

- **Backend**: Node.js, Express.js
- **Banco de Dados**: PostgreSQL com Sequelize ORM
- **Autenticação**: JWT (JSON Web Tokens)
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest, Supertest
- **Containerização**: Docker, Docker Compose
- **Deploy**: Vercel

## 📁 Estrutura do Projeto

```
src/
├── config/           # Configurações do banco de dados
├── controller/       # Controladores das rotas
├── middlewares/      # Middlewares (autenticação JWT)
├── models/          # Modelos do Sequelize
├── routes/          # Definição das rotas e documentação Swagger
├── services/        # Lógica de negócio
└── testes/          # Testes unitários e de integração
```

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 18.x ou superior
- Docker e Docker Compose
- PostgreSQL (opcional se usar Docker)

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd backend_simula.invest_FullStack
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=simula_invest
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# JWT
JWT_SECRET=sua_chave_secreta_jwt

# PgAdmin
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin
```

### 4. Iniciar o banco de dados

```bash
npm run start:database
```

### 5. Iniciar a aplicação

```bash
npm run start:app
```

A API estará disponível em `http://localhost:3000`

## 📊 Endpoints da API

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/register` | Registrar novo usuário |
| POST | `/login` | Fazer login |

### Simulações (Requer autenticação)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/log-Simulation` | Criar nova simulação |
| GET | `/get-Simulations` | Listar simulações do usuário |
| DELETE | `/delete-Simulations` | Deletar simulação |
| PATCH | `/patch-Simulation` | Atualizar simulação |

## 📝 Exemplos de Uso

### Registrar usuário

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Criar simulação de ação

```bash
curl -X POST http://localhost:3000/log-Simulation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tipo": "acao",
    "nome": "PETR4",
    "valor": 25.50,
    "invest_inicial": 1000,
    "invest_mensal": 200,
    "meses": 12,
    "inflacao": 0.05
  }'
```

### Criar simulação de renda fixa

```bash
curl -X POST http://localhost:3000/log-Simulation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tipo": "renda-fixa",
    "nome": "CDB Banco XYZ",
    "invest_inicial": 5000,
    "invest_mensal": 500,
    "meses": 24,
    "inflacao": 0.04
  }'
```

## 🧪 Testes

### Executar todos os testes

```bash
npm test
```

### Executar apenas testes unitários

```bash
npm run test:unit
```

### Executar apenas testes de integração

```bash
npm run test:integration
```

## 📚 Documentação da API

Acesse a documentação interativa do Swagger em:
`http://localhost:3000/api-docs`

## 🐳 Docker

### Iniciar apenas o banco de dados

```bash
npm run start:database
```

### Parar o banco de dados

```bash
npm run stop:database
```

### Acessar PgAdmin

Após iniciar o banco, acesse: `http://localhost:5050`
- Email: valor definido em `PGADMIN_DEFAULT_EMAIL`
- Senha: valor definido em `PGADMIN_DEFAULT_PASSWORD`

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run start:app` | Inicia a aplicação em modo desenvolvimento |
| `npm run start:database` | Inicia o PostgreSQL via Docker |
| `npm run stop:database` | Para o PostgreSQL |
| `npm run generate-secret-key` | Gera uma chave secreta para JWT |
| `npm test` | Executa todos os testes com cobertura |
| `npm run test:unit` | Executa apenas testes unitários |
| `npm run test:integration` | Executa apenas testes de integração |

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas:

- **Routes**: Definição de endpoints e documentação Swagger
- **Controllers**: Recebem requisições e devolvem respostas
- **Services**: Contêm a lógica de negócio
- **Models**: Definição dos modelos de dados
- **Middlewares**: Interceptam requisições (autenticação, validação)

## 🔒 Segurança

- Autenticação via JWT
- Validação de entrada em todos os endpoints
- Proteção CORS configurada
- Senhas hasheadas com bcrypt
- Validação de propriedade de recursos (usuário só acessa suas simulações)

## 🌐 Deploy

A aplicação está configurada para deploy na Vercel. O arquivo `vercel.json` contém as configurações necessárias.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 👥 Autores

Atividade avaliativa Final - Backend Simula Invest

---

**Simula.Invest** - Simule seus investimentos com facilidade! 🚀

