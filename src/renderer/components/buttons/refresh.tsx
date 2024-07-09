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
  // callback([
  //   {
  //     playfab_id: '6599ED7A9FF1FAB6',
  //     display_name: 'RAF Tornado',
  //     aliases: [],
  //     created_at: '2022-10-16T10:54:19.909Z',
  //     platform: 'GamePass',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'BD1090DEB1082E39',
  //     display_name: 'ℋ Zerka',
  //     aliases: [],
  //     created_at: '2022-01-23T18:40:10.802Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'F7C06E874251EF35',
  //     display_name: 'SAK Quixos',
  //     aliases: [],
  //     created_at: '2021-05-29T20:35:26.527Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'D484F12E36039E90',
  //     display_name: 'SAKx Bohyně',
  //     aliases: [],
  //     created_at: '2021-06-18T21:13:15.853Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'F74EFAE3285D36E2',
  //     display_name: 'CaptainFire9469',
  //     aliases: [],
  //     created_at: '2023-06-15T14:06:41.21Z',
  //     platform: 'GamePass',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '7748D3B6DC4C99FB',
  //     display_name: 'maburrito',
  //     aliases: [],
  //     created_at: '2024-05-30T15:45:57.952Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'E1D3057FD0004A5F',
  //     display_name: 'AutisticShanking',
  //     aliases: [],
  //     created_at: '2021-04-23T20:08:12.293Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '350D4904860D9F01',
  //     display_name: 'Nico labricot',
  //     aliases: [],
  //     created_at: '2024-06-03T06:36:01.566Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '258701089DA34B84',
  //     display_name: 'SAK volk',
  //     aliases: [],
  //     created_at: '2022-06-13T17:43:04.736Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '2D677F5077F7A0A5',
  //     display_name: 'Breadstick091',
  //     aliases: [],
  //     created_at: '2024-06-02T21:39:46.891Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '181F7D18B6D5D209',
  //     display_name: 'Freddie2706',
  //     aliases: [],
  //     created_at: '2022-10-14T19:24:27.934Z',
  //     platform: 'GamePass',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '597C7809E4E97CD1',
  //     display_name: 'SAKaflowergoblin',
  //     aliases: [],
  //     created_at: '2021-06-27T20:21:35.233Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '30B11A8C034335C9',
  //     display_name: 'rogal233421',
  //     aliases: [],
  //     created_at: '2024-06-02T08:38:43.672Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '6E883184389867A6',
  //     display_name: 'Vojtěch001',
  //     aliases: [],
  //     created_at: '2024-05-31T08:33:02.074Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'DD79B030B0BC9E17',
  //     display_name: 'High Voltage',
  //     aliases: [],
  //     created_at: '2022-06-15T15:58:23.479Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '9DE6ED6844AC6BB8',
  //     display_name: 'BKM Vgod',
  //     aliases: [],
  //     created_at: '2023-02-06T20:13:17.986Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'F1A43CBA5713FD88',
  //     display_name: 'Underlevel1',
  //     aliases: [],
  //     created_at: '2024-05-31T14:25:51.875Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '79F2443CB5E397AD',
  //     display_name: 'Habeest',
  //     aliases: [],
  //     created_at: '2024-05-31T08:50:15.383Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '51D43419BA21E796',
  //     display_name: 'Gₑₜ ᵦₑₜₜₑᵣ ᵦᵣₒ',
  //     aliases: [],
  //     created_at: '2024-06-02T15:33:26.654Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '70B0F9C91415775C',
  //     display_name: 'M3 My 9',
  //     aliases: [],
  //     created_at: '2021-06-11T19:31:13.247Z',
  //     platform: 'GamePass',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'CE9B8CBB8556D273',
  //     display_name: 'KHORNE Point244',
  //     aliases: [],
  //     created_at: '2023-12-11T11:02:58.049Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '97105160278544ED',
  //     display_name: 'Dupefire',
  //     aliases: [],
  //     created_at: '2021-04-23T22:21:44.529Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '3A6ED2F0F9B86771',
  //     display_name: 'LordLucke0006',
  //     aliases: [],
  //     created_at: '2022-12-09T06:15:42.488Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'AFB472498BE5BDF9',
  //     display_name: 'DiKey2804',
  //     aliases: [],
  //     created_at: '2022-04-20T12:31:00.294Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'EEF6BAED24CAB8A2',
  //     display_name: 'Øxfűłł',
  //     aliases: [],
  //     created_at: '2024-06-03T12:29:32.407Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '277C72E34B056B26',
  //     display_name: 'TimGerrard',
  //     aliases: [],
  //     created_at: '2024-06-01T14:12:30.464Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'F4E4578B86EDA692',
  //     display_name: 'solcious9',
  //     aliases: [],
  //     created_at: '2024-05-31T17:50:49.992Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'B70F427A9260D8A9',
  //     display_name: 'mj9919',
  //     aliases: [],
  //     created_at: '2024-05-31T00:10:42.416Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'E42DF045CC0DBA42',
  //     display_name: 'Karuzo',
  //     aliases: [],
  //     created_at: '2023-12-28T02:10:38.884Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'DA472099B8A00268',
  //     display_name: 'TheMatrix7891',
  //     aliases: [],
  //     created_at: '2022-10-05T10:42:57.351Z',
  //     platform: 'GamePass',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'C6E5D5C34FE111A7',
  //     display_name: 'xiocxs1604',
  //     aliases: [],
  //     created_at: '2022-11-04T18:45:42.728Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'B9AC76C80F6BD400',
  //     display_name: 'SAKa Razorwing Fairy',
  //     aliases: [],
  //     created_at: '2023-02-26T00:52:41.986Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'DD4AF8FE540EEDFE',
  //     display_name: '蝁耗阿',
  //     aliases: [],
  //     created_at: '2024-05-30T17:01:08.374Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'B5303AB6351C7B07',
  //     display_name: 'Royalsiz',
  //     aliases: [],
  //     created_at: '2024-05-30T15:54:09.591Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '9EDE7DDDA41A98D8',
  //     display_name: 'кят Bєrѕєrкєя',
  //     aliases: [],
  //     created_at: '2021-05-26T18:39:52.537Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '647B8F8DD1ABC015',
  //     display_name: 'Phoenix2282',
  //     aliases: [],
  //     created_at: '2024-06-03T12:45:16.923Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '1E68D82E91E0DC24',
  //     display_name: '飞煮牛',
  //     aliases: [],
  //     created_at: '2024-06-01T15:06:36.714Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '4130CCE1ACAC2C99',
  //     display_name: 'WFJWO',
  //     aliases: [],
  //     created_at: '2024-06-03T04:56:49.701Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'B62872905B692364',
  //     display_name: 'BKM PiZZaMAN',
  //     aliases: [],
  //     created_at: '2021-07-30T16:54:05.738Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'DEDD9622A6439836',
  //     display_name: 'Emiracle2020',
  //     aliases: [],
  //     created_at: '2024-06-02T11:36:20.44Z',
  //     platform: 'GamePass',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: true,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command:
  //         'banbyid DEDD9622A6439836 168 "This account is not eligible to play on this server at this time. Get more information at discord.gg/sakclan"',
  //       kick_command:
  //         'kickbyid DEDD9622A6439836 "This account is not eligible to play on this server at this time. Get more information at discord.gg/sakclan"',
  //     },
  //   },
  //   {
  //     playfab_id: '1439D305C97E405',
  //     display_name: 'The Lionheart',
  //     aliases: [],
  //     created_at: '2023-04-24T11:31:34.115Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '5BDEC8D54FF3B4D9',
  //     display_name: '小章没烦恼',
  //     aliases: [],
  //     created_at: '2024-05-30T17:08:36.003Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '112A8720D8369204',
  //     display_name: 'doanu',
  //     aliases: [],
  //     created_at: '2024-06-03T12:48:29.922Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '6730F83320F215AE',
  //     display_name: 'FF.Bartek',
  //     aliases: [],
  //     created_at: '2024-05-31T15:09:54.115Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '9EBB8DD8A3569C0C',
  //     display_name: 'iou1m8e',
  //     aliases: [],
  //     created_at: '2022-12-24T12:49:59.155Z',
  //     platform: 'GamePass',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '81488EF0C411F019',
  //     display_name: 'longzhichenai',
  //     aliases: [],
  //     created_at: '2024-06-02T05:48:00.998Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'E17B2D1208CD61EE',
  //     display_name: 'Anas7210',
  //     aliases: [],
  //     created_at: '2024-05-23T19:02:10.332Z',
  //     platform: 'GamePass',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'B305FAF0AD2B92F3',
  //     display_name: 'teddydyrda',
  //     aliases: [],
  //     created_at: '2023-12-08T21:26:16.482Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '8BD2760AC6E0FB07',
  //     display_name: 'SAKa Kokain',
  //     aliases: [],
  //     created_at: '2023-01-05T16:32:47.165Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'C50C2A45B4BA5345',
  //     display_name: 'Møuthy',
  //     aliases: [],
  //     created_at: '2024-06-01T11:48:52.276Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'F6693D1A32C79598',
  //     display_name: 'ryyizy',
  //     aliases: [],
  //     created_at: '2024-06-03T12:11:10.867Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '7DF53AB9C44DDF14',
  //     display_name: 'Adnandado',
  //     aliases: [],
  //     created_at: '2024-06-03T12:25:11.736Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '5F4270D4961B4588',
  //     display_name: 'Jambon Beurre',
  //     aliases: [],
  //     created_at: '2023-04-17T11:50:21.139Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '8D4975D440CBDE00',
  //     display_name: 'Cruiser',
  //     aliases: [],
  //     created_at: '2023-06-03T20:08:25.721Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'FAC68A82BD71F9EF',
  //     display_name: 'marcio88',
  //     aliases: [],
  //     created_at: '2024-05-30T18:30:32.295Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '74D30D2571113342',
  //     display_name: 'george155green',
  //     aliases: [],
  //     created_at: '2023-05-12T12:15:03.263Z',
  //     platform: 'GamePass',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '6E83221A1300444',
  //     display_name: 'fff32t',
  //     aliases: [],
  //     created_at: '2024-06-01T09:20:04.409Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'E8458F8E8C07F3FC',
  //     display_name: 'MatiKwap',
  //     aliases: [],
  //     created_at: '2024-05-31T20:48:12.066Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '87CA8E13CD3FCCA4',
  //     display_name: 'OMU Marleus',
  //     aliases: [],
  //     created_at: '2023-09-17T11:06:38.582Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'A28243CE7A2C4304',
  //     display_name: 'SAKx Shagedopie',
  //     aliases: [],
  //     created_at: '2021-06-24T00:38:22.683Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '6CCDAA6D003732BD',
  //     display_name: '86Artioa',
  //     aliases: [],
  //     created_at: '2022-10-20T04:05:09.188Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '43D182DA6BB1F0E0',
  //     display_name: 'dannyxwxw',
  //     aliases: [],
  //     created_at: '2024-05-31T16:03:08.618Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '75FCD6FB4CB668EE',
  //     display_name: 'O_Tigas_Delas',
  //     aliases: [],
  //     created_at: '2024-05-30T18:20:42.763Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'D82AA771642D0E9F',
  //     display_name: 'FifiParky',
  //     aliases: [],
  //     created_at: '2024-06-01T19:28:23.28Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'AE627A252C52B55F',
  //     display_name: 'AntonioDelBetis',
  //     aliases: [],
  //     created_at: '2024-06-02T13:21:45.138Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '7D8401113C2A00A9',
  //     display_name: 'CODEX exp NO (46) LV',
  //     aliases: [],
  //     created_at: '2024-02-28T18:12:23.168Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '4773C47070468572',
  //     display_name: 'Samrexosaur',
  //     aliases: [],
  //     created_at: '2024-06-01T10:33:21.349Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '451500EA0DF7193B',
  //     display_name: 'MruFree',
  //     aliases: [],
  //     created_at: '2024-05-31T14:23:32.591Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'FB1B43D14510FFBA',
  //     display_name: 'MossyMosse',
  //     aliases: [],
  //     created_at: '2024-06-02T16:31:30.631Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '4B350230BFA6B182',
  //     display_name: 'Dinodavr',
  //     aliases: [],
  //     created_at: '2024-06-03T11:39:30.558Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: '5C559DDE08E9D924',
  //     display_name: 'Shohzod1505',
  //     aliases: [],
  //     created_at: '2024-06-03T12:49:10.455Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'D4D87ED9FCE48C3A',
  //     display_name: 'Lejonet Från Norden',
  //     aliases: [],
  //     created_at: '2022-11-19T20:54:42.855Z',
  //     platform: 'Steam/Epic',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: false,
  //       is_suspicious: false,
  //       is_new_to_db: false,
  //       was_banned: false,
  //       ban_charges: null,
  //       ban_command: '',
  //       kick_command: '',
  //     },
  //   },
  //   {
  //     playfab_id: 'EAE0E3E2F35692CE',
  //     display_name: 'Lord Moon Moon',
  //     aliases: [],
  //     created_at: '2024-04-29T20:37:25.956Z',
  //     platform: 'GamePass',
  //     trust_info: {
  //       is_admin: false,
  //       is_veteran: false,
  //       is_banned: true,
  //       is_suspicious: false,
  //       is_new_to_db: true,
  //       was_banned: true,
  //       ban_charges: ['cheating'],
  //       ban_command: 'banbyid EAE0E3E2F35692CE 999999 ""',
  //       kick_command: '',
  //     },
  //   },
  // ]);
  // return;

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
