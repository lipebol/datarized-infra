import { cryptHandler } from './handlers/crypt.mjs'
import { mongoose } from 'mongoose'
// import { Sequelize } from 'sequelize'

const [postgresql, mongodb] = ['postgresql-uri.jwe','mongodb-uri.jwe']
// ========================================= mongoose =========================================
mongoose.set(
    'debug', (collection, method, query, agreggate, options) => {
        console.log(
            JSON.stringify(
                { collection, method, query, agreggate, options }, null, 2
            )
        )
    }
)

export const mongooseAddons = { 
    collation: { locale: 'en', strength: 2 }, versionKey: false, 
    toJSON: { virtuals: true }, toObject: { virtuals: true }
}

export const mongooseSpotifEx = mongoose.createConnection(cryptHandler(mongodb)).useDb('spotifEx')


// ========================================= Sequelize =========================================

// export const sequelizeConnect = new Sequelize(
//     postgresql,
//     {
//         dialect: 'postgres',
//         //port: parseInt(process.env.POSTGRES_PORT)
//     }
// )