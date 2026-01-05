type Props = {
  name: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Toggle = ({ name, label, checked, onChange }: Props) => {
  return (
    <div className="flex items-center gap-2">
      {/* Label */}
      <div className="block text-sm/6 font-bold text-gray-800">{label}</div>
      {/* Toggle */}
      <div className="group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2">
        <span className="size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-5" />

        <input
          name={name}
          checked={checked}
          onChange={onChange}
          type="checkbox"
          aria-label="Use setting"
          className="absolute inset-0 size-full appearance-none focus:outline-hidden"
        />
      </div>
    </div>
  );
};

export { Toggle };
