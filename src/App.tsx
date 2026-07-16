import React, { useState, useEffect } from "react";
import { Claim, Deliverable, Document, AuditLogEntry, DemoUser, RoleType, NotificationItem } from "./types";
import { initialClaims } from "./data";
import { Lang, translations, t } from "./i18n";
import AddClaimModal from "./components/AddClaimModal";
import WBSStructuring from "./components/WBSStructuring";
import InvoiceAuditingVault from "./components/InvoiceAuditingVault";
import PaymentAuthorizationForm from "./components/forms/PaymentAuthorizationForm";
import TechnicalApprovalForm from "./components/forms/TechnicalApprovalForm";
import Form2CertificateOfConformity from "./components/forms/Form2CertificateOfConformity";
import CentralSecuritySettings from "./components/CentralSecuritySettings";
import TopNav from "./components/TopNav";
import PortalEntry from "./components/PortalEntry";
import SovereignDocumentRegistry from "./components/SovereignDocumentRegistry";
import UserManagementAdmin from "./components/UserManagementAdmin";
import LCManagement from "./components/LCManagement";
import InteractiveDashboard from "./components/InteractiveDashboard";
import NotificationCenter from "./components/NotificationCenter";
import ThemeToggle from "./components/ThemeToggle";
import { TENANT_AR } from "./hooks/usePortalEntry";
import { useTheme } from "./components/ThemeProvider";

import UserProfile from "./components/UserProfile";
import ForgotPasswordModal from "./components/ForgotPasswordModal";
import NocLogo from "./components/NocLogo";
import {
  Home,
  LayoutGrid,
  Receipt,
  FileCheck2,
  Settings,
  Search,
  Bell,
  CheckCircle2,
  History,
  Paperclip,
  Eye,
  FileText,
  Upload,
  X,
  Plus,
  Sparkles,
  Calendar,
  AlertCircle,
  ThumbsDown,
  Check,
  FileSpreadsheet,
  ShieldAlert,
  Coins,
  KeyRound,
  Lock,
  UserCheck,
  Building2,
  Database,
  Users,
  LogOut,
  ChevronRight,
  AlertTriangle,
  Info,
  Download,
  Printer,
  ExternalLink,
  Briefcase,
  BarChart2,
  BellRing
} from "lucide-react";
let toastTimeout: any;

