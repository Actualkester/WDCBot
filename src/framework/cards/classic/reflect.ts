import { Card } from '../../structures';
import { CardType } from '../../types';

export default new Card({
  id: 'reflect',
  types: [CardType.Defensive],
  name: 'Reflect',
  description: 'Reflect a move.',
  image: 'https://i.imgur.com/Jsa3l1s.png',
  order: 0,
  suborder: 0,
  quantity: 3,

  execute(ctx) {
    // WIP
  },
});
