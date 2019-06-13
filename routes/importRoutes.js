const BaseRoute = require('./base/baseRoute');
const Help = require('../helpers/importHelper');
const Joi = require('joi');
const Boom = require('boom');
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
            path: '/import/{id}/{username}/{roles}',
            method: 'POST',
            config: {
                tags: ['api'],
                description: 'IMPORT Flow & Forms',
                notes: '<b>Único parâmetro necessário é o _id do Flow para importar</b><br>\
                Recebe um _id de Flow e Copia o Flow e Forms Filhos em novos objetos no banco de dados<br>\
                ------------------------------------------------------------------------------------------------------------------------<br>\
                <b>step_forward e step_backward precisa estar correto</b> <br>\
                ULTIMO STEP_FORWARD PRECISA SER ffffffffffffffffffffffff <br>\
                PRIMEIRO STEP_BACKWARD PRECISA SER 000000000000000000000000 <br>\
                SE ESTIVER ERRADO TEREMOS UM LOOP INFINITO NO SERVER!<br>\
                ------------------------------------------------------------------------------------------------------------------------<br>\
                Body <br>\
                > <b>title</b>: <br>\
                > <b>permission_read</b>: <br>\
                > <b>permission_write</b>: <br>\
                > <b>starter_form</b>: <br>\
                > <b>creator</b>: <br>\
                > <b>project</b>: <br>\
                ------------------------------------------------------------------------------------------------------------------------<br>\
                ',
                validate: {
                    failAction,
                    headers,
                    params: {
                        id: Joi.string().required(),
                        username: Joi.string().required(),
                        roles: Joi.array().min(1).items(Joi.string()).default(['dev'])
                    },
                    payload: {
                        title: Joi.string().required().min(3).max(100),
                        permission_read: Joi.array().min(1).items(Joi.string()).default(['admin', 'gui123', 'fifi24']),
                        permission_write: Joi.array().min(1).items(Joi.string()).default(['admin', 'gui123', 'fifi24']),
                        completed: Joi.bool().default(false),
                        creator: Joi.string().min(1).default('admin'),
                        project: Joi.string().min(24).max(24).default('222222222222222222222222'),
                        tempoCompleto: Joi.date().default('2002-12-08 22:00:00.000')
                    }
                } // validate end
            }, // config end
            handler: async (request) => {
                try {
                    // Read Flow Id
                    const {
                        id,
                        username,
                        roles
                    } = request.params
                    let {
                        title,
                        permission_read,
                        permission_write,
                        completed,
                        creator,
                        project,
                        tempoCompleto
                    } = request.payload

                    roles.push(username);

                    const help = new Help();
                    /**
                     *  * Check if Starter Form Is Correct and then make import
                     *  ! Get Flow Object
                     */
                    const [dados_flow] = await this.dbFlow.read({
                        '_id': `${id}`
                    }, 0, 1)
                    
                    if (dados_flow.starter_form.toString() != 'ffffffffffffffffffffffff') {
                        let count = 0;
                        let stepIdCheck = dados_flow.starter_form;
                        let [check_form] = await this.dbForm.read({
                            '_id': `${stepIdCheck}`
                        });
                        do {
                            [check_form] = await this.dbForm.read({
                                '_id': `${stepIdCheck}`
                            })
                            stepIdCheck = check_form.step_forward
                            count++
                            if (count > 99) {
                                throw error;
                            }
                        } while (stepIdCheck.toString() != 'ffffffffffffffffffffffff')
                    }

                    /**
                     * ! Delete _id, __v, createdAt, updatedAt
                     * ! Create New Flow
                     */
                    const import_flow = help.delFlowDirty(request.payload, dados_flow.starter_form);
                    const new_flow = await this.dbFlow.create(import_flow)

                    // Get Starter_Form ID from Imported Flow                    
                    if (import_flow.starter_form.toString() != 'ffffffffffffffffffffffff') {
                        // Get 1st Form Object
                        let [dados_starter_form] = await this.dbForm.read({
                            '_id': `${import_flow.starter_form}`
                        })

                        /**
                         * * Check Roles Vs Permission in starter form
                         */
                        let ok = help.compareArrays(dados_starter_form.permission, roles);

                        
                        
                        


                        if (ok) {
                            /**
                             * ! Delete _id, __v, createdAt, updatedAt
                             * ! Create New Starter_Form
                             * ! Update New Flow
                             */
                            const starter_form = help.delFormDirty(dados_starter_form, new_flow._id);
                            let new_form = await this.dbForm.create(starter_form)
                            new_flow.starter_form = new_form._id
                            await this.dbFlow.update(new_flow._id, new_flow)

                            /**
                             * * Get Initial
                             * ! step_forward 
                             * ! ID from Starter_Form
                             * ! step_backward
                             */
                            let nuFid = new_form._id
                            let stepFid = new_form.step_forward
                            let stepBid = new_form._id

                            do {
                                /**
                                 * * Loop To Import All Remaining Forms
                                 */
                                if (stepFid[0] != 'ffffffffffffffffffffffff') {
                                    /**
                                     * * Get Form Object
                                     * ! Delete _id, __v, createdAt, updatedAt
                                     * ! Watchout for Step_Backward
                                     * * Create nu_form_2
                                     * ? Update Recursive Variables
                                     * * Get Previous Form Object
                                     * ! Update Previous Form
                                     * TODO: Old Update
                                     */
                                    let [dados_nu_form] = await this.dbForm.read({
                                        '_id': `${stepFid}`
                                    })

                                    let okLoop = help.compareArrays(dados_nu_form.permission, roles);
                                    /**
                                     * * LOOP FOR PERMISSIONS
                                     * TODO: If not permitted Jump to next form
                                     */
                                    while (okLoop == false && dados_nu_form.step_forward != 'ffffffffffffffffffffffff') {
                                        [dados_nu_form] = await this.dbForm.read({
                                            '_id': `${dados_nu_form.step_forward}`
                                        })

                                        stepFid = dados_nu_form.step_forward;

                                        okLoop = help.compareArrays(dados_nu_form.permission, roles);
                                    }

                                    if (okLoop === false && dados_nu_form.step_forward == 'ffffffffffffffffffffffff') {
                                        await this.dbForm.update(stepBid, {
                                            step_forward: 'ffffffffffffffffffffffff'
                                        });
                                        stepFid = dados_nu_form.step_forward;
                                    }

                                    if (okLoop) {
                                        const nu_form_1 = help.newForm1(dados_nu_form, new_flow._id, stepBid);
                                        let nu_form_2 = await this.dbForm.create(nu_form_1)
                                        stepFid = nu_form_2.step_forward
                                        stepBid = nu_form_2._id

                                        let [dados_old_form] = await this.dbForm.read({
                                            '_id': `${nuFid}`
                                        })

                                        nuFid = dados_old_form._id

                                        await this.dbForm.update(nuFid, {
                                            step_forward: nu_form_2._id
                                        })

                                        /**
                                         * * Set nuFid to the newest form 
                                         */
                                        nuFid = nu_form_2._id
                                        okLoop = false;
                                    }
                                }
                            } while (stepFid.toString() != 'ffffffffffffffffffffffff' || stepFid == undefined)


                        } else {
                            /**
                             * TODO: Go to next form and verify because the 1st is wrong
                             */

                             
                            let [new_dados_starter_form] = await this.dbForm.read({
                                '_id': `${dados_starter_form.step_forward}`
                            });

                            /**
                             * * Check Roles Vs Permission in starter form
                             * ? https://stackoverflow.com/questions/12433604/how-can-i-find-matching-values-in-two-arrays
                             */
                            let ok2 = help.compareArrays(new_dados_starter_form.permission, roles);

                            while (ok2 == false && new_dados_starter_form.step_forward != 'ffffffffffffffffffffffff') {
                                [new_dados_starter_form] = await this.dbForm.read({
                                    '_id': new_dados_starter_form.step_forward
                                });
                                ok2 = help.compareArrays(new_dados_starter_form.permission, roles);
                            }

                            if (ok2) {
                                
                                /**
                                 * * Loop To Import All Remaining Forms
                                 */
                                /**
                                 * ! Delete _id, __v, createdAt, updatedAt
                                 * ! Create New Starter_Form
                                 * ! Update New Flow
                                 */
                                const starter_form = help.delFormDirty(new_dados_starter_form, new_flow._id);
                                let new_form = await this.dbForm.create(starter_form)
                                await this.dbForm.update(new_form._id,{step_backward: '000000000000000000000000'});
                                new_flow.starter_form = new_form._id
                                await this.dbFlow.update(new_flow._id, new_flow)

                                /**
                                 * * Get Initial
                                 * ! step_forward 
                                 * ! ID from Starter_Form
                                 * ! step_backward
                                 */
                                let nuFid = new_form._id
                                let stepFid = new_form.step_forward
                                let stepBid = new_form._id

                                do {
                                    /**
                                     * * Loop To Import All Remaining Forms
                                     */
                                    if (stepFid[0] != 'ffffffffffffffffffffffff') {
                                        /**
                                         * * Get Form Object
                                         * ! Delete _id, __v, createdAt, updatedAt
                                         * ! Watchout for Step_Backward
                                         * * Create nu_form_2
                                         * ? Update Recursive Variables
                                         * * Get Previous Form Object
                                         * ! Update Previous Form
                                         * TODO: Old Update
                                         */
                                        let [dados_nu_form] = await this.dbForm.read({
                                            '_id': `${stepFid}`
                                        })

                                        let okLoop = help.compareArrays(dados_nu_form.permission, roles);
                                        /**
                                         * * LOOP FOR PERMISSIONS
                                         * TODO: If not permitted Jump to next form
                                         */
                                        while (okLoop == false && dados_nu_form.step_forward != 'ffffffffffffffffffffffff') {
                                            [dados_nu_form] = await this.dbForm.read({
                                                '_id': `${dados_nu_form.step_forward}`
                                            })

                                            stepFid = dados_nu_form.step_forward;

                                            okLoop = help.compareArrays(dados_nu_form.permission, roles);
                                        }

                                        if (okLoop === false && dados_nu_form.step_forward == 'ffffffffffffffffffffffff') {
                                            await this.dbForm.update(stepBid, {
                                                step_forward: 'ffffffffffffffffffffffff'
                                            });
                                            stepFid = dados_nu_form.step_forward;
                                        }

                                        if (okLoop) {
                                            const nu_form_1 = help.newForm1(dados_nu_form, new_flow._id, stepBid);
                                            let nu_form_2 = await this.dbForm.create(nu_form_1)
                                            stepFid = nu_form_2.step_forward
                                            stepBid = nu_form_2._id

                                            let [dados_old_form] = await this.dbForm.read({
                                                '_id': `${nuFid}`
                                            })

                                            nuFid = dados_old_form._id

                                            await this.dbForm.update(nuFid, {
                                                step_forward: nu_form_2._id
                                            })

                                            /**
                                             * * Set nuFid to the newest form 
                                             */
                                            nuFid = nu_form_2._id
                                            okLoop = false;
                                        }
                                    }
                                } while (stepFid.toString() != 'ffffffffffffffffffffffff' || stepFid == undefined)
                            }
                        }
                    }
                    return {
                        message: 'Import feito com sucesso',
                        _id: new_flow._id
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