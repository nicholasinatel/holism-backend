var DbFuncModule = {
    // Create & Verify Project Async Function
    project: async function (MOCK, mode, global, app, headers) {
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/project?search=${MOCK.MOCK_PROJECT.title}&mode=${mode.title}&username=${global.username}`
        })
        const array = JSON.parse(result.payload)
        let statusCode = result.statusCode
        if (array.length == 0) {
            MOCK.MOCK_PROJECT.creator = global.username
            const new_project = await app.inject({
                method: 'POST',
                headers,
                url: '/project',
                payload: MOCK.MOCK_PROJECT
            })
            const dados = JSON.parse(new_project.payload)
            global.projectID = dados._id
            statusCode = new_project.statusCode
        } else {
            global.projectID = array[0]._id
        }
        const response = {
            global,
            statusCode
        }
        return response
    },
    // Create & Verify Flow Async Function
    flow: async function (MOCK, mode, global, app, headers) {
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/model_flow?skip=0&limit=1&search=${MOCK.MOCK_FLOW.title}&mode=${mode.title}&username=${global.username}`
        })
        const array = JSON.parse(result.payload)
        let statusCode = result.statusCode
        if (array.length == 0) {
            MOCK.MOCK_FLOW.creator = global.username
            MOCK.MOCK_FLOW.project = global.projectID
            const new_flow = await app.inject({
                method: 'POST',
                headers,
                url: '/model_flow',
                payload: MOCK.MOCK_FLOW
            })
            const dados = JSON.parse(new_flow.payload)
            global.flowID = dados._id
            statusCode = new_flow.statusCode
        } else {
            global.flowID = array[0]._id
        }
        const response = {
            global,
            statusCode
        }
        return response
    },
    // Create & Verify Form1 Async Function
    form1: async function (MOCK, mode, global, app, headers) {
        // Check Form1 Existence
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/model_form?skip=0&limit=1&search=${MOCK.MOCK_FORM_1.title}&mode=${mode.title}&username=${global.username}`
        })
        const array = JSON.parse(result.payload)
        let statusCode = result.statusCode
        // Create Form1
        if (array.length == 0) {
            MOCK.MOCK_FORM_1.creator = global.username
            MOCK.MOCK_FORM_1.flow = global.flowID
            const new_form = await app.inject({
                method: 'POST',
                headers,
                url: '/model_form/0',
                payload: MOCK.MOCK_FORM_1
            })
            const dados = JSON.parse(new_form.payload)
            console.log("form1-dados: ", dados)
            global.form1ID = dados._id
            console.log("form1-global.form1ID: ", global.form1ID)
            statusCode = new_form.statusCode
        } else {
            // Update Global Form1ID
            global.form1ID = array[0]._id
        }
        // Get Father Flow 2 Update
        const father_flow = await app.inject({
            method: 'GET',
            headers,
            url: `/model_flow?skip=0&limit=1&search=${MOCK.MOCK_FLOW.title}&mode=${mode.title}&username=${MOCK.MOCK_USER.username}&username=${global.username}`
        })
        const [flow_result] = JSON.parse(father_flow.payload)
        delete flow_result.createdAt
        delete flow_result.updatedAt
        delete flow_result.__v
        delete flow_result._id
        // Update Father Flow
        flow_result.starter_form = global.form1ID
        const update_result = await app.inject({
            method: 'PATCH',
            headers,
            url: `/model_flow/${global.flowID}/${MOCK.MOCK_USER.username}`,
            payload: flow_result
        })
        const update_status = update_result.statusCode
        // Return
        const statusObject = {
            form: statusCode,
            flow: update_status
        }
        const response = {
            global,
            statusObject
        }
        return response
    },
    // Create & Verify Form2 Async Function
    form2: async function (MOCK, mode, global, app, headers) {
        // Create With Step_Backward Set
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/model_form?skip=0&limit=1&search=${MOCK.MOCK_FORM_2.title}&mode=${mode.title}&username=${MOCK.MOCK_USER.username}&username=${global.username}`
        })
        const array = JSON.parse(result.payload)
        let statusCode = result.statusCode
        console.log('array: ', array)
        if (array.length == 0) {
            console.log("global.form1ID: ",global.form1ID)
            MOCK.MOCK_FORM_2.creator = global.username
            MOCK.MOCK_FORM_2.flow = global.flowID
            MOCK.MOCK_FORM_2.step_backward[0] = global.form1ID
            const new_form = await app.inject({
                method: 'POST',
                headers,
                url: '/model_form/1',
                payload: MOCK.MOCK_FORM_2
            })
            const dados = JSON.parse(new_form.payload)
            console.log("dados; ", dados)
            global.form2ID = dados._id
            statusCode = new_form.statusCode
        } else {
            global.form2ID = array[0]._id
        }
        // Update step_forward previous_form
        const result2update = await app.inject({
            method: 'GET',
            headers,
            url: `/model_form?skip=0&limit=1&search=${MOCK.MOCK_FORM_1.title}&mode=${mode.title}&username=${MOCK.MOCK_USER.username}&username=${global.username}`
        })
        const [previous_form] = JSON.parse(result2update.payload)
        previous_form.step_forward[0] = global.form2ID
        delete previous_form.createdAt
        delete previous_form.updatedAt
        delete previous_form.__v
        delete previous_form._id
        const update_result = await app.inject({
            method: 'PATCH',
            headers,
            url: `/model_form/${global.form1ID}/${MOCK.MOCK_USER.username}`,
            payload: previous_form
        })
        const update_previous_form = update_result.statusCode
        // Return
        const statusObject = {
            formCreate: statusCode,
            formUpdate: update_previous_form
        }
        const response = {
            global,
            statusObject
        }
        return response
    },
    response: async function (MOCK, mode, global, app, headers) {
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/response?search=${global.form1ID}`
        })
        const array = JSON.parse(result.payload)
        let statusCode = result.statusCode
        if (array.length == 0) {
            MOCK.MOCK_RESPONSE_1.model_form = global.form1ID
            MOCK.MOCK_RESPONSE_1.user = global.username
            const new_response = await app.inject({
                method: 'POST',
                headers,
                url: '/response',
                payload: MOCK.MOCK_RESPONSE_1
            })
            const dados = JSON.parse(new_response.payload)
            global.responseID = dados._id
            statusCode = new_response.statusCode
        } else {
            global.responseID = array[0]._id
        }
        const response = {
            global,
            statusCode
        }
        return response
    },
    import: async function (MOCK, mode, global, app, headers) {
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/model_flow?skip=0&limit=10&search=${MOCK.MOCK_FLOW.title}&mode=${mode.title}&username=${MOCK.MOCK_USER.username}`
        })
        const array = JSON.parse(result.payload)
        delete array[0].starter_form
        delete array[0].createdAt
        delete array[0].updatedAt
        delete array[0].__v
        delete array[0]._id
        let statusCode = result.statusCode
        if (array[0].title == MOCK.MOCK_FLOW.title && array.length == 1) {
            const imported = await app.inject({
                method: 'POST',
                headers,
                url: `/import/${global.flowID}`,
                payload: array[0]
            })
            const dados = JSON.parse(imported.payload)
            statusCode = imported.statusCode
        }
        return statusCode
    }
}

module.exports = DbFuncModule;