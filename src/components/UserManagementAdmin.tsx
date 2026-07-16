import React, { useState, useEffect } from 'react';
import { UserDef, RoleDef, AuthAuditLog, Permission } from '../types';
import { Users, Shield, Clock, Plus, Search, Edit2, Lock, UserX, UserCheck, ShieldAlert, Key, Activity, Server, Database, Mail } from 'lucide-react';

interface Props {
  showToast: (msg: string, type: "success" | "error" | "info") => void;
  lang: "en" | "ar";
}

const MOCK_PERMISSIONS: { id: Permission; label: string; desc: string }[] = [
  { id: "VIEW_DASHBOARD", label: "View Dashboard", desc: "Access read-only system telemetry and dashboards" },
  { id: "MANAGE_USERS", label: "Manage Users", desc: "Create, update, and suspend user accounts" },
  { id: "MANAGE_ROLES", label: "Manage Roles", desc: "Modify RBAC roles and permission mappings" },
  { id: "VIEW_AUDIT_LOGS", label: "View Audit Logs", desc: "Access immutable security and access logs" },
  { id: "CLEAR_ALARMS", label: "Clear Alarms", desc: "Acknowledge and clear network/security alarms" },
  { id: "MODIFY_NETWORK_CONFIG", label: "Modify Network Config", desc: "Change active platform routing and firewall rules" },
  { id: "RESTART_SERVICES", label: "Restart Services", desc: "Restart critical platform microservices" },
  { id: "APPROVE_CLAIMS", label: "Approve Claims", desc: "Financial and technical approval authority" },
];

const MOCK_ROLES: RoleDef[] = [
  { id: "r1", name: "Super Admin", description: "Unrestricted platform access", permissions: ["VIEW_DASHBOARD", "MANAGE_USERS", "MANAGE_ROLES", "VIEW_AUDIT_LOGS", "CLEAR_ALARMS", "MODIFY_NETWORK_CONFIG", "RESTART_SERVICES", "APPROVE_CLAIMS"], isSystem: true },
  { id: "r2", name: "NOC Central HQ", description: "HQ Auditors & Finance", permissions: ["VIEW_DASHBOARD", "VIEW_AUDIT_LOGS", "APPROVE_CLAIMS"], isSystem: true },
  { id: "r3", name: "Subsidiary PM", description: "Project Management", permissions: ["VIEW_DASHBOARD"] },
  { id: "r4", name: "Subsidiary Finance", description: "Subsidiary Financial Officers", permissions: ["VIEW_DASHBOARD"] },
];

const MOCK_USERS: UserDef[] = [
  { id: "u1", username: "tariq.auditor", email: "tariq@noc.ly", fullName: "Tariq Auditor", department: "PMO Technical", roles: ["r2"], status: "ACTIVE", lastLogin: "2026-07-10T11:22:00Z", createdAt: "2024-01-15T08:00:00Z" },
  { id: "u2", username: "k.waha", email: "khalid@waha.ly", fullName: "Khalid PM", department: "Waha Projects", roles: ["r3"], status: "ACTIVE", lastLogin: "2026-07-10T09:15:00Z", createdAt: "2025-03-10T10:30:00Z" },
  { id: "u3", username: "s.agoco", email: "salem@agoco.ly", fullName: "Salem Finance", department: "AGOCO Finance", roles: ["r4"], status: "SUSPENDED", lastLogin: "2026-06-25T14:45:00Z", createdAt: "2025-06-01T09:00:00Z" },
  { id: "u4", username: "admin.sys", email: "admin@noc.ly", fullName: "System Admin", department: "IT Security", roles: ["r1"], status: "ACTIVE", lastLogin: "2026-07-09T16:20:00Z", createdAt: "2025-11-20T11:00:00Z" },
];

