const ICrud = require('./../interfaces/interfaceCrud')
const Mongoose = require('mongoose')
const STATUS = {
    0: 'Desconectado',
    1: 'Conectado',
    2: 'Conectando',
    3: 'Desconectando'
}

// Classes concretas que implementam as funcoes de fato
class MongoDB extends ICrud {
    constructor(connection, schema) {
        super()
        this._schema = schema
        this._connection = connection
    }
    async isConnected() {
        /*
        0: Desconectado
        1: Conectado
        2: Conectando
        3: Desconectando
        */
        const state = STATUS[this._connection.readyState]
        if (state === 'Conectado') return state;
        if (state !== 'Conectando') return state;

        await new Promise(resolve => setTimeout(resolve, 1000))

        return STATUS[this._connection.readyState]
    }
    static connect() {
        Mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true
        }, function (error) {
            if (!error) return;
            console.log("falha na conexao", error)
        })
        const connection = Mongoose.connection
        connection.once('open', () => {
            console.log('database on')
        })
        return connection
    }
    // CRUD
    create(item) {
        return this._schema.create(item)
    }

    update(id, item) {
        return this._schema.updateOne({_id: id}, {$set: item})
    }

    read(item, skip, limit) {
        return this._schema.find(item).skip(skip).limit(limit)
    }

    joinRead(item, join) {
        return this._schema.find(item).populate(join)
    }

    fieldRead(item, skip, limit, select) {
        return this._schema.find(item).skip(skip).limit(limit).select(select)
    }

    delete(id) {
        return this._schema.deleteOne({
            _id: id
        })
    }
}

module.exports = MongoDB