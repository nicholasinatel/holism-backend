/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const DbFuncModule = {
  // Create & Verify Project Async Function
  async project(MOCK, mode, global, app, headers) {
    const result = await app.inject({
      method: 'GET',
      headers,
      url: `/project?search=${MOCK.MOCK_PROJECT.title}&mode=${
        mode.title
      }&username=${global.username}`
    });
    const array = JSON.parse(result.payload);
    let { statusCode } = result;

    if (array.length == 0) {
      MOCK.MOCK_PROJECT.creator = global.username;
      const newProject = await app.inject({
        method: 'POST',
        headers,
        url: '/project',
        payload: MOCK.MOCK_PROJECT
      });
      const dados = JSON.parse(newProject.payload);
      global.projectID = dados._id;
      ({ statusCode } = newProject);
    } else {
      global.projectID = array[0]._id;
    }
    const response = {
      global,
      statusCode
    };
    return response;
  },
  // Create & Verify Flow Async Function
  async flow(MOCK, mode, global, app, headers) {
    const result = await app.inject({
      method: 'GET',
      headers,
      url: `/model_flow?skip=0&limit=1&search=${MOCK.MOCK_FLOW.title}&mode=${
        mode.title
      }&username=${global.username}`
    });
    const array = JSON.parse(result.payload);
    let { statusCode } = result;
    if (array.length == 0) {
      MOCK.MOCK_FLOW.creator = global.username;
      MOCK.MOCK_FLOW.project = global.projectID;
      const newFlow = await app.inject({
        method: 'POST',
        headers,
        url: '/model_flow',
        payload: MOCK.MOCK_FLOW
      });
      const dados = JSON.parse(newFlow.payload);
      global.flowID = dados._id;
      ({ statusCode } = newFlow.statusCode);
    } else {
      global.flowID = array[0]._id;
    }
    const response = {
      global,
      statusCode
    };
    return response;
  },
  // Create & Verify Form1 Async Function
  async form1(MOCK, mode, global, app, headers) {
    // Check Form1 Existence
    const result = await app.inject({
      method: 'GET',
      headers,
      url: `/model_form?skip=0&limit=1&search=${MOCK.MOCK_FORM_1.title}&mode=${
        mode.title
      }&username=${global.username}`
    });
    const array = JSON.parse(result.payload);
    let { statusCode } = result;
    // Create Form1
    if (array.length == 0) {
      MOCK.MOCK_FORM_1.creator = global.username;
      MOCK.MOCK_FORM_1.flow = global.flowID;

      const newForm = await app.inject({
        method: 'POST',
        headers,
        url: '/model_form/0',
        payload: MOCK.MOCK_FORM_1
      });
      const dados = JSON.parse(newForm.payload);
      global.form1ID = dados._id;
      ({ statusCode } = newForm.statusCode);
    } else {
      // Update Global Form1ID
      global.form1ID = array[0]._id;
    }
    // Get Father Flow To Update
    const fatherFlow = await app.inject({
      method: 'GET',
      headers,
      url: `/model_flow?skip=0&limit=1&search=${MOCK.MOCK_FLOW.title}&mode=${
        mode.title
      }&username=${global.username}`
    });
    const [florResult] = JSON.parse(fatherFlow.payload);
    delete florResult.createdAt;
    delete florResult.updatedAt;
    delete florResult.__v;
    delete florResult._id;
    // Update Father Flow
    florResult.starter_form = global.form1ID;
    const updateResult = await app.inject({
      method: 'PATCH',
      headers,
      url: `/model_flow/${global.flowID}/${MOCK.MOCK_USER.username}/${
        MOCK.MOCK_USER.roles
      }`,
      payload: florResult
    });
    const updateStatus = updateResult.statusCode;
    // Return
    const statusObject = {
      form: statusCode,
      flow: updateStatus
    };
    console.log({ statusObject });
    const response = {
      global,
      statusObject
    };
    return response;
  },
  // Create & Verify Form2 Async Function
  async form2(MOCK, mode, global, app, headers) {
    // Create With Step_Backward Set
    const result = await app.inject({
      method: 'GET',
      headers,
      url: `/model_form?skip=0&limit=1&search=${
        global.flowID
      }&mode=3&username=${global.username}`
    });
    const array = JSON.parse(result.payload);
    let { statusCode } = result;

    if (array.length == 1) {
      MOCK.MOCK_FORM_2.creator = global.username;
      MOCK.MOCK_FORM_2.flow = global.flowID;
      MOCK.MOCK_FORM_2.step_backward[0] = global.form1ID;
      const newForm = await app.inject({
        method: 'POST',
        headers,
        url: '/model_form/1',
        payload: MOCK.MOCK_FORM_2
      });
      const dados = JSON.parse(newForm.payload);
      global.form2ID = dados._id;
      ({ statusCode } = newForm.statusCode);
    } else {
      global.form2ID = array[1]._id;
    }
    // Update step_forward previousForm
    const result2update = await app.inject({
      method: 'GET',
      headers,
      url: `/model_form?skip=0&limit=1&search=${MOCK.MOCK_FORM_1.title}&mode=${
        mode.title
      }&username=${global.username}`
    });
    const [previousForm] = JSON.parse(result2update.payload);
    previousForm.step_forward[0] = global.form2ID;
    delete previousForm.createdAt;
    delete previousForm.updatedAt;
    delete previousForm.__v;
    delete previousForm._id;
    const updateResult = await app.inject({
      method: 'PATCH',
      headers,
      url: `/model_form/${global.form1ID}/${MOCK.MOCK_USER.username}`,
      payload: previousForm
    });
    const updatePreviousForm = updateResult.statusCode;
    // Return
    const statusObject = {
      formCreate: statusCode,
      formUpdate: updatePreviousForm
    };
    const response = {
      global,
      statusObject
    };
    return response;
  },
  async response(MOCK, mode, global, app, headers) {
    const result = await app.inject({
      method: 'GET',
      headers,
      url: `/response?search=${global.form1ID}`
    });
    const array = JSON.parse(result.payload);
    let { statusCode } = result;
    if (array.length == 0) {
      MOCK.MOCK_RESPONSE_1.model_form = global.form1ID;
      MOCK.MOCK_RESPONSE_1.user = global.username;
      const newResponse = await app.inject({
        method: 'POST',
        headers,
        url: '/response',
        payload: MOCK.MOCK_RESPONSE_1
      });
      const dados = JSON.parse(newResponse.payload);
      global.responseID = dados._id;
      ({ statusCode } = newResponse.statusCode);
    } else {
      global.responseID = array[0]._id;
    }
    const response = {
      global,
      statusCode
    };
    return response;
  },
  async import(MOCK, mode, global, app, headers) {
    const result = await app.inject({
      method: 'GET',
      headers,
      url: `/model_flow?skip=0&limit=10&search=${MOCK.MOCK_FLOW.title}&mode=${
        mode.title
      }&username=${global.username}`
    });
    const array = JSON.parse(result.payload);

    delete array[0].starter_form;
    delete array[0].createdAt;
    delete array[0].updatedAt;
    delete array[0].__v;
    delete array[0]._id;

    let { statusCode } = result;
    if (array[0].title == MOCK.MOCK_FLOW.title && array.length == 1) {
      const imported = await app.inject({
        method: 'POST',
        headers,
        url: `/import/${global.flowID}`,
        payload: array[0]
      });
      // const dados = JSON.parse(imported.payload);
      ({ statusCode } = imported.statusCode);
    }
    return statusCode;
  }
};

module.exports = DbFuncModule;
