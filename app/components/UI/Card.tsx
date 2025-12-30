import "react";
import { OutputOf } from "@/shared/ipc/types";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

type Props = {
  onEditClick: () => void;
  active?: boolean;
  title: string;
  hypertext?: string;
  children: React.ReactNode;
};

const Card = ({ onEditClick, active, title, hypertext, children }: Props) => {
 

  return (
    <div
      className={`group divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg flex-auto grow-0 ${
        active && "ring-2 ring-indigo-500"
      }`}
    >
      <div className="px-4 py-5 sm:px-6 flex gap-4 items-center justify-between">
        <div>
          <div className="text-neutral-600 text-xs">{hypertext}</div>
          <div className="font-bold">{title}</div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <PencilSquareIcon
            width={20}
            height={20}
            onClick={onEditClick}
          />
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
