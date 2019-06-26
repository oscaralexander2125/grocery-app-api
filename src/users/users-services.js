const UsersService = {
  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into('grocery_users')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  
  getById(knex, id) {
    return knex
      .from('grocery_users')
      .select('*')
      .where('id', id)
      .first()
  },

  getEmailCount(knex, email) {
    return knex
      .from('grocery_users')
      .count('*')
      .where('email', email)
  },

  getByEmail(knex, email) {
    return knex
      .from('grocery_users')
      .where('email', email)
      .first()
  }
}

module.exports = UsersService;