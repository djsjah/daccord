async function up({ context: queryInterface }) {
  const tablePostInfo = await queryInterface.describeTable('Posts');
  if (tablePostInfo.tags) {
    await queryInterface.removeColumn('Posts', 'tags');
  }
}
module.exports = { up }
