"use client";

import * as React from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";

type Key = string | number;

// Headless UI exposes a `by` prop on Listbox, but its helper type export varies by version.
// Keep this local to avoid version-specific type errors.
type ByComparator<T> = ((a: T, b: T) => boolean) | (keyof T & string);

export type SelectOption<T> = {
  value: T;
  key: Key;
  label: string;
  disabled?: boolean;
};

export type SelectProps<T> = {
  label?: string;
  value?: T;
  onChange: (value: T) => void;
  options: Array<SelectOption<T>>;
  defaultValue?: T;
  required?: boolean;
  placeholder?: string;

  /** Useful when T is an object and you want stable equality */
  by?: ByComparator<T>;

  /** UI tweaks */
  disabled?: boolean;
  name?: string;

  /** Tailwind overrides */
  className?: string;
  buttonClassName?: string;
  optionsClassName?: string;

  /** Optional error/help text */
  helpText?: string;
  helpPosition?: "top" | "bottom",
  error?: boolean;
  errorText?: string;
};

export function Select<T>({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  by,
  disabled,
  name,
  className,
  buttonClassName,
  optionsClassName,
  helpText,
  helpPosition = "bottom",
  error,
  errorText,
  defaultValue,
  required,
}: SelectProps<T>) {
  const selectedOption = React.useMemo(() => {
    if (value === undefined) return null;

    const isObject = (v: unknown): v is Record<string, unknown> =>
      typeof v === "object" && v !== null;

    const isEqual = (a: T, b: T): boolean => {
      if (!by) return Object.is(a, b);

      if (typeof by === "function") {
        return by(a, b);
      }

      // `by` is a key (string)
      if (typeof by === "string") {
        if (!isObject(a) || !isObject(b)) return false;
        return a[by] === b[by];
      }

      // Should be unreachable, but keep safe default
      return Object.is(a, b);
    };

    return options.find((o) => isEqual(o.value, value)) ?? null;
  }, [value, options, by]);

  return (
    <div className={className}>
      <label
        htmlFor="email"
        className="block text-sm/6 font-bold text-gray-800"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
        {helpText && helpPosition === "top" && (
        <p id="helper-text" className="mt-0 mb-4 text-xs text-gray-500">
          {helpText}
        </p>
      )}

      <div className="mt-2 grid grid-cols-1">
        <Listbox
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          by={by}
          disabled={disabled}
          name={name}
        >
          <div className="relative">
            <ListboxButton
              className={[
                "col-start-1 row-start-1 w-full cursor-default rounded-md bg-white py-1.5 pr-10 pl-3 text-left text-gray-900",
                "outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 outline-gray-300 focus:outline-indigo-300",
                "sm:text-sm/6",
                disabled ? "opacity-60" : "",
                buttonClassName ?? "",
              ].join(" ")}
            >
              <span className="block truncate">
                {selectedOption ? (
                  selectedOption.label
                ) : (
                  <span className="text-gray-400">{placeholder}</span>
                )}
              </span>

              <ChevronUpDownIcon
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 size-5 self-center justify-self-end text-gray-500 sm:size-4"
              />
            </ListboxButton>

            <ListboxOptions
              transition
              className={[
                "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg",
                "outline-1 outline-black/5",
                "data-leave:transition data-leave:duration-100 data-leave:ease-in",
                "data-closed:data-leave:opacity-0",
                "sm:text-sm",
                optionsClassName ?? "",
              ].join(" ")}
            >
              {options.map((opt) => (
                <ListboxOption
                  key={opt.key}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={[
                    "group relative cursor-default py-2 pr-4 pl-8 text-gray-900 select-none",
                    "data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden",
                    "data-disabled:opacity-50 data-disabled:cursor-not-allowed",
                  ].join(" ")}
                >
                  <span className="block truncate font-normal group-data-selected:font-semibold">
                    {opt.label}
                  </span>

                  <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                    <CheckIcon aria-hidden="true" className="size-5" />
                  </span>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </div>

      {errorText && (
        <p id="helper-text" className="mt-1 text-xs text-red-500">
          {errorText}
        </p>
      )}
      {helpText && helpPosition === "bottom" && (
        <p id="helper-text" className="mt-1 text-xs text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
}