const DEMO_USERS: DemoUser[] = [
  // NOC Central
  {
    id: "user-noc-admin",
    name: "Dr. Khaled Al-Fighi",
    nameAr: "د. خالد الفقي",
    role: "system_admin",
    roleLabel: "NOC System Security Administrator",
    company: "National Oil Corporation (NOC)",
    companyId: "NOC_HQ",
    avatarColor: "bg-red-600",
    description: "Master administrative control. Governs access rights, provisions users, and executes emergency session revocations.",
    capabilities: ["System Governance", "User Provisioning", "Kill Switch Operations", "Security Logging"]
  },
  {
    id: "user-noc-pmo",
    name: "Eng. Nadia Al-Tajouri",
    nameAr: "م. نادية التاجوري",
    role: "pmo_auditor",
    roleLabel: "NOC PMO Technical Auditor",
    company: "National Oil Corporation (NOC)",
    companyId: "NOC_HQ",
    avatarColor: "bg-amber-600",
    description: "Evaluates physical and milestone claims. Grants technical approval, rejects claims, or requests clarifications based on evidence.",
    capabilities: ["Review progress claims", "Approve / Reject technical progress", "Request clarifications"]
  },
  {
    id: "user-noc-fin",
    name: "Mr. Abdelrahman Al-Barasi",
    nameAr: "أ. عبدالرحمن البراصي",
    role: "noc_finance",
    roleLabel: "NOC Central Financial Auditor",
    company: "National Oil Corporation (NOC)",
    companyId: "NOC_HQ",
    avatarColor: "bg-purple-700",
    description: "Audits submitted commercial invoices against technical achievements, issues central payment tokens, and locks the stage cycle.",
    capabilities: ["Review commercial invoices", "Verify against technical Earned Value", "Authorize payments", "Generate NOC Security Tokens"]
  },
  {
    id: "user-noc-head",
    name: "Mrs. Salma Al-Werfalli",
    nameAr: "أ. سلمى الورفلي",
    role: "noc_head_of_accounts",
    roleLabel: "NOC Head of Accounts",
    company: "National Oil Corporation (NOC)",
    companyId: "NOC_HQ",
    avatarColor: "bg-fuchsia-700",
    description: "Sovereign head of accounts. Reviews financial auditor recommendations and officially releases final funds on NOC ledger.",
    capabilities: ["Final sign-off", "Release escrow/payment ledger", "Revoke or lock central security keys"]
  },
  {
    id: "user-noc-steering",
    name: "Dr. Omar Al-Mansouri",
    nameAr: "د. عمر المنصوري",
    role: "steering_committee",
    roleLabel: "Chairman of the Management Committee",
    company: "National Oil Corporation (NOC)",
    companyId: "NOC_HQ",
    avatarColor: "bg-emerald-800",
    description: "Sovereign oversight and strategic decision making. Global read-only access to all dashboards, project pipelines, and compliance reports.",
    capabilities: ["Global Dashboard Access", "View All Project Pipelines", "Read-Only Strategic Oversight"]
  },
  // Waha Oil Company
  {
    id: "user-waha-pm",
    name: "Eng. Tarek Al-Megrahi",
    nameAr: "م. طارق المقرحي",
    role: "subsidiary_pm",
    roleLabel: "Subsidiary Project Manager",
    company: "Waha Oil Company",
    companyId: "WAHA",
    avatarColor: "bg-blue-600",
    description: "Manages wellhead maintenance. Submits progress claims, updates deliverables, and uploads site construction photos.",
    capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos & documents", "Resubmit claims"]
  },
  {
    id: "user-waha-fin",
    name: "Mr. Mustafa Al-Bakoush",
    nameAr: "أ. مصطفى البكوش",
    role: "subsidiary_finance",
    roleLabel: "Subsidiary Finance Officer",
    company: "Waha Oil Company",
    companyId: "WAHA",
    avatarColor: "bg-indigo-600",
    description: "Handles invoicing for Waha Oil Company projects. Drafts commercial claims following technical PMO approval.",
    capabilities: ["Submit commercial invoice", "Track earned value limits", "Upload official PDF invoices"]
  },
  // AGOCO
  {
    id: "user-agoco-pm",
    name: "Eng. Salem Al-Obeidi",
    nameAr: "م. سالم العبيدي",
    role: "subsidiary_pm",
    roleLabel: "Subsidiary Project Manager",
    company: "Arabian Gulf Oil Company",
    companyId: "AGOCO",
    avatarColor: "bg-teal-600",
    description: "Oversees route surveys. Reports surveying logs, terrain parameters, and coordinates mapping.",
    capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos & documents"]
  },
  {
    id: "user-agoco-fin",
    name: "Mr. Bashir Al-Ghariani",
    nameAr: "أ. بشير الغرياني",
    role: "subsidiary_finance",
    roleLabel: "Subsidiary Finance Officer",
    company: "Arabian Gulf Oil Company",
    companyId: "AGOCO",
    avatarColor: "bg-sky-600",
    description: "Manages commercial and contract billing for AGOCO pipeline projects.",
    capabilities: ["Submit commercial invoice", "Track earned value limits", "Upload official PDF invoices"]
  },
  // Zallaf Libya
  {
    id: "user-zallaf-pm",
    name: "Eng. Muftah Al-Warfali",
    nameAr: "م. مفتاح الورفلي",
    role: "subsidiary_pm",
    roleLabel: "Subsidiary Project Manager",
    company: "Zallaf Libya",
    companyId: "ZALLAF",
    avatarColor: "bg-orange-600",
    description: "Manages Erawin Field substation civil works. Uploads concrete compressive strength certificates.",
    capabilities: ["Submit new progress claims", "Add deliverables", "Upload concrete logs"]
  },
  {
    id: "user-zallaf-fin",
    name: "Mr. Ahmed Al-Mabrouk",
    nameAr: "أ. أحمد المبروك",
    role: "subsidiary_finance",
    roleLabel: "Subsidiary Finance Officer",
    company: "Zallaf Libya",
    companyId: "ZALLAF",
    avatarColor: "bg-emerald-600",
    description: "Drafts commercial progress invoice dossiers for Zallaf substation installations.",
    capabilities: ["Submit commercial invoice", "Track earned value limits", "Upload official PDF invoices"]
  },
  // Mellitah Oil & Gas
  {
    id: "user-mellitah-pm",
    name: "Eng. Ali Al-Zway",
    nameAr: "م. علي الزوي",
    role: "subsidiary_pm",
    roleLabel: "Subsidiary Project Manager",
    company: "Mellitah Oil & Gas",
    companyId: "MELLITAH",
    avatarColor: "bg-red-600",
    description: "Oversees the gas plant overhaul. Uploads nitrogen leak-test logs and PLC update checklists.",
    capabilities: ["Submit new progress claims", "Add deliverables", "Upload technical test sheets"]
  },
  {
    id: "user-mellitah-fin",
    name: "Mr. Ibrahim Al-Fitouri",
    nameAr: "أ. إبراهيم الفيتوري",
    role: "subsidiary_finance",
    roleLabel: "Subsidiary Finance Officer",
    company: "Mellitah Oil & Gas",
    companyId: "MELLITAH",
    avatarColor: "bg-cyan-600",
    description: "Issues billing and audits financial limits for Mellitah Gas overhaul stages.",
    capabilities: ["Submit commercial invoice", "Track earned value limits", "Upload official PDF invoices"]
  },
  // Sirte Oil Company
  { id: "user-sirte-pm", name: "Eng. Salem (PM - SIRTE)", nameAr: "م. سالم (سرت)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Sirte Oil Company", companyId: "SIRTE", avatarColor: "bg-emerald-600", description: "Manages compressor station maintenance.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-sirte-fin", name: "Mr. Mustafa (Fin - SIRTE)", nameAr: "أ. مصطفى (سرت)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Sirte Oil Company", companyId: "SIRTE", avatarColor: "bg-emerald-700", description: "Handles invoicing for Sirte projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Brega
  { id: "user-bpmc-pm", name: "Eng. Salem (PM - BPMC)", nameAr: "م. سالم (البريقة)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Brega Petroleum Marketing Company", companyId: "BPMC", avatarColor: "bg-sky-600", description: "Manages depot expansion.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-bpmc-fin", name: "Mr. Mustafa (Fin - BPMC)", nameAr: "أ. مصطفى (البريقة)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Brega Petroleum Marketing Company", companyId: "BPMC", avatarColor: "bg-sky-700", description: "Handles invoicing for Brega projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Zueitina
  { id: "user-zueitina-pm", name: "Eng. Salem (PM - ZUEITINA)", nameAr: "م. سالم (الزويتينة)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Zueitina Oil Company", companyId: "ZUEITINA", avatarColor: "bg-blue-600", description: "Manages tank rehabilitation.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-zueitina-fin", name: "Mr. Mustafa (Fin - ZUEITINA)", nameAr: "أ. مصطفى (الزويتينة)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Zueitina Oil Company", companyId: "ZUEITINA", avatarColor: "bg-blue-700", description: "Handles invoicing for Zueitina projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Harouge
  { id: "user-harouge-pm", name: "Eng. Salem (PM - HAROUGE)", nameAr: "م. سالم (الهروج)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Harouge Oil Operations", companyId: "HAROUGE", avatarColor: "bg-teal-600", description: "Manages onshore pipeline repair.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-harouge-fin", name: "Mr. Mustafa (Fin - HAROUGE)", nameAr: "أ. مصطفى (الهروج)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Harouge Oil Operations", companyId: "HAROUGE", avatarColor: "bg-teal-700", description: "Handles invoicing for Harouge projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Akakus
  { id: "user-akakus-pm", name: "Eng. Salem (PM - AKAKUS)", nameAr: "م. سالم (أكاكوس)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Akakus Oil Operations", companyId: "AKAKUS", avatarColor: "bg-cyan-600", description: "Manages Murzuq Basin logistics.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-akakus-fin", name: "Mr. Mustafa (Fin - AKAKUS)", nameAr: "أ. مصطفى (أكاكوس)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Akakus Oil Operations", companyId: "AKAKUS", avatarColor: "bg-cyan-700", description: "Handles invoicing for Akakus projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Rasco
  { id: "user-rasco-pm", name: "Eng. Salem (PM - RASCO)", nameAr: "م. سالم (رأس لانوف)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Ras Lanuf Oil & Gas Processing", companyId: "RASCO", avatarColor: "bg-orange-600", description: "Manages petrochemical complex valve refurbishment.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-rasco-fin", name: "Mr. Mustafa (Fin - RASCO)", nameAr: "أ. مصطفى (رأس لانوف)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Ras Lanuf Oil & Gas Processing", companyId: "RASCO", avatarColor: "bg-orange-700", description: "Handles invoicing for Rasco projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Zawia
  { id: "user-zawia-pm", name: "Eng. Salem (PM - ZAWIA)", nameAr: "م. سالم (الزاوية)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Zawia Oil Refining Company", companyId: "ZAWIA", avatarColor: "bg-red-600", description: "Manages refinery distillation unit upgrade.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-zawia-fin", name: "Mr. Mustafa (Fin - ZAWIA)", nameAr: "أ. مصطفى (الزاوية)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Zawia Oil Refining Company", companyId: "ZAWIA", avatarColor: "bg-red-700", description: "Handles invoicing for Zawia projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Sonatrach
  { id: "user-sonatrach-pm", name: "Eng. Salem (PM - SONATRACH)", nameAr: "م. سالم (سوناطراك)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Sonatrach", companyId: "SONATRACH", avatarColor: "bg-amber-600", description: "Manages Joint Exploration Block NC-100 survey.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-sonatrach-fin", name: "Mr. Mustafa (Fin - SONATRACH)", nameAr: "أ. مصطفى (سوناطراك)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Sonatrach", companyId: "SONATRACH", avatarColor: "bg-amber-700", description: "Handles invoicing for Sonatrach projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Eni
  { id: "user-eni-pm", name: "Eng. Salem (PM - ENI)", nameAr: "م. سالم (إيني)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Eni North Africa B.V.", companyId: "ENI", avatarColor: "bg-green-600", description: "Manages offshore gas platform safety audit.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-eni-fin", name: "Mr. Mustafa (Fin - ENI)", nameAr: "أ. مصطفى (إيني)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Eni North Africa B.V.", companyId: "ENI", avatarColor: "bg-green-700", description: "Handles invoicing for Eni projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // NPCC
  { id: "user-npcc-pm", name: "Eng. Salem (PM - NPCC)", nameAr: "م. سالم (الهيئة الوطنية)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "National Petroleum Construction Company", companyId: "NPCC", avatarColor: "bg-violet-600", description: "Manages pipeline excavation & foundation.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-npcc-fin", name: "Mr. Mustafa (Fin - NPCC)", nameAr: "أ. مصطفى (الهيئة الوطنية)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "National Petroleum Construction Company", companyId: "NPCC", avatarColor: "bg-violet-700", description: "Handles invoicing for NPCC projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Jowfe
  { id: "user-jowfe-pm", name: "Eng. Salem (PM - JOWFE)", nameAr: "م. سالم (الجوف)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Jowfe Oil Technology", companyId: "JOWFE", avatarColor: "bg-indigo-600", description: "Manages drilling chemicals supply.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-jowfe-fin", name: "Mr. Mustafa (Fin - JOWFE)", nameAr: "أ. مصطفى (الجوف)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Jowfe Oil Technology", companyId: "JOWFE", avatarColor: "bg-indigo-700", description: "Handles invoicing for Jowfe projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Taknia
  { id: "user-taknia-pm", name: "Eng. Salem (PM - TAKNIA)", nameAr: "م. سالم (التقنية)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Taknia Libya Engineering", companyId: "TAKNIA", avatarColor: "bg-blue-600", description: "Manages FEED engineering studies.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-taknia-fin", name: "Mr. Mustafa (Fin - TAKNIA)", nameAr: "أ. مصطفى (التقنية)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Taknia Libya Engineering", companyId: "TAKNIA", avatarColor: "bg-blue-700", description: "Handles invoicing for Taknia projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // NDWC
  { id: "user-ndwc-pm", name: "Eng. Salem (PM - NDWC)", nameAr: "م. سالم (الوطنية للحفر)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "National Drilling & Workover Company", companyId: "NDWC", avatarColor: "bg-emerald-600", description: "Manages rig mobilization.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-ndwc-fin", name: "Mr. Mustafa (Fin - NDWC)", nameAr: "أ. مصطفى (الوطنية للحفر)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "National Drilling & Workover Company", companyId: "NDWC", avatarColor: "bg-emerald-700", description: "Handles invoicing for NDWC projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Nageco
  { id: "user-nageco-pm", name: "Eng. Salem (PM - NAGECO)", nameAr: "م. سالم (ناجيكو)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "North African Geophysical Company", companyId: "NAGECO", avatarColor: "bg-sky-600", description: "Manages 3D seismic survey NC-200.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-nageco-fin", name: "Mr. Mustafa (Fin - NAGECO)", nameAr: "أ. مصطفى (ناجيكو)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "North African Geophysical Company", companyId: "NAGECO", avatarColor: "bg-sky-700", description: "Handles invoicing for Nageco projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Murzuq
  { id: "user-murzuq-pm", name: "Eng. Salem (PM - MURZUQ)", nameAr: "م. سالم (مرزق)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Murzuq Oil Services Limited", companyId: "MURZUQ", avatarColor: "bg-rose-600", description: "Manages joint advisory projects.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-murzuq-fin", name: "Mr. Mustafa (Fin - MURZUQ)", nameAr: "أ. مصطفى (مرزق)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Murzuq Oil Services Limited", companyId: "MURZUQ", avatarColor: "bg-rose-700", description: "Handles invoicing for Murzuq projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Lifeco
  { id: "user-lifeco-pm", name: "Eng. Salem (PM - LIFECO)", nameAr: "م. سالم (لايفكو)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Libyan Fertilizer Company", companyId: "LIFECO", avatarColor: "bg-lime-600", description: "Manages urea plant maintenance.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-lifeco-fin", name: "Mr. Mustafa (Fin - LIFECO)", nameAr: "أ. مصطفى (لايفكو)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Libyan Fertilizer Company", companyId: "LIFECO", avatarColor: "bg-lime-700", description: "Handles invoicing for Lifeco projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Catering
  { id: "user-catering-pm", name: "Eng. Salem (PM - CATERING)", nameAr: "م. سالم (التموين)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "National Catering Company", companyId: "CATERING", avatarColor: "bg-pink-600", description: "Manages field catering logistics.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-catering-fin", name: "Mr. Mustafa (Fin - CATERING)", nameAr: "أ. مصطفى (التموين)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "National Catering Company", companyId: "CATERING", avatarColor: "bg-pink-700", description: "Handles invoicing for Catering projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Petroair
  { id: "user-petroair-pm", name: "Eng. Salem (PM - PETROAIR)", nameAr: "م. سالم (بترو إير)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Petro Air Company", companyId: "PETROAIR", avatarColor: "bg-blue-600", description: "Manages aviation transport.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-petroair-fin", name: "Mr. Mustafa (Fin - PETROAIR)", nameAr: "أ. مصطفى (بترو إير)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Petro Air Company", companyId: "PETROAIR", avatarColor: "bg-blue-700", description: "Handles invoicing for Petroair projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Nafusah
  { id: "user-nafusah-pm", name: "Eng. Salem (PM - NAFUSAH)", nameAr: "م. سالم (نفوسة)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Nafusah Oil Operations Company", companyId: "NAFUSAH", avatarColor: "bg-amber-600", description: "Manages Hamada field preparation.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-nafusah-fin", name: "Mr. Mustafa (Fin - NAFUSAH)", nameAr: "أ. مصطفى (نفوسة)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Nafusah Oil Operations Company", companyId: "NAFUSAH", avatarColor: "bg-amber-700", description: "Handles invoicing for Nafusah projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Mabruk
  { id: "user-mabruk-pm", name: "Eng. Salem (PM - MABRUK)", nameAr: "م. سالم (مبروك)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Mabruk Oil Operations", companyId: "MABRUK", avatarColor: "bg-red-600", description: "Manages offshore platform upgrades.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-mabruk-fin", name: "Mr. Mustafa (Fin - MABRUK)", nameAr: "أ. مصطفى (مبروك)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Mabruk Oil Operations", companyId: "MABRUK", avatarColor: "bg-red-700", description: "Handles invoicing for Mabruk projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Sarir
  { id: "user-sarir-pm", name: "Eng. Salem (PM - SARIR)", nameAr: "م. سالم (السرير)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Sarir Oil Operations Company", companyId: "SARIR", avatarColor: "bg-green-600", description: "Manages mechanical overhauls.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-sarir-fin", name: "Mr. Mustafa (Fin - SARIR)", nameAr: "أ. مصطفى (السرير)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Sarir Oil Operations Company", companyId: "SARIR", avatarColor: "bg-green-700", description: "Handles invoicing for Sarir projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Lerco
  { id: "user-lerco-pm", name: "Eng. Salem (PM - LERCO)", nameAr: "م. سالم (ليركو)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Libyan Emirates Refining Company", companyId: "LERCO", avatarColor: "bg-orange-600", description: "Manages refinery desalination upgrades.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-lerco-fin", name: "Mr. Mustafa (Fin - LERCO)", nameAr: "أ. مصطفى (ليركو)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Libyan Emirates Refining Company", companyId: "LERCO", avatarColor: "bg-orange-700", description: "Handles invoicing for Lerco projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Clinic
  { id: "user-clinic-pm", name: "Eng. Salem (PM - CLINIC)", nameAr: "م. سالم (المصحة)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Oil Clinic", companyId: "CLINIC", avatarColor: "bg-indigo-600", description: "Manages medical renovations.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-clinic-fin", name: "Mr. Mustafa (Fin - CLINIC)", nameAr: "أ. مصطفى (المصحة)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Oil Clinic", companyId: "CLINIC", avatarColor: "bg-indigo-700", description: "Handles invoicing for Clinic projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Stcpi
  { id: "user-stcpi-pm", name: "Eng. Salem (PM - STCPI)", nameAr: "م. سالم (مركز التدريب النوعي)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "The Specific Training Center of Petroleum Industrial", companyId: "STCPI", avatarColor: "bg-rose-600", description: "Manages training certifications.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-stcpi-fin", name: "Mr. Mustafa (Fin - STCPI)", nameAr: "أ. مصطفى (مركز التدريب النوعي)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "The Specific Training Center of Petroleum Industrial", companyId: "STCPI", avatarColor: "bg-rose-700", description: "Handles invoicing for Stcpi projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Ptqi
  { id: "user-ptqi-pm", name: "Eng. Salem (PM - PTQI)", nameAr: "م. سالم (معهد التدريب)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Petroleum Training and Qualifying Institute", companyId: "PTQI", avatarColor: "bg-teal-600", description: "Manages lab equipment upgrades.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-ptqi-fin", name: "Mr. Mustafa (Fin - PTQI)", nameAr: "أ. مصطفى (معهد التدريب)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Petroleum Training and Qualifying Institute", companyId: "PTQI", avatarColor: "bg-teal-700", description: "Handles invoicing for Ptqi projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Prc
  { id: "user-prc-pm", name: "Eng. Salem (PM - PRC)", nameAr: "م. سالم (مركز البحوث)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Petroleum Research Center", companyId: "PRC", avatarColor: "bg-amber-600", description: "Manages lab research studies.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-prc-fin", name: "Mr. Mustafa (Fin - PRC)", nameAr: "أ. مصطفى (مركز البحوث)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Petroleum Research Center", companyId: "PRC", avatarColor: "bg-amber-700", description: "Handles invoicing for Prc projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Sipt
  { id: "user-sipt-pm", name: "Eng. Salem (PM - SIPT)", nameAr: "م. سالم (معهد سبها)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Sebha Institute of Petroleum Technology", companyId: "SIPT", avatarColor: "bg-green-600", description: "Manages Southern field training.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-sipt-fin", name: "Mr. Mustafa (Fin - SIPT)", nameAr: "أ. مصطفى (معهد سبها)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Sebha Institute of Petroleum Technology", companyId: "SIPT", avatarColor: "bg-green-700", description: "Handles invoicing for Sipt projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] },

  // Api
  { id: "user-api-pm", name: "Eng. Salem (PM - API)", nameAr: "م. سالم (معهد أجدابيا)", role: "subsidiary_pm", roleLabel: "Subsidiary Project Manager", company: "Ajdabiya Petroleum Institute", companyId: "API", avatarColor: "bg-emerald-600", description: "Manages safety training courses.", capabilities: ["Submit new progress claims", "Add deliverables", "Upload site photos"] },
  { id: "user-api-fin", name: "Mr. Mustafa (Fin - API)", nameAr: "أ. مصطفى (معهد أجدابيا)", role: "subsidiary_finance", roleLabel: "Subsidiary Finance Officer", company: "Ajdabiya Petroleum Institute", companyId: "API", avatarColor: "bg-emerald-700", description: "Handles invoicing for Api projects.", capabilities: ["Submit commercial invoice", "Track earned value limits"] }
];

const escapePdfString = (str: string): string => {
  const asciiOnly = str.replace(/[^\x00-\x7F]/g, "?");
  return asciiOnly.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
};

const generateSecurePdf = (title: string, lines: string[]): Blob => {
  const encoder = new TextEncoder();
  const catalog = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const pages = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const page = "3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595.28 841.89] /Contents 5 0 R >>\nendobj\n";
  const font = "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
  
  let streamContent = "BT\n/F1 14 Tf\n50 780 Td\n";
  streamContent += `(${escapePdfString(title)}) Tj\n`;
  streamContent += "0 -20 Td\n(--------------------------------------------------------------------------------------) Tj\n";
  
  lines.forEach(line => {
    if (line.trim() === "") {
      streamContent += "0 -12 Td\n() Tj\n";
    } else {
      streamContent += `0 -14 Td\n(${escapePdfString(line)}) Tj\n`;
    }
  });
  
  streamContent += "ET\n";
  
  const streamContentBytes = encoder.encode(streamContent);
  const streamLength = streamContentBytes.length;
  
  const streamObjHeader = `5 0 obj\n<< /Length ${streamLength} >>\nstream\n`;
  const streamObjFooter = `\nendstream\nendobj\n`;
  
  const headerBytes = encoder.encode("%PDF-1.4\n");
  const catalogBytes = encoder.encode(catalog);
  const pagesBytes = encoder.encode(pages);
  const pageBytes = encoder.encode(page);
  const fontBytes = encoder.encode(font);
  const streamHeaderBytes = encoder.encode(streamObjHeader);
  const streamFooterBytes = encoder.encode(streamObjFooter);
  
  const offsets: number[] = [];
  let currentOffset = headerBytes.length;
  
  offsets.push(currentOffset); currentOffset += catalogBytes.length;
  offsets.push(currentOffset); currentOffset += pagesBytes.length;
  offsets.push(currentOffset); currentOffset += pageBytes.length;
  offsets.push(currentOffset); currentOffset += fontBytes.length;
  offsets.push(currentOffset); currentOffset += streamHeaderBytes.length + streamLength + streamFooterBytes.length;
  
  const startXref = currentOffset;
  let xref = "xref\n0 6\n0000000000 65535 f \n";
  offsets.forEach(off => {
    xref += `${String(off).padStart(10, '0')} 00000 n \n`;
  });
  
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
  const xrefBytes = encoder.encode(xref);
  const trailerBytes = encoder.encode(trailer);
  
  const totalLength = headerBytes.length +
                      catalogBytes.length +
                      pagesBytes.length +
                      pageBytes.length +
                      fontBytes.length +
                      streamHeaderBytes.length +
                      streamLength +
                      streamFooterBytes.length +
                      xrefBytes.length +
                      trailerBytes.length;
                      
  const pdfBytes = new Uint8Array(totalLength);
  let pos = 0;
  
  pdfBytes.set(headerBytes, pos); pos += headerBytes.length;
  pdfBytes.set(catalogBytes, pos); pos += catalogBytes.length;
  pdfBytes.set(pagesBytes, pos); pos += pagesBytes.length;
  pdfBytes.set(pageBytes, pos); pos += pageBytes.length;
  pdfBytes.set(fontBytes, pos); pos += fontBytes.length;
  pdfBytes.set(streamHeaderBytes, pos); pos += streamHeaderBytes.length;
  pdfBytes.set(streamContentBytes, pos); pos += streamLength;
  pdfBytes.set(streamFooterBytes, pos); pos += streamFooterBytes.length;
  pdfBytes.set(xrefBytes, pos); pos += xrefBytes.length;
  pdfBytes.set(trailerBytes, pos); pos += trailerBytes.length;
  
  return new Blob([pdfBytes], { type: "application/pdf" });
};

export default function App() {
  const { theme } = useTheme();
  // Current logged in demo user state
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(() => {
    const saved = localStorage.getItem("noc_logged_demo_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const match = DEMO_USERS.find(u => u.id === parsed.id);
        if (match) return match;
      } catch (e) {}
    }
    return null;
  });

  // State loaded from localStorage or fallback to initialClaims
  const [claims, setClaims] = useState<Claim[]>(() => {
    const saved = localStorage.getItem("noc_eppm_claims");
    if (saved && saved.includes("Form_4_Technical_Approval_WAHA-26-109.pdf")) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved claims", e);
      }
    }
    return JSON.parse(JSON.stringify(initialClaims));
  });

  const [selectedClaimId, setSelectedClaimId] = useState<string>(() => {
    const saved = localStorage.getItem("noc_eppm_claims");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      } catch (e) {}
    }
    return "claim-1";
  });

  // Active role syncing with current user
  const [activeRole, setActiveRole] = useState<RoleType>(() => {
    return currentUser ? currentUser.role : "pmo_auditor";
  });

  // Language state: English (en) or Arabic (ar)
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("noc_eppm_lang");
    return (saved as Lang) || "en";
  });

  const isRtl = lang === "ar";

  useEffect(() => {
    localStorage.setItem("noc_eppm_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const [activePush, setActivePush] = useState<NotificationItem | null>(null);

  useEffect(() => {
    if (activePush) {
      const timer = setTimeout(() => {
        setActivePush(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activePush]);

  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "claims" | "wbs" | "invoices" | "lcs" | "documents" | "users" | "profile" | "interactive_dashboard" | "notifications"
  >("interactive_dashboard");
  const [filterPriority, setFilterPriority] = useState<"all" | "high" | "standard">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected" | "info_requested" | "pending_financial_audit" | "authorized_for_payment">("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [auditorNotes, setAuditorNotes] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(1);
  const [previewTab, setPreviewTab] = useState<"document" | "metadata">("document");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem("noc_eppm_notifications");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved notifications", e);
      }
    }
    
    // Default notifications cloned for every demo user
    const defaultNotifs: NotificationItem[] = [];
    const baseNotifs = [
      {
        id: "notif-1",
        title: "Clarification Needed",
        message: "PMO Technical Auditor requested documentation clarification on WAHA-24-112.",
        timestamp: "2 hours ago",
        read: false,
        type: "warning" as const,
        claimId: "claim-5"
      },
      {
        id: "notif-2",
        title: "New Claim Submitted",
        message: "Waha Oil Company submitted a new technical progress claim WAHA-24-109 (€1,250,000).",
        timestamp: "Today, 09:00 AM",
        read: false,
        type: "info" as const,
        claimId: "claim-1"
      },
      {
        id: "notif-3",
        title: "Technical Approval Granted",
        message: "Sovereign audit approved progress claim AGOCO-24-042.",
        timestamp: "Yesterday",
        read: true,
        type: "success" as const,
        claimId: "claim-2"
      }
    ];

    DEMO_USERS.forEach(user => {
      baseNotifs.forEach(n => {
        defaultNotifs.push({
          ...n,
          id: `${n.id}-${user.id}`,
          userId: user.id
        });
      });
    });

    return defaultNotifs;
  });

  const addNotification = (
    title: string,
    message: string,
    type: "success" | "info" | "warning" | "error" = "info",
    claimId?: string,
    tab?: "claims" | "wbs" | "invoices" | "lcs" | "documents" | "notifications",
    targetUserId?: string,
    companyId?: string,
    actionRequired: boolean = false,
    priority: "high" | "normal" = "normal"
  ) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    
    const isUserAuthorized = (user: typeof DEMO_USERS[0]) => {
      if (targetUserId) {
        return user.id === targetUserId;
      }
      if (companyId) {
        return user.companyId === "NOC_HQ" || user.companyId === companyId;
      }
      return true;
    };

    const targetUsers = DEMO_USERS.filter(isUserAuthorized);

    const newNotifs: NotificationItem[] = targetUsers.map(user => ({
      id: `notif-${Date.now()}-${user.id}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      title,
      message,
      timestamp,
      read: false,
      type,
      claimId,
      tab,
      actionRequired,
      actionCompleted: false,
      priority,
      companyId: companyId || undefined
    }));

    if (newNotifs.length > 0) {
      setNotifications(prev => {
        let updatedPrev = prev;
        if (type === "success" && claimId) {
          updatedPrev = prev.map(n => 
            n.claimId === claimId && n.actionRequired ? { ...n, actionCompleted: true, read: true } : n
          );
        }
        return [...newNotifs, ...updatedPrev];
      });

      const currentNotif = newNotifs.find(n => n.userId === currentUser?.id);
      if (currentNotif) {
        setTimeout(() => {
          setActivePush(currentNotif);
        }, 600);
      }
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    // 1. Mark as read for this user
    setNotifications(prev => prev.map(n => n.id === notif.id && n.userId === currentUser?.id ? { ...n, read: true } : n));
    setIsNotificationsOpen(false);

    // 2. Identify target tab
    let targetTab: typeof activeTab = "claims";
    if (notif.tab) {
      targetTab = notif.tab;
    } else {
      const msg = (notif.message || "").toLowerCase();
      const title = (notif.title || "").toLowerCase();
      if (msg.includes("invoice") || title.includes("invoice") || msg.includes("فاتورة") || title.includes("فاتورة") || msg.includes("payment") || msg.includes("صرف") || msg.includes("الأموال")) {
        targetTab = "invoices";
      } else if (msg.includes("wbs") || title.includes("wbs") || msg.includes("هيكل تقسيم")) {
        targetTab = "wbs";
      } else if (msg.includes("document") || title.includes("document") || msg.includes("file") || msg.includes("ملف") || msg.includes("مستند")) {
        targetTab = "documents";
      } else if (msg.includes("raci") || title.includes("raci") || msg.includes("ledger") || title.includes("ledger") || msg.includes("sovereignty") || msg.includes("block") || msg.includes("security") || msg.includes("أمن") || msg.includes("دفتر")) {
        targetTab = "documents";
      }
    }

    // Switch tab
    setActiveTab(targetTab);

    // 3. Identify target claim
    let targetClaimId = notif.claimId;
    if (!targetClaimId) {
      // Find matching claim by code in title/message
      const text = `${notif.title} ${notif.message}`.toUpperCase();
      
      // Match explicit codes in text
      const matchedClaim = claims.find(c => text.includes(c.code.toUpperCase()));
      if (matchedClaim) {
        targetClaimId = matchedClaim.id;
      } else {
        // Fallback matching by company name/prefix
        if (text.includes("WAHA") || text.includes("الواحة")) {
          const c = claims.find(cl => cl.companyId === "WAHA");
          if (c) targetClaimId = c.id;
        } else if (text.includes("AGOCO") || text.includes("الخليج")) {
          const c = claims.find(cl => cl.companyId === "AGOCO");
          if (c) targetClaimId = c.id;
        } else if (text.includes("ZALLAF") || text.includes("زلاف")) {
          const c = claims.find(cl => cl.companyId === "ZALLAF");
          if (c) targetClaimId = c.id;
        } else if (text.includes("MELLITAH") || text.includes("مليتة")) {
          const c = claims.find(cl => cl.companyId === "MELLITAH");
          if (c) targetClaimId = c.id;
        }
      }
    }

    if (targetClaimId) {
      setSelectedClaimId(targetClaimId);
      
      // Check permission for current user
      let actualAllowed = claims.filter((c) => {
        if (currentUser && currentUser.companyId !== "NOC_HQ") {
          return c.companyId === currentUser.companyId;
        }
        return true;
      });

      const isAllowed = actualAllowed.some(c => c.id === targetClaimId);
      if (!isAllowed) {
        const claimToOpen = claims.find(c => c.id === targetClaimId);
        if (claimToOpen) {
          // Find matching demo user for this company or default to NOC HQ Technical Auditor
          const suitableUser = DEMO_USERS.find(u => u.companyId === claimToOpen.companyId && u.role === "subsidiary_pm") 
            || DEMO_USERS.find(u => u.companyId === "NOC_HQ" && u.role === "pmo_auditor");
          if (suitableUser) {
            setCurrentUser(suitableUser);
            setActiveRole(suitableUser.role);
            if (lang === "ar") {
              showToast(`تم تبديل الهوية تلقائياً إلى ${suitableUser.nameAr || suitableUser.name} لمراجعة هذه المطالبة.`, "info");
            } else {
              showToast(`Auto-switched session to ${suitableUser.name} to view this claim.`, "info");
            }
          }
        }
      } else {
        const finalClaim = claims.find(c => c.id === targetClaimId);
        if (finalClaim) {
          if (lang === "ar") {
            showToast(`تم الانتقال مباشرة إلى المطالبة: ${finalClaim.code} (${targetTab === "invoices" ? "الفواتير" : targetTab === "claims" ? "المراجعة" : "التفاصيل"})`, "info");
          } else {
            showToast(`Navigated directly to claim ${finalClaim.code} in ${targetTab} view.`, "info");
          }
        }
      }
    } else {
      if (lang === "ar") {
        showToast(`تم الانتقال إلى تبويب: ${targetTab}`, "info");
      } else {
        showToast(`Navigated to ${targetTab} view.`, "info");
      }
    }
  };

  useEffect(() => {
    localStorage.setItem("noc_eppm_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Subsidiary PM edit states
  const [editClaimedProgress, setEditClaimedProgress] = useState<number>(0);
  const [newDeliverableDesc, setNewDeliverableDesc] = useState("");
  const [newDeliverableWeight, setNewDeliverableWeight] = useState("5.0%");
  const [revisionComment, setRevisionComment] = useState("");
  const [isRevisionConfirmed, setIsRevisionConfirmed] = useState(false);

  // Subsidiary Finance submission states
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceAmt, setInvoiceAmt] = useState<number>(0);
  const [invoiceDocName, setInvoiceDocName] = useState("");

  // Manual Upload States
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileType, setUploadFileType] = useState<"PDF" | "XLSX" | "IMAGE">("PDF");
  const [uploadDocTypeTag, setUploadDocTypeTag] = useState<string>("general");
  // Form 4 Interactive editor states
  const [form4Classification, setForm4Classification] = useState<number>(1);
  const [form4OtherClassText, setForm4OtherClassText] = useState<string>("");
  const [form4IsConformant, setForm4IsConformant] = useState<boolean>(true);
  const [form4IsObjectionFree, setForm4IsObjectionFree] = useState<boolean>(true);
  const [form4Notes, setForm4Notes] = useState<string>("");
  
  // Form 2 Interactive States
  const [form2Contractor, setForm2Contractor] = useState("Schlumberger Middle East S.A");
  const [form2InvoiceNo, setForm2InvoiceNo] = useState("INV-2026-001");
  const [form2InvoiceDate, setForm2InvoiceDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [form2InvoiceValue, setForm2InvoiceValue] = useState(0);
  const [form2Is100, setForm2Is100] = useState(true);
  const [form2Partial, setForm2Partial] = useState(0);
  const [form2Barrels, setForm2Barrels] = useState(0);
  
  const [form2HasBol, setForm2HasBol] = useState(false);
  const [form2HasReceipt, setForm2HasReceipt] = useState(false);
  const [form2HasInvoice, setForm2HasInvoice] = useState(false);
  const [form2HasTech, setForm2HasTech] = useState(false);
  
  const [form2Words, setForm2Words] = useState("");
  const [form2Eng, setForm2Eng] = useState("");
  const [form2Dept, setForm2Dept] = useState("");
  const [form2Fin, setForm2Fin] = useState("");
  const [form2Chair, setForm2Chair] = useState("");
  const [form4Recommendation, setForm4Recommendation] = useState<"approve" | "partial" | "reject">("approve");
  const [form4PartialValue, setForm4PartialValue] = useState<string>("");
  const [form4PreparedBy, setForm4PreparedBy] = useState<string>("Eng. Salem Al-Obeidi");
  const [form4ApprovedBy, setForm4ApprovedBy] = useState<string>("Eng. Nadia Al-Kout");
  const [form4Dept, setForm4Dept] = useState<string>("projects");

  useEffect(() => {
    if (previewDoc && (previewDoc.name.startsWith("Form_4_Technical_Approval_") || previewDoc.document_type === "technical_approval_form")) {
      const hostClaim = claims.find(c => c.documents.some(d => d.id === previewDoc.id));
      if (hostClaim) {
        setForm4Notes(hostClaim.auditorNotes || "");
        setForm4PreparedBy(hostClaim.submittedBy || "Eng. Salem Al-Obeidi");
        const savedData = (previewDoc as any).form4Data;
        if (savedData) {
          setForm4Classification(savedData.projectClassification ?? 1);
          setForm4OtherClassText(savedData.otherClassificationText ?? "");
          setForm4IsConformant(savedData.isConformant ?? true);
          setForm4IsObjectionFree(savedData.isObjectionFree ?? true);
          setForm4Notes(savedData.technicalNotes ?? hostClaim.auditorNotes ?? "");
          setForm4Recommendation(savedData.recommendation ?? "approve");
          setForm4PartialValue(savedData.partialValue ?? "");
          setForm4PreparedBy(savedData.preparedByName ?? hostClaim.submittedBy ?? "Eng. Salem Al-Obeidi");
          setForm4ApprovedBy(savedData.approvedByName ?? "Eng. Nadia Al-Kout");
          setForm4Dept(savedData.deptType ?? "projects");
        }
      }
    }
  }, [previewDoc, claims]);

  const handleSaveForm2 = () => {
    if (!previewDoc) return;
    const cid = previewDoc.claimId || previewDoc.project_id;
    if (!cid) return;

    if (!form2HasBol || !form2HasReceipt || !form2HasInvoice || !form2HasTech) {
      showToast(isRtl ? "يرجى توفير المرفقات الأربعة الإلزامية كشرط أساسي." : "Please confirm all 4 mandatory attachments are provided.", "error");
      return;
    }
    
    // Auto sign for subsidiary
    const autoEng = form2Eng || currentUser?.name || "";
    setForm2Eng(autoEng);
    const autoFin = form2Fin || "Verified Finance Mgr";
    setForm2Fin(autoFin);
    const autoChair = form2Chair || "Verified Chairman";
    setForm2Chair(autoChair);
    const autoDept = form2Dept || "Verified Dept Mgr";
    setForm2Dept(autoDept);

    const data = {
      contractorName: form2Contractor,
      invoiceNumber: form2InvoiceNo,
      invoiceDate: form2InvoiceDate,
      invoiceValue: form2InvoiceValue,
      is100Percent: form2Is100,
      partialPercent: form2Partial,
      productionImpactBarrels: form2Barrels,
      hasBol: form2HasBol,
      hasReceipt: form2HasReceipt,
      hasInvoice: form2HasInvoice,
      hasTech: form2HasTech,
      valueInWords: form2Words,
      signedByEngineer: autoEng,
      signedByDeptManager: autoDept,
      signedByFinanceManager: autoFin,
      signedByChairman: autoChair,
    };
    localStorage.setItem(`form2Data_${cid}`, JSON.stringify(data));
    
    // Status change to pending_financial_audit
    const updated = claims.map(c => {
      if (c.id === cid) {
        return {
          ...c,
          status: "pending_financial_audit" as const,
          auditLog: [
            {
              id: `log-${Date.now()}`,
              user: currentUser?.name || "Subsidiary Delegate",
              action: "Form 2 Submitted",
              change: "Form 2 (Certificate of Conformity) finalized and signed. Prerequisite attachments verified. Project advanced to Pending Central Audit.",
              timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
            },
            ...c.auditLog
          ]
        };
      }
      return c;
    });
    setClaims(updated);
    
    showToast(isRtl ? "تم توقيع واعتماد النموذج 2. تم تغيير الحالة لانتظار المراجعة المركزية." : "Form 2 signed and approved. Status advanced to Pending Central Audit.", "success");
  };

  const handleSaveForm4 = () => {
    if (!previewDoc) return;
    const hostClaim = claims.find(c => c.documents.some(d => d.id === previewDoc.id));
    if (!hostClaim) return;

    const updatedClaims = claims.map(c => {
      if (c.id === hostClaim.id) {
        const updatedDocs = c.documents.map(d => {
          if (d.id === previewDoc.id) {
            return {
              ...d,
              form4Data: {
                projectClassification: form4Classification,
                otherClassificationText: form4OtherClassText,
                isConformant: form4IsConformant,
                isObjectionFree: form4IsObjectionFree,
                technicalNotes: form4Notes,
                recommendation: form4Recommendation,
                partialValue: form4PartialValue,
                preparedByName: form4PreparedBy,
                approvedByName: form4ApprovedBy,
                deptType: form4Dept,
                signedAt: new Date().toISOString()
              }
            };
          }
          return d;
        });
        return {
          ...c,
          documents: updatedDocs
        };
      }
      return c;
    });
    setClaims(updatedClaims);
    showToast("Technical Approval Form (Form 4) signed and synchronized successfully.", "success");
    setPreviewDoc(null);
  };

  const [isDragging, setIsDragging] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("noc_eppm_claims", JSON.stringify(claims));
  }, [claims]);

  // Sync user changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("noc_logged_demo_user", JSON.stringify(currentUser));
      setActiveRole(currentUser.role);
    } else {
      localStorage.removeItem("noc_logged_demo_user");
    }
  }, [currentUser]);

  // Allowed Claims based on company security authorization
  const allowedClaims = claims.filter((c) => {
    if (currentUser && currentUser.companyId !== "NOC_HQ") {
      return c.companyId === currentUser.companyId;
    }
    return true;
  });

  // Filter notifications to only the current logged-in user's notifications
  const userNotifications = notifications.filter((n) => n.userId === currentUser?.id);

  // Selected Claim calculation from authorized list
  const selectedClaim = allowedClaims.find((c) => c.id === selectedClaimId) || allowedClaims[0];

  // Update edit and review states when selected claim changes
  useEffect(() => {
    if (selectedClaim) {
      // Only pre-populate auditorNotes if the claim is pending (acting as an active review draft).
      // For already approved, rejected or info-requested states, we want a clean textarea slate.
      if (selectedClaim.status === "pending") {
        setAuditorNotes(selectedClaim.auditorNotes || "");
      } else {
        setAuditorNotes("");
      }
      setEditClaimedProgress(selectedClaim.claimedProgress);
      setIsRevisionConfirmed(false);
      setRevisionComment("");
      // Reset financial inputs
      setInvoiceNo(selectedClaim.invoiceNumber || `INV-${selectedClaim.code}-${Math.floor(100 + Math.random() * 900)}`);
      
      // Calculate an initial recommended invoice amount = Earned Value (Progress * budget / 100)
      const earnedValue = Math.round((selectedClaim.claimedProgress / 100) * selectedClaim.numericValue);
      setInvoiceAmt(selectedClaim.invoiceAmount || earnedValue);
      setInvoiceDocName(selectedClaim.invoiceNumber ? `Invoice_${selectedClaim.invoiceNumber}.pdf` : "");
    }
  }, [selectedClaimId, selectedClaim]);

  // Toast handler
  const showToast = (text: string, type: "success" | "info" | "error" = "success") => {
    if (toastTimeout) clearTimeout(toastTimeout);
    setToastMessage({ text, type });
    toastTimeout = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Search and Filter claims
  const filteredClaims = allowedClaims.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || c.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    const matchesCompany = filterCompany === "all" || c.companyId === filterCompany;
    return matchesSearch && matchesPriority && matchesStatus && matchesCompany;
  });

  // Handle Login
  const handleLoginUser = async (user: DemoUser) => {
    let isSuspended = false;
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      if (res.ok) {
        const users = await res.json();
        const dbUser = users.find((u: any) => u.email === (user as any).email || u.id === user.id);
        if (dbUser && dbUser.status === 'SUSPENDED') {
          isSuspended = true;
        }
      } else {
        console.error("API error: ", res.status);
      }
    } catch (e) {
      console.error("Failed to check user status", e);
    }

    if (isSuspended) {
      const msg = isRtl ? 'هذا المستخدم موقوف، يرجى الاتصال بمسؤول النظام للحصول على المساعدة' : 'this user is suspended please call noc admin for help';
      showToast(msg, 'error');
      
      return;
    }

    // Acquire secure JWT from backend
    try {
      const emailMap: Record<string, string> = {
        "user-noc-admin": "khaled.sec@noc.ly",
        "user-noc-pmo": "nadia@noc.ly",
        "user-noc-fin": "abdelrahman@noc.ly",
        "user-noc-head": "salma@noc.ly",
        "user-waha-pm": "tarek@wahaoil.ly",
        "user-waha-fin": "mustafa@wahaoil.ly",
        "user-agoco-pm": "salem@agoco.ly",
        "user-agoco-fin": "bashir@agoco.ly",
        "user-zallaf-pm": "muftah@zallaf.ly",
        "user-zallaf-fin": "ahmed@zallaf.ly",
        "user-mellitah-pm": "ali@mellitah.ly",
        "user-mellitah-fin": "ibrahim@mellitah.ly",
      };
      const userEmail = emailMap[user.id] || "";
      const authRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password: 'password123' })
      });
      if (authRes.ok) {
        const authData = await authRes.json();
        localStorage.setItem("noc_jwt_token", authData.token);
      }
    } catch (e) {
      console.error("Failed to authenticate session", e);
    }

    setCurrentUser(user);
    setActiveRole(user.role);
    setFilterCompany("all");
    if (user.role === 'system_admin') {
      setActiveTab('users');
    } else {
      setActiveTab('interactive_dashboard');
    }
    if (lang === "ar") {
      const companyAr = TENANT_AR[user.companyId]?.name || user.company;
      showToast(`تم تسجيل الدخول بنجاح بصفتك ${user.nameAr || user.name} (${companyAr})`, "success");
    } else {
      showToast(`Successfully logged in as ${user.name} (${user.company})`, "success");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("noc_jwt_token");
    setCurrentUser(null);
    setFilterCompany("all");
    showToast("Logged out of session.", "info");
  };


  // 1. PMO Technical Audit Action: Approve
  const handleApproveTechnical = () => {
    if (!selectedClaim) return;
    
    const updated = claims.map((c) => {
      if (c.id === selectedClaim.id) {
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: `${currentUser?.name || "NOC PMO Technical Auditor"}`,
          action: "Approve",
          change: `Approved technical progress rate (${c.claimedProgress}%) and certified milestone deliverables. Subsidiary invoicing unlocked.${auditorNotes.trim() ? ` Remarks: "${auditorNotes.trim()}"` : ""}`,
          timestamp: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        const newForm4Doc = {
          id: `doc-form4-${Date.now()}`,
          name: `Form_4_Technical_Approval_${c.code}.pdf`,
          size: "1.2 MB",
          uploadedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          type: "PDF" as const,
          url: `/noc_vault/evidence/Form_4_Technical_Approval_${c.code}.pdf`
        };

        return {
          ...c,
          status: "approved" as const,
          auditorNotes,
          documents: [...c.documents, newForm4Doc],
          auditLog: [newLog, ...c.auditLog],
        };
      }
      return c;
    });
    
    setClaims(updated);
    setAuditorNotes("");
    showToast(`Technical progress approved successfully for claim ${selectedClaim.code}. Invoicing is now unlocked.`, "success");
    addNotification("Technical Approval Granted", `Claim ${selectedClaim.code} has been approved technically. Invoicing is now unlocked.`, "success");
  };

  // 2. PMO Technical Audit Action: Reject
  const handleRejectTechnical = () => {
    if (!selectedClaim) return;
    if (!auditorNotes.trim()) {
      showToast("Please write a rejection reason in the audit notes field. This is mandatory.", "error");
      return;
    }

    const updated = claims.map((c) => {
      if (c.id === selectedClaim.id) {
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: `${currentUser?.name || "NOC PMO Technical Auditor"}`,
          action: "Reject",
          change: `Rejected technical progress claim due to insufficient deliverables and alignment gaps. Reason: "${auditorNotes.trim()}"`,
          timestamp: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        return {
          ...c,
          status: "rejected" as const,
          auditorNotes,
          auditLog: [newLog, ...c.auditLog],
        };
      }
      return c;
    });

    setClaims(updated);
    setAuditorNotes("");
    showToast(`Technical progress claim ${selectedClaim.code} rejected. Sent back to the subsidiary for revision.`, "info");
    addNotification("Technical Progress Rejected", `Technical progress claim ${selectedClaim.code} has been rejected by central PMO.`, "error");
  };

  // 3. PMO Technical Audit Action: Request Info
  const handleRequestInfoTechnical = () => {
    if (!selectedClaim) return;
    if (!auditorNotes.trim()) {
      showToast("Please enter specific questions or missing document requirements in the audit notes first.", "error");
      return;
    }

    const updated = claims.map((c) => {
      if (c.id === selectedClaim.id) {
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: `${currentUser?.name || "NOC PMO Technical Auditor"}`,
          action: "Request Info",
          change: `Requested additional technical specifications and clarification notes. Clarification Needed: "${auditorNotes.trim()}"`,
          timestamp: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        return {
          ...c,
          status: "info_requested" as const,
          auditorNotes,
          auditLog: [newLog, ...c.auditLog],
        };
      }
      return c;
    });

    setClaims(updated);
    setAuditorNotes("");
    showToast(`Clarification info requested for claim ${selectedClaim.code}. Notifications sent to Subsidiary PM.`, "info");
    addNotification("Clarification Requested", `NOC PMO requested additional engineering clarification on claim ${selectedClaim.code}.`, "warning");
  };

  // 4. Subsidiary PM Action: Resubmit progress claim
  const handlePMResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    if (editClaimedProgress <= selectedClaim.previousProgress) {
      showToast("Claimed progress must be strictly greater than the previously approved baseline.", "error");
      return;
    }

    if (!isRevisionConfirmed) {
      showToast(
        isRtl 
          ? "الرجاء تأكيد الإقرار الهندسي وصحة القياسات لتتمكن من إعادة التقديم." 
          : "Please check the confirmation box to verify engineering accuracy before resubmitting.", 
        "error"
      );
      return;
    }

    const hasTechnicalApproval = selectedClaim.documents.some(
      (doc) => doc.document_type === "technical_approval_form"
    );
    if (!hasTechnicalApproval) {
      showToast(
        isRtl
          ? "تنبيه: يجب تحميل 'نموذج الاعتماد الفني للأعمال المنجزة' (Form 4) أولاً لتتمكن من تقديم المطالبة."
          : "Submission Blocked: A Technical Approval Form (Form 4) is mandatory before resubmitting or advancing this project claim.",
        "error"
      );
      return;
    }

    // Call Backend Validation Check API Submission Endpoint
    try {
      const token = localStorage.getItem("noc_jwt_token");
      const validateRes = await fetch("/api/claims/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + (token || "")
        },
        body: JSON.stringify({
          project_id: selectedClaim.id,
          company_id: selectedClaim.companyId,
          documents: selectedClaim.documents
        })
      });
      
      if (!validateRes.ok) {
        const errorData = await validateRes.json();
        showToast(errorData.error || "Submission rejected by backend security policy.", "error");
        return;
      }
    } catch (err) {
      console.error("Backend submission check failed:", err);
      showToast("Backend validation check failed.", "error");
      return;
    }

    const updated = claims.map((c) => {
      if (c.id === selectedClaim.id) {
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: `${currentUser?.name || "Subsidiary Project Manager"}`,
          action: "Resubmit",
          change: isRtl
            ? `تم إعادة تقديم تقدم العمل المالي بنسبة مراجعة ${editClaimedProgress}%. ${revisionComment.trim() ? ` مبررات المقاول: "${revisionComment.trim()}"` : ""}`
            : `Resubmitted technical progress revised to ${editClaimedProgress}%. ${revisionComment.trim() ? ` Contractor Comment: "${revisionComment.trim()}"` : ""}`,
          timestamp: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        return {
          ...c,
          status: "pending" as const,
          claimedProgress: editClaimedProgress,
          auditorNotes: "", // Clear prior audit warnings on new revision
          auditLog: [newLog, ...c.auditLog],
        };
      }
      return c;
    });

    setClaims(updated);
    setIsRevisionConfirmed(false);
    setRevisionComment("");
    showToast(`Progress claim ${selectedClaim.code} resubmitted successfully to NOC PMO.`, "success");
    addNotification("Claim Resubmitted", `Subsidiary PM resubmitted progress claim ${selectedClaim.code} with revised progress (${editClaimedProgress}%).`, "info");
  };

  // 5. Subsidiary PM Action: Add Deliverable to claim
  const handlePMAddDeliverable = () => {
    if (!selectedClaim || !newDeliverableDesc.trim()) return;

    const newDel: Deliverable = {
      id: `del-${Date.now()}`,
      description: newDeliverableDesc,
      weight: newDeliverableWeight,
      status: "completed",
    };

    const updated = claims.map((c) => {
      if (c.id === selectedClaim.id) {
        return {
          ...c,
          deliverables: [...c.deliverables, newDel],
        };
      }
      return c;
    });

    setClaims(updated);
    setNewDeliverableDesc("");
    showToast("New verified milestone deliverable added to active claim cycle.", "success");
    addNotification("Deliverable Appended", `New physical deliverable added to claim ${selectedClaim.code}: "${newDeliverableDesc}".`, "success");
  };

  // 6. Subsidiary Finance Action: Submit Commercial Invoice
  const handleFinanceSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    if (!invoiceNo.trim()) {
      showToast("Please specify the commercial invoice reference ID.", "error");
      return;
    }

    if (invoiceAmt <= 0) {
      showToast("Please enter a valid monetary invoice amount.", "error");
      return;
    }

    // Earned Value constraint check
    const earnedValue = (selectedClaim.claimedProgress / 100) * selectedClaim.numericValue;
    if (invoiceAmt > earnedValue) {
      showToast("Invoicing blocked: Proposed amount exceeds the technically earned value threshold.", "error");
      return;
    }

    const updated = claims.map((c) => {
      if (c.id === selectedClaim.id) {
        const formattedAmount = `€${invoiceAmt.toLocaleString("en-US")}`;
        const newInvoiceDoc: Document = {
          id: `doc-inv-${Date.now()}`,
          name: invoiceDocName || `Commercial_Invoice_${invoiceNo}.pdf`,
          size: "1.4 MB",
          uploadedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          type: "PDF",
        };

        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: `${currentUser?.name || "Subsidiary Finance Team"}`,
          action: "Invoice Uploaded",
          change: `Issued commercial invoice ${invoiceNo} valued at ${formattedAmount}. Value is compliant with technical Earned Value limit.`,
          timestamp: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        return {
          ...c,
          status: "pending_financial_audit" as const,
          invoiceNumber: invoiceNo,
          invoiceAmount: invoiceAmt,
          documents: [...c.documents, newInvoiceDoc],
          auditLog: [newLog, ...c.auditLog],
        };
      }
      return c;
    });

    setClaims(updated);
    showToast(`Commercial invoice ${invoiceNo} submitted for final financial audit clearance.`, "success");
    addNotification("Commercial Invoice Filed", `Invoice ${invoiceNo} (valued at €${invoiceAmt.toLocaleString()}) filed for claim ${selectedClaim.code}.`, "success");
  };

  // 7. NOC Financial Auditor Action: Authorize payment and lock phase
  const handleAuthorizePayment = () => {
    if (!selectedClaim) return;

    const secureToken = `NOC-AUTH-${selectedClaim.companyId}-${Math.floor(1000 + Math.random() * 9000)}-${selectedClaim.code.substring(selectedClaim.code.lastIndexOf("-") + 1)}`;

    const updated = claims.map((c) => {
      if (c.id === selectedClaim.id) {
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: `${currentUser?.name || "NOC Central Finance"}`,
          action: "Authorize Payment",
          change: `Commercial invoice cleared. Central ERP payment authorized. Authorization Token: ${secureToken}`,
          timestamp: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        return {
          ...c,
          status: "authorized_for_payment" as const,
          paymentToken: secureToken,
          auditLog: [newLog, ...c.auditLog],
        };
      }
      return c;
    });

    setClaims(updated);
    showToast(`Invoice payment authorized successfully. Generated NOC authorization token. Claim phase locked.`, "success");
    addNotification("Sovereign Fund Authorization", `Central payment authorized for claim ${selectedClaim.code}. Secure ERP token generated.`, "success");
  };

  // Drag and Drop simulated upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!selectedClaim) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const isImg = file.type.startsWith("image/");
      const isXls = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
      
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        type: isImg ? "IMAGE" : isXls ? "XLSX" : "PDF",
        url: isImg ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCBZO1wG_qTW9XLoXNcznnSQgbs4e8ez-KDVUHGDAAbEYHF8wDzJYk6fn4S1KIx0-bXpvE23YX_vq9tEyudiSmkotFuwrE8fnQNNZf391uNH-es6OmiSmWBWcvbnDJik6FkUrG1fvo3HNvs7R0YLmAx_OfANRM_TjXiachEv6E87tTVcYL4MEiufFsntpSRem8FwWC8bYiNxQC1t9kpTG22wBvQ8zxb6nU-eYqfB7FnZcPcB-GYAM6T1A" : undefined,
      };

      const updatedClaims = claims.map((c) => {
        if (c.id === selectedClaim.id) {
          return {
            ...c,
            documents: [...c.documents, newDoc],
          };
        }
        return c;
      });

      setClaims(updatedClaims);
      showToast(`Supporting file "${file.name}" uploaded successfully.`, "success");
    }
  };

  // Manual File Form submit
  const handleManualUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim || !uploadFileName.trim()) return;

    const extension = uploadFileType === "PDF" ? ".pdf" : uploadFileType === "XLSX" ? ".xlsx" : ".jpg";
    const fullName = uploadFileName.includes(".") ? uploadFileName : `${uploadFileName}${extension}`;

    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name: fullName,
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      uploadedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      type: uploadFileType,
      url: uploadFileType === "IMAGE" ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCBZO1wG_qTW9XLoXNcznnSQgbs4e8ez-KDVUHGDAAbEYHF8wDzJYk6fn4S1KIx0-bXpvE23YX_vq9tEyudiSmkotFuwrE8fnQNNZf391uNH-es6OmiSmWBWcvbnDJik6FkUrG1fvo3HNvs7R0YLmAx_OfANRM_TjXiachEv6E87tTVcYL4MEiufFsntpSRem8FwWC8bYiNxQC1t9kpTG22wBvQ8zxb6nU-eYqfB7FnZcPcB-GYAM6T1A" : undefined,
    };

    const updatedClaims = claims.map((c) => {
      if (c.id === selectedClaim.id) {
        return {
          ...c,
          documents: [...c.documents, newDoc],
        };
      }
      return c;
    });

    setClaims(updatedClaims);
    setUploadFileName("");
    showToast(`Document "${fullName}" registered and appended to evidence folder.`, "success");
  };

  // Reset demo state
  const resetDemo = () => {
    localStorage.removeItem("noc_eppm_claims");
    localStorage.removeItem("noc_eppm_notifications");
    localStorage.removeItem("noc_logged_demo_user");
    localStorage.removeItem("noc_eppm_wbs_data");
    localStorage.removeItem("noc_eppm_projects_list_pmi");
    
    // Deep clone initialClaims to prevent mutation sharing
    const pristineClaims = JSON.parse(JSON.stringify(initialClaims));
    setClaims(pristineClaims);
    setSelectedClaimId("claim-1");
    
    // Reset notifications back to pristine defaults
    const defaultNotifs: NotificationItem[] = [];
    const baseNotifs = [
      {
        id: "notif-1",
        title: "Clarification Needed",
        message: "PMO Technical Auditor requested documentation clarification on WAHA-24-110.",
        timestamp: "2 hours ago",
        read: false,
        type: "warning" as const
      },
      {
        id: "notif-2",
        title: "New Claim Submitted",
        message: "Waha Oil Company submitted a new technical progress claim (€500,000).",
        timestamp: "Today, 09:00 AM",
        read: false,
        type: "info" as const
      },
      {
        id: "notif-3",
        title: "Technical Approval Granted",
        message: "Sovereign audit approved progress claim AGOCO-24-789.",
        timestamp: "Yesterday",
        read: true,
        type: "success" as const
      }
    ];

    DEMO_USERS.forEach(user => {
      baseNotifs.forEach(n => {
        defaultNotifs.push({
          ...n,
          id: `${n.id}-${user.id}`,
          userId: user.id
        });
      });
    });

    setNotifications(defaultNotifs);
    
    // Reset tabs and session details
    setActiveTab("interactive_dashboard");
    setCurrentUser(null);
    setActiveRole("pmo_auditor");
    
    showToast("Application data and notification logs have been successfully reset to default metrics.", "info");

    // Force a full clean reload of the page after 500ms to allow local storage changes to settle and reload all component states cleanly
    toastTimeout = setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Status color mapper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "authorized_for_payment":
        return <span className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Authorized & Locked</span>;
      case "pending_head_of_accounts_approval":
        return <span className="bg-fuchsia-100 text-fuchsia-800 text-[11px] font-bold px-3 py-1 rounded-full border border-fuchsia-200 flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-fuchsia-600 animate-pulse" /> Release Pending</span>;
      case "pending_financial_audit":
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1"><Receipt className="w-3.5 h-3.5" /> Financial Audit</span>;
      case "approved":
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Technically Approved</span>;
      case "rejected":
        return <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1"><ThumbsDown className="w-3.5 h-3.5" /> Rejected (PMO)</span>;
      case "info_requested":
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Clarification Req.</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">Technical Audit Pending</span>;
    }
  };

  const getRoleBadgeColor = (role: RoleType) => {
    switch (role) {
      case "pmo_auditor":
        return "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/25";
      case "subsidiary_pm":
        return "bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/25";
      case "subsidiary_finance":
        return "bg-indigo-900 hover:bg-indigo-800 text-white shadow-md shadow-indigo-900/25";
      case "noc_finance":
        return "bg-purple-900 hover:bg-purple-800 text-white shadow-md shadow-purple-900/25";
      case "noc_head_of_accounts":
        return "bg-fuchsia-900 hover:bg-fuchsia-800 text-white shadow-md shadow-fuchsia-900/25";
      case "system_admin":
        return "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/25";
      case "steering_committee":
        return "bg-emerald-800 hover:bg-emerald-900 text-white shadow-md shadow-emerald-800/25";
      default:
        return "bg-slate-900 text-white";
    }
  };

  const getRoleLabel = (role: RoleType) => {
    if (isRtl) {
      switch (role) {
        case "pmo_auditor":
          return "المدقق الفني للمؤسسة (NOC PMO)";
        case "subsidiary_pm":
          return "مدير مشروع الشركة المشغلة";
        case "subsidiary_finance":
          return "المسؤول المالي للشركة المشغلة";
        case "subsidiary_dept":
          return "مدير الإدارة المختصة";
        case "subsidiary_chairman":
          return "رئيس لجنة الإدارة";
        case "noc_finance":
          return "المدقق المالي للمؤسسة (NOC Finance)";
        case "noc_head_of_accounts":
          return "رئيس الحسابات العام للمؤسسة";
        case "system_admin" as any:
          return "مسؤول أمن النظام";
        case "steering_committee":
          return "رئيس لجنة الإدارة";
      }
    }
    switch (role) {
      case "pmo_auditor":
        return "Technical Auditor (NOC PMO)";
      case "subsidiary_pm":
        return "Operating Subsidiary PM (Contractor)";
      case "subsidiary_finance":
        return "Subsidiary Finance Team";
      case "subsidiary_dept":
        return "Specialized Dept Manager";
      case "subsidiary_chairman":
        return "Subsidiary Chairman";
      case "noc_finance":
        return "Financial Auditor (NOC Finance)";
      case "noc_head_of_accounts":
        return "Head of Accounts (NOC Accounts)";
      case "system_admin" as any:
        return "System Security Administrator";
      case "steering_committee":
        return "Chairman of the Management Committee";
    }
  };

  // If NOT logged in as a demo user, show the two-step Company → User portal
  if (!currentUser) {
    return (
      <>
        <PortalEntry
          allUsers={DEMO_USERS}
          onLogin={handleLoginUser}
          lang={lang}
          toastMessage={toastMessage}
          onLangChange={(l) => {
            setLang(l as Lang);
            if (l === "ar") showToast("تم تحويل لغة الواجهة إلى العربية.", "info");
            else showToast("Interface language changed to English.", "info");
          }}
          onResetRequest={() => setIsResetConfirmOpen(true)}
          onForgotPassword={() => setIsForgotPasswordModalOpen(true)}
        />

        {isForgotPasswordModalOpen && (
          <ForgotPasswordModal
            onClose={() => setIsForgotPasswordModalOpen(false)}
            lang={lang}
          />
        )}

        {isResetConfirmOpen && (
          <div
            className={`fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 ${isRtl ? "text-right" : "text-left"}`}
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6">
                <div className="flex items-center gap-3 text-amber-500 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Reset Application Data?</h3>
                    <p className="text-[10px] text-amber-400 font-mono tracking-widest uppercase mt-0.5">Sovereign Data Protection Action</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Are you sure you want to permanently restore the National Oil Corporation Portfolio Audit System to its pristine baseline values?
                </p>
                <div className="mt-4 bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-2">
                  {[
                    "WBS hierarchies & custom milestones will revert to defaults.",
                    "All newly submitted claims, progress weights, and financial overrides will be cleared.",
                    "All uploaded PDF/XLSX invoices and technical documents will be purged.",
                  ].map((line) => (
                    <div key={line} className="flex items-start gap-2 text-[11px] text-slate-400 leading-normal">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-950 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="bg-transparent hover:bg-slate-900 text-slate-400 hover:text-white font-bold text-xs py-2 px-4 rounded-xl border border-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setIsResetConfirmOpen(false); resetDemo(); }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2 px-4 rounded-xl transition-colors shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }


  const isDark = theme === "dark";
  const sidebarBg = isDark ? "bg-[#0f172a]" : "bg-white";
  const sidebarBorder = isDark ? "border-slate-800/80" : "border-slate-200";
  const sidebarHeaderBg = isDark ? "bg-[#0b0f19]" : "bg-slate-50";
  const sidebarText = isDark ? "text-slate-300" : "text-slate-700";
  const sidebarTitleText = isDark ? "text-white" : "text-slate-900";
  const separatorColor = isDark ? "bg-slate-800/80" : "bg-slate-200/80";

  const getTabClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    if (isActive) {
      return isDark 
        ? "bg-slate-800 text-white font-black" 
        : "bg-slate-100 text-slate-950 border border-slate-200/60 font-black shadow-sm";
    } else {
      return isDark 
        ? "text-slate-400 hover:text-white hover:bg-slate-850" 
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100";
    }
  };

  // Active user matches one of the DEMO_USERS
  return (
    <div className={`bg-slate-50 dark:bg-[#040f24] text-slate-900 dark:text-slate-100 min-h-screen flex font-sans antialiased ${isRtl ? "text-right" : "text-left"} print:block print:bg-white print:text-black`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Toast Notice */}
      {toastMessage && (
        <div className={`fixed top-6 ${isRtl ? "left-6" : "right-6"} z-[100] bg-slate-900 text-white rounded-xl shadow-2xl p-4 border border-slate-700 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 max-w-sm ${isRtl ? "text-right" : "text-left"}`}>
          {toastMessage.type === "success" && <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />}
          {toastMessage.type === "info" && <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />}
          {toastMessage.type === "error" && <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />}
          <span className="text-xs font-bold leading-relaxed">{toastMessage.text}</span>
        </div>
      )}

      {/* Real-time Push Notification Alert (WebSocket Simulator) */}
      {activePush && (
        <div className={`fixed bottom-6 ${isRtl ? "left-6" : "right-6"} z-[90] bg-slate-900/95 dark:bg-[#071329]/95 backdrop-blur border border-slate-700/80 dark:border-slate-800 rounded-2xl shadow-2xl p-4 w-[22rem] animate-in slide-in-from-bottom-5 fade-in duration-300 ${isRtl ? "text-right" : "text-left"}`}>
          <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
            <div className="relative mt-1 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-xl bg-amber-400 opacity-75 animate-ping" style={{ minWidth: "2.25rem", minHeight: "2.25rem" }} />
              <div className="relative w-9 h-9 rounded-xl bg-slate-850 dark:bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400">
                <BellRing className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className={`flex items-center justify-between gap-1 ${isRtl ? "flex-row-reverse" : ""}`}>
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider">
                  {activePush.priority === "high" ? (isRtl ? "⚠️ إجراء عاجل" : "⚠️ URGENT ACTION") : (isRtl ? "⚡ بث فوري" : "⚡ LIVE EVENT")}
                </span>
                <button 
                  onClick={() => setActivePush(null)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h5 className="text-xs font-bold text-white mt-0.5 truncate">{activePush.title}</h5>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-normal font-sans font-semibold">{activePush.message}</p>
              
              <div className={`flex items-center gap-2 mt-3 ${isRtl ? "justify-start flex-row-reverse" : "justify-start"}`}>
                <button
                  onClick={() => {
                    handleNotificationClick(activePush);
                    setActivePush(null);
                  }}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  {isRtl ? "انتقال وعرض" : "View Details"}
                </button>
                <button
                  onClick={() => setActivePush(null)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                >
                  {isRtl ? "تجاهل" : "Dismiss"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SideNavBar */}
      <nav id="sidebar" className={`print:hidden ${sidebarBg} ${isRtl ? "right-0 border-l" : "left-0 border-r"} ${sidebarBorder} w-64 fixed h-full top-0 flex flex-col pt-20 pb-4 z-40 ${sidebarText}`}>
        {/* NOC Corporate Brand */}
        <div className={`px-5 mb-6 absolute top-0 pt-4 w-full ${sidebarHeaderBg} z-10 border-b ${sidebarBorder} pb-4`}>
          <div className="flex items-center gap-3">
            <NocLogo size={36} className="w-9 h-9" />
            <div className={isRtl ? "text-right" : "text-left"}>
              <h1 className={`text-xs font-black ${sidebarTitleText} tracking-wider leading-none mb-1`}>{t("noc_brand", lang)}</h1>
              <p className="text-[9px] text-amber-500 dark:text-amber-400 font-bold font-mono">{t("noc_sub_brand", lang)}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2.5 flex flex-col gap-1.5 pt-3">
          {activeRole !== "system_admin" && (
            <>
              <div className={`px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${isRtl ? "text-right" : "text-left"}`}>
                {isRtl ? "لوحات التحكم والعقود" : "Dashboards & Contracts"}
              </div>
              
              <button
                onClick={() => setActiveTab("interactive_dashboard")}
                className={`transition-all flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold w-full cursor-pointer ${isRtl ? "text-right" : "text-left"} ${getTabClass("interactive_dashboard")}`}
              >
                <BarChart2 className={`w-4 h-4 ${activeTab === "interactive_dashboard" ? "text-fuchsia-500" : "text-slate-400"}`} />
                {t("nav_interactive_dashboard", lang) || (lang === "ar" ? "لوحة القياس التفاعلية" : "Interactive Dashboard")}
              </button>

              <button
                onClick={() => setActiveTab("claims")}
                className={`transition-all flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold w-full cursor-pointer ${isRtl ? "text-right" : "text-left"} ${getTabClass("claims")}`}
              >
                <Home className={`w-4 h-4 ${activeTab === "claims" ? "text-amber-500" : "text-slate-400"}`} />
                {t("tab_claims", lang)}
              </button>
              <button
                onClick={() => setActiveTab("wbs")}
                className={`transition-all flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold w-full cursor-pointer ${isRtl ? "text-right" : "text-left"} ${getTabClass("wbs")}`}
              >
                <LayoutGrid className={`w-4 h-4 ${activeTab === "wbs" ? "text-blue-500" : "text-slate-400"}`} />
                {t("tab_wbs", lang)}
              </button>
              <button
                onClick={() => setActiveTab("invoices")}
                className={`transition-all flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold w-full cursor-pointer ${isRtl ? "text-right" : "text-left"} ${getTabClass("invoices")}`}
              >
                <Receipt className={`w-4 h-4 ${activeTab === "invoices" ? "text-purple-500" : "text-slate-400"}`} />
                {t("tab_invoices", lang)}
              </button>
              <button
                onClick={() => setActiveTab("lcs")}
                className={`transition-all flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold w-full cursor-pointer ${isRtl ? "text-right" : "text-left"} ${getTabClass("lcs")}`}
              >
                <Briefcase className={`w-4 h-4 ${activeTab === "lcs" ? "text-teal-500" : "text-slate-400"}`} />
                {t("tab_lcs", lang)}
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`transition-all flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold w-full cursor-pointer ${isRtl ? "text-right" : "text-left"} ${getTabClass("documents")}`}
              >
                <Paperclip className={`w-4 h-4 ${activeTab === "documents" ? "text-sky-500" : "text-slate-400"}`} />
                {t("tab_documents", lang)}
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`transition-all flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold w-full cursor-pointer ${isRtl ? "text-right" : "text-left"} ${getTabClass("notifications")}`}
              >
                <Bell className={`w-4 h-4 ${activeTab === "notifications" ? "text-amber-500" : "text-slate-400"}`} />
                {isRtl ? "مركز التنبيهات السيادية" : "Central Notifications"}
              </button>
              
            </>
          )}
          
          {activeRole === "system_admin" && (
            <button
              onClick={() => setActiveTab("users")}
              className={`transition-all flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold w-full cursor-pointer ${isRtl ? "text-right" : "text-left"} ${getTabClass("users")}`}
            >
              <Users className={`w-4 h-4 ${activeTab === "users" ? "text-indigo-500" : "text-slate-400"}`} />
              {t("tab_users", lang)}
            </button>
          )}

          <button
            onClick={() => setActiveTab("profile")}
            className={`transition-all flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold w-full cursor-pointer ${isRtl ? "text-right" : "text-left"} ${getTabClass("profile")}`}
          >
            <UserCheck className={`w-4 h-4 ${activeTab === "profile" ? "text-emerald-500" : "text-slate-400"}`} />
            {isRtl ? "الملف الشخصي" : "My Identity Profile"}
          </button>

          {/* Quick Actions Panel */}
          <div className={`mt-8 pt-4 border-t ${sidebarBorder} px-3`}>
            <h4 className={`text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ${isRtl ? "text-right" : "text-left"}`}>
              {isRtl ? "إجراءات هندسية" : "Technical Actions"}
            </h4>
            <div className="space-y-2">
              {activeRole === "subsidiary_pm" && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded text-xs transition-colors shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t("new_stage_claim_btn", lang)}
                </button>
              )}
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className={`w-full ${isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-150 hover:bg-slate-200 text-slate-700"} font-bold py-1 px-3 rounded text-[10px] transition-colors cursor-pointer`}
              >
                {t("reset_data", lang)}
              </button>
            </div>
          </div>
        </div>

        {/* User Identity Footer */}
        <div className={`p-4 border-t ${sidebarBorder} ${sidebarHeaderBg} flex flex-col gap-2`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm`}>
              {currentUser.name.split(" ").pop()?.substring(0, 2).toUpperCase() || "BO"}
            </div>
            <div className="overflow-hidden">
              <h5 className={`text-[11px] font-bold ${sidebarTitleText} truncate`}>{isRtl && currentUser.nameAr ? currentUser.nameAr : currentUser.name}</h5>
              <p className="text-[9px] text-slate-500 font-mono truncate">
                {isRtl && currentUser.role === "pmo_auditor" ? "مدقق فني للمؤسسة" :
                 isRtl && currentUser.role === "subsidiary_pm" ? "مدير مشروع المشغل" :
                 isRtl && currentUser.role === "subsidiary_finance" ? "مسؤول مالي للمشغل" :
                 isRtl && currentUser.role === "noc_finance" ? "مدقق مالي مركزي" :
                 isRtl && currentUser.role === "noc_head_of_accounts" ? "رئيس الحسابات العام" :
                 currentUser.roleLabel}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`w-full mt-1 border ${sidebarBorder} hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 font-bold py-1 px-2 rounded text-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer`}
          >
            <LogOut className="w-3 h-3" />
            {t("change_logout", lang)}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className={`flex-1 ${isRtl ? "mr-64" : "ml-64"} ${previewDoc ? "print:hidden" : "print:mr-0 print:ml-0 print:p-0"} flex flex-col min-h-screen relative`}>
        {/* TopNavBar Header */}
        <TopNav
          currentUser={currentUser}
          claims={claims}
          lang={lang}
          onLangChange={(l) => {
            setLang(l as any);
            if (l === "ar") {
              showToast("تم تحويل لغة الواجهة إلى العربية.", "success");
            } else {
              showToast("Interface language changed to English.", "success");
            }
          }}
          className={`h-16 fixed top-0 ${isRtl ? "right-64 left-0" : "left-64 right-0"} z-30 border-0 border-b border-amber-500 shadow-sm print:hidden`}
          onSearchResultClick={(result) => {
            setActiveTab(result.tab as any);
            if (result.claimId) {
              setSelectedClaimId(result.claimId);
            }
            if (result.category === "document") {
              const claim = claims.find((c) => c.id === result.claimId);
              if (claim) {
                const docId = result.id.replace("sr-doc-", "");
                const doc = claim.documents.find((d) => d.id === docId || d.name === result.primary);
                if (doc) {
                  setPreviewDoc(doc);
                }
              }
            }
            if (lang === "ar") {
              showToast(`تم الانتقال إلى: ${result.primary}`, "info");
            } else {
              showToast(`Navigated to: ${result.primary}`, "info");
            }
          }}
          onNotificationClick={handleNotificationClick}
          notifications={notifications.filter(n => n.userId === currentUser?.id)}
          unreadCount={notifications.filter(n => n.userId === currentUser?.id && !n.read).length}
          onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id && n.userId === currentUser?.id ? { ...n, read: true } : n))}
          onClearHistory={() => {
            setNotifications(prev => prev.filter(n => n.userId !== currentUser?.id));
            showToast(lang === "ar" ? "تم تفريغ سجل الإخطارات." : "Notifications history cleared.", "info");
          }}
          onViewAllNotifications={() => setActiveTab("notifications")}
        />

        {/* Content Section Split-Pane */}
        <div className="flex-1 flex mt-16 overflow-hidden print:mt-0 print:h-auto print:overflow-visible print:block">
          {activeRole === "system_admin" ? (
            activeTab === "users" ? (
              <CentralSecuritySettings showToast={showToast} lang={lang} currentUser={currentUser} activeRole={activeRole} />
            ) : activeTab === "profile" ? (
              <UserProfile currentUser={currentUser} showToast={showToast} lang={lang} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 font-bold bg-slate-50 dark:bg-[#040f24]">
                <div className="text-center">
                  <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p>{isRtl ? "الوصول غير مصرح به" : "Unauthorized Access"}</p>
                </div>
              </div>
            )
          ) : activeTab === "claims" ? (
            <>
              {/* Inbox Claims List */}
          <div className={`w-80 ${isRtl ? "border-l" : "border-r"} border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071329] flex flex-col shrink-0 shadow-sm z-10`}>
            {/* List Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a1930] flex flex-col gap-2 shrink-0">
              <div className={`flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
                <h2 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  {isRtl ? "المطالبات الفنية" : "Technical Claims"} ({filteredClaims.length})
                </h2>
                <span className="text-[9px] bg-slate-200 dark:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full font-mono">
                  {isRtl ? "مزامنة مباشرة" : "Live Sync"}
                </span>
              </div>
              
              {/* Filtering Controls */}
              <div className="flex flex-col gap-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <select
                    value={filterPriority}
                    onChange={(e: any) => setFilterPriority(e.target.value)}
                    className="text-[10px] font-bold p-1 bg-white dark:bg-[#0f2444] rounded border border-slate-300 dark:border-slate-750 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer text-center"
                  >
                    <option value="all">{isRtl ? "الأولوية: الكل" : "Priority: All"}</option>
                    <option value="high">{isRtl ? "أولوية عالية" : "High Priority"}</option>
                    <option value="standard">{isRtl ? "عادية" : "Standard"}</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e: any) => setFilterStatus(e.target.value)}
                    className="text-[10px] font-bold p-1 bg-white dark:bg-[#0f2444] rounded border border-slate-300 dark:border-slate-750 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer text-center"
                  >
                    <option value="all">{isRtl ? "الحالة: الكل" : "Status: All"}</option>
                    <option value="pending">{isRtl ? "قيد المراجعة الفنية" : "Tech Review Pending"}</option>
                    <option value="approved">{isRtl ? "معتمد فنياً" : "Technically Approved"}</option>
                    <option value="pending_financial_audit">{isRtl ? "مفوتر (قيد التدقيق)" : "Invoiced (Fin Audit)"}</option>
                    <option value="authorized_for_payment">{isRtl ? "مصرح للصرف ومقفل" : "Authorized & Locked"}</option>
                    <option value="rejected">{isRtl ? "مرفوض" : "Rejected"}</option>
                    <option value="info_requested">{isRtl ? "طلب استيضاح" : "Clarification Req."}</option>
                  </select>
                </div>
                <select
                  value={filterCompany}
                  onChange={(e: any) => setFilterCompany(e.target.value)}
                  className="text-[10px] font-bold p-1 bg-white dark:bg-[#0f2444] rounded border border-slate-300 dark:border-slate-750 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer text-center w-full"
                >
                  <option value="all">{isRtl ? "الشركة: الكل" : "Company: All"}</option>
                  {Array.from(new Set(claims.map((c) => c.companyId))).map((cid) => {
                    const matchedClaim = claims.find((c) => c.companyId === cid);
                    const englishName = matchedClaim ? matchedClaim.company : cid;
                    const arabicName = TENANT_AR[cid as any]?.name || englishName;
                    return (
                      <option key={cid} value={cid}>
                        {isRtl ? arabicName : englishName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* List of claims */}
            <div className={`flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-slate-50 dark:bg-[#040f24] ${isRtl ? "text-right" : "text-left"}`}>
              {filteredClaims.length > 0 ? (
                filteredClaims.map((claim) => {
                  const isSelected = claim.id === selectedClaimId;
                  return (
                    <div
                      key={claim.id}
                      onClick={() => setSelectedClaimId(claim.id)}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        isSelected
                          ? isRtl 
                            ? "bg-white dark:bg-[#0c213d] border-r-4 border-r-amber-500 border-t-slate-200 dark:border-t-slate-800 border-b-slate-300 dark:border-b-slate-900 border-l-slate-200 dark:border-l-slate-800 shadow-md text-slate-900 dark:text-white"
                            : "bg-white dark:bg-[#0c213d] border-l-4 border-l-amber-500 border-t-slate-200 dark:border-t-slate-800 border-b-slate-300 dark:border-b-slate-900 border-r-slate-200 dark:border-r-slate-800 shadow-md text-slate-900 dark:text-white"
                          : "bg-white dark:bg-[#071329] border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#091a33] text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className={`flex justify-between items-center mb-1.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">{claim.code}</span>
                        {claim.priority === "high" ? (
                          <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-[8px] uppercase font-black px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900/40">
                            {isRtl ? "أولوية عالية" : "High Priority"}
                          </span>
                        ) : (
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[8px] uppercase font-black px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {isRtl ? "عادية" : "Standard"}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5 line-clamp-1">{claim.title}</h3>
                      <div className={`flex items-center gap-1.5 text-[10px] text-slate-500 mb-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <span className="font-extrabold bg-slate-100 dark:bg-slate-850 px-1 rounded text-slate-700 dark:text-slate-300 font-sans">{claim.company}</span>
                        <span>•</span>
                        <span className="font-mono">{claim.wbs}</span>
                      </div>

                      <div className={`flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-2.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <div className={`flex items-center gap-1 text-slate-400 text-[9px] font-bold font-mono ${isRtl ? "flex-row-reverse" : ""}`}>
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{isRtl ? "الاستحقاق: " : "Due: "}{claim.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-black text-slate-950 dark:text-slate-100 font-mono">{claim.claimedValue}</span>
                          <span className={`w-2 h-2 rounded-full ${
                            claim.status === "authorized_for_payment" ? "bg-emerald-600" :
                            claim.status === "pending_financial_audit" ? "bg-purple-600" :
                            claim.status === "approved" ? "bg-emerald-400" :
                            claim.status === "rejected" ? "bg-red-500" :
                            claim.status === "info_requested" ? "bg-amber-500" : "bg-blue-500"
                          }`} />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-semibold">{isRtl ? "لم يتم العثور على أي مطالبات تقدم عمل." : "No progress claims found."}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Detail Workspace Area */}
          <div className="flex-1 bg-white dark:bg-[#071329] flex flex-col overflow-hidden relative">
            {selectedClaim ? (
              <>
                {/* Detail Header */}
                <div className={`p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start shrink-0 bg-white dark:bg-[#071329] z-10 shadow-sm ${isRtl ? "text-right flex-row-reverse" : "text-left"}`}>
                  <div className="space-y-1.5">
                    <div className={`flex items-center gap-2 flex-wrap mb-1 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <span className="bg-slate-900 dark:bg-slate-950 text-amber-400 font-black px-2.5 py-0.5 text-[10px] rounded-md tracking-wide">
                        {selectedClaim.company}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[9px] font-bold rounded border border-slate-200 dark:border-slate-850/60 font-mono">
                        {isRtl ? "معرف الشركة: " : "ID: "}{selectedClaim.companyId}
                      </span>
                      <span className="text-slate-500 text-[10px] font-bold font-mono">
                        {isRtl ? "رمز الهيكل WBS: " : "WBS Code: "}{selectedClaim.wbs}
                      </span>
                    </div>

                    <h1 className={`text-base md:text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                      {selectedClaim.title}
                      {getStatusBadge(selectedClaim.status)}
                    </h1>

                    <p className={`text-[11px] text-slate-500 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{isRtl ? "مقدم المطالبة: " : "Author: "}{selectedClaim.submittedBy}</span>
                      <span className="text-slate-300 dark:text-slate-800">|</span>
                      <span>{isRtl ? "تاريخ التقديم: " : "Submitted: "}{selectedClaim.submissionDate}</span>
                    </p>
                  </div>

                  <div className={isRtl ? "text-left" : "text-right"}>
                    <div className="text-[10px] font-bold text-slate-400 mb-0.5">{isRtl ? "الميزانية الإجمالية للمرحلة" : "Total Phase Budget"}</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">{selectedClaim.claimedValue}</div>
                  </div>
                </div>

                {/* Detail Content */}
                <div className={`flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#040f24] ${isRtl ? "text-right" : "text-left"}`}>
                  
                  {/* Current Active User Banner */}
                  <div className={`mb-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3 bg-white dark:bg-[#0a1930] shadow-sm ${isRtl ? "text-right flex-row-reverse" : "text-left"}`}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800">
                      <UserCheck className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div className="flex-1">
                      <div className={`flex items-center gap-2 mb-0.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <span className="text-xs font-semibold text-slate-500">{isRtl ? "مسجل الدخول كـ:" : "Logged in as:"}</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{isRtl && currentUser.nameAr ? currentUser.nameAr : currentUser.name}</span>
                        <span className="text-slate-300 dark:text-slate-800">•</span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/40">
                          {isRtl ? "الدور الفعال: " : "Active Role: "}{getRoleLabel(activeRole)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                        {isRtl ? (
                          activeRole === "pmo_auditor" ? "سلطة المراجعة الفنية. يمكنك التحقق من المستندات الهندسية، وإصدار الموافقة الفنية السيادية." :
                          activeRole === "subsidiary_pm" ? "مدير مشروع المقاول/الشركة التابعة. يمكنك تعديل نسب التقدم المنجزة ميدانياً، وإضافة التسليمات الجديدة المعتمدة، وإرفاق التقارير الفنية." :
                          activeRole === "subsidiary_finance" ? "المسؤول المالي للمشغل. عند صدور الاعتماد الفني للمرحلة، يمكنك تقديم الفاتورة التجارية الرسمية بما لا يتجاوز سقف القيمة الفنية الفعالة المكتسبة." :
                          activeRole === "noc_finance" ? "المدقق المالي المركزي للمؤسسة. مطابقة الفواتير التجارية الواردة مع موافقات الإنجاز الفني ومراجعة التبويبات المالية وإعداد أوامر الصرف الفنية." :
                          "مدير الحسابات العام للمؤسسة. المراجعة النهائية للفواتير المعتمدة وإصدار رمز التحويل المالي المشفر والتصديق على الصرف النهائي وإقفال المرحلة في نظام الـ ERP."
                        ) : (
                          activeRole === "pmo_auditor" ? "Technical review authority. You can verify engineering documentation, and issue Technical Approval." :
                          activeRole === "subsidiary_pm" ? "Contractor Project Manager. You can modify claimed progress values, add newly verified deliverables, and upload engineering reports." :
                          activeRole === "subsidiary_finance" ? "Contractor Financial Officer. Once Technical Approval is granted, you can submit the official commercial invoice up to the technically Earned Value limit." :
                          activeRole === "noc_finance" ? "Central NOC Financial Auditor. Review incoming commercial invoices, verify EV limits, and pre-approve invoices for sovereign fund release." :
                          "Sovereign NOC Head of Accounts. Review pre-approved invoices, authorize final fund release, and generate the secure central ERP payment token."
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Prominent Auditor Remarks Alert Banner */}
                  {(selectedClaim.status === "rejected" || selectedClaim.status === "info_requested") && selectedClaim.auditorNotes && (
                    <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
                      selectedClaim.status === "rejected" 
                        ? "bg-rose-50 border-rose-200 text-rose-900" 
                        : "bg-amber-50 border-amber-200 text-amber-900"
                    } ${isRtl ? "text-right flex-row-reverse" : "text-left"}`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedClaim.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {selectedClaim.status === "rejected" ? (
                          <ThumbsDown className="w-5 h-5" />
                        ) : (
                          <History className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="text-xs font-black uppercase tracking-wider">
                          {selectedClaim.status === "rejected" 
                            ? (isRtl ? "تم رفض هذه المطالبة من قبل المدقق الفني للمؤسسة" : "Claim Rejected by PMO Technical Auditor")
                            : (isRtl ? "طلب استيضاح معلق من قبل المدقق الفني للمؤسسة" : "Clarification Requested by PMO Technical Auditor")
                          }
                        </div>
                        <p className="text-xs font-serif leading-relaxed italic bg-white/70 p-3 rounded-lg border border-current/10 font-semibold text-slate-800 shadow-sm">
                          "{selectedClaim.auditorNotes}"
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans font-bold pt-0.5">
                          {isRtl 
                            ? "يرجى مراجعة الملاحظات أعلاه وتعديل نسب الإنجاز أو إرفاق المستندات المطلوبة وإعادة تقديم المطالبة." 
                            : "Please review the notes above, update progress estimates or attach required documents, and resubmit the claim."}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-12 gap-5 max-w-6xl mx-auto">
                    {/* Left Panel: EVM metrics, Deliverables, Audit Logs */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
                      
                      {/* EVM Engine Card */}
                      <div className="bg-white dark:bg-[#071329] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                        <h3 className="text-xs font-black text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2.5 flex justify-between items-center">
                          <span className="flex items-center gap-1.5"><Coins className="w-4 h-4 text-amber-500" /> {isRtl ? "نظام إدارة القيمة المكتسبة (محرك EVMS)" : "Earned Value Management System (EVMS Engine)"}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-bold">{isRtl ? "معيار المؤسسة" : "NOC Standard"}</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 mb-1">{isRtl ? "القيمة المخططة (PV)" : "Planned Value (PV)"}</div>
                            <div className="text-base font-black text-slate-900 dark:text-white font-mono">{selectedClaim.claimedValue}</div>
                            <div className="text-[9px] text-slate-400 mt-1">{isRtl ? "خط الأساس للميزانية المعتمدة لمرحلة WBS هذه." : "Authorized budget baseline for this WBS phase."}</div>
                          </div>

                          <div>
                            <div className="text-[10px] font-bold text-slate-400 mb-1">{isRtl ? "نسبة التقدم المطالب بها (%)" : "Claimed Progress (%)"}</div>
                            <div className="text-base font-black text-slate-900 dark:text-white font-mono flex items-baseline gap-1.5">
                              <span className="text-amber-600 font-black">{selectedClaim.claimedProgress.toFixed(1)}%</span>
                              <span className="text-[9px] font-extrabold text-amber-800 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-1 py-0.5 rounded border border-amber-200 dark:border-amber-900/40">
                                {isRtl ? "الزيادة: " : "Increment: "}+{(selectedClaim.claimedProgress - selectedClaim.previousProgress).toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-[9px] text-slate-400 mt-1">{isRtl ? "إجمالي التقدم الفعلي المطالب به حتى تاريخه." : "Total physical progress claimed to date."}</div>
                          </div>

                          <div>
                            <div className="text-[10px] font-bold text-slate-400 mb-1">{isRtl ? "سقف القيمة المكتسبة (EV)" : "Earned Value Limit (EV)"}</div>
                            <div className="text-base font-black text-emerald-600 font-mono">
                              €{Math.round((selectedClaim.claimedProgress / 100) * selectedClaim.numericValue).toLocaleString()}
                            </div>
                            <div className="text-[9px] text-slate-400 mt-1">{isRtl ? "تُحتسب القيمة المكتسبة كـ (نسبة الإنجاز × الميزانية)." : "Earned Value calculated as (Progress % × Budget)."}</div>
                          </div>
                        </div>

                        {/* Progress Bar Display */}
                        <div className="mb-4">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span>{isRtl ? "المعتمد سابقاً: " : "Previously Approved: "}{selectedClaim.previousProgress}%</span>
                            <span>{isRtl ? "المطالب به حديثاً: " : "Newly Claimed: "}{selectedClaim.claimedProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                            <div className="bg-slate-400 h-3 border-r border-white dark:border-slate-800" style={{ width: `${selectedClaim.previousProgress}%` }}></div>
                            <div className="bg-amber-500 h-3" style={{ width: `${selectedClaim.claimedProgress - selectedClaim.previousProgress}%` }}></div>
                          </div>
                        </div>

                        {/* Invoiced Tracker Block */}
                        {selectedClaim.invoiceNumber && (
                          <div className={`mt-4 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 rounded-lg flex justify-between items-center ${isRtl ? "text-right flex-row-reverse" : "text-left"}`}>
                            <div>
                              <div className="text-[10px] text-slate-500 font-bold">{isRtl ? "الفاتورة التجارية المقدمة" : "Commercial Invoice Submitted"}</div>
                              <div className="text-xs font-black text-indigo-900 dark:text-indigo-300 font-mono mt-0.5">
                                {isRtl ? "المرجع: " : "Ref: "}{selectedClaim.invoiceNumber} • {isRtl ? "القيمة: " : "Value: "}€{(selectedClaim.invoiceAmount || 0).toLocaleString()}
                              </div>
                            </div>
                            <div className={isRtl ? "text-left" : "text-right"}>
                              <div className="text-[10px] text-slate-500 font-bold">{isRtl ? "حالة امتثال الفوترة" : "Billing Compliance Status"}</div>
                              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                                {selectedClaim.status === "authorized_for_payment" ? (isRtl ? "✓ تم التخليص والدفع بالكامل" : "✓ Fully Cleared & Paid") : (isRtl ? "⏱ في انتظار صرف المالية المركزية" : "⏱ Pending Central Finance Release")}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Payment authorized card */}
                        {selectedClaim.status === "authorized_for_payment" && (
                          <div className={`mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-start gap-3 ${isRtl ? "text-right flex-row-reverse" : "text-left"}`}>
                            <KeyRound className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-black text-emerald-900 dark:text-white">{isRtl ? "رمز الدفع المعتمد من المؤسسة" : "NOC Authorized Payment Token"}</div>
                              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold mt-1 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-900/40 inline-block uppercase select-all">
                                {selectedClaim.paymentToken}
                              </p>
                              <p className="text-[9px] text-slate-500 mt-1.5 leading-relaxed">
                                {isRtl 
                                  ? "تم إنشاء رمز الدفع الآمن وإرساله إلى البنك المركزي. تم إقفال هذه المرحلة من المشروع ولا يمكن تعديلها."
                                  : "Secure payment token generated and transmitted to the central bank. This stage of the project is locked from further modifications."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Deliverables Table */}
                      <div className={`bg-white dark:bg-[#071329] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden ${isRtl ? "text-right" : "text-left"}`}>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a1930] flex justify-between items-center">
                          <div>
                            <h3 className="text-xs font-black text-slate-900 dark:text-white">{isRtl ? "تسليمات المرحلة (مقاييس عقدة WBS)" : "Stage Deliverables (WBS Node Metrics)"}</h3>
                            <p className="text-[10px] text-slate-400 font-bold">{isRtl ? "الأوزان النسبية المخصصة للتسليمات بموجب هيكل العقد" : "Deliverable weighting assigned under the contract structure"}</p>
                          </div>
                          <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-mono">
                            {selectedClaim.deliverables.length} {isRtl ? "تسليمات" : "Deliverables"}
                          </span>
                        </div>
                        <table className={`w-full ${isRtl ? "text-right" : "text-left"} border-collapse`}>
                          <thead>
                            <tr className="bg-slate-50 dark:bg-[#0c213d]/50 border-b border-slate-200 dark:border-slate-800">
                              <th className="p-3 text-[10px] font-black text-slate-400 w-12 text-center">{isRtl ? "الحالة" : "Status"}</th>
                              <th className="p-3 text-[10px] font-black text-slate-400">{isRtl ? "وصف التسليم الفعلي للمشروع" : "Physical Deliverable Description"}</th>
                              <th className={`p-3 text-[10px] font-black text-slate-400 ${isRtl ? "text-left" : "text-right"} w-24`}>{isRtl ? "الوزن النسبي" : "Relative Weight"}</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs font-medium text-slate-850 font-mono">
                            {selectedClaim.deliverables.map((del) => (
                              <tr key={del.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-[#0a1930]/40 transition-colors">
                                <td className="p-3 text-center">
                                  {del.status === "completed" ? (
                                    <span className="inline-block bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-450 p-0.5 rounded border border-emerald-200 dark:border-emerald-900/40" title="Completed & Verified">
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    </span>
                                  ) : (
                                    <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 p-1.5 rounded-full" title="Pending">
                                      ⏱
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 font-sans text-xs text-slate-900 dark:text-slate-100 font-semibold">{del.description}</td>
                                <td className={`p-3 ${isRtl ? "text-left" : "text-right"} text-slate-500 font-bold`}>{del.weight}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* PM New Deliverable adding */}
                        {activeRole === "subsidiary_pm" && selectedClaim.status !== "authorized_for_payment" && (
                          <div className={`p-4 bg-slate-50 dark:bg-[#0a1930] border-t border-slate-200 dark:border-slate-800 ${isRtl ? "text-right" : "text-left"}`}>
                            <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase">{isRtl ? "إضافة تسليم معتمد للمرحلة:" : "Append Verified Milestone Deliverable:"}</div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder={isRtl ? "صف البند المنجز للتسليم..." : "Describe completed deliverable item..."}
                                value={newDeliverableDesc}
                                onChange={(e) => setNewDeliverableDesc(e.target.value)}
                                className="flex-1 text-xs p-2 border border-slate-300 dark:border-slate-700 rounded focus:ring-1 focus:ring-amber-500 bg-white dark:bg-[#0f2444] text-slate-900 dark:text-slate-100"
                              />
                              <input
                                type="text"
                                placeholder={isRtl ? "الوزن %" : "Weight %"}
                                value={newDeliverableWeight}
                                onChange={(e) => setNewDeliverableWeight(e.target.value)}
                                className="w-20 text-xs p-2 border border-slate-300 dark:border-slate-700 rounded focus:ring-1 focus:ring-amber-500 bg-white dark:bg-[#0f2444] text-slate-900 dark:text-slate-100"
                              />
                              <button
                                type="button"
                                onClick={handlePMAddDeliverable}
                                disabled={!newDeliverableDesc.trim()}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded disabled:opacity-50 transition-colors cursor-pointer"
                              >
                                {isRtl ? "إضافة البند" : "Add Item"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Audit Log / History */}
                      <div className={`bg-white dark:bg-[#071329] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden ${isRtl ? "text-right" : "text-left"}`}>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a1930] flex justify-between items-center">
                          <div>
                            <h3 className="text-xs font-black text-slate-900 dark:text-white">{isRtl ? "سجل سلسلة العهدة والتدقيق" : "Chain of Custody Ledger & Audit Log"}</h3>
                            <p className="text-[10px] text-slate-400 font-bold font-sans">{isRtl ? "دفتر المعاملات غير القابل للتعديل (سجل امتثال للإضافة فقط)" : "Immutable transaction journal (append-only compliance record)"}</p>
                          </div>
                          <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold font-mono bg-amber-50 dark:bg-amber-950/20 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/40">
                            {isRtl ? "✓ متوافق أمنياً" : "✓ Security Compliant"}
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className={`w-full ${isRtl ? "text-right" : "text-left"} border-collapse`}>
                            <thead>
                              <tr className="bg-slate-50 dark:bg-[#0c213d]/50 border-b border-slate-200 dark:border-slate-800 font-sans">
                                <th className="p-3 text-[10px] font-black text-slate-400">{isRtl ? "المستخدم / الفاعل" : "User / Actor"}</th>
                                <th className="p-3 text-[10px] font-black text-slate-400">{isRtl ? "نوع الإجراء" : "Action Type"}</th>
                                <th className="p-3 text-[10px] font-black text-slate-400">{isRtl ? "تفاصيل التحقق / تعديل الحالة" : "Verification / State Modification Details"}</th>
                                <th className={`p-3 text-[10px] font-black text-slate-400 ${isRtl ? "text-left" : "text-right"}`}>{isRtl ? "الطابع الزمني" : "Timestamp"}</th>
                              </tr>
                            </thead>
                            <tbody className="text-xs font-medium text-slate-850 font-mono">
                              {selectedClaim.auditLog.map((log) => (
                                <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-[#0a1930]/40">
                                  <td className="p-3 font-sans font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    {log.user}
                                  </td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                      log.action === "Approve" || log.action === "Authorize Payment" ? "bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40" :
                                      log.action === "Reject" ? "bg-rose-100 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40" :
                                      log.action === "Request Info" ? "bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                    }`}>
                                      {log.action}
                                    </span>
                                  </td>
                                  <td className="p-3 text-slate-600 dark:text-slate-400 font-sans text-xs">{log.change}</td>
                                  <td className={`p-3 ${isRtl ? "text-left" : "text-right"} text-slate-500 font-bold`}>{log.timestamp}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>

                    {/* Right Panel: Document Evidence and Decision Form Panels */}
                    <div className={`col-span-12 lg:col-span-4 flex flex-col gap-5 ${isRtl ? "text-right" : "text-left"}`}>
                      
                      {/* Attached Documents */}
                      <div className={`bg-white dark:bg-[#071329] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm ${isRtl ? "text-right" : "text-left"}`}>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                          <span>{isRtl ? "ملفات الإثبات واعتمادات الجودة" : "Evidence & QA Sign-off Files"}</span>
                          <Paperclip className="w-4 h-4 text-slate-500" />
                        </h3>

                        <div className="space-y-2.5">
                          {selectedClaim.documents.map((doc) => (
                            <div
                              key={doc.id}
                              onClick={() => setPreviewDoc(doc)}
                              className={`group border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 flex items-center gap-3 hover:border-amber-500 transition-colors cursor-pointer bg-slate-50 dark:bg-[#0a1930] ${isRtl ? "text-right flex-row-reverse" : "text-left"}`}
                            >
                              <div className={`w-10 h-10 flex items-center justify-center rounded-lg shrink-0 font-bold text-[10px] ${
                                doc.type === "PDF" ? "bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/40" :
                                doc.type === "XLSX" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40" : "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40"
                              }`}>
                                {doc.type === "IMAGE" && doc.url ? (
                                  <img src={doc.url} alt="Attachment" className="w-full h-full object-cover rounded" />
                                ) : (
                                  doc.type
                                )}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{doc.name}</div>
                                <div className="text-[10px] text-slate-400 font-bold font-mono">
                                  {doc.size} • {isRtl ? "تاريخ الرفع: " : "Uploaded "}{doc.uploadedAt}
                                </div>
                              </div>
                              <Eye className="w-4 h-4 text-slate-400 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all ml-1" />
                            </div>
                          ))}
                        </div>

                        {/* Document Upload Zone */}
                        {selectedClaim.status !== "authorized_for_payment" && (
                          <>
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`mt-4 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                                isDragging
                                  ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/10"
                                  : "border-slate-300 dark:border-slate-700 hover:border-amber-500 hover:bg-slate-50 dark:hover:bg-[#0a1930]/40"
                              }`}
                            >
                              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2 animate-pulse" />
                              <p className="text-[11px] font-black text-slate-700 dark:text-slate-300">{isRtl ? "اسحب وأسقط الملفات الهندسية والفنية هنا" : "Drag & drop technical files here"}</p>
                              <p className="text-[9px] text-slate-400 mt-1">{isRtl ? "يتم حفظ الملفات محلياً في ذاكرة التخزين المؤقت للمحاكاة" : "Files are saved locally inside simulation cache"}</p>
                            </div>

                            {/* Manual File Registration */}
                            <form onSubmit={handleManualUpload} className={`mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 ${isRtl ? "text-right" : "text-left"}`}>
                              <div className="text-[9px] font-bold text-slate-500 uppercase">{isRtl ? "ثبت مستند التدقيق يدوياً:" : "Register Audit File manually:"}</div>
                              <input
                                type="text"
                                placeholder={isRtl ? "مثال: تقرير_اختبار_الموقع_الفني" : "e.g., QAQC_Borehole_Test_Report"}
                                value={uploadFileName}
                                onChange={(e) => setUploadFileName(e.target.value)}
                                className={`w-full text-[10px] p-2 border border-slate-300 dark:border-slate-700 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none bg-slate-50 dark:bg-[#0f2444] text-slate-900 dark:text-slate-100 ${isRtl ? "text-right" : "text-left"}`}
                              />
                              <div className="flex gap-2">
                                <select
                                  value={uploadDocTypeTag}
                                  onChange={(e: any) => setUploadDocTypeTag(e.target.value)}
                                  className="flex-1 text-[10px] p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-[#0f2444] text-slate-700 dark:text-slate-200 cursor-pointer"
                                >
                                  <option value="general">{isRtl ? "مستند عام" : "General Document"}</option>
                                  <option value="technical_approval_form">{isRtl ? "نموذج الاعتماد الفني (Form 4)" : "Technical Approval Form (Form 4)"}</option>
                                </select>
                                <select
                                  value={uploadFileType}
                                  onChange={(e: any) => setUploadFileType(e.target.value)}
                                  className="flex-1 text-[10px] p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-[#0f2444] text-slate-700 dark:text-slate-200 cursor-pointer"
                                >
                                  <option value="PDF">{isRtl ? "PDF (تقرير فني موقع)" : "PDF (Signed Report)"}</option>
                                  <option value="XLSX">{isRtl ? "XLSX (جدول الكميات والقياسات)" : "XLSX (Measurement Sheet)"}</option>
                                  <option value="IMAGE">{isRtl ? "IMAGE (لقطة للموقع الميداني)" : "IMAGE (Site Progress Photo)"}</option>
                                </select>
                                <button
                                  type="submit"
                                  disabled={!uploadFileName.trim()}
                                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold text-[10px] px-3 py-1.5 rounded transition-colors cursor-pointer"
                                >
                                  {isRtl ? "تسجيل" : "Register"}
                                </button>
                              </div>
                            </form>
                          </>
                        )}
                      </div>



                      {/* Contractor PM Resubmission Form */}
                      {activeRole === "subsidiary_pm" && selectedClaim.status !== "authorized_for_payment" && (
                        <div className={`bg-white dark:bg-[#071329] border-2 border-slate-900 dark:border-slate-700 rounded-xl p-5 shadow-sm ${isRtl ? "text-right" : "text-left"}`}>
                          <h3 className={`text-xs font-black text-slate-900 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">edit_note</span>
                            {isRtl ? "مراجعة وتعديل مطالبة نسب الإنجاز" : "Revise Progress Claim"}
                          </h3>

                          {(() => {
                            const hasTechnicalApproval = selectedClaim.documents.some(
                              (doc) => doc.document_type === "technical_approval_form"
                            );
                            return (
                              <form onSubmit={handlePMResubmit} className="space-y-4">
                                {!hasTechnicalApproval && (
                                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-400 text-[11px] rounded-lg flex items-start gap-2 leading-relaxed">
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                    <span>
                                      {isRtl 
                                        ? "تنبيه: يجب تحميل 'نموذج الاعتماد الفني للأعمال المنجزة' (Form 4) في قسم ملفات الإثبات واعتمادات الجودة أولاً لتمكين إرسال أو تعديل هذه المطالبة."
                                        : "Submission Blocked: You must upload the 'Technical Approval Form' (Form 4) in the Evidence & QA Sign-off Files section to submit or advance this claim."}
                                    </span>
                                  </div>
                                )}
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">
                                {isRtl ? "نسبة الإنجاز المتراكم المقترحة (%)" : "Proposed Cumulative Progress (%)"}
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={editClaimedProgress}
                                onChange={(e) => setEditClaimedProgress(parseFloat(e.target.value) || 0)}
                                className={`w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded focus:ring-1 focus:ring-amber-500 font-mono bg-slate-50 dark:bg-[#0f2444] text-slate-900 dark:text-slate-100 ${isRtl ? "text-right" : "text-left"}`}
                              />
                              <p className="text-[9px] text-slate-400 mt-1">
                                {isRtl 
                                  ? `يجب أن تتجاوز خط الأساس المعتمد السابق البالغ ${selectedClaim.previousProgress}%` 
                                  : `Must exceed previous approved baseline of ${selectedClaim.previousProgress}%`}
                              </p>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">
                                {isRtl ? "توضيحات ومبررات المقاول" : "Contractor Clarification / Comment"}
                              </label>
                              <textarea
                                value={revisionComment}
                                onChange={(e) => setRevisionComment(e.target.value)}
                                className={`w-full h-16 text-[11px] p-2 border border-slate-300 dark:border-slate-700 rounded resize-none bg-slate-50 dark:bg-[#0f2444] text-slate-900 dark:text-slate-100 ${isRtl ? "text-right" : "text-left"}`}
                                placeholder={isRtl ? "قدم شرحاً وخلفية هندسية لنسبة التقدم المالي المصرح بها حديثاً..." : "Provide background justification for the newly declared milestone progress..."}
                              />
                            </div>

                            {/* Engineering & Physical Site Progress Confirmation Checkbox */}
                            <div className={`p-2.5 rounded-lg border bg-amber-50/20 border-amber-200/50 flex gap-2 items-start ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                              <input
                                id="confirm-revision-checkbox"
                                type="checkbox"
                                checked={isRevisionConfirmed}
                                onChange={(e) => setIsRevisionConfirmed(e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 shrink-0 cursor-pointer"
                              />
                              <label htmlFor="confirm-revision-checkbox" className={`text-[10px] text-slate-700 leading-normal select-none cursor-pointer font-semibold ${isRtl ? "text-right" : "text-left"}`}>
                                {isRtl 
                                  ? "أؤكد بموجب هذا أن أرقام نسبة الإنجاز والتقارير المرفقة معتمدة هندسياً ومطابقة لواقع الموقع الفعلي للمشروع."
                                  : "I hereby confirm that these physical progress metrics correspond directly to verified engineering logs and on-site measurements."}
                                <span className="text-rose-500 font-black ml-1">*</span>
                              </label>
                            </div>

                            <button
                              type="submit"
                              disabled={!hasTechnicalApproval}
                              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 shadow"
                            >
                              {selectedClaim.status === "rejected" || selectedClaim.status === "info_requested" 
                                ? (isRtl ? "إعادة تقديم للموافقة الفنية السيادية" : "Resubmit for Technical Approval") 
                                : (isRtl ? "حفظ التعديلات المحلية" : "Save Local Adjustments")}
                            </button>
                              </form>
                            );
                          })()}
                        </div>
                      )}

                      {/* Contractor Finance - Invoicing Form */}
                      {activeRole === "subsidiary_finance" && (
                        <div className={`bg-white border-2 border-indigo-900 rounded-xl p-5 shadow-sm ${isRtl ? "text-right" : "text-left"}`}>
                          <h3 className={`text-xs font-black text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center gap-1.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                            <span className="material-symbols-outlined text-indigo-700 font-bold">receipt_long</span>
                            {isRtl ? "إصدار وتوثيق فاتورة مرحلية" : "Issue Stage Invoice"}
                          </h3>

                          {selectedClaim.status === "pending" || selectedClaim.status === "info_requested" || selectedClaim.status === "rejected" ? (
                            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2 leading-relaxed">
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              <span>{isRtl ? "الفواتير معطلة: يجب الموافقة على الأعمال المادية أولاً من قبل المدقق الفني للمؤسسة (PMO) قبل تقديم مطالبة تجارية متبادلة." : "Invoicing Blocked: Physical works must be Technically Approved by NOC PMO first before you can submit a commercial claim."}</span>
                            </div>
                          ) : selectedClaim.status === "pending_financial_audit" || selectedClaim.status === "authorized_for_payment" ? (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-start gap-2 leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{isRtl ? "تم تقديم الفاتورة التجارية بنجاح. تقوم الإدارة المالية العامة للمؤسسة (NOC) حالياً بمطابقة الفاتورة مع معايير الامتثال وقفل الميزانية." : "Invoice successfully submitted. NOC Central Finance department is reviewing compliance parameters against ERP ledger."}</span>
                            </div>
                          ) : (
                            <form onSubmit={handleFinanceSubmitInvoice} className="space-y-4">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">{isRtl ? "المعرف الفريد للفاتورة التجارية *" : "Commercial Invoice ID *"}</label>
                                <input
                                  type="text"
                                  required
                                  value={invoiceNo}
                                  onChange={(e) => setInvoiceNo(e.target.value)}
                                  className={`w-full text-xs p-2.5 border border-indigo-300 rounded font-mono bg-slate-50 focus:ring-1 focus:ring-indigo-500 ${isRtl ? "text-right" : "text-left"}`}
                                  placeholder="e.g., INV-WAHA-2026-X11"
                                />
                              </div>

                              <div>
                                <label className={`text-[10px] font-bold text-slate-500 block mb-1 flex justify-between ${isRtl ? "flex-row-reverse" : ""}`}>
                                  <span>{isRtl ? "القيمة الإجمالية للفاتورة باليورو (€) *" : "Invoice Total Value (€) *"}</span>
                                  <span className="text-emerald-600 font-black">
                                    {isRtl ? "الحد الأقصى للقيمة المكتسبة: " : "EV Cap: "}€{Math.round((selectedClaim.claimedProgress / 100) * selectedClaim.numericValue).toLocaleString()}
                                  </span>
                                </label>
                                <input
                                  type="number"
                                  required
                                  min="100"
                                  value={invoiceAmt}
                                  onChange={(e) => setInvoiceAmt(parseFloat(e.target.value) || 0)}
                                  className={`w-full text-xs p-2.5 border border-indigo-300 rounded font-mono bg-slate-50 focus:ring-1 focus:ring-indigo-500 ${isRtl ? "text-right" : "text-left"}`}
                                />
                              </div>

                              {/* EVM Compliance Alert */}
                              {invoiceAmt > (selectedClaim.claimedProgress / 100) * selectedClaim.numericValue && (
                                <div className="p-3.5 bg-rose-50 border border-red-300 rounded-lg text-red-800 text-xs font-semibold leading-relaxed flex items-start gap-2 animate-pulse">
                                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                  <span>⚠️ {isRtl ? `تجاوز حدود القيمة المكتسبة القانونية: لا يمكن أن تتجاوز القيمة المفوترة حد القيمة المادية المكتسبة المعتمدة فنيّاً (€${Math.round((selectedClaim.claimedProgress / 100) * selectedClaim.numericValue).toLocaleString()}). تم حظر التقديم ماليّاً.` : `EVM Compliance Overrun: Invoiced value cannot exceed the technically earned value threshold (€${Math.round((selectedClaim.claimedProgress / 100) * selectedClaim.numericValue).toLocaleString()}). Invoicing is blocked.`}</span>
                                </div>
                              )}

                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">{isRtl ? "اسم ملف مستند الفاتورة (PDF) المرفق" : "Attached PDF File Name"}</label>
                                <input
                                  type="text"
                                  value={invoiceDocName}
                                  onChange={(e) => setInvoiceDocName(e.target.value)}
                                  className={`w-full text-xs p-2.5 border border-slate-300 rounded bg-slate-50 font-mono ${isRtl ? "text-right" : "text-left"}`}
                                  placeholder="Commercial_Invoice_Scan.pdf"
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={invoiceAmt > (selectedClaim.claimedProgress / 100) * selectedClaim.numericValue}
                                className="w-full bg-indigo-900 hover:bg-indigo-950 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-black py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2 shadow"
                              >
                                <Receipt className="w-4 h-4 text-amber-300" />
                                {isRtl ? "إرسال وتوثيق الفاتورة للتدقيق والمطابقة المالية" : "Submit Invoice for Financial Clearance"}
                              </button>
                            </form>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                </div>

                {/* Sticky Decision Footer */}
                <div className={`p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071329] shrink-0 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] ${isRtl ? "text-right" : "text-left"}`}>
                  <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-5">
                    
                     {/* PMO Technical Reviewer Action Area */}
                     {activeRole === "pmo_auditor" && (
                       <>
                         <div className={`w-full md:flex-1 ${isRtl ? "text-right" : "text-left"}`}>
                           <label className="text-xs font-black text-slate-900 mb-1.5 block">
                             {isRtl ? "ملاحظات وتوجيهات التدقيق الفني للمؤسسة" : "NOC Technical Audit Notes"}
                             <span className="text-red-600 ml-1 font-bold">
                               {isRtl ? " * (مطلوب عند الرفض أو طلب التوضيح)" : " * (Required for Reject & Request Info)"}
                             </span>
                           </label>
                           <textarea
                             value={auditorNotes}
                             onChange={(e) => setAuditorNotes(e.target.value)}
                             className={`w-full h-16 p-2.5 bg-slate-50 dark:bg-[#0f2444] border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all resize-none text-slate-800 dark:text-slate-100 font-sans ${isRtl ? "text-right" : "text-left"}`}
                             placeholder={isRtl ? "اكتب ملاحظات وتوجيهات المراجعة الرسمية..." : "Type formal review remarks and audit directives..."}
                           />
                         </div>

                         <div className="w-full md:w-96 flex flex-col gap-2 shrink-0">
                           <button
                             onClick={handleApproveTechnical}
                             disabled={selectedClaim.status === "approved" || selectedClaim.status === "pending_financial_audit" || selectedClaim.status === "authorized_for_payment"}
                             className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 disabled:bg-slate-100 disabled:text-slate-400 text-white py-2.5 px-4 rounded font-black text-xs transition-all flex items-center justify-center gap-2 shadow"
                           >
                             <CheckCircle2 className="w-4 h-4 text-amber-400" />
                             {isRtl ? "منح الاعتماد والموافقة الفنية (فتح خيار الفوترة)" : "Grant Technical Approval (Unlock Invoicing)"}
                           </button>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                             <button
                               onClick={handleRequestInfoTechnical}
                               disabled={selectedClaim.status === "authorized_for_payment"}
                               className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-2 rounded text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
                             >
                               <History className="w-3.5 h-3.5 text-slate-500" />
                               {isRtl ? "إرجاع لطلب توضيح" : "Request Info"}
                             </button>
                             <button
                               onClick={handleRejectTechnical}
                               disabled={selectedClaim.status === "authorized_for_payment"}
                               className="w-full bg-white dark:bg-slate-800 border border-red-500 text-red-600 dark:text-red-400 py-2 rounded text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center justify-center gap-1.5"
                             >
                               <ThumbsDown className="w-3.5 h-3.5" />
                               {isRtl ? "رفض المطالبة الفنية" : "Reject Claim"}
                             </button>
                           </div>
                         </div>
                       </>
                     )}

                    {/* Subsidiary PM Action Area */}
                    {activeRole === "subsidiary_pm" && (
                      <div className={`w-full flex flex-col sm:flex-row justify-between items-center bg-slate-50 dark:bg-[#0a1930] p-3 rounded-lg border border-slate-200 dark:border-slate-800 gap-3 ${isRtl ? "text-right flex-row-reverse" : "text-left"}`}>
                        <div className={`flex items-center gap-2 text-slate-600 text-xs font-bold ${isRtl ? "flex-row-reverse" : ""}`}>
                          <Building2 className="w-4 h-4 text-slate-500" />
                          <span>{isRtl ? "تم تنشيط مساحة عمل مدير مشروع الشركة التابعة. حدث القيمة المطلوبة ومخرجات التسليم من القائمة الجانبية." : "Subsidiary PM workspace activated. Update claimed value and deliverables from the right-hand widgets."}</span>
                        </div>
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded transition-colors"
                        >
                          {isRtl ? "تقديم مطالبة تقدم مالي جديدة +" : "Submit New Claim +"}
                        </button>
                      </div>
                    )}

                    {/* Subsidiary Finance Action Area */}
                    {activeRole === "subsidiary_finance" && (
                      <div className={`w-full bg-slate-50 dark:bg-[#0a1930] p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center ${isRtl ? "text-right flex-row-reverse" : "text-left"}`}>
                        <div className={`flex items-center gap-2 font-bold text-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}>
                          <Receipt className="w-4 h-4 text-indigo-700" />
                          <span>{isRtl ? "أكمل حقول تقديم الفاتورة المرحلية في لوحة الإدخال الجانبية بمجرد اعتماد التقدم فنيّاً من قبل الـ PMO." : "Complete stage invoice submission fields in the sidebar widget once technically approved by the PMO."}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold font-mono">{isRtl ? "معيار مراقبة التكاليف السيادي" : "Cost Control Standard"}</span>
                      </div>
                    )}

                    {/* NOC Central Finance Action Area */}
                    {activeRole === "noc_finance" && (
                      <>
                        <div className={`w-full md:flex-1 ${isRtl ? "text-right" : "text-left"}`}>
                          <h4 className={`text-xs font-black text-slate-900 dark:text-white mb-2 flex items-center gap-1 ${isRtl ? "flex-row-reverse" : ""}`}>
                            <CheckCircle2 className="w-4 h-4 text-purple-700" />
                            {isRtl ? "عمليات مطابقة وامتثال الدفتر المالي العام للمؤسسة" : "Central NOC Finance Ledger Compliance Checks"}
                          </h4>
                          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-semibold ${isRtl ? "text-right" : "text-left"}`}>
                            <div className={`flex items-center gap-1 bg-slate-50 dark:bg-[#0a1930] p-1.5 rounded border border-slate-200 dark:border-slate-800 ${isRtl ? "flex-row-reverse" : ""}`}>
                              <span>{isRtl ? "الحد الأقصى للميزانية:" : "Budget Limit:"}</span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedClaim.claimedValue}</span>
                            </div>
                            <div className={`flex items-center gap-1 bg-slate-50 dark:bg-[#0a1930] p-1.5 rounded border border-slate-200 dark:border-slate-800 ${isRtl ? "flex-row-reverse" : ""}`}>
                              <span>{isRtl ? "المطالبة المفوترة:" : "Invoiced Claim:"}</span>
                              <span className="font-mono font-bold text-indigo-900">
                                €{(selectedClaim.invoiceAmount || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full md:w-96 flex flex-col gap-2 shrink-0">
                          {selectedClaim.status === "pending_financial_audit" ? (
                            <button
                              onClick={handleAuthorizePayment}
                              className="w-full bg-purple-900 hover:bg-purple-950 text-white py-3 px-4 rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-2 shadow shadow-purple-900/10"
                            >
                              <Lock className="w-4 h-4 text-amber-300" />
                              {isRtl ? "تفويض الصرف المالي وإقفال المرحلة" : "Authorize Payment & Lock Phase"}
                            </button>
                          ) : (
                            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-slate-500 font-semibold text-center">
                              {isRtl ? "تم تفويض الصرف المالي لهذه المرحلة" : "Payment Authorized & Phase Locked"}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold p-8 text-center bg-slate-50/50 dark:bg-slate-900/10">
                <div className="max-w-md space-y-3">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-slate-800 dark:text-slate-200 font-bold text-sm">
                    {isRtl ? "لم يتم تحديد مطالبة" : "No Claim Selected"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl
                      ? "الرجاء اختيار مطالبة تقدم عمل فنية للبدء في المراجعة."
                      : "Please choose a technical progress claim to begin review."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      ) : activeTab === "wbs" ? (
        <WBSStructuring claims={claims} showToast={showToast} currentUser={currentUser} activeRole={activeRole} lang={lang} />
      ) : activeTab === "invoices" ? (
        <InvoiceAuditingVault claims={claims} setClaims={setClaims} currentUser={currentUser} activeRole={activeRole} showToast={showToast} setPreviewDoc={setPreviewDoc} addNotification={addNotification} lang={lang} />
      ) : activeTab === "lcs" ? (
        <LCManagement claims={claims} setClaims={setClaims} currentUser={currentUser} activeRole={activeRole} showToast={showToast} lang={lang} />
      ) : activeTab === "documents" ? (
        <SovereignDocumentRegistry claims={claims} setClaims={setClaims} currentUser={currentUser} showToast={showToast} setPreviewDoc={setPreviewDoc} lang={lang} />
      ) : activeTab === "interactive_dashboard" ? (
        <InteractiveDashboard claims={claims} currentUser={currentUser} lang={lang} onProjectClick={(projId) => { setActiveTab("claims"); setSelectedClaimId(projId); }} />
      ) : activeTab === "notifications" ? (
        <NotificationCenter
          notifications={notifications}
          currentUser={currentUser}
          lang={lang}
          onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id && n.userId === currentUser?.id ? { ...n, read: true } : n))}
          onNotificationClick={handleNotificationClick}
          onClearAll={() => {
            setNotifications(prev => prev.filter(n => n.userId !== currentUser?.id));
            showToast(lang === "ar" ? "تم مسح سجل الإخطارات بالكامل." : "Notification log cleared successfully.", "info");
          }}
          onResolveAction={(id) => {
            setNotifications(prev => prev.map(n => n.id === id && n.userId === currentUser?.id ? { ...n, actionCompleted: true, read: true } : n));
          }}
        />
      ) : activeTab === "users" ? (
        <UserManagementAdmin showToast={showToast} lang={lang} />
      ) : (
        <UserProfile currentUser={currentUser} showToast={showToast} lang={lang} />
      )}
    </div>
  </div>

  {previewDoc && (() => {
                      const hostClaim = claims.find(c => c.documents.some(d => d.id === previewDoc.id));
                      const company = hostClaim ? hostClaim.company : "National Oil Corporation";
                      const code = hostClaim ? hostClaim.code : "NOC-HQ";
                      const title = hostClaim ? hostClaim.title : "Sovereign Audit Document";

                      const handleDownload = () => {
                        let blob: Blob;
                        let finalDownloadName = previewDoc.name;
                        
                        if (previewDoc.type === "PDF" && (!previewDoc.url || previewDoc.url === "#")) {
                          if (previewDoc.name.startsWith("Form_3_Payment_Authorization_")) {
                            if (isRtl) {
                              const content = `========================================================================
اللجنة السيادية لمتابعة خطة 2026م:
   الاسم: ${hostClaim?.form3SignedByChairman || 'أ. سلمى الهاشمي'} (موقع إلكترونياً)
------------------------------------------------------------------------
رمز الدفع الإلكتروني المعتمد (ERP Token): ${hostClaim?.paymentToken || 'N/A'}
========================================================================`;
                              blob = new Blob([content], { type: "text/plain" });
                              finalDownloadName = previewDoc.name.replace(/\.pdf$/i, ".txt");
                            } else {
                              const title = "PAYMENT AUTHORIZATION & ENHANCEMENT - FORM 3";
                              const lines = [
                                "NATIONAL OIL CORPORATION - TRIPOLI",
                                "SOVEREIGN PLAN 2026 MONITORING COMMITTEE",
                                "",
                                `Date of Issue: ${new Date().toLocaleDateString('en-GB')}`,
                                `Letter of Credit Ref: LC-2026-${hostClaim?.companyId || 'HQ'}-001`,
                                `Operating Operator: ${company}`,
                                `Contractor Beneficiary: ${hostClaim?.submittedBy || 'Contractor'}`,
                                `Invoice Reference: ${hostClaim?.invoiceNumber || `INV-${code}`}`,
                                `Due Date for Payment: ${hostClaim?.dueDate || 'Immediate'}`,
                                "",
                                "FINANCIAL ALLOCATION SUMMARY:",
                                `Original LC Baseline Value: EUR ${(184450000).toLocaleString()}`,
                                `Authorized Payout Amount:   EUR ${(hostClaim?.invoiceAmount || 0).toLocaleString()}`,
                                "Funding Source: 2026 Production Increase Budget",
                                "",
                                "AUTHORIZATION MANDATE:",
                                "Central Finance is hereby authorized to release and liquidate funds to",
                                "the beneficiary named above. This authorization forms an integral part",
                                "of the LC disbursement verification ledger.",
                                "",
                                "ELECTRONIC SIGNATURE VERIFICATIONS:",
                                `1. Director of Central Finance Department:`,
                                `   Signee: ${hostClaim?.form3SignedByFinance || 'Mr. Abdelrahman Boufardis'} (Digitally Signed)`,
                                `2. Chairman of 2026 Plan Monitoring Committee:`,
                                `   Signee: ${hostClaim?.form3SignedByChairman || 'Mrs. Salma Al-Hashemi'} (Digitally Signed)`,
                                "",
                                `System Payment Authorization Token (ERP Token):`,
                                `[${hostClaim?.paymentToken || 'N/A'}]`
                              ];
                              blob = generateSecurePdf(title, lines);
                            }
                          } else {
                            const title = `SOVEREIGN FILE REGISTER - ${previewDoc.name.replace(".pdf", "").replace(/_/g, " ").toUpperCase()}`;
                            const lines = [
                              "NATIONAL OIL CORPORATION LIBYA - SOVEREIGN PMO",
                              "SECURITY CLASSIFICATION: OFFICIAL SOVEREIGN RECORD",
                              "",
                              `Document Reference: ${previewDoc.name}`,
                              `Associated Subsidiary: ${company}`,
                              `Associated Project: ${code} - ${title}`,
                              `Filing Date/Time: ${previewDoc.uploadedAt}`,
                              "",
                              "COMPLIANCE & VERIFICATION STATEMENT:",
                              "We hereby certify that all technical milestone conditions are completed and verified.",
                              "All supporting physical evidence matches structural blueprints. On-site surveys",
                              "were validated by Authorized Third-Party Inspection Officials.",
                              "",
                              "STATUS: TECHNICAL VALIDATION CLEARED (SIGNED ELECTRONICALLY)",
                              `Audit Fingerprint Hash (SHA-256):`,
                              `[8f71c26b9a84a84a3021f1d18c99e0b8a3012903fe5398ab776f8216c5b9ef182a]`,
                              "",
                              "This document is cryptographically anchored to the National Oil Corporation's",
                              "secure digital ledger. Any modifications instantly invalidate verification."
                            ];
                            blob = generateSecurePdf(title, lines);
                          }
                        } else {
                          let content = "";
                          let contentType = "text/plain";
                          
                          if (previewDoc.type === "XLSX") {
                            content = `National Oil Corporation Libya - Progress Measurement Ledger Sheet\n` +
                                      `Document Name,${previewDoc.name}\n` +
                                      `Registered Date,${previewDoc.uploadedAt}\n` +
                                      `Operator,${company}\n` +
                                      `Project Reference,${code}\n` +
                                      `Project Description,${title}\n` +
                                      `Status,Verified Earned Value Ledger\n\n` +
                                      `Item,WBS Code,Deliverable/Activity Description,Budget Weight,Contract Value,Verified Progress,Earned Value\n` +
                                      `1,1.0,Electrical and Hookups Wiring Hookups,10.0%,€125000,100%,€125000\n` +
                                      `2,2.0,Pressure Test Certification,5.0%,€62500,100%,€62500\n` +
                                      `3,3.0,Site Cleanup & Demobilization,2.5%,€31250,0%,€0\n` +
                                      `TOTAL,,,17.5%,€218750,,€187500\n`;
                            contentType = "text/csv";
                            finalDownloadName = previewDoc.name.replace(/\.xlsx$/i, ".csv");
                          } else {
                            content = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">` +
                                      `<rect width="100%" height="100%" fill="%230f172a"/>` +
                                      `<circle cx="400" cy="300" r="150" fill="none" stroke="%23f59e0b" stroke-width="4"/>` +
                                      `<line x1="400" y1="50" x2="400" y2="550" stroke="%23334155" stroke-width="1" stroke-dasharray="5,5"/>` +
                                      `<line x1="50" y1="300" x2="750" y2="300" stroke="%23334155" stroke-width="1" stroke-dasharray="5,5"/>` +
                                      `<text x="40" y="80" fill="%2322c55e" font-family="monospace" font-size="12">GPS: 32°52'31.1"N 13°11'15.4"E</text>` +
                                      `<text x="40" y="100" fill="%2394a3b8" font-family="monospace" font-size="12">ELEVATION: 42.1m</text>` +
                                      `<text x="40" y="120" fill="%2394a3b8" font-family="monospace" font-size="12">DEVICE: SENSOR-FLIR-T5</text>` +
                                      `<text x="40" y="140" fill="%23f59e0b" font-family="monospace" font-size="12">TARGET: WELLHEAD-TIE-IN</text>` +
                                      `<text x="400" y="300" fill="%23ef4444" font-family="monospace" font-size="20" font-weight="bold" text-anchor="middle">CROSSHAIR LOCKED</text>` +
                                      `<text x="400" y="550" fill="%23f59e0b" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">NATIONAL OIL CORPORATION EVIDENCE PHOTO</text>` +
                                      `</svg>`;
                            contentType = "image/svg+xml";
                          }
                          blob = new Blob([content], { type: contentType });
                        }
                        
                        const url = URL.createObjectURL(blob);
                        const token = localStorage.getItem("noc_jwt_token");
                        const downloadUrl = (previewDoc.url && previewDoc.url !== "#")
                          ? `${previewDoc.url}?token=${token || ""}&company_id=${hostClaim?.companyId || ""}&project_id=${hostClaim?.id || ""}`
                          : url;
                        const a = document.createElement("a");
                        a.href = downloadUrl;
                        a.download = finalDownloadName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        showToast(`File download started: "${finalDownloadName}"`, "success");
                      };


        const handlePrint = () => {
          window.print();
        };

        return (
          <div id="noc-document-preview-modal-root" className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left print:absolute print:bg-white print:p-0 print:inset-0 print:block print:z-[99999] print:overflow-visible" dir="ltr">
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                #print-document-target {
                  transform: none !important;
                  min-height: auto !important;
                  width: 100% !important;
                  max-width: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  border: none !important;
                  box-shadow: none !important;
                  display: block !important;
                }
                /* Hide everything else on print */
                body {
                  background: white !important;
                  color: black !important;
                }
                @page {
                  margin: 10mm !important;
                }
              }
            ` }} />
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-slate-300 print:border-none print:shadow-none print:w-full print:h-auto print:overflow-visible print:block print:max-w-none print:static print:p-0 print:m-0">
              {/* Header */}
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0 print:hidden">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    previewDoc.type === "PDF" ? "bg-red-500/20 text-red-400" :
                    previewDoc.type === "XLSX" ? "bg-emerald-500/20 text-emerald-400" :
                    "bg-indigo-500/20 text-indigo-400"
                  }`}>
                    <FileText className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      Sovereign Multi-Format Document Workspace
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-amber-400 border border-slate-700 rounded-full font-mono">
                        {previewDoc.type} Verified
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                      <span>Path: /noc_vault/evidence/{previewDoc.name}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(previewDoc.name.startsWith("Form_4_Technical_Approval_") || previewDoc.document_type === "technical_approval_form") && (activeRole === "pmo_auditor" || activeRole === "subsidiary_pm") && (
                    <button
                      onClick={handleSaveForm4}
                      className="p-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                      title="Save edits and sign document electronically"
                    >
                      <Check className="w-4 h-4 text-white" />
                      {isRtl ? "حفظ وتوقيع إلكتروني" : "Save & E-Sign"}
                    </button>
                  )}
                  <button
                    onClick={handleDownload}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    title="Download original file to local disk"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    Download
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    title="Print document or save as PDF"
                  >
                    <Printer className="w-4 h-4 text-indigo-400" />
                    Print
                  </button>
                  <div className="h-6 w-px bg-slate-800 mx-1"></div>
                  <button
                    onClick={() => {
                      setPreviewDoc(null);
                      setPreviewZoom(1);
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Main Workspace Layout */}
              <div className="flex flex-1 overflow-hidden print:block print:overflow-visible">
                
                {/* Left Panel: Audit Metadata & Security Signatures */}
                <div className={`w-80 bg-slate-50 ${isRtl ? "border-l" : "border-r"} border-slate-200 p-5 flex flex-col justify-between overflow-y-auto shrink-0 ${isRtl ? "text-right" : "text-left"} print:hidden`}>
                  <div className="space-y-5">
                    
                    {/* Document Meta Information */}
                    <div>
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Technical Properties</h5>
                      <div className="bg-white border rounded-xl p-3.5 space-y-2.5 text-xs shadow-sm">
                        <div className="flex justify-between border-b pb-1.5">
                          <span className="text-slate-400 font-semibold">Filename</span>
                          <span className="font-bold text-slate-800 font-mono truncate max-w-[120px]" title={previewDoc.name}>{previewDoc.name}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1.5">
                          <span className="text-slate-400 font-semibold">Registered Size</span>
                          <span className="font-bold text-slate-800 font-mono">{previewDoc.size}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1.5">
                          <span className="text-slate-400 font-semibold">Filing System</span>
                          <span className="font-bold text-slate-800">NOC Secure Vault</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Filing Time</span>
                          <span className="font-bold text-slate-800 font-mono">{previewDoc.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Associated Project / Subsidiary Scope */}
                    <div>
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Sovereign Project Context</h5>
                      <div className="bg-white border rounded-xl p-3.5 text-xs shadow-sm space-y-2.5">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 block uppercase">Operating Operator</span>
                          <span className="font-bold text-slate-800 block text-xs mt-0.5">{company}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t">
                          <div>
                            <span className="text-[10px] font-black text-slate-400 block uppercase">Project Code</span>
                            <span className="font-mono font-bold text-amber-600 block text-xs mt-0.5">{code}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-slate-400 block uppercase">Deliverables #</span>
                            <span className="font-bold text-slate-800 block text-xs mt-0.5">
                              {hostClaim ? hostClaim.deliverables.length : "3"} Items
                            </span>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <span className="text-[10px] font-black text-slate-400 block uppercase">Project Title</span>
                          <span className="font-semibold text-slate-600 block text-xs mt-0.5 truncate" title={title}>{title}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cryptographic Ledger Verification Seal */}
                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 text-xs space-y-2.5">
                      <div className="flex items-center gap-1.5 text-amber-800 font-black">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Sovereign Ledger Anchored</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-normal">
                        This document's binary fingerprint is securely anchored to the National Oil Corporation's blockchain-backed progress ledger. Any modifications instantly invalidate the sovereign state audit certificate.
                      </p>
                      <div className="bg-white border rounded p-2 text-[9px] font-mono text-slate-500 break-all space-y-1">
                        <div className="font-bold text-slate-700">SHA-256 Fingerprint:</div>
                        <div>8f71c26b9a84a3021f1d18c99e0b8a3012903fe5398ab776f8216c5b9ef182a</div>
                      </div>
                    </div>

                  </div>

                  {/* Actions / Close */}
                  <div className="pt-4 border-t space-y-2">
                    <button
                      onClick={handleDownload}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download Original Document
                    </button>
                    <p className="text-[9px] text-center text-slate-400">
                      Standardized file verification certificate. Registered & locked.
                    </p>
                  </div>

                </div>

                {/* Right Panel: Rendered Paper Sheet Viewport */}
                <div className="flex-1 bg-slate-800 p-6 overflow-y-auto flex flex-col items-center justify-start min-h-[400px] print:bg-white print:p-0 print:overflow-visible print:block">
                  
                  {/* Interactive Viewer Toolbar (Scale/Zoom/etc) */}
                  <div className="bg-slate-900/90 text-white px-4 py-2 rounded-xl mb-4 shadow border border-slate-700/80 flex justify-between items-center w-full max-w-3xl shrink-0 print:hidden">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <span className="font-bold text-amber-400">Live Render Panel:</span>
                      <span>{previewDoc.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Scale:</span>
                      <button
                        onClick={() => setPreviewZoom(z => Math.max(0.5, z - 0.25))}
                        disabled={previewZoom <= 0.5}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-bold rounded cursor-pointer border border-slate-700"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold text-amber-400 w-12 text-center">
                        {Math.round(previewZoom * 100)}%
                      </span>
                      <button
                        onClick={() => setPreviewZoom(z => Math.min(2.0, z + 0.25))}
                        disabled={previewZoom >= 2.0}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-bold rounded cursor-pointer border border-slate-700"
                      >
                        +
                      </button>
                      <button
                        onClick={() => setPreviewZoom(1)}
                        className="text-[10px] px-2 py-0.5 hover:text-white text-slate-400 underline cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* The actual Document Sheet Paper emulation */}
                  <div
                    id="print-document-target"
                    className="bg-white rounded shadow-2xl border p-10 max-w-3xl w-full text-left transition-transform duration-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:transform-none"
                    style={{
                      transform: `scale(${previewZoom})`,
                      transformOrigin: "top center",
                      minHeight: "800px"
                    }}
                  >
                    
                    {previewDoc.type === "PDF" ? (
                      previewDoc.name.startsWith("Form_4_Technical_Approval_") || previewDoc.document_type === "technical_approval_form" ? (
                        <TechnicalApprovalForm
                          claim={hostClaim || claims[0]}
                          lcData={{
                            companyId: hostClaim ? hostClaim.companyId : "WAHA",
                            companyName: hostClaim ? hostClaim.company : "Waha Oil Company",
                            companyNameAr: hostClaim ? hostClaim.company : "الواحة للنفط",
                            allocatedShare: 184450000,
                            openLcsCount: 8,
                            openLcsValue: 80000000,
                            totalPaid: 30000000,
                            outstandingCommitment: 50000000,
                            availableBalance: 104450000
                          }}
                          isRtl={lang === "ar"}
                          isEditable={activeRole === "pmo_auditor" || activeRole === "subsidiary_pm"}
                          projectClassification={form4Classification}
                          setProjectClassification={setForm4Classification}
                          otherClassificationText={form4OtherClassText}
                          setOtherClassificationText={setForm4OtherClassText}
                          isConformant={form4IsConformant}
                          setIsConformant={setForm4IsConformant}
                          isObjectionFree={form4IsObjectionFree}
                          setIsObjectionFree={setForm4IsObjectionFree}
                          technicalNotes={form4Notes}
                          setTechnicalNotes={setForm4Notes}
                          recommendation={form4Recommendation}
                          setRecommendation={setForm4Recommendation}
                          partialValue={form4PartialValue}
                          setPartialValue={setForm4PartialValue}
                          preparedByName={form4PreparedBy}
                          setPreparedByName={setForm4PreparedBy}
                          approvedByName={form4ApprovedBy}
                          setApprovedByName={setForm4ApprovedBy}
                          deptType={form4Dept}
                          setDeptType={setForm4Dept}
                        />
                      ) : previewDoc.name.startsWith("Form_3_Payment_Authorization_") ? (
                        <PaymentAuthorizationForm 
                          claim={hostClaim || claims[0]} 
                          lcData={{
                            companyId: hostClaim ? hostClaim.companyId : "WAHA",
                            companyName: hostClaim ? hostClaim.company : "Waha Oil Company",
                            companyNameAr: hostClaim ? hostClaim.company : "الواحة للنفط",
                            allocatedShare: 184450000,
                            openLcsCount: 8,
                            openLcsValue: 80000000,
                            totalPaid: 30000000,
                            outstandingCommitment: 50000000,
                            availableBalance: 104450000
                          }}
                          isRtl={lang === "ar"}
                        />
                      ) : previewDoc.name.startsWith("Form_2_Certificate_Of_Conformity") || previewDoc.document_type === "certificate_of_conformity" ? (
                        <Form2CertificateOfConformity 
                          currentUser={currentUser}
                          claim={hostClaim || claims[0]}
                          lcData={{
                            companyId: hostClaim ? hostClaim.companyId : "WAHA",
                            companyName: hostClaim ? hostClaim.company : "Waha Oil Company",
                            companyNameAr: hostClaim ? hostClaim.company : "الواحة للنفط",
                            allocatedShare: 184450000,
                            openLcsCount: 8,
                            openLcsValue: 80000000,
                            totalPaid: 30000000,
                            outstandingCommitment: 50000000,
                            availableBalance: 104450000
                          }}
                          isRtl={lang === "ar"}
                          isEditable={(activeRole === "subsidiary_pm" || activeRole === "subsidiary_finance" || activeRole === "subsidiary_dept" || activeRole === "subsidiary_chairman" || activeRole === "steering_committee")}
                          contractorName={form2Contractor} setContractorName={setForm2Contractor}
                          invoiceNumber={form2InvoiceNo} setInvoiceNumber={setForm2InvoiceNo}
                          invoiceDate={form2InvoiceDate} setInvoiceDate={setForm2InvoiceDate}
                          invoiceValue={form2InvoiceValue} setInvoiceValue={setForm2InvoiceValue}
                          is100Percent={form2Is100} setIs100Percent={setForm2Is100}
                          partialPercent={form2Partial} setPartialPercent={setForm2Partial}
                          productionImpactBarrels={form2Barrels} setProductionImpactBarrels={setForm2Barrels}
                          hasBillOfLading={form2HasBol} setHasBillOfLading={setForm2HasBol}
                          hasSiteReceipt={form2HasReceipt} setHasSiteReceipt={setForm2HasReceipt}
                          hasContractorInvoice={form2HasInvoice} setHasContractorInvoice={setForm2HasInvoice}
                          hasTechnicalReport={form2HasTech} setHasTechnicalReport={setForm2HasTech}
                          valueInWords={form2Words} setValueInWords={setForm2Words}
                          signedByEngineer={form2Eng} setSignedByEngineer={setForm2Eng}
                          signedByDeptManager={form2Dept} setSignedByDeptManager={setForm2Dept}
                          signedByFinanceManager={form2Fin} setSignedByFinanceManager={setForm2Fin}
                          signedByChairman={form2Chair} setSignedByChairman={setForm2Chair}
                        />
                      ) : (
                        /* PDF Page Render Emulation */
                        <div className="font-serif text-slate-800 leading-relaxed text-xs">
                        
                        {/* Letterhead */}
                        <div className="border-b-4 border-slate-900 pb-4 mb-6 flex justify-between items-start">
                          <div>
                            <div className="text-sm font-bold tracking-widest text-slate-900 uppercase">National Oil Corporation Libya</div>
                            <div className="text-[10px] font-bold text-slate-600 tracking-wider">PMO Technical Oversight Department</div>
                            <div className="text-[9px] text-slate-400">P.O. Box 2655, Tripoli, State of Libya</div>
                          </div>
                          <div className="text-right">
                            <div className="bg-slate-900 text-white font-mono px-3 py-1 text-[10px] rounded font-bold uppercase tracking-wider">
                              OFFICIAL TRANSCRIPT
                            </div>
                            <div className="text-[9px] text-slate-400 mt-1 font-mono">ID: NOC-CERT-{code}</div>
                          </div>
                        </div>

                        {/* Crest */}
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-50 border border-amber-300 rounded-full text-amber-600 font-bold text-sm mb-1 shadow-sm">
                            ★ NOC ★
                          </div>
                          <h2 className="text-base font-black text-slate-900 tracking-tight font-sans uppercase">
                            Technical Inspection Sign-Off Certificate
                          </h2>
                          <p className="text-[10px] text-slate-500 font-sans italic mt-1">
                            Issued pursuant to Sovereign Asset Auditing Directives
                          </p>
                        </div>

                        {/* Contract Details table */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-[11px] bg-slate-50 border p-3 rounded font-sans">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">OPERATING OPERATOR</span>
                            <span className="font-bold text-slate-800">{company}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">PROJECT / CLAIM CODE</span>
                            <span className="font-bold text-slate-800 font-mono">{code}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">INSPECTOR REGISTRATION</span>
                            <span className="font-semibold text-slate-700">TPI-LIBYA-AUDIT-2026</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">FILING TIMESTAMP</span>
                            <span className="font-bold text-emerald-600 font-mono">{previewDoc.uploadedAt} (Tripoli Time)</span>
                          </div>
                        </div>

                        {/* Certificate Body Narrative */}
                        <div className="space-y-4 text-justify leading-relaxed">
                          <p>
                            <strong>1. Technical Scope of Validation:</strong> This certifies that the National Oil Corporation PMO technical inspector crew has performed a rigorous physical audit of all deliverables claimed under the active progress cycle. On-site technical reviews, physical surveys, and material compliance certifications were comprehensively analyzed at the source oil field installation site.
                          </p>

                          <p>
                            <strong>2. Verification and Measurement Results:</strong> The mechanical construction, electrical tie-ins, and civil foundation integrity meet or exceed the engineering tolerances defined in the Master Project Contract Agreement. Hydrostatic pressure tests of piping networks and loops were checked under maximum rated conditions with zero pressure drop detected over the 24-hour testing window.
                          </p>

                          {/* Deliverables List Emulation */}
                          <div className="my-4 font-sans text-[11px]">
                            <div className="font-bold text-slate-900 mb-2 uppercase text-[10px] tracking-wider">
                              Verified Deliverables & Component Status:
                            </div>
                            <div className="border rounded-lg overflow-hidden divide-y bg-white">
                              {(hostClaim ? hostClaim.deliverables : [
                                { id: "d1", description: "Mechanical Piping & Valve assembly verification", status: "completed", weight: "10.0%" },
                                { id: "d2", description: "Hydrostatic test safety signoff", status: "completed", weight: "5.0%" },
                                { id: "d3", description: "Final structural site clearance certificate", status: "pending", weight: "2.5%" }
                              ]).map((del, idx) => (
                                <div key={del.id} className="p-2.5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-400">#{idx + 1}</span>
                                    <span className="font-semibold text-slate-800">{del.description}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-slate-400 font-mono">Weight: {del.weight}</span>
                                    {del.status === "completed" ? (
                                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        ✓ 100% Verified
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                        ⏱ In Progress
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <p>
                            <strong>3. Sovereign Authorization Clearance:</strong> Based on the certified technical progress shown above, the technical PMO Auditor hereby issues a full release of the technical milestone hold-back. Financial teams are cleared to authorize commercial payment drawdowns matching the earned value progress capped at 100% of the technically approved scope.
                          </p>
                        </div>

                        {/* Signatures Block */}
                        <div className="mt-10 pt-8 border-t border-dashed grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-sans text-[10px]">
                          <div>
                            <div className="text-slate-400 font-bold mb-6 block uppercase text-[8px]">CONTRACTOR REP</div>
                            <div className="italic font-bold text-slate-800">Eng. Tarek El-Fassi</div>
                            <div className="text-[8px] text-slate-400 font-mono mt-1">E-Signed (2026-07-06)</div>
                          </div>
                          <div>
                            <div className="text-slate-400 font-bold mb-6 block uppercase text-[8px]">OPERATOR TECHNICAL PM</div>
                            <div className="italic font-bold text-slate-800">Eng. Salem Al-Obeidi</div>
                            <div className="text-[8px] text-slate-400 font-mono mt-1">E-Signed (2026-07-06)</div>
                          </div>
                          <div>
                            <div className="text-slate-400 font-bold mb-6 block uppercase text-[8px]">NOC PMO AUDITOR CHIEF</div>
                            <div className="font-bold text-emerald-700 flex flex-col items-center justify-center">
                              <span className="border border-emerald-500 bg-emerald-50 px-1 py-0.5 rounded text-[8px] font-mono tracking-tight font-black mb-1 rotate-[-2deg]">
                                APPROVED & SECURED
                              </span>
                              <span className="font-serif italic font-bold">Eng. Nadia Al-Kout</span>
                            </div>
                            <div className="text-[8px] text-slate-400 font-mono mt-1">Sovereign LEDGER-OK (Hash: e9821)</div>
                          </div>
                        </div>
                      </div>
                    )
                  ) : previewDoc.type === "XLSX" ? (
                      /* XLSX Spreadsheet Emulation */
                      <div className="font-sans text-xs text-slate-800">
                        
                        {/* Excel Ribbon Emulation */}
                        <div className="bg-emerald-800 text-white p-3 -mx-10 -mt-10 mb-6 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-white text-emerald-800 rounded font-black text-sm flex items-center justify-center shadow-sm">
                              X
                            </div>
                            <span className="font-bold text-xs">Progress Measurement Ledger • {previewDoc.name}</span>
                          </div>
                          <div className="text-[10px] font-mono font-bold bg-emerald-900 px-2 py-1 rounded border border-emerald-700">
                            Sheet1 (Active Baseline)
                          </div>
                        </div>

                        {/* Excel grid headers and columns */}
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-slate-300 text-left">
                            <thead>
                              <tr className="bg-slate-100 text-[10px] font-bold text-slate-600">
                                <th className="border border-slate-300 p-1.5 w-10 text-center bg-slate-200">ID</th>
                                <th className="border border-slate-300 p-1.5 w-16 bg-slate-200 font-mono">WBS</th>
                                <th className="border border-slate-300 p-1.5 bg-slate-200">Deliverable description / Cost Center</th>
                                <th className="border border-slate-300 p-1.5 w-20 text-right bg-slate-200">Weight</th>
                                <th className="border border-slate-300 p-1.5 w-28 text-right bg-slate-200">Contract Value</th>
                                <th className="border border-slate-300 p-1.5 w-20 text-right bg-slate-200">Progress %</th>
                                <th className="border border-slate-300 p-1.5 w-28 text-right bg-slate-200">Earned Value</th>
                              </tr>
                            </thead>
                            <tbody className="font-mono text-[11px] divide-y">
                              {(hostClaim ? hostClaim.deliverables : [
                                { id: "d1", description: "Complete electrical wiring hookups (Wells 14-18)", status: "completed", weight: "10.0%" },
                                { id: "d2", description: "Pressure test sign-off (QA/QC Dept)", status: "completed", weight: "5.0%" },
                                { id: "d3", description: "Site demobilization preparation", status: "pending", weight: "2.5%" }
                              ]).map((del, idx) => {
                                const weightNum = parseFloat(del.weight) || 5;
                                const contractVal = hostClaim ? hostClaim.numericValue * (weightNum / 100) : 500000;
                                const progress = del.status === "completed" ? 100 : 0;
                                const earnedVal = contractVal * (progress / 100);

                                return (
                                  <tr key={del.id} className="hover:bg-slate-50">
                                    <td className="border border-slate-300 p-1.5 text-center bg-slate-50 font-bold text-slate-400">{idx + 1}</td>
                                    <td className="border border-slate-300 p-1.5 text-slate-600">1.{idx + 1}</td>
                                    <td className="border border-slate-300 p-1.5 font-sans font-medium text-slate-900">{del.description}</td>
                                    <td className="border border-slate-300 p-1.5 text-right font-bold text-blue-600">{del.weight}</td>
                                    <td className="border border-slate-300 p-1.5 text-right text-slate-600">€{Math.round(contractVal).toLocaleString()}</td>
                                    <td className="border border-slate-300 p-1.5 text-right font-bold text-emerald-600">{progress}%</td>
                                    <td className="border border-slate-300 p-1.5 text-right font-black text-slate-900">€{Math.round(earnedVal).toLocaleString()}</td>
                                  </tr>
                                );
                              })}
                              
                              {/* Total Rows */}
                              <tr className="bg-emerald-50/50 font-bold">
                                <td className="border border-slate-300 p-1.5 text-center bg-slate-100">SUM</td>
                                <td className="border border-slate-300 p-1.5 text-slate-600">TOTAL</td>
                                <td className="border border-slate-300 p-1.5 font-sans">EVM Cumulative Cleared Summary</td>
                                <td className="border border-slate-300 p-1.5 text-right text-blue-700">
                                  {hostClaim ? hostClaim.deliverables.reduce((acc, d) => acc + (parseFloat(d.weight) || 0), 0).toFixed(1) : "17.5"}%
                                </td>
                                <td className="border border-slate-300 p-1.5 text-right text-slate-600">
                                  €{hostClaim ? hostClaim.numericValue.toLocaleString() : "1,250,000"}
                                </td>
                                <td className="border border-slate-300 p-1.5 text-right text-slate-400">
                                  -
                                </td>
                                <td className="border border-slate-300 p-1.5 text-right font-black text-emerald-800 text-[12px] bg-emerald-100/50">
                                  €{hostClaim 
                                    ? Math.round(hostClaim.deliverables.reduce((acc, d) => {
                                        const weightNum = parseFloat(d.weight) || 5;
                                        const contractVal = hostClaim.numericValue * (weightNum / 100);
                                        const progress = d.status === "completed" ? 100 : 0;
                                        return acc + (contractVal * (progress / 100));
                                      }, 0)).toLocaleString()
                                    : "187,500"
                                  }
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Excel spreadsheet meta logs */}
                        <div className="mt-8 border-t pt-4 text-[10px] text-slate-400 space-y-1 font-mono">
                          <p><strong>Formula Reference:</strong> =SUMPRODUCT(WeightRange, ProgressRange) * TotalContractValue</p>
                          <p><strong>Sovereign Hash Integrity Code:</strong> xlsx_integrity_ok_ledger_verified_sha256_e42817d29</p>
                          <p>Generated by: NOC Financial Auditing Integrator v4.2</p>
                        </div>

                      </div>
                    ) : (
                      /* IMAGE Document with HUD Overlays Emulation */
                      <div className="font-sans text-xs text-slate-800 space-y-4">
                        
                        <div className="text-center relative border border-slate-300 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center min-h-[350px]">
                          {previewDoc.url ? (
                            <img
                              src={previewDoc.url}
                              alt="Site Photo"
                              referrerPolicy="no-referrer"
                              className="max-h-[450px] mx-auto block object-contain select-none shadow-inner"
                              style={{ transform: `scale(${previewZoom})` }}
                            />
                          ) : (
                            <div className="p-10 text-center text-slate-400 space-y-3">
                              <Upload className="w-12 h-12 text-slate-600 mx-auto animate-in fade-in zoom-in-95 duration-200" />
                              <p className="font-bold">No High-Res URL found for manual attachment</p>
                              <p className="text-[10px] text-slate-500">Showing standard technical evidence verification frame placeholder</p>
                            </div>
                          )}

                          {/* Technical crosshair and HUD parameters overlay */}
                          <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none text-left font-mono text-[9px] text-emerald-400">
                            
                            {/* HUD Top bar */}
                            <div className="flex justify-between items-start bg-slate-950/40 p-2 rounded backdrop-blur-[1px]">
                              <div>
                                <p className="font-bold">EVIDENCE RECORD: {previewDoc.name}</p>
                                <p>GPS: 32°52'31.1"N 13°11'15.4"E</p>
                                <p>WELLHEAD SECTOR: WAHA-MAIN-H2</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-amber-400">STATUS: VERIFIED</p>
                                <p>ALT: 42.1m | GRID SYSTEM: UTM-32N</p>
                                <p>CAMERA SENSOR: SENSOR-FLIR-T5</p>
                              </div>
                            </div>

                            {/* HUD Center Crosshair */}
                            <div className="self-center flex flex-col items-center justify-center opacity-65">
                              <div className="w-16 h-16 border border-emerald-400 border-dashed rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                              </div>
                              <span className="text-[8px] tracking-widest uppercase mt-1 text-red-500 font-bold">CROSSHAIR LOCKED</span>
                            </div>

                            {/* HUD Bottom bar */}
                            <div className="flex justify-between items-end bg-slate-950/40 p-2 rounded backdrop-blur-[1px]">
                              <div>
                                <p>OPERATOR COMPLIANCE: OK</p>
                                <p>AUTHENTICATION ID: {Math.random().toString(36).substring(2, 9).toUpperCase()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">TIMESTAMP: {previewDoc.uploadedAt}</p>
                                <p>SECURED INTEGRITY LEDGER BLOCK: #89281</p>
                              </div>
                            </div>

                          </div>
                        </div>

                        <div>
                          <h5 className="font-bold text-slate-800 text-xs">Field Photo Evidence Verification HUD</h5>
                          <p className="text-[11px] text-slate-500 leading-normal mt-1">
                            High-resolution on-site engineering photograph verified by third-party PMO inspectors. Visual audit telemetry metadata is embedded inside the image container and sealed using SHA-256 hash anchoring on the sovereign data blockchain.
                          </p>
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>

              {/* Footer */}
              <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex justify-between items-center shrink-0 text-slate-400 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Verified by National Oil Corporation Central Registry</span>
                </div>
                <button
                  onClick={() => {
                    setPreviewDoc(null);
                    setPreviewZoom(1);
                  }}
                  className="px-6 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black hover:bg-amber-600 transition-colors cursor-pointer shadow-md"
                >
                  Close Document Workspace
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Claim Addition Modal */}
      <AddClaimModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentUser={currentUser}
        lang={lang}
        onAddClaim={(newClaim) => {
          setClaims([newClaim, ...claims]);
          setSelectedClaimId(newClaim.id);
          showToast(lang === "ar" ? `تم تقديم مطالبة الإنجاز الفني "${newClaim.code}" بنجاح للتدقيق الفني.` : `Progress claim "${newClaim.code}" has been submitted for technical audit.`, "success");
          addNotification(
            lang === "ar" ? "تم تقديم مطالبة فنية جديدة" : "New Technical Claim Submitted", 
            lang === "ar" 
              ? `تم تقديم مطالبة فنية جديدة "${newClaim.code}" للشركة "${newClaim.company}" بواسطة المهندس ${newClaim.submittedBy}.`
              : `A new technical claim "${newClaim.code}" for ${newClaim.company} has been submitted by ${newClaim.submittedBy}.`, 
            "info"
          );
        }}
      />

      {/* Beautiful Reset Confirmation Modal for Logged-In View */}
      {isResetConfirmOpen && (
        <div className={`fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 ${isRtl ? "text-right" : "text-left"} text-slate-100`} dir={isRtl ? "rtl" : "ltr"}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 text-amber-500 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Reset Application Data?</h3>
                  <p className="text-[10px] text-amber-400 font-mono tracking-widest uppercase mt-0.5">Sovereign Data Protection Action</p>
                </div>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently restore the National Oil Corporation Portfolio Audit System to its pristine baseline values?
              </p>
              
              <div className="mt-4 bg-slate-950/60 rounded-xl p-3 border border-slate-850 space-y-2">
                <div className="flex items-start gap-2 text-[11px] text-slate-400 leading-normal">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>WBS hierarchies & custom milestones will revert to defaults.</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-slate-400 leading-normal">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>All newly submitted claims, progress weights, and financial overrides will be cleared.</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-slate-400 leading-normal">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>All uploaded PDF/XLSX invoices and technical documents will be purged.</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="bg-transparent hover:bg-slate-900 text-slate-400 hover:text-white font-bold text-xs py-2 px-4 rounded-xl border border-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsResetConfirmOpen(false);
                  resetDemo();
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2 px-4 rounded-xl transition-colors shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
