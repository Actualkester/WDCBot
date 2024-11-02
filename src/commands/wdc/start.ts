import { Subcommand } from '@httpi/client';
import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { ButtonStyle, ComponentType } from '@discordjs/core';

import { getWDCGame, createWDCGame, WDCGameState, type WDCGame } from '../../framework';
import { createPrepEmbeds } from '../../utils';

export default new Subcommand({
  data: {
    name: 'start',
    description: 'Begin a classic Wildly Deadly Cards match',
  },
  async execute({ user, interaction, respond }) {
    const channelId = interaction.channel?.id;
    if (!channelId) return;

    if (getWDCGame(channelId)) {
      return respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: '❌ There is already an ongoing game on this channel!',
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    const game: WDCGame = {
      channelId,
      hostId: user.id,
      mode: 'classic',
      state: WDCGameState.Prep,
      publicInventory: true,
      players: [],
      round: 0,
      loopTimer: null,
      usedCardsWithBeforeAfterFunctions: new Set(),
      kv: new Map(),
    };

    game.players.push({
      userId: user.id,
      health: 0,
      cards: [],
      chosenCardIds: [null, null, null, null],
    });

    createWDCGame(game);

    return respond({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `<@${user.id}>`,
        embeds: createPrepEmbeds(game),
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
                custom_id: 'g:join',
                label: 'Join',
              },
              {
                type: ComponentType.Button,
                style: ButtonStyle.Success,
                custom_id: 'g:start',
                label: 'Start',
              },
              {
                type: ComponentType.Button,
                style: ButtonStyle.Danger,
                custom_id: 'g:disband:start',
                label: 'Disband',
              },
            ],
          },
        ],
      },
    });
  },
});
