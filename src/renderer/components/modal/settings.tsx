/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { toast } from 'react-toastify';
import React, { useEffect, useState } from 'react';
import { IGlobalKeyEvent } from 'node-global-key-listener';
import axios from 'axios';

import '../../css/modal/settings.css';

const { ipcRenderer } = window.electron;

interface SettingsProps {
  username: string;
  consoleKey: IGlobalKeyEvent | undefined;
  setConsoleKey: (value: IGlobalKeyEvent) => void;
  keyActive: boolean;
  setKeyActive: (value: boolean) => void;
  webhook: string;
  setWebhook: (value: string) => void;
}

const toast_settings = {
  isLoading: false,
  autoClose: 1000,
  pauseOnHover: true,
  closeOnClick: true,
};

function Tab1Content({
  username,
  consoleKey,
  setConsoleKey,
  keyActive,
  setKeyActive,
  webhook,
  setWebhook,
}: SettingsProps) {
  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('get-settings');
    window.electron.ipcRenderer.once('get-settings-response', (settings) => {
      setConsoleKey(settings.consoleKey as IGlobalKeyEvent);
      setWebhook(settings.webhook as string);
    });

    if (username.length > 0) {
      window.electron.ipcRenderer.sendMessage('set-username', {
        username,
      });

      console.log('Username set:', username);
    }
  }, [setConsoleKey, setWebhook, username]);

  const handleConsoleKey = (e: React.MouseEvent<HTMLButtonElement>) => {
    const Element = e.currentTarget;
    Element.disabled = true;

    const id = toast.loading('Press your console key...');

    window.electron.ipcRenderer.sendMessage('set-console-key');
    window.electron.ipcRenderer.once('set-console-key-response', (args) => {
      setConsoleKey(args.consoleKey as IGlobalKeyEvent);
      toast.update(id, {
        render: 'Console key updated successfully!',
        type: 'success',
        ...toast_settings,
      });

      Element.disabled = false;
    });
  };

  const handle_webhook_submit = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const Element = e.currentTarget as HTMLInputElement;

    if (e.key === 'Enter' && !keyActive) {
      Element.classList.add('loading');
      const toastID = toast.loading('Testing webhook URL...');

      if (Element.value.length > 0) {
        try {
          const result = await axios.get(Element.value);

          if (result.data.name) {
            toast.update(toastID, {
              render: 'Webhook URL saved!',
              type: 'success',
              ...toast_settings,
            });

            window.electron.ipcRenderer.sendMessage('set-webhook', {
              webhook: Element.value,
            });
          }
        } catch (error: any) {
          toast.update(toastID, {
            render: 'Invalid webhook URL!',
            type: 'error',
            ...toast_settings,
          });
          console.log(error);
        }
      } else {
        toast.update(toastID, {
          render: 'Invalid webhook URL!',
          type: 'error',
          ...toast_settings,
        });
      }

      setKeyActive(true);
    }
  };

  return (
    <div className="modal-settings-page">
      <input
        type="text"
        placeholder="Change Webhook URL (Optional)"
        className="modal-settings-username"
        value={webhook}
        onChange={(e) => setWebhook(e.target.value)}
        onKeyDown={handle_webhook_submit}
        onKeyUp={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.classList.remove('loading');
            setKeyActive(false);
          }
        }}
      />
      <button
        className="modal-settings-console-button"
        type="button"
        onClick={handleConsoleKey}
      >
        Change Console Key
      </button>
      <label className="modal-settings-console-label">
        {consoleKey && `${consoleKey.name} (${consoleKey.vKey})`}
      </label>
    </div>
  );
}

function Tab2Content() {
  return (
    <div className="modal-credits-tab">
      <p>Smiggy - Programming 🤓</p>
      <p>Kontak - UI/UX Design 😎</p>
      {/* <p>The SAK Team - Backend Integration 🤰</p> */}
    </div>
  );
}

function Tab3Content() {
  const [username, setUsername] = useState('');
  const [playfabID, setPlayfabID] = useState('');

  const handleValidation = async () => {
    if (playfabID.length < 1) {
      toast.error('PlayFabPlayerID is required.');
      return;
    }

    const access_token = await ipcRenderer.invoke('get-access-token');

    if (!access_token) {
      toast.error('Failed to get access token.');
      return;
    }

    const players = await ipcRenderer.invoke('get-players', {
      server: '',
      players: [{ display_name: username, playfab_id: playfabID }],
      token: access_token,
    });

    if (players.length < 1) {
      toast.error('No players were found.');
      return;
    }

    console.log(players);
  };

  return (
    <div className="modal-validation-tab">
      <input
        type="text"
        placeholder="Enter Username (Optional but recommended)"
        className="modal-validation-username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter PlayfabPlayerID (Required)"
        className="modal-validation-id"
        value={playfabID}
        onChange={(e) => setPlayfabID(e.target.value)}
      />
      <button
        className="modal-validation-button"
        type="button"
        onClick={handleValidation}
      >
        Validate
      </button>
    </div>
  );
}

