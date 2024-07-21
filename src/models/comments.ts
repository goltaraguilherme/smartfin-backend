import { ObjectId } from "mongodb";

export default class Comments {
    constructor(public comment: string, public type: string, public userId: string, public date:string, public id?: ObjectId) {}
}