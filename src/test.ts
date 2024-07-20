import knex from './db';

knex.select('*').from('test_table').then(users => {
  console.log(users);
}).catch(error => {
  console.error(error);
});

console.log("hi")