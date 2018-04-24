export default function (poloniex) {
  return () => {
    poloniex.openWebSocket({
      version: 2,
    });
  };
}
