import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertBannerProps {
  type?: AlertType;
  title: string;
  message: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  storageKey?: string; // If provided, will remember "don't show again"
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const alertStyles = {
  info: {
    container: 'bg-blue-50 border-blue-200 ring-blue-500/10',
    header: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    icon: 'text-blue-600',
    button: 'text-blue-600 hover:text-blue-700',
  },
  success: {
    container: 'bg-green-50 border-green-200 ring-green-500/10',
    header: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    icon: 'text-green-600',
    button: 'text-green-600 hover:text-green-700',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 ring-amber-500/10',
    header: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    icon: 'text-amber-600',
    button: 'text-amber-600 hover:text-amber-700',
  },
  error: {
    container: 'bg-red-50 border-red-200 ring-red-500/10',
    header: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
    icon: 'text-red-600',
    button: 'text-red-600 hover:text-red-700',
  },
};

const defaultIcons = {
  info: <Info className="w-6 h-6" />,
  success: <CheckCircle2 className="w-6 h-6" />,
  warning: <AlertTriangle className="w-6 h-6" />,
  error: <AlertCircle className="w-6 h-6" />,
};

export function AlertBanner({
  type = 'info',
  title,
  message,
  icon,
  dismissible = true,
  storageKey,
  onDismiss,
  action,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user previously dismissed this banner
    if (storageKey) {
      const isDismissed = localStorage.getItem(`alert-dismissed-${storageKey}`);
      if (isDismissed) {
        setIsVisible(false);
      }
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (storageKey) {
      localStorage.setItem(`alert-dismissed-${storageKey}`, 'true');
    }
    onDismiss?.();
  };

  if (!isVisible) return null;

  const styles = alertStyles[type];
  const displayIcon = icon || defaultIcons[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`rounded-2xl shadow-sm border ${styles.container} ring-4 overflow-hidden mb-6`}
        >
          <div className={`${styles.header} p-6 flex items-center gap-4`}>
            <div className={`p-2 rounded-lg ${styles.icon}`}>
              {displayIcon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{title}</h3>
              <p className={`text-sm ${type === 'info' ? 'text-blue-100' : type === 'success' ? 'text-green-100' : type === 'warning' ? 'text-amber-100' : 'text-red-100'}`}>
                {message}
              </p>
            </div>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 ml-4 p-1 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close alert"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {action && (
            <div className="px-6 py-3 border-t border-current border-opacity-10 bg-white/40">
              <button
                onClick={action.onClick}
                className={`text-sm font-semibold ${styles.button} transition-colors`}
              >
                {action.label}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
