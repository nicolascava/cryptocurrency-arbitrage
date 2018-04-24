export default function (env, fallback) {
  return typeof env !== 'undefined' ? JSON.parse(env) : fallback;
}
