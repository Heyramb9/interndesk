import { useState, useCallback } from 'react';

type ToastType = 'success' | 'warning' | 'error' | 'info';

export type ToastMessage = {
  id: number;
  text: string;
  type: ToastType;
};

export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((text: string, type: ToastType = 'info') => {
    const id = Date.now();
    setMessages(prev => [...prev, { id, text, type }]);
    
    // Auto remove after 3s
    setTimeout(() => {
      remove(id);
    }, 3000);
  }, []);

  const remove = useCallback((id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  return { messages, toast, remove };
}

interface ToastContainerProps {
  messages: ToastMessage[];
  onRemove: (id: number) => void;
}

export function ToastContainer({ messages, onRemove }: ToastContainerProps) {
  const getBackgroundColor = (type: ToastType) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '🚨';
      default: return 'ℹ️';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      zIndex: 2000
    }}>
      {messages.map(msg => (
        <div key={msg.id} style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderLeft: `4px solid ${getBackgroundColor(msg.type)}`,
          animation: 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          minWidth: '280px'
        }}>
          <div>{getIcon(msg.type)}</div>
          <div style={{ flex: 1, fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>
            {msg.text}
          </div>
          <button style={{
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem'
          }} onClick={() => onRemove(msg.id)}>&times;</button>
        </div>
      ))}

      <style>
      {`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}
      </style>
    </div>
  );
}
