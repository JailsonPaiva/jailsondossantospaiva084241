# PeTrack MT — Registro Público de Pets e Tutores

Frontend do sistema de cadastro e gerenciamento de animais de estimação e tutores (Estado de Mato Grosso).

## Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **Angular 21** | Framework SPA, rotas, formulários reativos |
| **TypeScript 5.9** | Linguagem |
| **RxJS 7** | Requisições HTTP e estado reativo |
| **Tailwind CSS** | Estilos e layout responsivo |
| **Lucide Angular** | Ícones |
| **Karma + Jasmine** | Testes unitários |
| **Node 22** | Build (Docker) |
| **Nginx** | Servir o build em produção (Docker) |

A API consumida está configurada em `src/app/core/api/api.constants.ts`.

---

## O que foi feito

- **Página Início** acessível sem login: usuários não cadastrados podem ver a home (hero, estatísticas, funcionalidades, CTA).
- **Pets Recentes** na home: exibição dos últimos 4 pets do endpoint de listagem (somente quando o usuário está logado).
- **CRUD de Pets**: listagem paginada, busca por nome, cadastro, edição, exclusão e upload de foto.
- **CRUD de Tutores**: listagem, cadastro, edição e vínculo/desvínculo de pets.
- **Autenticação**: login, registro de conta, refresh de token e interceptor para envio do token nas requisições.
- **Layout**: header responsivo, toasts e rotas com lazy loading.

## O que pode melhorar

- **Guards de rota**: proteger rotas como `/pets` e `/tutores` com guard de autenticação, redirecionando não logados para `/login`; manter apenas `/`, `/inicio`, `/login` e `/registro` públicas.
- **Testes**: ampliar testes unitários (componentes e facades) e adicionar testes e2e para fluxos críticos (login, listagem, cadastro de pet).
- **Tratamento de erros**: mensagens mais claras por tipo de erro (rede, 403, 404) e retry em falhas temporárias.
- **Acessibilidade**: revisar labels, contraste e navegação por teclado (especialmente no header e formulários).
- **SEO e meta tags**: título e descrição por rota para melhor indexação da página Início.
- **Ordenação “mais recentes”**: se a API não ordenar por data de cadastro, solicitar parâmetro de ordenação ou tratar no front (ex.: ordenar por `id` desc) para garantir que “Pets Recentes” seja realmente os últimos cadastrados.

---

## Como rodar

### Local (desenvolvimento)

Requisitos: **Node.js** (recomendado LTS) e **npm**.

```bash
npm install
npm start
```

Ou com o CLI do Angular:

```bash
npm install
ng serve
```

Acesse **http://localhost:4200/**.

### Docker

Requisitos: **Docker** e **Docker Compose**.

**Com Docker Compose (recomendado):**

```bash
docker compose up --build
```

- Aplicação: **http://localhost:8080**
- Health check: **http://localhost:8080/health**

**Apenas com Docker:**

```bash
docker build -t seletivo-frontend .
docker run -p 8080:80 seletivo-frontend
```

A imagem faz build da aplicação Angular e serve os arquivos estáticos com Nginx. Detalhes em [DOCKER.md](./DOCKER.md).

---

## Testes

```bash
npm test
```

Ou:

```bash
ng test
```

Os testes rodam com **Karma** e **Jasmine** (navegador). Para rodar uma vez e sair (útil em CI), use a configuração do projeto em `angular.json` (por exemplo `ng test --no-watch` se disponível).

---

## Build e deploy

**Build de produção:**

```bash
npm run build
```

Os arquivos ficam em `dist/seletivo-frontend/browser/`.

**Deploy:**

- **Opção 1 – Imagem Docker:** faça o build da imagem (`docker build -t seletivo-frontend .`), envie para um registro (Docker Hub, ECR, GCR, etc.) e execute o container na sua plataforma (Kubernetes, ECS, App Service, etc.). A app escuta na porta 80; use `/health`, `/live` e `/ready` para health checks.
- **Opção 2 – Hospedagem estática:** faça `npm run build` e envie o conteúdo de `dist/seletivo-frontend/browser/` para um serviço de arquivos estáticos (Vercel, Netlify, S3 + CloudFront, Firebase Hosting, GitHub Pages, etc.). Configure o servidor para redirecionar todas as rotas para `index.html` (SPA).

A URL da API é fixa no build; para trocar por ambiente (ex.: variável de ambiente), é necessário usar arquivos de environment ou substituição em tempo de build.

---

## Recursos

- [Angular CLI](https://angular.dev/tools/cli)
- [Angular Router](https://angular.dev/guide/routing)
