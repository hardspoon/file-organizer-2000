'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

// Type assertions to work around React 19 type compatibility with Radix UI
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Dialog = DialogPrimitive.Root as any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DialogTrigger = DialogPrimitive.Trigger as any;

// Type assertions to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DialogPortal = DialogPrimitive.Portal as any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DialogClose = DialogPrimitive.Close as any;

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OverlayComponent = DialogPrimitive.Overlay as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DialogOverlay = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => (
    <OverlayComponent
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  )
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ContentComponent = DialogPrimitive.Content as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DialogContent = React.forwardRef<any, any>(
  ({ className, children, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <ContentComponent
        ref={ref}
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
          className
        )}
        {...props}
      >
        {children}
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </ContentComponent>
    </DialogPortal>
  )
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TitleComponent = DialogPrimitive.Title as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DialogTitle = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => (
    <TitleComponent
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DescriptionComponent = DialogPrimitive.Description as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DialogDescription = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => (
    <DescriptionComponent
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
