# Configuração Docker – Verificação e Uso

## Resumo da verificação

| Item | Status | Observação |
|------|--------|------------|
| **Dockerfile multi-stage** | ✅ | Stage 1: Node 22 Alpine (build). Stage 2: Nginx 1.27 Alpine (runtime). |
| **Caminho do build Angular** | ✅ | `COPY --from=build /app/dist/seletivo-frontend/browser` compatível com `angular.json` (projeto `seletivo-frontend`, output padrão `dist/.../browser`). |
| **nginx.conf** | ✅ | Copiado para `/etc/nginx/conf.d/default.conf`. SPA (`try_files` → `index.html`), `/health`, `/live`, `/ready`, gzip e cache de assets. |
| **HEALTHCHECK** | ✅ | Usa `wget` em `/health`. `wget` instalado no stage runtime (`apk add --no-cache wget`), pois não vem na imagem `nginx:alpine`. |
| **.dockerignore** | ✅ | Exclui `node_modules`, `dist`, `.angular`, `.git`, `*.spec.ts`, `coverage`, etc., reduzindo contexto de build. |
| **Porta** | ✅ | `EXPOSE 80`; no `docker-compose` mapeada para `8080`. |

---

## Como usar

### Build e execução com Docker

```bash
# Build da imagem
docker build -t seletivo-frontend .

# Executar (app em http://localhost:8080)
docker run -p 8080:80 seletivo-frontend
```

### Com Docker Compose

```bash
# Build e subir
docker compose up --build

# App: http://localhost:8080
# Health: http://localhost:8080/health
```

### API em produção

A aplicação usa a URL da API definida em `src/app/core/api/api.constants.ts` (`API_BASE_URL`). No build em Docker ela é fixa (ex.: `https://pet-manager-api.geia.vip`). Para alterar a URL por ambiente (ex.: variável de ambiente), seria necessário uso de arquivo de environment ou substituição em tempo de build/run (ex.: script que gera um `env.js` e o index carrega).

---

## Endpoints de health (Nginx)

- **GET /health** – 200 OK (usado pelo HEALTHCHECK do Docker).
- **GET /live** – 200 OK (Liveness).
- **GET /ready** – 200 OK (Readiness).

Úteis para Kubernetes (`livenessProbe`, `readinessProbe`) ou orquestradores que suportam health HTTP.
