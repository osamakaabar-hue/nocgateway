import React, { useState } from 'react';
import { DemoUser } from '../types';
import { User, Mail, Building, Key, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  currentUser: DemoUser;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
  lang: "en" | "ar";
}

export default function UserProfile({ currentUser, showToast, lang }: Props) {
  const isRtl = lang === "ar";
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast(isRtl ? "الرجاء تعبئة جميع حقول كلمة المرور." : "Please fill in all password fields.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(isRtl ? "كلمتا المرور غير متطابقتين." : "New passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast(isRtl ? "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل." : "Password must be at least 8 characters long.", "error");
      return;
    }
    
    // Simulate API Call
    showToast(isRtl ? "تم تحديث كلمة المرور وتشفيرها بنجاح." : "Password updated and securely hashed.", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className={`h-full flex flex-col ${isRtl ? "text-right" : "text-left"} max-w-4xl mx-auto py-6`}>
      <div className={`flex items-center gap-3 mb-8 ${isRtl ? "flex-row-reverse" : ""}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${currentUser.avatarColor}`}>
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            {isRtl ? "إدارة الحساب الشخصي" : "Self-Service Profile"}
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {isRtl ? "إدارة هويتك المؤسسية وإعدادات الأمان." : "Manage your corporate identity and security credentials."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className={`text-sm font-black text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Building className="w-4 h-4 text-indigo-600" />
            {isRtl ? "بيانات الهوية المؤسسية" : "Corporate Identity Data"}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                {isRtl ? "الاسم الكامل" : "Full Name"}
              </label>
              <div className="text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                {isRtl && currentUser.nameAr ? currentUser.nameAr : currentUser.name}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                {isRtl ? "الجهة التابع لها" : "Operating Company"}
              </label>
              <div className="text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {currentUser.company}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                {isRtl ? "الدور الوظيفي والصلاحيات" : "Role & Privileges Scope"}
              </label>
              <div className="text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                {currentUser.roleLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Security & Password */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className={`text-sm font-black text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Key className="w-4 h-4 text-amber-500" />
            {isRtl ? "إعدادات الأمان وتغيير كلمة المرور" : "Security & Password Management"}
          </h3>
          
          <form onSubmit={handlePasswordUpdate} className="space-y-4" dir={isRtl ? "rtl" : "ltr"}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRtl ? "كلمة المرور الحالية" : "Current Password"}
              </label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRtl ? "كلمة المرور الجديدة" : "New Password"}
              </label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRtl ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
              </label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
              <p className={`text-[10px] text-amber-800 leading-relaxed flex items-start gap-1.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {isRtl 
                  ? "تغيير كلمة المرور سيؤدي إلى إنهاء جميع الجلسات النشطة (Sessions) على جميع الأجهزة فوراً كإجراء أمني للحماية."
                  : "Changing your password will instantly invalidate all active JSON Web Tokens (JWT) across all devices via the global session kill switch."}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
              >
                {isRtl ? "تحديث التشفير (Update Password)" : "Update & Hash Password"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
