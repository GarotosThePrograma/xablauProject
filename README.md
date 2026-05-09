# Xablau Project

Projeto full stack de e-commerce desenvolvido para praticar front-end, back-end, banco de dados e fluxo de compra. A aplicacao tem area de usuario, catalogo de produtos, carrinho, finalizacao de pedido e um painel administrativo para gerenciar produtos e acompanhar pedidos.

## Tecnologias utilizadas

### Front-end

- React 19
- Vite
- React Router
- Zustand para gerenciamento de estado
- Chakra UI
- Tailwind CSS
- React Hook Form
- Zod

### Back-end

- ASP.NET Core
- .NET 10
- Entity Framework Core
- PostgreSQL
- Npgsql
- Migrations do EF Core

## Estrutura do projeto

```text
xablauProject/
|-- xablauBack/
|   |-- xablauBack.API/             # API ASP.NET Core, controllers e Program.cs
|   |-- xablauBack.Application/     # contratos e servicos da aplicacao
|   |-- xablauBack.Domain/          # entidades do dominio
|   `-- xablauBack.Infrastructure/  # DbContext, migrations e seed do banco
|-- xablauFront/
|   |-- src/
|   |   |-- components/             # componentes reutilizaveis
|   |   |-- layouts/                # layouts de usuario e admin
|   |   |-- pages/                  # telas da aplicacao
|   |   |-- routes/                 # rotas do React Router
|   |   |-- services/               # chamadas para API
|   |   `-- store/                  # stores Zustand
|   `-- package.json
`-- README.md
```

## Funcionalidades

- Cadastro e login de usuarios.
- Listagem de produtos.
- Pagina de detalhes do produto.
- Favoritos.
- Carrinho integrado com o back-end.
- Validacao de estoque ao adicionar ou finalizar compra.
- Finalizacao de pedido com frete, pagamento, cupom e parcelas.
- Historico de pedidos do usuario.
- Painel admin para cadastrar, editar e remover produtos.
- Painel admin para consultar pedidos e atualizar status.
- Cupons e secoes da home salvos no `localStorage` do navegador.

## Pre-requisitos

- Node.js instalado.
- npm instalado.
- .NET SDK 10 instalado.
- PostgreSQL local ou banco PostgreSQL hospedado, como Neon.

## Configuracao do back-end

Crie o arquivo `xablauBack/xablauBack.API/appsettings.json` com a connection string do seu banco. Esse arquivo fica no `.gitignore` porque contem dados sensiveis.

Exemplo:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=xablau;Username=postgres;Password=sua_senha;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

Depois rode a API:

```bash
cd xablauBack
dotnet restore
dotnet run --project xablauBack.API
```

Por padrao, a API sobe em:

```text
http://localhost:5002
https://localhost:7070
```

Ao iniciar, a API executa as migrations e popula o banco com produtos iniciais caso a tabela esteja vazia.

## Configuracao do front-end

Em outro terminal:

```bash
cd xablauFront
npm install
npm run dev
```

O Vite deve abrir a aplicacao em:

```text
http://localhost:5173
```

O front-end esta configurado para chamar a API em:

```text
http://localhost:5002/api
```

## Como testar

1. Inicie o back-end com `dotnet run --project xablauBack.API`.
2. Inicie o front-end com `npm run dev`.
3. Acesse `http://localhost:5173`.
4. Cadastre um usuario pela tela de registro.
5. Faca login com o usuario cadastrado.
6. Abra um produto e adicione ao carrinho.
7. Altere quantidades, remova itens ou finalize a compra.
8. Acesse a pagina de pedidos para verificar o historico.
9. Acesse o painel admin para testar cadastro, edicao e remocao de produtos.

No estado atual do projeto, o login do admin e uma autenticacao de demonstracao feita no front-end, dentro de `xablauFront/src/store/useAdminAuthStore.js`. Antes de usar em producao, essa autenticacao deve ser movida para o back-end.

## Principais rotas da API

### Autenticacao

```text
POST /api/auth/register
POST /api/auth/login
```

### Produtos

```text
GET    /api/produtos
GET    /api/produtos/{id}
POST   /api/produtos
PATCH  /api/produtos/{id}
PATCH  /api/produtos/{id}/estoque
DELETE /api/produtos/{id}
```

### Carrinho

```text
GET    /api/carrinho/{usuarioId}
POST   /api/carrinho/{usuarioId}/itens
PUT    /api/carrinho/{usuarioId}/itens/{produtoId}
DELETE /api/carrinho/{usuarioId}/itens/{produtoId}
DELETE /api/carrinho/{usuarioId}/itens
POST   /api/carrinho/{usuarioId}/finalizar
```

### Pedidos

```text
GET   /api/pedidos
GET   /api/pedidos/usuario/{usuarioId}
PATCH /api/pedidos/{pedidoId}/status
```

## Scripts do front-end

```bash
npm run dev      # inicia o ambiente de desenvolvimento
npm run build    # gera build de producao
npm run preview  # pre-visualiza a build
npm run lint     # roda o ESLint
```

## Observacoes de seguranca

- Nao publique `appsettings.json` com connection string real.
- Se uma senha de banco ja foi commitada alguma vez, troque essa senha no provedor do banco antes de publicar o repositorio.
- O login admin atual e apenas para estudo/demonstracao. Em um projeto real, ele deve ser validado pelo back-end, com senha criptografada e sessao/token seguro.
- Evite salvar tokens, senhas ou chaves de API diretamente no front-end ou no repositorio.

## Status do projeto

Projeto em desenvolvimento para fins de estudo e pratica. Algumas regras e validacoes ja estao no back-end, enquanto algumas funcionalidades administrativas auxiliares ainda usam estado local no navegador.
