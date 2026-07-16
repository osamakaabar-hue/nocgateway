# Translation Audit Report

## Existing Translation Keys (en / ar)
- noc_brand
- noc_sub_brand
- title_main
- reset_data
- change_logout
- all_rights
- privacy_policy
- compliance_manual
- reset_app
- search_placeholder
- notifications
- mark_all_read
- clear_history
- no_notifications
- tab_claims
- tab_wbs
- tab_invoices
- tab_documents
- tab_raci
- tab_data_sovereignty
- tab_security
- tab_users
- tab_profile
- select_role_title
- select_role_subtitle
- auditor_category
- subsidiary_category
- enter_auditor
- enter_pm
- enter_finance
- reset_confirm_title
- reset_confirm_text
- reset_bullet_1
- reset_bullet_2
- reset_bullet_3
- cancel
- confirm_reset
- data_reset_success
- logged_out
- new_stage_claim_btn
- loading
- status
- actions
- type
- date
- size
- view
- download
- close
- save
- submit
- edit
- delete
- verified
- pending
- rejected
- approved
- progress
- total
- code
- description
- company
- value
- auditor
- evidence
- back_to_list
- en

## Detected Hard‑coded UI Strings (may need translation)
- react
- ./types
- ./data
- ./i18n
- ./components/AIAssistant
- ./components/AddClaimModal
- ./components/WBSStructuring
- ./components/InvoiceAuditingVault
- ./components/RACIMatrix
- ./components/DataSovereigntyLedger
- ./components/CentralSecuritySettings
- ./components/NocHeader
- ./components/SovereignDocumentRegistry
- ./components/ThemeToggle
- ./components/UserProfile
- ./components/ForgotPasswordModal
- ./components/NocLogo
- ./components/ThemedSampleDashboard
- lucide-react
- user-noc-admin
- Dr. Khaled Security
- system_admin
- NOC System Security Administrator
- National Oil Corporation (NOC)
- NOC_HQ
- Master administrative control. Governs access rights, provisions users, and executes emergency session revocations.
- System Governance
- User Provisioning
- Kill Switch Operations
- Security Logging
- user-noc-pmo
- Eng. Nadia Al-Kout
- pmo_auditor
- NOC PMO Technical Auditor
- Evaluates physical and milestone claims. Grants technical approval, rejects claims, or requests clarifications based on evidence.
- Review progress claims
- Use AI evaluation assistant
- Approve / Reject technical progress
- Request clarifications
- user-noc-fin
- Mr. Abdelrahman Boufardis
- noc_finance
- NOC Central Financial Auditor
- Audits submitted commercial invoices against technical achievements, issues central payment tokens, and locks the stage cycle.
- Review commercial invoices
- Verify against technical Earned Value
- Authorize payments
- Generate NOC Security Tokens
- user-noc-head
- Mrs. Salma Al-Hashemi
- noc_head_of_accounts
- NOC Head of Accounts
- Sovereign head of accounts. Reviews financial auditor recommendations and officially releases final funds on NOC ledger.
- Final sign-off
- Release escrow/payment ledger
- Revoke or lock central security keys
- user-waha-pm
- Eng. Tarek El-Fassi
- subsidiary_pm
- Subsidiary Project Manager
- Waha Oil Company
- WAHA
- Manages wellhead maintenance. Submits progress claims, updates deliverables, and uploads site construction photos.
- Submit new progress claims
- Add deliverables
- Upload site photos & documents
- Resubmit claims
- user-waha-fin
- Mr. Mustafa Al-Bakoush
- subsidiary_finance
- Subsidiary Finance Officer
- Handles invoicing for Waha Oil Company projects. Drafts commercial claims following technical PMO approval.
- Submit commercial invoice
- Track earned value limits
- Upload official PDF invoices
- user-agoco-pm
- Eng. Salem Al-Obeidi
- Arabian Gulf Oil Company
- AGOCO
- Oversees route surveys. Reports surveying logs, terrain parameters, and coordinates mapping.
- user-agoco-fin
- Mr. Bashir Al-Ghariani
- Manages commercial and contract billing for AGOCO pipeline projects.
- user-zallaf-pm
- Eng. Muftah Al-Warfali
- Zallaf Libya
- ZALLAF
- Manages Erawin Field substation civil works. Uploads concrete compressive strength certificates.
- Upload concrete logs
- user-zallaf-fin
- Mr. Ahmed Al-Mabrouk
- Drafts commercial progress invoice dossiers for Zallaf substation installations.
- user-mellitah-pm
- Eng. Ali Al-Zway
- Mellitah Oil & Gas
- MELLITAH
- Oversees the gas plant overhaul. Uploads nitrogen leak-test logs and PLC update checklists.
- Upload technical test sheets
- user-mellitah-fin
- Mr. Ibrahim Al-Fitouri
- Issues billing and audits financial limits for Mellitah Gas overhaul stages.
- noc_logged_demo_user
- noc_eppm_claims
- Error parsing saved claims
- claim-1
- noc_eppm_lang
- en
- ar
- rtl
- ltr
- ");
  const [filterPriority, setFilterPriority] = useState<
- |
- >(
- );
  const [filterStatus, setFilterStatus] = useState<
- );
  const [auditorNotes, setAuditorNotes] = useState(
- );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type:
- } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(1);
  const [previewTab, setPreviewTab] = useState<
- );
  const [currentTab, setCurrentTab] = useState<
- );
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(
- );
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(
- , e);
      }
    }
    
    // Default notifications cloned for every demo user
    const defaultNotifs: NotificationItem[] = [];
    const baseNotifs = [
      {
        id:
- ,
        title:
- ,
        message:
- ,
        timestamp:
- ,
        read: false,
        type:
- as const,
        claimId:
- },
      {
        id:
- ,
        read: true,
        type:
- }
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
    type:
- =
- ,
    claimId?: string,
    tab?:
- ,
    targetUserId?: string
  ) => {
    const timestamp = new Date().toLocaleTimeString(
- , { hour:
- , minute:
- });
    
    if (targetUserId) {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}-${targetUserId}`,
        userId: targetUserId,
        title,
        message,
        timestamp,
        read: false,
        type,
        claimId,
        tab
      };
      setNotifications(prev => [newNotif, ...prev]);
    } else {
      const newNotifs = DEMO_USERS.map(user => ({
        id: `notif-${Date.now()}-${user.id}`,
        userId: user.id,
        title,
        message,
        timestamp,
        read: false,
        type,
        claimId,
        tab
      }));
      setNotifications(prev => [...newNotifs, ...prev]);
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    // 1. Mark as read for this user
    setNotifications(prev => prev.map(n => n.id === notif.id && n.userId === currentUser?.id ? { ...n, read: true } : n));
    setIsNotificationsOpen(false);

    // 2. Identify target tab
    let targetTab: typeof currentTab =
- ;
    if (notif.tab) {
      targetTab = notif.tab;
    } else {
      const msg = (notif.message ||
- ).toLowerCase();
      const title = (notif.title ||
- ).toLowerCase();
      if (msg.includes(
- ) || title.includes(
- ) || msg.includes(
- )) {
        targetTab =
- ;
      } else if (msg.includes(
- ;
      }
    }

    // Switch tab
    setCurrentTab(targetTab);

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
        if (text.includes(
- ) || text.includes(
- )) {
          const c = claims.find(cl => cl.companyId ===
- );
          if (c) targetClaimId = c.id;
        } else if (text.includes(
- );
          if (c) targetClaimId = c.id;
        }
      }
    }

    if (targetClaimId) {
      setSelectedClaimId(targetClaimId);
      
      // Check permission for current user
      let actualAllowed = claims.filter((c) => {
        if (currentUser && currentUser.companyId !==
- ) {
          return c.companyId === currentUser.companyId;
        }
        return true;
      });

      const isAllowed = actualAllowed.some(c => c.id === targetClaimId);
      if (!isAllowed) {
        const claimToOpen = claims.find(c => c.id === targetClaimId);
        if (claimToOpen) {
          // Find matching demo user for this company or default to NOC HQ Technical Auditor
          const suitableUser = DEMO_USERS.find(u => u.companyId === claimToOpen.companyId && u.role ===
- ) 
            || DEMO_USERS.find(u => u.companyId ===
- && u.role ===
- );
          if (suitableUser) {
            setCurrentUser(suitableUser);
            setActiveRole(suitableUser.role);
            if (lang ===
- ) {
              showToast(`تم تبديل الهوية تلقائياً إلى ${suitableUser.name} لمراجعة هذه المطالبة.`,
- );
            } else {
              showToast(`Auto-switched session to ${suitableUser.name} to view this claim.`,
- );
            }
          }
        }
      } else {
        const finalClaim = claims.find(c => c.id === targetClaimId);
        if (finalClaim) {
          if (lang ===
- ) {
            showToast(`تم الانتقال مباشرة إلى المطالبة: ${finalClaim.code} (${targetTab ===
- ?
- : targetTab ===
- :
- })`,
- );
          } else {
            showToast(`Navigated directly to claim ${finalClaim.code} in ${targetTab} view.`,
- );
          }
        }
      }
    } else {
      if (lang ===
- ) {
        showToast(`تم الانتقال إلى تبويب: ${targetTab}`,
- );
      } else {
        showToast(`Navigated to ${targetTab} view.`,
- );
      }
    }
  };

  useEffect(() => {
    localStorage.setItem(
- , JSON.stringify(notifications));
  }, [notifications]);

  // Subsidiary PM edit states
  const [editClaimedProgress, setEditClaimedProgress] = useState<number>(0);
  const [newDeliverableDesc, setNewDeliverableDesc] = useState(
- );
  const [newDeliverableWeight, setNewDeliverableWeight] = useState(
- );
  const [revisionComment, setRevisionComment] = useState(
- );
  const [isRevisionConfirmed, setIsRevisionConfirmed] = useState(false);

  // Subsidiary Finance submission states
  const [invoiceNo, setInvoiceNo] = useState(
- );
  const [invoiceAmt, setInvoiceAmt] = useState<number>(0);
  const [invoiceDocName, setInvoiceDocName] = useState(
- );

  // Manual Upload States
  const [uploadFileName, setUploadFileName] = useState(
- );
  const [uploadFileType, setUploadFileType] = useState<
- );
  const [isDragging, setIsDragging] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(
- , JSON.stringify(claims));
  }, [claims]);

  // Sync user changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
- , JSON.stringify(currentUser));
      setActiveRole(currentUser.role);
    } else {
      localStorage.removeItem(
- );
    }
  }, [currentUser]);

  // Allowed Claims based on company security authorization
  const allowedClaims = claims.filter((c) => {
    if (currentUser && currentUser.companyId !==
- ) {
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
      if (selectedClaim.status ===
- ) {
        setAuditorNotes(selectedClaim.auditorNotes ||
- );
      } else {
        setAuditorNotes(
- );
      }
      setEditClaimedProgress(selectedClaim.claimedProgress);
      setIsRevisionConfirmed(false);
      setRevisionComment(
- );
      // Reset financial inputs
      setInvoiceNo(selectedClaim.invoiceNumber || `INV-${selectedClaim.code}-${Math.floor(100 + Math.random() * 900)}`);
      
      // Calculate an initial recommended invoice amount = Earned Value (Progress * budget / 100)
      const earnedValue = Math.round((selectedClaim.claimedProgress / 100) * selectedClaim.numericValue);
      setInvoiceAmt(selectedClaim.invoiceAmount || earnedValue);
      setInvoiceDocName(selectedClaim.invoiceNumber ? `Invoice_${selectedClaim.invoiceNumber}.pdf` :
- );
    }
  }, [selectedClaimId, selectedClaim]);

  // Toast handler
  const showToast = (text: string, type:
- ) => {
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
    const matchesPriority = filterPriority ===
- || c.priority === filterPriority;
    const matchesStatus = filterStatus ===
- || c.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
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
        console.error(
- , res.status);
      }
    } catch (e) {
      console.error(
- , e);
    }

    if (isSuspended) {
      const msg = isRtl ? 'هذا المستخدم موقوف، يرجى الاتصال بمسؤول النظام للحصول على المساعدة' : 'this user is suspended please call noc admin for help';
      showToast(msg, 'error');
      
      return;
    }

    setCurrentUser(user);
    setActiveRole(user.role);
    if (user.role === 'system_admin') {
      setCurrentTab('users');
    } else {
      setCurrentTab('claims');
    }
    showToast(`Successfully logged in as ${user.name} (${user.company})`,
- );
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    showToast(
- ,
- );
  };

  // 1. PMO Technical Audit Action: Approve
  const handleApproveTechnical = () => {
    if (!selectedClaim) return;
    
    const updated = claims.map((c) => {
      if (c.id === selectedClaim.id) {
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: `${currentUser?.name ||
- }`,
          action:
- ,
          change: `Approved technical progress rate (${c.claimedProgress}%) and certified milestone deliverables. Subsidiary invoicing unlocked.${auditorNotes.trim() ? ` Remarks:
- ` :
- }`,
          timestamp: new Date().toLocaleString(
- , {
            month:
- ,
            day:
- ,
            hour:
- ,
            minute:
- ,
          }),
        };
        return {
          ...c,
          status:
- as const,
          auditorNotes,
          auditLog: [newLog, ...c.auditLog],
        };
      }
      return c;
    });

    setClaims(updated);
    setAuditorNotes(
- );
    showToast(`Technical progress approved successfully for claim ${selectedClaim.code}. Invoicing is now unlocked.`,
- );
    addNotification(
- , `Claim ${selectedClaim.code} has been approved technically. Invoicing is now unlocked.`,
- );
  };

  // 2. PMO Technical Audit Action: Reject
  const handleRejectTechnical = () => {
    if (!selectedClaim) return;
    if (!auditorNotes.trim()) {
      showToast(
- );
      return;
    }

    const updated = claims.map((c) => {
      if (c.id === selectedClaim.id) {
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: `${currentUser?.name ||
- ,
          change: `Rejected technical progress claim due to insufficient deliverables and alignment gaps. Reason:
- `,
          timestamp: new Date().toLocaleString(
- );
    showToast(`Technical progress claim ${selectedClaim.code} rejected. Sent back to the subsidiary for revision.`,
- , `Technical progress claim ${selectedClaim.code} has been rejected by central PMO.`,
- );
  };

  // 3. PMO Technical Audit Action: Request Info
  const handleRequestInfoTechnical = () => {
    if (!selectedClaim) return;
    if (!auditorNotes.trim()) {
      showToast(
- ,
          change: `Requested additional technical specifications and clarification notes. Clarification Needed:
- );
    showToast(`Clarification info requested for claim ${selectedClaim.code}. Notifications sent to Subsidiary PM.`,
- , `NOC PMO requested additional engineering clarification on claim ${selectedClaim.code}.`,
- );
  };

  // 4. Subsidiary PM Action: Resubmit progress claim
  const handlePMResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    if (editClaimedProgress <= selectedClaim.previousProgress) {
      showToast(
- );
      return;
    }

    if (!isRevisionConfirmed) {
      showToast(
        isRtl 
          ?
- ,
          change: isRtl
            ? `تم إعادة تقديم تقدم العمل المالي بنسبة مراجعة ${editClaimedProgress}%.${revisionComment.trim() ? ` مبررات المقاول:
- }`
            : `Resubmitted technical progress revised to ${editClaimedProgress}%.${revisionComment.trim() ? ` Contractor Comment:
- as const,
          claimedProgress: editClaimedProgress,
          auditorNotes:
- , // Clear prior audit warnings on new revision
          auditLog: [newLog, ...c.auditLog],
        };
      }
      return c;
    });

    setClaims(updated);
    setIsRevisionConfirmed(false);
    setRevisionComment(
- );
    showToast(`Progress claim ${selectedClaim.code} resubmitted successfully to NOC PMO.`,
- , `Subsidiary PM resubmitted progress claim ${selectedClaim.code} with revised progress (${editClaimedProgress}%).`,
- );
  };

  // 5. Subsidiary PM Action: Add Deliverable to claim
  const handlePMAddDeliverable = () => {
    if (!selectedClaim || !newDeliverableDesc.trim()) return;

    const newDel: Deliverable = {
      id: `del-${Date.now()}`,
      description: newDeliverableDesc,
      weight: newDeliverableWeight,
      status:
- ,
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
    setNewDeliverableDesc(
- );
    showToast(
- , `New physical deliverable added to claim ${selectedClaim.code}:
- .`,
- );
  };

  // 6. Subsidiary Finance Action: Submit Commercial Invoice
  const handleFinanceSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    if (!invoiceNo.trim()) {
      showToast(
- );
      return;
    }

    if (invoiceAmt <= 0) {
      showToast(
- );
      return;
    }

    // Earned Value constraint check
    const earnedValue = (selectedClaim.claimedProgress / 100) * selectedClaim.numericValue;
    if (invoiceAmt > earnedValue) {
      showToast(
- );
      return;
    }

    const updated = claims.map((c) => {
      if (c.id === selectedClaim.id) {
        const formattedAmount = `€${invoiceAmt.toLocaleString(
- )}`;
        const newInvoiceDoc: Document = {
          id: `doc-inv-${Date.now()}`,
          name: invoiceDocName || `Commercial_Invoice_${invoiceNo}.pdf`,
          size:
- ,
          uploadedAt: new Date().toLocaleTimeString(
- }),
          type:
- ,
        };

        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: `${currentUser?.name ||
- ,
          change: `Issued commercial invoice ${invoiceNo} valued at ${formattedAmount}. Value is compliant with technical Earned Value limit.`,
          timestamp: new Date().toLocaleString(
- ,
          }),
        };

        return {
          ...c,
          status:
- as const,
          invoiceNumber: invoiceNo,
          invoiceAmount: invoiceAmt,
          documents: [...c.documents, newInvoiceDoc],
          auditLog: [newLog, ...c.auditLog],
        };
      }
      return c;
    });

    setClaims(updated);
    showToast(`Commercial invoice ${invoiceNo} submitted for final financial audit clearance.`,
- , `Invoice ${invoiceNo} (valued at €${invoiceAmt.toLocaleString()}) filed for claim ${selectedClaim.code}.`,
- );
  };

  // 7. NOC Financial Auditor Action: Authorize payment and lock phase
  const handleAuthorizePayment = () => {
    if (!selectedClaim) return;

    const secureToken = `NOC-AUTH-${selectedClaim.companyId}-${Math.floor(1000 + Math.random() * 9000)}-${selectedClaim.code.substring(selectedClaim.code.lastIndexOf(
- ) + 1)}`;

    const updated = claims.map((c) => {
      if (c.id === selectedClaim.id) {
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: `${currentUser?.name ||
- ,
          change: `Commercial invoice cleared. Central ERP payment authorized. Authorization Token: ${secureToken}`,
          timestamp: new Date().toLocaleString(
- as const,
          paymentToken: secureToken,
          auditLog: [newLog, ...c.auditLog],
        };
      }
      return c;
    });

    setClaims(updated);
    showToast(`Invoice payment authorized successfully. Generated NOC authorization token. Claim phase locked.`,
- , `Central payment authorized for claim ${selectedClaim.code}. Secure ERP token generated.`,
- );
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
      const isImg = file.type.startsWith(
- );
      const isXls = file.name.endsWith(
- ) || file.name.endsWith(
- );
      
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toLocaleTimeString(
- }),
        type: isImg ?
