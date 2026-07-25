export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface Deliverable {
  id: string;
  description: string;
  weight: string; // e.g. "10.0%"
  status: 'completed' | 'pending';
}

export interface VariationOrder {
  id: string;
  parentClaimId: string;
  type: 'scope_change' | 'price_adjustment' | 'time_extension' | 'force_majeure';
  description: string;
  valueImpact: number;
  timeImpactDays: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submissionDate: string;
}

export interface Document {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  type: 'PDF' | 'XLSX' | 'IMAGE';
  url?: string;
  document_type?: string;
  claimId?: string;
  project_id?: string;
}

export type Form2AttachmentCategory = 
  | 'bill_of_lading'
  | 'site_receipt'
  | 'contractor_invoice'
  | 'technical_report'
  | 'other';

export interface Form2Attachment {
  id: string;
  claimId: string;
  form2Id?: string;
  category: Form2AttachmentCategory;
  categoryLabelAr: string;
  categoryLabelEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  requiredRoleAr?: string;
  requiredRoleEn?: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  mime_type?: string;
  uploadDate: string;
  created_at?: string;
  url: string;
  uploadedBy?: string;
  isMandatory: boolean;
  isAttached?: boolean;
}

export type PillarType = "Development Drilling" | "Well Workover & Maintenance" | "Surface Facilities & Tie-ins" | "Legacy";

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
  status: 'draft' | 'pending_gatekeeper' | 'pending_noc_committee' | 'safe_side_reserved' | 'bank_cleared' | 'rejected' | 'pending' | 'approved' | 'info_requested' | 'pending_financial_audit' | 'pending_head_of_accounts_approval' | 'authorized_for_payment';
  invoiceNumber?: string;
  invoiceAmount?: number;
  paymentToken?: string;
  form3Generated?: boolean;
  form3SignedByFinance?: string;
  form3SignedByChairman?: string;
  pillar?: PillarType;
  contractorId?: string;
  contractorName?: string;
  targetBopdIncrease?: number;
  actualBopdAdded?: number;
  
  // Phase 5.2: Local Content (ICV)
  localWorkforcePercentage?: number;
  localProcurementValue?: number;
  localSubcontractorCount?: number;
  
  // Phase 5.3: Retention
  retentionPercentage?: number;
  defectsLiabilityPeriodMonths?: number;

  // Phase 5.4: Variation Orders
  variationOrders?: VariationOrder[];

  // Form 2 Mandatory Attachments
  form2Attachments?: Form2Attachment[];
}

export type RoleType = "pmo_auditor" | "subsidiary_pm" | "subsidiary_dept" | "subsidiary_finance" | "subsidiary_chairman" | "noc_finance" | "noc_head_of_accounts" | "system_admin" | "steering_committee" | "subsidiary" | "noc_supervising_committee" | "contractor" | "bank";

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
  tab?: "claims" | "wbs" | "invoices" | "lcs" | "documents" | "notifications" | "approval_control_tower";
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
  sanctions_status?: 'CLEARED' | 'FLAGGED' | 'BLOCKED'; // Phase 5.1
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

export interface PillarData {
  allocatedShare: number;
  openLcsCount: number;
  openLcsValue: number;
  totalPaid: number;
  outstandingCommitment: number;
  availableBalance: number;
}

export interface Contractor {
  id: string;
  name: string;
  specialty?: string;
}

export interface Bank {
  id: string;
  name: string;
  swiftCode?: string;
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
  pillars?: {
    "Development Drilling": PillarData;
    "Well Workover & Maintenance": PillarData;
    "Surface Facilities & Tie-ins": PillarData;
  };
}
