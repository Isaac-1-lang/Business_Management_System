import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Employee list endpoint' });
});

export default router;
