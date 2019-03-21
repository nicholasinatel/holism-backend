const assert = require('assert')
const PasswordHelper = require('./../helpers/passwordHelper')

const SENHA = '123'
const HASH = '$2a$04$sb0tncEXOM9YHGALayDSjeF9G5/LNNqHxpz/galHJO9vTDtEi/an2'

describe('PasswordHelper test suite', function () {
    it('Deve gerar um Hash a partir de uma senha', async () => {
        // Salvar Hash Gerada E Assert.ok
        const result = await PasswordHelper.hashPassword(SENHA)
        // console.log("result Password: ", result)
        assert.ok(result.length > 10)
    })

    it('Deve comparar uma senha e seu hash', async () => {
        // Compara Senha Local Com Hash Local no arquivo passwordHelper.js
        const result = await PasswordHelper.comparePassword(SENHA, HASH)
        assert.ok(result)
    })
})