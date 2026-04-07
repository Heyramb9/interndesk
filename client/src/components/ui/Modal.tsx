import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string | ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, title, children, footer, maxWidth = '450px' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }} onClick={onClose}>
      <div className="modal-content" style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        width: '100%',
        maxWidth,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        animation: 'modalSlideIn 0.2s ease-out'
      }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{title}</h3>
          <button style={{
            background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8'
          }} onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {children}
        </div>
        
        {footer && (
          <div className="modal-footer" style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            backgroundColor: '#f8fafc',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px'
          }}>
            {footer}
          </div>
        )}
      </div>

      <style>
      {`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}
      </style>
    </div>
  );
}
