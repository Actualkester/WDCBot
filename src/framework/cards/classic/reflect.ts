import { Card } from '../../structures';
import { CardType } from '../../types';
import { getRandomMessage } from '../../utils';

export default new Card({
  id: 'classic:reflect',
  types: [CardType.Defensive],
  name: 'Reflect',
  description: 'Reflect a move.',
  image: 'https://i.imgur.com/qMGAGz0.png',
  emoji: '🪞',
  order: 0,
  suborder: -2,
  quantity: 3,

  execute({ player, playerCard, respond }) {
    playerCard.quantity--;
    return respond(
      getRandomMessage(this.id, 'success', {
        attacker: `<@${player.userId}>`,
      }),
    );
  },
});
