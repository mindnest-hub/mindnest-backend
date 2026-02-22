import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedirectService {
    private readonly allowlist = [
        'https://mindnest.bond',
        'https://www.mindnest.bond',
        'http://localhost:5173', // For development
    ];

    constructor(private readonly configService: ConfigService) {
        const prodUrl = this.configService.get<string>('PRODUCTION_URL');
        if (prodUrl) {
            this.allowlist.push(prodUrl);
        }
    }

    validateUrl(url: string): string {
        if (!url) return 'https://mindnest.bond';

        try {
            const parsedUrl = new URL(url);
            const isAllowed = this.allowlist.some(allowed => {
                const allowedUrl = new URL(allowed);
                return parsedUrl.origin === allowedUrl.origin;
            });

            if (isAllowed) {
                return url;
            }

            throw new BadRequestException('Redirect URL not allowed');
        } catch (e) {
            if (e instanceof BadRequestException) throw e;
            throw new BadRequestException('Invalid redirect URL');
        }
    }
}
