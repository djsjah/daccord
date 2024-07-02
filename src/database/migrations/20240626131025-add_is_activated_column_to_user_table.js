const { Sequelize } = require('sequelize')

async function up({ context: queryInterface }) {
  const tableInfo = await queryInterface.describeTable('Users');
  if (!tableInfo.isActivated) {
    await queryInterface.addColumn('Users', 'isActivated', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  }
}

async function down({ context: queryInterface }) {
  await queryInterface.removeColumn('Users', 'isActivated');
}

module.exports = { up, down }
