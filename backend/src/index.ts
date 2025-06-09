import express from 'express';

const app = express();
const port = 3000;

app.get('/', (_req, res) => {
  res.send('API funcionando 🎉');
});

app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
