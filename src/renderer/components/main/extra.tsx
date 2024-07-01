import MessageButton from '../buttons/message';
import SettingsButton from '../buttons/settings';
import UnbanButton from '../buttons/unban';

type GlassTableMiscProps = {
  onOpenModal: () => void;
};

export default function GlassTableMisc({ onOpenModal }: GlassTableMiscProps) {
  return (
    <div className="ptm-container">
      <div id="ptm-top">
        <SettingsButton onOpenModal={onOpenModal} />
        <MessageButton />
      </div>
      <UnbanButton />
    </div>
  );
}
