const assert = require('assert')
const api = require('./../src/api')
var MOCK = require('./../helpers/initialDBvariables')
var FUNC = require('./../helpers/initialDBfunctions')

// Authentication Variables
const TOKEN = process.env.TOKEN_CONFIG
const headers = {
    Authorization: TOKEN
}
// Server Variables
let app = {} // server receiver

// Global Variables
var global = {
    userID: 0,
    projectID: 0,
    flowID: 0,
    form1ID: 0,
    form2ID: 0
}
// Query Variables
mode = {
    id: 1,
    title: 2,
    creator: 3,
    project: 4
}

// Test Suite
describe.only('Test Suite Starting Application', function () {
    // this.timeout(5000)
    this.beforeAll(async () => {
        app = await api

        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/login?skip=0&limit=1&search=admin&mode=1`
        })
        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)
        global.userID = dados[0]._id
    })
    it('Create Project With UserID', async function () {
        const response = await FUNC.project(MOCK, mode, global, app, headers)
        global = response.global
        const status = response.statusCode
        console.log("global: ", global)
        console.log("status: ", status)
        assert.deepEqual(status, 200)
    })

    it('Create Flow With UserID AND ProjectID', async function () {
        const response = await FUNC.flow(MOCK, mode, global, app, headers)
        global = response.global
        const status = response.statusCode
        console.log("global: ", global)
        console.log("status: ", status)
        assert.deepEqual(status, 200)
    })

    it('Create Form With UserID AND ProjectID AND FlowID and Update FlowFather', async function () {
        const response = await FUNC.form1(MOCK, mode, global, app, headers)
        global = response.global
        const status = {
            form: response.statusObject.form,
            flow: response.statusObject.flow
        }
        console.log("global: ", global)
        console.log("status: ", status)
        assert.deepEqual(status.form, 200)
        assert.deepEqual(status.flow, 200)
    })

})
