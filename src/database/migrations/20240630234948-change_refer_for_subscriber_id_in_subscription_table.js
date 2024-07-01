const { Sequelize } = require('sequelize')

async function up({ context: queryInterface }) {
  await queryInterface.changeColumn('Subscriptions', 'subscriberId', {
    type: Sequelize.UUID,
    references: {
      model: 'Users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    allowNull: false
  });

  await queryInterface.removeConstraint('Subscriptions', 'Subscriptions_subscriberId_fkey');
}

async function down({ context: queryInterface }) {
  await queryInterface.changeColumn('Subscriptions', 'subscriberId', {
    type: Sequelize.UUID,
    references: {
      model: null,
      key: null,
    },
    onUpdate: null,
    onDelete: null,
    allowNull: true,
  });
}

module.exports = { up, down }
