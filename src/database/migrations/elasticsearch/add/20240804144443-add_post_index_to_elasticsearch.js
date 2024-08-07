const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });
const postIndex = 'post_idx';

async function up({ context: queryInterface }) {
  const isPostIndexExist = await client.indices.exists({
    index: postIndex
  });

  if (isPostIndexExist) {
    await client.indices.delete({
      index: postIndex
    });
  }

  const docs = [];
  let posts = await queryInterface.sequelize.query(`
      SELECT id, title, content, "authorId"
      FROM "Posts"
  `);

  posts = posts[0];

  await client.indices.create({
    index: postIndex,
    settings: {
      max_ngram_diff: 12,
      analysis: {
        filter: {
          russian_stop: {
            type: 'stop',
            stopwords: '_russian_'
          },
          russian_stemmer: {
            type: 'stemmer',
            language: 'russian'
          },
          ngram_filter: {
            type: 'edge_ngram',
            min_gram: 3,
            max_gram: 15
          }
        },
        analyzer: {
          russian_custom_analyzer: {
            type: 'custom',
            tokenizer: 'standard',
            filter: [
              'lowercase',
              'trim',
              'russian_stop',
              'russian_stemmer',
              'ngram_filter'
            ]
          }
        }
      }
    },
    mappings: {
      properties: {
        id: {
          type: 'keyword'
        },
        title: {
          type: 'text',
          analyzer: 'russian_custom_analyzer',
          search_analyzer: 'russian'
        },
        content: {
          type: 'text',
          analyzer: 'russian_custom_analyzer',
          search_analyzer: 'russian'
        },
        authorId: {
          type: 'keyword'
        }
      }
    }
  });

  posts.forEach(post => {
    docs.push({
      index: {
        _index: postIndex,
        _id: post.id
      }
    });
    docs.push(post);
  });

  await client.bulk({
    refresh: true,
    operations: docs
  });
}

async function down({ context: queryInterface }) {
  const isPostIndexExist = await client.indices.exists({
    index: postIndex
  });

  if (isPostIndexExist) {
    await client.indices.delete({
      index: postIndex
    });
  }
}

module.exports = { up, down }
