import { type IpcMain } from 'electron';
import settings from 'electron-settings';
import { MessageBuilder, Webhook } from 'minimal-discord-webhook-node';

export default (ipc_main: IpcMain) => {
  ipc_main.on('webhook', async (_, data) => {
    const username = settings.getSync('username');

    try {
      const webhook = settings.getSync('webhook') as string;
      const hook = new Webhook(webhook);

      const embed = new MessageBuilder();
      switch (data.type) {
        case 'kick': {
          embed.setTitle('**Player Kicked**');
          embed.setDescription(
            `**${username}** kicked **${data.player.Name} (${data.player.ID})**` +
              `\nReason: **${data.player.Reason}**`,
          );
          break;
        }
        case 'ban': {
          embed.setTitle('**Player Banned**');
          embed.setDescription(
            `**${username}** banned **${data.player.Name} (${data.player.ID})**` +
              `\nDuration: **${data.player.Duration} hour${
                data.player.Duration > 1 ? 's' : ''
              }**\nReason: **${data.player.Reason}**`,
          );
          break;
        }
        default: {
          embed.setTitle('**Unknown Action**');
          embed.setDescription(
            `**${username}** performed an unknown action on **${data.player.Name} (${data.player.ID})**`,
          );
          break;
        }
      }
      embed.setTimestamp();

      await hook.send(embed);
    } catch (error) {
      console.error(error);
    }
  });
};
