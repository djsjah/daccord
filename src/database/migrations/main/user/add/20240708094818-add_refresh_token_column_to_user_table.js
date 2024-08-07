const { Sequelize } = require('sequelize');

async function up({ context: queryInterface }) {
  const tableInfo = await queryInterface.describeTable('Users');
  if (!tableInfo.refreshToken) {
    await queryInterface.addColumn('Users', 'refreshToken', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  }
}

async function down({ context: queryInterface }) {
  const tableInfo = await queryInterface.describeTable('Users');
  if (tableInfo.refreshToken) {
    await queryInterface.removeColumn('Users', 'refreshToken');
  }
}

module.exports = { up, down }
