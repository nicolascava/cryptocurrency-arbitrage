export default function (supportedExchanges) {
  return exchange => supportedExchanges.indexOf(exchange.name) > -1;
}
