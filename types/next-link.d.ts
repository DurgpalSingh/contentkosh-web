declare module 'next/link' {
  import type { ComponentPropsWithoutRef } from 'react';
  export default function Link(props: ComponentPropsWithoutRef<'a'> & { href: string | URL }): JSX.Element;
}
