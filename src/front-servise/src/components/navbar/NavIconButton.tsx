'use client';

import Image, { StaticImageData } from 'next/image';
import { Link } from '@/components/navigation/navigation';

const iconClass = 'nav-icon';
const base = 'p-2 rounded-lg transition-colors border';
const activeClass = 'bg-active border-border';
const idleClass = 'border-transparent hover:bg-hover hover:border-border';

interface NavIconLinkProps {
  href: string;
  icon: StaticImageData | string;
  alt: string;
  active?: boolean;
}

interface NavIconButtonProps {
  onClick: () => void;
  icon: StaticImageData | string;
  alt: string;
}

export function NavIconLink({ href, icon, alt, active }: NavIconLinkProps) {
  return (
    <Link
      href={href}
      aria-label={alt}
      className={[base, active ? activeClass : idleClass].join(' ')}
    >
      <Image src={icon} alt={alt} width={22} height={22} className={iconClass} unoptimized />
    </Link>
  );
}

export function NavIconButton({ onClick, icon, alt }: NavIconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={alt}
      className={[base, idleClass].join(' ')}
    >
      <Image src={icon} alt={alt} width={22} height={22} className={iconClass} unoptimized />
    </button>
  );
}
