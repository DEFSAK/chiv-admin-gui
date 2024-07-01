/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';

const PresetPunishments: Record<
  string,
  { name: string; description?: string; banMsg: string; banTime: number }
> = {
  hunting: {
    name: 'Hunting/Targeted FFA',
    description: 'FFAing a specific player or group',
    banMsg: 'FFA is not allowed',
    banTime: 168,
  },
  ffa: {
    name: 'FFAing at random',
    description: 'FFAing random players',
    banMsg: 'FFA is not allowed',
    banTime: 24,
  },
  suspicious: {
    name: 'Suspicious activity',
    description:
      'Suspicious activity such as joining with a fresh gamepass account or joining before a server crash',
    banMsg: 'This account is not eligible to play on this server at this time',
    banTime: 240,
  },
  cheating: {
    name: 'Cheating',
    description:
      'Using cheats (flying, speedhack, colored chat messages, crashing the server, ...)',
    banMsg: '',
    banTime: 999999,
  },
  clan_impersonation: {
    name: 'Clan impersonation',
    description: 'Using a clan tag without permission',
    banMsg: 'Only use clan tags when you are a member of that clan',
    banTime: 24,
  },
  player_impersonation: {
    name: 'Player impersonation',
    description:
      'Pretending to be another known player and acting in bad faith',
    banMsg: 'Impersonating other players is not allowed',
    banTime: 24,
  },
  chat_spam: {
    name: 'Chat spam',
    description: 'Spamming chat messages',
    banMsg: 'Chat spam is not allowed',
    banTime: 1,
  },
  harassment: {
    name: 'Harassment',
    description: 'Harassing players in chat or in game',
    banMsg: 'Player harassment is not allowed',
    banTime: 24,
  },
  vk_abuse: {
    name: 'Votekick abuse',
    description:
      'Using votekicks against trusted palyers or due to disagreements etc...',
    banMsg: 'Votekick abuse is not allowed',
    banTime: 24,
  },
  pit_rules: {
    name: 'Pit rule violation',
    description: 'Throwing stuff into the pit',
    banMsg:
      'Throwing rocks or weapons into the pit while standing outside is not allowed',
    banTime: 1,
  },
  racism: {
    name: 'Racism',
    description: 'Racist remarks or behavior',
    banMsg: 'Racism is not allowed',
    banTime: 720,
  },
};

function PresetModal({
  onSelect,
  setShowModal,
}: {
  onSelect: (banMsg: string, banTime: number) => void;
  setShowModal: (showModal: boolean) => void;
}) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setShowModal(false);
      setIsAnimatingOut(false);
    }, 300);
  };

  return (
    <div className={`preset-modal-overlay ${isAnimatingOut ? 'fade-out' : ''}`}>
      <div
        className={`preset-modal-content ${isAnimatingOut ? 'fade-out' : ''}`}
      >
        <div className="preset-modal-items">
          {Object.keys(PresetPunishments).map((key) => {
            const preset = PresetPunishments[key];
            return (
              <div
                className="preset-modal-item"
                onClick={() => onSelect(preset.banMsg, preset.banTime)}
                role="button"
                tabIndex={0}
              >
                <p>
                  <span className="preset-modal-item-name">{preset.name}</span>
                  {` - ${preset.description}` || 'No Description'}
                </p>
              </div>
            );
          })}
        </div>
        <button
          className="preset-modal-close-button"
          type="button"
          onClick={handleClose}
        >
          <svg
            className="preset-modal-close-button-svg"
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
    </div>
  );
}

export default PresetModal;
