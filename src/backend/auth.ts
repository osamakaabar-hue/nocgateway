import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';
import crypto from 'crypto';

export const authRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-noc-key-for-dev';

// Login to get a JWT
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  if (user.status === 'LOCKED') {
    res.status(403).json({ error: 'User account is locked. Please contact your system administrator. / حساب المستخدم مغلق. يرجى الاتصال بمسؤول النظام.' });
    return;
  }

  if (user.status !== 'ACTIVE') {
    res.status(403).json({ error: 'Account is not active' });
    return;
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    const newFailCount = (user.failure_count || 0) + 1;
    if (newFailCount >= 3) {
      db.prepare("UPDATE users SET status = 'LOCKED', failure_count = ? WHERE id = ?").run(newFailCount, user.id);
      res.status(403).json({ error: 'User account is locked. Please contact your system administrator. / حساب المستخدم مغلق. يرجى الاتصال بمسؤول النظام.' });
    } else {
      db.prepare("UPDATE users SET failure_count = ? WHERE id = ?").run(newFailCount, user.id);
      res.status(401).json({ error: `Invalid credentials. Attempts left: ${3 - newFailCount} / بيانات الاعتماد غير صالحة. المحاولات المتبقية: ${3 - newFailCount}` });
    }
    return;
  }

  // Reset failure count on successful login
  if (user.failure_count > 0) {
    db.prepare('UPDATE users SET failure_count = 0 WHERE id = ?').run(user.id);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, company_id: user.company_id, version: user.version },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, user: { id: user.id, email: user.email, status: user.status } });
});

// Forgot Password Flow
authRouter.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
  if (!user) {
    // Return 200 even if user doesn't exist for security (prevent email enumeration)
    res.json({ message: 'If the email exists, a password reset link has been sent.' });
    return;
  }

  // Generate a secure random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = bcrypt.hashSync(resetToken, 10);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

  db.prepare(`
    INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, used)
    VALUES (?, ?, ?, ?, 0)
  `).run(crypto.randomUUID(), user.id, tokenHash, expiresAt);

  // In a real app, send an email here. We just return the token for testing/demo purposes.
  const responseData: any = { message: 'If the email exists, a password reset link has been sent.' };
  if (process.env.NODE_ENV !== 'production') {
    responseData._dev_only_token = resetToken;
  }

  res.json(responseData);
});

// Reset Password
authRouter.post('/reset-password', (req, res) => {
  const { email, token, newPassword } = req.body;
  
  if (!email || !token || !newPassword) {
    res.status(400).json({ error: 'Email, token, and new password are required' });
    return;
  }

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
  if (!user) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  // Find valid tokens for user
  const tokens = db.prepare(`
    SELECT * FROM password_reset_tokens 
    WHERE user_id = ? AND used = 0 AND expires_at > CURRENT_TIMESTAMP
  `).all(user.id) as any[];

  let validTokenRecord = null;
  for (const t of tokens) {
    if (bcrypt.compareSync(token, t.token_hash)) {
      validTokenRecord = t;
      break;
    }
  }

  if (!validTokenRecord) {
    res.status(400).json({ error: 'Invalid or expired token' });
    return;
  }

  // Hash new password
  const newHash = bcrypt.hashSync(newPassword, 10);

  // Update password and increment user version (Global Session Kill Switch)
  // Also mark token as used
  db.transaction(() => {
    db.prepare('UPDATE users SET password_hash = ?, version = version + 1 WHERE id = ?').run(newHash, user.id);
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(validTokenRecord.id);
  })();

  res.json({ message: 'Password reset successfully' });
});
