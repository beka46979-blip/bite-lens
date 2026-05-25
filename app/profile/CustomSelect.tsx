"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  label: string;
  maxVisibleItems?: number;
  inputType?: "text" | "number";
  max?: number;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  label,
  maxVisibleItems = 5,
  inputType = "text",
  max,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(
    options.find((o) => o.value === value)?.label ?? value,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Sync inputValue when value changes externally
  useEffect(() => {
    const label = options.find((o) => o.value === value)?.label ?? value;
    setInputValue(label);
  }, [value, options]);

  // Scroll selected item into view when dropdown opens
  useEffect(() => {
    if (isOpen && listRef.current && value) {
      const selected = listRef.current.querySelector(
        '[data-selected="true"]',
      ) as HTMLElement;
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen, value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        // Revert input to the real label if user left it half-typed
        const realLabel =
          options.find((o) => o.value === value)?.label ?? value;
        setInputValue(realLabel);
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, value, options]);

  const itemHeight = 36;
  const maxHeight = itemHeight * maxVisibleItems;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    if (inputType === "number") {
      // Только цифры, без минуса и прочего
      raw = raw.replace(/[^0-9]/g, "");

      // Ограничиваем длину по числу цифр в max (напр. max=31 → 2 цифры)
      if (max !== undefined && raw.length > String(max).length) {
        raw = raw.slice(0, String(max).length);
      }

      // Не даём ввести число больше max
      if (max !== undefined && raw !== "" && Number(raw) > max) {
        return; // отклоняем изменение
      }
    }

    setInputValue(raw);
    setIsOpen(true);

    // Ищем точное совпадение по value (число)
    const numMatch = options.find((o) => o.value === raw);
    if (numMatch) {
      onChange(numMatch.value);
      return;
    }
    // Если пусто → очищаем
    if (raw === "") {
      onChange("");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Запрещаем символы, недопустимые в числовых полях
    if (
      inputType === "number" &&
      (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E")
    ) {
      e.preventDefault();
      return;
    }
    if (e.key === "Escape") {
      const realLabel = options.find((o) => o.value === value)?.label ?? value;
      setInputValue(realLabel);
      setIsOpen(false);
    }
    if (e.key === "Enter") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (opt: { value: string; label: string }) => {
    onChange(opt.value);
    setInputValue(opt.label);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>

      {/* Input trigger */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type={inputType}
          min={inputType === "number" ? 1 : undefined}
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          className="w-full px-2 sm:px-3 py-2.5 sm:py-3 md:py-3.5 pr-8 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm md:text-base outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setIsOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
          className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border-2 border-emerald-500 dark:border-emerald-400 rounded-xl shadow-lg overflow-hidden"
          style={{ maxHeight: `${maxHeight}px` }}
        >
          <div
            ref={listRef}
            className="overflow-y-auto"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {options
              .filter((o) => o.value !== "") // skip empty placeholder option
              .map((option) => (
                <button
                  key={option.value}
                  type="button"
                  data-selected={option.value === value}
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent input blur before click fires
                    handleSelect(option);
                  }}
                  className={`w-full px-2 sm:px-3 py-2 text-left text-xs sm:text-sm md:text-base transition-colors ${
                    option.value === value
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                  style={{ minHeight: `${itemHeight}px` }}
                >
                  {option.label}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
