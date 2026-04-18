'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from '@/components/navigation/navigation';
import { MODAL_SWITCH_DELAY } from '../constants';

export const useLoginFlow = () => {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(true);
  const [qrOpen, setQrOpen] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(true);
  const switchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSwitchTimer = () => {
    if (switchTimer.current) {
      clearTimeout(switchTimer.current);
      switchTimer.current = null;
    }
  };

  const switchToQr = () => {
    clearSwitchTimer();
    setLoginOpen(false);
    switchTimer.current = setTimeout(() => {
      setQrOpen(true);
      switchTimer.current = null;
    }, MODAL_SWITCH_DELAY);
  };

  const switchToLogin = useCallback(() => {
    clearSwitchTimer();
    setQrOpen(false);
    switchTimer.current = setTimeout(() => {
      setLoginOpen(true);
      switchTimer.current = null;
    }, MODAL_SWITCH_DELAY);
  }, []);

  const close = () => {
    clearSwitchTimer();
    setLoginOpen(false);
    setQrOpen(false);
    setBackdropOpen(false);
    router.push('/');
  };

  const handleBackdropClick = () => {
    if (qrOpen) switchToLogin();
    else close();
  };

  useEffect(() => () => clearSwitchTimer(), []);

  useEffect(() => {
    document.body.style.overflow = backdropOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [backdropOpen]);

  return {
    loginOpen,
    qrOpen,
    backdropOpen,
    switchToQr,
    switchToLogin,
    close,
    handleBackdropClick,
  };
};
