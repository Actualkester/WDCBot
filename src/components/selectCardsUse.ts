import { Component } from '@httpi/client';
import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { getCard, getPlayer, getWDCGame, WDCGameState } from '../framework';
import { createSelectCardMessage } from '../utils';

export default new Component({
  customId: /^select_cards:use:[0-3]$/,
  async execute({ user, interaction, respond }) {
    const channelId = interaction.channel?.id;
    if (!channelId) return;

    const game = getWDCGame(channelId);
    if (!game) {
      return respond({
        type: InteractionResponseType.UpdateMessage,
        data: {
          content: "❌ There aren't any ongoing games on this channel!",
          components: [],
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
          components: [],
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    if (game.state !== WDCGameState.Started) {
      return respond({
        type: InteractionResponseType.UpdateMessage,
        data: {
          content: "❌ Cannot set cards in a game that hasn't started",
          components: [],
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    if (player.health <= 0) {
      return respond({
        type: InteractionResponseType.UpdateMessage,
        data: {
          content: '❌ You are dead!',
          components: [],
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    if (game.currentlyHandlingTurns) {
      return respond({
        type: InteractionResponseType.UpdateMessage,
        data: {
          content: '❌ Cannot select cards right now!',
          components: [],
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    // Get the card index, and card ID
    const cardIndex = Number(interaction.data?.custom_id.split(':')?.[2] ?? '0');
    const cardId = (interaction.data?.values?.[0] as string) ?? null;

    // Get card information
    const card = getCard(cardId);
    if (!card) {
      return respond({
        type: InteractionResponseType.UpdateMessage,
        data: {
          content: "❌ Card doesn't exist anymore",
          components: [],
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
          components: [],
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    // Check if user can use this card anymore
    if (!playerCard.quantity) {
      return createSelectCardMessage(player, respond, `❌ You ran out of **${card.name}**.`);
    }

    // Check how many times the user is trying to use a card this turn AND the turn cooldown
    const mockChosenCards = [...player.chosenCards];
    mockChosenCards[cardIndex] = { cardId };

    let afterRoundQuantity = playerCard.quantity;
    let checkTurnCooldown = 0;

    for (const chosenCardId of mockChosenCards) {
      if (cardId !== chosenCardId?.cardId) {
        if (checkTurnCooldown) checkTurnCooldown--;
        continue;
      }

      if (checkTurnCooldown) {
        return createSelectCardMessage(
          player,
          respond,
          `❌ This card has a turn cooldown of **${card.turnCooldown}**.`,
        );
      }

      if (afterRoundQuantity <= 0) {
        return createSelectCardMessage(
          player,
          respond,
          `❌ You can only use this card **${playerCard.quantity}** more times in total.`,
        );
      }

      checkTurnCooldown = card.turnCooldown;
      afterRoundQuantity--;
    }

    // Handle custom input if it's a custom input
    if (card.handleCustomInput) {
      return card.handleCustomInput({
        user,
        interaction,
        respond,
        game,
        player,
        card,
        playerCard,
        cardIndex,
      });
    }

    // Set the card
    player.chosenCards[cardIndex] = { cardId };

    // Respond to interaction
    return createSelectCardMessage(player, respond);
  },
});
