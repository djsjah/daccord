async function up({ context: queryInterface }) {
  const tablePostInfo = await queryInterface.describeTable('Posts');
  if (tablePostInfo.rating) {
    await queryInterface.removeColumn('Posts', 'rating');
  }
}
module.exports = { up }
