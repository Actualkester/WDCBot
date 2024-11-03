import { Component } from '@httpi/client';
import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { getPlayer, getWDCGame, handleTurnLoop, WDCGameState } from '../framework';
import { createSelectCardMessage } from '../utils';

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

    if (game.currentlyHandlingTurns) {
      return respond({
        type: InteractionResponseType.UpdateMessage,
        data: {
          content: '❌ Cannot select cards right now!',
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    if (player.chosenCardIds.some((c) => !c)) {
      return createSelectCardMessage(
        player,
        respond,
        '❌ You must first finish selecting all cards before you submit!',
      );
    }

    player.submittedChosenCards = true;

    if (game.players.some((p) => !p.submittedChosenCards)) {
      return createSelectCardMessage(
        player,
        respond,
        '✅ Submitted! You can still make changes until the game begins.',
      );
    }

    createSelectCardMessage(player, respond, '✅ Submitted!');
    return handleTurnLoop({ channelId, game });
  },
});
