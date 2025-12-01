'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LabelRootComponent = LabelPrimitive.Root as any;

const Label = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <LabelRootComponent
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
