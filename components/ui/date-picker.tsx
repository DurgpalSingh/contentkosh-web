"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerObjectValueProps = {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    value?: never;
    onChange?: never;
}

type DatePickerStringValueProps = {
    value: string;
    onChange: (value: string) => void;
    date?: never;
    setDate?: never;
}

type DatePickerProps = (DatePickerObjectValueProps | DatePickerStringValueProps) & {
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

const DATE_FORMAT = "yyyy-MM-dd"

const parseDateValue = (value: string): Date | undefined => {
    if (!value) return undefined
    const parsedDate = parse(value, DATE_FORMAT, new Date())
    return isValid(parsedDate) ? parsedDate : undefined
}

export function DatePicker(props: DatePickerProps) {
    const { className, placeholder = "Pick a date", disabled = false } = props
    const currentYear = new Date().getFullYear()
    const selectedDate = "value" in props ? parseDateValue(props.value) : props.date

    const onSelectDate = (nextDate: Date | undefined) => {
        if ("onChange" in props) {
            props.onChange(nextDate ? format(nextDate, DATE_FORMAT) : "")
            return
        }

        props.setDate(nextDate)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal h-11 rounded-xl shadow-sm",
                        !selectedDate && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border border-input bg-popover shadow-lg">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={onSelectDate}
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={currentYear + 10}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
