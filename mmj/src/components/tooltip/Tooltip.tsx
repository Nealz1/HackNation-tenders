import { ReactNode } from "react";
import "./Tooltip.css";

interface TooltipProps {
  children: ReactNode;
  text: string;
  shortcut?: string;
}

export const Tooltip = ({ children, text, shortcut }: TooltipProps) => {
  return (
    <div className="tooltip-wrapper">
      {children}
      <div className="tooltip">
        <span className="tooltip-text">{text}</span>
        {shortcut && <span className="tooltip-shortcut">{shortcut}</span>}
      </div>
    </div>
  );
};

