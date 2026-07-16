import express from 'express';
import bcrypt from 'bcryptjs';
import db from './db.js';

export const adminRouter = express.Router();

// Middleware to mock admin check (in reality, verify JWT and admin role)
adminRouter.use((req, res, next) => {
  // Mock authentication for prototype
  next();
});

// GET /api/admin/users
adminRouter.get('/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.username, u.email, u.status, u.version, u.created_at, u.role, u.is_backup, u.requested_by, u.company_id, c.name as company_name 
    FROM users u 
    LEFT JOIN companies c ON u.company_id = c.id
  `).all();
  res.json(users);
});

// GET /api/admin/pending-users
adminRouter.get('/pending-users', (req, res) => {
  const pending = db.prepare(`
    SELECT pa.id, pa.user_id, pa.requested_by, pa.role, pa.company_id, pa.requested_at,
           u.username, u.email, c.name as company_name
    FROM pending_approvals pa
    LEFT JOIN users u ON pa.user_id = u.id
    LEFT JOIN companies c ON pa.company_id = c.id
  `).all();
  res.json(pending);
});

// GET /api/admin/audit
adminRouter.get('/audit', (req, res) => {
  const logs = db.prepare(`
    SELECT id, timestamp, actor_id, actor_name, target_id, action, details, ip_address
    FROM auth_audit_logs
    ORDER BY timestamp DESC
    LIMIT 100
  `).all();
  res.json(logs);
});

// POST /api/admin/users - Provision user (supports requireApproval + isBackup + role)
adminRouter.post('/users', (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const { companyId, password, role, requireApproval, isBackup } = req.body;

  if (!email || !username || !password) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  try {
    const hash = bcrypt.hashSync(password, 10);
    const userId = 'user-' + Date.now();
    const status = requireApproval ? 'PENDING_APPROVAL' : 'ACTIVE';
    const backupFlag = isBackup ? 1 : 0;
    const actorId = (req.headers['x-actor-id'] as string) || 'user-noc-admin';
    const actorName = (req.headers['x-actor-name'] as string) || 'NOC Admin';

    db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, company_id, username, email, password_hash, status, role, is_backup, requested_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, companyId, username, email, hash, status, role || null, backupFlag, actorName);

      // If dual-authorization required, create a pending_approval record
      if (requireApproval) {
        db.prepare(`
          INSERT INTO pending_approvals (id, user_id, requested_by, role, company_id, requested_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run('pa-' + Date.now(), userId, actorName, role || '', companyId, new Date().toISOString());
      }

      db.prepare(`
        INSERT INTO auth_audit_logs (id, actor_id, actor_name, target_id, action, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'log-' + Date.now(), actorId, actorName, userId,
        requireApproval ? 'PROVISION_PENDING_APPROVAL' : 'PROVISION_USER',
        `${requireApproval ? '[DUAL-AUTH REQUIRED] ' : ''}${isBackup ? '[BACKUP] ' : ''}Provisioned user ${username} for ${companyId} with role ${role || 'unspecified'}`,
        req.ip
      );
    })();

    res.json({
      message: requireApproval ? 'User provisioned — awaiting second authorization' : 'User provisioned successfully',
      id: userId,
      status
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/users/:id/approve — Approve a pending user (dual-auth)
adminRouter.post('/users/:id/approve', (req, res) => {
  const userId = req.params.id;
  try {
    db.transaction(() => {
      db.prepare('UPDATE users SET status = ? WHERE id = ? AND status = ?').run('ACTIVE', userId, 'PENDING_APPROVAL');
      db.prepare('DELETE FROM pending_approvals WHERE user_id = ?').run(userId);
      db.prepare(`
        INSERT INTO auth_audit_logs (id, actor_id, actor_name, target_id, action, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run('log-' + Date.now(), 'user-noc-admin', 'NOC Admin', userId, 'APPROVE_USER', `Dual-authorization approved: user ${userId} is now ACTIVE`, req.ip);
    })();
    res.json({ message: 'User approved and activated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/users/:id/reject — Reject and remove a pending user
adminRouter.post('/users/:id/reject', (req, res) => {
  const userId = req.params.id;
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    db.transaction(() => {
      db.prepare('DELETE FROM pending_approvals WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);
      db.prepare(`
        INSERT INTO auth_audit_logs (id, actor_id, actor_name, target_id, action, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run('log-' + Date.now(), 'user-noc-admin', 'NOC Admin', userId, 'REJECT_USER', `Dual-authorization rejected: user ${user?.username || userId} removed`, req.ip);
    })();
    res.json({ message: 'User rejected and removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/users/:id/reset-password — Direct password reset per user
adminRouter.post('/users/:id/reset-password', (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }
  try {
    const hash = bcrypt.hashSync(newPassword, 10);
    const actorId = (req.headers['x-actor-id'] as string) || 'user-noc-admin';
    const actorName = (req.headers['x-actor-name'] as string) || 'NOC Admin';
    db.transaction(() => {
      db.prepare('UPDATE users SET password_hash = ?, version = version + 1 WHERE id = ?').run(hash, userId);
      db.prepare(`
        INSERT INTO auth_audit_logs (id, actor_id, actor_name, target_id, action, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run('log-' + Date.now(), 'user-noc-admin', 'NOC Admin', userId, 'PASSWORD_RESET', `Direct admin password reset for user ${userId}`, req.ip);
    })();
    res.json({ message: 'Password reset successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/users/:id/force-reset
adminRouter.post('/users/:id/force-reset', (req, res) => {
  const userId = req.params.id;
  try {
    db.transaction(() => {
      db.prepare('UPDATE users SET version = version + 1 WHERE id = ?').run(userId);
      db.prepare(`
        INSERT INTO auth_audit_logs (id, actor_id, actor_name, target_id, action, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run('log-' + Date.now(), 'user-noc-admin', 'NOC Admin', userId, 'FORCE_RESET', `Forced session invalidation for ${userId}`, req.ip);
    })();
    res.json({ message: 'User session invalidated and reset flagged.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id/status
adminRouter.put('/users/:id/status', (req, res) => {
  const userId = req.params.id;
  const { status } = req.body;
  const actorId = (req.headers['x-actor-id'] as string) || 'user-noc-admin';
  const actorName = (req.headers['x-actor-name'] as string) || 'NOC Admin';

  if (status !== 'ACTIVE' && status !== 'SUSPENDED' && status !== 'LOCKED') {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  if (userId === actorId && status !== 'ACTIVE') {
    res.status(400).json({ error: 'You cannot suspend or lock your own account' });
    return;
  }

  try {
    db.transaction(() => {
      if (status === 'ACTIVE') {
        db.prepare('UPDATE users SET status = ?, failure_count = 0 WHERE id = ?').run(status, userId);
      } else {
        db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, userId);
      }
      db.prepare(`
        INSERT INTO auth_audit_logs (id, actor_id, actor_name, target_id, action, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run('log-' + Date.now(), 'user-noc-admin', 'NOC Admin', userId, 'UPDATE_STATUS', `Changed user status to ${status}`, req.ip);
    })();
    res.json({ message: 'User status updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/global-kill-switch
adminRouter.post('/global-kill-switch', (req, res) => {
  const { tenantId, reason } = req.body;
  if (!tenantId) {
    res.status(400).json({ error: 'Missing tenantId' });
    return;
  }
  try {
    db.transaction(() => {
      db.prepare('UPDATE users SET version = version + 1 WHERE company_id = ?').run(tenantId);
      db.prepare(`
        INSERT INTO auth_audit_logs (id, actor_id, actor_name, target_id, action, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run('log-' + Date.now(), 'user-noc-admin', 'NOC Admin', tenantId, 'GLOBAL_KILL_SWITCH', `Emergency global revocation for ${tenantId}. Reason: ${reason || 'Not specified'}`, req.ip);
    })();
    res.json({ message: `Sovereign global session kill switch activated for ${tenantId}.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/password-override
adminRouter.post('/password-override', (req, res) => {
  const targetUserEmail = typeof req.body.targetUserEmail === 'string' ? req.body.targetUserEmail.trim() : '';
  const { newPassword, reason } = req.body;

  if (!targetUserEmail || !newPassword) {
    res.status(400).json({ error: 'Missing targetUserEmail or newPassword' });
    return;
  }
  if (newPassword.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }
  try {
    const hash = bcrypt.hashSync(newPassword, 10);
    const actorId = (req.headers['x-actor-id'] as string) || 'user-noc-admin';
    const actorName = (req.headers['x-actor-name'] as string) || 'NOC Admin';
    let success = false;
    let userId = '';
    db.transaction(() => {
      const user = db.prepare('SELECT id, username FROM users WHERE email = ?').get(targetUserEmail) as any;
      if (user) {
        userId = user.id;
        db.prepare('UPDATE users SET password_hash = ?, version = version + 1 WHERE id = ?').run(hash, user.id);
        db.prepare(`
          INSERT INTO auth_audit_logs (id, actor_id, actor_name, target_id, action, details, ip_address)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run('log-' + Date.now(), 'user-noc-admin', 'NOC Admin', user.id, 'PASSWORD_OVERRIDE', `Password override for ${user.username} (${targetUserEmail}). Reason: ${reason}`, req.ip);
        success = true;
      }
    })();
    if (success) {
      res.json({ message: `Password override completed for user ID: ${userId}` });
    } else {
      res.status(404).json({ error: 'Target user email not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
