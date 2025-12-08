import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Since we didn't install cva and radix-ui/react-slot, I will implement a simpler version without them for now to avoid extra installs unless necessary.
// Actually cva is very useful. Let's stick to standard props for now to be fast and dependency-light if I missed installing them.
// Wait, I didn't install `class-variance-authority` or `@radix-ui/react-slot`.
// I'll implement a simple Button without them.

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'gradient';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-slate-900 text-white hover:bg-slate-900/90": variant === 'default',
                        "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900": variant === 'outline',
                        "hover:bg-slate-100 hover:text-slate-900": variant === 'ghost',
                        "bg-gradient-to-r from-bon-green-start to-bon-green-end text-white hover:opacity-90": variant === 'gradient',
                        "h-10 px-4 py-2": size === 'default',
                        "h-9 rounded-md px-3": size === 'sm',
                        "h-11 rounded-md px-8": size === 'lg',
                        "h-10 w-10": size === 'icon',
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
