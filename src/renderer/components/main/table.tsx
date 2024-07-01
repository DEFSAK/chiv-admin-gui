import { useEffect, useState } from 'react';
import { toast, type Id } from 'react-toastify';
import GlassTableBody from '../table/body';
import GlassTableHeader from '../table/header';

import '../../css/glasstable/table.css';

export interface RefreshFunction {
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

export interface TableData {
  data: RefreshFunction[];
  reason: string;
  duration: number;
}

const toast_options = {
  isLoading: false,
  autoClose: 1000,
  pauseOnHover: true,
  closeOnClick: true,
};

const run_command = (command: string, param: string, toastId: Id) => {
  window.electron.ipcRenderer.sendMessage('command', {
    commandName: command,
    command: `${command} ${param}`,
  });

  window.electron.ipcRenderer.on('command-response', (args) => {
    toast.update(toastId, {
      type: args.command !== command || args.error ? 'error' : 'success',
      render: args.command !== command || args.error ? args.error : 'Success!',
      ...toast_options,
    });
  });
};

function GlassTable({ data, reason, duration }: TableData) {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAllChecked, setIsAllChecked] = useState<boolean>(false);

  const toggleCheckbox = (id: string, canToggle: boolean) => {
    if (!canToggle) return;
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = (isChecked: boolean, filteredData: RefreshFunction[]) => {
    const newCheckedItems: { [key: string]: boolean } = { ...checkedItems };
    filteredData.forEach((item: { playfab_id: string }) => {
      if (item.playfab_id !== 'NULL') {
        newCheckedItems[item.playfab_id] = isChecked;
      }
    });

    setCheckedItems(newCheckedItems);
    setIsAllChecked(
      filteredData.every(
        (item) =>
          item.playfab_id === 'NULL' ||
          newCheckedItems[item.playfab_id] === isChecked,
      ),
    );
  };

  const getFilteredData = () => {
    const searchFiltered =
      searchTerm.length > 0
        ? data.filter((item) =>
            item.display_name.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : data;

    const checked = data.filter((item) => checkedItems[item.playfab_id]);

    return [...new Set([...searchFiltered, ...checked])];
  };

  const filteredData = getFilteredData();

  useEffect(() => {
    const validItems = filteredData.filter(
      (item) => item.playfab_id !== 'NULL',
    );
    const allChecked =
      validItems.length > 0 &&
      validItems.every((item) => checkedItems[item.playfab_id]);

    setIsAllChecked(allChecked);
  }, [checkedItems, filteredData]);

  const handle_ban = (playerId: string) => {
    const ban_duration = Number.isNaN(duration) ? 1 : duration;

    const selectedIds = Object.entries(checkedItems)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    if (selectedIds.length > 1) {
      const toastID = toast.loading('Running command...');

      selectedIds.forEach((id) => {
        const item = data.find((ditem) => ditem.playfab_id === id);
        run_command(
          'BanById',
          `${item?.playfab_id} ${ban_duration} "${
            reason ||
            `Banned for ${ban_duration} hour${ban_duration > 1 ? 's' : ''}`
          }"`,
          toastID,
        );
      });
    } else {
      const toastID = toast.loading('Running command...');
      run_command(
        'BanById',
        `${playerId} ${ban_duration} "${
          reason ||
          `Banned for ${ban_duration} hour${ban_duration > 1 ? 's' : ''}`
        }"`,
        toastID,
      );
    }
  };

  const handle_kick = (playerId: string) => {
    const selectedIds = Object.entries(checkedItems)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    if (selectedIds.length > 1) {
      const toastID = toast.loading('Running command...');
      selectedIds.forEach((id) => {
        const item = data.find((ditem) => ditem.playfab_id === id);
        run_command(
          'KickById',
          `${item?.playfab_id} "${reason || 'Kicked'}"`,
          toastID,
        );
      });
    } else {
      const toastID = toast.loading('Running command...');
      run_command('KickById', `${playerId} "${reason || 'Kicked'}"`, toastID);
    }
  };

  return (
    <div className="pt">
      <GlassTableHeader
        isAllChecked={isAllChecked}
        toggleAll={toggleAll}
        setSearchTerm={setSearchTerm}
        filteredData={filteredData}
      />
      <GlassTableBody
        data={filteredData}
        checkedItems={checkedItems}
        toggleCheckbox={toggleCheckbox}
        handleBan={handle_ban}
        handleKick={handle_kick}
      />
    </div>
  );
}

export default GlassTable;
