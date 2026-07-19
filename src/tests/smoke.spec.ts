import axios from 'axios';

// Prueba SMOKE: verifica que los endpoints críticos de la API respondan.
// Requiere el servidor corriendo (npx nx serve api) y la BD dockerizada activa.

const BASE_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: BASE_URL, validateStatus: () => true });

describe('Smoke Tests - API RealWorld', () => {
  it('el endpoint raíz / responde con estado 200', async () => {
    const res = await api.get('/');
    expect(res.status).toBe(200);
  });

  it('GET /api/tags responde 200 y devuelve la propiedad tags', async () => {
    const res = await api.get('/api/tags');
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('tags');
  });

  it('GET /api/articles responde 200 y devuelve articles y articlesCount', async () => {
    const res = await api.get('/api/articles');
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('articles');
    expect(res.data).toHaveProperty('articlesCount');
  });
});