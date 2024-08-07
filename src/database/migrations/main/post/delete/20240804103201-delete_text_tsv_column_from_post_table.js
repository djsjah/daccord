async function up({ context: queryInterface }) {
  const tablePostInfo = await queryInterface.describeTable('Posts');
  const tablePostIndexes = await queryInterface.showIndex('Posts');
  const tablePostGinIndex = tablePostIndexes.find(index => index.name === 'post_title_content_gin_idx');

  if (tablePostGinIndex) {
    await queryInterface.removeIndex('Posts', 'post_title_content_gin_idx');
  }

  if (tablePostInfo.text_tsv) {
    await queryInterface.removeColumn('Posts', 'text_tsv');
  }

  await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS update_text_tsv_trigger ON "Posts"`);
  await queryInterface.sequelize.query(`DROP FUNCTION IF EXISTS update_text_tsv`);
  await queryInterface.sequelize.query(`
    DELETE FROM "SequelizeMeta" WHERE name = '20240719151942-add_text_tsv_column_to_post_table.js';
  `);
}
module.exports = { up }
