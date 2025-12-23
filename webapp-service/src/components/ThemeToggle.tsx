import {Moon, Sun} from "lucide-react"
import {useTheme} from "@/context/ThemeContext"

export function ThemeToggle() {
    const {setTheme, resolvedTheme} = useTheme()

    return (
        <div
            className="fixed bottom-6 right-6 z-50 flex items-center p-1 rounded-full bg-surface-card/80 backdrop-blur-md border border-border-main shadow-lg">
            {/* Sliding Background Indicator */}
            <div
                className={`absolute h-9 w-9 rounded-full bg-primary shadow-sm transition-all duration-300 ease-out ${
                    resolvedTheme === "light" ? "left-1" : "left-10"
                }`}
            />

            <button
                onClick={() => setTheme("light")}
                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                    resolvedTheme === "light"
                        ? "text-white"
                        : "text-text-muted hover:text-text-main"
                }`}
                aria-label="Set light theme"
            >
                <Sun className="h-5 w-5"/>
            </button>

            <button
                onClick={() => setTheme("dark")}
                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                    resolvedTheme === "dark"
                        ? "text-white"
                        : "text-text-muted hover:text-text-main"
                }`}
                aria-label="Set dark theme"
            >
                <Moon className="h-5 w-5"/>
            </button>
            <span className="sr-only">Toggle theme</span>
        </div>
    )
}