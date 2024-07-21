import { ObjectId } from "mongodb";

export default class User {
    constructor(
        public name: string, 
        public typeUser: string, 
        public email: string, 
        public telephone: string,
        public corretora: string,
        public plan: string,
        public password: string, 
        public dateFinal:string, 
        public passwordResetToken:string, 
        public passwordExpiresToken: string, 
        public id?: ObjectId) {}
}