export type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onChangeTab: (tab: 'Settings' | 'Credits' | 'Validation') => void;
  firstRun: boolean;
  setFirstRun: (value: boolean) => void;
  tokenUsername: string;
};

function SettingsModal({
  isOpen,
  onClose,
  activeTab,
  onChangeTab,
  firstRun,
  setFirstRun,
  tokenUsername,
}: SettingsModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [consoleKey, setConsoleKey] = useState<IGlobalKeyEvent>();
  const [keyActive, setKeyActive] = useState(false);
  const [webhook, setWebhook] = useState<string>('');

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (!isOpen && isAnimatingOut) {
      const timer = setTimeout(() => {
        setIsAnimatingOut(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isAnimatingOut]);

  const handleClose = () => {
    if (firstRun) {
      if (!consoleKey) {
        toast.error('Please set a console key.');
        return;
      }

      setFirstRun(false);
    }

    setIsAnimatingOut(true);
    setTimeout(onClose, 300);
  };

  if (!isOpen && !isAnimatingOut) return null;

  return (
    <div className={`modal-overlay ${isAnimatingOut ? 'fade-out' : ''}`}>
      <div className={`modal ${isAnimatingOut ? 'fade-out' : ''}`}>
        <div className="tabs">
          <button
            type="button"
            className={`modal-tab-button ${
              activeTab === 'Settings' ? 'active' : ''
            }`}
            onClick={() => onChangeTab('Settings')}
          >
            Settings
          </button>
          <button
            type="button"
            className={`modal-tab-button ${
              activeTab === 'Credits' ? 'active' : ''
            }`}
            onClick={() => onChangeTab('Credits')}
          >
            Credits
          </button>
          <button
            type="button"
            className={`modal-tab-button ${
              activeTab === 'Validation' ? 'active' : ''
            }`}
            onClick={() => onChangeTab('Validation')}
          >
            Validation
          </button>

          <button
            className="modal-close-button"
            type="button"
            onClick={handleClose}
          >
            <svg
              className="modal-close-button-svg"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M26.0612 23.9387C26.343 24.2205 26.5013 24.6027 26.5013 25.0012C26.5013 25.3997 26.343 25.7819 26.0612 26.0637C25.7794 26.3455 25.3972 26.5038 24.9987 26.5038C24.6002 26.5038 24.218 26.3455 23.9362 26.0637L15.9999 18.125L8.0612 26.0612C7.7794 26.343 7.39721 26.5013 6.9987 26.5013C6.60018 26.5013 6.21799 26.343 5.9362 26.0612C5.6544 25.7794 5.49609 25.3972 5.49609 24.9987C5.49609 24.6002 5.6544 24.218 5.9362 23.9362L13.8749 16L5.9387 8.06122C5.6569 7.77943 5.49859 7.39724 5.49859 6.99872C5.49859 6.60021 5.6569 6.21802 5.9387 5.93622C6.22049 5.65443 6.60268 5.49612 7.0012 5.49612C7.39971 5.49612 7.7819 5.65443 8.0637 5.93622L15.9999 13.875L23.9387 5.93497C24.2205 5.65318 24.6027 5.49487 25.0012 5.49487C25.3997 5.49487 25.7819 5.65318 26.0637 5.93497C26.3455 6.21677 26.5038 6.59896 26.5038 6.99747C26.5038 7.39599 26.3455 7.77818 26.0637 8.05998L18.1249 16L26.0612 23.9387Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
        <div className="content">
          {/* eslint-disable-next-line no-nested-ternary */}
          {activeTab === 'Settings' ? (
            <Tab1Content
              username={tokenUsername}
              consoleKey={consoleKey}
              setConsoleKey={setConsoleKey}
              keyActive={keyActive}
              setKeyActive={setKeyActive}
              webhook={webhook}
              setWebhook={setWebhook}
            />
          ) : activeTab === 'Credits' ? (
            <Tab2Content />
          ) : (
            <Tab3Content />
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
