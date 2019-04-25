const BaseRoute = require('./base/baseRoute')
const Joi = require('joi')
const Boom = require('boom')

const QueryHelper = require('./../helpers/queryHelper')

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
                #mode = 1 para query por id do project, colocar id no campo search <br> \
                #mode = 2 para query por title, colocar title no campo search, procura titulo exato <br> \
                #mode = 3 para query por Project COMPLETED = true or false <br> \
                #mode = 4 para query por title, colocar title no campo search, procurar titulos parecidos <br> \
                >>>',
                validate: {
                    headers,
                    failAction: failAction,
                    query: {
                        skip: Joi.number().integer().default(0),
                        limit: Joi.number().integer().default(10),
                        search: Joi.allow(),
                        mode: Joi.number().integer().default(0).min(0).max(4),
                        username: Joi.string().default('admin')
                    } // query end
                } // validate end
            },
            handler: async (request, headers) => {
                try {
                    const {
                        skip,
                        limit,
                        search,
                        mode,
                        username
                    } = request.query

                    const query = await QueryHelper.queryProjectSelecter(search, mode)

                    return this.db.readPermission(query, skip, limit, username, 'project')

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
                        creator: Joi.string().required().min(3).max(100).default('admin')
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
            path: '/project/{id}/{creator}',
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
                        id: Joi.string().required(),
                        creator: Joi.string().required().min(3).max(100).default('admin')
                    },
                    payload: {
                        title: Joi.string().required().min(3).max(100).default("flow teste_update"),
                        completed: Joi.bool().default(true)
                    }
                } // validate end
            }, // config end
            handler: async (request) => {
                try {
                    const {
                        id,
                        creator
                    } = request.params

                    const {
                        payload
                    } = request

                    const query = {
                        '_id': `${id}`
                    }
                    const nuId = await this.db.writePermission(query, 0, 1, creator, 'project')

                    if (nuId.length == 0) {
                        return Boom.unauthorized()
                    } else {
                        const dadosString = JSON.stringify(payload)
                        const dados = JSON.parse(dadosString)
                        const result = await this.db.update(nuId[0]._id, dados)

                        if (result.nModified !== 1) return Boom.preconditionFailed('ID não encontrado ou arquivo sem modificações')
                    }


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
            path: '/project/{id}/{creator}',
            method: 'DELETE',
            config: {
                tags: ['api'],
                description: 'Deve deletar um project por <b>_id</b>',
                notes: 'Parametros: <br>\
                @id: o <b> id </b> deve ser válido, realizar um read no banco antes, passar como <b>String</b> <br>\
                @creator: nome do usuário fazendo o delete, este usuáro precisa ser o criador do project !!! <br> \
                caso o usuario nao seja o creator, retornara erro de nao autorizado',
                validate: {
                    headers,
                    failAction,
                    params: {
                        id: Joi.string().min(24).max(24).required(),
                        creator: Joi.string().required().min(3).max(100).default('admin')
                    }
                } // validate end
            }, // config end
            handler: async (request) => {
                try {
                    const {
                        id,
                        creator
                    } = request.params

                    const query = {
                        '_id': `${id}`
                    }
                    const nuId = await this.db.writePermission(query, 0, 1, creator, 'project')
                    if (nuId.length == 0) {
                        return Boom.unauthorized()
                    } else {
                        const result = await this.db.delete(nuId[0]._id)
                        if (result.n !== 1)
                            return Boom.preconditionFailed('_ID não encontrado no banco')

                        return {
                            message: 'Projeto removido com sucesso'
                        }
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