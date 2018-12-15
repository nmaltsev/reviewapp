export class Message{
    type:string;
    text:string;
    date:Date;

    constructor (public docId:string) {

    }
    init(type: string, text: string, date: Date): Message {
        this.type = type;
        this.text = text;
        this.date = date;
        return this;
    }
}