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
    username: '',
    userID: 0,
    projectID: 0,
    flowID: 0,
    form1ID: 0,
    form2ID: 0,
    responseID: 0
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
    this.beforeAll(async () => {
        app = await api

        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/login?skip=0&limit=1&search=nicholas&mode=1`
        })
        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)
        global.userID = dados[0]._id
        global.username = dados[0].username
    })
    it('Create Project With Username', async function () {
        const response = await FUNC.project(MOCK, mode, global, app, headers)
        global = response.global
        const status = response.statusCode
        assert.deepEqual(status, 200)
    })

    it('Create Flow With UserNAME AND ProjectID', async function () {
        const response = await FUNC.flow(MOCK, mode, global, app, headers)
        global = response.global
        const status = response.statusCode
        assert.deepEqual(status, 200)
    })

    it('Create Form #1 With UserNAME AND FlowID and Update FlowFather', async function () {
        const response = await FUNC.form1(MOCK, mode, global, app, headers)
        global = response.global
        const status = {
            form: response.statusObject.form,
            flow: response.statusObject.flow
        }
        assert.deepEqual(status.form, 200)
        assert.deepEqual(status.flow, 200)
    })

    it('Create Form #2 With UserNAME AND FlowID and Update previous Form', async function(){
        const response = await FUNC.form2(MOCK, mode, global, app, headers)
        global = response.global
        const status = {
            formCreate: response.statusObject.formCreate,
            formUpdate: response.statusObject.formUpdate
        }
        
        assert.deepEqual(status.formCreate, 200)
        assert.deepEqual(status.formUpdate, 200)
    })

    it('Create Response With UserNAME AND FormID', async function(){
        const response = await FUNC.response(MOCK,mode,global, app, headers)
        global = response.global
        const status = response.statusCode
        assert.deepEqual(status, 200)
    })

    it('Make Import Duplicating Flow And Forms', async function(){
        const response = await FUNC.import(MOCK, mode, global, app, headers)
        // global = response.global
        // const status = response.statusCode
        assert.deepEqual(response, 200)
    })
})
