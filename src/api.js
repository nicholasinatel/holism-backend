// Configurar DOTENV antes de tudo --npm i dotenv
// Config Dev or Project Environment
const {
    config //
} = require('dotenv')

const { // join do NODEjs
    join // Facilitar na leitura do arquivo normalizando o path
} = require('path')
const {
    ok // teste
} = require('assert')

const env = process.env.NODE_ENV || "dev" // setar ambiente - se nao passou nada SETA ambiente de dev
ok(env == "prod" || env == "dev" || env == "gui", "error at env, ou dev ou prod, utilize heroku config:set NODE_ENV=AMBIENTE_DESEJADO") // testar ambiente prod ou dev
// configPath pega o arquivo no diretorio independente do local onde rodar o projeto
// contanto que seja DENTRO DA PASTA SRC
const configPath = join(__dirname, './../config', `.env.${env}`)
console.log("env: ", env)
config({
    path: configPath // Ejeta configuracao - Injeta os valores no ambiente
})

// agrupa todas as minhas rotas e coloca elas dinamicamente
const Hapi = require('hapi')
// Contexto E Metodos
const Context = require('./../db/strategies/base/contextStrategy') // importa Context Strategy para Metodos DBs
// MongoDb
const MongoDb = require('./../db/strategies/mongodb/mongodb') // importando MongoDB
// Schemas
const userSchema = require('./../db/strategies/mongodb/schemas/userSchema')
const FlowSchema = require('./../db/strategies/mongodb/schemas/modelFlowSchema')
const FormSchema = require('./../db/strategies/mongodb/schemas/modelFormSchema')
const ResponseSchema = require('./../db/strategies/mongodb/schemas/responseSchema')
const ProjectSchema = require('./../db/strategies/mongodb/schemas/projectSchema')
// Rotas
const AuthRoute = require('./../routes/authRoutes')
const FlowRoute = require('./../routes/modelFlowRoutes')
const FormRoute = require('./../routes/modelFormRoutes')
const ResponseRoute = require('./../routes/responseRoutes')
const ImportRoute = require('./../routes/importRoutes')
const ProjectRoute = require('./../routes/projectRoutes')
const UtilRoute = require('./../routes/utilRoutes')

// Imports de documentacao
const HapiSwagger = require('hapi-swagger')
const Vision = require('vision')
const Inert = require('inert')

// Authentication Import
const HapiJwt = require('hapi-auth-jwt2')

// Authentication
const JWT_SECRET = process.env.JWT_SECRET
// Server Up
const app = new Hapi.Server({
    port: process.env.PORT,
    routes: {
        cors: true
    }
})

// Mapeamento de Rotas
function mapRoutes(instance, methods) {
    // ['list', 'create','update'] - Voltando metodos dinamicamente
    result = methods.map(method => instance[method]())
    // console.log("mapRoutes result: ", methods.map(method => instance[method]()))
    return result
}

async function main() {

    // Conecta no Bando de Dados Mongo
    const connection = MongoDb.connect()
    // Acesso aos Metodos
    const contextFlow = new Context(new MongoDb(connection, FlowSchema)) // Flow
    const contextForm = new Context(new MongoDb(connection, FormSchema)) // Form
    const contextResponse = new Context(new MongoDb(connection, ResponseSchema)) // Response
    const contextProject = new Context(new MongoDb(connection, ProjectSchema)) // Projects
    const contextAuth = new Context(new MongoDb(connection, userSchema)) // Users

    const swaggerOptions = {
        info: {
            title: 'API Holismo - #Dagora - MVP v1.1',
            version: 'v1.1'
        },
        lang: 'pt'
    }
    // Registro de modulos e se comunicar com os outros modulos ja existentes
    await app.register([
            HapiJwt, // Registro do module de autenticacao
            Vision,
            Inert,
            {
                plugin: HapiSwagger,
                options: swaggerOptions
            }
        ])

    // Criacao da estrategia de autenticacao
    app.auth.strategy('jwt', 'jwt', {
        key: JWT_SECRET,
        // options:{
        //     expiresIn: 20
        // },
        validate: async (dado, request) => {
            const [result] = await contextAuth.read({
                username: dado.username.toLowerCase(),
            })
            if (!result) {
                console.log("Failed Validation, result: ", result)
                return {
                    isValid: false
                }
            }
            // verifica no banco se o usuario continua ativo
            // verifica se usuario continua pagando
            return {
                isValid: true // caso nao valido false
            }
        }
    })
    // Agora toda autenticacao na API por default vai usar o schem jwt criado acima
    app.auth.default('jwt')

    // console.log("mapRoutes: ", mapRoutes(new HeroRoute(contextHeroi), HeroRoute.methods()))
    app.route([
        // Destruct pra cada rota com metodos
        // Juntando os dois arrays das instancias - REST SPREAD do JS ou Separacao
        // .methods herdados da classe baseRoute.js 
        ...mapRoutes(new FlowRoute(contextFlow, contextForm), FlowRoute.methods()),
        ...mapRoutes(new FormRoute(contextForm, contextResponse), FormRoute.methods()),
        ...mapRoutes(new ResponseRoute(contextResponse), ResponseRoute.methods()),
        ...mapRoutes(new ProjectRoute(contextProject), ProjectRoute.methods()),
        ...mapRoutes(new ImportRoute(contextFlow, contextForm), ImportRoute.methods()),
        ...mapRoutes(new UtilRoute(), UtilRoute.methods()),
        ...mapRoutes(new AuthRoute(JWT_SECRET, contextAuth), AuthRoute.methods())
    ])

    // Apos configurar a rota inicializar API
    await app.start()
    console.log("Server Rodando na porta: ", app.info.port)

    return app
}

module.exports = main()