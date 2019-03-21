const BaseRoute = require('./base/baseRoute')
const Joi = require('joi')
const Boom = require('boom')

const QueryHelper = require('./../helpers/queryHelper')
const DateHandler = require('./../helpers/dateHelper')

const failAction = (request, headers, error) => {
    throw error;
}

// Todas as rotas usarao esse header para validar se o corpo da requisicao
// ta com o objeto conforme a necessidade, entao adiciona em todas as rotas
const headers = Joi.object({
    authorization: Joi.string().required()
}).unknown()

//queryString = http://localhost:5000/model_flow_list?skip=0&limit=10&nome=flash
class ProjectRoutes extends BaseRoute {
    constructor(db) {
        super()
        this.db = db
    }
    list() {
        return {
            path: '/project',
            method: 'GET',
            config: {
                tags: ['api'],
                description: 'Deve listar Projects do Usuario',
                notes: 'Query com 3 Parametros,<br> \
                >>><br> \
                #mode = 0 se for realizar query para achar tudo na collection, campo search em branco <br> \
                #mode = 1 para query por id, colocar id no campo search <br> \
                #mode = 2 para query por title, colocar title no campo search <br> \
                #mode = 3 para query de Projects Criados Pelo usuario X, onde X = _id do usuario passado no campo search <br> \
                #mode = 4 para query por Project COMPLETED = true or false <br> \
                >>>',
                validate: {
                    headers,
                    failAction: failAction,
                    query: {
                        search: Joi.allow(),
                        mode: Joi.number().integer().default(0).min(0).max(4)
                    } // query end
                } // validate end
            },
            handler: async (request, headers) => {
                try {
                    const {
                        search,
                        mode
                    } = request.query

                    const query = await QueryHelper.queryProjectSelecter(search, mode)

                    if (mode == 3) {
                        return this.db.joinRead(query, 'creator')
                    } else {
                        return this.db.read(query)
                    }

                } catch (error) {
                    console.error('ProjectRoute Server Internal Error: ', error)
                    return Boom.internal()
                }
                // return this.db.read()
            } //handler end
        } // list return end
    } //list end


    create() {
        return {
            path: '/project',
            method: 'POST',
            config: {
                tags: ['api'],
                description: 'Deve criar Projetos',
                notes: 'Único parâmetro <b>required</b> é o <b>Title</b>,<br>\
                os valores sugeridos estão determinados como default.<br>\
                Os valores Default podem ser substituídos, seguindo o padrão.<br>\
                >>><br>\
                --> title: Título único.<br>\
                --> completed: false ou true <br>\
                --> creator: corresponde ao usuário _ID que está criando o project.<br>\
                >>><br>\
                Salvar <b>id retornado</b> após criação com sucesso em alguma variável pois será útil.<br>',
                validate: {
                    failAction,
                    headers,
                    payload: {
                        title: Joi.string().required().min(3).max(100),
                        completed: Joi.bool().default(false),
                        creator: Joi.string().min(24).max(24).default('000000000000000000000000')
                    }
                } // validate end
            }, // config end
            handler: async (request) => {
                try {
                    let {
                        title,
                        completed,
                        creator
                    } = request.payload

                    // title = title.toLowerCase()
                    const [titulo] = await this.db.read({
                        title: title // Boa pratica sempre colocar minusculo
                    })

                    if (titulo) {
                        return Boom.conflict('Projeto informado já existe')
                    } else {
                        const result = await this.db.create({
                            title,
                            completed,
                            creator
                        })

                        return {
                            message: 'Projeto criado com sucesso',
                            _id: result._id,
                            title: result.title
                        }
                    }

                } catch (error) {
                    console.error('Error at create', error)
                    return Boom.internal()
                }
            }
        }
    } // Create End

    update() {
        return {
            path: '/project/{id}',
            method: 'PATCH',
            config: {
                tags: ['api'],
                description: 'Deve atualizar um Project por <b>_id</b>',
                notes: 'Para o update preciso que mande o objeto <b>_id</b> do <b>project</b> em string.<br>\
                neste caso, deve ser um <b>objeto id válido</b>, <b>(i.e existente no banco)</b>, utilize um que tenha retornado pelo read no banco.<br> \
                Segue exemplo com um objeto para update válido, é o mesmo no Example Value, porém em <b>formato de objeto!!!</b>: <br> \
                >>><br>\
                var MOCK_PROJECT_UPDATE = {<br>\
                &nbsp title: "flow teste_update",<br>\
                &nbsp completed: true,<br>\
                &nbsp flow: "faca77777cacacaf5f511111",<br>\
                &nbsp creator: "5c4775423ce1b91f5c344f60"<br>\
                }<br>\
                >>><br>\
                Antes do objeto ser enviado ele deve ser convertido em string: <br>\
                <b>e.g(JSON.stringify(MOCK_PROJECT_UPDATE))</b><br>\
                <b>i.e</b> significa isto é (vem do latin, os gringos usam muito) <br>\
                <b>e.g</b> significa por exemplo <br>\
                ',
                validate: {
                    headers,
                    params: {
                        id: Joi.string().required()
                    },
                    payload: {
                        title: Joi.string().required().min(3).max(100).default("flow teste_update"),
                        completed: Joi.bool().default(true),
                        creator: Joi.string().min(24).max(24).default('000000000000000000000000')
                    }
                } // validate end
            }, // config end
            handler: async (request) => {
                try {
                    const {
                        id
                    } = request.params

                    const {
                        payload
                    } = request

                    // TimeStamp Get
                    // const now = await DateHandler.DateGetter()
                

                    // FORMAT FOR UPDATE
                    const dadosString = JSON.stringify(payload)
                    // const dados = {
                    //     ...JSON.parse(dadosString),
                    //     ...now
                    // } // Object Assignment in ECMAScript 2018 https://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
                    const dados = JSON.parse(dadosString)
                    const result = await this.db.update(id, dados)

                    if (result.nModified !== 1) return Boom.preconditionFailed('ID não encontrado ou arquivo sem modificações')

                    return {
                        message: 'Projeto atualizado com sucesso!'
                    }

                } catch (error) {
                    console.error('Error at Project Update', error)
                    return Boom.internal()
                }
            }
        }
    } // update - end

    delete() {
        return {
            path: '/project/{id}',
            method: 'DELETE',
            config: {
                tags: ['api'],
                description: 'Deve deletar um Projeto por <b>_id</b>',
                notes: 'o <b> id </b> deve ser válido, realizar um read no banco antes, passar como <b>String</b>',
                validate: {
                    headers,
                    failAction,
                    params: {
                        id: Joi.string().min(24).max(24).required()
                    }
                } // validate end
            }, // config end
            handler: async (request) => {
                try {
                    const {
                        id
                    } = request.params
                    const result = await this.db.delete(id)

                    if (result.n !== 1)
                        return Boom.preconditionFailed('_ID não encontrado no banco')

                    return {
                        message: 'Projeto removido com sucesso'
                    }

                } catch (error) {
                    console.error('Error at Project Delete', error)
                    return Boom.internal()
                }
            }
        } // return delete end
    } // delete end
}

module.exports = ProjectRoutes