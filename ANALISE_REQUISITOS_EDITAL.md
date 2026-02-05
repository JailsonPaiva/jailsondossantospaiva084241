# Análise de Requisitos – Edital Registro Público de Pets e tutores

## Status por Fase

### ✅ Fase 1: Setup & Dockerização (Sênior Requirement)
| Item | Status |
|------|--------|
| Projeto Angular + TypeScript (strict) | ✅ `tsconfig.json` strict: true |
| Tailwind CSS | ✅ tailwind.config.js, postcss, styles |
| Dockerfile multi-stage (build + nginx) | ✅ |
| nginx.conf (SPA + health) | ✅ location /health, /live, /ready |
| Health-check (Liveness/Readiness) | ✅ HEALTHCHECK no Dockerfile → `/health` |

---

### ✅ Fase 2: Camada Core, Auth & HTTP
| Item | Status |
|------|--------|
| HttpClient | ✅ Angular provideHttpClient |
| Interceptor (token no header) | ✅ auth.interceptor.ts |
| **Interceptor Refresh Token (PUT /autenticacao/refresh)** | ✅ Implementado – em 401 tenta refresh, depois retry da request; sem refresh token faz logout |
| AuthService POST /autenticacao/login | ✅ |

---

### ✅ Fase 3: Arquitetura Base (Lazy Loading & Layout)
| Item | Status |
|------|--------|
| Roteamento Lazy Loading (Pets, tutores) | ✅ loadComponent em app.routes |
| Layout Header | ✅ components/header |
| Menu | ✅ Links no header (Início, Pets, tutores) |

---

### ✅ Fase 4: Módulo Pets – Listagem (Public View)
| Item | Status |
|------|--------|
| PetService + PetFacade (BehaviorSubject) | ✅ |
| Grid de Cards (Foto, Nome, Espécie) | ✅ Espécie no model e no card (fallback raça) |
| Paginação 10 itens (server-side) | ✅ total$ + currentPage$ + setPage() no facade; mesma lógica em tutores |
| Busca por nome | ✅ |
| GET /v1/pets | ✅ |

---

### ✅ Fase 5: Módulo Pets – Detalhes e Gestão
| Item | Status |
|------|--------|
| Rotas /pets/:id, /pets/novo, /pets/:id/editar | ✅ |
| Tela de Detalhes GET /v1/pets/{id} + dados do tutores | ✅ PetDetailComponent, selectedPet$, tutores no model |
| Formulário Cadastro/Edição (POST/PUT) | ✅ PetFormComponent, PetFacade.create/update |
| Upload de foto (POST …/fotos) | ✅ PetFacade.uploadPhoto, POST /v1/pets/:id/fotos |

---

### ✅ Fase 6: Módulo tutores – Gestão Complexa
| Item | Status |
|------|--------|
| CRUD tutores (Nome, Telefone, Endereço, etc.) | ✅ tutoresService create/update/delete, tutoresFormComponent |
| Listar pets do tutores | ✅ GET /v1/tutores/:id/pets, tutoresPets$ no tutoresFacade |
| Vincular (POST) / Desvincular (DELETE) | ✅ linkPet, unlinkPet no facade e tutoresDetailComponent |
| Atualizar UI via BehaviorSubject após ações | ✅ tutoresPetsSubject atualizado após link/unlink |
| Rotas /tutores/novo, /tutores/:id, /tutores/:id/editar | ✅ |

---

### ✅ Fase 7: Qualidade e Testes (Sênior Requirement)
| Item | Status |
|------|--------|
| Testes unitários (Jasmine) – 1 Facade + 1 Componente | ✅ pet.facade.spec.ts, pets.component.spec.ts |
| Test target (angular.json) | ✅ karma + zone.js/testing |
| Clean Code / Linting | ⚠️ Revisão opcional |

---

## Ordem sugerida de implementação (ciclos)

1. ~~**Fase 2 (complemento):** Refresh Token no interceptor.~~ ✅ Feito.
2. **Fase 4 (ajuste):** Paginação server-side na listagem de Pets (e tutores) + Espécie no card se a API expuser.
3. **Fase 5:** Rotas, detalhes, formulário e upload de foto de Pets.
4. **Fase 6:** CRUD tutores + vinculação/desvinculação de pets.
5. **Fase 7:** Testes unitários + lint.

---

*Documento gerado para acompanhamento do processo seletivo. Não commitar como entrega final; usar para guiar os ciclos.*
