module.exports = async function (inp, callback) {
  await callback(null, `# ${inp} pid:(${process.pid})`);
};
