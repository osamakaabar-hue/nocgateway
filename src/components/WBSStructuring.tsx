import React, { useState, useEffect } from "react";
import { Claim } from "../types";
import {
  FolderKanban,
  GitFork,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  AlertCircle,
  Clock,
  Briefcase,
  Lock,
  Unlock,
  Calendar,
  Layers,
  Milestone,
  CheckSquare,
  Play,
  Eye,
  Info,
  AlertTriangle
} from "lucide-react";

interface WBSStructuringProps {
  claims: Claim[];
  showToast: (text: string, type?: "success" | "info" | "error") => void;
  currentUser?: any;
  activeRole?: string;
  lang?: any;
}

export interface WBSNode {
  id: string;
  code: string;
  name: string;
  progress: number;
  budget: number;
  assignee: string;
  level: 1 | 2 | 3;
  isMilestone?: boolean;
  startDate?: string;
  endDate?: string;
  status?: "not_started" | "in_progress" | "completed";
  phase?: "Engineering" | "Procurement" | "Construction" | "Commissioning" | "Project Management";
}

export function getDefaultWBS(companyId: string): WBSNode[] {
  const lower = companyId.toLowerCase();
  
  // Define real-world project profiles for all companies
  const profiles: Record<string, { title: string; engineering: string; execution: string; qc: string }> = {
    SIRTE: {
      title: "Gas Pipeline & Compressor Station Upgrades",
      engineering: "P&ID diagrams, stress analysis & compressor specifications",
      execution: "Site excavation, compressor foundation pouring & pipeline welding",
      qc: "Non-destructive testing (NDT), valve seal checks & gas line purging"
    },
    BPMC: {
      title: "Fuel Terminal Depot Expansion & Logistics",
      engineering: "Depot layout designs, fire suppression blueprints & storage tank calculations",
      execution: "Concrete ring beam construction, fuel pump installation & distribution manifold setup",
      qc: "Fire hydrant pressure checks, tank hydrostatic calibration & safety system audits"
    },
    ZUEITINA: {
      title: "Crude Storage Tank Restoration & Port Logistics",
      engineering: "Plate thickness calculations, cathodic protection designs & piping layouts",
      execution: "Rust sandblasting, base steel sheet replacements & floating roof repairs",
      qc: "Vacuum box testing of bottom plate welds & laser tank calibration scans"
    },
    HAROUGE: {
      title: "Amal Desert Field Flowline Repair & Pipeline Tie-in",
      engineering: "Route optimization, soil resistivity studies & piping design specs",
      execution: "Right-of-Way clearing, flowline segment welding & desert trenching",
      qc: "Girth weld radiography (RT), valve test bench runs & pipeline hydrotests"
    },
    AKAKUS: {
      title: "Sharara Field Wellhead Drilling Logistics & Logistics Road",
      engineering: "Access road routing plans, basecamp site plans & heavy load route surveys",
      execution: "Desert sand stabilization, basecamp building erection & drill site grading",
      qc: "Compaction density verification testing & safety clearances check"
    },
    RASCO: {
      title: "Petrochemical Complex Thermal Cracking Unit Overhaul",
      engineering: "Vessel metallurgy specs, thermal stress simulation & bypass line designs",
      execution: "High-pressure valve swapping, internal tray refurbishing & steam line insulation",
      qc: "X-ray welding checks, steam-out purge validation & loop calibration logs"
    },
    ZAWIA: {
      title: "Refinery Distillation Column Tray Upgrades & Shipping Terminal",
      engineering: "Column internal hydraulic calculations, process flow sheet updates & seal designs",
      execution: "Tray removal and installation of high-capacity sieve trays & column head insulation",
      qc: "Tray level alignment surveys & internal column liquid distribution tests"
    },
    SONATRACH: {
      title: "Exploration Block NC-100 3D Seismic Surveying",
      engineering: "Seismic array layout plans, receiver frequency analysis & survey line mapping",
      execution: "Geophone line laying, recording trailer setup & seismic source truck calibration",
      qc: "Signal-to-noise ratio validation checks & initial data acquisition audits"
    },
    ENI: {
      title: "Offshore Gas Platform Structural Safety Audits & Subsea Hookup",
      engineering: "Structural load calculations, marine riser inspection plans & safety loops design",
      execution: "Platform bracket sandblasting, structural weld reinforcement & subsea valve tie-in",
      qc: "Ultrasonic testing of critical joints, emergency shutdown (ESD) loop test certification"
    },
    NPCC: {
      title: "Offshore Pipeline Trenching & Jacket Structure Installation",
      engineering: "Marine structural analysis, pile driving calculations & barge routing layouts",
      execution: "Jacket structure launching, offshore pile driving & subsea pipeline laying",
      qc: "Subsea weld inspection via ROV & sonar seabed trench depth verification"
    },
    JOWFE: {
      title: "Drilling Fluids & Bentonite Quality Control Facility",
      engineering: "Lab layout schematics, spectrometer calibration protocols & mud formula review",
      execution: "Spectrometer installation, ventilation systems setup & mud chemical warehouse layout",
      qc: "ASTM mud weight testing validations & safety chemical handling approvals"
    },
    TAKNIA: {
      title: "Bahr Essalam Phase II FEED Engineering Studies",
      engineering: "Hydraulic simulation models, process safety studies & budget estimate drafts",
      execution: "Process Flow Diagrams (PFD) drawing updates & project WBS drafting",
      qc: "Internal safety peer-review boards & technical design checks verification"
    },
    NDWC: {
      title: "Developmental Rig Mobilization & Well Workover Operations",
      engineering: "Rig setup layouts, blowout preventer (BOP) specs & drilling program review",
      execution: "Rig mast raising, BOP installation & drill string assembly",
      qc: "BOP pressure test certification & rig electrical system safety clearances"
    },
    NAGECO: {
      title: "Murzuq Basin 3D Seismic Data Processing & Surveying",
      engineering: "Geophysical mapping, survey line coordinates & frequency filtration specs",
      execution: "Geophone grid laying, vibrator truck field runs & data storage setups",
      qc: "Data telemetry uplink checks & noise level verification audits"
    },
    MURZUQ: {
      title: "Joint Venture Drilling Advisory & Project Management Consulting",
      engineering: "Drilling plan safety reviews, WBS milestones & budget control spreadsheets",
      execution: "Stakeholder progress workshops & cost-control tracking",
      qc: "Sovereign quality gate audits & compliance verification logs"
    },
    LIFECO: {
      title: "Urea Fertilizer Plant Compressor Overhaul",
      engineering: "Rotor stress analysis, dynamic balance specifications & gas seal drawings",
      execution: "Urea compressor dismantling, rotor alignment & high-pressure seal replacements",
      qc: "Rotor dynamic balancing certification & helium leak testing verification"
    },
    CATERING: {
      title: "Centralized Desert Field Catering Logistics & Supply Chains",
      engineering: "Cold chain logistics mapping, hazard analysis (HACCP) & storage layouts",
      execution: "Deep freeze unit installations, supply truck loading bays & basecamp mess hall setups",
      qc: "Temperature logging checks & HACCP safety standard audits"
    },
    PETROAIR: {
      title: "Desert Field Aviation Support & Charter Maintenance Upgrade",
      engineering: "Flight route scheduling, aircraft check schedules & hangar layouts",
      execution: "Avionics system maintenance, landing gear servicing & fuel farm inspections",
      qc: "FAA flight safety checklist signoffs & fuel purity chemical tests"
    },
    NAFUSAH: {
      title: "Hamada Field Site Preparation & Well Pad Excavations",
      engineering: "Civil contour layouts, well pad spacing plans & environmental assessments",
      execution: "Tractor site grading, concrete anchor pouring & pipeline track clearing",
      qc: "Soil compaction ratio testing & civil dimensions checks"
    },
    MABRUK: {
      title: "Al-Jurf Production Platform Control Systems Upgrade",
      engineering: "Control system architecture, PLC ladder logic drafts & SCADA screen mockups",
      execution: "Server rack wiring, SCADA server mounting & operator console replacements",
      qc: "PLC logic simulation runs & emergency trip system loop calibrations"
    },
    SARIR: {
      title: "Sarir Field Oil-Water Separator Mechanical Cleaning & Overhaul",
      engineering: "Vessel thickness scans, internal piping plans & safety purging guidelines",
      execution: "Vessel opening, sand deposit cleaning & internal mist extractor replacements",
      qc: "Wall thickness measurement logs & final pressure hydrotests"
    },
    LERCO: {
      title: "Ras Lanuf Refinery Desalination Unit Refurbishment",
      engineering: "Thermal desalination simulations, piping specs & valve schedule updates",
      execution: "Heat exchanger tube cleaning, evaporator plate swaps & water line piping",
      qc: "Tube bundle hydrotests & output water salinity level calibrations"
    },
    CLINIC: {
      title: "Main Oil Clinic Facility HVAC HEPA Filtration Upgrade",
      engineering: "Airflow circulation studies, HEPA filter specs & electrical layouts",
      execution: "Ductwork sealing, air handler unit swaps & digital controls integration",
      qc: "HEPA leak tests & differential pressure room checks"
    },
    STCPI: {
      title: "Technical Petroleum Welding Simulator Labs Installation",
      engineering: "VR training program syllabus, electrical layout designs & simulator requirements",
      execution: "VR simulator console assembly, smart welding bays setup & electrical wiring",
      qc: "Simulator data logging accuracy check & software performance runs"
    },
    PTQI: {
      title: "Petroleum Training Qualifying Institute Lab Equipment Upgrades",
      engineering: "Lab equipment specs, classroom layouts & network infrastructure plans",
      execution: "Gas chromatograph mounting, server rack installation & network cabling",
      qc: "Chromatograph calibration runs & network bandwidth checks"
    },
    PRC: {
      title: "Petroleum Research Center Reservoir Core Sample Scanning",
      engineering: "Core scanning protocols, database schema design & geological mapping",
      execution: "Core sample scanner installation, database server setup & scanning operations",
      qc: "Core image scan resolution validations & database upload logs"
    },
    SIPT: {
      title: "Southern Region Petroleum Engineering Training Workshops",
      engineering: "Training course plans, safety manuals & tool storage designs",
      execution: "Practical workshop setups, drilling simulator installs & tool bays",
      qc: "Safety equipment inventories & training program compliance logs"
    },
    API: {
      title: "Oasis Region Safety Training H2S Simulator Program",
      engineering: "H2S simulator layout, toxic gas alarm logic & training curriculum",
      execution: "Simulation chamber construction, alarm system installation & cabling",
      qc: "Chamber air seal tests & emergency alarm sequence calibrations"
    }
  };

  // Fallback profile if companyId is not in mapping
  const profile = profiles[companyId] || {
    title: `${companyId} Infrastructure Expansion Project`,
    engineering: "Engineering studies, design P&IDs & site layouts",
    execution: "Site clearing, foundation pouring & equipment installation",
    qc: "QA/QC inspections, pressure tests & safety clearances check"
  };

  return [
    // 1.0 Initiating
    {
      id: `${lower}-1`,
      code: "1.0",
      name: "Initiating Process Group - Project Charter & Stakeholder Alignment",
      progress: 100,
      budget: 150000,
      assignee: "Project Sponsor",
      level: 1,
      isMilestone: false,
      startDate: "2026-06-01",
      endDate: "2026-06-10",
      status: "completed",
      phase: "Project Management"
    },
    {
      id: `${lower}-1-1`,
      code: "1.1",
      name: "Milestone: Project Charter Signed & Site Kickoff",
      progress: 100,
      budget: 0,
      assignee: "Project Sponsor",
      level: 2,
      isMilestone: true,
      startDate: "2026-06-10",
      endDate: "2026-06-10",
      status: "completed",
      phase: "Project Management"
    },

    // 2.0 Planning
    {
      id: `${lower}-2`,
      code: "2.0",
      name: `Planning Process Group - Detailed Engineering: ${profile.engineering}`,
      progress: 100,
      budget: 350000,
      assignee: "Engineering Director",
      level: 1,
      isMilestone: false,
      startDate: "2026-06-11",
      endDate: "2026-06-30",
      status: "completed",
      phase: "Engineering"
    },
    {
      id: `${lower}-2-1`,
      code: "2.1",
      name: "Milestone: Detailed Designs & HAZOP Study Certified",
      progress: 100,
      budget: 0,
      assignee: "Engineering Director",
      level: 2,
      isMilestone: true,
      startDate: "2026-06-30",
      endDate: "2026-06-30",
      status: "completed",
      phase: "Engineering"
    },

    // 3.0 Executing
    {
      id: `${lower}-3`,
      code: "3.0",
      name: `Executing Process Group - Procurement & Construction: ${profile.execution}`,
      progress: 60,
      budget: 1850000,
      assignee: "Construction Manager",
      level: 1,
      isMilestone: false,
      startDate: "2026-07-01",
      endDate: "2026-08-25",
      status: "in_progress",
      phase: "Construction"
    },
    {
      id: `${lower}-3-1`,
      code: "3.1",
      name: "Milestone: Heavy Foundations & Material Procurement Complete",
      progress: 100,
      budget: 0,
      assignee: "Construction Manager",
      level: 2,
      isMilestone: true,
      startDate: "2026-07-25",
      endDate: "2026-07-25",
      status: "completed",
      phase: "Construction"
    },

    // 4.0 Monitoring & Controlling
    {
      id: `${lower}-4`,
      code: "4.0",
      name: `Monitoring & Controlling Process Group - Quality Assurances: ${profile.qc}`,
      progress: 25,
      budget: 450000,
      assignee: "QA/QC Auditor",
      level: 1,
      isMilestone: false,
      startDate: "2026-07-15",
      endDate: "2026-08-30",
      status: "in_progress",
      phase: "Commissioning"
    },
    {
      id: `${lower}-4-1`,
      code: "4.1",
      name: "Milestone: Safety Interlocks & Pressure Tests Approved",
      progress: 0,
      budget: 0,
      assignee: "QA/QC Auditor",
      level: 2,
      isMilestone: true,
      startDate: "2026-08-20",
      endDate: "2026-08-20",
      status: "not_started",
      phase: "Commissioning"
    },

    // 5.0 Closing
    {
      id: `${lower}-5`,
      code: "5.0",
      name: "Closing Process Group - As-Built Handover & Closeout Audit",
      progress: 0,
      budget: 200000,
      assignee: "Project Lead",
      level: 1,
      isMilestone: false,
      startDate: "2026-08-26",
      endDate: "2026-09-10",
      status: "not_started",
      phase: "Project Management"
    },
    {
      id: `${lower}-5-1`,
      code: "5.1",
      name: "Milestone: Final Sovereign Asset Acceptance Signed",
      progress: 0,
      budget: 0,
      assignee: "NOC Central Executive",
      level: 2,
      isMilestone: true,
      startDate: "2026-09-10",
      endDate: "2026-09-10",
      status: "not_started",
      phase: "Project Management"
    }
  ];
}

