/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/data              ->  index
 * POST    /api/data              ->  create
 * GET     /api/data/:id          ->  show
 * PUT     /api/data/:id          ->  update
 * DELETE  /api/data/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
var Data = require('./data.model');
var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Sentence = mongoose.model('Sentence');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function responseWithSentenceResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      entity = entity.toObject();
      Sentence.find({source : entity._id}, function(err, sentences) {
        entity.sentences = sentences;
        res.status(statusCode).json(entity);
      })
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

// Gets a list of Datas
export function index(req, res) {
  Data.findAsync({}, {population:false})
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Gets a single Data from the DB
export function show(req, res) {
  Data.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(responseWithSentenceResult(res))
    .catch(handleError(res));
}

// Creates a new Data in the DB
export function create(req, res) {
  responseWithResult(res, 201);
  // console.log(req.body);
  // Data.createAsync(req.body)
  //   .then(responseWithResult(res, 201))
  //   .catch(handleError(res));
}

// Updates an existing Data in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Data.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Deletes a Data from the DB
export function destroy(req, res) {
  Data.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
