// components/ui/resizable.tsx
import * as React from "react";
import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

/**
 * react-resizable-panels exports differ across versions/builds:
 * - Some builds expose: Group / ResizeHandle
 * - Others expose: PanelGroup / PanelResizeHandle
 * We'll support both at runtime.
 */
const PanelGroupComponent =
  (ResizablePrimitive as any).PanelGroup ?? (ResizablePrimitive as any).Group;

const PanelComponent = (ResizablePrimitive as any).Panel;

const ResizeHandleComponent =
  (ResizablePrimitive as any).PanelResizeHandle ?? (ResizablePrimitive as any).ResizeHandle;

// Props derived from the actual components (works even when type exports differ)
type PanelGroupProps = React.ComponentProps<typeof PanelGroupComponent>;
type PanelProps = React.ComponentProps<typeof PanelComponent>;
type ResizeHandleProps = React.ComponentProps<typeof ResizeHandleComponent>;

const ResizablePanelGroup = React.forwardRef<HTMLDivElement, PanelGroupProps>(
  ({ className, ...props }, ref) => (
    <PanelGroupComponent
      ref={ref}
      className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
      {...props}
    />
  ),
);
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = React.forwardRef<HTMLDivElement, PanelProps>((props, ref) => (
  <PanelComponent ref={ref} {...props} />
));
ResizablePanel.displayName = "ResizablePanel";

type ResizableHandleExtraProps = ResizeHandleProps & {
  withHandle?: boolean;
};

const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleExtraProps>(
  ({ withHandle, className, ...props }, ref) => (
    <ResizeHandleComponent
      ref={ref}
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      )}
    </ResizeHandleComponent>
  ),
);
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
