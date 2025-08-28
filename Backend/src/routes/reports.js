import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Reports endpoints' });
});

export default router;
