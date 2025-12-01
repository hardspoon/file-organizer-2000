'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenuRoot = DropdownMenuPrimitive.Root as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropdownMenu(props: any) {
  return <DropdownMenuRoot data-slot="dropdown-menu" {...props} />;
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenuPortalComponent = DropdownMenuPrimitive.Portal as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropdownMenuPortal(props: any) {
  return (
    <DropdownMenuPortalComponent data-slot="dropdown-menu-portal" {...props} />
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenuTriggerComponent = DropdownMenuPrimitive.Trigger as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropdownMenuTrigger(props: any) {
  return (
    <DropdownMenuTriggerComponent
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenuContentComponent = DropdownMenuPrimitive.Content as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropdownMenuContent({ className, sideOffset = 4, ...props }: any) {
  return (
    <DropdownMenuPortalComponent>
      <DropdownMenuContentComponent
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          'bg-white text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md',
          className
        )}
        {...props}
      />
    </DropdownMenuPortalComponent>
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenuGroupComponent = DropdownMenuPrimitive.Group as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropdownMenuGroup(props: any) {
  return (
    <DropdownMenuGroupComponent data-slot="dropdown-menu-group" {...props} />
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenuItemComponent = DropdownMenuPrimitive.Item as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: any) {
  return (
    <DropdownMenuItemComponent
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/40 data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenuCheckboxItemComponent =
  DropdownMenuPrimitive.CheckboxItem as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenuItemIndicatorComponent =
  DropdownMenuPrimitive.ItemIndicator as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: any) {
  return (
    <DropdownMenuCheckboxItemComponent
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuItemIndicatorComponent>
          <CheckIcon className="size-4" />
        </DropdownMenuItemIndicatorComponent>
      </span>
      {children}
    </DropdownMenuCheckboxItemComponent>
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenuRadioGroupComponent = DropdownMenuPrimitive.RadioGroup as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropdownMenuRadioGroup(props: any) {
  return (
    <DropdownMenuRadioGroupComponent
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenuRadioItemComponent = DropdownMenuPrimitive.RadioItem as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropdownMenuRadioItem({ className, children, ...props }: any) {
  return (
    <DropdownMenuRadioItemComponent
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuItemIndicatorComponent>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuItemIndicatorComponent>
      </span>
      {children}
    </DropdownMenuRadioItemComponent>
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenuLabelComponent = DropdownMenuPrimitive.Label as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropdownMenuLabel({ className, inset, ...props }: any) {
  return (
    <DropdownMenuLabelComponent
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        'px-2 py-1.5 text-sm font-medium data-[inset]:pl-8',
        className
      )}
      {...props}
    />
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenuSeparatorComponent = DropdownMenuPrimitive.Separator as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropdownMenuSeparator({ className, ...props }: any) {
  return (
    <DropdownMenuSeparatorComponent
      data-slot="dropdown-menu-separator"
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        'text-muted-foreground ml-auto text-xs tracking-widest',
        className
      )}
      {...props}
    />
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenuSubComponent = DropdownMenuPrimitive.Sub as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropdownMenuSub(props: any) {
  return <DropdownMenuSubComponent data-slot="dropdown-menu-sub" {...props} />;
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenuSubTriggerComponent = DropdownMenuPrimitive.SubTrigger as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropdownMenuSubTrigger({ className, inset, children, ...props }: any) {
  return (
    <DropdownMenuSubTriggerComponent
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8',
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuSubTriggerComponent>
  );
}

// Type assertion to work around React 19 type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenuSubContentComponent = DropdownMenuPrimitive.SubContent as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropdownMenuSubContent({ className, ...props }: any) {
  return (
    <DropdownMenuSubContentComponent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg',
        className
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
