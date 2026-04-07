'use client';

import { useTransition, animated } from '@react-spring/web';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const backdropTransition = useTransition(isOpen, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { tension: 280, friction: 30 },
  });

  const modalTransition = useTransition(isOpen, {
    from: { y: 40, opacity: 0, scale: 0.97 },
    enter: { y: 0, opacity: 1, scale: 1 },
    leave: { y: 40, opacity: 0, scale: 0.97 },
    config: { tension: 320, friction: 28 },
  });

  return (
    <>
      {backdropTransition((style, show) =>
        show ? (
          <animated.div
            style={{ ...style, backgroundColor: 'rgba(0,0,0,0.45)' }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
        ) : null,
      )}

      {modalTransition((style, show) =>
        show ? (
          <animated.div
            style={style}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg bg-surface border border-border rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 20px 60px -10px rgba(0,0,0,0.4)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {title && (
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-base font-semibold text-text">{title}</h2>
                </div>
              )}

              <div className="px-6 py-5">{children}</div>

              {footer && (
                <div className="px-6 pb-6 pt-2 border-t border-border flex gap-3 justify-end">
                  {footer}
                </div>
              )}
            </div>
          </animated.div>
        ) : null,
      )}
    </>
  );
}
