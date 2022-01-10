import { SafeHtml } from "@angular/platform-browser";

export class Contact {

    constructor(
        public username: string,
        public imageUrl: SafeHtml,
        public firstName: string,
        public lastName: string,
        public email: string
    ) { }
}