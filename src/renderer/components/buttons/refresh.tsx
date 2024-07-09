import { useState } from 'react';
import { toast } from 'react-toastify';

const { ipcRenderer } = window.electron;

const parsePlayerData = (text: string) => {
  console.log('\n-----');
  console.log('Parsing clipboard data...');
  console.log(text);
  console.log('-----\n');

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

  console.log('\n-----');
  console.log('Parsed data:');
  console.log(parsedData);
  console.log('-----\n');

  const filteredData = parsedData.filter((item) => item.playfab_id !== 'NULL');

  console.log('\n-----');
  console.log('Filtered parsed data:');
  console.log(filteredData);
  console.log('-----\n');

  return {
    serverName,
    serverIP,
    parsedData: filteredData,
  };
};

const get_players = async (text: string, callback: (data: any) => void) => {
  const { parsedData } = parsePlayerData(text);
  console.log('\n-----');
  console.log('Parsed data passed to *get_players*:');
  console.log(parsedData);
  console.log('-----\n');

  const access_token = await ipcRenderer.invoke('get-access-token');

  console.log('\n-----');
  console.log(
    'Access token fetched from *ipc->get-access-token* in *get_players*:',
  );
  console.log(access_token);
  console.log('-----\n');

  if (!access_token) {
    console.log(
      `There was an error getting the access token. (${access_token})`,
    );

    callback({ error: 'An error occurred while getting the access token.' });
    return;
  }

  const players = await ipcRenderer.invoke('get-players', {
    players: parsedData,
    token: access_token,
  });

  console.log('\n-----');
  console.log('Players fetched from *ipc->get-players* in *get_players*:');
  console.log(players);
  console.log('-----\n');

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
                isLoading: false,
                autoClose: 1000,
                pauseOnHover: true,
                closeOnClick: true,
              });
            } else if (args.command === 'listplayers') {
              const clipboardContents = args.clipboard;
              if (!clipboardContents || clipboardContents.length < 1) {
                toast.update(id, {
                  render: 'No clipboard data found',
                  type: 'error',
                  isLoading: false,
                  autoClose: 1000,
                  pauseOnHover: true,
                  closeOnClick: true,
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
                    isLoading: false,
                    autoClose: 1000,
                    pauseOnHover: true,
                    closeOnClick: true,
                  });

                  return;
                }

                setState({
                  dataLength: data.length,
                });

                toast.update(id, {
                  render: `Players refreshed!`,
                  type: 'success',
                  isLoading: false,
                  autoClose: 1000,
                  pauseOnHover: true,
                  closeOnClick: true,
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
