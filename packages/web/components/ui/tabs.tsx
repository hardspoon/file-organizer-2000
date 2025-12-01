'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TabsRootComponent = TabsPrimitive.Root as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Tabs({ className, ...props }: any) {
  return (
    <TabsRootComponent
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TabsListComponent = TabsPrimitive.List as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabsList({ className, ...props }: any) {
  return (
    <TabsListComponent
      data-slot="tabs-list"
      className={cn(
        'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-1',
        className
      )}
      {...props}
    />
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TabsTriggerComponent = TabsPrimitive.Trigger as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabsTrigger({ className, ...props }: any) {
  return (
    <TabsTriggerComponent
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TabsContentComponent = TabsPrimitive.Content as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabsContent({ className, ...props }: any) {
  return (
    <TabsContentComponent
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
