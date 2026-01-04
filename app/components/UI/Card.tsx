import "react";
import { OutputOf } from "@/shared/ipc/types";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

type Props = {
  onEditClick: () => void;
  selected?: boolean;
  title: string;
  hypertext?: string;
  children: React.ReactNode;
  bgColor?: string;
  active?: boolean;
};

const Card = ({
  onEditClick,
  selected,
  title,
  hypertext,
  children,
  active = true,
}: Props) => {
  const activeClass = "divide-gray-200 bg-white text-black";
  const inactiveClass = "bg-gray-200 divide-gray-300 text-neutral-500";
  return (
    <div
      className={`group divide-y  overflow-hidden rounded-lg ${
        active ? activeClass : inactiveClass
      }  shadow-sm hover:shadow-lg flex-auto grow-0 ${
        selected && "ring-2 ring-indigo-500"
      }`}
    >
      <div className="px-4 py-5 sm:px-6 flex gap-4 items-center justify-between">
        <div>
          <div className="text-neutral-600 text-xs">{hypertext}</div>
          <div className="flex gap-4 items-center"><div className="font-bold">{title}</div>
          {!active && (
            <div className="bg-gray-400 text-white rounded-lg px-2 py-1 text-center text-xs">
              Inactive
            </div>
          )}</div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <PencilSquareIcon width={20} height={20} onClick={onEditClick} />
        </div>
      </div>

      <div className="px-4 py-5 sm:p-6">
        {/* Content Here */}
        {children}
      </div>
    </div>
  );
};

export default Card;
