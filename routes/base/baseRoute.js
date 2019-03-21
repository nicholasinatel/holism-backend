class BaseRoute {
    static methods() {
        return Object.getOwnPropertyNames(this.prototype) // thi.prototype quais os metodos da class
            .filter(method => method !== 'constructor' && !method.startsWith('_')) //metodos diferentes do constructor e privados com _
    }
}

module.exports = BaseRoute

