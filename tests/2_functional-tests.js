/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var app = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

    suite('POST /api/issues/{project} => object with issue data', function () {
        test('Every field filled in', function (done) {
            chai.request(app)
                .post("/api/issues/test")
                .send({
                    issue_title: 'Title',
                    issue_text: 'text',
                    created_by: 'Functional Test - Every field filled in',
                    assigned_to: 'Chai and Mocha',
                    status_text: 'In QA'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200, "Status should be 200!");
                    assert.isTrue(res.body.open, "Issue should be open!");
                    assert.equal(res.body.issue_title, 'Title', "Title does not match!");
                    assert.equal(res.body.issue_text, 'text', "Text does not match!");
                    assert.equal(res.body.created_by, 'Functional Test - Every field filled in', "Creator does not match!");
                    assert.equal(res.body.assigned_to, 'Chai and Mocha', "Assignee does not match!");
                    assert.equal(res.body.status_text, 'In QA', "Status text does not match!");
                    done();
                });
        });

        test('Required fields filled in', function (done) {
            chai.request(app)
                .post('/api/issues/test')
                .send({
                    issue_title: 'Title',
                    issue_text: 'text',
                    created_by: 'Functional Test - Every field filled in',
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isTrue(res.body.open);
                    assert.equal(res.body.issue_title, 'Title');
                    assert.equal(res.body.issue_text, 'text');
                    assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
                    assert.equal(res.body.assigned_to, '');
                    assert.equal(res.body.status_text, '');
                    done();
                })
        });

        test('Missing required fields', function (done) {
            chai.request(app)
                .post('/api/issues/test')
                .send({
                    issue_title: 'Title',
                    issue_text: 'text',
                }).end(function (err, res) {
                assert.equal(res.status, 400);
                assert.equal(res.body.err, 'missing required field');
                done();
            })
        });

    });

    suite('GET /api/issues/{project} => Array of objects with issue data', function () {

        test('No filter', function (done) {
            chai.request(app)
                .get('/api/issues/test')
                .query({})
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[0], 'issue_title');
                    assert.property(res.body[0], 'issue_text');
                    assert.property(res.body[0], 'created_on');
                    assert.property(res.body[0], 'updated_on');
                    assert.property(res.body[0], 'created_by');
                    assert.property(res.body[0], 'assigned_to');
                    assert.property(res.body[0], 'open');
                    assert.property(res.body[0], 'status_text');
                    assert.property(res.body[0], '_id');
                    done();
                });
        });

        test('One filter', function (done) {
            chai.request(app)
                .get('/api/issues/test')
                .query({open: true})
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    res.body.forEach(ele => {
                        assert.property(ele, 'open');
                        assert.isTrue(ele.open);
                        assert.property(ele, 'issue_title');
                        assert.property(ele, 'issue_text');
                        assert.property(ele, 'created_on');
                        assert.property(ele, 'updated_on');
                        assert.property(ele, 'created_by');
                        assert.property(ele, 'assigned_to');
                        assert.property(ele, 'status_text');
                        assert.property(ele, '_id');
                    });
                    done();
                })
        });

        test('Multiple filters (test for multiple fields you know will be in the db for a return)', function (done) {
            chai.request(app)
                .get('/api/issues/test')
                .query({
                    "open": "true",
                    "issue_title": "Title",
                    "issue_text": "text",
                    "created_by": "Functional Test - Every field filled in",
                    "assigned_to": "Chai and Mocha"
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    res.body.forEach(ele => {
                        assert.property(ele, 'open');
                        assert.property(ele, 'issue_title');
                        assert.equal(ele.issue_title, "Title");
                        assert.property(ele, 'issue_text');
                        assert.equal(ele.issue_text, "text");
                        assert.property(ele, 'created_by');
                        assert.equal(ele.created_by, "Functional Test - Every field filled in");
                        assert.property(ele, 'assigned_to');
                        assert.equal(ele.assigned_to, 'Chai and Mocha');
                        assert.property(ele, 'status_text');
                        assert.property(ele, '_id');
                        assert.property(ele, 'created_on');
                        assert.property(ele, 'updated_on');
                    });
                    done();
                })
        });

    });

    //
    // suite('PUT /api/issues/{project} => text', function () {
    //
    //     test('No body', function (done) {
    //
    //     });
    //
    //     test('One field to update', function (done) {
    //
    //     });
    //
    //     test('Multiple fields to update', function (done) {
    //
    //     });
    //
    // });

    // suite('DELETE /api/issues/{project} => text', function () {
    //
    //     test('No _id', function (done) {
    //
    //     });
    //
    //     test('Valid _id', function (done) {
    //
    //     });
    //
    // });

});
