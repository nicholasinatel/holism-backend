/* eslint-disable no-console */
const Mongoose = require('mongoose');
const ICrud = require('./../interfaces/interfaceCrud');

const STATUS = {
  0: 'Desconectado',
  1: 'Conectado',
  2: 'Conectando',
  3: 'Desconectando'
};

// const dbOption = {
//   local: 'mongodb://nicholas:123456@192.168.99.100:27017/herois',
//   aws: 'mongodb://172.31.5.155:27017/holismo'
// };

// Classes concretas que implementam as funcoes de fato
class MongoDB extends ICrud {
  constructor(connection, schema) {
    super();
    this._schema = schema;
    this._connection = connection;
  }

  async isConnected() {
    /*
    0: Desconectado
    1: Conectado
    2: Conectando
    3: Desconectando
    */
    const state = STATUS[this._connection.readyState];
    if (state === 'Conectado') return state;
    if (state !== 'Conectando') return state;

    await new Promise(resolve => setTimeout(resolve, 1000));

    return STATUS[this._connection.readyState];
  }

  static connect() {
    Mongoose.connect(
      process.env.MONGODB_URL,
      {
        useNewUrlParser: true
      },
      function throwError(error) {
        if (!error) return;
        console.log('falha na conexao', error);
      }
    );
    const { connection } = Mongoose;
    connection.once('open', () => {
      console.log('database on');
    });
    return connection;
  }

  // CRUD
  create(item) {
    return this._schema.create(item);
  }

  update(id, item) {
    return this._schema.updateOne(
      {
        _id: id
      },
      {
        $set: item
      }
    );
  }

  read(item, skip, limit) {
    return this._schema
      .find(item)
      .skip(skip)
      .limit(limit);
  }

  // eslint-disable-next-line consistent-return
  writePermission(item, skip, limit, roles, type) {
    if (type === 'flow') {
      return this._schema
        .find({
          $and: [
            item,
            {
              permission_write: { $in: roles }
            }
          ]
        })
        .skip(skip)
        .limit(limit);
    }
    if (type === 'form') {
      return this._schema
        .find({
          $and: [
            item,
            {
              permission: { $in: roles }
            }
          ]
        })
        .skip(skip)
        .limit(limit);
    }
    if (type === 'project') {
      return this._schema
        .find({
          $and: [
            item,
            {
              creator: roles
            }
          ]
        })
        .skip(skip)
        .limit(limit);
    }
  }

  // eslint-disable-next-line consistent-return
  readPermission(item, skip, limit, roles, type) {
    if (type === 'form') {
      return this._schema
        .find({
          $and: [
            item,
            {
              permission: { $in: roles }
            }
          ]
        })
        .skip(skip)
        .limit(limit);
    }
    if (type === 'flow') {
      return this._schema
        .find({
          $and: [
            item,
            {
              permission_read: { $in: roles }
            }
          ]
        })
        .skip(skip)
        .limit(limit);
    }
    if (type === 'project') {
      return this._schema
        .find({
          $and: [
            item,
            {
              creator: roles
            }
          ]
        })
        .skip(skip)
        .limit(limit);
    }
  }

  // eslint-disable-next-line consistent-return
  joinRead(item, join, roles, type) {
    if (type === 'form') {
      return this._schema
        .find({
          $and: [
            item,
            {
              permission: { $in: roles }
            }
          ]
        })
        .populate(join, '-password');
    }
    if (type === 'form-4') {
      return this._schema
        .find({
          $and: [
            {
              _id: item._id
            },
            {
              permission: { $in: roles }
            },
            {
              flow: item.flow
            }
          ]
        })
        .populate(join, '-password');
    }
    if (type === 'flow') {
      return this._schema.find(item).populate(join, '-password');
    }
    // https://stackoverflow.com/questions/12096262/how-to-protect-the-password-field-in-mongoose-mongodb-so-it-wont-return-in-a-qu
  }

  fieldRead(item, skip, limit, select) {
    return this._schema
      .find(item)
      .skip(skip)
      .limit(limit)
      .select(select);
  }

  delete(id) {
    return this._schema.deleteOne({
      _id: id
    });
  }
}

module.exports = MongoDB;
