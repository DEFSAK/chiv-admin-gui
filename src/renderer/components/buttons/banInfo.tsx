import { useState } from 'react';
import PresetModal from '../modal/presets';

export type BanInfoProps = {
  reason: string;
  duration: number;
  setReason: (reason: string) => void;
  setDuration: (duration: number) => void;
};

function BanInfo({ reason, duration, setReason, setDuration }: BanInfoProps) {
  const [showModal, setShowModal] = useState(false);

  const handlePresetSelect = (banMsg: string, banTime: number) => {
    setReason(banMsg);
    setDuration(banTime);
    setShowModal(false);
  };

  return (
    <div id="ptcb-right">
      <input
        id="ptcb-reason"
        type="text"
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <input
        id="ptcb-duration"
        type="number"
        min={1}
        max={999999}
        placeholder="Duration"
        value={duration}
        onChange={(e) => {
          let value = parseInt(e.target.value, 10);
          if (value < 1) {
            value = 1;
          } else if (value > 999999) {
            value = 999999;
          }
          setDuration(value);
        }}
      />
      <button
        id="preset-button"
        type="button"
        onClick={() => setShowModal(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          id="preset-icon"
        >
          <path
            fill="#4A72FF"
            d="M8.16663 13.1667h1.66666V8.16666H8.16663v5.00004Zm.83333-6.66671c.23611 0 .43417-.08.59417-.24.16-.16.23972-.35778.23916-.59333-.00055-.23556-.08055-.43334-.24-.59334-.15944-.16-.35722-.24-.59333-.24-.23611 0-.43389.08-.59333.24-.15945.16-.23945.35778-.24.59334-.00056.23555.07944.43361.24.59416.16055.16056.35833.24028.59333.23917Zm0 10.83331c-1.15278 0-2.23611-.2189-3.25-.6566-1.01389-.4378-1.89583-1.0314-2.64583-1.7809-.75-.7494-1.34361-1.6314-1.78084-2.6458-.437218-1.0145-.656107-2.0978-.656663-3.25001-.000556-1.15222.218333-2.23556.656663-3.25.43834-1.01444 1.03195-1.89639 1.78084-2.64583.74889-.74945 1.63083-1.34306 2.64583-1.78084 1.015-.437775 2.09833-.656664 3.25-.656664 1.15164 0 2.23504.218889 3.25004.656664 1.015.43778 1.8969 1.03139 2.6458 1.78084.7489.74944 1.3428 1.63139 1.7817 2.64583.4388 1.01444.6575 2.09778.6558 3.25-.0017 1.15221-.2206 2.23551-.6567 3.25001-.4361 1.0144-1.0297 1.8964-1.7808 2.6458-.7511.7495-1.6331 1.3434-2.6458 1.7817-1.0128.4383-2.0962.6569-3.25004.6558Zm0-1.6666c1.86114 0 3.43754-.6459 4.72914-1.9375 1.2917-1.2917 1.9375-2.8681 1.9375-4.72921s-.6458-3.4375-1.9375-4.72917c-1.2916-1.29166-2.868-1.9375-4.72914-1.9375-1.86111 0-3.4375.64584-4.72917 1.9375-1.29166 1.29167-1.9375 2.86806-1.9375 4.72917s.64584 3.43751 1.9375 4.72921c1.29167 1.2916 2.86806 1.9375 4.72917 1.9375Z"
          />
        </svg>
      </button>
      {showModal && (
        <PresetModal
          setShowModal={setShowModal}
          onSelect={handlePresetSelect}
        />
      )}
    </div>
  );
}

export default BanInfo;