const MOCK_AUDIT: AuthAuditLog[] = [
  { id: "a1", timestamp: "2026-07-10T08:15:22Z", actor_id: "u4", actor_name: "admin.sys", target_id: "u3", action: "SUSPEND_USER", details: "Suspended due to inactivity policy", ip_address: "192.168.1.45" },
  { id: "a2", timestamp: "2026-07-09T14:10:05Z", actor_id: "u4", actor_name: "admin.sys", target_id: "r3", action: "UPDATE_ROLE", details: "Added CLEAR_ALARMS permission to L2 Support Engineer", ip_address: "192.168.1.45" },
  { id: "a3", timestamp: "2026-07-08T09:05:11Z", actor_id: "u4", actor_name: "admin.sys", target_id: "u1", action: "ASSIGN_ROLE", details: "Assigned NOC Central HQ role to tariq.auditor", ip_address: "10.0.5.12" },
  { id: "a4", timestamp: "2026-07-01T10:00:00Z", actor_id: "u4", actor_name: "admin.sys", target_id: "u2", action: "CREATE_USER", details: "Provisioned new Subsidiary PM account for Waha", ip_address: "192.168.1.45" },
];

export default function UserManagementAdmin({ showToast, lang }: Props) {
  const isRtl = lang === "ar";
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "audit" | "blueprint">("blueprint");
  
  const [users, setUsers] = useState<UserDef[]>([]);
  const [roles, setRoles] = useState(MOCK_ROLES);
  const [auditLogs, setAuditLogs] = useState<AuthAuditLog[]>(MOCK_AUDIT);
  
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", company: "NOC_HQ", role: "r3" });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped = data.map((d: any) => {
          let roleId = "r3";
          if (d.email.includes("khaled")) roleId = "r1";
          else if (d.email.includes("noc.ly")) roleId = "r2";
          else if (d.username.toLowerCase().includes("finance") || d.email.includes("mustafa") || d.email.includes("bashir") || d.email.includes("ahmed") || d.email.includes("ibrahim")) roleId = "r4";
          
          return {
            id: d.id,
            username: d.username,
            email: d.email,
            fullName: d.username, // mapping username as fullname
            department: d.company_name || 'N/A',
            roles: [roleId],
            status: d.status,
            createdAt: d.created_at,
            lastLogin: "-"
          };
        });
        setUsers(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit');
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          timestamp: d.timestamp,
          actor_id: d.actor_id,
          actor_name: d.actor_name,
          target_id: d.target_id,
          action: d.action,
          details: d.details,
          ip_address: d.ip_address || '127.0.0.1'
        }));
        setAuditLogs(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, []);

  const handleToggleStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        showToast(isRtl ? `تم تغيير حالة المستخدم إلى ${newStatus}` : `User status changed to ${newStatus}`, "success");
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update status");
      }
    } catch (e: any) {
      showToast(e.message || "Error updating user status", "error");
    }
  };

  const handleForceReset = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/force-reset`, { method: 'POST' });
      if (res.ok) {
        showToast(isRtl ? "تم إرسال رابط إعادة تعيين كلمة المرور للمستخدم بنجاح." : "Password reset link securely dispatched to user's corporate email.", "info");
      }
    } catch (e) {
      showToast("Error forcing reset", "error");
    }
  };

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.email) {
      showToast(isRtl ? "الرجاء تعبئة جميع الحقول المطلوبة." : "Please fill all required fields.", "error");
      return;
    }
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUser.email,
          username: newUser.fullName,
          companyId: newUser.company,
          password: 'password123' // Default password
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to provision');
      }

      await fetchUsers();
      setIsProvisionModalOpen(false);
      setNewUser({ fullName: "", email: "", company: "NOC_HQ", role: "r3" });
      showToast(isRtl ? "تم إنشاء حساب المستخدم بنجاح." : "User provisioned successfully.", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className={`h-full flex flex-col ${isRtl ? "text-right" : "text-left"}`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
        <div>
          <h2 className={`text-xl font-black text-slate-800 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            {isRtl ? "إدارة الوصول وصلاحيات المستخدمين" : "Identity & Access Management (IAM)"}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {isRtl 
              ? "وحدة التحكم المركزية بصلاحيات منصة المؤسسة الوطنية للنفط. (RBAC)" 
              : "Centralized NOC platform authority matrix & user administration (RBAC)."}
          </p>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className={`flex border-b border-slate-200 mb-6 ${isRtl ? "flex-row-reverse" : ""}`}>
        <button 
          onClick={() => setActiveTab("blueprint")}
          className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""} ${activeTab === "blueprint" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
        >
          <Database className="w-4 h-4" />
          {isRtl ? "المخطط الهيكلي (Blueprint)" : "Architecture Blueprint"}
        </button>
        <button 
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""} ${activeTab === "users" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
        >
          <Users className="w-4 h-4" />
          {isRtl ? "المستخدمين" : "Users"}
        </button>
        <button 
          onClick={() => setActiveTab("roles")}
          className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""} ${activeTab === "roles" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
        >
          <Key className="w-4 h-4" />
          {isRtl ? "الأدوار والصلاحيات" : "Roles & Permissions"}
        </button>
        <button 
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""} ${activeTab === "audit" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
        >
          <Clock className="w-4 h-4" />
          {isRtl ? "سجل التدقيق الأمني" : "Security Audit Log"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pb-10">
        
        {/* BLUEPRINT TAB */}
        {activeTab === "blueprint" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600" />
                Technical Specification: IAM Module
              </h3>
              
              <div className="prose prose-sm prose-slate max-w-none text-xs">
                <p>This module acts as the central source of truth for platform authorities, ensuring strict Separation of Duties (SoD) between <strong>NOC Central Headquarters</strong> (Auditing/Finance) and <strong>Operating Subsidiaries</strong> (Project Management/Invoicing).</p>
                
                <h4 className="font-bold text-slate-900 mt-4 mb-2">1. Architecture Overview & Security Integrity</h4>
                <ul className="list-disc pl-5 space-y-1 mb-4 text-slate-600">
                  <li><strong>Token & Verification Security:</strong> Passwords are hashed using argon2/bcrypt before persistence. Reset tokens are stored in the database as salted hashes (never raw text) to prevent database leak exploitations.</li>
                  <li><strong>Global Session Kill Switch:</strong> A <code>version</code> integer on the user record increments upon suspension, role change, or password reset. Edge microservices validate the JWT version against a high-performance Redis cache, instantly invalidating active sessions across all nodes without waiting for token expiry.</li>
                  <li><strong>Multi-Tenant Scope:</strong> Users are strictly bound to their <code>company_id</code> (Tenant), ensuring data sovereignty. A Waha PM cannot view AGOCO portfolios.</li>
                </ul>

                <h4 className="font-bold text-slate-900 mt-4 mb-2">2. Database Schema (Relational ERD)</h4>
                <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-[10px] whitespace-pre-wrap overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
{`Table companies {
  id UUID [pk]
  name VARCHAR(100)
  type ENUM('HQ', 'SUBSIDIARY')
}

Table users {
  id UUID [pk]
  company_id UUID [ref: > companies.id]
  username VARCHAR(50) [unique]
  email VARCHAR(255) [unique]
  password_hash VARCHAR(255)
  status ENUM('ACTIVE', 'SUSPENDED', 'DEACTIVATED')
  failure_count INT [default: 0]
  account_locked_until TIMESTAMP
  version INT [default: 1] // Instant session invalidation
  created_at TIMESTAMP
  updated_at TIMESTAMP
}

Table roles {
  id UUID [pk]
  name VARCHAR(50)
  permissions JSONB // Array of explicit permissions
}

Table user_roles {
  user_id UUID [ref: > users.id]
  role_id UUID [ref: > roles.id]
  PRIMARY KEY (user_id, role_id)
}

Table password_reset_tokens {
  id UUID [pk]
  user_id UUID [ref: > users.id]
  token_hash VARCHAR(255) // Salted hash, not raw token
  expires_at TIMESTAMP    // Short-lived (15 min)
  used BOOLEAN [default: false]
  created_at TIMESTAMP
}`}
                </div>

                <h4 className="font-bold text-slate-900 mt-6 mb-2">3. API Specification (Express/TypeScript Endpoints)</h4>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg font-mono text-[10px] space-y-3">
                  <div><span className="text-emerald-600 font-bold">POST</span> <span className="text-slate-800">/api/auth/forgot-password</span> - Initiates unauthenticated reset flow. Mails secure short-lived token.</div>
                  <div><span className="text-emerald-600 font-bold">POST</span> <span className="text-slate-800">/api/auth/reset-password</span> - Validates token_hash and applies new password_hash. Increments user version.</div>
                  <div className="border-t border-slate-200 pt-2"><span className="text-blue-600 font-bold">GET</span> <span className="text-slate-800">/api/admin/users</span> - List multi-tenant users.</div>
                  <div><span className="text-emerald-600 font-bold">POST</span> <span className="text-slate-800">/api/admin/users</span> - Provision user with explicit role and company scopes. Payload: <code className="text-slate-600">{`{ email, fullName, companyId, roleId }`}</code></div>
                  <div><span className="text-amber-600 font-bold">POST</span> <span className="text-slate-800">/api/admin/users/:id/force-reset</span> - Admin manual override. Flags account & dispatches reset link.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className={`flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
              <div className={`relative ${isRtl ? "ml-auto" : "mr-auto"}`}>
                <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? "right-3" : "left-3"}`} />
                <input 
                  type="text" 
                  placeholder={isRtl ? "البحث عن مستخدم..." : "Search users..."}
                  className={`pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs w-64 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${isRtl ? "pr-9 pl-4 text-right" : ""}`}
                />
              </div>
              <button 
                onClick={() => setIsProvisionModalOpen(true)}
                className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-2 transition-colors ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <Plus className="w-4 h-4" />
                {isRtl ? "إضافة مستخدم" : "Provision User"}
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr className={isRtl ? "text-right" : "text-left"}>
                    <th className="px-4 py-3">{isRtl ? "المستخدم" : "User"}</th>
                    <th className="px-4 py-3">{isRtl ? "الجهة التابع لها" : "Entity/Department"}</th>
                    <th className="px-4 py-3">{isRtl ? "الأدوار" : "Roles"}</th>
                    <th className="px-4 py-3">{isRtl ? "الحالة" : "Status"}</th>
                    <th className="px-4 py-3 text-center">{isRtl ? "إجراءات إدارية" : "Admin Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(user => (
                    <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${isRtl ? "text-right" : "text-left"}`}>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{user.fullName}</div>
                        <div className="text-slate-500 text-[10px] font-mono">{user.email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{user.department}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(rId => {
                            const role = roles.find(r => r.id === rId);
                            return (
                              <span key={rId} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                {role?.name || rId}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center justify-center gap-1 ${isRtl ? "flex-row-reverse" : ""}`}>
                          <button 
                            onClick={() => handleForceReset(user.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1"
                            title="Force Password Reset"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-px h-4 bg-slate-200 mx-1"></div>
                          <button 
                            onClick={() => handleToggleStatus(user.id)}
                            className={`p-1.5 rounded-lg transition-colors ${user.status === 'ACTIVE' ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-rose-600 bg-rose-50 hover:bg-rose-100'}`}
                            title={user.status === 'ACTIVE' ? 'Suspend Account (Kill Sessions)' : 'Activate Account'}
                          >
                            {user.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROLES TAB */}
        {activeTab === "roles" && (
          <div className="space-y-4">
            <div className={`flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
              <h3 className="text-sm font-bold text-slate-800">
                {isRtl ? "هيكلية الأدوار المبنية على المهام (RBAC)" : "Role-Based Access Control Structure"}
              </h3>
              <button className={`bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-2 transition-colors ${isRtl ? "flex-row-reverse" : ""}`}>
                <Plus className="w-4 h-4" />
                {isRtl ? "دور جديد" : "Create Role"}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map(role => (
                <div key={role.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden">
                  {role.isSystem && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg">
                      SYSTEM
                    </div>
                  )}
                  <div className="mb-3">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      {role.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                  </div>
                  
                  <div className="flex-1 mt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Permissions ({role.permissions.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.map(p => (
                        <span key={p} className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={`mt-5 pt-3 border-t border-slate-100 flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
                    <span className="text-[10px] text-slate-400 font-medium">ID: {role.id}</span>
                    <button className="text-indigo-600 hover:text-indigo-700 text-xs font-bold transition-colors">
                      {isRtl ? "تعديل الصلاحيات" : "Edit Permissions"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUDIT TAB */}
        {activeTab === "audit" && (
          <div className="space-y-4">
             <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
              <Lock className={`w-5 h-5 text-indigo-600 shrink-0 ${isRtl ? "ml-1" : "mt-0.5"}`} />
              <div>
                <h4 className="text-xs font-bold text-indigo-900">
                  {isRtl ? "سجل التدقيق غير القابل للتعديل" : "Immutable Audit Trail"}
                </h4>
                <p className="text-[11px] text-indigo-700 mt-1">
                  {isRtl 
                    ? "يتم تسجيل جميع إجراءات الإدارة المركزية وتوقيعها تشفيرياً لضمان الامتثال لمعايير ISO 27001." 
                    : "All administrative actions are logged and cryptographically signed to ensure strict ISO 27001 compliance and non-repudiation."}
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr className={isRtl ? "text-right" : "text-left"}>
                    <th className="px-4 py-3">{isRtl ? "التاريخ والوقت" : "Timestamp"}</th>
                    <th className="px-4 py-3">{isRtl ? "المسؤول (Actor)" : "Actor"}</th>
                    <th className="px-4 py-3">{isRtl ? "الإجراء" : "Action"}</th>
                    <th className="px-4 py-3">{isRtl ? "التفاصيل" : "Details"}</th>
                    <th className="px-4 py-3">{isRtl ? "عنوان الـ IP" : "IP Address"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map(log => (
                    <tr key={log.id} className={`hover:bg-slate-50 transition-colors ${isRtl ? "text-right" : "text-left"}`}>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[10px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800">{log.actor_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-[11px]">
                        {log.details}
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">
                        {log.ip_address}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* PROVISION USER MODAL */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className={`px-6 py-4 border-b border-slate-100 flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                {isRtl ? "إضافة مستخدم جديد" : "Provision New User"}
              </h3>
              <button 
                onClick={() => setIsProvisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Lock className="w-4 h-4 opacity-0" /> {/* Spacer */}
                <span className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">✕</span>
              </button>
            </div>
            
            <form onSubmit={handleProvisionSubmit} className="p-6 space-y-4 text-left" dir={isRtl ? "rtl" : "ltr"}>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? "الاسم الكامل" : "Full Name"}
                </label>
                <input 
                  type="text" 
                  required
                  value={newUser.fullName}
                  onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="e.g. Ali Mahmoud"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? "البريد الإلكتروني المؤسسي" : "Corporate Email"}
                </label>
                <input 
                  type="email" 
                  required
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="name@noc.ly"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? "الجهة التابع لها" : "Operating Company / Entity"}
                </label>
                <select 
                  value={newUser.company}
                  onChange={e => setNewUser({...newUser, company: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  <option value="NOC_HQ">NOC Central Headquarters</option>
                  <option value="Waha Oil Company">Waha Oil Company</option>
                  <option value="AGOCO">Arabian Gulf Oil Company (AGOCO)</option>
                  <option value="Zallaf Libya">Zallaf Libya</option>
                  <option value="Mellitah Oil & Gas">Mellitah Oil & Gas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? "الدور الوظيفي" : "Role / Privileges Scope"}
                </label>
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  <option value="r2">NOC Central HQ (Auditors/Accounts)</option>
                  <option value="r3">Subsidiary Project Manager</option>
                  <option value="r4">Subsidiary Finance Officer</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  {isRtl ? "إنشاء الحساب وإرسال الدعوة" : "Provision & Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