const INITIAL_PROJECT_WBS: Record<string, WBSNode[]> = {
  "WAHA": [
    { id: "waha-1", code: "1.0", name: "Wellhead Engineering & Design Review", progress: 100, budget: 150000, assignee: "Eng. Tarek El-Fassi", level: 1, isMilestone: false, startDate: "2026-06-01", endDate: "2026-06-20", status: "completed", phase: "Engineering" },
    { id: "waha-1-1", code: "1.1", name: "P&ID Diagrams and Flow Sheets Sign-off", progress: 100, budget: 80000, assignee: "Eng. Tarek El-Fassi", level: 2, isMilestone: true, startDate: "2026-06-15", endDate: "2026-06-15", status: "completed", phase: "Engineering" },
    { id: "waha-2", code: "2.0", name: "Civil Foundation Work & Excavation", progress: 85, budget: 450000, assignee: "Contractor Team A", level: 1, isMilestone: false, startDate: "2026-06-21", endDate: "2026-07-15", status: "in_progress", phase: "Construction" },
    { id: "waha-2-1", code: "2.1", name: "Borehole Soil Mechanics & Concrete Pouring", progress: 95, budget: 250000, assignee: "Contractor Team A", level: 2, isMilestone: false, startDate: "2026-06-22", endDate: "2026-07-05", status: "in_progress", phase: "Construction" },
    { id: "waha-2-2", code: "2.2", name: "Reinforced Rebar Grid Installation", progress: 70, budget: 200000, assignee: "Contractor Team A", level: 2, isMilestone: false, startDate: "2026-07-01", endDate: "2026-07-15", status: "in_progress", phase: "Construction" },
    { id: "waha-3", code: "3.0", name: "Mechanical Assembly & Valves Piping", progress: 40, budget: 650000, assignee: "Piping Specialists Ltd", level: 1, isMilestone: false, startDate: "2026-07-16", endDate: "2026-08-30", status: "in_progress", phase: "Construction" },
    { id: "waha-3-1", code: "3.1", name: "High-Pressure Valve Mounting", progress: 60, budget: 350000, assignee: "Piping Specialists Ltd", level: 2, isMilestone: false, startDate: "2026-07-16", endDate: "2026-08-10", status: "in_progress", phase: "Construction" },
    { id: "waha-3-2", code: "3.2", name: "Flange Alignment & Gasket Seal Verification", progress: 15, budget: 300000, assignee: "Piping Specialists Ltd", level: 2, isMilestone: false, startDate: "2026-08-11", endDate: "2026-08-30", status: "not_started", phase: "Construction" },
    { id: "waha-4", code: "4.0", name: "Offshore Gas Lift Compression Skid Fabrication", progress: 30, budget: 3200000, assignee: "Eng. Khaled Belhaj", level: 1, isMilestone: false, startDate: "2026-06-15", endDate: "2026-10-15", status: "in_progress", phase: "Procurement" },
    { id: "waha-4-1", code: "4.1", name: "Compressor Skid Mainframe & Turbine Procurement", progress: 60, budget: 1800000, assignee: "Eng. Khaled Belhaj", level: 2, isMilestone: false, startDate: "2026-06-15", endDate: "2026-08-01", status: "in_progress", phase: "Procurement" },
    { id: "waha-4-2", code: "4.2", name: "Hydraulic Integration & NDT Testing", progress: 10, budget: 1400000, assignee: "QA/QC Contractors", level: 2, isMilestone: false, startDate: "2026-08-02", endDate: "2026-10-15", status: "not_started", phase: "Construction" },
    { id: "waha-milestone", code: "5.0", name: "Pre-commissioning Readiness Review", progress: 0, budget: 0, assignee: "NOC PMO Auditor", level: 1, isMilestone: true, startDate: "2026-09-01", endDate: "2026-09-01", status: "not_started", phase: "Commissioning" },
  ],
  "AGOCO": [
    { id: "agoco-1", code: "1.0", name: "Pipeline Route Surveying & Geotechnical Analysis", progress: 95, budget: 300000, assignee: "Eng. Salem Al-Obeidi", level: 1, isMilestone: false, startDate: "2026-05-10", endDate: "2026-06-15", status: "in_progress", phase: "Engineering" },
    { id: "agoco-1-1", code: "1.1", name: "Differential GPS Survey Coordinates Mapping", progress: 100, budget: 180000, assignee: "Eng. Salem Al-Obeidi", level: 2, isMilestone: true, startDate: "2026-05-25", endDate: "2026-05-25", status: "completed", phase: "Engineering" },
    { id: "agoco-2", code: "2.0", name: "Trenching & Right-of-Way (ROW) Clearing", progress: 70, budget: 850000, assignee: "AGOCO Heavy Machinery", level: 1, isMilestone: false, startDate: "2026-06-16", endDate: "2026-07-20", status: "in_progress", phase: "Construction" },
    { id: "agoco-3", code: "3.0", name: "Pipeline Welding & Joint Coating", progress: 20, budget: 1200000, assignee: "Welding Certified Crew", level: 1, isMilestone: false, startDate: "2026-07-21", endDate: "2026-09-10", status: "not_started", phase: "Construction" },
    { id: "agoco-4", code: "4.0", name: "Sarir Field Water Injection System Upgrade", progress: 55, budget: 1500000, assignee: "Eng. Mustafa Al-Majri", level: 1, isMilestone: false, startDate: "2026-07-01", endDate: "2026-11-30", status: "in_progress", phase: "Construction" },
    { id: "agoco-4-1", code: "4.1", name: "Intake Pipeline Laying & Civil Foundations", progress: 75, budget: 900000, assignee: "Sarir Civil Team", level: 2, isMilestone: false, startDate: "2026-07-01", endDate: "2026-09-15", status: "in_progress", phase: "Construction" },
    { id: "agoco-4-2", code: "4.2", name: "Flow Control Valve Instrumentation Calibration", progress: 25, budget: 600000, assignee: "Eng. Mustafa Al-Majri", level: 2, isMilestone: false, startDate: "2026-09-16", endDate: "2026-11-30", status: "in_progress", phase: "Commissioning" },
  ],
  "ZALLAF": [
    { id: "zallaf-1", code: "1.0", name: "Erawin Field Substation Foundations", progress: 100, budget: 500000, assignee: "Eng. Muftah Al-Warfali", level: 1, isMilestone: false, startDate: "2026-04-01", endDate: "2026-05-15", status: "completed", phase: "Construction" },
    { id: "zallaf-2", code: "2.0", name: "Electrical Control Panel Installations", progress: 60, budget: 900000, assignee: "Substation Electricians", level: 1, isMilestone: false, startDate: "2026-05-16", endDate: "2026-07-30", status: "in_progress", phase: "Procurement" },
    { id: "zallaf-2-1", code: "2.1", name: "PLC Wiring & Telemetry Uplink Setup", progress: 45, budget: 400000, assignee: "Telemetry Techs", level: 2, isMilestone: false, startDate: "2026-06-01", endDate: "2026-07-15", status: "in_progress", phase: "Construction" },
    { id: "zallaf-3", code: "3.0", name: "Shaddad Field Early Production Facility (EPF)", progress: 95, budget: 4500000, assignee: "Eng. Reda Al-Ghariani", level: 1, isMilestone: false, startDate: "2026-03-01", endDate: "2026-08-01", status: "in_progress", phase: "Commissioning" },
    { id: "zallaf-3-1", code: "3.1", name: "Separator Vessel Hot Commissioning & Logs", progress: 100, budget: 3000000, assignee: "Eng. Reda Al-Ghariani", level: 2, isMilestone: false, startDate: "2026-03-01", endDate: "2026-07-01", status: "completed", phase: "Commissioning" },
    { id: "zallaf-3-2", code: "3.2", name: "Emergency Shut-down (ESD) Trip Loops Check", progress: 90, budget: 1500000, assignee: "EPF Safety Systems", level: 2, isMilestone: false, startDate: "2026-07-02", endDate: "2026-08-01", status: "in_progress", phase: "Commissioning" },
  ],
  "MELLITAH": [
    { id: "mell-1", code: "1.0", name: "Gas Plant Shutdown & Purging Operations", progress: 100, budget: 400000, assignee: "Eng. Ali Al-Zway", level: 1, isMilestone: false, startDate: "2026-05-01", endDate: "2026-05-20", status: "completed", phase: "Engineering" },
    { id: "mell-2", code: "2.0", name: "Turbine Overhaul & Mechanical Refurbishment", progress: 80, budget: 2500000, assignee: "OEM Turbine Engineers", level: 1, isMilestone: false, startDate: "2026-05-21", endDate: "2026-08-30", status: "in_progress", phase: "Construction" },
    { id: "mell-3", code: "3.0", name: "Instrumentation & Loop Calibrations", progress: 35, budget: 600000, assignee: "Mellitah Tech Team", level: 1, isMilestone: false, startDate: "2026-07-01", endDate: "2026-09-15", status: "in_progress", phase: "Commissioning" },
    { id: "mell-4", code: "4.0", name: "Bahr Essalam Gas Field Deck Refurbishment", progress: 30, budget: 1800000, assignee: "Eng. Younis Al-Fitouri", level: 1, isMilestone: false, startDate: "2026-06-10", endDate: "2026-11-10", status: "in_progress", phase: "Construction" },
    { id: "mell-4-1", code: "4.1", name: "Sub-sea Scaffolding System Certification", progress: 100, budget: 600000, assignee: "Platform Safety Officer", level: 2, isMilestone: true, startDate: "2026-06-10", endDate: "2026-06-30", status: "completed", phase: "Project Management" },
    { id: "mell-4-2", code: "4.2", name: "Deck C Structural Sandblasting & Anti-Corrosion Primer", progress: 15, budget: 1200000, assignee: "Eng. Younis Al-Fitouri", level: 2, isMilestone: false, startDate: "2026-07-01", endDate: "2026-11-10", status: "in_progress", phase: "Construction" },
  ]
};

