import { Op } from 'sequelize'
import { ParamsHandler } from "./params.mjs"
import { Externals } from './externals.mjs'

export class SetHandler {

    constructor(request, response) {
        try {
            this.handler = {
                ...ParamsHandler.check(request),
                response: response,
            }
        } catch (err) { console.log(err) }
    }

    external() {
        if (!this.handler.authExternal || this.handler.authExternal === '') {
            this.handler.data = { error: { name: 'Unauthorized', status_code: 401 } }
        }
        return this
    }

    lookup(...args) {
        try {
            if (this.handler.lookup) {
                if (args && !this.handler.data?.error) {

                    const createpath = (value) => {
                        return { select: this.handler.arrow ? '-_id ' : '', path: value }
                    }

                    const [parent, childs] = args

                    if (Array.isArray(childs)) {
                        this.childs = new Array()
                        for (const child of childs) {
                            if (child.includes('.')) {
                                const [child_parent, childin] = child.split('.')
                                this.childs.push(
                                    { ...createpath(child_parent), populate: createpath(childin) }
                                )
                            } else {
                                this.childs.push(createpath(child))
                            }
                        }
                    }

                    this.handler.lookup = parent ?
                        { ...createpath(parent), populate: this.childs } : this.childs
                }
            }
            return this
        } catch (err) { console.log(err) }
    }

    fields() {
        try {
            if (this.handler.fields?.selections && !this.handler.data?.error) {
                const FieldsByTypeName = (content) => { return content?.fieldsByTypeName }
                const TypeName = (content) => {
                    let TypeName = Object.keys(content)
                    if (TypeName.length > 1) {
                        TypeName = TypeName.filter(type => type.includes('Fields'))
                    }
                    return TypeName.toString()
                }

                this.parent = FieldsByTypeName(this.handler.fields.selections)
                this.parentfields = this.parent[TypeName(this.parent)]
                this.handler.fields = Object.keys(this.parentfields)

                if (this.handler.arrow) { this.handler.fields.push('-_id') }

                if (this.handler.lookup) {

                    const Fields = (content) => { return Object.keys(content).join(' ') }
                    const Path = (content) => { return content?.path }
                    const Childs = (parentfields, childs) => {
                        const transformchilds = new Array()
                        for (const child of childs) {
                            let childfields = parentfields[Path(child)]
                            if (childfields) {
                                childfields = FieldsByTypeName(childfields)
                                child.select += Fields(childfields[TypeName(childfields)])
                                transformchilds.push(child)
                            }
                        }
                        return transformchilds
                    }

                    if (!Array.isArray(this.handler.lookup)) {
                        this.parent = FieldsByTypeName(this.parentfields[Path(this.handler.lookup)])
                        this.parentfields = this.parent[TypeName(this.parent)]
                        this.handler.lookup.select += Fields(this.parentfields)
                        this.handler.lookup.populate = Childs(
                            this.parentfields, this.handler.lookup?.populate
                        )
                    } else {
                        this.handler.lookup = Childs(this.parentfields, this.handler.lookup)
                    }
                }
            }
            return this
        } catch (err) { console.log(err) }
    }

    page() {
        try {
            if (this.handler.page && !this.handler.data?.error) {
                this.handler.page = parseInt(this.handler.page) <= 0 ? 1 :
                    parseInt(this.handler.page)
                this.handler.offset = (this.handler.page - 1) * this.handler.limit
            }
            return this
        } catch (err) { console.log(err) }
    }

    sql() {
        try {
            if (!this.handler.data?.error) {
                this.handler.db = 'sql'
                this.handler.sql = {
                    limit: this.handler.limit, offset: this.handler.offset
                }
                if (this.handler.filter && this.handler.params) {
                    this.handler.sql.order = [[this.handler.filter, 'ASC']]
                    this.handler.sql.where = (() => {
                        if (this.handler.paramsType === 'dates') {
                            const [start, end] = this.handler.params
                            return {
                                [this.handler.filter]: {
                                    [Op.between]: [new Date(start), new Date(end)]
                                }
                            }
                        }
                        return { [this.handler.filter]: { [Op.in]: this.handler.params } }
                    })()
                }
                if (!this.handler.info && this.handler.fields) {
                    this.handler.sql.attributes = this.handler.fields
                }
            }
            return this
        } catch (err) { console.log(err) }
    }

    nosql() {
        try {
            if (!this.handler.data?.error) {
                this.handler.db = 'nosql'
                if (this.handler.filter && this.handler.params) {
                    this.handler.where = (() => {
                        return this.handler.paramsType === 'multi' ?
                            { [this.handler.filter]: { '$in': this.handler.params } } :
                            {
                                [this.handler.filter]:
                                {
                                    '$gte': new Date(this.handler.params.start),
                                    '$lte': new Date(this.handler.params.end)
                                }
                            }
                    })()
                }
            }
        } catch (err) { console.log(err) }
    }

    async build() {
        try {
            if (this.handler.authExternal && !this.handler.data?.error) {
                this.handler.data = await Externals.initialize(this.handler)
            }
            return this.handler
        } catch (err) { console.log(err) }
    }
}