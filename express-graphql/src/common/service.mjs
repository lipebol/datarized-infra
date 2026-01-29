import * as models from './models.mjs'

export class Service {

    static async sql(handler) {
        try {

            const data = handler.info ?
                await models[handler.about.type].count(handler.sql) : 
                await models[handler.about.type].findAll(handler.sql)
 
            return !data ?
                { error: { name: 'NotFound', status_code: 404 } } :
                !handler.info ? data : {
                    count: data, countpages: Math.ceil(
                        parseFloat(data) / handler.limit
                    ), columns: Object.keys(
                        models[handler.about.type].rawAttributes
                    )
                }
        } catch (err) { console.log(err) }
    }


    static async nosql(handler) {
        try {
            const data = await models[handler.about.type]
                .find(handler.where).sort({ [handler.filter]: 'asc' })
                .select(handler.fields).skip(handler.offset)
                .limit(handler.info ? 500000 : handler.limit)
                .populate(handler.lookup).exec()

            return data.length === 0 ?
                { error: { name: 'NotFound', status_code: 404 } } :
                !handler.info ? data : {
                    count: data.length, countpages: Math.ceil(
                        parseFloat(data.length) / handler.limit
                    )
                }
        } catch (err) { console.log(err) }
    }
}