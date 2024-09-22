async function up({ context: queryInterface }) {
  const postIndexes = await queryInterface.showIndex('Posts');
  postIndexes.forEach(async (postIndex) => {
    if (postIndex.name === 'Posts_title_key' || postIndex.name === 'Posts_content_key') {
      await queryInterface.removeConstraint('Posts', postIndex.name);
    }
  });
}
module.exports = { up };
