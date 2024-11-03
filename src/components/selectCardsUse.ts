import { Component } from '@httpi/client';
import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { getCard, getPlayer, getWDCGame, WDCGameState } from '../framework';
import { createSelectCardComponents } from 'src/utils';

export default new Component({
  customId: /^g:select_cards:use:[0-3]$/,
  async execute({ user, interaction, respond }) {
    const channelId = interaction.channel?.id;
    if (!channelId) return;

    const game = getWDCGame(channelId);
    if (!game) {
      return respond({
        type: InteractionResponseType.UpdateMessage,
        data: {
          content: "❌ There aren't any ongoing games on this channel!",
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    const player = getPlayer(game, user.id);
    if (!player) {
      return respond({
        type: InteractionResponseType.UpdateMessage,
        data: {
          content: "❌ You aren't in this game!",
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    if (game.state !== WDCGameState.Started) {
      return respond({
        type: InteractionResponseType.UpdateMessage,
        data: {
          content: "❌ Cannot set cards in a game that hasn't started",
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    if (player.health <= 0) {
      return respond({
        type: InteractionResponseType.UpdateMessage,
        data: {
          content: '❌ You are dead!',
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    // Get the card index, and card ID
    const cardIndex = interaction.data?.custom_id.split(':')?.[3] ?? 0;
    const cardId = interaction.data?.values?.[0] ?? null;

    // Get card information
    const card = getCard(cardId);
    if (!card) {
      return respond({
        type: InteractionResponseType.UpdateMessage,
        data: {
          content: "❌ Card doesn't exist anymore",
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    // Check if user has the card
    const playerCard = player.cards.find((c) => c.cardId === cardId);
    if (!playerCard) {
      return respond({
        type: InteractionResponseType.UpdateMessage,
        data: {
          content: '❌ You do not have this card!',
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    // Check if user can use this card anymore
    if (!playerCard.quantity) {
      return sendResponse(`❌ You ran out of **${card.name}**.`);
    }

    // Check how many times the user is trying to use a card this turn
    let afterRoundQuantity = playerCard.quantity - 1;
    for (const chosenCardId of player.chosenCardIds) {
      if (cardId !== chosenCardId) continue;

      if (afterRoundQuantity <= 0) {
        return sendResponse(
          `❌ You can only use this card **${playerCard.quantity}** more times in total.`,
        );
      }

      afterRoundQuantity--;
    }

    // TODO: Check for turn cooldown

    // Set the card
    player.chosenCardIds[cardIndex] = cardId;

    // Respond to interaction
    return sendResponse();

    function sendResponse(additionalMessage = '') {
      return respond({
        type: InteractionResponseType.UpdateMessage,
        data: {
          content: `### Select your cards${additionalMessage ? `\n> ${additionalMessage}` : ''}`,
          components: createSelectCardComponents(player!),
        },
      });
    }
  },
});
