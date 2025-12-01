'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProgressRootComponent = ProgressPrimitive.Root as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProgressIndicatorComponent = ProgressPrimitive.Indicator as any;

const Progress = React.forwardRef<any, any>(
  ({ className, value, ...props }, ref) => (
    <ProgressRootComponent
      ref={ref}
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-slate-100',
        className
      )}
      value={value}
      {...props}
    >
      <ProgressIndicatorComponent
        className="h-full w-full flex-1 bg-blue-600 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressRootComponent>
  )
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
