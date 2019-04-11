const ICrud = require('./../interfaces/interfaceCrud')
const Mongoose = require('mongoose')
const STATUS = {
    0: 'Desconectado',
    1: 'Conectado',
    2: 'Conectando',
    3: 'Desconectando'
}

const dbOption = {
    local: 'mongodb://nicholas:123456@192.168.99.100:27017/herois',
    aws: 'mongodb://172.31.5.155:27017/holismo'
}

const database = dbOption.local

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
        return this._schema.updateOne({
            _id: id
        }, {
            $set: item
        })
    }

    read(item, skip, limit) {
        return this._schema.find(item).skip(skip).limit(limit)
    }

    writePermission(item, skip, limit, username, type) {
        if(type === 'flow'){
            return this._schema.find({
                $and: [item,
                    {
                        permission_write: username
                    }
                ]
            }).skip(skip).limit(limit)
        } else if(type === 'form'){
            return this._schema.find({
                $and: [item,
                    {
                        permission: username
                    }
                ]
            }).skip(skip).limit(limit)
        }

    }
    readPermission(item, skip, limit, username, type) {
        if (type === 'form') {
            return this._schema.find({
                $and: [item,
                    {
                        permission: username
                    }
                ]
            }).skip(skip).limit(limit)
        } else if (type === 'flow') {
            return this._schema.find({
                $and: [item,
                    {
                        permission_read: username
                    }
                ]
            }).skip(skip).limit(limit)
        }
    }

    joinRead(item, join, username, type) {
        if (type === 'form') {
            return this._schema.find({
                $and: [item,
                    {
                        permission: username
                    }
                ]
            }).populate(join, '-password')
        } else if (type === 'flow') {
            return this._schema.find({
                $and: [item,
                    {
                        permission_read: username
                    }
                ]
            }).populate(join, '-password')
            // https://stackoverflow.com/questions/12096262/how-to-protect-the-password-field-in-mongoose-mongodb-so-it-wont-return-in-a-qu
        }
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