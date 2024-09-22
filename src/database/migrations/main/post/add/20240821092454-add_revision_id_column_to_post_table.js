const { Sequelize } = require('sequelize');

async function up({ context: queryInterface }) {
  const postTableInfo = await queryInterface.describeTable('Posts');
  if (!postTableInfo.revisionGroupId) {
    await queryInterface.addColumn('Posts', 'revisionGroupId', {
      type: Sequelize.UUID,
      allowNull: true
    });
  }
}
module.exports = { up };
