import React, { createRef, RefObject } from 'react';
import { toast } from 'react-toastify';
import Dropdown from '../dropdown/dropdown';

function Message() {
  const DropdownRef: RefObject<Dropdown> = createRef();
  const InputRef = createRef<HTMLInputElement>();

  const SendMessage = (e: React.KeyboardEvent<HTMLInputElement> | null) => {
    if (InputRef.current?.value.length === 0) return;
    if (e && e.key !== 'Enter') return;

    if (DropdownRef.current) {
      const id = toast.loading('Running command...');

      const commandName = `${DropdownRef.current.state.haveText}Say`;

      window.electron.ipcRenderer.sendMessage('command', {
        commandName,
        command: `${commandName} "${InputRef.current?.value}"`,
      });

      window.electron.ipcRenderer.once('command-response', (args) => {
        if (args.error) {
          toast.update(id, {
            render: args.error,
            type: 'error',
            isLoading: false,
            autoClose: 1000,
            pauseOnHover: true,
            closeOnClick: true,
          });
          return;
        }

        toast.update(id, {
          render: `Sent message: ${InputRef.current?.value}`,
          type: 'success',
          isLoading: false,
          autoClose: 1000,
          pauseOnHover: true,
          closeOnClick: true,
        });
      });

      InputRef.current!.value = '';
    }
  };

  return (
    <div id="ptm-input-container">
      <input
        type="text"
        id="aos-input"
        ref={InputRef}
        placeholder="Enter message"
        onKeyDown={(e) => SendMessage(e)}
      />
      <button type="button" id="aos-send" onClick={() => SendMessage(null)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="18"
          fill="none"
          id="send-icon"
        >
          <path
            fill="#999"
            d="m1.4 17.4 17.45-7.48c.1804-.07684.3342-.20502.4423-.3686.1081-.16357.1658-.35532.1658-.5514 0-.19607-.0577-.38782-.1658-.5514-.1081-.16357-.2619-.29175-.4423-.3686L1.4.600002C1.2489.534097 1.08377.506845.919509.520705.755246.534566.597018.589102.459098.679394.321179.769687.207908.892895.129505 1.0379c-.0784041.14501-.119474.30726-.11950501.4721L0 6.12c0 .5.37.93.87.99L15 9 .87 10.88c-.5.07-.87.5-.87 1l.00999999 4.61c0 .71.73000001 1.2 1.39000001.91Z"
          />
        </svg>
      </button>
      <Dropdown ref={DropdownRef} />
    </div>
  );
}

export default Message;
