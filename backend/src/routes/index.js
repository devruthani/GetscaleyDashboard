import express from 'express'
import { authRouter } from './auth.js'
import { healthRouter } from './health.js'
import { examplesRouter } from './examples.js'

export const apiRouter = express.Router()
apiRouter.use('/auth', authRouter)
apiRouter.use('/health', healthRouter)
apiRouter.use('/examples', examplesRouter)

