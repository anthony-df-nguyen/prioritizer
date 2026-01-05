import { ExclamationCircleIcon } from "@heroicons/react/16/solid";

type Props =
  | {
      label: string;
      value: string | number | undefined;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onBlur?:() => void;
      placeholder?: string;
      required?: boolean;
      type?: string;
      error?: boolean;
      errorText?: string;
      helpText?: string;
    }
  | {
      label: string;
      value: string | number | undefined;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
            onBlur?:() => void;
      placeholder?: string;
      required?: boolean;
      type?: string;
      error: boolean;
      errorText: string;
      helpText?: string;
    };

const Text = ({
  label,
  value,
  onChange,
  error = false,
  errorText = "There was an error",
  helpText,
  placeholder,
  required = false,
  type = "text",
}: Props) => {
  return (
    <div>
      <label
        htmlFor="email"
        className="block text-sm/6 font-bold text-gray-800"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-2 grid grid-cols-1">
        <input
          id={label}
          name={label}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-describedby={`${label}`}
          className={
            "col-start-1 row-start-1 block w-full rounded-md bg-white py-1.5 pr-10 pl-3  outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2  sm:pr-9 sm:text-sm/6" +
            (error
              ? " text-red-900 outline-red-300 focus:outline-red-600 placeholder:text-red-300"
              : " outline-gray-300 focus:outline-indigo-300 placeholder:text-gray-400")
          }
        />
        {error && (
          <ExclamationCircleIcon
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 mr-3 size-5 self-center justify-self-end text-red-500 sm:size-4"
          />
        )}
      </div>
      {error && (
        <p id="email-error" className="mt-1 text-xs text-red-500">
          {errorText}
        </p>
      )}
      {!error && (
        <p id="helper-text" className="mt-1 text-xs text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
};

export {Text};
