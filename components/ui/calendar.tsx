"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-4", className)}
            classNames={{
                months: "flex flex-col space-y-3",
                month: "space-y-3",
                caption: "flex items-center justify-between gap-3",
                caption_dropdowns: "flex items-center gap-2",
                caption_label: "sr-only",
                dropdown: "rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-200",
                dropdown_month: "min-w-[9.5rem]",
                dropdown_year: "min-w-[6.5rem]",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-8 w-8 rounded-lg bg-white p-0 border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                weekdays: "flex justify-between",
                weekday: "text-slate-400 rounded-md w-9 font-medium text-[0.75rem] uppercase tracking-wide",
                row: "flex w-full mt-2 justify-between",
                cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-xl [&:has([aria-selected].day-outside)]:bg-slate-100 [&:has([aria-selected])]:bg-cyan-50 first:[&:has([aria-selected])]:rounded-xl last:[&:has([aria-selected])]:rounded-xl focus-within:relative focus-within:z-20",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-10 w-10 rounded-xl p-0 font-medium text-slate-700 hover:bg-slate-100 aria-selected:opacity-100"
                ),
                day_button: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-10 w-10 rounded-xl p-0 font-medium text-slate-700 hover:bg-slate-100 aria-selected:opacity-100"
                ),
                range_end: "day-range-end",
                selected:
                    "bg-cyan-600 text-white hover:bg-cyan-600 hover:text-white focus:bg-cyan-600 focus:text-white",
                today: "bg-slate-100 text-slate-900",
                outside:
                    "day-outside text-slate-400 opacity-60 aria-selected:bg-slate-100 aria-selected:text-slate-400 aria-selected:opacity-60",
                disabled: "text-slate-300 opacity-60",
                range_middle:
                    "aria-selected:bg-cyan-50 aria-selected:text-slate-900",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation, ...props }) => {
                    switch (orientation) {
                        case "left":
                            return <ChevronLeft className="h-4 w-4" {...props} />
                        case "right":
                            return <ChevronRight className="h-4 w-4" {...props} />
                        case "up":
                            return <ChevronUp className="h-4 w-4" {...props} />
                        case "down":
                            return <ChevronDown className="h-4 w-4" {...props} />
                        default:
                            return <ChevronLeft className="h-4 w-4" {...props} />
                    }
                }
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
