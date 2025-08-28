import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Accounting endpoints' });
});

export default router;
