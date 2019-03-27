var DbFuncModule = {
    // Create & Verify Project Async Function
    project: async function (MOCK, mode, global, app, headers) {
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/project?search=${MOCK.MOCK_PROJECT.title}&mode=${mode.title}`
        })
        const array = JSON.parse(result.payload)
        let statusCode = result.statusCode
        if (array.length == 0) {
            MOCK.MOCK_PROJECT.creator = global.userID
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
    flow: async function(MOCK, mode, global, app, headers) {
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/model_flow?skip=0&limit=1&search=${MOCK.MOCK_FLOW.title}&mode=${mode.title}`
        })
        const array = JSON.parse(result.payload)
        let statusCode = result.statusCode
        if (array.length == 0) {
            MOCK.MOCK_FLOW.creator = global.userID
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
    form1: async function(MOCK, mode, global, app, headers) {
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/model_form?skip=0&limit=1&search=${MOCK.MOCK_FORM_1.title}&mode=${mode.title}`
        })
        const array = JSON.parse(result.payload)
        let statusCode = result.statusCode
        if (array.length == 0) {
            MOCK.MOCK_FORM_1.creator = global.userID
            MOCK.MOCK_FORM_1.flow = global.flowID
            const new_form = await app.inject({
                method: 'POST',
                headers,
                url: '/model_form',
                payload: MOCK.MOCK_FORM_1
            })
            const dados = JSON.parse(new_form.payload)
            global.form1ID = dados._id
            statusCode = new_form.statusCode
        } else {
            global.form1ID = array[0]._id
        }
        MOCK.MOCK_FLOW.starter_form = global.form1ID
        const update_result = await app.inject({
            method: 'PATCH',
            headers,
            url: `/model_flow/${global.flowID}`,
            payload: MOCK.MOCK_FLOW
        })
        const update_status = update_result.statusCode
        const statusObject = {
            form: statusCode,
            flow: update_status
        }
        const response = {
            global,
            statusObject
        }
        return response
    }
}










module.exports = DbFuncModule;