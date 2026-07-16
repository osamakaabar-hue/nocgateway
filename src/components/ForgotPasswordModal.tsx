import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { Lang } from '../i18n';

interface ForgotPasswordModalProps {
  onClose: () => void;
  lang: Lang;
}

export default function ForgotPasswordModal({ onClose, lang }: ForgotPasswordModalProps) {
  const isRtl = lang === "ar";
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenInfo, setTokenInfo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate reset flow');
      }

      setSuccess(true);
      if (data._dev_only_token) {
        setTokenInfo(`[DEV ONLY] Token: ${data._dev_only_token}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl shadow-black overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-800/60 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {isRtl ? "إعادة تعيين كلمة المرور" : "Reset Password"}
              </h2>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                {isRtl ? "استعادة الوصول الآمن" : "SECURE ACCESS RECOVERY"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {isRtl ? "تم إرسال الرابط بنجاح" : "Reset Link Sent"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                {isRtl 
                  ? "تم إرسال رابط إعادة تعيين كلمة المرور الآمن إلى بريدك الإلكتروني بنجاح. يرجى التحقق من صندوق الوارد الخاص بك واتباع التعليمات."
                  : "A secure password reset link has been successfully dispatched to your corporate email. Please verify your inbox and follow the instructions."}
              </p>
              
              {tokenInfo && (
                <div className="mb-6 p-3 bg-slate-950 border border-slate-800 rounded text-left">
                  <p className="text-[9px] font-mono text-amber-500 mb-1 uppercase tracking-widest">Dev Environment Output</p>
                  <p className="text-[10px] font-mono text-slate-400 break-all">{tokenInfo}</p>
                </div>
              )}

              <button 
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-colors"
              >
                {isRtl ? "العودة لتسجيل الدخول" : "Return to Login"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                {isRtl
                  ? "أدخل عنوان بريدك الإلكتروني المؤسسي أدناه. سيقوم النظام بإنشاء رمز مميز آمن وصالح لفترة قصيرة لإعادة تعيين كلمة المرور."
                  : "Enter your corporate email address below. The system will generate a secure, short-lived token for password reset."}
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  {isRtl ? "البريد الإلكتروني المؤسسي" : "Corporate Email"}
                </label>
                <div className="relative">
                  <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 ${isRtl ? "right-3" : "left-3"}`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@noc.ly"
                    className={`w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${isRtl ? "pr-10 pl-4 text-right" : "pl-10 pr-4"}`}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-pulse">{isRtl ? "جاري الإرسال..." : "Dispatching..."}</span>
                  ) : (
                    <>
                      {isRtl ? "إرسال رابط إعادة التعيين" : "Send Reset Link"}
                      <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
