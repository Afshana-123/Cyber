const router = require('express').Router();
const jwt = require('jsonwebtoken');

// Hackathon: Skip OTP. Accept any phone + role → return valid JWT.
// Seeded demo users for convenience:
const DEMO_USERS = {
  admin:      { name: 'TRACE Admin',     district: 'National' },
  auditor:    { name: 'Field Auditor 1', district: 'Jhansi' },
  contractor: { name: 'XYZ Construction Ltd', district: 'Jhansi' },
  public:     { name: 'Citizen User',    district: 'Jhansi' },
};

router.post('/login', (req, res) => {
  const { phone, role } = req.body;
  if (!phone || !role) {
    return res.status(400).json({ error: 'phone and role are required' });
  }

  const validRoles = ['admin', 'auditor', 'contractor', 'public'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `role must be one of: ${validRoles.join(', ')}` });
  }

  const user = DEMO_USERS[role] || { name: 'User', district: 'Unknown' };
  const payload = { phone, role, name: user.name, district: user.district };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

  res.json({ token, role, name: user.name, district: user.district });
});

module.exports = router;
