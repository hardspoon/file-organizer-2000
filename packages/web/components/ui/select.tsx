'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectRootComponent = SelectPrimitive.Root as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Select(props: any) {
  return <SelectRootComponent data-slot="select" {...props} />;
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectGroupComponent = SelectPrimitive.Group as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectGroup(props: any) {
  return <SelectGroupComponent data-slot="select-group" {...props} />;
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectValueComponent = SelectPrimitive.Value as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectValue(props: any) {
  return <SelectValueComponent data-slot="select-value" {...props} />;
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectTriggerComponent = SelectPrimitive.Trigger as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectIconComponent = SelectPrimitive.Icon as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectTrigger({ className, children, ...props }: any) {
  return (
    <SelectTriggerComponent
      data-slot="select-trigger"
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex h-9 w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectIconComponent asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectIconComponent>
    </SelectTriggerComponent>
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectPortalComponent = SelectPrimitive.Portal as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectContentComponent = SelectPrimitive.Content as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectViewportComponent = SelectPrimitive.Viewport as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: any) {
  return (
    <SelectPortalComponent>
      <SelectContentComponent
        data-slot="select-content"
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectViewportComponent
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1'
          )}
        >
          {children}
        </SelectViewportComponent>
        <SelectScrollDownButton />
      </SelectContentComponent>
    </SelectPortalComponent>
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectLabelComponent = SelectPrimitive.Label as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectLabel({ className, ...props }: any) {
  return (
    <SelectLabelComponent
      data-slot="select-label"
      className={cn('px-2 py-1.5 text-sm font-medium', className)}
      {...props}
    />
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectItemComponent = SelectPrimitive.Item as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectItemIndicatorComponent = SelectPrimitive.ItemIndicator as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectItemTextComponent = SelectPrimitive.ItemText as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectItem({ className, children, ...props }: any) {
  return (
    <SelectItemComponent
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectItemIndicatorComponent>
          <CheckIcon className="size-4" />
        </SelectItemIndicatorComponent>
      </span>
      <SelectItemTextComponent>{children}</SelectItemTextComponent>
    </SelectItemComponent>
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectSeparatorComponent = SelectPrimitive.Separator as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectSeparator({ className, ...props }: any) {
  return (
    <SelectSeparatorComponent
      data-slot="select-separator"
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectScrollUpButtonComponent = SelectPrimitive.ScrollUpButton as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectScrollUpButton({ className, ...props }: any) {
  return (
    <SelectScrollUpButtonComponent
      data-slot="select-scroll-up-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectScrollUpButtonComponent>
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectScrollDownButtonComponent = SelectPrimitive.ScrollDownButton as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectScrollDownButton({ className, ...props }: any) {
  return (
    <SelectScrollDownButtonComponent
      data-slot="select-scroll-down-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectScrollDownButtonComponent>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
