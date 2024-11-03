import {
  ButtonStyle,
  ComponentType,
  type APIActionRowComponent,
  type APIMessageActionRowComponent,
  type APISelectMenuOption,
} from 'discord-api-types/v10';
import { getCard, type WDCGame, type WDCGamePlayer } from '../framework';

export function createPrepEmbeds(game: WDCGame) {
  return [
    {
      color: 0x5c2de9,
      author: {
        name: `Preparation ➡ ${game.mode[0].toUpperCase() + game.mode.slice(1)}`,
      },
      description:
        `**Host**: <@${game.hostId}>\n` +
        `**Players (${game.players.length})**: ${
          game.players.length ? `<@${game.players.map((p) => p.userId).join('>, <@')}>` : 'None'
        }`,
    },
  ];
}

export function createSelectCardComponents(
  player: WDCGamePlayer,
): APIActionRowComponent<APIMessageActionRowComponent>[] {
  return [
    createSelectCardComponent(player, 0),
    createSelectCardComponent(player, 1),
    createSelectCardComponent(player, 2),
    createSelectCardComponent(player, 3),
    {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          style: ButtonStyle.Success,
          custom_id: 'g:select_cards:confirm',
          label: 'Submit',
        },
      ],
    },
  ];
}

function createSelectCardComponent(
  player: WDCGamePlayer,
  cardIndex: number,
): APIActionRowComponent<APIMessageActionRowComponent> {
  return {
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.StringSelect,
        custom_id: `g:select_cards:use:${cardIndex}`,
        options: createSelectCardComponentOptions(player, cardIndex),
      },
    ],
  };
}

function createSelectCardComponentOptions(player: WDCGamePlayer, cardIndex: number) {
  const options: APISelectMenuOption[] = [];
  for (const { cardId } of player.cards) {
    const card = getCard(cardId)!;
    options.push({
      label: card.name,
      description: card.description,
      value: card.id,
      default: card.id === player.chosenCardIds[cardIndex],
    });
  }
  return options;
}
