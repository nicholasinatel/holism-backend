
// docker ps
// docker exec -it 95da23cd5bbd /
//     mongo -u admin -p 123456 --authenticationDatabase herois

// DATABASES
// show dbs - todos os dbs que se pode usar
// use herois - Mudando contexto da DB
// show collections - Collections = Tables in SQL



// // CREATE
// db.herois.insert({
//     nome: 'Flash',
//     poder: 'Velocidade',
//     dataNascimento: '1998-01-01'
// })

// for(let i=0; i<=1000; i++) {
//     db.herois.insert({
//         nome: `Clone${i}`,
//         poder: 'Velocidade',
//         datanascimento: '1998-01-01'
//     })
// }

// // READ
// db.herois.find()
// db.herois.find().pretty()

// db.herois.count()
// db.herois.findOne()

// db.herois.find().limit(1000).sort({nome: -1})
// db.herois.find({},{poder: 1, _id: 0})

// // UPDATE
// // Assim perde os outros atributos
// db.herois.update({_id: ObjectId("5c3cdb348f75ebed84c7f588")},{nome: 'Mulher Maravilha'})
// // Assim mantem oq nao foi atualizado
// db.herois.update({_id: ObjectId("5c3cdb348f75ebed84c7f58e")},{$set:{nome: 'Lanterna Verde'}})

// db.herois.update({poder:'Velocidade'},{$set:{poder:'super strength'}})

// // DELETE
// db.herois.remove({}) //remove tudo
// db.herois.remove({nome:'Mulher Maravilha'})

