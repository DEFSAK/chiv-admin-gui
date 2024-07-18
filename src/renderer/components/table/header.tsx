import TableSort from './sort';

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

/* eslint-disable jsx-a11y/label-has-associated-control */
export interface HeaderProps {
  isAllChecked: boolean;
  toggleAll: (isChecked: boolean, filteredData: RefreshFunction[]) => void;
  setSearchTerm: (term: string) => void;
  filteredData: RefreshFunction[] | null;
  rawData: RefreshFunction[] | null;
  setData: (data: RefreshFunction[]) => void;
}

function Header({
  isAllChecked,
  toggleAll,
  setSearchTerm,
  filteredData,
  rawData,
  setData,
}: HeaderProps) {
  return (
    <div className="pt-header">
      <div className="col pt-name">
        <label className="custom-checkbox">
          <input
            className="pt-checkbox"
            type="checkbox"
            checked={isAllChecked}
            onChange={(e) => {
              if (filteredData) {
                toggleAll(e.target.checked, filteredData);
              }
            }}
          />
          <span className="checkbox-icon" />
        </label>
        Name
        <input
          id="header-search"
          type="text"
          placeholder="Search"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="col playfab">PlayFabPlayerID</div>
      <div className="col actions-header" />
      <TableSort data={rawData} setData={setData} />
    </div>
  );
}

export default Header;
