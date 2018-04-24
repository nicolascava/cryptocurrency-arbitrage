import { balances } from '../config/Base';

export default function (exchange) {
  balances[exchange.name] = {};
}
