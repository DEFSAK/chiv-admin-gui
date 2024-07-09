/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/label-has-associated-control */

import { useState, useEffect } from 'react';
import Badges from './badges';

interface RefreshFunction {
  playfab_id: string;
  display_name: string;
  aliases: string[] | [];
  created_at: string;
  platform: string;
  trust_info: {
    is_admin: boolean;
    is_veteran: boolean;
    is_banned: boolean;
    is_suspicious: boolean;
    is_new_to_db: boolean;
    was_banned: boolean;
    ban_charges: null | string[];
    ban_command: string;
    kick_command: string;
  };
}

export interface BodyProps {
  data: RefreshFunction[];
  checkedItems: { [key: string]: boolean };
  toggleCheckbox: (id: string, canCheck: boolean) => void;
  handleBan: (playerId: string, name: string) => void;
  handleKick: (playerId: string, name: string) => void;
}

function Body({
  data,
  checkedItems,
  toggleCheckbox,
  handleBan,
  handleKick,
}: BodyProps) {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [animatingRows, setAnimatingRows] = useState<Record<number, boolean>>(
    {},
  );
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const toggleRow = (index: number) => {
    if (expandedRows[index]) {
      setAnimatingRows((prev) => ({
        ...prev,
        [index]: true,
      }));
      setTimeout(() => {
        setExpandedRows((prev) => ({
          ...prev,
          [index]: false,
        }));
        setAnimatingRows((prev) => ({
          ...prev,
          [index]: false,
        }));
      }, 300);
    } else {
      setExpandedRows((prev) => ({
        ...prev,
        [index]: true,
      }));
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
  });

  return (
    <div
      className="pt-body"
      style={{
        maxHeight: windowHeight - 270,
      }}
    >
      {data.map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div
          className="row pt-item"
          key={index}
          onClick={() => toggleRow(index)}
          onKeyDown={() => {}}
          tabIndex={0}
          role="button"
        >
          <div className="row-content">
            <div
              className={`col pt-name ${
                item.playfab_id === 'NULL' && 'cheater'
              }`}
            >
              <label
                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                role="button"
                className="custom-checkbox"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={() => {}}
                tabIndex={0}
              >
                <input
                  id={`pt-checkbox-${item.playfab_id}`}
                  type="checkbox"
                  checked={checkedItems[item.playfab_id] || false}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleCheckbox(item.playfab_id, item.playfab_id !== 'NULL');
                  }}
                  disabled={item.playfab_id === 'NULL'}
                />
                <span className="checkbox-icon" />
              </label>
              <div className="display-name-container">
                {item.display_name}
                <Badges trustInfo={item.trust_info} />
              </div>
            </div>
            <div
              className={`col playfab-body ${
                item.playfab_id === 'NULL' && 'cheater'
              }`}
            >
              {item.playfab_id}
            </div>
            <div className="col actions">
              <button
                className="ban-button"
                id={`ban-button-${item.playfab_id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBan(item.playfab_id, item.display_name);
                }}
                disabled={item.playfab_id === 'NULL'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  className="ban-icon"
                >
                  <path
                    fill="#D16767"
                    d="M8.99996.666672C13.5833.666672 17.3333 4.41667 17.3333 9c0 4.5833-3.75 8.3333-8.33334 8.3333-4.58333 0-8.333334-3.75-8.333334-8.3333 0-4.58333 3.750004-8.333328 8.333334-8.333328Zm0 1.666668c-1.58333 0-3 .5-4.08333 1.41666L14.25 13.0833C15.0833 11.9167 15.6666 10.5 15.6666 9c0-3.66666-3-6.66666-6.66664-6.66666ZM13.0833 14.25 3.74996 4.91667C2.83329 6 2.33329 7.41667 2.33329 9c0 3.6667 3 6.6667 6.66667 6.6667 1.58334 0 3.00004-.5 4.08334-1.4167Z"
                  />
                </svg>
              </button>
              <button
                className="kick-button"
                id={`kick-button-${item.playfab_id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleKick(item.playfab_id, item.display_name);
                }}
                disabled={item.playfab_id === 'NULL'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  className="kick-icon"
                >
                  <path
                    fill="#D16767"
                    d="M14.5 1.66666 7.66667 7.24999l-1.00834-.86666 3.00834-1.73334-3.825-3.816662-1.175 1.175002L6.95 4.29166 2.16667 7.04999 1.175 10.625l2.05 3.5417 1.44167-.8334L2.975 10.4167l.29167-1.10004 2.65 1.51664.41666 7.5H8l.41667-8.33331L15.5 2.83333l-1-1.16667Zm-12.33333.83333c.44202 0 .86595.1756 1.17851.48816.31256.31256.48815.73648.48815 1.17851 0 .44203-.17559.86595-.48815 1.17851-.31256.31256-.73649.48816-1.17851.48816C1.24167 5.83333.5 5.09166.5 4.16666s.75-1.66667 1.66667-1.66667Z"
                  />
                </svg>
              </button>
            </div>
          </div>
          {expandedRows[index] && (
            <div
              className={`pt-additional-content ${
                animatingRows[index] ? 'hide' : 'show'
              }`}
              onClick={(e) => e.stopPropagation()}
              role="button"
              onKeyDown={() => {}}
              tabIndex={0}
            >
              <table>
                <tr>
                  <td>Account created</td>
                  <td>{item.created_at}</td>
                </tr>
                <tr>
                  <td>Platform estimate</td>
                  <td>{item.platform}</td>
                </tr>
                <tr>
                  <td>Aliases</td>
                  <td>
                    {item.aliases.length > 0 ? item.aliases.join(', ') : 'None'}
                  </td>
                </tr>
                <tr className="ptac-t-divider">
                  <td />
                  <td />
                </tr>
                <tr>
                  <td>Is Banned</td>
                  <td>{item.trust_info.is_banned ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td>Is New to DB</td>
                  <td>{item.trust_info.is_new_to_db ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td>Was Banned</td>
                  <td>{item.trust_info.was_banned ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td>Ban Charges</td>
                  <td>
                    {item.trust_info.ban_charges
                      ? item.trust_info.ban_charges.join(', ')
                      : 'None'}
                  </td>
                </tr>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Body;
