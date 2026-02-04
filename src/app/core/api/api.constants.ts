/**
 * Base URL da API Pet Manager (Swagger: https://pet-manager-api.geia.vip/q/swagger-ui/)
 */
export const API_BASE_URL = 'https://pet-manager-api.geia.vip';

export const API_ENDPOINTS = {
  login: '/autenticacao/login',
  refresh: '/autenticacao/refresh',
} as const;
