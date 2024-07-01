import { useRef } from 'react';
import { toast } from 'react-toastify';

function Unban() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div id="ptm-bottom">
      <input type="text" ref={inputRef} placeholder="ID" id="unban-input" />
      <button
        type="button"
        id="unban-button"
        onClick={() => {
          if (inputRef.current && inputRef.current.value.length > 0) {
            const id = toast.loading('Running command...');

            window.electron.ipcRenderer.sendMessage('command', {
              commandName: 'UnbanById',
              command: `UnbanById ${inputRef.current?.value}`,
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
              } else if (args.command === 'UnbanById')
                toast.update(id, {
                  render: `Unbanned ID ${inputRef.current?.value}`,
                  type: 'success',
                  isLoading: false,
                  autoClose: 1000,
                  pauseOnHover: true,
                  closeOnClick: true,
                });
            });

            if (inputRef.current) {
              inputRef.current.value = '';
            }
          }
        }}
      >
        Unban
      </button>
    </div>
  );
}

export default Unban;
