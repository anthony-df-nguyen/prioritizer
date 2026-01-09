import "react";
import { FolderIcon } from "@heroicons/react/20/solid";

type Props =
  | {
      title: string;
      description?: string | React.ReactNode;
      actionButton: boolean;
      actionText?: string;
      onActionClick?: () => void;
      secondaryActionButton?: React.ReactNode;
      secondaryAction?: () => void;
      icon: React.ReactNode;
    }
  | {
      title: string;
      description?: string | React.ReactNode;
      actionButton: true;
      actionText: string;
      onActionClick: () => void;
      secondaryActionButton: React.ReactNode;
      secondaryAction: () => void;
      icon: React.ReactNode;
    };

const PageHeader = ({
  title,
  description,
  actionButton,
  actionText,
  onActionClick,
  secondaryAction,
  secondaryActionButton,
  icon,
}: Props) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="">
          <div className="flex items-center gap-2">
            {icon}
            <div className="text-2xl font-semibold text-neutral-800" >{title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {" "}
          {actionButton && (
            <button className="submit_button w-auto" onClick={onActionClick}>
              {actionText}
            </button>
          )}
          {secondaryActionButton && (
            <div onClick={secondaryAction}> {secondaryActionButton}</div>
          )}
        </div>
      </div>
      <div className="text-neutral-500 text-sm mt-4">{description}</div>
    </div>
  );
};

export default PageHeader;
