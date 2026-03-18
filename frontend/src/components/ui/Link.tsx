'use client';

import NextLink from 'next/link';
import { forwardRef } from 'react';
import type { ComponentProps } from 'react';

type LinkProps = ComponentProps<typeof NextLink>;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { prefetch = false, ...props },
  ref
) {
  return <NextLink ref={ref} prefetch={prefetch} {...props} />;
});

export default Link;

