export default function (number, digits) {
  const regex = new RegExp(`(\\d+\\.\\d{${digits}})(\\d)`);
  const value = number.toString().match(regex);

  return value ? parseFloat(value[1]) : number.valueOf();
}
