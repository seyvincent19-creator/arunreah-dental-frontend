import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}

export default function Modal({ title, isOpen, onClose, children, footer, size = 'md' }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="modal d-block" tabIndex={-1} role="dialog">
        <div className={`modal-dialog modal-dialog-centered ${size === 'lg' ? 'modal-lg' : ''}`}>
          <div className="modal-content shadow-soft border-0">
            <div className="modal-header">
              <h5 className="modal-title fw-semibold">{title}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer border-top-0 pt-0">{footer}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" onClick={onClose} />
    </>
  );
}
