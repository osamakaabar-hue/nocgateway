export interface Deliverable {
  id: string;
  description: string;
  weight: string; // e.g. "10.0%"
  status: 'completed' | 'pending';
}

export interface Document {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  type: 'PDF' | 'XLSX' | 'IMAGE';
  url?: string;
  document_type?: string;
}

export interface AuditLogEntry {
  id: string;
  user: string;
  action: string;
  change: string;
  timestamp: string;
}

export interface Claim {
  id: string;
  code: string;
  title: string;
  company: string;
  companyId: string;
  wbs: string;
  claimedValue: string;
  numericValue: number;
  submittedBy: string;
  submissionDate: string;
  previousProgress: number;
  claimedProgress: number;
  priority: 'high' | 'standard';
  dueDate: string;
  previousNotes: string;
  deliverables: Deliverable[];
  documents: Document[];
  auditLog: AuditLogEntry[];
  auditorNotes: string;
  status: 'pending' | 'approved' | 'rejected' | 'info_requested' | 'pending_financial_audit' | 'pending_head_of_accounts_approval' | 'authorized_for_payment';
  invoiceNumber?: string;
  invoiceAmount?: number;
  paymentToken?: string;
  form3Generated?: boolean;
  form3SignedByFinance?: string;
  form3SignedByChairman?: string;
}

export type RoleType = "pmo_auditor" | "subsidiary_pm" | "subsidiary_dept" | "subsidiary_finance" | "subsidiary_chairman" | "noc_finance" | "noc_head_of_accounts" | "system_admin" | "steering_committee";

export interface DemoUser {
  id: string;
  name: string;
  nameAr?: string;
  role: RoleType;
  roleLabel: string;
  company: string;
  companyId: string;
  avatarColor: string;
  description: string;
  capabilities: string[];
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "success" | "info" | "warning" | "error";
  claimId?: string;
  tab?: "claims" | "wbs" | "invoices" | "lcs" | "documents" | "notifications";
  actionRequired?: boolean;
  actionCompleted?: boolean;
  priority?: "high" | "normal";
  companyId?: string;
}

export type Permission = 
  | "VIEW_DASHBOARD" 
  | "MANAGE_USERS" 
  | "MANAGE_ROLES" 
  | "VIEW_AUDIT_LOGS" 
  | "CLEAR_ALARMS" 
  | "MODIFY_NETWORK_CONFIG" 
  | "RESTART_SERVICES"
  | "APPROVE_CLAIMS";

export interface RoleDef {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem?: boolean;
}

export interface UserDef {
  id: string;
  username: string;
  email: string;
  fullName: string;
  department: string;
  roles: string[];
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
  lastLogin?: string;
  createdAt: string;
}

export interface AuthAuditLog {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_name: string;
  target_id: string;
  action: string;
  details: string;
  ip_address: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  status: string;
  version: number;
  created_at: string;
  role: string;
  is_backup: number;
  requested_by: string;
  company_id: string;
  company_name: string;
}

export interface PendingApproval {
  id: string;
  user_id: string;
  requested_by: string;
  role: string;
  company_id: string;
  requested_at: string;
  username: string;
  email: string;
  company_name: string;
}

export interface LcData {
  companyId: string;
  companyName: string;
  companyNameAr: string;
  allocatedShare: number;
  openLcsCount: number;
  openLcsValue: number;
  totalPaid: number;
  outstandingCommitment: number;
  availableBalance: number;
}
