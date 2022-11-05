"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = exports.Firestore = void 0;
const loopback_connector_1 = require("loopback-connector");
const firestore_1 = require("@google-cloud/firestore");
const config_1 = require("./config");
const initialize = function initializeDataSource(dataSource, callback) {
    dataSource.connector = new Firestore(dataSource.settings);
    process.nextTick(() => {
        callback();
    });
};
exports.initialize = initialize;
class Firestore extends loopback_connector_1.Connector {
    constructor(dataSourceProps) {
        super();
        /**
         * Find matching model instances by the filter
         *
         * @param {String} model The model name
         * @param {Object} filter The filter
         * @param {Function} [callback] The callback function
         */
        this.all = async (model, filter, _options, callback) => {
            const { where } = filter;
            try {
                let result;
                if (where && where.id) {
                    const { id } = where;
                    result = await this.findById(model, id);
                }
                else if (this.hasFilter(filter)) {
                    result = await this.findFilteredDocuments(model, filter);
                }
                else {
                    result = await this.findAllOfModel(model);
                }
                callback(null, result);
            }
            catch (error) {
                callback(null, error);
            }
        };
        /**
         * Check if a model instance exists by id
         * @param {String} model The model name
         * @param {Number | String} id The id value
         * @param {Function} [callback] The callback function
         *
         */
        this.exists = (model, id, _options, callback) => {
            this.db
                .collection(model)
                .doc(id)
                .get()
                .then((doc) => {
                    callback(null, doc.exists);
                })
                .catch((err) => callback(err));
        };
        /**
         * Count the number of instances for the given model
         *
         * @param {String} model The model name
         * @param {Object} where The id Object
         * @param {Function} [callback] The callback function
         *
         */
        this.count = (model, where, _options, callback) => {
            if (Object.keys(where).length > 0) {
                this.db
                    .collection(model)
                    .where(Object.keys(where)[0], '==', Object.values(where)[0])
                    .get()
                    .then((doc) => {
                        callback(null, doc.docs.length);
                    })
                    .catch((err) => callback(err));
            }
            else {
                this.db
                    .collection(model)
                    .get()
                    .then((doc) => {
                        callback(null, doc.docs.length);
                    })
                    .catch((err) => callback(err));
            }
        };
        this.ping = (callback) => {
            if (this.db.projectId) {
                callback(null);
            }
            else {
                callback(new Error('Ping Error'));
            }
        };
        /**
         * Update all matching instances
         * @param {String} model The model name
         * @param {Object} where The search criteria
         * @param {Object} data The property/value pairs to be updated
         * @callback {Function} callback Callback function
         */
        this.update = (model, where, data, _options, callback) => {
            const self = this;
            this.exists(model, where.id, null, (err, res) => {
                if (err)
                    callback(err);
                if (res) {
                    self.db
                        .collection(model)
                        .doc(where.id)
                        .update(data)
                        .then(() => {
                            // Document updated successfully.
                            callback(null, []);
                        });
                }
                else {
                    callback(new Error('Document not found'));
                }
            });
        };
        /**
         * Replace properties for the model instance data
         * @param {String} model The name of the model
         * @param {String | Number} id The instance id
         * @param {Object} data The model data
         * @param {Object} options The options object
         * @param {Function} [callback] The callback function
         */
        this.replaceById = (model, id, data, _options, callback) => {
            const self = this;
            this.exists(model, id, null, (err, res) => {
                if (err)
                    callback(err);
                if (res) {
                    self.db
                        .collection(model)
                        .doc(id)
                        .update(data)
                        .then(() => {
                            // Document updated successfully.
                            callback(null, []);
                        });
                }
                else {
                    callback(new Error('Document not found'));
                }
            });
        };
        /**
         * Update properties for the model instance data
         * @param {String} model The model name
         * @param {String | Number} id The instance id
         * @param {Object} data The model data
         * @param {Function} [callback] The callback function
         */
        this.updateAttributes = (model, id, data, _options, callback) => {
            const self = this;
            this.exists(model, id, null, (err, res) => {
                if (err)
                    callback(err);
                if (res) {
                    self.db
                        .collection(model)
                        .doc(id)
                        .set(data)
                        .then(() => {
                            // Document updated successfully.
                            callback(null, []);
                        });
                }
                else {
                    callback(new Error('Document not found'));
                }
            });
        };
        /**
         * Delete a model instance by id
         * @param {String} model The model name
         * @param {String | Number} id The instance id
         * @param [callback] The callback function
         */
        this.destroyById = (model, id, callback) => {
            const self = this;
            this.exists(model, id, null, (err, res) => {
                if (err)
                    callback(err);
                if (res) {
                    self.db
                        .collection(model)
                        .doc(id)
                        .delete()
                        .then(() => {
                            // Document deleted successfully.
                            callback(null, []);
                        });
                }
                else {
                    callback(new Error('Document not found'));
                }
            });
        };
        /**
         * Delete a model instance
         * @param {String} model The model name
         * @param {Object} where The id Object
         * @param [callback] The callback function
         */
        this.destroyAll = (model, where, callback) => {
            const self = this;
            if (where.id) {
                this.exists(model, where.id, null, (err, res) => {
                    if (err)
                        callback(err);
                    if (res) {
                        self.db
                            .collection(model)
                            .doc(where.id)
                            .delete()
                            .then(() => {
                                // Document deleted successfully.
                                callback(null, []);
                            });
                    }
                    else {
                        callback(new Error('Document not found'));
                    }
                });
            }
            else {
                this.deleteCollection(this.db, model, 10)
                    .then(() => {
                        callback(null, '');
                    })
                    .catch(err => callback(err));
            }
        };
        this.deleteQueryBatch = (db, query, batchSize, resolve, reject) => {
            query
                .get()
                .then(snapshot => {
                    // When there are no documents left, we are done
                    if (snapshot.size == 0) {
                        return 0;
                    }
                    // Delete documents in a batch
                    const batch = db.batch();
                    snapshot.docs.forEach(doc => batch.delete(doc.ref));
                    return batch.commit().then(() => snapshot.size);
                })
                .then(numDeleted => {
                    if (numDeleted === 0) {
                        resolve();
                        return;
                    }
                    // Recurse on the next process tick, to avoid
                    // exploding the stack.
                    process.nextTick(() => {
                        this.deleteQueryBatch(db, query, batchSize, resolve, reject);
                    });
                })
                .catch(reject);
        };
        this.create = (model, data, callback) => {
            this.db
                .collection(model)
                .doc(data.deviceId)
                .set(data)
                .then((ref) => {
                    callback(null, ref.id);
                })
                .catch((err) => {
                    callback(err);
                });
        };
        this.updateAll = (model, where, data, _options, callback) => {
            const self = this;
            this.exists(model, where.id, null, (err, res) => {
                if (err)
                    callback(err);
                if (res) {
                    self.db
                        .collection(model)
                        .doc(where.id)
                        .update(data)
                        .then(() => {
                            // Document updated successfully.
                            callback(null, []);
                        });
                }
                else {
                    callback(new Error('Document not found'));
                }
            });
        };
        /**
         * Complete the Document objects with their ids
         * @param {DocumentSnapshot[] | QueryDocumentSnapshot[]} snapshots The array of snapshots
         */
        this.completeDocumentResults = (snapshots) => {
            const results = [];
            snapshots.forEach(item => results.push({
                id: item.id,
                ...item.data()
            }));
            return results;
        };
        /**
         * Internal method - Check if filter object has at least one valid property
         * @param {IFilter} filter The filter
         */
        this.hasFilter = ({ where, order, limit, fields, skip }) => {
            if (where || limit || fields || order || skip)
                return true;
            return false;
        };
        /**
         * Find matching Collection Document by the id
         * @param {String} model The model name
         * @param {String} id The Entity id
         */
        this.findById = async (model, id) => {
            try {
                const documentSnapshot = await this.db
                    .collection(model)
                    .doc(id)
                    .get();
                if (!documentSnapshot.exists)
                    return Promise.resolve([]);
                const result = { id: documentSnapshot.id, ...documentSnapshot.data() };
                return Promise.resolve([result]);
            }
            catch (error) {
                throw error;
            }
        };
        /**
         * Find all Documents of a Collection
         * @param {String} model The model name
         */
        this.findAllOfModel = async (model) => {
            try {
                const collectionRef = this.db.collection(model);
                const snapshots = await collectionRef.get();
                if (snapshots.empty || snapshots.size === 0)
                    return Promise.resolve([]);
                const result = this.completeDocumentResults(snapshots.docs);
                return Promise.resolve(result);
            }
            catch (error) {
                throw error;
            }
        };
        /**
         * Internal method - Get Documents with query execution
         * @param {String} model The model name
         * @param {IFilter} filter The filter
         */
        this.findFilteredDocuments = async (model, filter) => {
            const query = this.buildNewQuery(model, filter);
            const snapshots = await query.get();
            return this.completeDocumentResults(snapshots);
        };
        /**
         * Internal method for building query
         * @param {String} model The model name
         * @param {IFilter} filter The filter
         */
        this.buildNewQuery = (model, filter) => {
            const { where, limit, fields, skip } = filter;
            let query = this.db.collection(model);
            if (where) {
                for (const key in where) {
                    if (where.hasOwnProperty(key)) {
                        const value = { [key]: where[key] };
                        query = this.addFiltersToQuery(query, value);
                    }
                }
            }
            let { order } = filter;
            if (order) {
                if (!Array.isArray(order)) {
                    order = [order];
                }
                for (const option of order) {
                    const [property, orderOption] = option.split(' ');
                    query = query.orderBy(property, orderOption);
                }
            }
            if (limit) {
                query = query.limit(limit);
            }
            if (skip) {
                query = query.offset(skip);
            }
            if (fields) {
                for (const key in fields) {
                    if (fields.hasOwnProperty(key)) {
                        const field = fields[key];
                        if (field)
                            query = query.select(key);
                    }
                }
            }
            return query;
        };
        /**
         * Add new filter to a Query
         * @param {Query} query Firestore Query
         * @param {Object} filter The filter object
         */
        this.addFiltersToQuery = (query, filter) => {
            const key = Object.keys(filter)[0];
            const value = Object.values(filter)[0];
            const isObject = typeof value === 'object';
            if (isObject) {
                return this.addInnerFiltersToQuery(query, key, value);
            }
            return query.where(key, '==', value);
        };
        /**
         * Add inner filters to a Query
         * @param {Query} query Firestore Query
         * @param {String} key Property name being filtered
         * @param {Object} value Object with operator and comparison value
         */
        this.addInnerFiltersToQuery = (query, key, value) => {
            let resultQuery = query;
            for (const operation in value) {
                if (!value.hasOwnProperty(operation)) {
                    continue;
                }
                const comparison = value[operation];
                const operator = config_1.operators[operation];
                resultQuery = resultQuery.where(key, operator, comparison);
            }
            return resultQuery;
        };
        this.deleteCollection = (db, collectionPath, batchSize) => {
            const collectionRef = db.collection(collectionPath);
            const query = collectionRef.orderBy('__name__').limit(batchSize);
            return new Promise((resolve, reject) => {
                this.deleteQueryBatch(db, query, batchSize, resolve, reject);
            });
        };
        this._models = {};
        const { projectId, clientEmail, privateKey } = dataSourceProps;
        const firestore = new firestore_1.Firestore({
            credentials: {
                private_key: privateKey,
                client_email: clientEmail // eslint-disable-line camelcase
            },
            projectId
        });
        this.db = firestore;
    }
}
exports.Firestore = Firestore;
