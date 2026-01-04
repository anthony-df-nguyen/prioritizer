import "react";

type Props =
  | {
      title: string;
      description?: string | React.ReactNode;
      actionButton: boolean;
      actionText?: string;
      onActionClick?: () => void;
      secondaryActionButton?: React.ReactNode;
      secondaryAction?: () => void;
    }
  | {
      title: string;
      description?: string | React.ReactNode;
      actionButton: true;
      actionText: string;
      onActionClick: () => void;
      secondaryActionButton: React.ReactNode;
      secondaryAction: () => void;
    };

const PageHeader = ({
  title,
  description,
  actionButton,
  actionText,
  onActionClick,
  secondaryAction,
  secondaryActionButton,
}: Props) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">{title}</div>
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
