import React, { useEffect, useRef } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from './Icons';
import ModalPortal from './ModalPortal';

export type ConfirmModalType = 'warning' | 'success' | 'info' | 'error' | 'confirm';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: ConfirmModalType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Batal',
  showCancel = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) onClose();
  };

  if (!isOpen) return null;

  const getIcon = () => {
    const iconClass = 'w-12 h-12';
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClass} text-amber-500`} />;
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-emerald-500`} />;
      case 'error':
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      case 'confirm':
        return <ExclamationTriangleIcon className={`${iconClass} text-primary-500`} />;
      default:
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'success':
        return 'bg-emerald-500 hover:bg-emerald-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      case 'confirm':
        return 'bg-primary-600 hover:bg-primary-700';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <ModalPortal>
      <div
        ref={modalRef}
        className="fixed inset-0 w-full h-full z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {getIcon()}
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{message}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            {showCancel && (
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all active:scale-95 ${getButtonColor()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ConfirmModal;
