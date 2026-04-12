declare module '*.css' {
  const styles: Record<string, string>;
  export default styles;
}

declare module '*.svg' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.png' {
  const src: string;
  export default src;
}
