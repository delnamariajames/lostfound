import express from 'express';
import path from 'path';
import fs from 'fs';
import { createExpressApp } from './server/app.js';

const app = createExpressApp();
const PORT = 3000;

// Production static file serving
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Campus Lost & Found Server] Running on http://0.0.0.0:${PORT}`);
});
