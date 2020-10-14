module.exports = async function child(inp, callback): Promise<void> {
  await callback(null, `# ${inp} pid:(${process.pid})`);
};
