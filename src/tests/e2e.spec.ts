import axios from 'axios';

// Prueba END-TO-END: recorre el flujo completo de un autor a través de
// varios dominios (auth -> article -> comment -> favorite), como lo haría
// un usuario real del cliente Conduit.
// Requiere el servidor corriendo y la BD dockerizada activa.

const api = axios.create({
  baseURL: 'http://localhost:3000',
  validateStatus: () => true,
});

const unique = Date.now();
const author = {
  username: `autor_${unique}`,
  email: `autor_${unique}@test.com`,
  password: 'password123',
};

describe('E2E - Flujo completo del autor', () => {
  let token = '';
  let slug = '';

  it('1. el autor se registra y obtiene un token', async () => {
    const res = await api.post('/api/users', { user: author });
    expect(res.status).toBe(201);
    token = res.data.user.token;
    expect(token).toBeTruthy();
  });

  it('2. el autor crea un artículo', async () => {
    const res = await api.post(
      '/api/articles',
      {
        article: {
          title: `Mi primer artículo ${unique}`,
          description: 'Una descripción de prueba E2E',
          body: 'El cuerpo del artículo de la prueba end-to-end.',
          tagList: ['e2e', 'testing'],
        },
      },
      { headers: { Authorization: `Token ${token}` } },
    );
    expect(res.status).toBe(201);
    expect(res.data.article).toHaveProperty('slug');
    slug = res.data.article.slug;
    expect(res.data.article.title).toContain('Mi primer artículo');
  });

  it('3. el autor comenta su propio artículo', async () => {
    const res = await api.post(
      `/api/articles/${slug}/comments`,
      { comment: { body: 'Un comentario de prueba E2E' } },
      { headers: { Authorization: `Token ${token}` } },
    );
    expect(res.status).toBe(200);
    expect(res.data.comment.body).toBe('Un comentario de prueba E2E');
  });

  it('4. el autor marca el artículo como favorito', async () => {
    const res = await api.post(
      `/api/articles/${slug}/favorite`,
      {},
      { headers: { Authorization: `Token ${token}` } },
    );
    expect(res.status).toBe(200);
    expect(res.data.article.favorited).toBe(true);
    expect(res.data.article.favoritesCount).toBe(1);
  });

  it('5. el artículo aparece al recuperarlo por su slug', async () => {
    const res = await api.get(`/api/articles/${slug}`, {
      headers: { Authorization: `Token ${token}` },
    });
    expect(res.status).toBe(200);
    expect(res.data.article.slug).toBe(slug);
    expect(res.data.article.favorited).toBe(true);
  });

  it('6. el autor elimina el artículo (limpieza)', async () => {
    const res = await api.delete(`/api/articles/${slug}`, {
      headers: { Authorization: `Token ${token}` },
    });
    expect([200, 204]).toContain(res.status);
  });
});