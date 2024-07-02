const { Sequelize } = require('sequelize')

async function up({ context: queryInterface }) {
  const subscrForeignKeys = await queryInterface.getForeignKeyReferencesForTable('Subscriptions');

  const subscrForeignKeyToBeRemoved = subscrForeignKeys.find(
    fk => fk.referencedTableName === 'Subscriptions'
  );

  const userRefForeignKey = subscrForeignKeys.find(
    fk => fk.columnName === 'subscriberId' && fk.referencedTableName === 'Users'
  );

  if (subscrForeignKeyToBeRemoved) {
    await queryInterface.removeConstraint('Subscriptions', subscrForeignKeyToBeRemoved.constraintName);
  }

  if (!userRefForeignKey) {
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
  }
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
