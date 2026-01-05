import { ExclamationCircleIcon } from "@heroicons/react/16/solid";

type Props = {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  error?: boolean;
  errorText?: string;
  helpText?: string;
  min?: number;
  max?: number;
  required?: boolean;
};

const Slider = ({
  label,
  value,
  onChange,
  error,
  errorText = "There was an error",
  helpText,
  min = 0,
  max = 100,
  required = false,
}: Props) => {
  const color = "#4f39f6";
  return (
    <div>
      {label && (
        <label
          htmlFor="weight"
          className="block text-sm/6 font-bold text-gray-800"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {!error && helpText && (
        <p id="helper-text" className="mt-1 text-xs text-gray-500">
          {helpText}
        </p>
      )}
      {error && (
        <p id="weight-error" className="mt-1 text-xs text-red-500">
          {errorText}
        </p>
      )}
      <div className="mt-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          style={
            { "--slider-color": color ?? "#2563eb" } as React.CSSProperties
          }
          className="slider w-full h-2 rounded-lg cursor-pointer appearance-none"
        />

        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-500">{min}</span>
          <div>
            <span className="font-semibold text-gray-600 ">Value:</span>
            <span className=""> {value}</span>
          </div>
          <span className="text-gray-500">{max}</span>
        </div>
      </div>
    </div>
  );
};

export { Slider };
