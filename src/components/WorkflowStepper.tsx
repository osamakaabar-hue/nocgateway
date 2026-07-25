import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, FileText, ArrowRight } from 'lucide-react';

export interface WorkflowStep {
  id: 'FORM_2' | 'FORM_4' | 'FORM_3' | 'STEERING_COMMITTEE' | 'BANK_DISBURSEMENT';
  labelEn: string;
  labelAr: string;
  sublabelEn: string;
  sublabelAr: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'BREACHED' | 'REJECTED';
  completedAt?: string;
  assignedActorEn?: string;
  assignedActorAr?: string;
}

interface WorkflowStepperProps {
  currentStage: 'FORM_2' | 'FORM_4' | 'FORM_3' | 'STEERING_COMMITTEE' | 'BANK_DISBURSEMENT' | 'COMPLETED';
  steps?: WorkflowStep[];
  lang?: 'en' | 'ar';
  claimId?: string;
  className?: string;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStage,
  steps,
  lang = 'en',
  claimId,
  className = '',
}) => {
  const isRtl = lang === 'ar';

  const defaultSteps: WorkflowStep[] = [
    {
      id: 'FORM_2',
      labelEn: 'Form 2 Submission',
      labelAr: 'نموذج (2) طلب وتصريح التكلفة',
      sublabelEn: 'Subsidiary PM Request',
      sublabelAr: 'مقدم من مدير مشروع الشركة المشغلة',
      status: currentStage === 'FORM_2' ? 'IN_PROGRESS' : 'COMPLETED',
      assignedActorEn: 'Operating Subsidiary PM',
      assignedActorAr: 'مدير مشروع الشركة المشغلة',
    },
    {
      id: 'FORM_4',
      labelEn: 'Form 4 Technical Approval',
      labelAr: 'نموذج (4) الاعتماد الفني',
      sublabelEn: 'NOC PMO Auditor Review',
      sublabelAr: 'مراجعة المدقق الفني للمؤسسة',
      status:
        currentStage === 'FORM_2'
          ? 'PENDING'
          : currentStage === 'FORM_4'
          ? 'IN_PROGRESS'
          : 'COMPLETED',
      assignedActorEn: 'Eng. Nadia Al-Kout (PMO)',
      assignedActorAr: 'م. نادية الكوت (PMO)',
    },
    {
      id: 'FORM_3',
      labelEn: 'Form 3 Payment Auth',
      labelAr: 'نموذج (3) تعزيز وإذن بالدفع',
      sublabelEn: 'NOC Finance Audit',
      sublabelAr: 'التدقيق المالي ومطابقة الاعتماد المستندي',
      status:
        currentStage === 'FORM_2' || currentStage === 'FORM_4'
          ? 'PENDING'
          : currentStage === 'FORM_3'
          ? 'IN_PROGRESS'
          : 'COMPLETED',
      assignedActorEn: 'Mr. Abdelrahman Al-Barasi (Finance)',
      assignedActorAr: 'عبد الرحمن البرعصي (المالية)',
    },
    {
      id: 'STEERING_COMMITTEE',
      labelEn: 'Steering Committee Sign-Off',
      labelAr: 'اعتماد لجنة الإشراف العليا',
      sublabelEn: 'High Steering Sign-Off',
      sublabelAr: 'المصادقة النهائية للجنة الإشراف والتوجيه',
      status:
        currentStage === 'FORM_2' || currentStage === 'FORM_4' || currentStage === 'FORM_3'
          ? 'PENDING'
          : currentStage === 'STEERING_COMMITTEE'
          ? 'IN_PROGRESS'
          : 'COMPLETED',
      assignedActorEn: 'Dr. Omar Al-Mansouri (Steering)',
      assignedActorAr: 'د. عمر المنصوري (لجنة الإشراف)',
    },
    {
      id: 'BANK_DISBURSEMENT',
      labelEn: 'CBL SWIFT Release',
      labelAr: 'التسوية المصرفية وإذن المصرف المركزي',
      sublabelEn: 'Central Bank Disbursement',
      sublabelAr: 'تحويل المصرف المركزي والتسوية النقدية',
      status: currentStage === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
      assignedActorEn: 'Central Bank of Libya',
      assignedActorAr: 'مصرف ليبيا المركزي',
    },
  ];

  const activeSteps = steps || defaultSteps;

  return (
    <div className={`w-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg ${className}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {claimId && (
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Governance Pipeline Telemetry:</span>
            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">{claimId}</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Workflow Rule: Form 2 → Form 4 → Form 3</span>
        </div>
      )}

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-2">
        {activeSteps.map((step, index) => {
          const isLast = index === activeSteps.length - 1;

          let stepColorClass = 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500';
          let icon = <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />;

          if (step.status === 'COMPLETED') {
            stepColorClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
          } else if (step.status === 'IN_PROGRESS') {
            stepColorClass = 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 animate-pulse';
            icon = <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
          } else if (step.status === 'BREACHED') {
            stepColorClass = 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400';
            icon = <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
          }

          return (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <div className="flex-1 flex flex-col items-start md:items-center text-start md:text-center z-10 min-w-[140px]">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 shadow-md transition-all ${stepColorClass}`}>
                  {icon}
                </div>

                <div className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                  {isRtl ? step.labelAr : step.labelEn}
                </div>
                
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {isRtl ? step.sublabelAr : step.sublabelEn}
                </div>

                {step.assignedActorEn && (
                  <span className="mt-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 rounded-full font-mono">
                    {isRtl ? step.assignedActorAr : step.assignedActorEn}
                  </span>
                )}
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className="hidden md:block flex-1 h-[2px] bg-slate-200 dark:bg-slate-800 -mt-6 mx-2 relative">
                  <div
                    className={`h-full transition-all duration-500 ${
                      step.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowStepper;
