const { execSync } = require('child_process')
const config = require('./config')
const db = require('./database')
const path = require('path')
const bcrypt = require('bcrypt')
const randomString = require('randomstring')
const binfile = path.resolve(__dirname, '../../node_modules/.bin', 'sequelize')

console.log(execSync(binfile + ' --config config/dev.json --env database db:create ' + config.get('database.database')).toString())
console.log(execSync(binfile + ' --config config/dev.json --env database db:migrate --debug').toString())

module.exports = (async () => {
  if ((await db('permission_groups').count('*'))[0]['count(*)'] === 0) {
    await db('permission_groups').insert({
      id: 1,
      name: 'Admin Group',
      rule: JSON.stringify({
        admin: true,
        invitationNum: -1,
        invitationGroup: 2,
        title: 'Admin',
        banned: false
      }),
      createTime: (new Date()).getTime(),
      updateTime: (new Date()).getTime()
    })

    await db('permission_groups').insert({
      id: 2,
      name: 'User Group',
      rule: JSON.stringify({
        admin: false,
        invitationNum: 1,
        invitationGroup: 2,
        title: 'User',
        banned: false
      }),
      createTime: (new Date()).getTime(),
      updateTime: (new Date()).getTime()
    })

    await db('permission_groups').insert({
      id: 3,
      name: 'Banned Group',
      rule: JSON.stringify({
        admin: false,
        invitationNum: 0,
        invitationGroup: 3,
        title: 'Banned',
        banned: true
      }),
      createTime: (new Date()).getTime(),
      updateTime: (new Date()).getTime()
    })
  }

  if ((await db('users').count('*'))[0]['count(*)'] === 0) {
    await db('users').insert({
      id: 1,
      username: 'admin',
      password: bcrypt.hashSync('admin', bcrypt.genSaltSync()),
      token: randomString.generate(32),
      comment: 'Admin',
      createTime: (new Date()).getTime(),
      lastSeen: (new Date()).getTime(),
      from: 'Init',
      permission_group: 1
    })
  }

  return null
})()
