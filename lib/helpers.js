/**
 * Enable log only for development purpose
 * @param  {...any} args
 */
const devLog = (...args) => {
  // if (true) return;
  console.log(...args);
};

export { devLog };
