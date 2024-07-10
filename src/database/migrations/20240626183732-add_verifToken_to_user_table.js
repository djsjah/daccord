const { Sequelize } = require('sequelize')

async function up({ context: queryInterface }) {
  const tableInfo = await queryInterface.describeTable('Users');
  if (!tableInfo.verifToken) {
    await queryInterface.addColumn('Users', 'verifToken', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
}

async function down({ context: queryInterface }) {
  const tableInfo = await queryInterface.describeTable('Users');
  if (tableInfo.verifToken) {
    await queryInterface.removeColumn('Users', 'verifToken');
  }
}

module.exports = { up, down }