- : isXls ?
- ,
        url: isImg ?
- : undefined,
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
      showToast(`Supporting file
- uploaded successfully.`,
- );
    }
  };

  // Manual File Form submit
  const handleManualUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim || !uploadFileName.trim()) return;

    const extension = uploadFileType ===
- : uploadFileType ===
- ;
    const fullName = uploadFileName.includes(
- ) ? uploadFileName : `${uploadFileName}${extension}`;

    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name: fullName,
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      uploadedAt: new Date().toLocaleTimeString(
- }),
      type: uploadFileType,
      url: uploadFileType ===
- : undefined,
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
    setUploadFileName(
- );
    showToast(`Document
- registered and appended to evidence folder.`,
- );
  };

  // Reset demo state
  const resetDemo = () => {
    localStorage.removeItem(
- );
    localStorage.removeItem(
- );
    
    // Deep clone initialClaims to prevent mutation sharing
    const pristineClaims = JSON.parse(JSON.stringify(initialClaims));
    setClaims(pristineClaims);
    setSelectedClaimId(
- );
    
    // Reset notifications back to pristine defaults
    const defaultNotifs: NotificationItem[] = [];
    const baseNotifs = [
      {
        id:
- as const
      },
      {
        id:
- as const
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
    setCurrentTab(
- );
    setCurrentUser(null);
    setActiveRole(
- );
    
    showToast(
- );

    // Force a full clean reload of the page after 500ms to allow local storage changes to settle and reload all component states cleanly
    toastTimeout = setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Status color mapper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case
- >Technical Audit Pending</span>;
    }
  };

  const getRoleBadgeColor = (role: RoleType) => {
    switch (role) {
      case
- :
        return
- ;
      case
- ;
    }
  };

  const getRoleLabel = (role: RoleType) => {
    if (isRtl) {
      switch (role) {
        case
- :
          return
- ;
        case
- as any:
          return
- ;
      }
    }
    switch (role) {
      case
- as any:
        return
- dir={isRtl ?
- }`}>
            {toastMessage.type ===
- >
                  {isRtl ?
- }`}>
                <button
                  onClick={() => {
                    setLang(
- );
                    showToast(
- }`}
                >
                  EN
                </button>
                <button
                  onClick={() => {
                    setLang(
- >
              {isRtl ?
- >
              {isRtl 
                ?
- >
                {DEMO_USERS.filter(u => u.companyId ===
- ).pop()?.substring(0, 2).toUpperCase() ||
- >
                              {isRtl && user.id ===
- :
                               isRtl && user.id ===
- >
                          {isRtl ?
- }`}>
                        {isRtl && user.id ===
- :
                         isRtl && user.id ===
- >
                            • {isRtl && cap.includes(
- ) ?
- :
                               isRtl && cap.includes(
- }`}>
                        <span>{isRtl ?
- >
                {DEMO_USERS.filter(u => u.companyId !==
- >
                          {user.role ===
- ? (isRtl ?
- ) : (isRtl ?
- >
                            {isRtl ? (user.role ===
- }`}>
                        <span>
                          {isRtl 
                            ? `دخول بصفتك ${user.role ===
- }`
                            : `Login as ${user.role ===
- >
                {isRtl ?
- >
              <a href=
- >Privacy Policy</a>
              <span>•</span>
              <a href=
- }`} dir={isRtl ?
- }`}>
          {toastMessage.type ===
- >{toastMessage.text}</span>
        </div>
      )}

      {/* SideNavBar */}
      <nav id=
- >{t(
- >
          {activeRole !==
- }`}>
                {isRtl ?
- }
              </div>
              
              <button
                onClick={() => setCurrentTab(
- } ${
                  currentTab ===
- }`} />
                {t(
- , lang)}
              </button>
              <button
                onClick={() => setCurrentTab(
- }`}>
                    {isRtl ?
- }
                  </div>

                  <button
                    onClick={() => setCurrentTab(
- } ${
                      currentTab ===
- }`} />
                    {t(
- , lang)}
                  </button>
                  <button
                    onClick={() => setCurrentTab(
- , lang)}
                  </button>
                </>
              )}
            </>
          )}
          
          {activeRole ===
- && (
            <button
              onClick={() => setCurrentTab(
- } ${
                currentTab ===
- }`} />
              {t(
- }`}>
            {isRtl ?
- }
          </div>
          <button
            onClick={() => setCurrentTab(
- } ${
              currentTab ===
- }`} />
            <span>{isRtl ?
- }`}>
              {isRtl ?
- >
              {activeRole ===
- >
                {t(
- >
                {isRtl && currentUser.role ===
- :
                 isRtl && currentUser.role ===
- } top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
              <input
                type=
- >
              <button
                onClick={() => {
                  setLang(
- );
                  showToast(
- }`}
              >
                EN
              </button>
              <button
                onClick={() => {
                  setLang(
- id=
- } ({userNotifications.filter(n => !n.read).length})
                      </span>
                      {userNotifications.filter(n => !n.read).length > 0 && (
                        <button 
                          onClick={() => {
                            setNotifications(prev => prev.map(n => n.userId === currentUser?.id ? { ...n, read: true } : n));
                            showToast(isRtl ?
- >{isRtl ?
- >
                              {notif.type ===
- >
                      <button 
                        onClick={() => {
                          setNotifications(prev => prev.filter(n => n.userId !== currentUser?.id));
                          showToast(isRtl ?
- >
                        {isRtl ?
- >
          {currentTab ===
- ? (
            <ThemedSampleDashboard lang={lang} />
          ) : activeRole ===
- ? (
            currentTab ===
- ? (
              <CentralSecuritySettings showToast={showToast} lang={lang} currentUser={currentUser} activeRole={activeRole} />
            ) : currentTab ===
- }</p>
                </div>
              </div>
            )
          ) : currentTab ===
- >
                  <option value=
- }</option>
                  <option value=
- >{claim.code}</span>
                        {claim.priority ===
- >
                            {isRtl ?
- :
                            claim.status ===
- >|</span>
                      <span>{isRtl ?
- >
                        {isRtl ? (
                          activeRole ===
- :
                          activeRole ===
- ) : (
                          activeRole ===
- )}
                      </p>
                    </div>
                  </div>

                  {/* Prominent Auditor Remarks Alert Banner */}
                  {(selectedClaim.status ===
- || selectedClaim.status ===
- } ${isRtl ?
- }`}>
                        {selectedClaim.status ===
- >
                          {selectedClaim.status ===
- )
                            : (isRtl ?
- >
- >
                          {isRtl 
                            ?
- >
                                {isRtl ?
- >
                            <span>{isRtl ?
- }{selectedClaim.previousProgress}%</span>
                            <span>{isRtl ?
- }{selectedClaim.invoiceNumber} • {isRtl ?
- >
                                {selectedClaim.status ===
- )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Payment authorized card */}
                        {selectedClaim.status ===
- >
                                {isRtl 
                                  ?
- >
                            {selectedClaim.deliverables.length} {isRtl ?
- } w-24`}>{isRtl ?
- >
                                  {del.status ===
- title=
- } text-slate-500 font-bold`}>{del.weight}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* PM New Deliverable adding */}
                        {activeRole ===
- && selectedClaim.status !==
- >
                              <input
                                type=
- placeholder={isRtl ?
- }`}>{isRtl ?
- || log.action ===
- :
                                      log.action ===
- >
                          <span>{isRtl ?
- :
                                doc.type ===
- }`}>
                                {doc.type ===
- && doc.url ? (
                                  <img src={doc.url} alt=
- >
                                  {doc.size} • {isRtl ?
- }</div>
                              <input
                                type=
- >
                                  <option value=
- }</option>
                                  <option value=
- }</option>
                                </select>
                                <button
                                  type=
- >
                                  {isRtl ?
- }
                                </button>
                              </div>
                            </form>
                          </>
                        )}
                      </div>

                      {/* Gemini AI Integration Component */}
                      {(activeRole ===
- || activeRole ===
- ) && (
                        <AIAssistant
                          claim={selectedClaim}
                          auditorNotes={auditorNotes}
                          lang={lang}
                          onApplyDraft={(draftText) => {
                            setAuditorNotes(draftText);
                            showToast(lang ===
- );
                          }}
                        />
                      )}

                      {/* Contractor PM Resubmission Form */}
                      {activeRole ===
- >edit_note</span>
                            {isRtl ?
- }
                              </label>
                              <input
                                type=
- min=
- max=
- step=
- }`}
                                placeholder={isRtl ?
- }`}>
                              <input
                                id=
- type=
- }`}>
                                {isRtl 
                                  ?
- >*</span>
                              </label>
                            </div>

                            <button
                              type=
- >
                              {selectedClaim.status ===
- ) 
                                : (isRtl ?
- )}
                            </button>
                          </form>
                        </div>
                      )}

                      {/* Contractor Finance - Invoicing Form */}
                      {activeRole ===
- >receipt_long</span>
                            {isRtl ?
- }
                          </h3>

                          {selectedClaim.status ===
- }</span>
                            </div>
                          ) : selectedClaim.status ===
- }</label>
                                <input
                                  type=
- }`}
                                  placeholder=
- }`}>
                                  <span>{isRtl ?
- >
                                    {isRtl ?
- }€{Math.round((selectedClaim.claimedProgress / 100) * selectedClaim.numericValue).toLocaleString()}
                                  </span>
                                </label>
                                <input
                                  type=
- required
                                  min=
- >
                    
                     {/* PMO Technical Reviewer Action Area */}
                     {activeRole ===
- >
                             {isRtl ?
- >
                               {isRtl ?
- }`}
                             placeholder={isRtl ?
- >
                           <button
                             onClick={handleApproveTechnical}
                             disabled={selectedClaim.status ===
- >
                             <button
                               onClick={handleRequestInfoTechnical}
                               disabled={selectedClaim.status ===
- }
                             </button>
                             <button
                               onClick={handleRejectTechnical}
                               disabled={selectedClaim.status ===
- }
                             </button>
                           </div>
                         </div>
                       </>
                     )}

                    {/* Subsidiary PM Action Area */}
                    {activeRole ===
- }
                        </button>
                      </div>
                    )}

                    {/* Subsidiary Finance Action Area */}
                    {activeRole ===
- }</span>
                      </div>
                    )}

                    {/* NOC Central Finance Action Area */}
                    {activeRole ===
- }`}>
                              <span>{isRtl ?
- }
                            </button>
                          ) : selectedClaim.status ===
- >
                              {isRtl ?
- }</h2>
              </div>
            )}
          </div>
          </>
          ) : currentTab ===
- ? (
            <WBSStructuring claims={claims} showToast={showToast} currentUser={currentUser} activeRole={activeRole} lang={lang} />
          ) : currentTab ===
- ? (
            <InvoiceAuditingVault
              claims={claims}
              setClaims={setClaims}
              currentUser={currentUser}
              activeRole={activeRole}
              showToast={showToast}
              setPreviewDoc={setPreviewDoc}
              addNotification={addNotification}
              lang={lang}
            />
          ) : currentTab ===
- ? (
            <SovereignDocumentRegistry
              claims={claims}
              setClaims={setClaims}
              currentUser={currentUser}
              showToast={showToast}
              setPreviewDoc={setPreviewDoc}
              lang={lang}
            />
          ) : currentTab ===
- ? (
            <RACIMatrix showToast={showToast} lang={lang} />
          ) : currentTab ===
- ? (
            <DataSovereigntyLedger claims={claims} showToast={showToast} currentUser={currentUser} lang={lang} />
          ) : currentTab ===
- ? (
            <CentralSecuritySettings showToast={showToast} lang={lang} currentUser={currentUser} activeRole={activeRole} />
          ) : currentTab ===
- ? (
            <UserProfile currentUser={currentUser} showToast={showToast} lang={lang} />
          ) : (
            <CentralSecuritySettings showToast={showToast} lang={lang} currentUser={currentUser} activeRole={activeRole} />
          )}
        </div>
      </div>

      {/* Full-screen Document Previewer Modal */}
      {previewDoc && (() => {
        const hostClaim = claims.find(c => c.documents.some(d => d.id === previewDoc.id));
        const company = hostClaim ? hostClaim.company :
- ;
        const code = hostClaim ? hostClaim.code :
- ;
        const title = hostClaim ? hostClaim.title :
- ;
        
        const handleDownload = () => {
          let content =
- ;
          let contentType =
- ;
          
          if (previewDoc.type ===
- ) {
            content = `%PDF-1.4\n` +
                      `% NOC LIBYA SECURE SOVEREIGN FILE SYSTEM\n` +
                      `% Document: ${previewDoc.name}\n` +
                      `% Timestamp: ${previewDoc.uploadedAt}\n` +
                      `% Class: OFFICIAL SOVEREIGN RECORD\n` +
                      `------------------------------------------------------------------------\n` +
                      `         NATIONAL OIL CORPORATION LIBYA - SOVEREIGN PMO\n` +
                      `------------------------------------------------------------------------\n` +
                      `Document Title: ${previewDoc.name.replace(
- ).replace(/_/g,
- )}\n` +
                      `Associated Subsidiary: ${company}\n` +
                      `Associated Project Reference: ${code} - ${title}\n` +
                      `Cryptographic Signature: APPROVED BY CENTRAL AUDITOR VIA BLOCKCHAIN LEDGER\n` +
                      `Timestamp of Record: ${previewDoc.uploadedAt} (Sovereign Tripoli Time)\n` +
                      `MD5 Checksum: ${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}\n` +
                      `------------------------------------------------------------------------\n` +
                      `Verification Details:\n` +
                      `We hereby certify that all technical milestone conditions are completed and verified.\n` +
                      `All supporting physical photo evidence matches structural blueprints. Physical on-site surveys\n` +
                      `were validated by Third-Party Inspection Authorities.\n\n` +
                      `Sign-off Status: TECHNICAL VALIDATION CLEARED (SIGNED ELECTRONICALLY)\n` +
                      `------------------------------------------------------------------------\n`;
            contentType =
- ;
          } else if (previewDoc.type ===
- ) {
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
            contentType =
- ;
          } else {
            content = `<svg xmlns=
- width=
- height=
- viewBox=
- >` +
                      `<rect width=
- fill=
- cy=
- r=
- stroke=
- stroke-width=
- y1=
- x2=
- y2=
- stroke-dasharray=
- y=
- font-family=
- font-size=
- >GPS: 32°52'31.1
- N 13°11'15.4
- text-right
- font-bold text-amber-400
- self-center flex flex-col items-center justify-center opacity-65
- w-16 h-16 border border-emerald-400 border-dashed rounded-full flex items-center justify-center
- text-[8px] tracking-widest uppercase mt-1 text-red-500 font-bold
- font-bold
- font-bold text-slate-800 text-xs
- text-[11px] text-slate-500 leading-normal mt-1
- flex items-center gap-2
- w-4 h-4 text-emerald-500
- ${newClaim.code}
- success
- تم تقديم مطالبة فنية جديدة
- New Technical Claim Submitted
- ${newClaim.company}
- info
- text-left
- p-6
- flex items-center gap-3 text-amber-500 mb-4
- w-5 h-5 text-amber-400 animate-pulse
- text-base font-black text-white
- text-[10px] text-amber-400 font-mono tracking-widest uppercase mt-0.5
- text-xs text-slate-300 leading-relaxed
- flex items-start gap-2 text-[11px] text-slate-400 leading-normal
- text-amber-500 font-bold
- ("all");
  const [filterStatus, setFilterStatus] = useState
- ("all");
  const [auditorNotes, setAuditorNotes] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState
- (null);
  const [previewDoc, setPreviewDoc] = useState
- (null);
  const [previewZoom, setPreviewZoom] = useState
- (1);
  const [previewTab, setPreviewTab] = useState
- ("document");
  const [currentTab, setCurrentTab] = useState
- ("claims");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  
  const [notifications, setNotifications] = useState
- (0);
  const [newDeliverableDesc, setNewDeliverableDesc] = useState("");
  const [newDeliverableWeight, setNewDeliverableWeight] = useState("5.0%");
  const [revisionComment, setRevisionComment] = useState("");
  const [isRevisionConfirmed, setIsRevisionConfirmed] = useState(false);

  // Subsidiary Finance submission states
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceAmt, setInvoiceAmt] = useState
- (0);
  const [invoiceDocName, setInvoiceDocName] = useState("");

  // Manual Upload States
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileType, setUploadFileType] = useState
- Authorized & Locked
- ;
      case "pending_head_of_accounts_approval":
        return
- Release Pending
- ;
      case "pending_financial_audit":
        return
- Financial Audit
- ;
      case "approved":
        return
- Technically Approved
- ;
      case "rejected":
        return
- Rejected (PMO)
- ;
      case "info_requested":
        return
- Clarification Req.
- ;
      default:
        return
- Technical Audit Pending
- EN
- العربية
- (
- © 2026 National Oil Corporation. All Rights Reserved. General Electric & PMO Audit Module.
- Privacy Policy
- •
- RACI Compliance Manual
- Reset App Data
- Reset Application Data?
- Sovereign Data Protection Action
- Are you sure you want to permanently restore the National Oil Corporation Portfolio Audit System to its pristine baseline values?
- WBS hierarchies & custom milestones will revert to defaults.
- All newly submitted claims, progress weights, and financial overrides will be cleared.
- All uploaded PDF/XLSX invoices and technical documents will be purged.
- Cancel
- Confirm Reset
- 0 && (
- ) : notif.type === "warning" ? (
- ) : notif.type === "error" ? (
- ) : (
- ) : activeRole === "system_admin" ? (
            currentTab === "users" ? (
- ) : currentTab === "profile" ? (
- )
          ) : currentTab === "claims" ? (
- ⏱
- edit_note
- *
- receipt_long
- ) : selectedClaim.status === "pending_financial_audit" || selectedClaim.status === "authorized_for_payment" ? (
- (selectedClaim.claimedProgress / 100) * selectedClaim.numericValue && (
- ) : selectedClaim.status === "authorized_for_payment" ? (
- ) : currentTab === "wbs" ? (
- ) : currentTab === "invoices" ? (
- ) : currentTab === "documents" ? (
- ) : currentTab === "raci" ? (
- ) : currentTab === "data_sovereignty" ? (
- ) : currentTab === "users" ? (
- ` +
                      `
- GPS: 32°52'31.1"N 13°11'15.4"E
- ELEVATION: 42.1m
- DEVICE: SENSOR-FLIR-T5
- TARGET: WELLHEAD-TIE-IN
- CROSSHAIR LOCKED
- NATIONAL OIL CORPORATION EVIDENCE PHOTO
- Sovereign Multi-Format Document Workspace
- Download
- Print
- Technical Properties
- Filename
- Registered Size
- Filing System
- NOC Secure Vault
- Filing Time
- Sovereign Project Context
- Operating Operator
- Project Code
- Deliverables #
- Project Title
- Sovereign Ledger Anchored
- This document's binary fingerprint is securely anchored to the National Oil Corporation's blockchain-backed progress ledger. Any modifications instantly invalidate the sovereign state audit certificate.
- SHA-256 Fingerprint:
- 8f71c26b9a84a3021f1d18c99e0b8a3012903fe5398ab776f8216c5b9ef182a
- Download Original Document
- Standardized file verification certificate. Registered & locked.
- Live Render Panel:
- Scale:
- -
- +
- Reset
- National Oil Corporation Libya
- PMO Technical Oversight Department
- P.O. Box 2655, Tripoli, State of Libya
- OFFICIAL TRANSCRIPT
- ★ NOC ★
- Technical Inspection Sign-Off Certificate
- Issued pursuant to Sovereign Asset Auditing Directives
- OPERATING OPERATOR
- PROJECT / CLAIM CODE
- INSPECTOR REGISTRATION
- TPI-LIBYA-AUDIT-2026
- FILING TIMESTAMP
- 1. Technical Scope of Validation:
- This certifies that the National Oil Corporation PMO technical inspector crew has performed a rigorous physical audit of all deliverables claimed under the active progress cycle. On-site technical reviews, physical surveys, and material compliance certifications were comprehensively analyzed at the source oil field installation site.
- 2. Verification and Measurement Results:
- The mechanical construction, electrical tie-ins, and civil foundation integrity meet or exceed the engineering tolerances defined in the Master Project Contract Agreement. Hydrostatic pressure tests of piping networks and loops were checked under maximum rated conditions with zero pressure drop detected over the 24-hour testing window.
- Verified Deliverables & Component Status:
- ✓ 100% Verified
- ⏱ In Progress
- 3. Sovereign Authorization Clearance:
- Based on the certified technical progress shown above, the technical PMO Auditor hereby issues a full release of the technical milestone hold-back. Financial teams are cleared to authorize commercial payment drawdowns matching the earned value progress capped at 100% of the technically approved scope.
- CONTRACTOR REP
- E-Signed (2026-07-06)
- OPERATOR TECHNICAL PM
- NOC PMO AUDITOR CHIEF
- APPROVED & SECURED
- Sovereign LEDGER-OK (Hash: e9821)
- ) : previewDoc.type === "XLSX" ? (
                      /* XLSX Spreadsheet Emulation */
- X
- Sheet1 (Active Baseline)
- ID
- WBS
- Deliverable description / Cost Center
- Weight
- Contract Value
- Progress %
- Earned Value
- SUM
- TOTAL
- EVM Cumulative Cleared Summary
- Formula Reference:
- =SUMPRODUCT(WeightRange, ProgressRange) * TotalContractValue
- Sovereign Hash Integrity Code:
- xlsx_integrity_ok_ledger_verified_sha256_e42817d29
- Generated by: NOC Financial Auditing Integrator v4.2
- ) : (
                      /* IMAGE Document with HUD Overlays Emulation */
- No High-Res URL found for manual attachment
- Showing standard technical evidence verification frame placeholder
- WELLHEAD SECTOR: WAHA-MAIN-H2
- STATUS: VERIFIED
- ALT: 42.1m | GRID SYSTEM: UTM-32N
- CAMERA SENSOR: SENSOR-FLIR-T5
- OPERATOR COMPLIANCE: OK
- SECURED INTEGRITY LEDGER BLOCK: #89281
- Field Photo Evidence Verification HUD
- High-resolution on-site engineering photograph verified by third-party PMO inspectors. Visual audit telemetry metadata is embedded inside the image container and sealed using SHA-256 hash anchoring on the sovereign data blockchain.
- Verified by National Oil Corporation Central Registry
- Close Document Workspace
- express
- bcryptjs
- ./db.js
- , (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.username, u.email, u.status, u.version, u.created_at, c.name as company_name 
    FROM users u 
    LEFT JOIN companies c ON u.company_id = c.id
  `).all();
  res.json(users);
});

// GET /api/admin/audit
adminRouter.get(
- , (req, res) => {
  const logs = db.prepare(`
    SELECT id, timestamp, actor_id, actor_name, target_id, action, details, ip_address
    FROM auth_audit_logs
    ORDER BY timestamp DESC
    LIMIT 100
  `).all();
  res.json(logs);
});

// POST /api/admin/users - Provision user
adminRouter.post(
- , (req, res) => {
  const { email, username, companyId, password } = req.body;
  
  if (!email || !username || !password) {
    res.status(400).json({ error:
- });
    return;
  }

  try {
    const hash = bcrypt.hashSync(password, 10);
    const userId =
- log-
- NOC Admin
- PROVISION_USER
- User provisioned successfully
- , (req, res) => {
  const userId = req.params.id;
  
  try {
    db.transaction(() => {
      // Invalidate sessions by incrementing version
      db.prepare(
- ).run(userId);
      
      db.prepare(`
        INSERT INTO auth_audit_logs (id, actor_id, actor_name, target_id, action, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
- FORCE_RESET
- d also generate a token and send an email
    res.json({ message:
- });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id/status
adminRouter.put(
- , (req, res) => {
  const userId = req.params.id;
  const { status } = req.body;
  
  if (status !==
- && status !==
- ) {
    res.status(400).json({ error:
- });
    return;
  }
  
  try {
    db.transaction(() => {
      db.prepare(
- ).run(status, userId);
      
      db.prepare(`
        INSERT INTO auth_audit_logs (id, actor_id, actor_name, target_id, action, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
- UPDATE_STATUS
- User status updated successfully
- , (req, res) => {
  const { tenantId, reason } = req.body;
  if (!tenantId) {
    res.status(400).json({ error:
- });
    return;
  }

  try {
    db.transaction(() => {
      db.prepare(
- ).run(tenantId);
      
      db.prepare(`
        INSERT INTO auth_audit_logs (id, actor_id, actor_name, target_id, action, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
- GLOBAL_KILL_SWITCH
- Not specified
- , (req, res) => {
  const { targetUserEmail, newPassword, reason } = req.body;
  if (!targetUserEmail || !newPassword) {
    res.status(400).json({ error:
- });
    return;
  }

  try {
    const hash = bcrypt.hashSync(newPassword, 10);
    let success = false;
    let userId =
- ;
    
    db.transaction(() => {
      const user = db.prepare(
- ).get(targetUserEmail) as any;
      if (user) {
        userId = user.id;
        db.prepare(
- ).run(hash, user.id);
        
        db.prepare(`
          INSERT INTO auth_audit_logs (id, actor_id, actor_name, target_id, action, details, ip_address)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
- PASSWORD_OVERRIDE
- Target user identity email not found
- jsonwebtoken
- crypto
- super-secret-noc-key-for-dev
- , (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error:
- });
    return;
  }

  const user = db.prepare(
- ).get(email) as any;
  if (!user) {
    res.status(401).json({ error:
- });
    return;
  }

  if (user.status !==
- ) {
    res.status(403).json({ error:
- });
    return;
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    res.status(401).json({ error:
- });
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, company_id: user.company_id, version: user.version },
    JWT_SECRET,
    { expiresIn:
- }
  );

  res.json({ token, user: { id: user.id, email: user.email, status: user.status } });
});

// Forgot Password Flow
authRouter.post(
- , (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error:
- ).get(email) as any;
  if (!user) {
    // Return 200 even if user doesn
- If the email exists, a password reset link has been sent.
- hex
- , (req, res) => {
  const { email, token, newPassword } = req.body;
  
  if (!email || !token || !newPassword) {
    res.status(400).json({ error:
- ).get(email) as any;
  if (!user) {
    res.status(400).json({ error:
- });
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
    res.status(400).json({ error:
- });
    return;
  }

  // Hash new password
  const newHash = bcrypt.hashSync(newPassword, 10);

  // Update password and increment user version (Global Session Kill Switch)
  // Also mark token as used
  db.transaction(() => {
    db.prepare(
- ).run(newHash, user.id);
    db.prepare(
- ).run(validTokenRecord.id);
  })();

  res.json({ message:
- path
- fs
- database.json
- utf8
- Failed to parse database.json, starting fresh
- Failed to save database.json
- INSERT INTO companies
- INSERT INTO users
- ACTIVE
- UPDATE users SET password_hash = ?, version = version + 1 WHERE id = ?
- UPDATE users SET version = version + 1 WHERE id = ?
- UPDATE users SET status = ? WHERE id = ?
- UPDATE users SET version = version + 1 WHERE company_id = ?
- INSERT INTO password_reset_tokens
- UPDATE password_reset_tokens SET used = 1 WHERE id = ?
- INSERT INTO auth_audit_logs
- SELECT COUNT(*) as count FROM companies
- SELECT id, username FROM users WHERE email = ?
- SELECT * FROM users WHERE email = ?
- SELECT id FROM users WHERE email = ?
- FROM users u LEFT JOIN companies c
- FROM auth_audit_logs
- FROM password_reset_tokens
- ', {});

export function initDb() {
  loadDb();
  
  if (state.companies.length === 0) {
    state.companies = [
      { id:
- , name:
- , type:
- },
      { id:
- }
    ];

    const defaultPasswordHash = bcrypt.hashSync(
- , 10);
    const users = [
      { id:
- , company:
- , email:
- }
    ];

    state.users = users.map(u => ({
      id: u.id,
      company_id: u.company,
      username: u.name,
      email: u.email,
      password_hash: defaultPasswordHash,
      status:
- SIRTE
- BPMC
- ZUEITINA
- HAROUGE
- AKAKUS
- RASCO
- ZAWIA
- National Oil Corporation
- NOC HQ
- Zallaf Libya Oil & Gas
- Sirte Oil Company
- Brega Petroleum Marketing Company
- Zueitina Oil Company
- Harouge Oil Operations
- Akakus Oil Operations
- Ras Lanuf Oil & Gas Processing
- Zawia Oil Refining Company
- ../types
- approve
- reject
- POST
- Content-Type
- application/json
- info_request
- فشل توليد التقييم الذكي من الخادم السيادي.
- Failed to generate intelligent evaluation from the server.
- حدث خطأ غير متوقع أثناء معالجة الطلب المالي.
- An unexpected error occurred while processing the request.
- ai-assistant-container
- flex-row-reverse
- >
            {isRtl ?
- >
        {isRtl 
          ?
- >
        <button
          onClick={() => setAction(
- }`}
        >
          {isRtl ?
- }
        </button>
        <button
          onClick={() => setAction(
- ("approve");
  const [result, setResult] = useState
- (null);
  const [error, setError] = useState
- Flash 3.5
- ");
  const [company, setCompany] = useState(
- );
  const [code, setCode] = useState(
- );
  const [wbs, setWbs] = useState(
- );
  const [claimedValue, setClaimedValue] = useState(
- );
  const [submittedBy, setSubmittedBy] = useState(
- );
  const [previousProgress, setPreviousProgress] = useState(30);
  const [claimedProgress, setClaimedProgress] = useState(50);
  const [priority, setPriority] = useState<
- );
  const [deliverableDesc, setDeliverableDesc] = useState(
- );
  const [deliverableWeight, setDeliverableWeight] = useState(
- );
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [error, setError] = useState(
- );

  const isSubsidiary = currentUser && currentUser.companyId !==
- ;

  useEffect(() => {
    if (isOpen) {
      if (isSubsidiary && currentUser) {
        setCompany(currentUser.company);
        setSubmittedBy(currentUser.name);
        const prefix = currentUser.companyId.split(
- )[0] ||
- ;
        setCode(`${prefix}-24-${Math.floor(100 + Math.random() * 900)}`);
        setWbs(`${prefix}-WBS-${Math.floor(1000 + Math.random() * 9000)}`);
      } else {
        setCompany(
- );
        setSubmittedBy(currentUser?.name ||
- );
        setCode(`WAHA-24-${Math.floor(100 + Math.random() * 900)}`);
        setWbs(`WAHA-WBS-${Math.floor(1000 + Math.random() * 9000)}`);
      }
      setTitle(
- );
      setClaimedValue(
- );
      setPreviousProgress(30);
      setClaimedProgress(50);
      setPriority(
- );
      setDeliverables([]);
      setError(
- );
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleAddDeliverable = () => {
    if (!deliverableDesc.trim()) return;
    const newDel: Deliverable = {
      id: `del-${Date.now()}`,
      description: deliverableDesc,
      weight: deliverableWeight,
      status:
- ,
    };
    setDeliverables([...deliverables, newDel]);
    setDeliverableDesc(
- );
  };

  const handleRemoveDeliverable = (id: string) => {
    setDeliverables(deliverables.filter((d) => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(
- );

    if (!title.trim() || !code.trim() || !wbs.trim()) {
      setError(isRtl ?
- );
      return;
    }

    if (claimedProgress <= previousProgress) {
      setError(isRtl ?
- );
      return;
    }

    const companyIdMap: Record<string, string> = {
- };

    const finalCompany = isSubsidiary && currentUser ? currentUser.company : company;
    const companyId = isSubsidiary && currentUser
      ? currentUser.companyId
      : (companyIdMap[finalCompany] || `COMP-${Math.floor(Math.random() * 900) + 100}`);

    const finalSubmittedBy = isSubsidiary && currentUser ? currentUser.name : submittedBy;

    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      code,
      title,
      company: finalCompany,
      companyId,
      wbs,
      claimedValue,
      numericValue: parseFloat(claimedValue.replace(/[^0-9.]/g,
- )) || 500000,
      submittedBy: finalSubmittedBy,
      submissionDate: isRtl ?
- ,
      previousProgress,
      claimedProgress,
      priority,
      dueDate: isRtl ?
- ,
      previousNotes: isRtl ?
- ,
      deliverables: deliverables.length > 0 ? deliverables : [
        {
          id: `del-${Date.now()}-1`,
          description: isRtl ?
- ,
          weight:
- ,
          status:
- ,
        }
      ],
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          name:
- ,
          size:
- ,
          uploadedAt:
- ,
          type:
- ,
        }
      ],
      auditLog: [
        {
          id: `log-${Date.now()}-1`,
          user: finalSubmittedBy,
          action: isRtl ?
- ,
          change: `${previousProgress}% → ${claimedProgress}%`,
          timestamp: isRtl ?
- ,
        }
      ],
      auditorNotes:
- ,
      status:
- ,
    };

    onAddClaim(newClaim);
    onClose();

    // Reset fields
    setTitle(
- );
    setCode(
- );
    setWbs(
- );
    setDeliverables([]);
  };

  return (
    <div 
      id=
- }
              </label>
              <input
                type=
- required
                placeholder={isRtl ?
- }
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!code) {
                    const words = e.target.value.split(
- );
                    const acronym = words.map(w => w[0]).join(
- ).toUpperCase();
                    const companyPrefix = isSubsidiary && currentUser
                      ? (currentUser.companyId.split(
- )
                      :
- ;
                    setCode(`${companyPrefix}-${acronym ||
- }`}
              >
                <option value=
- }</option>
                <option value=
- required
                placeholder=
- >
                <button
                  type=
- onClick={() => setPriority(
- }`}
                >
                  {isRtl ?
- }
                </button>
                <button
                  type=
- }`}>
              <input
                type=
- }`}
              />
              <input
                type=
- }`}
              />
              <button
                type=
- >{d.weight}</span>
                    <button
                      type=
- >
                      {isRtl ?
- >
                {isRtl 
                  ?
- }`}>
          <button
            type=
- }
          </button>
          <button
            type=
- ("standard");
  const [deliverableDesc, setDeliverableDesc] = useState("");
  const [deliverableWeight, setDeliverableWeight] = useState("10.0%");
  const [deliverables, setDeliverables] = useState
- 0 ? (
- ../brandConfig
- ./ThemeProvider
- error
- ");
  const [loading, setLoading] = useState(true);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);

  const getLogoPath = (path: string) => {
    if (theme === 'dark' && path?.endsWith('zallaf.svg')) {
      return path.replace('zallaf.svg', 'zallaf-dark.svg');
    }
    return path;
  };
  const [newUser, setNewUser] = useState({ fullName:
- , companyId:
- , role:
- , password:
- });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isKillSwitchModalOpen, setIsKillSwitchModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(
- );
  const [overrideData, setOverrideData] = useState({ targetUserEmail:
- , newPassword:
- , reason:
- });

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(
- , e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (e) {
      console.error(
- , e);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status ===
- ;
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        showToast(isRtl ? `تم تحديث حالة المستخدم إلى ${newStatus}` : `User status updated to ${newStatus}`,
- );
        fetchAuditLogs();
      } else {
        throw new Error(
- );
      }
    } catch (e) {
      showToast(
- );
    }
  };

  const handleForceReset = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/force-reset`, { method: 'POST' });
      if (res.ok) {
        showToast(isRtl ?
- );
    }
  };

  const handleGlobalKillSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/global-kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: selectedTenant, reason: overrideData.reason })
      });
      if (res.ok) {
        showToast(isRtl ?
- : `Global session kill switch activated successfully for ${selectedTenant}!`,
- );
        setIsKillSwitchModalOpen(false);
        fetchAuditLogs();
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error ||
- );
    }
  };

  const handlePasswordOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/password-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrideData)
      });
      if (res.ok) {
        showToast(isRtl ?
- );
        setIsOverrideModalOpen(false);
        setOverrideData({ targetUserEmail:
- });
        fetchAuditLogs();
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error ||
- );
    }
  };

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUser.fullName,
          email: newUser.email,
          companyId: newUser.companyId,
          password: newUser.password
        })
      });
      
      if (res.ok) {
        showToast(isRtl ?
- );
        setIsProvisionModalOpen(false);
        setNewUser({ fullName:
- });
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error ||
- );
    }
  };

  const getTenantId = (companyName: string) => {
    let tenantId = 'NOC_HQ';
    if (companyName.includes('Waha')) tenantId = 'WAHA';
    else if (companyName.includes('Arabian Gulf') || companyName.includes('AGOCO')) tenantId = 'AGOCO';
    else if (companyName.includes('Zallaf')) tenantId = 'ZALLAF';
    else if (companyName.includes('Mellitah')) tenantId = 'MELLITAH';
    else if (companyName.includes('Sirte')) tenantId = 'SIRTE';
    else if (companyName.includes('Brega')) tenantId = 'BPMC';
    else if (companyName.includes('Zueitina')) tenantId = 'ZUEITINA';
    else if (companyName.includes('Harouge')) tenantId = 'HAROUGE';
    else if (companyName.includes('Akakus')) tenantId = 'AKAKUS';
    else if (companyName.includes('Ras Lanuf')) tenantId = 'RASCO';
    else if (companyName.includes('Zawia')) tenantId = 'ZAWIA';
    return tenantId;
  };

  const filteredUsers = users.filter(u => 
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.company_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const tenantA = getTenantId(a.company_name || 'National Oil Corporation (NOC)');
    const tenantB = getTenantId(b.company_name || 'National Oil Corporation (NOC)');
    if (tenantA !== tenantB) {
      if (tenantA === 'NOC_HQ') return -1;
      if (tenantB === 'NOC_HQ') return 1;
      return tenantA.localeCompare(tenantB);
    }
    return (a.username || '').localeCompare(b.username || '');
  });

  if (activeRole !==
- || currentUser?.companyId !==
- >
            {isRtl 
              ?
- مسؤول النظام (SYSTEM_ADMIN)
- SYSTEM_ADMIN
- >
            <p><strong>VIOLATION_TIMESTAMP:</strong> {new Date().toISOString()}</p>
            <p><strong>ACTOR_ID:</strong> {currentUser?.id ||
- }</p>
            <p><strong>ACTIVE_ROLE:</strong> {activeRole ||
- }</p>
            <p><strong>TENANT_CONTEXT:</strong> {currentUser?.companyId ||
- }`} />
            <input 
              type=
- onError={(e) => (e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns=
- ><path d=
- >
                        {user.status ===
- }`}>
                          {user.id !== 'user-noc-admin' && (
                            <>
                              <button 
                                onClick={() => handleToggleStatus(user.id)}
                                title={user.status ===
- }`}
                              >
                                {user.status ===
- >
                  {isRtl 
                    ?
- >
                  {isRtl
                    ?
- ></span>
                {isRtl ?
- dir=
- : log.action ===
- }
                </label>
                <input 
                  type=
- placeholder=
- VIOLATION_TIMESTAMP:
- ACTOR_ID:
- ACTIVE_ROLE:
- TENANT_CONTEXT:
- Loading directory data...
- (e.currentTarget.src = 'data:image/svg+xml;utf8,
- SUSPENDED
- ROOT PROTECTED
- Timestamp
- Action
- Actor
- Target
- Details
- Node IP
- No operations logged in this sequence.
- ✕
- verified
- unchecked
- Authorize Central Payment Release
- Abdelrahman Boufardis (Central Finance)
- 0000a4fb812c82098492040d39e80b2d7162973ea93774889c204fa15bcfe019
- 0000bf7124f923ae91a0cde0ff3918a245f7c3db929c4887b46cae9dff03e4b1
- 2026-07-05 14:15:22
- Filing Stage Invoice (Ref: INV-WAHA-2026-X11)
- Fatima Al-Agouri (Subsidiary Finance)
- 000084fb12b5f3a0cde0b457811ccdb21a28a39c9472bf27d81a8f9a37c981cc
- 2026-07-05 12:44:09
- Grant PMO Technical Approval
- Tarek El-Fassi (NOC Auditor)
- 00001ffae012b1cc11cf29ab34d71bc29bc27da18c2d667cbe229a4a7cf56e01
- 2026-07-05 11:21:50
- Sovereign Claim Registered & Initialized
- AGOCO Libya
- Salem Al-Obeidi (Contractor PM)
- 00000ff9ab22c94df6bc0a4dfbcf891cf27dfa19ba27debc28cbdf59bc39ca0f
- 2026-07-04 17:35:10
- تفويض الإفراج المركزي عن الدفعة المالية
- تسجيل فاتورة مرحلية (المرجع: INV-WAHA-2026-X11)
- منح الاعتماد الفني الميداني من الـ PMO
- تسجيل وتهيئة المطالبة السيادية بالمشروع
- عبد الرحمن بوفرديس (المالية المركزية)
- فاطمة العجوري (مالية الشركة التابعة)
- طارق الفاسي (مدقق المؤسسة الوطنية للنفط)
- سالم العبيدي (مدير مشروع المقاول)
- شركة الواحة للنفط
- شركة الخليج العربي للنفط (جوف)
- شركة زلاف ليبيا
- Mellitah Gas
- شركة مليتة للغاز
- b.blockHeight === selectedBlockHeight) || filteredBlocks[0];

  return (
- #20,412
- ../i18n
- ');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(
- );
  const [tokenInfo, setTokenInfo] = useState(
- );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(
- );
    setLoading(true);

    try {
      const res = await fetch(
- , {
        method:
- ,
        headers: {
- },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error ||
- flex items-center gap-3
- w-5 h-5
- text-lg font-black text-white
- إعادة تعيين كلمة المرور
- Reset Password
- text-[10px] font-mono text-slate-400 mt-0.5
- استعادة الوصول الآمن
- SECURE ACCESS RECOVERY
- w-4 h-4
- p-4 sm:p-6
- text-center py-6
- w-8 h-8
- text-lg font-bold text-white mb-2
- تم إرسال الرابط بنجاح
- Reset Link Sent
- text-xs text-slate-400 leading-relaxed mb-6
- تم إرسال رابط إعادة تعيين كلمة المرور الآمن إلى بريدك الإلكتروني بنجاح. يرجى التحقق من صندوق الوارد الخاص بك واتباع التعليمات.
- A secure password reset link has been successfully dispatched to your corporate email. Please verify your inbox and follow the instructions.
- text-[9px] font-mono text-amber-500 mb-1 uppercase tracking-widest
- text-[10px] font-mono text-slate-400 break-all
- العودة لتسجيل الدخول
- Return to Login
- space-y-4
- text-xs text-slate-400 mb-6 leading-relaxed
- أدخل عنوان بريدك الإلكتروني المؤسسي أدناه. سيقوم النظام بإنشاء رمز مميز آمن وصالح لفترة قصيرة لإعادة تعيين كلمة المرور.
- Enter your corporate email address below. The system will generate a secure, short-lived token for password reset.
- w-4 h-4 shrink-0 mt-0.5
- block text-xs font-bold text-slate-300 mb-2
- البريد الإلكتروني المؤسسي
- Corporate Email
- relative
- right-3
- left-3
- email
- name@noc.ly
- pr-10 pl-4 text-right
- pl-10 pr-4
- pt-4
- submit
- animate-pulse
- جاري الإرسال...
- Dispatching...
- إرسال رابط إعادة التعيين
- Send Reset Link
- rotate-180
- Dev Environment Output
- warning
- شركة الخليج العربي للنفط
- شركة مليتة للنفط والغاز
- شركة الهروج للعمليات النفطية
- المؤسسة الوطنية للنفط
- Today
- اليوم
- Tomorrow
- غداً
- Oct
- أكتوبر
- Within 7 Days
- خلال ٧ أيام
- October
- AM
- ص
- PM
- م
- at
- في
- المراجع الفني للـ PMO
- مدير مشروع الشركة التابعة
- المسؤول المالي للشركة التابعة
- المدقق المالي المركزي (NOC)
- مدير الحسابات العام (NOC)
- ");
  const [filterCompany, setFilterCompany] = useState<string>(
- );

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState<
- | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const [inputInvoiceNo, setInputInvoiceNo] = useState(
- );
  const [inputInvoiceAmount, setInputInvoiceAmount] = useState<number |
- );

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(() => {
    const claimsWithInvoices = claims.filter(c => {
      const isOwner = !isSubsidiary || c.companyId === currentUser.companyId;
      return isOwner && c.invoiceNumber;
    });
    return claimsWithInvoices.length > 0 ? claimsWithInvoices[0].id : null;
  });

  // Derived list of claims
  const invoicesList = claims.filter(c => {
    // Company isolation
    if (isSubsidiary && c.companyId !== currentUser.companyId) {
      return false;
    }
    return true; // Show ALL claims in the invoice sector so they can release/submit invoices for any of them!
  });

  // Filter list based on search and selected company
  const filteredInvoices = invoicesList.filter(inv => {
    const matchesSearch = 
      inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      inv.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = filterCompany ===
- || inv.companyId === filterCompany;
    return matchesSearch && matchesCompany;
  });

  // Active Selected Invoice Claim
  const activeInvoiceClaim = filteredInvoices.find(c => c.id === selectedInvoiceId) || (filteredInvoices.length > 0 ? filteredInvoices[0] : null);

  useEffect(() => {
    if (activeInvoiceClaim) {
      setInputInvoiceNo(activeInvoiceClaim.invoiceNumber || `INV-${activeInvoiceClaim.code}`);
      const evLimit = Math.round((activeInvoiceClaim.claimedProgress / 100) * activeInvoiceClaim.numericValue);
      setInputInvoiceAmount(activeInvoiceClaim.invoiceAmount || evLimit);
    } else {
      setInputInvoiceNo(
- );
      setInputInvoiceAmount(
- );
    }
  }, [activeInvoiceClaim?.id]);

  const handleResetDemoInvoices = () => {
    const demoInvoices: Claim[] = [
      {
        id:
- ,
        code:
- ,
        company:
- ,
        companyId:
- ,
        wbs:
- ,
        claimedValue:
- ,
        numericValue: 1250000,
        submittedBy:
- ,
        submissionDate:
- ,
        previousProgress: 45.0,
        claimedProgress: 62.5,
        priority:
- ,
        dueDate:
- ,
        previousNotes:
- ,
        deliverables: [
          { id:
- , description:
- , weight:
- , status:
- },
          { id:
- }
        ],
        documents: [
          { id:
- , size:
- , uploadedAt:
- }
        ],
        auditLog: [
          { id:
- , user:
- , action:
- , change:
- , timestamp:
- }
        ],
        auditorNotes:
- ,
        status:
- ,
        invoiceNumber:
- ,
        invoiceAmount: 781250
      },
      {
        id:
- ,
        numericValue: 450000,
        submittedBy:
- ,
        previousProgress: 20.0,
        claimedProgress: 35.0,
        priority:
- ,
        invoiceAmount: 157500
      },
      {
        id:
- ,
        numericValue: 890000,
        submittedBy:
- ,
        previousProgress: 55.0,
        claimedProgress: 72.0,
        priority:
- ,
        invoiceAmount: 640800,
        paymentToken:
- ,
        numericValue: 3400000,
        submittedBy:
- ,
        previousProgress: 70.0,
        claimedProgress: 85.0,
        priority:
- ,
        invoiceAmount: 2890000
      }
    ];

    setClaims(demoInvoices);
    localStorage.setItem(
- , JSON.stringify(demoInvoices));
    showToast(
- );
  };

  // Financial Stats Calculations with Company Isolation
  const companyClaims = claims.filter(c => !isSubsidiary || c.companyId === currentUser.companyId);

  const totalContractInvoiced = companyClaims
    .filter(c => c.invoiceAmount)
    .reduce((sum, c) => sum + (c.invoiceAmount || 0), 0);

  const totalAuthorizedPaid = companyClaims
    .filter(c => c.status ===
- && c.invoiceAmount)
    .reduce((sum, c) => sum + (c.invoiceAmount || 0), 0);

  const totalPendingAudit = companyClaims
    .filter(c => (c.status ===
- || c.status ===
- ) && c.invoiceAmount)
    .reduce((sum, c) => sum + (c.invoiceAmount || 0), 0);

  // Pre-approve selected invoice (NOC Financial Auditor)
  const handlePreApproveInvoice = (claimId: string) => {
    const claim = claims.find(c => c.id === claimId);
    const updated = claims.map(c => {
      if (c.id === claimId) {
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: currentUser?.name ||
- ,
          action: isRtl ?
- ,
          change: isRtl
            ?
- ,
          timestamp: new Date().toLocaleString(
- ,
          })
        };
        return {
          ...c,
          status:
- as const,
          auditLog: [newLog, ...c.auditLog]
        };
      }
      return c;
    });

    setClaims(updated);
    setMakeChangesState(updated);
    showToast(isRtl ?
- );
    if (claim && addNotification) {
      addNotification(
        isRtl ?
- ,
        isRtl 
          ? `تمت الموافقة المسبقة على الفاتورة التجارية للمطالبة ${claim.code}. في انتظار الإفراج النهائي عن الأموال.`
          : `Commercial invoice for claim ${claim.code} has been pre-approved. Awaiting final fund release.`,
- );
    }
  };

  // Helper to set state and write to localStorage
  const setMakeChangesState = (updatedClaims: Claim[]) => {
    localStorage.setItem(
- , JSON.stringify(updatedClaims));
  };

  // Final Release payment (NOC Head of Accounts)
  const handleReleasePayment = (claimId: string) => {
    const secureToken = `NOC-AUTH-${currentUser?.companyId ||
- }-${Math.floor(1000 + Math.random() * 9000)}-${claimId.substring(claimId.lastIndexOf(
- ) + 1)}`;
    const claim = claims.find(c => c.id === claimId);
    
    const updated = claims.map(c => {
      if (c.id === claimId) {
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: currentUser?.name ||
- ,
          change: isRtl
            ? `تم التوقيع والموافقة على تسييل الأموال السيادية للمشروع. تم إنشاء رمز الدفع الإلكتروني الآمن للمنظومة المالية: ${secureToken}`
            : `Sovereign fund release signed. NOC Secure Central ERP Payment Token generated: ${secureToken}`,
          timestamp: new Date().toLocaleString(
- as const,
          paymentToken: secureToken,
          auditLog: [newLog, ...c.auditLog]
        };
      }
      return c;
    });

    setClaims(updated);
    setMakeChangesState(updated);
    showToast(isRtl ?
- ,
        isRtl 
          ? `تم الإفراج النهائي عن أموال المطالبة رقم ${claim.code}. تم إنشاء رمز الدفع الإلكتروني الموثق للمنظومة المالية.`
          : `Final funds released for claim ${claim.code}. Secure ERP Payment Token generated.`,
- );
    }
  };

  // Submit / Release Commercial Invoice to NOC (from Invoice Sector)
  const handleReleaseInvoice = (claimId: string, invoiceNo: string, amount: number) => {
    const claim = claims.find(c => c.id === claimId);
    const updated = claims.map(c => {
      if (c.id === claimId) {
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: currentUser?.name ||
- ,
          change: isRtl
            ? `تم تقديم وتسجيل الفاتورة التجارية ${invoiceNo} بمبلغ €${amount.toLocaleString()} (تم التحقق والمطابقة للامتثال بقيمة العمل المنجز EVM)`
            : `Commercial invoice ${invoiceNo} registered for €${amount.toLocaleString()} (EVM Compliance Verified)`,
          timestamp: new Date().toLocaleString(
- , day:
- , hour:
- })
        };
        return {
          ...c,
          status:
- as const,
          invoiceNumber: invoiceNo,
          invoiceAmount: amount,
          auditLog: [newLog, ...c.auditLog]
        };
      }
      return c;
    });

    setClaims(updated);
    setMakeChangesState(updated);
    showToast(isRtl ? `تم تسجيل وتقديم الفاتورة التجارية رقم ${invoiceNo} رسمياً إلى الإدارة المالية المركزية للمؤسسة!` : `Invoice ${invoiceNo} officially released & submitted to NOC Central Finance!`,
- ,
        isRtl 
          ? `تم تقديم الفاتورة التجارية ${invoiceNo} للمطالبة رقم ${claim.code} رسمياً للتدقيق المالي.`
          : `Invoice ${invoiceNo} for claim ${claim.code} has been officially submitted for audit.`,
- >
          {isRtl ?
- }
        </span>
      );
    }
    switch (status) {
      case
- }
          </span>
        );
      case
- }`} />
              <input
                type=
- value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isRtl ?
- }`
                        :
- >
                          {hasInvoice ? `€${(claim.invoiceAmount || 0).toLocaleString()}` : (isRtl ?
- >
                    {isRtl ?
- } {activeInvoiceClaim.submittedBy} • {isRtl ?
- }
                          </label>
                          <input
                            type=
- value={inputInvoiceNo}
                            onChange={(e) => setInputInvoiceNo(e.target.value)}
                            placeholder=
- }`}>€</span>
                            <input
                              type=
- value={inputInvoiceAmount}
                              onChange={(e) => setInputInvoiceAmount(e.target.value ===
- }`}
                            />
                          </div>
                          
                          {/* Real-time EV limit and overrun warning */}
                          {inputInvoiceAmount !==
- }
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!inputInvoiceNo) {
                            showToast(isRtl ?
- );
                            return;
                          }
                          if (!inputInvoiceAmount || Number(inputInvoiceAmount) <= 0) {
                            showToast(isRtl ?
- );
                            return;
                          }
                          const evLimit = (activeInvoiceClaim.claimedProgress / 100) * activeInvoiceClaim.numericValue;
                          if (Number(inputInvoiceAmount) > evLimit) {
                            showToast(isRtl ? `تتجاوز قيمة الفاتورة قيمة الإنجاز الفني المعتمدة البالغة €${Math.round(evLimit).toLocaleString()}!` : `Invoice exceeds technically certified Earned Value limit of €${Math.round(evLimit).toLocaleString()}!`,
- );
                            return;
                          }
                          setConfirmModalType(
- >
                      {isRtl 
                        ?
- >
                    {activeInvoiceClaim.status ===
- >
                          {activeInvoiceClaim.paymentToken}
                        </p>
                      </div>
                    ) : activeInvoiceClaim.status ===
- >
                        {activeRole ===
- ? (
                          <button
                            onClick={() => {
                              setConfirmModalType(
- >
                            ⏱ {isRtl ?
- }
                          </div>
                        )}
                      </div>
                    ) : activeInvoiceClaim.status ===
- >{doc.size} • {isRtl ?
- : confirmModalType ===
- } flex items-center gap-3 ${isRtl ?
- >
                  {confirmModalType ===
- )
                    : confirmModalType ===
- ) 
                    : (isRtl ?
- }`}>
                    €{(confirmModalType ===
- }</span>
                      </div>
                      {confirmModalType ===
- }`}>
                  <input
                    type=
- }`}>
                    {confirmModalType ===
- )
                      : (isRtl ?
- }
              </button>

              <button
                onClick={() => {
                  if (!confirmChecked) return;
                  setShowConfirmModal(false);
                  if (confirmModalType ===
- ) {
                    handleReleaseInvoice(activeInvoiceClaim.id, inputInvoiceNo, Number(inputInvoiceAmount));
                  } else if (confirmModalType ===
- )
                  : confirmModalType ===
- )
                  : (isRtl ?
- ("all");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState
- (null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const [inputInvoiceNo, setInputInvoiceNo] = useState("");
  const [inputInvoiceAmount, setInputInvoiceAmount] = useState
- ("");

  const [selectedInvoiceId, setSelectedInvoiceId] = useState
- );
      case "pending_head_of_accounts_approval":
        return (
- );
      case "pending_financial_audit":
        return (
- );
      default:
        return (
- €
- ) : activeInvoiceClaim.status === "pending_financial_audit" ? (
- ) : activeInvoiceClaim.status === "pending_head_of_accounts_approval" ? (
- أؤكد أن الرقم المرجعي
- مسجل في النظام المالي الرسمي للشركة.
- I confirm that the reference ID
- is registered on our official ERP system.
- أشهد بأن قيمة المطالبة
- لا تتعدى القيمة المكتسبة المقابلة للإنجاز الفني المعتمد.
- I certify that this commercial billing of
- is within the technically certified EV Limit.
- أؤكد تطابق نسبة الإنجاز الفني للـ PMO البالغة
- مع منجزات الإنجاز الميدانية الحقيقية.
- I confirm that technical PMO progress certification of
- matches real physical deliverables.
- ./ThemeToggle
- ./NocLogo
- ", lang =
- }: NocHeaderProps) {
  const isNoc = tenantId === 'NOC_HQ';
  const tenant = TENANT_CONFIG[tenantId] || TENANT_CONFIG['NOC_HQ'];
  const nocTenant = TENANT_CONFIG['NOC_HQ'];
  const { theme } = useTheme();
  const isRtl = lang ===
- ;

  const getCompanyTranslation = (name: string) => {
    if (!isRtl) return name;
    const mapping: Record<string, string> = {
- };
    return mapping[name] || name;
  };

  const getShortNameTranslation = (name?: string) => {
    if (!name) return
- ;
    if (!isRtl) return name;
    const mapping: Record<string, string> = {
- >
              {!isNoc ? getCompanyTranslation(tenant.name) : getCompanyTranslation(
- >
              {!isNoc ? (isRtl ? `${getShortNameTranslation(tenant.shortName)} (عقدة مصرحة)` : `${tenant.shortName} Authorized Node`) : (isRtl ?
- w-10 h-10
- w-full h-full object-contain
- no-referrer
- R
- A
- C
- I
- ";
}

const INITIAL_RACI_CELLS: RACICell[] = [
  // Task 1: Claim Draft & Submission
  { id:
- , task:
- , value:
- },
  { id:
- },

  // Task 2: Physical Work Technical Audit
  { id:
- },

  // Task 3: Technical Approval Sign-off
  { id:
- },

  // Task 4: Commercial Invoice Generation
  { id:
- },

  // Task 5: Central Finance Compliance Auditing
  { id:
- },

  // Task 6: ERP Payout & Budget Lock
  { id:
- },
];

const TASK_TRANSLATIONS: Record<string, { title: string; desc: string }> = {
- : {
    title:
- ,
    desc:
- },
- }
};

const EN_TASK_DESCRIPTIONS: Record<string, string> = {
- };

const ROLES_METADATA_AR = [
  { id:
- , label:
- , desc:
- }
];

const ROLES_METADATA_EN = [
  { id:
- }
];

export default function RACIMatrix({ 
  showToast, 
  lang =
- }: { 
  showToast: (text: string, type?:
- ) => void;
  lang?: Lang;
}) {
  const [cells, setCells] = useState<RACICell[]>(INITIAL_RACI_CELLS);
  const [selectedTask, setSelectedTask] = useState<string>(
- );

  const isRtl = lang ===
- ;
  const rolesMetadata = isRtl ? ROLES_METADATA_AR : ROLES_METADATA_EN;

  const toggleCell = (role: string, task: string) => {
    const values: Array<
- > = [
- ];
    
    setCells(prev => prev.map(cell => {
      if (cell.role === role && cell.task === task) {
        const currIndex = values.indexOf(cell.value);
        const nextValue = values[(currIndex + 1) % values.length];
        return { ...cell, value: nextValue };
      }
      return cell;
    }));
    showToast(
      isRtl ?
- );
  };

  const resetRaci = () => {
    const message = isRtl 
      ?
- ;
    if (window.confirm(message)) {
      setCells(INITIAL_RACI_CELLS);
      showToast(
        isRtl ?
- } font-sans w-56 text-slate-500 dark:text-slate-400`}>{isRtl ?
- } text-xs text-slate-900 dark:text-slate-100 font-bold flex items-center gap-1.5 ${isRtl ?
- :
                                  val ===
- }`}
                              >
                                {val ||
- >
                  {rolesMetadata.map(role => {
                    const val = cells.find(c => c.role === role.id && c.task === selectedTask)?.value ||
- :
                          val ===
- }`}>
                          {val ? (
                            val ===
- ) :
                            val ===
- )
                          ) : (isRtl ?
- (INITIAL_RACI_CELLS);
  const [selectedTask, setSelectedTask] = useState
- c.role === role.id && c.task === task);
                          const val = cell ? cell.value : "";
                          return (
- c.role === role.id && c.task === selectedTask)?.value || "";
                    return (
- ");
  const [typeFilter, setTypeFilter] = useState<
- );
  const [projectFilter, setProjectFilter] = useState<
- | string>(
- );
  const [sortBy, setSortBy] = useState<
- );
  
  // Custom File Filing (Upload) Form States
  const [isFilingOpen, setIsFilingOpen] = useState(false);
  const [newDocName, setNewDocName] = useState(
- );
  const [newDocType, setNewDocType] = useState<
- );
  const [targetClaimId, setTargetClaimId] = useState(
- );

  // Retrieve unique companies for filtering
  const companies = Array.from(new Set(claims.map(c => c.company)));

  // Consolidate all documents across all claims
  const allDocuments = claims.flatMap(c => 
    c.documents.map(doc => ({
      ...doc,
      claimId: c.id,
      projectCode: c.code,
      projectTitle: c.title,
      companyName: c.company,
      claimStatus: c.status
    }))
  );

  // Helper function to handle direct file download
  const handleDirectDownload = (doc: Document, company: string, code: string, title: string) => {
    let content =
- ;
    let contentType =
- ;
    
    if (doc.type ===
- ) {
      content = `%PDF-1.4\n` +
                `% NOC LIBYA SECURE SOVEREIGN FILE SYSTEM\n` +
                `% Document: ${doc.name}\n` +
                `% Timestamp: ${doc.uploadedAt}\n` +
                `% Class: OFFICIAL SOVEREIGN RECORD\n` +
                `------------------------------------------------------------------------\n` +
                `         NATIONAL OIL CORPORATION LIBYA - SOVEREIGN PMO\n` +
                `------------------------------------------------------------------------\n` +
                `Document Title: ${doc.name.replace(
- )}\n` +
                `Associated Subsidiary: ${company}\n` +
                `Associated Project Reference: ${code} - ${title}\n` +
                `Cryptographic Signature: APPROVED BY CENTRAL AUDITOR VIA BLOCKCHAIN LEDGER\n` +
                `Timestamp of Record: ${doc.uploadedAt} (Sovereign Tripoli Time)\n` +
                `------------------------------------------------------------------------\n` +
                `Verification Details:\n` +
                `We hereby certify that all technical milestone conditions are completed and verified.\n` +
                `All supporting physical photo evidence matches structural blueprints.\n` +
                `Sign-off Status: TECHNICAL VALIDATION CLEARED (SIGNED ELECTRONICALLY)\n` +
                `------------------------------------------------------------------------\n`;
      contentType =
- ;
    } else if (doc.type ===
- ) {
      content = `National Oil Corporation Libya - Progress Measurement Ledger Sheet\n` +
                `Document Name,${doc.name}\n` +
                `Registered Date,${doc.uploadedAt}\n` +
                `Operator,${company}\n` +
                `Project Reference,${code}\n` +
                `Project Description,${title}\n` +
                `Status,Verified Earned Value Ledger\n\n` +
                `Item,WBS Code,Deliverable/Activity Description,Budget Weight,Contract Value,Verified Progress,Earned Value\n` +
                `1,1.0,Electrical and Hookups Wiring Hookups,10.0%,€125000,100%,€125000\n` +
                `2,2.0,Pressure Test Certification,5.0%,€62500,100%,€62500\n` +
                `3,3.0,Site Cleanup & Demobilization,2.5%,€31250,0%,€0\n` +
                `TOTAL,,,17.5%,€218750,,€187500\n`;
      contentType =
- ;
    } else {
      content = `<svg xmlns=
- >` +
                `<rect width=
- E</text>` +
                `<text x=
- >ELEVATION: 42.1m</text>` +
                `<text x=
- font-weight=
- text-anchor=
- >NATIONAL OIL CORPORATION EVIDENCE PHOTO</text>` +
                `</svg>`;
      contentType =
- ;
    }
    
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement(
- );
    a.href = doc.url || url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(isRtl ? `بدء تحميل الملف:
- ` : `File download started:
- `,
- );
  };

  // Handle direct file upload / registry submission
  const handleFilingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !targetClaimId) {
      showToast(isRtl ?
- );
      return;
    }

    const extension = newDocType ===
- : newDocType ===
- ;
    const fullName = newDocName.trim().endsWith(extension) ? newDocName.trim() : `${newDocName.trim()}${extension}`;
    const cleanSize = `${(Math.random() * 2.8 + 0.4).toFixed(1)} MB`;
    
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name: fullName,
      size: cleanSize,
      uploadedAt: new Date().toLocaleTimeString(
- }),
      type: newDocType,
      url: newDocType ===
- : undefined,
    };

    // Update target claim with newly uploaded file
    const updated = claims.map(c => {
      if (c.id === targetClaimId) {
        return {
          ...c,
          documents: [...c.documents, newDoc],
          auditLog: [
            {
              id: `log-${Date.now()}`,
              user: currentUser?.name ||
- ,
              action: isRtl ?
- ,
              change: isRtl 
                ? `تم إرفاق مستند ${fullName} إلى مجلد إثباتات المشروع عبر السجل السيادي للمستندات`
                : `Appended file ${fullName} to project evidence folder via Sovereign Document Registry`,
              timestamp: new Date().toLocaleString(
- , { month:
- })
            },
            ...c.auditLog
          ]
        };
      }
      return c;
    });

    setClaims(updated);
    setNewDocName(
- );
    setIsFilingOpen(false);
    showToast(isRtl ? `تم تسجيل وإرفاق المستند
- بنجاح في أرشيف المشروع السيادي!` : `Successfully uploaded and filed
- into project archives!`,
- );
  };

  // Parse and calculate stats
  const totalCount = allDocuments.length;
  const pdfCount = allDocuments.filter(d => d.type ===
- ).length;
  const xlsxCount = allDocuments.filter(d => d.type ===
- ).length;
  const imageCount = allDocuments.filter(d => d.type ===
- ).length;

  // Filter and sort files
  const filteredDocuments = allDocuments
    .filter(doc => {
      const matchSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter ===
- || doc.type === typeFilter;
      const matchProject = projectFilter ===
- || doc.companyName === projectFilter;
      return matchSearch && matchType && matchProject;
    })
    .sort((a, b) => {
      if (sortBy ===
- ) {
        return a.name.localeCompare(b.name);
      }
      if (sortBy ===
- ) {
        // Simple MB/KB parsing
        const sizeA = parseFloat(a.size.replace(/[^\d.]/g,
- )) * (a.size.includes(
- ) ? 0.001 : 1);
        const sizeB = parseFloat(b.size.replace(/[^\d.]/g,
- )) * (b.size.includes(
- }</option>
                </select>
              </div>
 
              <button
                type=
- }`} />
          <input
            type=
- }`}>
            <button
              onClick={() => setTypeFilter(
- }`}
            >
              {isRtl ?
- }
            </button>
            <button
              onClick={() => setTypeFilter(
- >
            <option value=
- }</option>
            <option value=
- }`}>
                      {isRtl ?
- :
                            doc.type ===
- }`}>
                            {doc.type ===
- }{doc.id} • {isRtl ?
- title={isRtl ?
- ("ALL");
  const [projectFilter, setProjectFilter] = useState
- ("ALL");
  const [sortBy, setSortBy] = useState
- ("newest");
  
  // Custom File Filing (Upload) Form States
  const [isFilingOpen, setIsFilingOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState
- ` +
                `
- :
                             doc.type === "XLSX" ?
- light
- dark
- undefined
- noc-theme
- (prefers-color-scheme: dark)
- useTheme must be used within a ThemeProvider
- motion/react
- }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isRtl = lang ===
- ;

  return (
    <div
      id=
- aria-label={isRtl ? (theme === 'light' ? 'التحويل للوضع الداكن' : 'التحويل للوضع المضيء') : `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={isRtl ? (theme === 'light' ? 'التحويل للوضع الداكن' : 'التحويل للوضع المضيء') : `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <AnimatePresence mode=
- initial={false}>
          {theme === 'light' ? (
            <motion.div
              key=
- APPROVED
- PENDING
- REJECTED
- ');
  const [wbs, setWbs] = useState(
- );
  const [progress, setProgress] = useState(50);
  const [status, setStatus] = useState<
- );

  // List of mock items
  const [items, setItems] = useState<MockItem[]>([
    { id:
- , wbs:
- , facility:
- , progress: 100, status:
- , date:
- },
    { id:
- , progress: 45, status:
- , progress: 80, status:
- , progress: 15, status:
- },
  ]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facility || !wbs) return;

    const newItem: MockItem = {
      id: Date.now().toString(),
      wbs,
      facility,
      progress: Number(progress),
      status,
      date: new Date().toISOString().split(
- )[0]
    };

    setItems([newItem, ...items]);
    setFacility(
- );
    setProgress(50);
    setStatus(
- :
                                item.status ===
- :
                          item.status ===
- :
                            item.status ===
- }`} />
                          {isRtl ? (item.status ===
- : item.status ===
- :
                    selectedItem.status ===
- :
                          selectedItem.status ===
- (null);
  
  // Mock form state
  const [facility, setFacility] = useState('');
  const [wbs, setWbs] = useState('');
  const [progress, setProgress] = useState(50);
  const [status, setStatus] = useState
- ('PENDING');

  // List of mock items
  const [items, setItems] = useState
- VIEW_DASHBOARD
- View Dashboard
- Access read-only system telemetry and dashboards
- MANAGE_USERS
- Manage Users
- Create, update, and suspend user accounts
- MANAGE_ROLES
- Manage Roles
- Modify RBAC roles and permission mappings
- VIEW_AUDIT_LOGS
- View Audit Logs
- Access immutable security and access logs
- CLEAR_ALARMS
- Clear Alarms
- Acknowledge and clear network/security alarms
- MODIFY_NETWORK_CONFIG
- Modify Network Config
- Change active platform routing and firewall rules
- RESTART_SERVICES
- Restart Services
- Restart critical platform microservices
- APPROVE_CLAIMS
- Approve Claims
- Financial and technical approval authority
- r1
- Super Admin
- Unrestricted platform access
- r2
- NOC Central HQ
- HQ Auditors & Finance
- r3
- Subsidiary PM
- Project Management
- r4
- Subsidiary Finance
- Subsidiary Financial Officers
- u1
- tariq.auditor
- tariq@noc.ly
- Tariq Auditor
- PMO Technical
- 2026-07-10T11:22:00Z
- 2024-01-15T08:00:00Z
- u2
- k.waha
- khalid@waha.ly
- Khalid PM
- Waha Projects
- 2026-07-10T09:15:00Z
- 2025-03-10T10:30:00Z
- u3
- s.agoco
- salem@agoco.ly
- Salem Finance
- AGOCO Finance
- 2026-06-25T14:45:00Z
- 2025-06-01T09:00:00Z
- u4
- admin.sys
- admin@noc.ly
- System Admin
- IT Security
- 2026-07-09T16:20:00Z
- 2025-11-20T11:00:00Z
- a1
- 2026-07-10T08:15:22Z
- SUSPEND_USER
- Suspended due to inactivity policy
- 192.168.1.45
- a2
- 2026-07-09T14:10:05Z
- UPDATE_ROLE
- Added CLEAR_ALARMS permission to L2 Support Engineer
- a3
- 2026-07-08T09:05:11Z
- ASSIGN_ROLE
- Assigned NOC Central HQ role to tariq.auditor
- 10.0.5.12
- a4
- 2026-07-01T10:00:00Z
- CREATE_USER
- Provisioned new Subsidiary PM account for Waha
- users
- roles
- audit
- blueprint
- ", email:
- });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped = data.map((d: any) => {
          let roleId =
- ;
          if (d.email.includes(
- )) roleId =
- ;
          else if (d.email.includes(
- ;
          else if (d.username.toLowerCase().includes(
- ) || d.email.includes(
- ;
          
          return {
            id: d.id,
            username: d.username,
            email: d.email,
            fullName: d.username, // mapping username as fullname
            department: d.company_name || 'N/A',
            roles: [roleId],
            status: d.status,
            createdAt: d.created_at,
            lastLogin:
- };
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
          actorId: d.actor_id,
          actorName: d.actor_name,
          targetId: d.target_id,
          action: d.action,
          details: d.details,
          ipAddress: d.ip_address || '127.0.0.1'
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
    
    const newStatus = user.status ===
- ;
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        showToast(isRtl ? `تم تغيير حالة المستخدم إلى ${newStatus}` : `User status changed to ${newStatus}`,
- );
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error ||
- );
      }
    } catch (e: any) {
      showToast(e.message ||
- s corporate email.", "info");
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
      const res = await fetch(
- },
        body: JSON.stringify({
          email: newUser.email,
          username: newUser.fullName,
          companyId: newUser.company,
          password:
- )
}

Table users {
  id UUID [pk]
  company_id UUID [ref: > companies.id]
  username VARCHAR(50) [unique]
  email VARCHAR(255) [unique]
  password_hash VARCHAR(255)
  status ENUM(
- }`}
                            title={user.status ===
- }
                          >
                            {user.status ===
- w-3.5 h-3.5
- }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUDIT TAB */}
        {activeTab ===
- >NOC Central Headquarters</option>
                  <option value=
- >Waha Oil Company</option>
                  <option value=
- >Arabian Gulf Oil Company (AGOCO)</option>
                  <option value=
- >Zallaf Libya</option>
                  <option value=
- >NOC Central HQ (Auditors/Accounts)</option>
                  <option value=
- >Subsidiary Project Manager</option>
                  <option value=
- ("blueprint");
  
  const [users, setUsers] = useState
- ([]);
  const [roles, setRoles] = useState(MOCK_ROLES);
  const [auditLogs, setAuditLogs] = useState
- Technical Specification: IAM Module
- This module acts as the central source of truth for platform authorities, ensuring strict Separation of Duties (SoD) between
- NOC Central Headquarters
- (Auditing/Finance) and
- Operating Subsidiaries
- (Project Management/Invoicing).
- 1. Architecture Overview & Security Integrity
- Token & Verification Security:
- Passwords are hashed using argon2/bcrypt before persistence. Reset tokens are stored in the database as salted hashes (never raw text) to prevent database leak exploitations.
- Global Session Kill Switch:
- version
- integer on the user record increments upon suspension, role change, or password reset. Edge microservices validate the JWT version against a high-performance Redis cache, instantly invalidating active sessions across all nodes without waiting for token expiry.
- Multi-Tenant Scope:
- Users are strictly bound to their
- company_id
- (Tenant), ensuring data sovereignty. A Waha PM cannot view AGOCO portfolios.
- 2. Database Schema (Relational ERD)
- 3. API Specification (Express/TypeScript Endpoints)
- - Initiates unauthenticated reset flow. Mails secure short-lived token.
- - Validates token_hash and applies new password_hash. Increments user version.
- GET
- - List multi-tenant users.
- - Provision user with explicit role and company scopes. Payload:
- - Admin manual override. Flags account & dispatches reset link.
- r.id === rId);
                            return (
- SYSTEM
- Arabian Gulf Oil Company (AGOCO)
- NOC Central HQ (Auditors/Accounts)
- ");
  const [newPassword, setNewPassword] = useState(
- );
  const [confirmPassword, setConfirmPassword] = useState(
- );
  
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast(isRtl ?
- );
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(isRtl ?
- );
      return;
    }
    if (newPassword.length < 8) {
      showToast(isRtl ?
- );
      return;
    }
    
    // Simulate API Call
    showToast(isRtl ?
- );
    setCurrentPassword(
- );
    setNewPassword(
- );
    setConfirmPassword(
- }
              </label>
              <input 
                type=
- >
              <button
                type=
- not_started
- in_progress
- completed
- Engineering
- Procurement
- Construction
- Commissioning
- waha-1
- 1.0
- Wellhead Engineering & Design Review
- 2026-06-01
- 2026-06-20
- waha-1-1
- 1.1
- P&ID Diagrams and Flow Sheets Sign-off
- 2026-06-15
- waha-2
- 2.0
- Civil Foundation Work & Excavation
- Contractor Team A
- 2026-06-21
- 2026-07-15
- waha-2-1
- 2.1
- Borehole Soil Mechanics & Concrete Pouring
- 2026-06-22
- 2026-07-05
- waha-2-2
- 2.2
- Reinforced Rebar Grid Installation
- 2026-07-01
- waha-3
- 3.0
- Mechanical Assembly & Valves Piping
- Piping Specialists Ltd
- 2026-07-16
- 2026-08-30
- waha-3-1
- 3.1
- High-Pressure Valve Mounting
- 2026-08-10
- waha-3-2
- 3.2
- Flange Alignment & Gasket Seal Verification
- 2026-08-11
- waha-4
- 4.0
- Offshore Gas Lift Compression Skid Fabrication
- Eng. Khaled Belhaj
- 2026-10-15
- waha-4-1
- 4.1
- Compressor Skid Mainframe & Turbine Procurement
- 2026-08-01
- waha-4-2
- 4.2
- Hydraulic Integration & NDT Testing
- QA/QC Contractors
- 2026-08-02
- waha-milestone
- 5.0
- Pre-commissioning Readiness Review
- NOC PMO Auditor
- 2026-09-01
- agoco-1
- Pipeline Route Surveying & Geotechnical Analysis
- 2026-05-10
- agoco-1-1
- Differential GPS Survey Coordinates Mapping
- 2026-05-25
- agoco-2
- Trenching & Right-of-Way (ROW) Clearing
- AGOCO Heavy Machinery
- 2026-06-16
- 2026-07-20
- agoco-3
- Pipeline Welding & Joint Coating
- Welding Certified Crew
- 2026-07-21
- 2026-09-10
- agoco-4
- Sarir Field Water Injection System Upgrade
- Eng. Mustafa Al-Majri
- 2026-11-30
- agoco-4-1
- Intake Pipeline Laying & Civil Foundations
- Sarir Civil Team
- 2026-09-15
- agoco-4-2
- Flow Control Valve Instrumentation Calibration
- 2026-09-16
- zallaf-1
- Erawin Field Substation Foundations
- 2026-04-01
- 2026-05-15
- zallaf-2
- Electrical Control Panel Installations
- Substation Electricians
- 2026-05-16
- 2026-07-30
- zallaf-2-1
- PLC Wiring & Telemetry Uplink Setup
- Telemetry Techs
- zallaf-3
- Shaddad Field Early Production Facility (EPF)
- Eng. Reda Al-Ghariani
- 2026-03-01
- zallaf-3-1
- Separator Vessel Hot Commissioning & Logs
- zallaf-3-2
- Emergency Shut-down (ESD) Trip Loops Check
- EPF Safety Systems
- 2026-07-02
- mell-1
- Gas Plant Shutdown & Purging Operations
- 2026-05-01
- 2026-05-20
- mell-2
- Turbine Overhaul & Mechanical Refurbishment
- OEM Turbine Engineers
- 2026-05-21
- mell-3
- Instrumentation & Loop Calibrations
- Mellitah Tech Team
- mell-4
- Bahr Essalam Gas Field Deck Refurbishment
- Eng. Younis Al-Fitouri
- 2026-06-10
- 2026-11-10
- mell-4-1
- Sub-sea Scaffolding System Certification
- Platform Safety Officer
- 2026-06-30
- mell-4-2
- Deck C Structural Sandblasting & Anti-Corrosion Primer
- مراجعة وهندسة وتصميم رأس البئر
- اعتماد مخططات الأنابيب والأجهزة ورسومات التدفق
- الأعمال المدنية للمباني والحفر والأساسات
- ميكانيكا تربة حفر الآبار وصب الخرسانة
- تركيب شبكة حديد التسليح المقوى
- التجميع الميكانيكي وتمديد أنابيب الصمامات
- تركيب صمامات الضغط العالي
- محاذاة الشفاه والتحقق من حشيات الإحكام
- تصنيع وحدة كبس الغاز الرفع البحري
- توريد التوربينات والإطار الرئيسي لوحدة المكبس
- التكامل الهيدروليكي والاختبارات غير التدميرية (NDT)
- مراجعة الجاهزية قبل التشغيل التجريبي
- مسح مسار خط الأنابيب والتحليل الجيوتقني
- رسم خرائط إحداثيات المسح باستخدام الـ GPS التفاضلي
- حفر الخنادق وتطهير مسار حق المرور (ROW)
- لحام خطوط الأنابيب وطلاء الوصلات
- ترقية نظام حقن المياه في حقل السرير
- مد خط أنابيب المأخذ والأساسات المدنية
- معايرة أجهزة صمامات التحكم في التدفق
- أساسات المحطة الفرعية لحقل إيروين
- تركيبات لوحات التحكم الكهربائية
- توصيل الـ PLC وإعداد اتصال القياس عن بعد
- تسهيلات الإنتاج المبكر (EPF) لحقل شداد
- التشغيل التجريبي الساخن وسجلات وعاء الفاصل
- فحص حلقات الإغلاق في حالات الطوارئ (ESD)
- عمليات إيقاف وتطهير مصنع الغاز
- العمرة الشاملة للتوربينات والتجديد الميكانيكي
- معايرة الأجهزة وحلقات التحكم
- تجديد منصة حقل بحر السلام للغاز
- اعتماد نظام السقالات تحت سطح البحر
- التنظيف بالرمل الهيكلي للمنصة ج والطلاء المضاد للتآكل
- Initiating Process Group - Project Charter & Alignment
- مجموعة عمليات البدء - ميثاق المشروع والمواءمة
- Planning Process Group - Detailed Engineering, Scope & Risk Analysis
- مجموعة عمليات التخطيط - الهندسة التفصيلية والنطاق وتحليل المخاطر
- Executing Process Group - Procurement, Fabrication & Field Construction
- مجموعة عمليات التنفيذ - المشتريات والتصنيع والإنشاءات الميدانية
- Monitoring & Controlling Process Group - Quality Audits & HSE Inspections
- مجموعة عمليات المراقبة والتحكم - تدقيق الجودة وفحص السلامة والبيئة
- Closing Process Group - As-Builts Handover & Final Balance Settlement
- مجموعة عمليات الإغلاق - تسليم المخططات المنفذة وتصفية الحسابات النهائية
- Milestone: Final Sovereign Asset Acceptance
- حدث هام: القبول النهائي للأصول السيادية
- Wellhead Revamp
- تطوير وصيانة رؤوس الآبار
- Route Surveying & Piping
- مسح المسار وتمديد الأنابيب
- Erawin Field Substation
- المحطة الفرعية لحقل إيروين
- Gas Plant Overhaul
- العمرة الشاملة لمصنع الغاز
- المهندس طارق الفاسي
- فريق المقاول (أ)
- شركة اختصاصيي الأنابيب المحدودة
- المهندس خالد بلحاج
- مقاولو ضبط وتوكيد الجودة
- مدقق مكتب إدارة المشاريع بالمؤسسة
- المهندس سالم العبيدي
- الآليات الثقيلة لشركة الخليج
- فريق اللحام المعتمد
- المهندس مصطفى المجري
- الفريق المدني بالسرير
- المهندس مفتاح الورفلي
- كهربائيو المحطة الفرعية
- فنيو القياس والتحكم عن بعد
- المهندس رضا الغرياني
- أنظمة السلامة لتسهيلات الإنتاج المبكر
- المهندس علي الزوي
- مهندسو الشركة المصنعة للتوربينات
- الفريق الفني لشركة مليتة
- المهندس يونس الفيتوري
- مسؤول السلامة على المنصة
- noc_eppm_projects_list_pmi
- Error loading projectList
- ");
  const [newProjTitle, setNewProjTitle] = useState(
- );
  const [newProjCompany, setNewProjCompany] = useState(
- );
  const [newProjCustomCompany, setNewProjCustomCompany] = useState(
- );
  const [newProjBudget, setNewProjBudget] = useState(
- );
  const [newProjTemplate, setNewProjTemplate] = useState<
- );
  const [newProjStartDate, setNewProjStartDate] = useState(
- );
  const [newProjEndDate, setNewProjEndDate] = useState(
- );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return isSubsidiary ? currentUser.companyId :
- ;
  });

  // Load WBS from localStorage with fallback to enriched presets
  const [wbsData, setWbsData] = useState<Record<string, WBSNode[]>>(() => {
    const saved = localStorage.getItem(
- , e);
      }
    }
    return INITIAL_PROJECT_WBS;
  });

  // Sync back to localStorage
  useEffect(() => {
    localStorage.setItem(
- , JSON.stringify(wbsData));
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
      return d.toISOString().split(
- )[0];
    } catch {
      return dateStr;
    }
  };

  const handleCreateProjectPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjCode.trim()) {
      showToast(
- );
      return;
    }
    if (!newProjTitle.trim()) {
      showToast(
- );
      return;
    }
    
    const finalCompany = newProjCompany ===
- ? newProjCustomCompany : newProjCompany;
    if (!finalCompany || !finalCompany.trim()) {
      showToast(
- );
      return;
    }

    const codeUpper = newProjCode.trim().toUpperCase();
    if (projectList.some(p => p.id === codeUpper)) {
      showToast(`Project Code ${codeUpper} already exists. Please use a unique code.`,
- );
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
    if (newProjTemplate ===
- ) {
      initialNodes = [
        {
          id: `${codeUpper}-init`,
          code:
- ,
          name:
- ,
          progress: 0,
          budget: Math.round(budgetVal * 0.05),
          assignee:
- ,
          level: 1,
          isMilestone: false,
          startDate: newProjStartDate,
          endDate: addDays(newProjStartDate, 30),
          status:
- ,
          phase:
- },
        {
          id: `${codeUpper}-plan`,
          code:
- ,
          progress: 0,
          budget: Math.round(budgetVal * 0.10),
          assignee:
- ,
          level: 1,
          isMilestone: false,
          startDate: addDays(newProjStartDate, 31),
          endDate: addDays(newProjStartDate, 90),
          status:
- },
        {
          id: `${codeUpper}-exec`,
          code:
- ,
          progress: 0,
          budget: Math.round(budgetVal * 0.70),
          assignee:
- ,
          level: 1,
          isMilestone: false,
          startDate: addDays(newProjStartDate, 91),
          endDate: addDays(newProjEndDate, -60),
          status:
- },
        {
          id: `${codeUpper}-mon`,
          code:
- ,
          level: 1,
          isMilestone: false,
          startDate: newProjStartDate,
          endDate: newProjEndDate,
          status:
- },
        {
          id: `${codeUpper}-close`,
          code:
- ,
          level: 1,
          isMilestone: false,
          startDate: addDays(newProjEndDate, -59),
          endDate: newProjEndDate,
          status:
- },
        {
          id: `${codeUpper}-ms-gate`,
          code:
- ,
          progress: 0,
          budget: 0,
          assignee:
- ,
          level: 1,
          isMilestone: true,
          startDate: newProjEndDate,
          endDate: newProjEndDate,
          status:
- }
      ];
    } else {
      initialNodes = [
        {
          id: `${codeUpper}-g1`,
          code:
- ,
          progress: 0,
          budget: budgetVal,
          assignee:
- }
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

    showToast(`Project plan ${codeUpper} successfully entered and initiated with PMI-standard baseline metrics.`,
- );
  };

  // Sub-tabs:
- const [activeSubTab, setActiveSubTab] = useState<
- );

  // Add Modal state
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [nodeCode, setNodeCode] = useState(
- );
  const [nodeName, setNodeName] = useState(
- );
  const [nodeBudget, setNodeBudget] = useState(
- );
  const [nodeProgress, setNodeProgress] = useState(
- );
  const [nodeAssignee, setNodeAssignee] = useState(
- );
  const [nodeLevel, setNodeLevel] = useState<
- );
  const [nodeIsMilestone, setNodeIsMilestone] = useState(false);
  const [nodeStartDate, setNodeStartDate] = useState(
- );
  const [nodeEndDate, setNodeEndDate] = useState(
- );
  const [nodeStatus, setNodeStatus] = useState<
- );
  const [nodePhase, setNodePhase] = useState<
- );

  // Edit Modal state
  const [editingNode, setEditingNode] = useState<WBSNode | null>(null);

  const activeNodes = wbsData[selectedProjectId] || [];

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
      showToast(
- );
      return;
    }

    if (!isNocPm) {
      showToast(
- );
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
      assignee: nodeAssignee ||
- ,
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
    setNodeCode(
- );
    setNodeName(
- );
    setNodeBudget(
- );
    setNodeProgress(
- );
    setNodeAssignee(
- );
    setNodeIsMilestone(false);
    setNodeStatus(
- );
    setNodePhase(
- );
    showToast(`Successfully created ${newNode.isMilestone ?
- } ${nodeCode}.`,
- );
  };

  // Edit WBS Node
  const handleEditWBSNodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode) return;

    if (!isNocPm) {
      showToast(
- );
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
    showToast(`WBS Node ${editingNode.code} details successfully updated.`,
- );
  };

  // Delete WBS Node
  const handleDeleteNode = (nodeId: string, code: string) => {
    if (!isNocPm) {
      showToast(
- );
      return;
    }

    if (confirm(`Are you sure you want to permanently delete WBS Node / Milestone
- ? This will be reflected system-wide.`)) {
      const updatedList = activeNodes.filter((node) => node.id !== nodeId);
      setWbsData({
        ...wbsData,
        [selectedProjectId]: updatedList
      });
      showToast(`Deleted WBS element ${code}.`,
- );
    }
  };

  const getCompanyColor = (id: string) => {
    switch (id) {
      case
- : return
- ;
      default: return
- ;
    }
  };

  const getPhaseBadgeColor = (phase?: string) => {
    switch (phase) {
      case
- }`}>
                <button
                  onClick={() => {
                    setNewProjCode(
- );
                    setNewProjTitle(
- );
                    setNewProjCompany(
- );
                    setNewProjCustomCompany(
- );
                    setNewProjBudget(
- );
                    setNewProjTemplate(
- );
                    setNewProjStartDate(
- );
                    setNewProjEndDate(
- >
                {isRtl 
                  ? (isNocPm ?
- )
                  : (isNocPm ?
- >
                {isRtl 
                  ? (isNocPm 
                      ?
- : `وضع العرض فقط: يوضح هذا العرض المخطط الأساسي المعتمد من قبل المقر الرئيسي للمؤسسة. صلاحيات التعديل محجوبة لـ ${currentUser?.company ||
- }.`)
                  : (isNocPm 
                      ?
- : `Locked Mode: Showing authoritative master plan configured by NOC Headquarters. Customizations are blocked for ${currentUser?.company ||
- } {currentUser?.roleLabel ||
- } ${
                  isActive
                    ?
- }`}>
          <button
            onClick={() => setActiveSubTab(
- }
          </button>
          <button
            onClick={() => setActiveSubTab(
- }
          </button>
        </div>

        {activeSubTab ===
- >
                  {isRtl 
                    ? (isNocPm 
                        ?
- )
                    : (isNocPm 
                        ?
- : node.level === 3 ?
- }`}>
                              {node.isMilestone ? (isRtl ?
- }`}>
                            {node.isMilestone ?
- :
                                node.phase ===
- ) : (node.phase ||
- >{node.startDate}</span>
                              ) : (
                                <span>{node.startDate} {isRtl ?
- } {node.endDate}</span>
                              )
                            ) :
- || node.progress === 100
                                ?
- : node.status ===
- }`}>
                              {node.progress === 100 ? (isRtl ?
- ) : node.status ===
- }</div>
                </div>
              </div>

              {/* Sorted project nodes based on dates */}
              {activeNodes.length > 0 ? (
                activeNodes
                  .filter((node) => node.startDate)
                  .sort((a, b) => (a.startDate ||
- ).localeCompare(b.startDate ||
- ))
                  .map((node) => {
                    const isCompleted = node.progress === 100 || node.status ===
- ;
                    
                    // Simple simulated bar positioning based on month
                    let barLeft =
- ;
                    let barRight =
- ;
                    let barWidth =
- ;
                    
                    if (node.startDate) {
                      if (node.startDate.includes(
- )) {
                        barLeft =
- ;
                        barRight =
- ;
                        barWidth = node.endDate?.includes(
- ;
                      } else if (node.startDate.includes(
- ;
                        barWidth =
- ;
                      } else {
                        barLeft =
- :
                                  node.phase ===
- }`}>
                          {node.isMilestone ?
- } flex items-center gap-1.5 ${isRtl ?
- }`} title=
- >
                                {isRtl 
                                  ? (node.progress === 100 ?
- )
                                  : `MILESTONE ${node.progress === 100 ?
- >
                      <option value=
- }</option>
                      <option value=
- >
                        <input
                          type=
- }
                    </label>
                    <input
                      type=
- required
                      placeholder={isRtl ?
- required={!nodeIsMilestone}
                      disabled={nodeIsMilestone}
                      placeholder={nodeIsMilestone ? (isRtl ?
- )}
                      value={nodeIsMilestone ?
- }
                  </label>
                  <input
                    type=
- required
                    placeholder={isRtl ?
- >
                      {nodeProgress}% {isRtl ?
- }`}>
                  <button
                    type=
- }
                  </button>
                  <button
                    type=
- required={!editingNode.isMilestone}
                      disabled={editingNode.isMilestone}
                      placeholder={isRtl ?
- }
                      value={editingNode.isMilestone ?
- }
                    </label>
                    <select
                      value={editingNode.phase ||
- value={editingNode.startDate ||
- disabled={editingNode.isMilestone}
                      value={editingNode.isMilestone ? (editingNode.startDate ||
- ) : (editingNode.endDate ||
- }
                    </label>
                    <select
                      value={editingNode.status ||
- }
                      onChange={(e: any) => setEditingNode({ ...editingNode, status: e.target.value, progress: e.target.value ===
- value={editingNode.progress}
                    onChange={(e) => setEditingNode({ ...editingNode, progress: parseInt(e.target.value) || 0, status: parseInt(e.target.value) === 100 ?
- : (parseInt(e.target.value) > 0 ?
- >
                      {editingNode.progress}% {isRtl ?
- }
                  </p>
                  <p>
                    {isRtl 
                      ?
- name=
- checked={newProjTemplate ===
- }
                          onChange={() => setNewProjTemplate(
- }
                      </label>
                    </div>
                  </div>
                </div>

                {newProjCompany ===
- ("pmi");
  const [newProjStartDate, setNewProjStartDate] = useState("2026-07-10");
  const [newProjEndDate, setNewProjEndDate] = useState("2027-07-10");

  const [selectedProjectId, setSelectedProjectId] = useState
- ("hierarchy");

  // Add Modal state
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [nodeCode, setNodeCode] = useState("");
  const [nodeName, setNodeName] = useState("");
  const [nodeBudget, setNodeBudget] = useState("");
  const [nodeProgress, setNodeProgress] = useState("0");
  const [nodeAssignee, setNodeAssignee] = useState("");
  const [nodeLevel, setNodeLevel] = useState
- ("1");
  const [nodeIsMilestone, setNodeIsMilestone] = useState(false);
  const [nodeStartDate, setNodeStartDate] = useState("2026-07-10");
  const [nodeEndDate, setNodeEndDate] = useState("2026-08-10");
  const [nodeStatus, setNodeStatus] = useState
- ("not_started");
  const [nodePhase, setNodePhase] = useState
- ("Engineering");

  // Edit Modal state
  const [editingNode, setEditingNode] = useState
- sum + (n.progress * n.budget), 0) / pBudget
              : 0;

            return (
- └──
- └───
- ) : (
          /* Sovereign Master Project Plan Timeline View */
- ) : (
                            /* Work Package duration bar with filled progress */
- 0%
- 100%
- WAHA-24-109
- Wellhead Maintenance - Phase II
- €1,250,000
- October 24, 2024 09:15 AM
- high
- Mechanical completion of Phase I verified. Electrical interconnections are pending final loop testing before advancing beyond 45%. - October 10, 2024
- del-1-1
- Complete electrical wiring hookups (Wells 14-18)
- 10.0%
- del-1-2
- Pressure test sign-off (QA/QC Dept)
- 5.0%
- del-1-3
- Site demobilization preparation
- 2.5%
- pending
- doc-1-1
- QAQC_Signoff_Wells14-18.pdf
- 2.4 MB
- 09:10 AM
- PDF
- doc-1-2
- Progress_Measurement_Sheet_Oct.xlsx
- 850 KB
- 09:12 AM
- XLSX
- doc-1-3
- Site_Photo_TieIn_Complete.jpg
- 4.1 MB
- 09:14 AM
- IMAGE
- log-1-1
- Submission
- 45.0% → 62.5%
- Oct 24, 09:15 AM
- log-1-2
- System Validator
- Verification
- Automated check on all PDF attachments & certificates passed
- Oct 24, 09:16 AM
- ",
    status:
- ,
    invoiceNumber:
- ,
    invoiceAmount: 781250,
  },
  {
    id:
- ,
    code:
- ,
    title:
- ,
    company:
- ,
    companyId:
- ,
    wbs:
- ,
    claimedValue:
- ,
    numericValue: 450000,
    submittedBy:
- ,
    submissionDate:
- ,
    previousProgress: 20.0,
    claimedProgress: 35.0,
    priority:
- ,
    dueDate:
- ,
    previousNotes:
- ,
    deliverables: [
      {
        id:
- ,
        description:
- ,
        weight:
- ,
      },
      {
        id:
- ,
      },
    ],
    documents: [
      {
        id:
- ,
        name:
- ,
        size:
- ,
        uploadedAt:
- ,
        type:
- ,
      },
    ],
    auditLog: [
      {
        id:
- ,
        user:
- ,
        action:
- ,
        change:
- ,
      },
    ],
    auditorNotes:
- ,
    status:
- ,
    invoiceAmount: 157500,
  },
  {
    id:
- ,
    numericValue: 890000,
    submittedBy:
- ,
    previousProgress: 55.0,
    claimedProgress: 72.0,
    priority:
- ,
    invoiceAmount: 640800,
    paymentToken:
- ,
  },
  {
    id:
- ,
    numericValue: 3400000,
    submittedBy:
- ,
    previousProgress: 70.0,
    claimedProgress: 85.0,
    priority:
- ,
    invoiceAmount: 2890000,
  },
  {
    id:
- ,
    numericValue: 4850000,
    submittedBy:
- ,
    previousProgress: 10.0,
    claimedProgress: 30.0,
    priority:
- ,
    invoiceAmount: 1455000,
  },
  {
    id:
- ,
    numericValue: 1850000,
    submittedBy:
- ,
    previousProgress: 35.0,
    claimedProgress: 55.0,
    priority:
- ,
    invoiceAmount: 1017500,
  },
  {
    id:
- ,
    numericValue: 6200000,
    submittedBy:
- ,
    previousProgress: 80.0,
    claimedProgress: 95.0,
    priority:
- ,
    invoiceAmount: 5890000,
  },
  {
    id:
- ,
    numericValue: 2100000,
    submittedBy:
- ,
    previousProgress: 15.0,
    claimedProgress: 30.0,
    priority:
- ,
    invoiceAmount: 630000,
    paymentToken:
- NATIONAL OIL CORP.
- PORTFOLIO AUDIT SYSTEM
- NOC Portfolio Claims Audit & EVM Ledger
- Reset System Data
- Change / Logout User
- Search reference, operating company, title...
- Notifications
- Mark all read
- Clear All History
- No notifications yet
- Claims Dashboard
- WBS Structure & Milestones
- Invoice Auditing & Vault
- Sovereign Document Registry
- Regulatory RACI Matrix
- Data Sovereignty Ledger
- Central Security Settings
- Identity & Access (IAM)
- My Profile
- NOC Sovereign Portfolio Audit & EVM Ledger
- Multi-Role Gateway • National Oil Corporation Libya
- NOC CENTRAL HEADQUARTERS AUTHORITIES (Auditors)
- OPERATING SUBSIDIARIES & OIL PRODUCING COMPANIES
- Enter Portal as Auditor
- Login as PM
- Login as Finance
- Sovereign audit data restored to genesis state.
- Logged out from secure session.
- New Stage Claim
- Loading...
- Status
- Actions
- Type
- Date
- Size
- View
- Close
- Save
- Submit
- Edit
- Delete
- Verified
- Pending
- Rejected
- Approved
- Progress
- Total
- Code
- Description
- Company
- Value
- Auditor
- Evidence
- Back to List
- منظومة تدقيق المحفظة
- تدقيق مطالبات محفظة المؤسسة الوطنية للنفط ودفتر القيمة المكتسبة
- إعادة تعيين بيانات النظام
- تغيير / تسجيل خروج المستخدم
- © ٢٠٢٦ المؤسسة الوطنية للنفط. جميع الحقوق محفوظة. وحدة تدقيق المشروعات الكبرى.
- سياسة الخصوصية
- دليل الامتثال لـ RACI
- إعادة ضبط بيانات التطبيق
- البحث عن مرجع، شركة مشغلة، أو عنوان...
- الإشعارات
- تحديد الكل كمقروء
- مسح السجل بالكامل
- لا توجد إشعارات بعد
- لوحة تحكم المطالبات
- هيكل تجزئة العمل والمراحل
- تدقيق الفواتير والخزنة
- السجل السيادي للمستندات
- مصفوفة الصلاحيات (RACI)
- دفتر السيادة الرقمية
- إعدادات الأمان المركزية
- إدارة الهوية والصلاحيات
- الملف الشخصي
- نظام تدقيق المحفظة السيادية ودفتر القيمة المكتسبة
- بوابة الأدوار المتعددة • المؤسسة الوطنية للنفط - ليبيا
- سلطات المقر المركزي للمؤسسة الوطنية للنفط (المدققون)
- الشركات التابعة والشركات المنتجة للنفط (المشغلون)
- دخول البوابة بصفتك مدققًا
- تسجيل الدخول كمدير مشروع
- تسجيل الدخول كمسؤول مالي
- إعادة تعيين بيانات التطبيق؟
- هل أنت متأكد أنك تريد استعادة نظام تدقيق محفظة المؤسسة الوطنية للنفط بشكل دائم إلى قيمه الأساسية الأصلية؟
- ستعود تسلسلات هيكل تجزئة العمل والمراحل المخصصة إلى القيم الافتراضية.
- سيتم مسح جميع المطالبات المقدمة حديثًا وأوزان التقدم والتجاوزات المالية.
- سيتم حذف جميع فواتير PDF/XLSX والمستندات الفنية التي تم تحميلها.
- إلغاء
- تأكيد إعادة التعيين
- تمت استعادة بيانات التدقيق السيادي إلى الحالة الأولى بنجاح.
- تم تسجيل الخروج من الجلسة الآمنة.
- مطالبة مرحلية جديدة
- جاري التحميل...
- الحالة
- الإجراءات
- النوع
- التاريخ
- الحجم
- عرض
- تحميل
- إغلاق
- حفظ
- إرسال
- تعديل
- حذف
- تم التحقق منه
- قيد الانتظار
- تم الرفض
- تمت الموافقة
- التقدم الحالي
- الإجمالي
- الكود المرجعي
- الوصف
- الشركة المشغلة
- القيمة الإجمالية
- المدقق الفني
- المستندات الداعمة
- العودة إلى القائمة
- react-dom/client
- ./App.tsx
- ./index.css
- ./components/ThemeProvider
- root
- standard
- approved
- rejected
- info_requested
- pending_financial_audit
- pending_head_of_accounts_approval
- authorized_for_payment
- claims
- wbs
- invoices
- documents
- raci
- data_sovereignty
- security
- DEACTIVATED
- UPDATE_USER
- CREATE_ROLE
- REVOKE_ROLE
