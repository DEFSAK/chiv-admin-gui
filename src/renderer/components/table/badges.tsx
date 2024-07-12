import '../../css/glasstable/badges.css';

interface BadgeProps {
  trustInfo: {
    is_admin: boolean;
    is_veteran: boolean;
    is_suspicious: boolean;
    [key: string]: any;
  };
}

export default function Badges({ trustInfo }: BadgeProps) {
  return (
    <div className="badges">
      {trustInfo.is_admin && <span className="badge admin" />}
      {trustInfo.is_veteran && <span className="badge veteran" />}
      {(trustInfo.is_suspicious || trustInfo.was_banned) && (
        <span className="badge suspicious" />
      )}
    </div>
  );
}
