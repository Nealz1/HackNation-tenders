import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useLanguage } from "../../hooks/useLanguage";
import { helpCapabilities, helpExampleKeys } from "../../config/helpCapabilities";
import "./HelpDialog.css";

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpDialog = ({ isOpen, onClose }: HelpDialogProps) => {
  const { t } = useLanguage();

  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="help-dialog-overlay" onClick={onClose}>
      <div className="help-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="help-dialog-header">
          <h2>{t.help.title}</h2>
          <button className="help-dialog-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="help-dialog-content">
          <p className="help-dialog-intro">{t.help.intro}</p>

          <div className="help-capabilities-list">
            {helpCapabilities.map((capability, index) => (
              <div key={index} className="help-capability-item">
                <div className="help-capability-icon">{capability.icon}</div>
                <div className="help-capability-text">
                  <h3>{t.help[capability.titleKey]}</h3>
                  <p>{t.help[capability.descriptionKey]}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="help-examples">
            <h3>{t.help.examplesTitle}</h3>
            <ul>
              {helpExampleKeys.map((exampleKey) => (
                <li key={exampleKey}>"{t.help[exampleKey]}"</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

