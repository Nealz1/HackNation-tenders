import { useState, useEffect } from "react";
import "./SettingsDialog.css";
import { CloseIcon, CopyIcon } from "../icons";
import { useTranslations } from "../../hooks/useTranslations";
import { useAccount } from "../../hooks/useAccount";
import { getModifierKey, getEscapeKey } from "../../utils/platformUtils";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeSessions?: any[];
  onArchiveMultiple?: (sessionIds: number[]) => Promise<void>;
  onDeleteMultiple?: (sessionIds: number[]) => Promise<void>;
  onOpenKeyboardShortcuts?: () => void;
  user?: any;
}

type Tab = "general" | "account" | "shortcuts";

export const SettingsDialog = ({
  isOpen,
  onClose,
  user,
}: SettingsDialogProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [emailCopied, setEmailCopied] = useState(false);
  const { t, language } = useTranslations();
  const { accountInfo, updateAccountInfo, resetAccountInfo, getFullEmail } = useAccount(user);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleCopyEmail = async () => {
    const fullEmail = getFullEmail();
    if (!fullEmail) return;

    try {
      await navigator.clipboard.writeText(fullEmail);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy email:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="settings-close" onClick={onClose} title={t.settings.close}>
          <CloseIcon />
        </button>

        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button
              className={`settings-nav-item ${activeTab === "general" ? "active" : ""}`}
              onClick={() => setActiveTab("general")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" />
              </svg>
              {t.settings.general}
            </button>

            {user && (
              <button
                className={`settings-nav-item ${activeTab === "account" ? "active" : ""}`}
                onClick={() => setActiveTab("account")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {t.settings?.account || 'Account'}
              </button>
            )}



            <button
              className={`settings-nav-item ${activeTab === "shortcuts" ? "active" : ""}`}
              onClick={() => setActiveTab("shortcuts")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20m9-9H3" />
              </svg>
              {t.settings.shortcuts}
            </button>
          </nav>
        </div>

        <div className="settings-content">
          {activeTab === "general" && (
            <>
              <h2 className="settings-title">{t.settings.general}</h2>

              <div className="settings-section">
                <p className="settings-placeholder">{language === 'pl' ? 'Ogólne ustawienia aplikacji' : 'General application settings'}</p>
              </div>
            </>
          )}

          {activeTab === "account" && (
            <>
              <h2 className="settings-title">Account</h2>

              <div className="settings-section">
                <div className="settings-row">
                  <div className="settings-label">
                    <span>{t.settings.accountFields?.name || 'Name'}</span>
                  </div>
                  <div className="settings-control">
                    <input
                      type="text"
                      className="settings-input"
                      value={accountInfo.firstName}
                      onChange={(e) => updateAccountInfo({ firstName: e.target.value })}
                      placeholder={language === 'pl' ? 'Wprowadź swoje imię' : 'Enter your first name'}
                    />
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-label">
                    <span>{t.settings.accountFields?.surname || 'Surname'}</span>
                  </div>
                  <div className="settings-control">
                    <input
                      type="text"
                      className="settings-input"
                      value={accountInfo.lastName}
                      onChange={(e) => updateAccountInfo({ lastName: e.target.value })}
                      placeholder={language === 'pl' ? 'Wprowadź swoje nazwisko' : 'Enter your last name'}
                    />
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-label">
                    <span>{t.settings.accountFields?.group || 'Group'}</span>
                  </div>
                  <div className="settings-control">
                    <input
                      type="text"
                      className="settings-input"
                      value={accountInfo.groupName}
                      onChange={(e) => updateAccountInfo({ groupName: e.target.value })}
                      placeholder={language === 'pl' ? 'Wprowadź swoją grupę (np. WCY21IL1S0)' : 'Enter your group (e.g. WCY21IL1S0)'}
                    />
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-label">
                    <span>{t.settings.accountFields?.studentIndex || 'Student Index'}</span>
                  </div>
                  <div className="settings-control">
                    <input
                      type="text"
                      className="settings-input"
                      value={accountInfo.studentIndex}
                      onChange={(e) => updateAccountInfo({ studentIndex: e.target.value })}
                      placeholder={language === 'pl' ? 'Wprowadź swój indeks studencki' : 'Enter your student index number'}
                    />
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-label">
                    <span>{t.settings.accountFields?.phoneNumber || 'Phone Number'}</span>
                  </div>
                  <div className="settings-control">
                    <input
                      type="tel"
                      className="settings-input"
                      value={accountInfo.phoneNumber}
                      onChange={(e) => updateAccountInfo({ phoneNumber: e.target.value })}
                      placeholder={language === 'pl' ? 'Wprowadź swój numer telefonu' : 'Enter your phone number'}
                    />
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-label">
                    <span>{t.settings.accountFields?.faculty || 'Faculty'}</span>
                  </div>
                  <div className="settings-control">
                    <select
                      className="settings-input"
                      value={accountInfo.faculty}
                      onChange={(e) => updateAccountInfo({ faculty: e.target.value })}
                    >
                      <option value="">{language === 'pl' ? 'Wybierz wydział' : 'Select faculty'}</option>
                      <option value="Wydział Cybernetyki">WCY - Wydział Cybernetyki</option>
                      <option value="Wydział Elektroniki">WEL - Wydział Elektroniki</option>
                      <option value="Wydział Inżynierii Lądowej i Geodezji">WIG - Wydział Inżynierii Lądowej i Geodezji</option>
                      <option value="Wydział Inżynierii Mechanicznej">WIM - Wydział Inżynierii Mechanicznej</option>
                      <option value="Wydział Lotnictwa i Kosmonautyki">WLO - Wydział Lotnictwa i Kosmonautyki</option>
                      <option value="Wydział Mechaniczny">WML - Wydział Mechaniczny</option>
                      <option value="Wydział Techniki Chemicznej">WTC - Wydział Techniki Chemicznej</option>
                      <option value="Instytut Optoelektroniki">IOE - Instytut Optoelektroniki</option>
                    </select>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-label">
                    <span>{language === 'pl' ? 'Poziom Studiów' : 'Study Level'}</span>
                  </div>
                  <div className="settings-control">
                    <select
                      className="settings-input"
                      value={accountInfo.studyLevel || ""}
                      onChange={(e) => updateAccountInfo({ studyLevel: e.target.value })}
                    >
                      <option value="">{language === 'pl' ? 'Wybierz poziom studiów' : 'Select study level'}</option>
                      <option value="I">I - {language === 'pl' ? 'inżynierskie' : 'bachelor\'s'}</option>
                      <option value="II">II - {language === 'pl' ? 'magisterskie' : 'master\'s'}</option>
                      <option value="JM">JM - {language === 'pl' ? 'jednolite magisterskie' : 'uniform master\'s'}</option>
                    </select>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-label">

                  </div>
                  <div className="settings-control">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="settings-input"
                        value={accountInfo.email}
                        onChange={(e) => updateAccountInfo({ email: e.target.value })}
                        placeholder={language === 'pl' ? 'Wprowadź nazwę użytkownika email' : 'Enter email username'}
                        style={{ flex: 1 }}
                      />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {accountInfo.emailDomain}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-label">
                    <span>{t.settings.accountFields?.fullEmail || 'Full Email'}</span>
                  </div>
                  <div className="settings-control">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--input-border)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '14px'
                      }}>
                        {getFullEmail() || (language === 'pl' ? 'Uzupełnij pola email powyżej' : 'Complete email fields above')}
                      </div>
                      {getFullEmail() && (
                        <button
                          onClick={handleCopyEmail}
                          style={{
                            padding: '8px 12px',
                            background: emailCopied ? 'var(--success-bg, #10b981)' : 'var(--bg-tertiary)',
                            border: '1px solid var(--input-border)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: emailCopied ? 'white' : 'var(--text-primary)',
                            transition: 'all 0.2s ease',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                          title={language === 'pl' ? 'Kopiuj email' : 'Copy email'}
                        >
                          {emailCopied ? (
                            <>
                              ✓ {language === 'pl' ? 'Skopiowano!' : 'Copied!'}
                            </>
                          ) : (
                            <>
                              <CopyIcon width={16} height={16} />
                              {language === 'pl' ? 'Kopiuj' : 'Copy'}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section-divider"></div>

              <div className="settings-section">
                <h3 className="settings-section-title">{language === 'pl' ? 'Adres' : 'Address'}</h3>

                <div className="settings-row">
                  <div className="settings-label">
                    <span>{language === 'pl' ? 'Ulica' : 'Street'}</span>
                  </div>
                  <div className="settings-control">
                    <input
                      type="text"
                      className="settings-input"
                      value={accountInfo.street}
                      onChange={(e) => updateAccountInfo({ street: e.target.value })}
                      placeholder={language === 'pl' ? 'Wprowadź nazwę ulicy' : 'Enter street name'}
                    />
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-label">
                    <span>{language === 'pl' ? 'Numer budynku' : 'Building Number'}</span>
                  </div>
                  <div className="settings-control">
                    <input
                      type="text"
                      className="settings-input"
                      value={accountInfo.buildingNumber}
                      onChange={(e) => updateAccountInfo({ buildingNumber: e.target.value })}
                      placeholder={language === 'pl' ? 'Wprowadź numer budynku' : 'Enter building number'}
                    />
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-label">
                    <span>{language === 'pl' ? 'Numer mieszkania' : 'Apartment Number'}</span>
                  </div>
                  <div className="settings-control">
                    <input
                      type="text"
                      className="settings-input"
                      value={accountInfo.apartmentNumber}
                      onChange={(e) => updateAccountInfo({ apartmentNumber: e.target.value })}
                      placeholder={language === 'pl' ? 'Wprowadź numer mieszkania (opcjonalne)' : 'Enter apartment number (optional)'}
                    />
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-label">
                    <span>{language === 'pl' ? 'Kod pocztowy' : 'Postal Code'}</span>
                  </div>
                  <div className="settings-control">
                    <input
                      type="text"
                      className="settings-input"
                      value={accountInfo.postalCode}
                      onChange={(e) => updateAccountInfo({ postalCode: e.target.value })}
                      placeholder={language === 'pl' ? 'Wprowadź kod pocztowy' : 'Enter postal code'}
                    />
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-label">
                    <span>{language === 'pl' ? 'Miasto' : 'City'}</span>
                  </div>
                  <div className="settings-control">
                    <input
                      type="text"
                      className="settings-input"
                      value={accountInfo.city}
                      onChange={(e) => updateAccountInfo({ city: e.target.value })}
                      placeholder={language === 'pl' ? 'Wprowadź miasto' : 'Enter city'}
                    />
                  </div>
                </div>
              </div>

              <div className="settings-section-divider"></div>

              <div className="settings-section">
                <div className="settings-row">
                  <div className="settings-label">
                    <span>{t.settings.accountFields?.actions || 'Actions'}</span>
                  </div>
                  <div className="settings-control">
                    <button
                      className="settings-action-btn"
                      onClick={resetAccountInfo}
                      style={{
                        background: 'var(--error-bg)',
                        color: 'var(--error-text)',
                        border: '1px solid var(--error-border)',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {t.settings.accountFields?.resetAll || 'Reset All Fields'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}



          {activeTab === "shortcuts" && (
            <>
              <h2 className="settings-title">{language === 'pl' ? 'Skróty klawiszowe' : 'Keyboard shortcuts'}</h2>

              <div className="settings-section">
                <div className="shortcuts-list">
                  <div className="shortcut-item">
                    <div className="shortcut-keys">
                      <kbd className="shortcut-key">{getModifierKey()}</kbd>
                      <span className="shortcut-plus">+</span>
                      <kbd className="shortcut-key">Alt</kbd>
                      <span className="shortcut-plus">+</span>
                      <kbd className="shortcut-key">N</kbd>
                    </div>
                    <span className="shortcut-description">
                      {language === 'pl' ? 'Nowy czat' : 'New chat'}
                    </span>
                  </div>

                  <div className="shortcut-item">
                    <div className="shortcut-keys">
                      <kbd className="shortcut-key">{getModifierKey()}</kbd>
                      <span className="shortcut-plus">+</span>
                      <kbd className="shortcut-key">K</kbd>
                    </div>
                    <span className="shortcut-description">
                      {language === 'pl' ? 'Przeszukaj czaty' : 'Search chats'}
                    </span>
                  </div>

                  <div className="shortcut-item">
                    <div className="shortcut-keys">
                      <kbd className="shortcut-key">{getModifierKey()}</kbd>
                      <span className="shortcut-plus">+</span>
                      <kbd className="shortcut-key">I</kbd>
                    </div>
                    <span className="shortcut-description">
                      {language === 'pl' ? 'Otwórz grupy' : 'Open groups'}
                    </span>
                  </div>

                  <div className="shortcut-item">
                    <div className="shortcut-keys">
                      <kbd className="shortcut-key">{getModifierKey()}</kbd>
                      <span className="shortcut-plus">+</span>
                      <kbd className="shortcut-key">B</kbd>
                    </div>
                    <span className="shortcut-description">
                      {language === 'pl' ? 'Przełącz pasek boczny' : 'Toggle sidebar'}
                    </span>
                  </div>

                  <div className="shortcut-item">
                    <div className="shortcut-keys">
                      <kbd className="shortcut-key">{getModifierKey()}</kbd>
                      <span className="shortcut-plus">+</span>
                      <kbd className="shortcut-key">,</kbd>
                    </div>
                    <span className="shortcut-description">
                      {language === 'pl' ? 'Otwórz ustawienia' : 'Open settings'}
                    </span>
                  </div>

                  <div className="shortcut-item">
                    <div className="shortcut-keys">
                      <kbd className="shortcut-key">{getModifierKey()}</kbd>
                      <span className="shortcut-plus">+</span>
                      <kbd className="shortcut-key">Shift</kbd>
                      <span className="shortcut-plus">+</span>
                      <kbd className="shortcut-key">A</kbd>
                    </div>
                    <span className="shortcut-description">
                      {language === 'pl' ? 'Otwórz archiwa' : 'Open archives'}
                    </span>
                  </div>

                  <div className="shortcut-item">
                    <div className="shortcut-keys">
                      <kbd className="shortcut-key">/</kbd>
                    </div>
                    <span className="shortcut-description">
                      {language === 'pl' ? 'Aktywuj pole tekstowe' : 'Focus input'}
                    </span>
                  </div>

                  <div className="shortcut-item">
                    <div className="shortcut-keys">
                        <kbd className="shortcut-key">{getEscapeKey()}</kbd>
                    </div>
                    <span className="shortcut-description">
                      {language === 'pl' ? 'Zamknij dialog / Opuść pole tekstowe' : 'Close dialog / Blur input'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>


      </div>
    </div>
  );
};
