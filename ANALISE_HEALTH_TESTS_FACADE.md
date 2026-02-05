# Análise: Health Checks, Testes Unitários e Padrão Facade

## a) Health Checks e Liveness/Readiness

### Status: **Atendido**

| Onde | O que existe |
|------|----------------|
| **nginx.conf** | Três rotas para orquestradores (K8s/Docker): `location /health`, `location /live`, `location /ready`. Todas retornam `200` com corpo `OK`, `access_log off`. |
| **Dockerfile** | `HEALTHCHECK` configurado: intervalo 30s, timeout 3s, start-period 5s, 3 retries. Comando: `wget -q -O /dev/null http://localhost:80/health \|\| exit 1`. |

**Conclusão:** Liveness e Readiness estão cobertos: o Nginx expõe `/health`, `/live` e `/ready`; o container usa `/health` no `HEALTHCHECK`, adequado para Liveness. Para Readiness em Kubernetes, pode-se usar o mesmo endpoint ou apontar para `/ready` no probe `readinessProbe`.

---

## b) Testes unitários

### Status: **Parcialmente atendido**

| Item | Situação |
|------|----------|
| **Facade testado** | `pet.facade.spec.ts` existe e cobre: criação, `loadPets`, emissão de lista/total, `setSearchTerm` + `search`, `setPage`, `totalPages` e uso de `pageCount` da API. |
| **Componente testado** | `pets.component.spec.ts` existe e cobre: criação, `loadPets` no init, `goToPage` → `setPage`, `onSearch` → `search`, e `totalPages` vindo da facade. |
| **Outros testes** | Não há `tutor.facade.spec.ts`, nem specs para demais componentes (tutores, login, registro, home, header, pet-form, pet-detail, tutor-form, tutor-detail, etc.). |
| **Configuração** | `angular.json` define `test` com Karma e `tsconfig.spec.json`. Os schematics estão com `skipTests: true` (component, service, etc.), o que reduz a geração de specs ao criar novos artefatos. |

**Conclusão:** O edital é atendido no mínimo exigido (“1 Facade + 1 Componente”): **PetFacade** e **PetsComponent** estão cobertos. Para melhorar: adicionar testes para **TutorFacade** e para pelo menos um componente de tutores (por exemplo **TutoresComponent**), e considerar remover ou relaxar `skipTests` nos schematics para novos arquivos.

---

## c) Padrão Facade (arquitetura em camadas) e gerenciamento de estado com BehaviorSubject

### Status: **Atendido**

**Camadas identificadas:**

1. **Apresentação (UI)**  
   - Componentes em `pages/` e `components/`: apenas injetam a facade, assinam observables e chamam métodos da facade. Não acessam serviços HTTP nem modelos de API diretamente.

2. **Facade (casos de uso + estado)**  
   - **PetFacade** (`features/pets/facades/pet.facade.ts`): usa `PetService` e `tutorService`; mantém estado em vários `BehaviorSubject` (list, loading, error, total, pageCount, currentPage, selectedPet, saveLoading, deleteLoading); expõe `Observable` via `.asObservable()` e métodos como `loadPets()`, `search()`, `setPage()`, `create()`, `update()`, etc.  
   - **tutoresFacade** (`features/tutores/facades/tutor.facade.ts`): usa `tutoresService`; mesmo padrão com `BehaviorSubject` (list, loading, error, total, currentPage, selectedtutores, tutoresPets, saveLoading, removeFotoLoading, uploadFotoLoading); expõe observables e métodos de listagem, CRUD, link/unlink pet, foto.

3. **Serviços (dados)**  
   - **PetService** e **tutoresService**: apenas chamadas HTTP (get, post, put, delete); retornam `Observable`; sem estado global.  
   - **Core**: `AuthService`, interceptors, models, API constants.

**Gerenciamento de estado com BehaviorSubject:**

- Ambos os facades:
  - Criam `BehaviorSubject` privados para cada “fatia” de estado (lista, loading, erro, total, página, entidade selecionada, etc.).
  - Expõem somente leitura via `readonly x$ = this.xSubject.asObservable()`.
  - Atualizam estado com `.next()` dentro de `tap`/`catchError` dos fluxos que chamam os serviços.
  - Oferecem getters síncronos quando necessário (ex.: `get list()`, `get loading()`).

**Conclusão:** O projeto segue o padrão Facade em camadas (UI → Facade → Service → HTTP) e centraliza o estado reativo nos facades usando **BehaviorSubject**, alinhado ao requisito de “gerenciamento de estado com BehaviorSubject”.

---

## Resumo

| Requisito | Status | Observação |
|-----------|--------|------------|
| **(a) Health Checks e Liveness/Readiness** | Atendido | `/health`, `/live`, `/ready` no nginx; `HEALTHCHECK` no Dockerfile. |
| **(b) Testes unitários** | Parcialmente atendido | 1 Facade (Pet) + 1 Componente (Pets) testados; falta TutorFacade e mais componentes. |
| **(c) Facade + BehaviorSubject** | Atendido | Arquitetura em camadas e estado reativo nos facades com BehaviorSubject. |
