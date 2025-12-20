import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// --- Card Component ---
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-2xl border border-white/10 bg-surface-dark shadow-xl backdrop-blur-sm", className)} {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-bold leading-none tracking-tight text-white", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0 text-gray-300", className)} {...props} />
))
CardContent.displayName = "CardContent"

// --- Button Component ---
const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-primary to-brand-600 text-black shadow-[0_0_15px_rgba(244,192,37,0.3)] hover:shadow-[0_0_25px_rgba(244,192,37,0.5)] hover:brightness-110",
                destructive: "bg-red-900/50 text-red-200 hover:bg-red-900/70 border border-red-900",
                outline: "border border-white/10 bg-transparent hover:bg-white/5 text-white hover:text-primary hover:border-primary/50",
                secondary: "bg-surface-dark text-white hover:bg-surface-dark/80 border border-white/5",
                ghost: "hover:bg-white/5 hover:text-primary",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-12 px-6 py-2",
                sm: "h-9 rounded-lg px-3",
                lg: "h-14 rounded-xl px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
        <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
})
Button.displayName = "Button"

// --- Input Component ---
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-12 w-full rounded-xl border border-white/10 bg-surface-dark/50 px-4 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = "Input"

// --- Label Component ---
const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-400", className)} {...props} />
))
Label.displayName = "Label"

// --- Slider Component ---
const Slider = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
    <input
        type="range"
        className={cn(
            "w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary",
            className
        )}
        ref={ref}
        {...props}
    />
))
Slider.displayName = "Slider"


export { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Slider, buttonVariants }
