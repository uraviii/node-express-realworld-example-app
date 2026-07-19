import axios from 'axios';

// Prueba de INTEGRACIÓN: ejercita la cadena completa
// HTTP -> controlador -> servicio -> Prisma -> PostgreSQL, con escritura real.
// Requiere el servidor corriendo y la BD dockerizada activa.

const api = axios.create({
  baseURL: 'http://localhost:3000',
  validateStatus: () => true,
});

// Email único por ejecución para no colisionar con datos previos
const unique = Date.now();
const newUser = {
  username: `integ_${unique}`,
  email: `integ_${unique}@test.com`,
  password: 'password123',
};

describe('Integración - Registro y autenticación de usuarios', () => {
  let token = '';

  it('POST /api/users registra un usuario y devuelve un token', async () => {
    const res = await api.post('/api/users', { user: newUser });
    expect(res.status).toBe(201);
    expect(res.data.user).toHaveProperty('token');
    expect(res.data.user.email).toBe(newUser.email);
    expect(res.data.user.username).toBe(newUser.username);
    token = res.data.user.token;
  });

  it('POST /api/users/login inicia sesión con las credenciales creadas', async () => {
    const res = await api.post('/api/users/login', {
      user: { email: newUser.email, password: newUser.password },
    });
    expect(res.status).toBe(200);
    expect(res.data.user).toHaveProperty('token');
    expect(res.data.user.email).toBe(newUser.email);
  });

  it('GET /api/user devuelve el usuario actual con el token', async () => {
    const res = await api.get('/api/user', {
      headers: { Authorization: `Token ${token}` },
    });
    expect(res.status).toBe(200);
    expect(res.data.user.username).toBe(newUser.username);
  });

  it('rechaza el registro con email duplicado (regla de negocio)', async () => {
    const res = await api.post('/api/users', { user: newUser });
    expect(res.status).toBe(422);
    expect(res.data.errors).toBeDefined();
  });
});