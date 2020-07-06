/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
require("dotenv").config();

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
    MongoClient.connect(CONNECTION_STRING, (err, client) => {
        const db = client.db("issues");
        app.post('/api/issues/:project', function (req, res) {
            const project = req.params.project;
            const title = req.body.issue_title;
            const text = req.body.issue_text;
            const creator = req.body.created_by;
            if (!(title && text && creator)) {
                return res.status(400).json({err: "missing required field"});
            }

            const assigned = req.body.assigned_to || '';
            const statusText = req.body.status_text || '';
            const createdOn = new Date();

            db.collection(project).insertOne({
                "issue_title": title, "issue_text": text, "created_by": creator,
                "assigned_to": assigned, "status_text": statusText, "created_on": createdOn,
                "updated_on": createdOn, "open": true
            }, {}, (err, doc) => {
                if (err) {
                    return res.status(500);
                } else res.json(doc.ops[0]);
            })

        });
        app.get('/api/issues/:project', function (req, res) {
            var project = req.params.project;
            db.collection(project).find().toArray((err, arr) => {
                if (err) {
                    res.status(500);
                    res.end(err);
                } else res.json(arr);
            })
        });
        // .put(function (req, res) {
        //     var project = req.params.project;
        //
        // })
        //
        // .delete(function (req, res) {
        //     var project = req.params.project;
        //
        // });

    });

};
