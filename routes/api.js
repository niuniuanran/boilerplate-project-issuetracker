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
const issueProps = ["open", "assigned_to", "created_by", "created_on", "updated_on", "issue_title", "issue_text", "status_text", "_id"];
const dateProps = ["created_on", "updated_on"];

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
    MongoClient.connect(CONNECTION_STRING, (err, client) => {
        const db = client.db("issues");
        app.route('/api/issues/:project')
            .post(function (req, res) {
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

            })
            .get(function (req, res) {
                const project = req.params.project;
                const query = req.query;
                const docQuery = {};
                for (const prop in query) {
                    if (query.hasOwnProperty(prop) && issueProps.includes(prop)) {
                        if (prop === "open") {
                            if (query.open === "false") docQuery.open = false;
                            if (query.open === "true") docQuery.open = true;
                        } else if (dateProps.includes(prop)) {
                            const dateFilter = new Date(query[prop]);
                            if (dateFilter instanceof Date && !isNaN(dateFilter)) docQuery[prop] = dateFilter;
                        } else if (prop === "_id") docQuery[prop] = new ObjectId(query._id);
                        else docQuery[prop] = query[prop];
                    }
                }
                db.collection(project).find(docQuery).toArray((err, arr) => {
                    if (err) {
                        res.status(500);
                        res.end(err);
                    } else res.json(arr);
                })
            })
            .put(function (req, res) {
                const project = req.params.project;
                const body = req.body;
                const updateId = body._id;
                if (!updateId) return res.send("no id provided");
                const updateDoc = {updated_on: new Date()};
                let updated = false;
                for (const prop in body) {
                    if (prop !== "_id" && body.hasOwnProperty(prop) && issueProps.includes(prop)) {
                        updated = true;
                        updateDoc[prop] = body[prop];
                        if (prop === "open" && body[prop] === "false") updateDoc[prop] = false;
                    }
                }
                if (!updated) return res.send("no updated field sent");
                db.collection(project)
                    .findOneAndUpdate({
                            _id: new ObjectId(updateId)
                        },
                        {$set: updateDoc},
                        {},
                        (err, doc) => {
                            if (err || !doc) return res.send("could not update " + updateId);
                            return res.send("successfully updated");
                        })
            });
        // .delete(function (req, res) {
        //     var project = req.params.project;
        //
        // });

        //404 Not Found Middleware
        app.use(function (req, res, next) {
            res.status(404)
                .type('text')
                .send('Route Not Found');
        });
    });

};
