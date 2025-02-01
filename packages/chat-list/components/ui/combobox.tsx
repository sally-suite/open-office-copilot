"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "chat-list/lib/utils"
import { Button } from "chat-list/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "chat-list/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "chat-list/components/ui/popover"

interface ComboboxProps {
    options: {
        value: string
        text: string
    }[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    children?: React.ReactNode
}

const Combobox: React.FC<ComboboxProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    children
}) => {
    const [open, setOpen] = React.useState(false)

    const selectedText = value
        ? options.find((option) => option.value === value)?.text
        : placeholder

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children ? children : (
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="  justify-between"
                    >
                        {selectedText}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className=" p-0">
                <Command disablePointerSelection={false} >
                    <CommandInput
                        disabled={false}
                        placeholder={`Search ${placeholder.toLowerCase()}`}
                        className="h-9 w-full"
                    />
                    <CommandList>
                        <CommandEmpty>No option found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    {option.text}
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default Combobox