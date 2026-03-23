'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
}

export default function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}: AlertModalProps) {
  const themes = {
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50',
      confirmBtn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
    },
    danger: {
      icon: AlertCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50',
      confirmBtn: 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
    },
    info: {
      icon: HelpCircle,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      confirmBtn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
    },
    success: {
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
    }
  };

  const theme = themes[type];
  const Icon = theme.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-stone-100"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="p-8 pb-0">
              {/* Icon Header */}
              <div className={`w-14 h-14 ${theme.iconBg} rounded-2xl flex items-center justify-center ${theme.iconColor} mb-6`}>
                <Icon size={28} />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-2xl font-serif font-black text-stone-900 leading-tight">
                  {title}
                </h3>
                <p className="text-stone-500 font-medium leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-8 pt-8 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all transform active:scale-95 cursor-pointer ${theme.confirmBtn}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
