import buildBalancesObject from './buildBalancesObject';
import buildOrderBookObject from './buildOrderBookObject';

export default function (exchange) {
  buildOrderBookObject(exchange);
  buildBalancesObject(exchange);
}
