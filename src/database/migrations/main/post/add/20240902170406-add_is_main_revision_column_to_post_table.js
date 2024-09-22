const { Sequelize } = require('sequelize');

async function up({ context: queryInterface }) {
  const postTableInfo = await queryInterface.describeTable('Posts');
  if (!postTableInfo.isMainRevision) {
    await queryInterface.addColumn('Posts', 'isMainRevision', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  }
}
module.exports = { up };
