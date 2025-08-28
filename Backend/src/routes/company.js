import express from 'express';
const router = express.Router();

// GET /api/companies - List companies
router.get('/', (req, res) => {
  res.json({ message: 'Company list endpoint' });
});

// POST /api/companies - Create company
router.post('/', (req, res) => {
  res.json({ message: 'Create company endpoint' });
});

// GET /api/companies/:id - Get company details
router.get('/:id', (req, res) => {
  res.json({ message: 'Get company details endpoint' });
});

export default router;
