import { useState } from 'react';

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
    ban_charges?: null | string[];
    ban_command?: string;
    kick_command?: string;
  };
}

function TableSort({
  data,
  setData,
}: {
  data: RefreshFunction[] | null;
  setData: (data: RefreshFunction[]) => void;
}) {
  const [dataClone, setDataClone] = useState<RefreshFunction[] | null>(null);
  const [isSorted, setIsSorted] = useState(false);

  const handleClick = () => {
    if (!data) return;
    setDataClone([...data]);

    if (!isSorted && dataClone) {
      setData(
        dataClone.sort((a: any, b: any) => {
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
        }),
      );

      setIsSorted(true);
    } else {
      setData(data);
      setIsSorted(false);
    }
  };

  return (
    <div className="pt-sort">
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
      <button className="pt-sort-button" type="button" onClick={handleClick} />
    </div>
  );
}

export default TableSort;
