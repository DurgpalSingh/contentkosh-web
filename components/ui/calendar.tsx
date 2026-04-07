"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import { DayPicker, useDayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function InlineMonthCaption({
    children,
    className,
    style,
    calendarMonth: _calendarMonth,
    displayIndex: _displayIndex,
    ...divProps
}: {
    children?: React.ReactNode
    className?: string
    style?: React.CSSProperties
    calendarMonth?: unknown
    displayIndex?: number
    [key: string]: unknown
}) {
    const { previousMonth, nextMonth, goToMonth, labels, components, dayPickerProps } = useDayPicker()
    const prevDisabled = !previousMonth || Boolean(dayPickerProps.disableNavigation)
    const nextDisabled = !nextMonth || Boolean(dayPickerProps.disableNavigation)
    const Chevron = components.Chevron
    const dir = dayPickerProps.dir

    return (
        <div
            className={cn("flex items-center justify-center gap-2", className)}
            style={style}
            {...divProps}
        >
            <components.PreviousMonthButton
                type="button"
                className="h-8 w-8 rounded-lg bg-white p-0 border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                tabIndex={prevDisabled ? -1 : undefined}
                aria-disabled={prevDisabled ? true : undefined}
                aria-label={labels.labelPrevious(previousMonth)}
                onClick={() => {
                    if (previousMonth) goToMonth(previousMonth)
                }}
            >
                <Chevron
                    disabled={prevDisabled ? true : undefined}
                    className="h-4 w-4"
                    orientation={dir === "rtl" ? "right" : "left"}
                />
            </components.PreviousMonthButton>

            <div className="flex items-center gap-2">{children}</div>

            <components.NextMonthButton
                type="button"
                className="h-8 w-8 rounded-lg bg-white p-0 border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                tabIndex={nextDisabled ? -1 : undefined}
                aria-disabled={nextDisabled ? true : undefined}
                aria-label={labels.labelNext(nextMonth)}
                onClick={() => {
                    if (nextMonth) goToMonth(nextMonth)
                }}
            >
                <Chevron
                    disabled={nextDisabled ? true : undefined}
                    className="h-4 w-4"
                    orientation={dir === "rtl" ? "left" : "right"}
                />
            </components.NextMonthButton>
        </div>
    )
}

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
                month_caption: "flex items-center justify-center gap-2",
                dropdowns: "flex items-center gap-2",
                caption_label: "sr-only",
                dropdown: "rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-200",
                months_dropdown: "min-w-[9.5rem]",
                years_dropdown: "min-w-[6.5rem]",
                nav: "hidden",
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
                MonthCaption: InlineMonthCaption,
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
            hideNavigation
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
