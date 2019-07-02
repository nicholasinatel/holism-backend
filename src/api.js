/* eslint-disable no-console */
/* eslint-disable import/order */

/**
 * Configurar DOTENV antes de tudo --npm i dotenv
 * Config Dev or Project Environment
 */
const { config } = require('dotenv');

/**
 * join similiar ao SQL porém do NODEjs
 * Facilitar na leitura do arquivo normalizando o path
 */
const { join } = require('path');

/**
 * Simple set of assertion tests that can be used to test invariants.
 */
const { ok } = require('assert');

/*
  Provisioning - Providing Environment Variables
  ! dotenv, path, assert
  TODO: https://codeburst.io/process-env-what-it-is-and-why-when-how-to-use-it-effectively-505d0b2831e7
  Set Environment Varibale - If nothing was passed, set as "dev"
*/
const env = process.env.NODE_ENV || 'dev';

/*
 * Teste
 */
ok(
  env === 'prod' || env === 'dev' || env === 'gui' || env === 'heroku',
  'error at env, heroku config:set NODE_ENV=AMBIENTE_DESEJADO'
);

/*
  * configPath
  Pega o arquivo no diretorio independente do local onde rodar o projeto
  contanto que seja DENTRO DA PASTA SRC
*/
const configPath = join(__dirname, './../config', `.env.${env}`);
console.log('env: ', env);

/*
  * Ejeta configuracao
  Injeta os valores no ambiente
*/
config({
  path: configPath
});

// Rotas Node Module
const Hapi = require('hapi');

// Contexto E Metodos - importa Context Strategy para Metodos DBs
const Context = require('./../db/strategies/base/contextStrategy');

// MongoDb
const MongoDb = require('./../db/strategies/mongodb/mongodb');

// Schemas
const userSchema = require('./../db/strategies/mongodb/schemas/userSchema');
const FlowSchema = require('./../db/strategies/mongodb/schemas/modelFlowSchema');
const FormSchema = require('./../db/strategies/mongodb/schemas/modelFormSchema');
const ResponseSchema = require('./../db/strategies/mongodb/schemas/responseSchema');
const ProjectSchema = require('./../db/strategies/mongodb/schemas/projectSchema');

// Rotas
const AuthRoute = require('./../routes/authRoutes');
const FlowRoute = require('./../routes/modelFlowRoutes');
const FormRoute = require('./../routes/modelFormRoutes');
const ResponseRoute = require('./../routes/responseRoutes');
const ImportRoute = require('./../routes/importRoutes');
const ProjectRoute = require('./../routes/projectRoutes');
const UtilRoute = require('./../routes/utilRoutes');

// Imports de documentacao
const HapiSwagger = require('hapi-swagger');
const Vision = require('vision');
const Inert = require('inert');

// Authentication Import
const HapiJwt = require('hapi-auth-jwt2');

// Authentication
const { JWT_SECRET } = process.env;

// Server Up
const app = new Hapi.Server({
  port: process.env.PORT,
  routes: {
    cors: true
  }
});

// Mapeamento de Rotas
function mapRoutes(instance, methods) {
  // ['list', 'create','update'] - Voltando metodos dinamicamente
  const result = methods.map(method => instance[method]());
  // console.log("mapRoutes result: ", methods.map(method => instance[method]()))
  return result;
}

async function main() {
  // Connect to MongoDB
  const connection = MongoDb.connect();

  // Acesso aos Metodos - Criacao dos Contextos
  const contextFlow = new Context(new MongoDb(connection, FlowSchema));
  const contextForm = new Context(new MongoDb(connection, FormSchema));
  const contextResponse = new Context(new MongoDb(connection, ResponseSchema));
  const contextProject = new Context(new MongoDb(connection, ProjectSchema));
  const contextAuth = new Context(new MongoDb(connection, userSchema));

  // Configure Documentation
  const swaggerOptions = {
    info: {
      title: 'API Holismo - #Dagora - MVP v1.1',
      version: 'v1.1'
    },
    lang: 'pt'
  };

  // Registro de modulos e se comunicar com os outros modulos ja existentes
  await app.register([
    HapiJwt, // Registro do module de autenticacao
    Vision,
    Inert,
    {
      plugin: HapiSwagger,
      options: swaggerOptions
    }
  ]);

  // Criacao da estrategia de autenticacao
  app.auth.strategy('jwt', 'jwt', {
    key: JWT_SECRET,
    // options:{
    //     expiresIn: 120
    // },
    // eslint-disable-next-line no-unused-vars
    validate: async (dado, request) => {
      const [result] = await contextAuth.read({
        username: dado.username.toLowerCase()
      });

      if (!result) {
        console.log('Failed Validation, result: ', result);
        return {
          isValid: false
        };
      }
      // verifica no banco se o usuario continua ativo
      return {
        isValid: true // Caso nao valido = false
      };
    }
  });

  // Toda autenticacao na API por default vai usar o schema jwt criado acima
  app.auth.default('jwt');

  // Hapi Routes
  app.route([
    /*
        * Destruct pra cada rota com métodos
        ? Juntando os 2 Arrays das instancias - REST SPREAD do JS ou Separacao
        ? .methods herdados da classe baseRoute.js
    */
    ...mapRoutes(
      new FlowRoute(contextFlow, contextForm, contextResponse),
      FlowRoute.methods()
    ),
    ...mapRoutes(
      new FormRoute(contextForm, contextResponse, contextFlow),
      FormRoute.methods()
    ),
    ...mapRoutes(new ResponseRoute(contextResponse), ResponseRoute.methods()),
    ...mapRoutes(
      new ProjectRoute(
        contextProject,
        contextFlow,
        contextForm,
        contextResponse
      ),
      ProjectRoute.methods()
    ),
    ...mapRoutes(
      new ImportRoute(contextFlow, contextForm),
      ImportRoute.methods()
    ),
    // ...mapRoutes(new UtilRoute(), UtilRoute.methods()),
    // https://eslint.org/docs/rules/class-methods-use-this
    UtilRoute.coverage(),
    ...mapRoutes(new AuthRoute(JWT_SECRET, contextAuth), AuthRoute.methods())
  ]);

  await app.start();
  console.log('Server On: ');
  console.log('Server Info: ', app.info);

  return app;
}

module.exports = main();
