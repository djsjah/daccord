const { Sequelize } = require('sequelize');

async function up({ context: queryInterface }) {
  const tableInfo = await queryInterface.describeTable('Subscriptions');
  if (!tableInfo.userName) {
    await queryInterface.addColumn('Subscriptions', 'userName', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
}

async function down({ context: queryInterface }) {
  const tableInfo = await queryInterface.describeTable('Subscriptions');
  if (tableInfo.userName) {
    await queryInterface.removeColumn('Subscriptions', 'userName');
  }
}

module.exports = { up, down }
