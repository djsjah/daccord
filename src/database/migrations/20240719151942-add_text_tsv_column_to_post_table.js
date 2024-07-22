const { Sequelize } = require('sequelize')

async function up({ context: queryInterface }) {
  const tableInfo = await queryInterface.describeTable('Posts');
  if (!tableInfo.text_tsv) {
    await queryInterface.addColumn('Posts', 'text_tsv', {
      type: Sequelize.TSVECTOR,
      allowNull: true,
    });

    await queryInterface.bulkUpdate('Posts', {
      text_tsv: Sequelize.literal(
        `setweight(to_tsvector('russian', "title"), 'A') || setweight(to_tsvector('russian', "content"), 'B')`
      )
    }, {});

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_text_tsv()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.title IS NOT NULL OR NEW.content IS NOT NULL THEN
          NEW.text_tsv := setweight(to_tsvector('russian', NEW.title), 'A') ||
                          setweight(to_tsvector('russian', NEW.content), 'B');
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_text_tsv_trigger
      BEFORE INSERT OR UPDATE ON \"Posts\"
      FOR EACH ROW EXECUTE PROCEDURE update_text_tsv();
    `);

    await queryInterface.addIndex('Posts',
      [
        'text_tsv'
      ],
      {
        using: 'gin',
        unique: false,
        name: 'post_title_content_gin_idx'
      }
    );
  }
}

async function down({ context: queryInterface }) {
  const tableInfo = await queryInterface.describeTable('Posts');
  if (tableInfo.text_tsv) {
    await queryInterface.dropTrigger('Posts', 'update_text_tsv_trigger');
    await queryInterface.removeIndex('Posts', 'post_title_content_gin_idx');
    await queryInterface.removeColumn('Posts', 'text_tsv');
    await queryInterface.dropFunction('update_text_tsv', []);
  }
}

module.exports = { up, down }
