# ============================================
# Stage 1: Build da aplicação Angular
# ============================================
FROM node:22-alpine AS build

WORKDIR /app

# Cópia dos arquivos de dependências
COPY package.json package-lock.json ./

# Instalação de dependências (apenas produção para o builder)
RUN npm ci

# Cópia do código fonte
COPY . .

# Build de produção
RUN npm run build

# ============================================
# Stage 2: Servir com Nginx
# ============================================
FROM nginx:1.27-alpine AS runtime

# wget necessário para o HEALTHCHECK (nginx:alpine não inclui por padrão)
RUN apk add --no-cache wget

# Remove configuração padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Cópia da configuração customizada (SPA + health checks)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cópia dos artefatos de build do stage anterior
COPY --from=build /app/dist/seletivo-frontend/browser /usr/share/nginx/html

# Porta exposta
EXPOSE 80

# Health check: Liveness (app está viva?) e Readiness (app pronta para receber tráfego?)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
