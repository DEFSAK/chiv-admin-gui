import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import SettingsModal from './components/modal/settings';
import GlassTable, { type RefreshFunction } from './components/main/table';
import GlassTableControls from './components/main/controls';
import GlassTableMisc from './components/main/extra';

function Home() {
  const [refreshData, setRefreshData] = useState({});
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Settings');
  const [firstRun, setFirstRun] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleChangeTab = (tab: string) => setActiveTab(tab);
  const handleRefresh = (
    newData: RefreshFunction[] | Record<string, string>[],
  ) => setRefreshData(newData);

  window.electron.ipcRenderer.on('first-run', () => {
    setFirstRun(true);
    toast.error('Please configure the settings before using the app', {
      autoClose: 5000,
    });
    handleOpenModal();
  });

  return (
    <div>
      <GlassTableControls
        onRefresh={handleRefresh}
        reason={reason}
        setReason={setReason}
        duration={duration}
        setDuration={setDuration}
      />
      <GlassTable
        data={Object.values(refreshData)}
        reason={reason}
        duration={duration}
      />
      <GlassTableMisc onOpenModal={handleOpenModal} />
      <ToastContainer
        autoClose={1000}
        limit={5}
        stacked
        position="bottom-right"
        closeOnClick
        theme="light"
        closeButton={false}
      />
      <SettingsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        activeTab={activeTab}
        onChangeTab={handleChangeTab}
        firstRun={firstRun}
        setFirstRun={setFirstRun}
      />
      <div>
        <button
          type="button"
          onClick={() => {
            window.electron.ipcRenderer.sendMessage('auth-user');
            window.electron.ipcRenderer.on('auth-user-success', (TokenData) => {
              console.log(`OAuth Success: ${TokenData}`);
              console.log('User authenticated');

              window.electron.ipcRenderer.sendMessage('encrypt-token', {
                TokenData,
              });
            });
            window.electron.ipcRenderer.on('auth-user-fail', (error) => {
              console.log(`OAuth Fail: ${error}`);
              console.log('User not authenticated');
            });
          }}
        >
          Login Test
        </button>
        <button
          type="button"
          onClick={() => {
            window.electron.ipcRenderer.sendMessage('get-refresh-token');
            window.electron.ipcRenderer.on(
              'get-refresh-token-response',
              (args) => {
                if (!args.token) {
                  console.error(args.error);
                  return;
                }

                window.electron.ipcRenderer.sendMessage('refresh-token', {
                  token: args.token,
                });
              },
            );

            window.electron.ipcRenderer.on(
              'refresh-token-success',
              (TokenData) => {
                console.log(`Token Refresh Success: ${TokenData}`);
                console.log('Token refreshed');
              },
            );
            window.electron.ipcRenderer.on('refresh-token-fail', (args) => {
              console.log(`Token Refresh Fail: ${args.error?.message}`);
              console.log(args.error);
            });
          }}
        >
          Token Refresh Test
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return <Home />;
}
