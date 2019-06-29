/* eslint-disable no-console */
const assert = require('assert');
const api = require('./../src/api');
const MOCK = require('./../helpers/initialDBvariables');
const FUNC = require('./../helpers/initialDBfunctions');

// Authentication Variables
const TOKEN = process.env.TOKEN_CONFIG;
const headers = {
  Authorization: TOKEN
};
// Server Variables
let app = {}; // server receiver

// Global Variables
let global = {
  username: '',
  userID: 0,
  projectID: 0,
  flowID: 0,
  form1ID: 0,
  form2ID: 0,
  responseID: 0
};
// Query Variables
const mode = {
  id: 1,
  title: 2,
  creator: 3,
  project: 4
};

// Test Suite
describe.only('Test Suite Starting Application', function testSuite() {
  this.beforeAll(async () => {
    app = await api;

    const result = await app.inject({
      method: 'GET',
      headers,
      url: `/login?skip=0&limit=1&search=nicholas&mode=1`
    });
    // const statusCode = result.statusCode;
    const dados = JSON.parse(result.payload);
    global.userID = dados[0]._id;
    global.username = dados[0].username;
  });

  it('Create Project With Username', async function createProject() {
    const response = await FUNC.project(MOCK, mode, global, app, headers);
    // eslint-disable-next-line prefer-destructuring
    global = response.global;
    const status = response.statusCode;
    assert.deepEqual(status, 200);
  });

  it('Create Flow With UserNAME AND ProjectID', async function createFlow() {
    const response = await FUNC.flow(
      MOCK,
      mode,
      global,
      app,
      headers
    );

    // eslint-disable-next-line prefer-destructuring
    global = response.global;
    const { statusCode } = response;
    assert.deepEqual(statusCode, 200);
  });

  it('Create Form #1 With UserNAME AND FlowID and Update FlowFather', async function createForm1() {
    const response = await FUNC.form1(MOCK, mode, global, app, headers);
    // eslint-disable-next-line prefer-destructuring
    global = response.global;
    const status = {
      form: response.statusObject.form,
      flow: response.statusObject.flow
    };
    assert.deepEqual(status.form, 200);
    assert.deepEqual(status.flow, 200);
  });

  it('Create Form #2 With UserNAME AND FlowID and Update previous Form', async function createForm2() {
    const response = await FUNC.form2(MOCK, mode, global, app, headers);
    // eslint-disable-next-line prefer-destructuring
    global = response.global;
    const status = {
      formCreate: response.statusObject.formCreate,
      formUpdate: response.statusObject.formUpdate
    };

    assert.deepEqual(status.formCreate, 200);
    assert.deepEqual(status.formUpdate, 200);
  });

  it('Create Response With UserNAME AND FormID', async function createResponse() {
    const response = await FUNC.response(MOCK, mode, global, app, headers);
    // eslint-disable-next-line prefer-destructuring
    global = response.global;
    const status = response.statusCode;
    assert.deepEqual(status, 200);
  });

  it('Make Import Duplicating Flow And Forms', async function makeImport() {
    const response = await FUNC.import(MOCK, mode, global, app, headers);
    // global = response.global
    // const status = response.statusCode
    assert.deepEqual(response, 200);
  });
});
