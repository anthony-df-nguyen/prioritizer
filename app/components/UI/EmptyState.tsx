interface Props {
  text: string;
  description: string;
  icon?: React.ReactNode;
  primaryOnclick: () => void;
}

export default function EmptyState({ text, description, icon, primaryOnclick }: Props) {
  return (
    <button
      type="button"
      className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 cursor-pointer"
      onClick={primaryOnclick}
    >
      {icon && <div className="h-8 w-8 text-center mx-auto">{icon}</div>}
      <span className="mt-2 block text-sm font-semibold text-gray-900">
        {text}
      </span>
      <span className="mt-2 block text-sm text-gray-900">{description}</span>
    </button>
  );
}
