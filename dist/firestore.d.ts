import { Connector } from 'loopback-connector';
import { Firestore as Admin, Query } from '@google-cloud/firestore';
import { IFilter, IDataSource, ICallback } from './interfaces';
declare const initialize: (dataSource: IDataSource, callback: any) => void;
declare class Firestore extends Connector {
    _models: any;
    db: any;
    constructor(dataSourceProps: IDataSource);
    /**
     * Find matching model instances by the filter
     *
     * @param {String} model The model name
     * @param {Object} filter The filter
     * @param {Function} [callback] The callback function
     */
    all: (model: string, filter: IFilter, _options: any, callback: ICallback) => Promise<void>;
    /**
     * Check if a model instance exists by id
     * @param {String} model The model name
     * @param {Number | String} id The id value
     * @param {Function} [callback] The callback function
     *
     */
    exists: (model: string, id: number | string, _options: any, callback: ICallback) => void;
    /**
     * Count the number of instances for the given model
     *
     * @param {String} model The model name
     * @param {Object} where The id Object
     * @param {Function} [callback] The callback function
     *
     */
    count: (model: string, where: any, _options: any, callback: ICallback) => void;
    ping: (callback: ICallback) => void;
    /**
     * Update all matching instances
     * @param {String} model The model name
     * @param {Object} where The search criteria
     * @param {Object} data The property/value pairs to be updated
     * @callback {Function} callback Callback function
     */
    update: (model: string, where: any, data: any, _options: any, callback: ICallback) => void;
    /**
     * Replace properties for the model instance data
     * @param {String} model The name of the model
     * @param {String | Number} id The instance id
     * @param {Object} data The model data
     * @param {Object} options The options object
     * @param {Function} [callback] The callback function
     */
    replaceById: (model: string, id: string | number, data: any, _options: any, callback: ICallback) => void;
    /**
     * Update properties for the model instance data
     * @param {String} model The model name
     * @param {String | Number} id The instance id
     * @param {Object} data The model data
     * @param {Function} [callback] The callback function
     */
    updateAttributes: (model: string, id: string | number, data: any, _options: any, callback: ICallback) => void;
    /**
     * Delete a model instance by id
     * @param {String} model The model name
     * @param {String | Number} id The instance id
     * @param [callback] The callback function
     */
    destroyById: (model: string, id: string | number, callback: ICallback) => void;
    /**
     * Delete a model instance
     * @param {String} model The model name
     * @param {Object} where The id Object
     * @param [callback] The callback function
     */
    destroyAll: (model: string, where: any, callback: ICallback) => void;
    deleteQueryBatch: (db: Admin, query: Query, batchSize: number, resolve: any, reject: any) => void;
    create: (model: string, data: any, callback: ICallback) => void;
    updateAll: (model: string, where: any, data: any, _options: any, callback: ICallback) => void;
    /**
     * Complete the Document objects with their ids
     * @param {DocumentSnapshot[] | QueryDocumentSnapshot[]} snapshots The array of snapshots
     */
    private completeDocumentResults;
    /**
     * Internal method - Check if filter object has at least one valid property
     * @param {IFilter} filter The filter
     */
    private hasFilter;
    /**
     * Find matching Collection Document by the id
     * @param {String} model The model name
     * @param {String} id The Entity id
     */
    private findById;
    /**
     * Find all Documents of a Collection
     * @param {String} model The model name
     */
    private findAllOfModel;
    /**
     * Internal method - Get Documents with query execution
     * @param {String} model The model name
     * @param {IFilter} filter The filter
     */
    private findFilteredDocuments;
    /**
     * Internal method for building query
     * @param {String} model The model name
     * @param {IFilter} filter The filter
     */
    private buildNewQuery;
    /**
     * Add new filter to a Query
     * @param {Query} query Firestore Query
     * @param {Object} filter The filter object
     */
    private addFiltersToQuery;
    /**
     * Add inner filters to a Query
     * @param {Query} query Firestore Query
     * @param {String} key Property name being filtered
     * @param {Object} value Object with operator and comparison value
     */
    private addInnerFiltersToQuery;
    private deleteCollection;
}
export { Firestore, initialize };
