const BaseRoute = require('./base/baseRoute')
const Joi = require('joi')

const {
    join
} = require('path')
const failAction = (request, headers, error) => {
    throw error;
}

const headers = Joi.object({
    authorization: Joi.string().required()
}).unknown()

//queryString = http://localhost:5000/model_flow_list?skip=0&limit=10&nome=flash
class UtilRoutes extends BaseRoute {
    constructor(){
        super()
    }
    coverage() {
        return {
            path: '/coverage/{param*}',
            method: 'GET',
            config: {
                auth: false,// Retirar futuramente
                tags: ['api'],
                description: 'Display Instanbul Code Coverage Data',
                notes: 'Ir para URL /coverage',
                validate: { //Adicionar Authorization breve
                    // headers,
                    // failAction: failAction
                }
            },
            handler: {
                directory: { //by inert on package.json
                    path: join(__dirname, '../coverage'),
                    redirectToSlash: true,
                    index: true,
                    listing: true
                }                
            }
        }
    }
}

module.exports = UtilRoutes