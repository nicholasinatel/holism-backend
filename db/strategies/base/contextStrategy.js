const ICrud = require('./../interfaces/interfaceCrud')


// Classe abstrata que chama metodos passados nos construtores
class ContextStrategy extends ICrud {
    constructor(strategy) {
        super() // Sempre chamar Classe BASE por default
        this._database = strategy
    }
    create(item) {
        return this._database.create(item)
    }
    read(item, skip, limit) {
        return this._database.read(item, skip, limit)
    }
    joinRead(item, join, username) {
        return this._database.joinRead(item, join, username)
    }
    fieldRead(item, skip, limit, select) {
        return this._database.fieldRead(item, skip, limit, select) 
    }
    readPermission(item, skip, limit, username) {
        return this._database.readPermission(item, skip, limit, username) 
    }
    update(id, item, upsert = false) {
        return this._database.update(id, item, upsert)
    }
    delete(id) {
        return this._database.delete(id)
    }
    isConnected() {
        return this._database.isConnected()
    }
    static connect() {
        return this._database.connect()
    }
}

module.exports = ContextStrategy