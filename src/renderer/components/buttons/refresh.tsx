import { useState } from 'react';
import { toast } from 'react-toastify';

const { ipcRenderer } = window.electron;

const toast_args = {
  isLoading: false,
  autoClose: 1000,
  pauseOnHover: true,
  closeOnClick: true,
};

const parsePlayerData = (text: string) => {
  const lines = text.split('\n');

  const serverInfo = lines[0].replace('ServerName - ', '');
  const lastSpaceIndex = serverInfo.lastIndexOf(' ');
  const serverName = serverInfo.slice(0, lastSpaceIndex).trim();
  const serverIP = serverInfo.slice(lastSpaceIndex + 1).trim();

  const playerDataLines = lines.slice(2);
  const parsedData: Array<Record<string, string>> = [];

  playerDataLines.forEach((line) => {
    const columns = line.split(' - ');
    columns.splice(-4);

    if (columns.length < 2) return;
    if (columns.length > 2) {
      columns[0] = columns.slice(0, columns.length - 1).join(' - ');
      columns[1] = columns[columns.length - 1];
      columns.splice(2);
    }

    parsedData.push({ display_name: columns[0], playfab_id: columns[1] });
  });

  const filteredData = parsedData.filter((item) => item.playfab_id !== 'NULL');

  return {
    serverName,
    serverIP,
    parsedData: filteredData,
  };
};

const get_players = async (text: string, callback: (data: any) => void) => {
  const { serverName, parsedData } = parsePlayerData(text);
  const access_token = await ipcRenderer.invoke('get-access-token');

  if (!access_token) {
    callback({ error: 'An error occurred while getting the access token.' });
    return;
  }

  const players = await ipcRenderer.invoke('get-players', {
    server: serverName,
    players: parsedData,
    token: access_token,
  });

  if (players.length < 1) {
    callback({ error: 'No players were found.' });
    return;
  }

  callback(players);
};

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

type RefreshProps = {
  onRefresh: (parsedData: RefreshFunction[]) => void;
};

function Refresh({ onRefresh }: RefreshProps) {
  const [state, setState] = useState({
    dataLength: 0,
  });

  return (
    <div id="ptcb-left">
      <button
        id="refresh-button"
        type="button"
        onClick={() => {
          const id = toast.loading('Refreshing players...');

          window.electron.ipcRenderer.sendMessage('command', {
            commandName: 'listplayers',
            command: 'listplayers',
          });
          window.electron.ipcRenderer.once('command-response', async (args) => {
            console.log(`Got response: ${args}`);
            if (args.error) {
              toast.update(id, {
                render: args.error,
                type: 'error',
                ...toast_args,
              });
            } else if (args.command === 'listplayers') {
              const clipboardContents = args.clipboard;
              if (!clipboardContents || clipboardContents.length < 1) {
                toast.update(id, {
                  render: 'No clipboard data found',
                  type: 'error',
                  ...toast_args,
                });

                return;
              }

              get_players(clipboardContents, (data: any) => {
                console.log(data);
                console.log(data.error);
                if (data.error) {
                  toast.update(id, {
                    render: data.error,
                    type: 'error',
                    ...toast_args,
                  });

                  return;
                }

                setState({
                  dataLength: data.length,
                });

                toast.update(id, {
                  render: `Players refreshed!`,
                  type: 'success',
                  ...toast_args,
                });

                data.sort((a: any, b: any) => {
                  if (a.trust_info.is_suspicious) {
                    return -1;
                  }
                  if (b.trust_info.is_suspicious) {
                    return 1;
                  }

                  if (a.trust_info.was_banned) {
                    return -1;
                  }
                  if (b.trust_info.was_banned) {
                    return 1;
                  }

                  return 0;
                });

                onRefresh(data);
              });
            }
          });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          id="refresh-icon"
        >
          <path
            stroke="#67D172"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.23706 5.79032h-3.75m0 0v-3.75m0 3.75 2.65169-2.65168c.96148-.96148 2.18649-1.61626 3.52011-1.88154 1.33362-.265269 2.71594-.12912 3.97224.39123 1.2562.52035 2.3299 1.40154 3.0854 2.53213.7554 1.13059 1.1586 2.4598 1.1586 3.81954 0 1.35975-.4032 2.689-1.1586 3.8196-.7555 1.1305-1.8292 2.0117-3.0854 2.5321-1.2563.5203-2.63862.6565-3.97224.3912-1.33362-.2653-2.55863-.92-3.52011-1.8815"
          />
        </svg>
      </button>
      <p>Players ({state.dataLength})</p>
    </div>
  );
}

export default Refresh;
