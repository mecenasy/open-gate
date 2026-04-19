'use client';

import { animated, useTransition } from '@react-spring/web';
import type { ReactNode } from 'react';

interface TabPanelsProps {
  activeKey: string;
  panels: Record<string, ReactNode>;
}

export function TabPanels({ activeKey, panels }: TabPanelsProps) {
  const transitions = useTransition(activeKey, {
    from: { opacity: 0, transform: 'translateY(4px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(-4px)' },
    config: { duration: 120 },
    exitBeforeEnter: true,
  });

  return transitions((style, key) => (
    <animated.div style={style}>{panels[key]}</animated.div>
  ));
}
