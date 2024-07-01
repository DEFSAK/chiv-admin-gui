/* eslint-disable jsx-a11y/label-has-associated-control */
export interface HeaderProps {
  isAllChecked: boolean;
  toggleAll: (isChecked: boolean, filteredData: any[]) => void;
  setSearchTerm: (term: string) => void;
  filteredData: any[];
}

function Header({
  isAllChecked,
  toggleAll,
  setSearchTerm,
  filteredData,
}: HeaderProps) {
  return (
    <div className="pt-header">
      <div className="col pt-name">
        <label className="custom-checkbox">
          <input
            className="pt-checkbox"
            type="checkbox"
            checked={isAllChecked}
            onChange={(e) => toggleAll(e.target.checked, filteredData)}
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
    </div>
  );
}

export default Header;
