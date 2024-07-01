const { Sequelize } = require('sequelize')

async function up({ context: queryInterface }) {
  const tableInfo = await queryInterface.describeTable('Subscriptions');
  if (!tableInfo.subscriberName) {
    await queryInterface.addColumn('Subscriptions', 'subscriberName', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
}

async function down({ context: queryInterface }) {
  await queryInterface.removeColumn('Subscriptions', 'subscriberName');
}

module.exports = { up, down }
