import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { formatTurkishPhone } from "@/lib/phone";

type PhoneInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  "onChange" | "type" | "inputMode"
> & {
  onChange?: (value: string) => void;
};

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ onChange, placeholder = "05XX XXX XX XX", maxLength = 14, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="tel"
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange?.(formatTurkishPhone(e.target.value))}
        {...props}
      />
    );
  },
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
