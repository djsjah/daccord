import { Client } from '@elastic/elasticsearch';
import {
  SearchRequest,
  SearchResponse,
  BulkRequest,
  IndicesCreateRequest
} from '@elastic/elasticsearch/lib/api/types';

class ElasticSearchProvider {
  private readonly client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTIC_URL_DEV
    });
  }

  public async isIndexExist(indexName: string): Promise<boolean> {
    return (
      await this.client.indices.exists({
        index: indexName
      })
    );
  }

  public async createIndex(indexSettings: IndicesCreateRequest): Promise<void> {
    await this.client.indices.create(indexSettings);
  }

  public async populateIndex(docs: BulkRequest[]): Promise<void> {
    await this.client.bulk({
      refresh: true,
      operations: docs
    });
  }

  public async deleteIndex(indexName: string): Promise<void> {
    await this.client.indices.delete({
      index: indexName
    });
  }

  public async indexDocument(indexName: string, documentId: string, documentBody: object): Promise<void> {
    await this.client.index({
      index: indexName,
      id: documentId,
      document: documentBody
    });
  }

  public async updateDocument(
    indexName: string,
    documentId: string,
    newDocumentBody: object
  ): Promise<void>
  {
    await this.client.update({
      index: indexName,
      id: documentId,
      doc: newDocumentBody
    });
  }

  public async deleteDocument(indexName: string, documentId: string): Promise<void> {
    await this.client.delete({
      index: indexName,
      id: documentId
    });
  }

  public async searchByRequest(searchRequest: SearchRequest): Promise<SearchResponse> {
    return (
      await this.client.search(searchRequest)
    );
  }
}
export default ElasticSearchProvider;
