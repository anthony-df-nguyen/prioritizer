import "react";

type Props =
  | {
      title: string;
      description?: string | React.ReactNode;
      actionButton: boolean;
      actionText?: string;
      onActionClick?: () => void;
    }
  | {
      title: string;
      description?: string | React.ReactNode;
      actionButton: true;
      actionText: string;
      onActionClick: () => void;
    };

const PageHeader = ({
  title,
  description,
  actionButton,
  actionText,
  onActionClick,
}: Props) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">{title}</div>
        </div>
        {actionButton && (
          <button
            className="submit_button w-auto"
            onClick={onActionClick}
          >
            {actionText}
          </button>
        )}
      </div>
      <div className="text-neutral-500 text-sm mt-4">{description}</div>
    </div>
  );
};

export default PageHeader;
