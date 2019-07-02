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
  form3ID: 0,
  responseID: 0,
  importFlowID: 0,
  form2Update: 0,
  form2DelID: 0
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

  it('Create Form #3 With UserNAME AND FlowID and Update previous Form', async function createForm3() {
    const response = await FUNC.form3(MOCK, mode, global, app, headers);
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
    global.importFlowID = response.id;
    assert.deepEqual(response.statusCode, 200);
  });

  it('Read Imported Forms', async function readImported() {
    const response = await FUNC.readImport(MOCK, mode, global, app, headers);

    const { statusCode, firstFormId, secondFormId } = response;
    global.form2Update = firstFormId;
    global.form2DelID = secondFormId;
    assert.deepEqual(statusCode, 200);
    assert.notEqual(firstFormId, undefined);
  });

  it('Update first imported form status', async function updateForm() {
    const response = await FUNC.updateFirstImpForm(
      MOCK,
      mode,
      global,
      app,
      headers
    );

    assert.deepEqual(response, 200);
  });

  it('Delete middle imported form and update automatically throw routes', async function deleteMidForm() {
    const response = await FUNC.deleteMiddleForm(
      MOCK,
      mode,
      global,
      app,
      headers
    );

    assert.deepEqual(response, 200);
  });

  it('Delete Project->Flow->Form->Responses', async function deleteAll() {
    const response = await FUNC.deleteAll(MOCK, mode, global, app, headers);
    assert.deepEqual(response, 200);
  });
});
