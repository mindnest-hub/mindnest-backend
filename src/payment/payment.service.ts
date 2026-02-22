import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);
    private readonly paystackUrl = 'https://api.paystack.co';

    constructor(private configService: ConfigService) { }

    private getHeaders() {
        return {
            Authorization: `Bearer ${this.configService.get<string>('PAYSTACK_SECRET_KEY')}`,
            'Content-Type': 'application/json',
        };
    }

    async initializeTransaction(email: string, amount: number) {
        try {
            const response = await axios.post(
                `${this.paystackUrl}/transaction/initialize`,
                {
                    email,
                    amount: amount * 100, // Paystack expects amount in kobo
                    callback_url: `${this.configService.get<string>('FRONTEND_URL')}/payment-success`,
                },
                { headers: this.getHeaders() }
            );
            return response.data.data;
        } catch (error) {
            this.logger.error(`Paystack initialization failed: ${error.message}`);
            throw new BadRequestException('Could not initialize payment');
        }
    }

    async verifyPayment(reference: string) {
        try {
            const response = await axios.get(
                `${this.paystackUrl}/transaction/verify/${reference}`,
                { headers: this.getHeaders() }
            );
            return response.data.data;
        } catch (error) {
            this.logger.error(`Paystack verification failed: ${error.message}`);
            throw new BadRequestException('Could not verify payment');
        }
    }

    async verifyWebhook(signature: string, payload: any): Promise<boolean> {
        const crypto = require('crypto');
        const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');
        const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(payload)).digest('hex');
        return hash === signature;
    }
}
