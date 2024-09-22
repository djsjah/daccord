async function up({ context: queryInterface }) {
  const tablePostInfo = await queryInterface.describeTable('Posts');
  if (tablePostInfo.access) {
    await queryInterface.removeColumn('Posts', 'access');
  }
}
module.exports = { up }
