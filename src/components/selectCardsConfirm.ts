import { Component } from '@httpi/client';
import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { getPlayer, getWDCGame, WDCGameState } from '../framework';

export default new Component({
  customId: /^g:select_cards:confirm$/,
  async execute({ user, interaction, respond }) {
    const channelId = interaction.channel?.id;
    if (!channelId) return;

    const game = getWDCGame(channelId);
    if (!game) {
      return respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "❌ There aren't any ongoing games on this channel!",
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    const player = getPlayer(game, user.id);
    if (!player) {
      return respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "❌ You aren't in this game!",
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    if (game.state !== WDCGameState.Started) {
      return respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "❌ Cannot set cards in a game that hasn't started",
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    if (player.health <= 0) {
      return respond({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: '❌ You are dead!',
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    respond({
      type: InteractionResponseType.UpdateMessage,
      data: {
        content: 'lol',
        flags: MessageFlags.Ephemeral,
      },
    });
  },
});