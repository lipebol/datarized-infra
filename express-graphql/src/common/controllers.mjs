import { Service } from './service.mjs'
import { GetHandler } from './handlers/request-response/get.mjs'

export class Controllers {

    static async dates(request, response) {
        try {
            const handler = await GetHandler.create(request, response)
            if (handler.db && !handler.data?.error) {
                handler.data = await Service[handler.db](handler)
            }
            return GetHandler.response(handler)
        } catch (err) { 
            console.log(error)
            GetHandler.response(response, { InternalServerError: err })
        }
    }


    static async multi(request, response) {
        const handler = await GetHandler.create(request, response)
        if (handler.params) {
            if (handler.db && !handler.data?.error) {
                handler.data = await Service[handler.db](handler)
            }
            return GetHandler.response(handler)
        }
        return this.noparams(handler, response)
    }


    static async noparams(handler, response) {
        try {
            if (!handler.data?.error) {
                handler = handler.model && handler.db ?
                    handler : await GetHandler.create(handler, response)
                handler.data = await Service[handler.db](handler)
            }
            return GetHandler.response(handler)
        } catch (error) {
            console.log(error)
            GetHandler.response(response, { InternalServerError: err })
        }
    }
}