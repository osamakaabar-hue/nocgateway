import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const jsonPath = path.resolve(process.cwd(), 'database.json');

interface DbState {
  companies: any[];
  users: any[];
  roles: any[];
  user_roles: any[];
  password_reset_tokens: any[];
  auth_audit_logs: any[];
  pending_approvals: any[];
}

let state: DbState = {
  companies: [],
  users: [],
  roles: [],
  user_roles: [],
  password_reset_tokens: [],
  auth_audit_logs: [],
  pending_approvals: []
};

function loadDb() {
  if (fs.existsSync(jsonPath)) {
    try {
      state = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (e) {
      console.error("Failed to parse database.json, starting fresh", e);
    }
  }
}

function saveDb() {
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.error("Failed to save database.json", e);
  }
}

class Statement {
  private sql: string;
  constructor(sql: string) {
    this.sql = sql.trim().replace(/\s+/g, ' ');
  }

  run(...params: any[]) {
    loadDb();
    const sql = this.sql;
    if (sql.startsWith('INSERT INTO companies')) {
      const [id, name, type] = params;
      if (!state.companies.some(c => c.id === id)) {
        state.companies.push({ id, name, type });
      }
    } else if (sql.startsWith('INSERT INTO users')) {
      const [id, company_id, username, email, password_hash, status, role, is_backup, requested_by] = params;
      if (!state.users.some(u => u.id === id || u.email === email)) {
        state.users.push({
          id,
          company_id,
          username,
          email,
          password_hash,
          status: status || 'ACTIVE',
          role: role || null,
          is_backup: is_backup || 0,
          requested_by: requested_by || null,
          failure_count: 0,
          account_locked_until: null,
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } else if (sql.startsWith('INSERT INTO pending_approvals')) {
      const [id, user_id, requested_by, role, company_id, requested_at] = params;
      if (!state.pending_approvals) state.pending_approvals = [];
      state.pending_approvals.push({ id, user_id, requested_by, role, company_id, requested_at });
    } else if (sql.includes('DELETE FROM pending_approvals WHERE user_id = ?')) {
      const [user_id] = params;
      if (state.pending_approvals) {
        state.pending_approvals = state.pending_approvals.filter(p => p.user_id !== user_id);
      }
    } else if (sql.includes('UPDATE users SET status = ? WHERE id = ? AND status = ?')) {
      const [status, id] = params;
      const user = state.users.find(u => u.id === id);
      if (user) {
        user.status = status;
        user.updated_at = new Date().toISOString();
      }
    } else if (sql.includes('DELETE FROM users WHERE id = ?')) {
      const [id] = params;
      state.users = state.users.filter(u => u.id !== id);
    } else if (sql.includes('UPDATE users SET password_hash = ?, version = version + 1 WHERE id = ?')) {
      const [hash, id] = params;
      const user = state.users.find(u => u.id === id);
      if (user) {
        user.password_hash = hash;
        user.version += 1;
        user.updated_at = new Date().toISOString();
      }
    } else if (sql.includes('UPDATE users SET version = version + 1 WHERE id = ?')) {
      const [id] = params;
      const user = state.users.find(u => u.id === id);
      if (user) {
        user.version += 1;
        user.updated_at = new Date().toISOString();
      }
    } else if (sql.includes('UPDATE users SET status = ? WHERE id = ?')) {
      const [status, id] = params;
      const user = state.users.find(u => u.id === id);
      if (user) {
        user.status = status;
        user.updated_at = new Date().toISOString();
      }
    } else if (sql.includes('UPDATE users SET version = version + 1 WHERE company_id = ?')) {
      const [companyId] = params;
      state.users.forEach(u => {
        if (u.company_id === companyId) {
          u.version += 1;
          u.updated_at = new Date().toISOString();
        }
      });
    } else if (sql.includes('INSERT INTO password_reset_tokens')) {
      const [id, user_id, token_hash, expires_at] = params;
      state.password_reset_tokens.push({
        id,
        user_id,
        token_hash,
        expires_at,
        used: 0,
        created_at: new Date().toISOString()
      });
    } else if (sql.includes('UPDATE password_reset_tokens SET used = 1 WHERE id = ?')) {
      const [id] = params;
      const token = state.password_reset_tokens.find(t => t.id === id);
      if (token) {
        token.used = 1;
      }
    } else if (sql.includes('INSERT INTO auth_audit_logs')) {
      const [id, actor_id, actor_name, target_id, action, details, ip_address] = params;
      state.auth_audit_logs.push({
        id,
        timestamp: new Date().toISOString(),
        actor_id,
        actor_name,
        target_id,
        action,
        details,
        ip_address
      });
    }
    saveDb();
    return { changes: 1, lastInsertRowid: 1 };
  }

  get(...params: any[]) {
    loadDb();
    const sql = this.sql;
    if (sql.includes('SELECT COUNT(*) as count FROM companies')) {
      return { count: state.companies.length };
    } else if (sql.includes('SELECT id, username FROM users WHERE email = ?')) {
      const [email] = params;
      const user = state.users.find(u => u.email === email);
      return user ? { id: user.id, username: user.username } : undefined;
    } else if (sql.includes('SELECT * FROM users WHERE email = ?')) {
      const [email] = params;
      return state.users.find(u => u.email === email);
    } else if (sql.includes('SELECT id FROM users WHERE email = ?')) {
      const [email] = params;
      const user = state.users.find(u => u.email === email);
      return user ? { id: user.id } : undefined;
    } else if (sql.includes('SELECT * FROM users WHERE id = ?')) {
      const [id] = params;
      return state.users.find(u => u.id === id);
    }
    return undefined;
  }

  all(...params: any[]) {
    loadDb();
    const sql = this.sql;
    if (sql.includes('FROM users u LEFT JOIN companies c')) {
      return state.users.map(u => {
        const company = state.companies.find(c => c.id === u.company_id);
        return {
          ...u,
          company_name: company ? company.name : null
        };
      });
    } else if (sql.includes('FROM auth_audit_logs')) {
      return [...state.auth_audit_logs]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 100);
    } else if (sql.includes('FROM password_reset_tokens')) {
      const [userId] = params;
      const now = new Date().toISOString();
      return state.password_reset_tokens.filter(t => t.user_id === userId && t.used === 0 && t.expires_at > now);
    } else if (sql.includes('FROM pending_approvals pa LEFT JOIN users u')) {
      if (!state.pending_approvals) return [];
      return state.pending_approvals.map(pa => {
        const user = state.users.find(u => u.id === pa.user_id) || {};
        const company = state.companies.find(c => c.id === pa.company_id);
        return {
          ...pa,
          username: user.username || 'Unknown',
          email: user.email || '',
          company_name: company ? company.name : pa.company_id
        };
      });
    }
    return [];
  }
}

class MockDatabase {
  constructor(dbPath: string, options?: any) {
    loadDb();
  }
  exec(sql: string) {
    return this;
  }
  prepare(sql: string) {
    return new Statement(sql);
  }
  transaction(fn: Function) {
    return (...args: any[]) => {
      return fn(...args);
    };
  }
}

const db = new MockDatabase('', {});

export function initDb() {
  loadDb();
  
  const initialCompanies = [
    { id: 'NOC_HQ', name: 'National Oil Corporation (NOC)', type: 'HQ' },
    { id: 'WAHA', name: 'Waha Oil Company', type: 'SUBSIDIARY' },
    { id: 'AGOCO', name: 'Arabian Gulf Oil Company', type: 'SUBSIDIARY' },
    { id: 'ZALLAF', name: 'Zallaf Libya', type: 'SUBSIDIARY' },
    { id: 'MELLITAH', name: 'Mellitah Oil & Gas', type: 'SUBSIDIARY' },
    { id: 'SIRTE', name: 'Sirte Oil Company', type: 'SUBSIDIARY' },
    { id: 'BPMC', name: 'Brega Petroleum Marketing Company', type: 'SUBSIDIARY' },
    { id: 'ZUEITINA', name: 'Zueitina Oil Company', type: 'SUBSIDIARY' },
    { id: 'HAROUGE', name: 'Harouge Oil Operations', type: 'SUBSIDIARY' },
    { id: 'AKAKUS', name: 'Akakus Oil Operations', type: 'SUBSIDIARY' },
    { id: 'RASCO', name: 'Ras Lanuf Oil & Gas Processing', type: 'SUBSIDIARY' },
    { id: 'ZAWIA', name: 'Zawia Oil Refining Company', type: 'SUBSIDIARY' },
    { id: 'SONATRACH', name: 'Sonatrach', type: 'SUBSIDIARY' },
    { id: 'ENI', name: 'Eni North Africa B.V.', type: 'SUBSIDIARY' },
    { id: 'NPCC', name: 'National Petroleum Construction Company', type: 'SUBSIDIARY' },
    { id: 'JOWFE', name: 'Jowfe Oil Technology', type: 'SUBSIDIARY' },
    { id: 'TAKNIA', name: 'Taknia Libya Engineering', type: 'SUBSIDIARY' },
    { id: 'NDWC', name: 'National Drilling & Workover Company', type: 'SUBSIDIARY' },
    { id: 'NAGECO', name: 'North African Geophysical Company', type: 'SUBSIDIARY' },
    { id: 'MURZUQ', name: 'Murzuq Oil Services Limited', type: 'SUBSIDIARY' },
    { id: 'LIFECO', name: 'Libyan Fertilizer Company', type: 'SUBSIDIARY' },
    { id: 'CATERING', name: 'National Catering Company', type: 'SUBSIDIARY' },
    { id: 'PETROAIR', name: 'Petro Air Company', type: 'SUBSIDIARY' },
    { id: 'NAFUSAH', name: 'Nafusah Oil Operations Company', type: 'SUBSIDIARY' },
    { id: 'MABRUK', name: 'Mabruk Oil Operations', type: 'SUBSIDIARY' },
    { id: 'SARIR', name: 'Sarir Oil Operations Company', type: 'SUBSIDIARY' },
    { id: 'LERCO', name: 'Libyan Emirates Refining Company', type: 'SUBSIDIARY' },
    { id: 'CLINIC', name: 'Oil Clinic', type: 'SUBSIDIARY' },
    { id: 'STCPI', name: 'Specific Training Center of Petroleum Industrial', type: 'SUBSIDIARY' },
    { id: 'PTQI', name: 'Petroleum Training and Qualifying Institute', type: 'SUBSIDIARY' },
    { id: 'PRC', name: 'Petroleum Research Center', type: 'SUBSIDIARY' },
    { id: 'SIPT', name: 'Sebha Institute of Petroleum Technology', type: 'SUBSIDIARY' },
    { id: 'API', name: 'Ajdabiya Petroleum Institute', type: 'SUBSIDIARY' }
  ];

  let changed = false;

  // Enforce all companies exist
  initialCompanies.forEach(c => {
    if (!state.companies.some(exist => exist.id === c.id)) {
      state.companies.push(c);
      changed = true;
    }
  });

  const defaultPasswordHash = bcrypt.hashSync('password123', 10);

  // Core baseline users
  const baselineUsers = [
    { id: 'user-noc-admin', company: 'NOC_HQ', name: 'Dr. Khaled Security', email: 'khaled.sec@noc.ly' },
    { id: 'user-noc-pmo', company: 'NOC_HQ', name: 'Nadia Al-Kout', email: 'nadia@noc.ly' },
    { id: 'user-noc-fin', company: 'NOC_HQ', name: 'Abdelrahman Boufardis', email: 'abdelrahman@noc.ly' },
    { id: 'user-noc-head', company: 'NOC_HQ', name: 'Salma Al-Hashemi', email: 'salma@noc.ly' },
    { id: 'user-waha-pm', company: 'WAHA', name: 'Tarek El-Fassi', email: 'tarek@wahaoil.ly' },
    { id: 'user-waha-fin', company: 'WAHA', name: 'Mustafa Al-Bakoush', email: 'mustafa@wahaoil.ly' },
    { id: 'user-agoco-pm', company: 'AGOCO', name: 'Salem Al-Obeidi', email: 'salem@agoco.ly' },
    { id: 'user-agoco-fin', company: 'AGOCO', name: 'Bashir Al-Ghariani', email: 'bashir@agoco.ly' },
    { id: 'user-zallaf-pm', company: 'ZALLAF', name: 'Muftah Al-Warfali', email: 'muftah@zallaf.ly' },
    { id: 'user-zallaf-fin', company: 'ZALLAF', name: 'Ahmed Al-Mabrouk', email: 'ahmed@zallaf.ly' },
    { id: 'user-mellitah-pm', company: 'MELLITAH', name: 'Ali Al-Zway', email: 'ali@mellitah.ly' },
    { id: 'user-mellitah-fin', company: 'MELLITAH', name: 'Ibrahim Al-Fitouri', email: 'ibrahim@mellitah.ly' }
  ];

  // Dynamic user generator for the rest of the companies
  initialCompanies.forEach(c => {
    if (c.id === 'NOC_HQ') return;
    
    const pmId = `user-${c.id.toLowerCase()}-pm`;
    const finId = `user-${c.id.toLowerCase()}-fin`;

    const pmEmail = `pm@${c.id.toLowerCase()}.noc.ly`;
    const finEmail = `finance@${c.id.toLowerCase()}.noc.ly`;

    // English names for the mock roles
    const pmName = `Eng. Salem (PM - ${c.id})`;
    const finName = `Mustafa Al-Bakoush (Fin - ${c.id})`;

    const pmExists  = state.users.some(u => u.id === pmId  || u.email === pmEmail);
    const finExists = state.users.some(u => u.id === finId || u.email === finEmail);

    if (!pmExists) {
      state.users.push({
        id: pmId,
        company_id: c.id,
        username: pmName,
        email: pmEmail,
        password_hash: defaultPasswordHash,
        status: 'ACTIVE',
        role: 'subsidiary_pm',
        is_backup: 0,
        failure_count: 0,
        account_locked_until: null,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      changed = true;
    }

    if (!finExists) {
      state.users.push({
        id: finId,
        company_id: c.id,
        username: finName,
        email: finEmail,
        password_hash: defaultPasswordHash,
        status: 'ACTIVE',
        role: 'subsidiary_finance',
        is_backup: 0,
        failure_count: 0,
        account_locked_until: null,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      changed = true;
    }
  });

  // Ensure baseline users exist too
  const baselineRoles: Record<string, string> = {
    'user-noc-admin': 'system_admin',
    'user-noc-pmo':   'pmo_auditor',
    'user-noc-fin':   'noc_finance',
    'user-noc-head':  'noc_head_of_accounts',
    'user-waha-pm':   'subsidiary_pm',
    'user-waha-fin':  'subsidiary_finance',
    'user-agoco-pm':  'subsidiary_pm',
    'user-agoco-fin': 'subsidiary_finance',
    'user-zallaf-pm': 'subsidiary_pm',
    'user-zallaf-fin':'subsidiary_finance',
    'user-mellitah-pm': 'subsidiary_pm',
    'user-mellitah-fin':'subsidiary_finance',
  };
  baselineUsers.forEach(u => {
    if (!state.users.some(exist => exist.id === u.id)) {
      state.users.push({
        id: u.id,
        company_id: u.company,
        username: u.name,
        email: u.email,
        password_hash: defaultPasswordHash,
        status: 'ACTIVE',
        role: baselineRoles[u.id] || null,
        is_backup: 0,
        failure_count: 0,
        account_locked_until: null,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      changed = true;
    }
  });

  // ── Deduplicate: remove any duplicate users by id or email ──────────────
  const seenIds   = new Set<string>();
  const seenEmails = new Set<string>();
  state.users = state.users.filter(u => {
    if (seenIds.has(u.id) || seenEmails.has(u.email)) return false;
    seenIds.add(u.id);
    seenEmails.add(u.email);
    return true;
  });

  // Guard: ensure pending_approvals array always exists
  if (!state.pending_approvals) {
    state.pending_approvals = [];
    changed = true;
  }

  if (changed || state.companies.length === 0) {
    saveDb();
  }
}

export default db;