export default function WBSStructuring({ claims, showToast, currentUser, activeRole, lang = "en" }: WBSStructuringProps) {
  const isRtl = lang === "ar";

  const getNodeNameTranslation = (name: string) => {
    if (!isRtl) return name;
    const mapping: Record<string, string> = {
      // WAHA
      "Wellhead Engineering & Design Review": "مراجعة وهندسة وتصميم رأس البئر",
      "P&ID Diagrams and Flow Sheets Sign-off": "اعتماد مخططات الأنابيب والأجهزة ورسومات التدفق",
      "Civil Foundation Work & Excavation": "الأعمال المدنية للمباني والحفر والأساسات",
      "Borehole Soil Mechanics & Concrete Pouring": "ميكانيكا تربة حفر الآبار وصب الخرسانة",
      "Reinforced Rebar Grid Installation": "تركيب شبكة حديد التسليح المقوى",
      "Mechanical Assembly & Valves Piping": "التجميع الميكانيكي وتمديد أنابيب الصمامات",
      "High-Pressure Valve Mounting": "تركيب صمامات الضغط العالي",
      "Flange Alignment & Gasket Seal Verification": "محاذاة الشفاه والتحقق من حشيات الإحكام",
      "Offshore Gas Lift Compression Skid Fabrication": "تصنيع وحدة كبس الغاز الرفع البحري",
      "Compressor Skid Mainframe & Turbine Procurement": "توريد التوربينات والإطار الرئيسي لوحدة المكبس",
      "Hydraulic Integration & NDT Testing": "التكامل الهيدروليكي والاختبارات غير التدميرية (NDT)",
      "Pre-commissioning Readiness Review": "مراجعة الجاهزية قبل التشغيل التجريبي",

      // AGOCO
      "Pipeline Route Surveying & Geotechnical Analysis": "مسح مسار خط الأنابيب والتحليل الجيوتقني",
      "Differential GPS Survey Coordinates Mapping": "رسم خرائط إحداثيات المسح باستخدام الـ GPS التفاضلي",
      "Trenching & Right-of-Way (ROW) Clearing": "حفر الخنادق وتطهير مسار حق المرور (ROW)",
      "Pipeline Welding & Joint Coating": "لحام خطوط الأنابيب وطلاء الوصلات",
      "Sarir Field Water Injection System Upgrade": "ترقية نظام حقن المياه في حقل السرير",
      "Intake Pipeline Laying & Civil Foundations": "مد خط أنابيب المأخذ والأساسات المدنية",
      "Flow Control Valve Instrumentation Calibration": "معايرة أجهزة صمامات التحكم في التدفق",

      // ZALLAF
      "Erawin Field Substation Foundations": "أساسات المحطة الفرعية لحقل إيروين",
      "Electrical Control Panel Installations": "تركيبات لوحات التحكم الكهربائية",
      "PLC Wiring & Telemetry Uplink Setup": "توصيل الـ PLC وإعداد اتصال القياس عن بعد",
      "Shaddad Field Early Production Facility (EPF)": "تسهيلات الإنتاج المبكر (EPF) لحقل شداد",
      "Separator Vessel Hot Commissioning & Logs": "التشغيل التجريبي الساخن وسجلات وعاء الفاصل",
      "Emergency Shut-down (ESD) Trip Loops Check": "فحص حلقات الإغلاق في حالات الطوارئ (ESD)",

      // MELLITAH
      "Gas Plant Shutdown & Purging Operations": "عمليات إيقاف وتطهير مصنع الغاز",
      "Turbine Overhaul & Mechanical Refurbishment": "العمرة الشاملة للتوربينات والتجديد الميكانيكي",
      "Instrumentation & Loop Calibrations": "معايرة الأجهزة وحلقات التحكم",
      "Bahr Essalam Gas Field Deck Refurbishment": "تجديد منصة حقل بحر السلام للغاز",
      "Sub-sea Scaffolding System Certification": "اعتماد نظام السقالات تحت سطح البحر",
      "Deck C Structural Sandblasting & Anti-Corrosion Primer": "التنظيف بالرمل الهيكلي للمنصة ج والطلاء المضاد للتآكل",

      // PMI Templates
      "Initiating Process Group - Project Charter & Alignment": "مجموعة عمليات البدء - ميثاق المشروع والمواءمة",
      "Planning Process Group - Detailed Engineering, Scope & Risk Analysis": "مجموعة عمليات التخطيط - الهندسة التفصيلية والنطاق وتحليل المخاطر",
      "Executing Process Group - Procurement, Fabrication & Field Construction": "مجموعة عمليات التنفيذ - المشتريات والتصنيع والإنشاءات الميدانية",
      "Monitoring & Controlling Process Group - Quality Audits & HSE Inspections": "مجموعة عمليات المراقبة والتحكم - تدقيق الجودة وفحص السلامة والبيئة",
      "Closing Process Group - As-Builts Handover & Final Balance Settlement": "مجموعة عمليات الإغلاق - تسليم المخططات المنفذة وتصفية الحسابات النهائية",
      "Milestone: Final Sovereign Asset Acceptance": "حدث هام: القبول النهائي للأصول السيادية"
    };
    return mapping[name] || name;
  };

  const getProjectTitleTranslation = (title: string) => {
    if (!isRtl) return title;
    const mapping: Record<string, string> = {
      "Wellhead Revamp": "تطوير وصيانة رؤوس الآبار",
      "Route Surveying & Piping": "مسح المسار وتمديد الأنابيب",
      "Erawin Field Substation": "المحطة الفرعية لحقل إيروين",
      "Gas Plant Overhaul": "العمرة الشاملة لمصنع الغاز"
    };
    return mapping[title] || title;
  };

  const getCompanyTranslation = (name: string) => {
    if (!isRtl) return name;
    const mapping: Record<string, string> = {
      "Waha Oil Company": "شركة الواحة للنفط",
      "AGOCO Libya": "شركة الخليج العربي للنفط (جوف)",
      "Zallaf Libya": "شركة زلاف ليبيا",
      "Mellitah Gas": "شركة مليتة للغاز"
    };
    return mapping[name] || name;
  };

  const getAssigneeTranslation = (name: string) => {
    if (!isRtl) return name;
    const mapping: Record<string, string> = {
      "Eng. Tarek El-Fassi": "المهندس طارق الفاسي",
      "Contractor Team A": "فريق المقاول (أ)",
      "Piping Specialists Ltd": "شركة اختصاصيي الأنابيب المحدودة",
      "Eng. Khaled Belhaj": "المهندس خالد بلحاج",
      "QA/QC Contractors": "مقاولو ضبط وتوكيد الجودة",
      "NOC PMO Auditor": "مدقق مكتب إدارة المشاريع بالمؤسسة",
      "Eng. Salem Al-Obeidi": "المهندس سالم العبيدي",
      "AGOCO Heavy Machinery": "الآليات الثقيلة لشركة الخليج",
      "Welding Certified Crew": "فريق اللحام المعتمد",
      "Eng. Mustafa Al-Majri": "المهندس مصطفى المجري",
      "Sarir Civil Team": "الفريق المدني بالسرير",
      "Eng. Muftah Al-Warfali": "المهندس مفتاح الورفلي",
      "Substation Electricians": "كهربائيو المحطة الفرعية",
      "Telemetry Techs": "فنيو القياس والتحكم عن بعد",
      "Eng. Reda Al-Ghariani": "المهندس رضا الغرياني",
      "EPF Safety Systems": "أنظمة السلامة لتسهيلات الإنتاج المبكر",
      "Eng. Ali Al-Zway": "المهندس علي الزوي",
      "OEM Turbine Engineers": "مهندسو الشركة المصنعة للتوربينات",
      "Mellitah Tech Team": "الفريق الفني لشركة مليتة",
      "Eng. Younis Al-Fitouri": "المهندس يونس الفيتوري",
      "Platform Safety Officer": "مسؤول السلامة على المنصة"
    };
    return mapping[name] || name;
  };

  const isSubsidiary = currentUser && currentUser.companyId !== "NOC_HQ";
  const defaultProjectId = isSubsidiary ? currentUser.companyId : "WAHA";

  // Check if current user is the NOC PM (role pmo_auditor)
  const isNocPm = activeRole === "pmo_auditor";
  const isSubsidiaryPm = activeRole === "subsidiary_pm";

  // Dynamic Projects List
  const [projectList, setProjectList] = useState<any[]>(() => {
    const saved = localStorage.getItem("noc_eppm_projects_list_pmi");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading projectList", e);
      }
    }
    return [
      { id: "WAHA", name: "Waha Oil Company", title: "Wellhead Revamp", status: "draft" },
      { id: "AGOCO", name: "AGOCO Libya", title: "Route Surveying & Piping", status: "draft" },
      { id: "ZALLAF", name: "Zallaf Libya", title: "Erawin Field Substation", status: "draft" },
      { id: "MELLITAH", name: "Mellitah Gas", title: "Gas Plant Overhaul", status: "approved" }
    ];
  });

  const handleProjectStatusChange = (projectId: string, newStatus: "draft" | "pending_approval" | "approved") => {
    setProjectList(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
  };

  // Sync projects list to localStorage
  useEffect(() => {
    localStorage.setItem("noc_eppm_projects_list_pmi", JSON.stringify(projectList));
  }, [projectList]);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    danger?: boolean;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  // Create Project Modal States
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [newProjCode, setNewProjCode] = useState("");
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjCompany, setNewProjCompany] = useState("");
  const [newProjCustomCompany, setNewProjCustomCompany] = useState("");
  const [newProjBudget, setNewProjBudget] = useState("5000000");
  const [newProjTemplate, setNewProjTemplate] = useState<"pmi" | "blank">("pmi");
  const [newProjStartDate, setNewProjStartDate] = useState("2026-07-10");
  const [newProjEndDate, setNewProjEndDate] = useState("2027-07-10");

  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return isSubsidiary ? currentUser.companyId : "WAHA";
  });

  const currentProject = projectList.find(p => p.id === selectedProjectId);
  // Default to draft if status is missing to support legacy local storage data
  const currentProjectStatus = currentProject?.status || "draft";

  const canEditWbs = isNocPm || (isSubsidiaryPm && currentProjectStatus === "draft");

  // Load WBS from localStorage with fallback to enriched presets
  const [wbsData, setWbsData] = useState<Record<string, WBSNode[]>>(() => {
    const saved = localStorage.getItem("noc_eppm_wbs_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading noc_eppm_wbs_data", e);
      }
    }
    return INITIAL_PROJECT_WBS;
  });

  // Sync back to localStorage
  useEffect(() => {
    localStorage.setItem("noc_eppm_wbs_data", JSON.stringify(wbsData));
  }, [wbsData]);

  // Synchronize active project when current user changes
  useEffect(() => {
    if (isSubsidiary) {
      setSelectedProjectId(currentUser.companyId);
    }
  }, [currentUser, isSubsidiary]);

  // Helper to add days
  const addDays = (dateStr: string, days: number) => {
    try {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + days);
      return d.toISOString().split("T")[0];
    } catch {
      return dateStr;
    }
  };

  const handleCreateProjectPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjCode.trim()) {
      showToast("Please enter a valid Project Code (e.g. HAROUGE-24-002).", "error");
      return;
    }
    if (!newProjTitle.trim()) {
      showToast("Please enter a Project Title.", "error");
      return;
    }
    
    const finalCompany = newProjCompany === "CUSTOM" ? newProjCustomCompany : newProjCompany;
    if (!finalCompany || !finalCompany.trim()) {
      showToast("Please select or enter the Operating Company.", "error");
      return;
    }

    const codeUpper = newProjCode.trim().toUpperCase();
    if (projectList.some(p => p.id === codeUpper)) {
      showToast(`Project Code ${codeUpper} already exists. Please use a unique code.`, "error");
      return;
    }

    const budgetVal = parseFloat(newProjBudget) || 5000000;
    
    // Create Project Item
    const newProjectItem = {
      id: codeUpper,
      name: finalCompany.trim(),
      title: newProjTitle.trim()
    };

    // Initialize WBS nodes
    let initialNodes: WBSNode[] = [];
    if (newProjTemplate === "pmi") {
      initialNodes = [
        {
          id: `${codeUpper}-init`,
          code: "1.0",
          name: "Initiating Process Group - Project Charter & Alignment",
          progress: 0,
          budget: Math.round(budgetVal * 0.05),
          assignee: "NOC Joint Venture Management",
          level: 1,
          isMilestone: false,
          startDate: newProjStartDate,
          endDate: addDays(newProjStartDate, 30),
          status: "not_started",
          phase: "Project Management"
        },
        {
          id: `${codeUpper}-plan`,
          code: "2.0",
          name: "Planning Process Group - Detailed Engineering, Scope & Risk Analysis",
          progress: 0,
          budget: Math.round(budgetVal * 0.10),
          assignee: "EPC Planning Engineers",
          level: 1,
          isMilestone: false,
          startDate: addDays(newProjStartDate, 31),
          endDate: addDays(newProjStartDate, 90),
          status: "not_started",
          phase: "Engineering"
        },
        {
          id: `${codeUpper}-exec`,
          code: "3.0",
          name: "Executing Process Group - Procurement, Fabrication & Field Construction",
          progress: 0,
          budget: Math.round(budgetVal * 0.70),
          assignee: "Main Mechanical & Civil Contractors",
          level: 1,
          isMilestone: false,
          startDate: addDays(newProjStartDate, 91),
          endDate: addDays(newProjEndDate, -60),
          status: "not_started",
          phase: "Construction"
        },
        {
          id: `${codeUpper}-mon`,
          code: "4.0",
          name: "Monitoring & Controlling Process Group - Quality Audits & HSE Inspections",
          progress: 0,
          budget: Math.round(budgetVal * 0.10),
          assignee: "NOC Third-Party Inspectors",
          level: 1,
          isMilestone: false,
          startDate: newProjStartDate,
          endDate: newProjEndDate,
          status: "not_started",
          phase: "Commissioning"
        },
        {
          id: `${codeUpper}-close`,
          code: "5.0",
          name: "Closing Process Group - As-Builts Handover & Final Balance Settlement",
          progress: 0,
          budget: Math.round(budgetVal * 0.05),
          assignee: "NOC Commissioning Committee",
          level: 1,
          isMilestone: false,
          startDate: addDays(newProjEndDate, -59),
          endDate: newProjEndDate,
          status: "not_started",
          phase: "Project Management"
        },
        {
          id: `${codeUpper}-ms-gate`,
          code: "6.0",
          name: "Milestone: Final Sovereign Asset Acceptance",
          progress: 0,
          budget: 0,
          assignee: "NOC PMO Auditor",
          level: 1,
          isMilestone: true,
          startDate: newProjEndDate,
          endDate: newProjEndDate,
          status: "not_started",
          phase: "Project Management"
        }
      ];
    } else {
      initialNodes = [
        {
          id: `${codeUpper}-g1`,
          code: "1.0",
          name: "General Mobilization & Initial Engineering Studies",
          progress: 0,
          budget: budgetVal,
          assignee: "Assigned Project Manager",
          level: 1,
          isMilestone: false,
          startDate: newProjStartDate,
          endDate: newProjEndDate,
          status: "not_started",
          phase: "Engineering"
        }
      ];
    }

    // Save
    setProjectList(prev => [...prev, newProjectItem]);
    setWbsData(prev => ({
      ...prev,
      [codeUpper]: initialNodes
    }));
    
    // Select the newly created project immediately
    setSelectedProjectId(codeUpper);
    setIsCreateProjectOpen(false);

    showToast(`Project plan ${codeUpper} successfully entered and initiated with PMI-standard baseline metrics.`, "success");
  };

  // Sub-tabs: "hierarchy" | "plan"
  const [activeSubTab, setActiveSubTab] = useState<"hierarchy" | "plan">("hierarchy");

  // Add Modal state
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [nodeCode, setNodeCode] = useState("");
  const [nodeName, setNodeName] = useState("");
  const [nodeBudget, setNodeBudget] = useState("");
  const [nodeProgress, setNodeProgress] = useState("0");
  const [nodeAssignee, setNodeAssignee] = useState("");
  const [nodeLevel, setNodeLevel] = useState<"1" | "2" | "3">("1");
  const [nodeIsMilestone, setNodeIsMilestone] = useState(false);
  const [nodeStartDate, setNodeStartDate] = useState("2026-07-10");
  const [nodeEndDate, setNodeEndDate] = useState("2026-08-10");
  const [nodeStatus, setNodeStatus] = useState<"not_started" | "in_progress" | "completed">("not_started");
  const [nodePhase, setNodePhase] = useState<"Engineering" | "Procurement" | "Construction" | "Commissioning" | "Project Management">("Engineering");

  // Edit Modal state
  const [editingNode, setEditingNode] = useState<WBSNode | null>(null);

  const activeNodes = wbsData[selectedProjectId] || getDefaultWBS(selectedProjectId);

  // Calculate project aggregate metrics
  const totalBudget = activeNodes
    .filter((n) => n.level === 1)
    .reduce((sum, item) => sum + item.budget, 0);

  const weightedProgress = totalBudget > 0
    ? activeNodes
        .filter((n) => n.level === 1)
        .reduce((sum, item) => sum + (item.progress * item.budget), 0) / totalBudget
    : 0;

  // Add WBS Node
  const handleAddWBSNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeCode || !nodeName) {
      showToast("Please fill in WBS Code and Description Name.", "error");
      return;
    }

    if (!canEditWbs) {
      showToast("Unauthorized: Only NOC PMO Technical Auditors and Subsidiary PMs can create WBS elements.", "error");
      return;
    }

    const numericBudget = nodeIsMilestone ? 0 : (parseFloat(nodeBudget) || 0);
    const numericProgress = parseFloat(nodeProgress) || 0;

    const newNode: WBSNode = {
      id: `node-${Date.now()}`,
      code: nodeCode,
      name: nodeName,
      progress: Math.min(100, Math.max(0, numericProgress)),
      budget: numericBudget,
      assignee: nodeAssignee || "Unassigned",
      level: parseInt(nodeLevel as string) as 1 | 2 | 3,
      isMilestone: nodeIsMilestone,
      startDate: nodeStartDate || undefined,
      endDate: nodeIsMilestone ? nodeStartDate : (nodeEndDate || undefined),
      status: nodeStatus,
      phase: nodePhase
    };

    const updatedList = [...activeNodes, newNode].sort((a, b) => a.code.localeCompare(b.code));

    setWbsData({
      ...wbsData,
      [selectedProjectId]: updatedList
    });

    setIsAddingNode(false);
    // Reset Form Fields
    setNodeCode("");
    setNodeName("");
    setNodeBudget("");
    setNodeProgress("0");
    setNodeAssignee("");
    setNodeIsMilestone(false);
    setNodeStatus("not_started");
    setNodePhase("Engineering");
    showToast(`Successfully created ${newNode.isMilestone ? "Milestone" : "WBS Node"} ${nodeCode}.`, "success");
  };

  // Edit WBS Node
  const handleEditWBSNodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode) return;

    if (!canEditWbs) {
      showToast("Unauthorized: WBS structure is managed only by authorized PMs.", "error");
      return;
    }

    const updatedList = activeNodes.map((node) => {
      if (node.id === editingNode.id) {
        return {
          ...editingNode,
          endDate: editingNode.isMilestone ? editingNode.startDate : editingNode.endDate
        };
      }
      return node;
    }).sort((a, b) => a.code.localeCompare(b.code));

    setWbsData({
      ...wbsData,
      [selectedProjectId]: updatedList
    });

    setEditingNode(null);
    showToast(`WBS Node ${editingNode.code} details successfully updated.`, "success");
  };

  // Delete WBS Node
  const handleDeleteNode = (nodeId: string, code: string) => {
    if (!canEditWbs) {
      showToast("Unauthorized: WBS editing is locked.", "error");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: isRtl ? "حذف عنصر الهيكل" : "Delete WBS Node",
      message: isRtl 
        ? `هل أنت متأكد من رغبتك في حذف المعلم / العنصر "${code}" بشكل نهائي؟ سينعكس هذا الإجراء على النظام بأكمله.`
        : `Are you sure you want to permanently delete WBS Node / Milestone "${code}"? This will be reflected system-wide.`,
      danger: true,
      onConfirm: () => {
        const updatedList = activeNodes.filter((node) => node.id !== nodeId);
        setWbsData(prev => ({
          ...prev,
          [selectedProjectId]: updatedList
        }));
        showToast(`Deleted WBS element ${code}.`, "info");
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const getCompanyColor = (id: string) => {
    switch (id) {
      case "WAHA": return "text-blue-600 bg-blue-50 border-blue-200";
      case "AGOCO": return "text-teal-600 bg-teal-50 border-teal-200";
      case "ZALLAF": return "text-orange-600 bg-orange-50 border-orange-200";
      case "MELLITAH": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getPhaseBadgeColor = (phase?: string) => {
    switch (phase) {
      case "Engineering": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Procurement": return "bg-sky-100 text-sky-800 border-sky-200";
      case "Construction": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Commissioning": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Project Management": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className={`flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-[#040f24] ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Tab Title Banner */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
          <div>
            <span className="bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60 uppercase tracking-wider font-mono">
              {isRtl ? "هيكل تقسيم العمل وإدارة خطة المشروع (WBS)" : "Work Breakdown Structure & Planning"}
            </span>
            <h1 className={`text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
              <GitFork className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              {isRtl ? "هيكل تقسيم العمل والخطط الشاملة السيادية" : "Sovereign WBS & Project Master Plan"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isRtl 
                ? "تنظيم وتقدير التكلفة وجدولة فترات العقود النفطية في حزم عمل معتمدة وتحديد المعالم الرئيسية للمشاريع."
                : "Organize, cost, and schedule oil contract phases into authorized work packages and milestones."}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {canEditWbs ? (
              <div className={`flex gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                <button
                  onClick={() => {
                    setNewProjCode("");
                    setNewProjTitle("");
                    setNewProjCompany("Waha Oil Company");
                    setNewProjCustomCompany("");
                    setNewProjBudget("5000000");
                    setNewProjTemplate("pmi");
                    setNewProjStartDate("2026-07-10");
                    setNewProjEndDate("2027-07-10");
                    setIsCreateProjectOpen(true);
                  }}
                  className={`bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/10 cursor-pointer ${isRtl ? "font-sans flex-row-reverse" : ""}`}
                >
                  <Briefcase className="w-4 h-4" />
                  {isRtl ? "خطة مشروع جديدة (PMI)" : "New Project Plan (PMI)"}
                </button>
                <button
                  onClick={() => setIsAddingNode(true)}
                  className={`bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-slate-900/10 cursor-pointer ${isRtl ? "font-sans flex-row-reverse" : ""}`}
                >
                  <Plus className="w-4 h-4" />
                  {isRtl ? "إضافة عنصر / معلم" : "Add Node / Milestone"}
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-[11px] bg-amber-50 text-amber-800 font-semibold px-3 py-2 rounded-xl border border-amber-200/60 shadow-sm">
                <Lock className="w-3.5 h-3.5" />
                <span>{isRtl ? "مغلق ومحمي (للقراءة فقط)" : "Locked (Read-Only)"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Simulation Role Notice Banner */}
        <div className={`bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl ${isRtl ? "md:flex-row-reverse text-right" : "text-left"}`}>
          <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}>
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 shrink-0">
              {canEditWbs ? (
                <Unlock className="w-5 h-5 text-amber-400" />
              ) : (
                <Lock className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase font-black text-amber-400 tracking-wider">
                {isRtl 
                  ? (currentProjectStatus === "draft" ? (canEditWbs ? "مساحة عمل إدارة المشاريع (نشط)" : "وضع المسودة") 
                     : currentProjectStatus === "pending_approval" ? "في انتظار الاعتماد" : "المنظور المرئي التابع (متزامن)")
                  : (currentProjectStatus === "draft" ? (canEditWbs ? "Active PM Workspace" : "Draft Mode")
                     : currentProjectStatus === "pending_approval" ? "Pending Approval" : "Subsidiary Reflected View (Synced)")}
              </p>
              <h4 className="text-xs font-bold mt-0.5">
                {isRtl ? (
                  currentProjectStatus === "draft"
                    ? canEditWbs ? "تمتلك صلاحية الإشراف والتعديل الإداري الكامل. يمكنك تهيئة خطط جديدة وتحديد فروع هيكل العمل وإضافة المعالم والتواريخ لإرسالها للاعتماد." : "هذه الخطة قيد الإعداد."
                    : currentProjectStatus === "pending_approval"
                      ? isNocPm ? "هذه الخطة في انتظار اعتمادك." : "هذه الخطة في انتظار الاعتماد من قبل المقر الرئيسي."
                      : "المخطط الأساسي معتمد من قبل المقر الرئيسي."
                ) : (
                  currentProjectStatus === "draft"
                    ? canEditWbs ? "You have administrative authorization. You can add new project plans, WBS nodes, milestones, and dates to submit for approval." : "This plan is currently in draft mode."
                    : currentProjectStatus === "pending_approval"
                      ? isNocPm ? "This master plan is pending your approval." : "This master plan is pending approval from NOC Headquarters."
                      : "Locked Mode: Showing authoritative master plan configured by NOC Headquarters. Customizations are blocked."
                )}
              </h4>
              {isSubsidiaryPm && currentProjectStatus === "draft" && (
                <button
                  onClick={() => handleProjectStatusChange(selectedProjectId, "pending_approval")}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors mt-2"
                >
                  {isRtl ? "إرسال للاعتماد" : "Submit for NOC Approval"}
                </button>
              )}
              {isNocPm && currentProjectStatus === "pending_approval" && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleProjectStatusChange(selectedProjectId, "approved")}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {isRtl ? "اعتماد" : "Approve Plan"}
                  </button>
                  <button
                    onClick={() => handleProjectStatusChange(selectedProjectId, "draft")}
                    className="bg-rose-500 hover:bg-rose-600 text-slate-950 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {isRtl ? "رفض وإعادة" : "Reject to Draft"}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 font-extrabold px-3 py-1.5 rounded-xl border border-slate-700">
              {isRtl ? "الدور الحسابي:" : "Role:"} {currentUser?.roleLabel || "Observer"}
            </span>
          </div>
        </div>

        {/* Project Selection Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {projectList.filter(p => !isSubsidiary || p.id === currentUser.companyId).map((proj) => {
            const isActive = selectedProjectId === proj.id;
            const projectNodes = wbsData[proj.id] || [];
            const pBudget = projectNodes.filter(n => n.level === 1).reduce((s, x) => s + x.budget, 0);
            
            // Weighted average progress of level 1 nodes
            const level1Nodes = projectNodes.filter(n => n.level === 1);
            const pWeightedProgress = pBudget > 0
              ? level1Nodes.reduce((sum, n) => sum + (n.progress * n.budget), 0) / pBudget
              : 0;

            return (
              <button
                key={proj.id}
                onClick={() => {
                  setSelectedProjectId(proj.id);
                  setEditingNode(null);
                }}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${isRtl ? "text-right" : "text-left"} ${
                  isActive
                    ? "bg-slate-900 dark:bg-slate-950 border-slate-900 dark:border-amber-500/50 text-white shadow-md shadow-slate-950/15"
                    : "bg-white dark:bg-[#0a1930] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`text-[10px] font-mono font-bold uppercase ${isActive ? "text-amber-400" : "text-slate-400"}`}>
                      {proj.id}
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      proj.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      proj.status === 'pending_approval' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {isRtl 
                        ? (proj.status === 'approved' ? 'معتمد' : proj.status === 'pending_approval' ? 'قيد المراجعة' : 'مسودة') 
                        : (proj.status === 'approved' ? 'Approved' : proj.status === 'pending_approval' ? 'Pending' : 'Draft')}
                    </span>
                  </div>
                  <h3 className="text-xs font-black mt-1 line-clamp-1">{getCompanyTranslation(proj.name)}</h3>
                  <p className={`text-[11px] mt-0.5 line-clamp-1 ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                    {getProjectTitleTranslation(proj.title)}
                  </p>
                </div>

                <div className={`border-t border-slate-200/20 pt-2.5 mt-3 flex items-center justify-between w-full ${isRtl ? "flex-row-reverse" : ""}`}>
                  <span className="text-[10px] font-bold font-sans">
                    {isRtl ? "قيمة الميزانية:" : "PV:"} €{pBudget.toLocaleString()}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${isActive ? "bg-amber-400/20 text-amber-300" : "bg-slate-100 text-slate-700"}`}>
                    {pWeightedProgress.toFixed(0)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className={`bg-white dark:bg-[#0a1930] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{isRtl ? "حزم عمل هيكل العمل WBS المستوى الأول" : "WBS Level-1 Work Packages"}</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {isRtl 
                  ? `${activeNodes.filter((n) => n.level === 1 && !n.isMilestone).length} حزمة عمل نشطة`
                  : `${activeNodes.filter((n) => n.level === 1 && !n.isMilestone).length} Active Nodes`}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{isRtl ? "أعلى مستوى لتصنيفات مخرجات ومراحل هذا العقد." : "Highest level deliverable groupings of this contract phase."}</p>
            </div>
          </div>

          <div className={`bg-white dark:bg-[#0a1930] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Milestone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{isRtl ? "المعالم الرئيسية الحاسمة" : "Total Critical Milestones"}</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {isRtl
                  ? `${activeNodes.filter((n) => n.isMilestone).length} معلماً مسجلاً`
                  : `${activeNodes.filter((n) => n.isMilestone).length} Registered`}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{isRtl ? "المعالم التعاقدية والفنية الإلزامية المسجلة للمتابعة الميدانية." : "Mandatory physical and contractual project milestones."}</p>
            </div>
          </div>

          <div className={`bg-white dark:bg-[#0a1930] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{isRtl ? "التكلفة التراكمية الإجمالية للمشروع" : "Cumulative Budget PV"}</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                €{totalBudget.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{isRtl ? "إجمالي الاعتمادات المالية الأساسية المخصصة لعناصر هيكل العمل." : "Total baselined monetary allocation for WBS elements."}</p>
            </div>
          </div>
        </div>

        {/* View Selection (Sub-Tabs) */}
        <div className={`flex border-b border-slate-200 gap-1 mt-4 ${isRtl ? "flex-row-reverse" : ""}`}>
          <button
            onClick={() => setActiveSubTab("hierarchy")}
            className={`px-4 py-2.5 text-xs font-black border-b-2 flex items-center gap-1.5 transition-all ${
              activeSubTab === "hierarchy"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            } ${isRtl ? "font-sans flex-row-reverse" : ""}`}
          >
            <Layers className="w-4 h-4" />
            {isRtl ? "شجرة تسلسل هيكل العمل والمحرر" : "WBS Node Tree Hierarchy & Editor"}
          </button>
          <button
            onClick={() => setActiveSubTab("plan")}
            className={`px-4 py-2.5 text-xs font-black border-b-2 flex items-center gap-1.5 transition-all ${
              activeSubTab === "plan"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            } ${isRtl ? "font-sans flex-row-reverse" : ""}`}
          >
            <Calendar className="w-4 h-4" />
            {isRtl ? "المخطط الرئيسي العام والجدول الزمني غانت" : "Sovereign Master Project Plan & Gantt Timeline"}
          </button>
        </div>

        {activeSubTab === "hierarchy" ? (
          /* WBS Table Hierarchy View */
          <div className={`bg-white dark:bg-[#0a1930] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${isRtl ? "text-right" : "text-left"}`}>
            <div className={`p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-wrap gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {isRtl ? "الهياكل الهرمية المنظمة لعناصر العمل (WBS)" : "Structured Node Hierarchies"}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isRtl 
                    ? (canEditWbs 
                        ? "إضافة أو تعديل أو حذف عناصر هيكل العمل. يتم تعميم التعديلات فورياً."
                        : "القائمة المعتمدة والسيادية المجمعة من قبل إدارة مشاريع المقر الرئيسي للمؤسسة.")
                    : (canEditWbs 
                        ? "Add, modify, or delete WBS elements. Changes are instantly published." 
                        : "Authoritative list compiled by NOC HQ Project Management.")
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-200 dark:bg-slate-850 text-slate-700 dark:text-slate-300 px-2 py-1 rounded font-mono font-bold border border-slate-300/40 dark:border-slate-700/60">
                  {isRtl ? "مُعرف العقد:" : "Contract ID:"} {selectedProjectId}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className={`w-full border-collapse ${isRtl ? "text-right" : "text-left"}`}>
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-sans text-slate-400 dark:text-slate-500">
                    <th className={`p-3 text-[10px] font-black w-28 ${isRtl ? "text-right" : "text-left"}`}>
                      {isRtl ? "رمز الهيكل WBS" : "WBS Code"}
                    </th>
                    <th className={`p-3 text-[10px] font-black ${isRtl ? "text-right" : "text-left"}`}>
                      {isRtl ? "وصف عنصر العمل / مخرج التسليم" : "Node Description / Deliverable Name"}
                    </th>
                    <th className="p-3 text-[10px] font-black w-24 text-center">
                      {isRtl ? "التصنيف" : "Type"}
                    </th>
                    <th className={`p-3 text-[10px] font-black w-32 ${isRtl ? "text-left" : "text-right"}`}>
                      {isRtl ? "الميزانية المعتمدة (PV)" : "Baselined (PV)"}
                    </th>
                    <th className={`p-3 text-[10px] font-black w-36 ${isRtl ? "text-right" : "text-left"}`}>
                      {isRtl ? "المرحلة فنية" : "Phase"}
                    </th>
                    <th className="p-3 text-[10px] font-black w-44 text-center">
                      {isRtl ? "فترة التخطيط (البداية - النهاية)" : "Dates (Start - End)"}
                    </th>
                    <th className="p-3 text-[10px] font-black w-28 text-center">
                      {isRtl ? "الحالة" : "Status"}
                    </th>
                    <th className="p-3 text-[10px] font-black w-32 text-center">
                      {isRtl ? "الإنجاز الفعلي" : "Progress"}
                    </th>
                    <th className="p-3 text-[10px] font-black w-24 text-center">
                      {isRtl ? "خيارات" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeNodes.length > 0 ? (
                    activeNodes.map((node) => {
                      return (
                        <tr
                          key={node.id}
                          className={`border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors ${
                            node.level === 2 ? "bg-slate-50/10 dark:bg-slate-900/40" : node.level === 3 ? "bg-slate-50/30 dark:bg-slate-900/20" : "font-semibold bg-white dark:bg-[#0a1930]"
                          }`}
                        >
                          {/* Code */}
                          <td className="p-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              {node.level === 2 && <span className="text-slate-300 dark:text-slate-600 ml-1">└──</span>}
                              {node.level === 3 && <span className="text-slate-300 dark:text-slate-600 ml-4">└───</span>}
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black ${node.level === 1 ? "bg-slate-900 dark:bg-slate-800 text-white" : "bg-slate-200 dark:bg-slate-850 text-slate-700 dark:text-slate-300"}`}>
                                {node.code}
                              </span>
                            </div>
                          </td>

                          {/* Name / Description */}
                          <td className="p-3 text-xs text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5">
                              {node.isMilestone && <Milestone className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                              <span className={node.level === 1 ? "font-black text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400 font-medium"}>
                                {getNodeNameTranslation(node.name)}
                              </span>
                            </div>
                          </td>

                          {/* Type Badge */}
                          <td className="p-3 text-center">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${node.isMilestone ? "bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                              {node.isMilestone ? (isRtl ? "معلم رئيسي" : "Milestone") : (isRtl ? "حزمة عمل" : "Work Node")}
                            </span>
                          </td>

                          {/* Budget */}
                          <td className={`p-3 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 ${isRtl ? "text-left" : "text-right"}`}>
                            {node.isMilestone ? "—" : `€${node.budget.toLocaleString()}`}
                          </td>

                          {/* Phase */}
                          <td className="p-3">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getPhaseBadgeColor(node.phase)}`}>
                              {isRtl ? (
                                node.phase === "Engineering" ? "الهندسة" :
                                node.phase === "Procurement" ? "التوريد" :
                                node.phase === "Construction" ? "الإنشاءات" :
                                node.phase === "Commissioning" ? "التشغيل" :
                                "إدارة المشاريع"
                              ) : (node.phase || "Construction")}
                            </span>
                          </td>

                          {/* Dates */}
                          <td className="p-3 text-center text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {node.startDate ? (
                              node.isMilestone ? (
                                <span className="font-bold text-amber-600">{node.startDate}</span>
                              ) : (
                                <span>{node.startDate} {isRtl ? "إلى" : "to"} {node.endDate}</span>
                              )
                            ) : "—"}
                          </td>

                          {/* Status */}
                          <td className="p-3 text-center">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                              node.status === "completed" || node.progress === 100
                                ? "bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                                : node.status === "in_progress"
                                ? "bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                            }`}>
                              {node.progress === 100 ? (isRtl ? "مكتمل" : "Completed") : node.status === "in_progress" ? (isRtl ? "قيد التنفيذ" : "In Progress") : (isRtl ? "لم يبدأ" : "Not Started")}
                            </span>
                          </td>

                          {/* Progress */}
                          <td className="p-3 text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-12 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden inline-block border border-slate-200 dark:border-slate-700">
                                <div
                                  className={`h-full ${node.progress === 100 ? "bg-emerald-500" : "bg-amber-500"}`}
                                  style={{ width: `${node.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                                {node.progress}%
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-center">
                            <div className="flex items-center gap-1.5 justify-center">
                              {canEditWbs ? (
                                <>
                                  <button
                                    onClick={() => setEditingNode(node)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                    title={isRtl ? "تعديل تفاصيل عنصر الهيكل" : "Edit entire WBS Node configuration"}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteNode(node.id, node.code)}
                                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded text-rose-400 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/40"
                                    title={isRtl ? "حذف العنصر" : "Delete Node"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 justify-center">
                                  <Lock className="w-3 h-3 text-slate-300 dark:text-slate-700" /> {isRtl ? "مغلق" : "Locked"}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-12 bg-slate-50/50 dark:bg-slate-900/40">
                        <AlertCircle className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {isRtl ? "لا توجد عناصر هيكل عمل مسجلة لهذا المشروع." : "No WBS nodes registered for this project."}
                        </h4>
                        {canEditWbs && (
                          <button
                            onClick={() => setIsAddingNode(true)}
                            className="mt-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg border border-transparent dark:border-slate-700"
                          >
                            {isRtl ? "أنشئ العنصر الأول الأساسي" : "Create First Node"}
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Sovereign Master Project Plan Timeline View */
          <div className={`bg-white dark:bg-[#0a1930] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6 ${isRtl ? "text-right" : "text-left"}`}>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {isRtl ? "الجدول الزمني العام للمشروع وتتبع مخطط غانت للمعالم" : "Project Plan Timeline & Milestone Gantt Tracker"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isRtl 
                  ? "تمثيل مرئي لمراحل العمل الرئيسية، والجدولة الزمنية، والمعالم الفيزيائية التعاقدية لبنية حقول النفط التحتية."
                  : "Visualizing master phase sequence, work schedules, and physical milestones of this oil field infrastructure contract."}
              </p>
            </div>

            {/* Custom Horizontal Gantt-like Visualization */}
            <div className="space-y-4">
              {/* Timeline Header Row */}
              <div className={`grid grid-cols-12 gap-2 text-[9px] font-mono text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                <div className="col-span-4 font-black">{isRtl ? "عنصر الهيكل WBS / المرحلة" : "WBS NODE / PHASE"}</div>
                <div className="col-span-1 text-center">{isRtl ? "الميزانية المخصصة" : "PV BUDGET"}</div>
                <div className="col-span-2 text-center font-bold">{isRtl ? "النطاق الزمني" : "TIMEFRAME"}</div>
                <div className={`col-span-5 relative font-black tracking-wider pl-3 ${isRtl ? "text-right pr-3" : "text-left"}`}>
                  <div className={`absolute ${isRtl ? "right-0" : "left-0"}`}>{isRtl ? "يونيو" : "JUN"}</div>
                  <div className={`absolute ${isRtl ? "right-1/4" : "left-1/4"}`}>{isRtl ? "يوليو" : "JUL"}</div>
                  <div className={`absolute ${isRtl ? "right-2/4" : "left-2/4"}`}>{isRtl ? "أغسطس" : "AUG"}</div>
                  <div className={`absolute ${isRtl ? "right-3/4" : "left-3/4"}`}>{isRtl ? "سبتمبر" : "SEP"}</div>
                </div>
              </div>

              {/* Sorted project nodes based on dates */}
              {activeNodes.length > 0 ? (
                activeNodes
                  .filter((node) => node.startDate)
                  .sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""))
                  .map((node) => {
                    const isCompleted = node.progress === 100 || node.status === "completed";
                    
                    // Simple simulated bar positioning based on month
                    let barLeft = "left-0";
                    let barRight = "right-0";
                    let barWidth = "w-1/2";
                    
                    if (node.startDate) {
                      if (node.startDate.includes("-06-")) {
                        barLeft = "left-2";
                        barRight = "right-2";
                        barWidth = node.endDate?.includes("-06-") ? "w-1/4" : "w-1/2";
                      } else if (node.startDate.includes("-07-")) {
                        barLeft = "left-1/4";
                        barRight = "right-1/4";
                        barWidth = node.endDate?.includes("-08-") ? "w-1/3" : "w-1/5";
                      } else if (node.startDate.includes("-08-")) {
                        barLeft = "left-2/4";
                        barRight = "right-2/4";
                        barWidth = "w-1/4";
                      } else if (node.startDate.includes("-09-")) {
                        barLeft = "left-3/4";
                        barRight = "right-3/4";
                        barWidth = "w-1/6";
                      } else {
                        barLeft = "left-5";
                        barRight = "right-5";
                        barWidth = "w-1/3";
                      }
                    }

                    const positionClass = isRtl ? barRight : barLeft;

                    return (
                      <div key={node.id} className={`grid grid-cols-12 gap-2 py-2 items-center hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded transition-colors ${isRtl ? "flex-row-reverse" : ""}`}>
                        {/* Title & Phase */}
                        <div className="col-span-4 flex items-center gap-2">
                          <div className="shrink-0">
                            {node.isMilestone ? (
                              <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-center">
                                <Milestone className="w-3.5 h-3.5 text-amber-500" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center">
                                <CheckSquare className="w-3 h-3 text-indigo-500" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className={`flex items-center gap-1 ${isRtl ? "flex-row-reverse" : ""}`}>
                              <span className="font-mono text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1 rounded">
                                {node.code}
                              </span>
                              <span className={`text-[8px] font-bold px-1 rounded uppercase ${getPhaseBadgeColor(node.phase)}`}>
                                {isRtl ? (
                                  node.phase === "Engineering" ? "الهندسة" :
                                  node.phase === "Procurement" ? "التوريد" :
                                  node.phase === "Construction" ? "الإنشاءات" :
                                  node.phase === "Commissioning" ? "التشغيل" :
                                  "الإدارة"
                                ) : node.phase}
                              </span>
                            </div>
                            <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate leading-tight mt-0.5">{getNodeNameTranslation(node.name)}</h4>
                          </div>
                        </div>

                        {/* Budget */}
                        <div className={`col-span-1 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 ${isRtl ? "text-left pl-1" : "text-right pr-1"}`}>
                          {node.isMilestone ? "—" : `€${(node.budget / 1000).toFixed(0)}k`}
                        </div>

                        {/* Dates */}
                        <div className="col-span-2 text-center text-[9px] font-mono font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                          {node.startDate}
                        </div>

                        {/* Progress Gantt Visual Bar */}
                        <div className="col-span-5 relative h-7 bg-slate-100/50 dark:bg-slate-900/30 rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden flex items-center">
                          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 bg-grid-pattern opacity-30"></div>
                          
                          {node.isMilestone ? (
                            /* Milestone diamond marker on the start date */
                            <div className={`absolute ${positionClass} ${isRtl ? "mr-8" : "ml-8"} flex items-center gap-1.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                              <div className={`w-3.5 h-3.5 rotate-45 border shadow-sm shrink-0 transition-all ${
                                isCompleted ? "bg-emerald-500 border-emerald-600" : "bg-amber-400 border-amber-500 animate-pulse"
                              }`} title="Milestone Target"></div>
                              <span className="text-[8px] font-mono font-black text-slate-700 dark:text-slate-300 bg-white/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 rounded-full shadow-sm leading-none shrink-0 uppercase">
                                {isRtl 
                                  ? (node.progress === 100 ? "معلم مكتمل ✓" : "معلم رئيسي مستمر")
                                  : `MILESTONE ${node.progress === 100 ? "✓" : "PENDING"}`}
                              </span>
                            </div>
                          ) : (
                            /* Work Package duration bar with filled progress */
                            <div className={`absolute ${positionClass} ${barWidth} h-3.5 rounded-full border shadow-sm overflow-hidden bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700`}>
                              <div 
                                className={`h-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-amber-500"}`}
                                style={{ width: `${node.progress}%` }}
                              ></div>
                              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-black text-slate-900 dark:text-slate-100 leading-none">
                                {node.progress}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {isRtl ? "لا توجد خطة زمنية نشطة مهيأة حالياً." : "No active timeline plan built yet."}
                </div>
              )}
            </div>

            {/* Master Phases Legend Box */}
            <div className={`grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border text-xs ${isRtl ? "text-right" : "text-left"}`}>
              <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 border border-indigo-600"></span>
                <div>
                  <h4 className="font-bold text-slate-800">{isRtl ? "١. مرحلة الهندسة" : "1. Engineering Phase"}</h4>
                  <p className="text-[10px] text-slate-400">{isRtl ? "مخططات P&ID والرسومات الهندسية المعتمدة." : "P&IDs, detailed designs & reviews."}</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-sky-500"></span>
                <div>
                  <h4 className="font-bold text-slate-800">{isRtl ? "٢. مرحلة التوريد" : "2. Procurement Phase"}</h4>
                  <p className="text-[10px] text-slate-400">{isRtl ? "أوامر الشراء للمعدات واللوجستيات والمواد." : "Equipment order and material delivery."}</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-600"></span>
                <div>
                  <h4 className="font-bold text-slate-800">{isRtl ? "٣. مرحلة الإنشاءات" : "3. Construction Phase"}</h4>
                  <p className="text-[10px] text-slate-400">{isRtl ? "الأعمال المدنية، الأنابيب، والتركيب الميداني." : "Onsite civils, piping, and structures."}</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-600"></span>
                <div>
                  <h4 className="font-bold text-slate-800">{isRtl ? "٤. مرحلة التشغيل" : "4. Commissioning Phase"}</h4>
                  <p className="text-[10px] text-slate-400">{isRtl ? "فحوصات السلامة، واختبار الصمامات، وضخ النفط." : "Purging, loop tests, and oil hand-over."}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Add Node Dialog Box overlay if open */}
        {isAddingNode && (
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left overflow-y-auto">
            <div className={`bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border my-8 ${isRtl ? "text-right" : "text-left"}`}>
              <div className={`p-4 bg-slate-900 text-white flex justify-between items-center shrink-0 ${isRtl ? "flex-row-reverse" : ""}`}>
                <h4 className="font-bold text-xs flex items-center gap-1.5">
                  <FolderKanban className="w-4 h-4 text-amber-400" />
                  {isRtl ? "إضافة عنصر هيكل عمل ومعلم رئيسي سيادي جديد" : "Add New Sovereign WBS Node & Milestone"}
                </h4>
                <button
                  onClick={() => setIsAddingNode(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddWBSNode} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "مستوى التدرج الهرمي" : "Node Hierarchy Level"}
                    </label>
                    <select
                      value={nodeLevel}
                      onChange={(e: any) => setNodeLevel(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl"
                    >
                      <option value="1">{isRtl ? "المستوى ١: حزمة العمل الرئيسية (مثال: ١.٠، ٢.٠)" : "Level 1: Main Work Package (e.g. 1.0, 2.0)"}</option>
                      <option value="2">{isRtl ? "المستوى ٢: نشاط فرعي (مثال: ١.١، ٢.١)" : "Level 2: Sub-Activity (e.g. 1.1, 2.1)"}</option>
                      <option value="3">{isRtl ? "المستوى ٣: نشاط فرعي فرعي (مثال: ١.١.١، ٢.١.٢)" : "Level 3: Sub-Sub-Activity (e.g. 1.1.1, 2.1.2)"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "تصنيف العنصر" : "Classification Type"}
                    </label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={nodeIsMilestone}
                          onChange={(e) => setNodeIsMilestone(e.target.checked)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
                        />
                        {isRtl ? "هل هو معلم رئيسي؟ (ميزانية صفرية)" : "Is Milestone? (0 Budget)"}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "رمز الهيكل WBS *" : "WBS Code *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? "مثال: ٣.٠ أو ٣.١" : "e.g. 3.0 or 3.1"}
                      value={nodeCode}
                      onChange={(e) => setNodeCode(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "الميزانية المعتمدة المخططة (€) *" : "Baselined PV Cost Weight (€) *"}
                    </label>
                    <input
                      type="number"
                      required={!nodeIsMilestone}
                      disabled={nodeIsMilestone}
                      placeholder={nodeIsMilestone ? (isRtl ? "٠ (عنصر معلم)" : "0 (Milestone Node)") : (isRtl ? "مثال: ١٥٠٠٠٠" : "e.g. 150000")}
                      value={nodeIsMilestone ? "" : nodeBudget}
                      onChange={(e) => setNodeBudget(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-mono disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                    {isRtl ? "وصف مخرج التسليم / اسم المعلم الرئيسي *" : "Deliverable Description / Milestone Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isRtl ? "صف مهمة هندسية محددة أو حدثًا حرجًا..." : "Describe specific engineering task or critical event..."}
                    value={nodeName}
                    onChange={(e) => setNodeName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "المرحلة فنية" : "Project Phase Grouping"}
                    </label>
                    <select
                      value={nodePhase}
                      onChange={(e: any) => setNodePhase(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl"
                    >
                      <option value="Engineering">{isRtl ? "مرحلة الهندسة" : "Engineering Phase"}</option>
                      <option value="Procurement">{isRtl ? "مرحلة التوريد" : "Procurement Phase"}</option>
                      <option value="Construction">{isRtl ? "مرحلة الإنشاءات" : "Construction Phase"}</option>
                      <option value="Commissioning">{isRtl ? "مرحلة التشغيل" : "Commissioning Phase"}</option>
                      <option value="Project Management">{isRtl ? "مرحلة إدارة المشاريع" : "Project Management Phase"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "المهندس المسؤول والمشرف" : "Assignee Lead Officer"}
                    </label>
                    <input
                      type="text"
                      placeholder={isRtl ? "مثال: م. سالم العبيدي" : "e.g. Eng. Salem Al-Obeidi"}
                      value={nodeAssignee}
                      onChange={(e) => setNodeAssignee(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "تاريخ البدء *" : "Start Date *"}
                    </label>
                    <input
                      type="date"
                      required
                      value={nodeStartDate}
                      onChange={(e) => setNodeStartDate(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "تاريخ الانتهاء *" : "End Date *"}
                    </label>
                    <input
                      type="date"
                      required={!nodeIsMilestone}
                      disabled={nodeIsMilestone}
                      value={nodeIsMilestone ? nodeStartDate : nodeEndDate}
                      onChange={(e) => setNodeEndDate(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-mono disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "الحالة المبدئية" : "Initial Status"}
                    </label>
                    <select
                      value={nodeStatus}
                      onChange={(e: any) => setNodeStatus(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-bold"
                    >
                      <option value="not_started">{isRtl ? "لم يبدأ" : "Not Started"}</option>
                      <option value="in_progress">{isRtl ? "قيد التنفيذ" : "In Progress"}</option>
                      <option value="completed">{isRtl ? "مكتمل" : "Completed"}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                    {isRtl ? "نسبة الإنجاز المادي (%)" : "Physical Progress (%)"}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={nodeProgress}
                    onChange={(e) => setNodeProgress(e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                  <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 mt-1">
                    <span>0%</span>
                    <span className="text-slate-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                      {nodeProgress}% {isRtl ? "محدد" : "Selected"}
                    </span>
                    <span>100%</span>
                  </div>
                </div>

                <div className={`pt-4 border-t border-slate-100 flex justify-end gap-2 shrink-0 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setIsAddingNode(false)}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    {isRtl ? "إلغاء الأمر" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-lg"
                  >
                    {isRtl ? "إنشاء حزمة عمل WBS" : "Build WBS Node"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Interactive EDIT Node Dialog Box overlay if open */}
        {editingNode && (
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left overflow-y-auto">
            <div className={`bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border my-8 ${isRtl ? "text-right" : "text-left"}`}>
              <div className={`p-4 bg-slate-900 text-white flex justify-between items-center shrink-0 ${isRtl ? "flex-row-reverse" : ""}`}>
                <h4 className="font-bold text-xs flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4 text-amber-400" />
                  {isRtl ? `تعديل عنصر هيكل العمل والمعلم السيادي (${editingNode.code})` : `Modify Sovereign WBS Node & Milestone (${editingNode.code})`}
                </h4>
                <button
                  onClick={() => setEditingNode(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditWBSNodeSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "مستوى التدرج الهرمي" : "Hierarchy Level"}
                    </label>
                    <select
                      value={editingNode.level}
                      onChange={(e: any) => setEditingNode({ ...editingNode, level: parseInt(e.target.value) as 1 | 2 | 3 })}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl"
                    >
                      <option value="1">{isRtl ? "المستوى ١: حزمة العمل الرئيسية" : "Level 1: Main Work Package"}</option>
                      <option value="2">{isRtl ? "المستوى ٢: نشاط فرعي" : "Level 2: Sub-Activity"}</option>
                      <option value="3">{isRtl ? "المستوى ٣: نشاط فرعي فرعي" : "Level 3: Sub-Sub-Activity"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "تصنيف العنصر" : "Classification Type"}
                    </label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editingNode.isMilestone}
                          onChange={(e) => setEditingNode({ ...editingNode, isMilestone: e.target.checked, budget: e.target.checked ? 0 : editingNode.budget })}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
                        />
                        {isRtl ? "هل هو معلم رئيسي؟ (ميزانية صفرية)" : "Is Milestone? (0 Budget)"}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "رمز الهيكل WBS *" : "WBS Code *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? "مثال: ١.١ أو ٢.١" : "e.g. 1.1 or 2.1"}
                      value={editingNode.code}
                      onChange={(e) => setEditingNode({ ...editingNode, code: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "الميزانية المعتمدة المخططة (€) *" : "Baselined PV Cost Weight (€) *"}
                    </label>
                    <input
                      type="number"
                      required={!editingNode.isMilestone}
                      disabled={editingNode.isMilestone}
                      placeholder={isRtl ? "مثال: ١٥٠٠٠٠" : "e.g. 150000"}
                      value={editingNode.isMilestone ? "" : editingNode.budget}
                      onChange={(e) => setEditingNode({ ...editingNode, budget: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-mono disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                    {isRtl ? "وصف مخرج التسليم / اسم المعلم الرئيسي *" : "Deliverable Description / Milestone Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isRtl ? "صف مهمة هندسية محددة..." : "Describe specific engineering task..."}
                    value={editingNode.name}
                    onChange={(e) => setEditingNode({ ...editingNode, name: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "المرحلة فنية" : "Project Phase Grouping"}
                    </label>
                    <select
                      value={editingNode.phase || "Construction"}
                      onChange={(e: any) => setEditingNode({ ...editingNode, phase: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl"
                    >
                      <option value="Engineering">{isRtl ? "مرحلة الهندسة" : "Engineering Phase"}</option>
                      <option value="Procurement">{isRtl ? "مرحلة التوريد" : "Procurement Phase"}</option>
                      <option value="Construction">{isRtl ? "مرحلة الإنشاءات" : "Construction Phase"}</option>
                      <option value="Commissioning">{isRtl ? "مرحلة التشغيل" : "Commissioning Phase"}</option>
                      <option value="Project Management">{isRtl ? "مرحلة إدارة المشاريع" : "Project Management Phase"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "المهندس المسؤول والمشرف" : "Assignee Lead Officer"}
                    </label>
                    <input
                      type="text"
                      placeholder={isRtl ? "مثال: م. سالم العبيدي" : "e.g. Eng. Salem"}
                      value={editingNode.assignee}
                      onChange={(e) => setEditingNode({ ...editingNode, assignee: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "تاريخ البدء" : "Start Date"}
                    </label>
                    <input
                      type="date"
                      value={editingNode.startDate || ""}
                      onChange={(e) => setEditingNode({ ...editingNode, startDate: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "تاريخ الانتهاء" : "End Date"}
                    </label>
                    <input
                      type="date"
                      disabled={editingNode.isMilestone}
                      value={editingNode.isMilestone ? (editingNode.startDate || "") : (editingNode.endDate || "")}
                      onChange={(e) => setEditingNode({ ...editingNode, endDate: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-mono disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "الحالة" : "Status"}
                    </label>
                    <select
                      value={editingNode.status || "not_started"}
                      onChange={(e: any) => setEditingNode({ ...editingNode, status: e.target.value, progress: e.target.value === "completed" ? 100 : editingNode.progress })}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-bold"
                    >
                      <option value="not_started">{isRtl ? "لم تبدأ" : "Not Started"}</option>
                      <option value="in_progress">{isRtl ? "قيد التنفيذ" : "In Progress"}</option>
                      <option value="completed">{isRtl ? "مكتمل" : "Completed"}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                    {isRtl ? "نسبة الإنجاز المادي (%)" : "Physical Progress (%)"}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingNode.progress}
                    onChange={(e) => setEditingNode({ ...editingNode, progress: parseInt(e.target.value) || 0, status: parseInt(e.target.value) === 100 ? "completed" : (parseInt(e.target.value) > 0 ? "in_progress" : "not_started") })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                  <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 mt-1">
                    <span>0%</span>
                    <span className="text-slate-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                      {editingNode.progress}% {isRtl ? "محدد" : "Selected"}
                    </span>
                    <span>100%</span>
                  </div>
                </div>

                <div className={`pt-4 border-t border-slate-100 flex justify-end gap-2 shrink-0 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setEditingNode(null)}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    {isRtl ? "إلغاء الأمر" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-lg"
                  >
                    {isRtl ? "تحديث عنصر هيكل العمل" : "Update Node Configuration"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PMI-Standard Create Project Plan Dialog Box overlay if open */}
        {isCreateProjectOpen && (
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left overflow-y-auto">
            <div className={`bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border my-8 ${isRtl ? "text-right" : "text-left"}`}>
              <div className={`p-4 bg-slate-900 text-white flex justify-between items-center shrink-0 ${isRtl ? "flex-row-reverse" : ""}`}>
                <h4 className="font-bold text-xs flex items-center gap-1.5">
                  <Briefcase className="w-4.5 h-4.5 text-amber-400" />
                  {isRtl ? "بدء خطة مشروع سيادية جديدة (معيار PMI)" : "Initiate New Project Plan (PMI Standard)"}
                </h4>
                <button
                  onClick={() => setIsCreateProjectOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProjectPlan} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-amber-500" />
                    {isRtl ? "تكامل مجموعات عمليات معيار معهد إدارة المشاريع PMI" : "PMI Process Groups Integration"}
                  </p>
                  <p>
                    {isRtl 
                      ? "عند اختيار قالب معيار PMI، سيقوم النظام تلقائيًا بتأسيس هيكل العمل WBS بـ 5 مجموعات عمليات معتمدة (البدء، التخطيط، التنفيذ، المراقبة والتحكم، الإغلاق) مع معلم رئيسي للقبول النهائي."
                      : "By choosing the PMI Standard template, the system will automatically bootstrap the project WBS with the 5 authoritative Project Process Groups (Initiating, Planning, Executing, Monitoring, Closing) & an acceptance milestone."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "رمز المشروع *" : "Project Code *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? "مثال: SIRTE-098" : "e.g. SIRTE-098"}
                      value={newProjCode}
                      onChange={(e) => setNewProjCode(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-mono uppercase"
                    />
                    <span className="text-[9px] text-slate-400">
                      {isRtl ? "بادئة المعرف الفريد لعقد العمل" : "Unique identifier prefix"}
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "ميزانية المشروع الإجمالية باليورو (€) *" : "Total Project Budget (EUR) *"}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder={isRtl ? "مثال: 5000000" : "e.g. 5000000"}
                      value={newProjBudget}
                      onChange={(e) => setNewProjBudget(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-mono"
                    />
                    <span className="text-[9px] text-slate-400">
                      {isRtl ? "الميزانية المعتمدة الأساسية (Cost Baseline)" : "Standard cost baseline weight"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                    {isRtl ? "اسم وعنوان المشروع الرئيسي *" : "Project Title / Description *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isRtl ? "مثال: مشروع توسعة محطة تجفيف الغاز حقل آمال-٢" : "e.g. Amal-2 Gas Dehydration Facility Expansion"}
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "الشركة التابعة / المشغل مالك العقد *" : "Operator / Company *"}
                    </label>
                    <select
                      value={newProjCompany}
                      onChange={(e) => setNewProjCompany(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl"
                    >
                      <option value="Waha Oil Company">{isRtl ? "شركة الواحة للنفط" : "Waha Oil Company"}</option>
                      <option value="Arabian Gulf Oil Company">{isRtl ? "شركة الخليج العربي للنفط (AGOCO)" : "Arabian Gulf Oil Company (AGOCO)"}</option>
                      <option value="Zallaf Libya">{isRtl ? "شركة زلاف ليبيا" : "Zallaf Libya"}</option>
                      <option value="Mellitah Gas">{isRtl ? "شركة مليتة للنفط والغاز" : "Mellitah Gas"}</option>
                      <option value="Harouge Oil Operations">{isRtl ? "شركة الهروج للعمليات النفطية" : "Harouge Oil Operations"}</option>
                      <option value="Sirte Oil Company">{isRtl ? "شركة سرت لإنتاج وتصنيع النفط والغاز" : "Sirte Oil Company"}</option>
                      <option value="Mabruk Oil Operations">{isRtl ? "شركة مبروك للعمليات النفطية" : "Mabruk Oil Operations"}</option>
                      <option value="NOC Direct Operations">{isRtl ? "العمليات المباشرة للمؤسسة الوطنية للنفط" : "NOC Direct Operations"}</option>
                      <option value="CUSTOM">{isRtl ? "أخرى / شركة نفطية مخصصة" : "Other / Custom Subsidiary"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "قالب هيكل العمل القياسي WBS" : "WBS Standard Template"}
                    </label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="projTemplate"
                          checked={newProjTemplate === "pmi"}
                          onChange={() => setNewProjTemplate("pmi")}
                          className="text-amber-500 focus:ring-amber-500 font-mono"
                        />
                        {isRtl ? "قالب PMI القياسي" : "PMI Standard"}
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="projTemplate"
                          checked={newProjTemplate === "blank"}
                          onChange={() => setNewProjTemplate("blank")}
                          className="text-amber-500 focus:ring-amber-500 font-mono"
                        />
                        {isRtl ? "صفحة بيضاء فارغة" : "Blank Slate"}
                      </label>
                    </div>
                  </div>
                </div>

                {newProjCompany === "CUSTOM" && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "اسم المشغل / الشركة التخصيصية *" : "Custom Operator / Company Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? "مثال: شركة النفوسة للعمليات النفطية" : "e.g. Nafusah Oil Operations"}
                      value={newProjCustomCompany}
                      onChange={(e) => setNewProjCustomCompany(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-semibold"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "تاريخ البدء المستهدف *" : "Target Start Date *"}
                    </label>
                    <input
                      type="date"
                      required
                      value={newProjStartDate}
                      onChange={(e) => setNewProjStartDate(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      {isRtl ? "تاريخ الانتهاء المستهدف *" : "Target End Date *"}
                    </label>
                    <input
                      type="date"
                      required
                      value={newProjEndDate}
                      onChange={(e) => setNewProjEndDate(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 bg-slate-50 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className={`pt-4 border-t border-slate-100 flex justify-end gap-2 shrink-0 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setIsCreateProjectOpen(false)}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50"
                  >
                    {isRtl ? "إلغاء الأمر" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-lg cursor-pointer"
                  >
                    {isRtl ? "إنشاء خطة المشروع السيادية" : "Create Project Plan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir={isRtl ? "rtl" : "ltr"}>
            <div className={`bg-white dark:bg-[#0a1930] rounded-xl shadow-2xl w-full max-w-sm border overflow-hidden ${
              confirmDialog.danger ? 'border-rose-200 dark:border-rose-900/50' : 'border-slate-200 dark:border-slate-700'
            }`}>
              <div className={`px-5 py-4 border-b flex justify-between items-center ${
                confirmDialog.danger 
                  ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' 
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}>
                <h3 className={`font-black text-sm uppercase flex items-center gap-2 ${
                  confirmDialog.danger ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                }`}>
                  {confirmDialog.danger && <AlertTriangle className="w-4 h-4" />}
                  {confirmDialog.title}
                </h3>
                <button 
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >✕</button>
              </div>
              
              <div className="p-5">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
              
              <div className={`px-5 py-3 border-t flex gap-3 bg-slate-50/50 dark:bg-slate-900/50 ${isRtl ? 'justify-start' : 'justify-end'}`}>
                <button
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase tracking-wider"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className={`px-5 py-2 text-white text-xs font-black rounded shadow-md cursor-pointer uppercase tracking-wider transition-colors ${
                    confirmDialog.danger 
                      ? "bg-rose-600 hover:bg-rose-700" 
                      : "bg-slate-900 dark:bg-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {isRtl ? "تأكيد" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
