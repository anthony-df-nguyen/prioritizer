"use client";

import * as React from "react";
import {
  Label,
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
  errorText,
  defaultValue,
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
      <Listbox
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        by={by}
        disabled={disabled}
        name={name}
      >
        {label ? (
          <Label className="block text-sm/6 font-medium text-gray-900">
            {label}
          </Label>
        ) : null}

        <div className="relative">
          <ListboxButton
            className={[
              "grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900",
              "outline-1 -outline-offset-1 outline-gray-300",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600",
              "sm:text-sm/6",
              disabled ? "opacity-60" : "",
              buttonClassName ?? "",
            ].join(" ")}
          >
            <span className="col-start-1 row-start-1 truncate pr-6">
              {selectedOption ? (
                selectedOption.label
              ) : (
                <span className="text-gray-400">{placeholder}</span>
              )}
            </span>

            <ChevronUpDownIcon
              aria-hidden="true"
              className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
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

      {errorText ? (
        <p className="mt-1 text-sm text-red-600">{errorText}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}
    </div>
  );
}
