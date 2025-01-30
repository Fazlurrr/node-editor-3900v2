import React from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050
    }}>
      <div style={{
        padding: '20px',
        background: '#fff',
        borderRadius: '5px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        width: 'auto',
        maxWidth: '90%',
        zIndex: 1000
      }}>
        <div style={{
          marginBottom: '20px',
          textAlign: 'center'
        }}>{children}</div>
        <div style={{
          display: 'flex',
            justifyContent: 'center',
            gap: '10px'
        }}>
          <button onClick={onDelete} style={{
            backgroundColor: '#f44336',
            color: '#fff',
            border: 'none',
            padding: '10px 10px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>Delete</button>
          <button onClick={onClose} style={{
            backgroundColor: '#607d8b',
            color: '#fff',
            border: 'none',
            padding: '10px 10px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>Close</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;

