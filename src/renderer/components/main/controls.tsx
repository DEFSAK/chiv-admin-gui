import { type RefreshFunction } from './table';
import RefreshButton from '../buttons/refresh';
import BanInfo from '../buttons/banInfo';

export type GlassTableControlsProps = {
  onRefresh: (parsedData: RefreshFunction[]) => void;
  reason: string;
  setReason: (reason: string) => void;
  duration: number;
  setDuration: (duration: number) => void;
};

export default function GlassTableControls({
  onRefresh,
  reason,
  setReason,
  duration,
  setDuration,
}: GlassTableControlsProps) {
  return (
    <div className="ptcb">
      <RefreshButton onRefresh={onRefresh} />
      <BanInfo
        reason={reason}
        setReason={setReason}
        duration={duration}
        setDuration={setDuration}
      />
    </div>
  );
}
