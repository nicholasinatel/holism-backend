# Configuração e operação da API Holismo

## Informações da API

Stack Utilizada

- Node -v 8.11.2
- Hapi -v 17.8.1
- bcryptjs -v 2.4.3
- Mongoose -v 5.4.4
- MongoDb na AWS -v 4.0.5

## Documentação

- [URL's do servidor](https://github.com/nicholasinatel/holism-backend/blob/master/SERVER.md)
- [Configuração MongoDB AWS](https://github.com/nicholasinatel/holism-backend/blob/master/README-mongo.md)
- [Deploy AWS](https://github.com/nicholasinatel/holism-backend/blob/master/README-AWS-API.md)
- [Administrador](https://github.com/nicholasinatel/holism-backend/blob/master/README-admin.md)

## QuickStart

Instalar todas as dependências e então rodar os testes locais é a melhor maneira de começar o projeto.

- Local

```
npm run start
```

- Testes Locais

```
npm run dev
```

- Testes Heroku

```
npm run herotest
```

- AWS (fora de uso)

```
npm run aws
```

- Testes na AWS (fora de uso)

```
npm run prod
```

## MongoDB

....

## Deploy Heroku

## Deploy Automático

(Fora de uso, somente com AWS)
Para fazer o deploy automático, utilizar o script deploy.sh localizado na pasta scripts conforme indicado abaixo

1 - Copiar Somente o script **deploy.sh** e a **chave encriptada** para um mesmo diretório dentro do servidor (AWS ou qualquer outro contanto que utilize uma versão estável do Ubuntu).
2 - Instalar Node, Forever e MongoDb..
3 - Ter uma instância do MongoDb rodando e copiar as informações para os arquivos necessários.
2 - executar `sh deploy.sh`

## Utilizando a API

- Local

Após executar o server a API estará disponível em **localhost:PORT**, sendo PORT determinado no arquivo de configuração em **config/.env.dev**.

Para verificar a utilização da API, o server disponibiliza uma documentação em **localhost:PORT/documentation** através da dependência SWAGGER. Nela é possível verificar todas as rotas e como usa-las.

- Heroku deploy

Após executar o server a API estará disponível em **URL_API_HEROKU** como descrito no arquivo **SERVER.md** por segurança.

- AWS (Fora de uso)

Após executar o server a API estará disponível em **URL_API** como descrito no arquivo **SERVER.md** por segurança.

Para verificar a utilização da API, o server disponibiliza uma documentação em **URL_DOCUMENTAÇÃO** como descrito no arquivo **SERVER.md** por segurança.

## Exemplo De Listagens Usando API

1. Listar todos os Projetos (Tela Inicial Após Login)

- Rota /project
- Get Request
- Mode 0
- Campo Search em branco

2. Listar todos os Fluxos (Clickou em Um Projeto)

- Rota /model_flow
- Get Request
- Mode 3
- Search ID do project clickado
- Utilizar permission_read: para visualizar Flows
- Utilizar permission_write: para (UPDATE || DELETE) Flows

3. Listar todos os Formulários (Clickou em Um Fluxo)

- Rota /model_form
- Get Request
- Mode 3
- Search ID do Flow Pai
- VER OBJETO_1 para exemplo
- UTILIZAR **OBJETO_1.flow.permission_read** para renderizar FORMS

4. Abrir Um Formulário de Um Fluxo (Clickou em Um Formulário)

- Rota /model_form
- Get Request
- Mode 4
- Search: **"model_FORM.\_id/model_FLOW.\_id"**
- UTILIZAR **OBJETO_1.permission** para renderizar BUTTON de (RESPONDER ou VER_RESPOSTAS)
- UTILIZAR **OBJETO_1.flow.permission_write** para renderizar BUTTON (DELETE ou UPDATE)

5. Listar Respostas (Clickou Ver Respostas)

- Rota /response
- Get Request
- Search: model_form.\_id

6. Listar Respostas Com Secret (Clickou Ver Respostas)

- Rota /response
- Get Request
- Search: model_form.\_id
- QUANDO SECRET = TRUE, RESPONSES VISIVEIS SOMENTE PARA CRIADOR DO FORM E DA RESPONSE

```
var OBJETO_1 = [
    {
      "step_forward": [
        "ffffffffffffffffffffffff"
      ],
      "step_backward": [
        "000000000000000000000000"
      ],
      "permission": [
        "admin",
        "gui123",
        "fifi24"
      ],
      "_id": "5cdaaceb696fa401a0610ead",
      "title": "Form Teste 1",
      "flow": {
        "permission_read": [
          "admin",
          "gui123",
          "fifi24"
        ],
        "permission_write": [
          "admin",
          "gui123",
          "fifi24"
        ],
        "_id": "5cdaacce696fa401a0610eac",
        "title": "Flow Teste 1",
        "completed": false,
        "starter_form": "5cdaaceb696fa401a0610ead",
        "creator": "admin",
        "project": "5cd9b77b56997600f898fb8a",
        "createdAt": "2019-05-14T11:55:58.672Z",
        "updatedAt": "2019-05-14T11:56:27.367Z",
        "__v": 0
      },
      "data": [
        {
          "sections": [
            {
              "instances": [
                "test"
              ],
              "rows": [
                {
                  "controls": [
                    {
                      "dataOptions": [
                        {
                          "id": 4321,
                          "text": 1
                        }
                      ],
                      "_id": "5cdaaceb696fa401a0610eb1",
                      "componentType": "text",
                      "name": "control_text_701290",
                      "fieldName": "control_text_701290",
                      "label": "Nome",
                      "order": 0,
                      "defaultValue": "test",
                      "value": "test",
                      "className": "col-md-6",
                      "readonly": true,
                      "labelBold": true,
                      "labelItalic": false,
                      "labelUnderline": false,
                      "required": true,
                      "isMultiLine": false,
                      "isInteger": false,
                      "decimalPlace": 0,
                      "isTodayValue": false,
                      "dateFormat": "dd/mm/yy",
                      "isNowTimeValue": false,
                      "timeFormat": "HH:mm",
                      "isMultiple": false,
                      "isAjax": false,
                      "ajaxDataUrl": "test",
                      "isChecked": false
                    }
                  ],
                  "_id": "5cdaaceb696fa401a0610eb0",
                  "name": "section_188114_row_82107",
                  "label": "test",
                  "order": 0
                }
              ],
              "_id": "5cdaaceb696fa401a0610eaf",
              "name": "section_188114",
              "label": "Seção 1",
              "clientKey": "section_188114",
              "order": 0,
              "labelPosition": "top",
              "isDynamic": false,
              "minInstance": 1,
              "maxInstance": 0
            }
          ],
          "_id": "5cdaaceb696fa401a0610eae",
          "layout": "tab",
          "_uniqueId": 0.8719504664016076
        }
      ],
      "secret": false,
      "creator": "admin",
      "completed": false,
      "createdAt": "2019-05-14T11:56:27.361Z",
      "updatedAt": "2019-05-14T11:56:27.361Z",
      "__v": 0
    }
  ]
```

## Testes e garantia do funcionamento

Os testes tanto Locais quanto na AWS são responsáveis por popular o MongoDB e garantir o funcionamento de suas funções, para que todos os testes funcionem corretamente é preciso variar os itens criados.

Como garantia de que os testes estão funcionando você pode verificar os resultados pela dependência **Istanbul**.

- Local

Após execução dos testes navegar até **localhost:PORT/coverage**.

- Heroku

Após execução dos testes navegar até **URL_TESTES_HEROKU:PORT/coverage**.

- AWS (Fora de uso)

Após execução dos testes e com o server online navegar até **18.231.115.112:PORT/coverage**.

## Funcionamento Interno da API

![ERD](utilities/ERD_HolismoSchemas.jpeg)
