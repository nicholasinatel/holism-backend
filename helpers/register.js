// Gerador de Hash
const PasswordHelper = require('./passwordHelper')

class Reg {
    constructor(username, password, roles) {
        this.username = username
        this.password = password
        this.roles = roles
    }
    async register(){
        this.password = await PasswordHelper.hashPassword(this.password)
        this.username = this.username.toLowerCase()
        
        for(let i = 0; i <= this.roles.length -1; i++) {
            this.roles[i] = this.roles[i].toLowerCase()
        }
    
        const USER = {
            username: this.username,
            password: this.password,
            role: this.roles
        }    
        
        return USER
    }
}

module.exports = Reg