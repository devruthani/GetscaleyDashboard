
import { sequelize } from './src/db/sequelize.js'
import { Admin } from './src/models/index.js'
import { Role } from './src/models/index.js'

async function check() {
  try {
    await sequelize.authenticate()
    console.log('DB Connected')
    
    // Check tables existence by syncing (safe with sqlite usually, but let's just query)
    // Actually simpler to just try count.
    
    const adminCount = await Admin.count()
    const roleCount = await Role.count()
    
    console.log(`Admin Count: ${adminCount}`)
    console.log(`Role Count: ${roleCount}`)
    
    if (adminCount > 0) {
      const admin = await Admin.findOne({ include: [{ model: Role, as: 'roles' }] })
      console.log('First Admin:', admin.email)
      console.log('First Admin Roles:', admin.roles.map(r => r.name))
    }
    
  } catch (err) {
    console.error('Error checking DB:', err.message)
  } finally {
    await sequelize.close()
  }
}

check()
