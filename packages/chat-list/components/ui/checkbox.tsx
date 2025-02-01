/* eslint-disable react/prop-types */
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "chat-list/lib/utils";
import { useState } from "react";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0  border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

interface CheckboxGroupProps {
  options: { value: string, text: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ options, value, onChange, className }) => {
  const handleCheckboxChange = (checkedValue: string) => {
    const updatedValue = value.includes(checkedValue)
      ? value.filter(v => v !== checkedValue)
      : [...value, checkedValue];
    onChange(updatedValue);
  };

  return (
    <div className={cn('flex flex-row items-center flex-wrap', className)}>
      {options.map(option => (
        <div className="flex flex-row items-center m-1" key={option.value} >
          <Checkbox
            id={option.value}
            checked={value.includes(option.value)}
            onCheckedChange={() => handleCheckboxChange(option.value)}
          >
          </Checkbox>
          <label
            htmlFor={option.value}
            className="mx-1 cursor-pointer  text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {option.text}
          </label>
        </div>
      ))}
    </div>
  );
};

CheckboxGroup.displayName = 'CheckboxGroup';

export { Checkbox, CheckboxGroup };
