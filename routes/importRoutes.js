const BaseRoute = require('./base/baseRoute')
const Joi = require('joi')
const Boom = require('boom')
const failAction = (request, headers, error) => {
    throw error;
}

// Todas as rotas usarao esse header para validar se o corpo da requisicao
// ta com o objeto conforme a necessidade, entao adiciona em todas as rotas
const headers = Joi.object({
    authorization: Joi.string().required()
}).unknown()

class ImportRoutes extends BaseRoute {
    constructor(dbFlow, dbForm) {
        super()
        this.dbFlow = dbFlow
        this.dbForm = dbForm
    }
    import() {
        return {
            path: '/import/{id}',
            method: 'POST',
            config: {
                tags: ['api'],
                description: 'IMPORT Flow & Forms',
                notes: 'Único parâmetro necessário é o <b>_id</b> do flow para importar <br>\
                STEP_FORWARDS dos FORMS precisa estar correto <br>\
                I.E um linkado no outro sem erros <br>\
                ULTIMO STEP_FORWARD PRECISA SER ffffffffffffffffffffffff <br>\
                SE NÃO FOR! VAI DAR PROBLEMA! e.g LOOP INFINITO NO SERVER!!!!<br>\
                ...',
                validate: {
                    failAction,
                    headers,
                    params: {
                        id: Joi.string().required()
                    }
                } // validate end
            }, // config end
            handler: async (request) => {
                try {
                    // Read Flow Id
                    const {
                        id
                    } = request.params

                    // Check if Last Form Is Correct and then make import
                    // Get Flow Object
                    const [dados_flow] = await this.dbFlow.read({
                        '_id': `${id}`
                    }, 0, 1)

                    // console.log("check_form: ", check_form)
                    if (dados_flow.starter_form.toString() != 'ffffffffffffffffffffffff') {
                        let count = 0
                        let stepIdCheck = dados_flow.starter_form
                        let [check_form] = await this.dbForm.read({
                            '_id': `${stepIdCheck}`
                        })
                        do {                            
                            [check_form] = await this.dbForm.read({
                                '_id': `${stepIdCheck}`
                            })
                            stepIdCheck = check_form.step_forward
                            count++
                            if (count > 99) {
                                throw error
                            }
                        } while (stepIdCheck.toString() != 'ffffffffffffffffffffffff')
                    }

                    // Delete _id, __v, createdAt, updatedAt
                    const import_flow = {
                        title: dados_flow.title,
                        permission_read: dados_flow.permission_read,
                        permission_write: dados_flow.permission_write,
                        completed: dados_flow.completed,
                        starter_form: dados_flow.starter_form,
                        creator: dados_flow.creator,
                        project: dados_flow.project
                    }

                    // Create New Flow
                    const new_flow = await this.dbFlow.create(import_flow)

                    // Get Starter_Form ID from Imported Flow                    
                    // If != FFFFFFFFFFFF
                    if (import_flow.starter_form.toString() != 'ffffffffffffffffffffffff') {
                        // Get Form Object
                        const [dados_starter_form] = await this.dbForm.read({
                            '_id': `${import_flow.starter_form}`
                        })
                        // Delete _id, __v, createdAt, updatedAt
                        const starter_form = {
                            title: dados_starter_form.title,
                            step_forward: dados_starter_form.step_forward,
                            step_backward: dados_starter_form.step_backward,
                            flow: new_flow._id, //
                            data: dados_starter_form.data,
                            permission: dados_starter_form.permission,
                            secret: dados_starter_form.secret,
                            creator: dados_starter_form.creator
                        }
                        // Create New Starter_Form
                        let new_form = await this.dbForm.create(starter_form)
                        // Update New Flow
                        new_flow.starter_form = new_form._id
                        const new_flow_update = await this.dbFlow.update(new_flow._id, new_flow)
                        // Get step_forward ID from Starter_Form
                        // If != FFFFFFFFFFFF
                        let nuFid = new_form._id
                        let stepFid = new_form.step_forward
                        let stepBid = new_form._id
                        do {
                            // Get Form Object
                            let [dados_nu_form] = await this.dbForm.read({
                                '_id': `${stepFid}`
                            })

                            // Delete _id, __v, createdAt, updatedAt
                            // Watchout for Step_Backward
                            const nu_form_1 = {
                                title: dados_nu_form.title,
                                step_forward: dados_nu_form.step_forward,
                                step_backward: stepBid, // Atualiza Agora
                                flow: new_flow._id, //
                                data: dados_nu_form.data,
                                permission: dados_nu_form.permission,
                                secret: dados_nu_form.secret,
                                creator: dados_nu_form.creator
                            }

                            // Create New Form
                            let nu_form_2 = await this.dbForm.create(nu_form_1)

                            // Update Recursive Variables
                            stepFid = nu_form_2.step_forward
                            stepBid = nu_form_2._id

                            // Get Previous Form Object
                            let [dados_old_form] = await this.dbForm.read({
                                '_id': `${nuFid}`
                            })
                            // Update Previous Form
                            nuFid = dados_old_form._id
                            let old_update = await this.dbForm.update(nuFid, {
                                step_forward: nu_form_2._id
                            })
                            // Set nuFid to the newest form
                            nuFid = nu_form_2._id

                        } while (stepFid.toString() != 'ffffffffffffffffffffffff')

                    }

                    return {
                        message: 'Import feito com sucesso',
                        // _id: result._id,
                        // title: result.title
                    }


                } catch (error) {
                    console.error('Error at Import', error)
                    return Boom.internal()
                }
            }
        }
    } // IMPORT END
}

module.exports = ImportRoutes