import * as React from "react"
import {ChevronLeft, ChevronRight} from "lucide-react"
import {DayPicker} from "react-day-picker"

import {cn} from "@/lib/utils"
import {buttonVariants} from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const CalendarChevron = ({...props}: any) => {
    if (props.orientation === 'left') {
        return <ChevronLeft className="h-4 w-4"/>;
    }
    return <ChevronRight className="h-4 w-4"/>;
};

function Calendar({
                      className,
                      classNames,
                      showOutsideDays = true,
                      ...props
                  }: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                month_caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-text-main",
                nav: "space-x-1 flex items-center",
                button_previous: cn(
                    buttonVariants({variant: "outline"}),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-muted border-border-main text-text-main absolute left-1"
                ),
                button_next: cn(
                    buttonVariants({variant: "outline"}),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-muted border-border-main text-text-main absolute right-1"
                ),
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex",
                weekday:
                    "text-text-muted rounded-md w-9 font-normal text-[0.8rem]",
                week: "flex w-full mt-2",
                day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].range_end)]:rounded-r-md [&:has([aria-selected].outside)]:bg-muted/50 [&:has([aria-selected])]:bg-muted first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day_button: cn(
                    buttonVariants({variant: "ghost"}),
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-text-main hover:bg-muted hover:text-text-main"
                ),
                range_end: "range_end",
                selected:
                    "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white rounded-full",
                today: "bg-muted text-text-main font-bold border border-primary rounded-md",
                outside:
                    "outside text-text-muted opacity-50 aria-selected:bg-muted/50 aria-selected:text-text-muted aria-selected:opacity-30",
                disabled: "text-text-muted opacity-50",
                range_middle:
                    "aria-selected:bg-muted aria-selected:text-text-main",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: CalendarChevron,
            }}
            {...props}
        />
    )
}

Calendar.displayName = "Calendar"

export {Calendar}