import * as React from "react"
import {ChevronDown, ChevronUp} from "lucide-react"
import {cn} from "@/lib/utils"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"

export interface NumberInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    onChange: (value: number) => void
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    ({className, onChange, value, step = 1, min, max, disabled, ...props}, ref) => {
        const handleIncrement = (e: React.MouseEvent) => {
            e.preventDefault()
            if (disabled) return

            const currentValue = value === '' || value === undefined ? 0 : Number(value)
            const stepValue = Number(step)

            const precision = step.toString().split('.')[1]?.length || 0
            const newValue = Number((currentValue + stepValue).toFixed(precision))

            if (max !== undefined && newValue > Number(max)) return
            onChange(newValue)
        }

        const handleDecrement = (e: React.MouseEvent) => {
            e.preventDefault()
            if (disabled) return

            const currentValue = value === '' || value === undefined ? 0 : Number(value)
            const stepValue = Number(step)

            const precision = step.toString().split('.')[1]?.length || 0
            const newValue = Number((currentValue - stepValue).toFixed(precision))

            if (min !== undefined && newValue < Number(min)) return
            onChange(newValue)
        }

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value

            if (val === "") {
                onChange(0)
                return
            }

            const numVal = parseFloat(val)
            if (!isNaN(numVal)) {
                onChange(numVal)
            }
        }

        return (
            <div className="relative">
                <Input
                    type="number"
                    className={cn(
                        "pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                        className
                    )}
                    ref={ref}
                    value={value}
                    onChange={handleChange}
                    step={step}
                    min={min}
                    max={max}
                    disabled={disabled}
                    {...props}
                />
                <div className="absolute right-0 top-0 h-full flex flex-col border-l border-slate-800">
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-1/2 w-8 p-0 rounded-none rounded-tr-md hover:bg-slate-800 text-slate-400 hover:text-white"
                        onClick={handleIncrement}
                        disabled={disabled}
                        tabIndex={-1}
                    >
                        <ChevronUp className="h-3 w-3"/>
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-1/2 w-8 p-0 rounded-none rounded-br-md hover:bg-slate-800 text-slate-400 hover:text-white border-t border-slate-800"
                        onClick={handleDecrement}
                        disabled={disabled}
                        tabIndex={-1}
                    >
                        <ChevronDown className="h-3 w-3"/>
                    </Button>
                </div>
            </div>
        )
    }
)
NumberInput.displayName = "NumberInput"

export {NumberInput}