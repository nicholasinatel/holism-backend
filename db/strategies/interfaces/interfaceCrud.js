/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
class NotImplementedException extends Error {
  constructor() {
    super('Not Implemented Exception');
  }
}

class ICrud {
  create(item) {
    throw new NotImplementedException();
  }

  read(query, skip, limit) {
    throw new NotImplementedException();
  }

  joinRead(item, join, username, type) {
    throw new NotImplementedException();
  }

  fieldRead(item, skip, limit, select) {
    throw new NotImplementedException();
  }

  readPermission(query, skip, limit, username, type) {
    throw new NotImplementedException();
  }

  writePermission(item, skip, limit, username, type) {
    throw new NotImplementedException();
  }

  update(id, item) {
    throw new NotImplementedException();
  }

  delete(id) {
    throw new NotImplementedException();
  }

  isConnected() {
    throw new NotImplementedException();
  }

  connect() {
    throw new NotImplementedException();
  }
}

module.exports = ICrud;
