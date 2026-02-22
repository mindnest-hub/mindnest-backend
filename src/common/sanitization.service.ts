import { Injectable } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import * as createDOMPurify from 'dompurify';

@Injectable()
export class SanitizationService {
    private readonly window: any;
    private readonly dompurify: any;

    constructor() {
        this.window = new JSDOM('').window;
        this.dompurify = createDOMPurify(this.window);
    }

    /**
     * Cleans a string from HTML and other potentially dangerous content
     */
    sanitize(input: string): string {
        if (!input || typeof input !== 'string') return input;
        return this.dompurify.sanitize(input, {
            ALLOWED_TAGS: [], // No tags allowed for basic text fields like username/email
            ALLOWED_ATTR: [],
        });
    }

    /**
     * Recursively sanitizes an object
     */
    sanitizeObject(obj: any): any {
        if (!obj || typeof obj !== 'object') return obj;

        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = this.sanitize(obj[key]);
            } else if (typeof obj[key] === 'object') {
                this.sanitizeObject(obj[key]);
            }
        }
        return obj;
    }
}
