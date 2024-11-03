import { Card } from '../../structures';
import { CardType } from '../../types';

export default new Card({
  id: 'classic:powerup',
  types: [CardType.Supportive],
  name: 'Powerup',
  description: 'Double your damage for the next turn only.',
  image: 'https://i.imgur.com/KoiBNIw.png',
  emoji: '⚡',
  order: 0,
  suborder: -2,
  quantity: 1,

  execute({ player, respond }) {
    return respond(`<@${player.userId}> actived a power up!`);
  },
});
