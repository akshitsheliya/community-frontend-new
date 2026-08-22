import * as React from "react"
import { cn } from "@/lib/utils"

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  error?: boolean
  onEnter?: () => void
}

export function OtpInput({ 
  value, 
  onChange, 
  length = 6, 
  disabled = false,
  error = false,
  onEnter
}: OtpInputProps) {
  const [otp, setOtp] = React.useState<string[]>(Array(length).fill(""))
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  React.useEffect(() => {
    const newVal = value.split("").slice(0, length)
    const newOtp = Array(length).fill("")
    newVal.forEach((char, index) => {
      newOtp[index] = char
    })
    setOtp(newOtp)
  }, [value, length])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/[^0-9]/g, "")
    if (!val) return

    const newOtp = [...otp]
    // If multiple characters pasted
    if (val.length > 1) {
      const pastedData = val.split("").slice(0, length - index)
      pastedData.forEach((char, i) => {
        newOtp[index + i] = char
      })
      setOtp(newOtp)
      onChange(newOtp.join(""))
      
      // Focus next empty input or last input
      const nextEmptyIndex = newOtp.findIndex(v => !v)
      const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex
      inputRefs.current[focusIndex]?.focus()
      return
    }

    // Single character input
    newOtp[index] = val[val.length - 1] // Take only the last entered char
    setOtp(newOtp)
    onChange(newOtp.join(""))

    // Move to next input
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      const newOtp = [...otp]
      
      if (newOtp[index]) {
        // Clear current input if it has a value
        newOtp[index] = ""
        setOtp(newOtp)
        onChange(newOtp.join(""))
      } else if (index > 0) {
        // Move to previous input and clear it if current is empty
        newOtp[index - 1] = ""
        setOtp(newOtp)
        onChange(newOtp.join(""))
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    } else if (e.key === "Enter") {
      if (onEnter) {
        e.preventDefault()
        onEnter()
      }
    }
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otp[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          disabled={disabled}
          className={cn(
            "w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold border rounded-lg outline-none transition-all",
            "focus:border-theme focus:ring-1 focus:ring-theme",
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300",
            disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : "bg-white"
          )}
        />
      ))}
    </div>
  )
}
