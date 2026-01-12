
import { sequelize } from './src/db/sequelize.js'
import { Admin, Role } from './src/models/index.js'
import bcrypt from 'bcryptjs'

async function seed() {
  try {
    console.log('Syncing database...')
    await sequelize.sync({ alter: true })
    console.log('Database synced.')

    console.log('Checking roles...')
    const [superRole] = await Role.findOrCreate({ where: { name: 'superadmin' }, defaults: { permissions: ['*'] } })
    const [adminRole] = await Role.findOrCreate({ where: { name: 'admin' }, defaults: { permissions: ['admin:read', 'admin:create', 'admin:update'] } })
    console.log('Roles ensured.')

    const count = await Admin.count()
    if (count === 0) {
      console.log('Seeding super admin...')
      const passwordHash = await bcrypt.hash('admin123', 10)
      const admin = await Admin.create({ 
        email: 'admin@example.com', 
        name: 'Super Admin', 
        passwordHash 
      })
      await admin.setRoles([superRole])
      console.log('Seeded default admin: admin@example.com / admin123')
    } else {
      console.log(`Admins already exist (count: ${count}). Checking superadmin role...`)
      // Ensure existing admin has role if missing (optional cleanup)
      const admin = await Admin.findOne({ order: [['id', 'ASC']] })
      if (admin) {
        const roles = await admin.getRoles()
        if (roles.length === 0) {
            console.log('Assigning superadmin role to first admin...')
            await admin.setRoles([superRole])
        }
      }
    }

    // Verify
    const admin = await Admin.findOne({ 
        where: { email: 'admin@example.com' },
        include: [{ model: Role, as: 'roles' }]
    })
    
    if (admin) {
        console.log('--- Verification ---')
        console.log(`Admin: ${admin.email} (${admin.uuid})`)
        console.log(`Roles: ${admin.roles.map(r => r.name).join(', ')}`)
    }

  } catch (err) {
    console.error('Seeding error:', err)
  } finally {
    await sequelize.close()
  }
}

seed()
