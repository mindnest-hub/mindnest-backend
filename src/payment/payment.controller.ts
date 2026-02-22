import { Controller, Post, Headers, Req, BadRequestException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma.service';

@Controller('payment')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(
        private readonly paymentService: PaymentService,
        private readonly prisma: PrismaService,
    ) { }

    @Post('webhook')
    async handleWebhook(
        @Headers('x-paystack-signature') signature: string,
        @Req() req: Request,
    ) {
        if (!signature) {
            throw new BadRequestException('Missing x-paystack-signature header');
        }

        const isValid = await this.paymentService.verifyWebhook(signature, req.body);
        if (!isValid) {
            throw new BadRequestException('Invalid signature');
        }

        const event = req.body;

        // Handle the event
        if (event.event === 'charge.success') {
            const { customer, amount, reference } = event.data;
            const email = customer.email;
            const actualAmount = amount / 100; // Convert kobo to Naira

            this.logger.log(`Payment successful for ${email}: ₦${actualAmount} (Ref: ${reference})`);

            // Update user wallet balance
            await this.prisma.user.update({
                where: { email },
                data: {
                    walletBalance: { increment: actualAmount }
                }
            });
        } else {
            this.logger.warn(`Unhandled event type: ${event.event}`);
        }

        return { received: true };
    }

    @Post('initialize')
    async initialize(@Req() req: Request) {
        const { email, amount } = req.body;
        return this.paymentService.initializeTransaction(email, amount);
    }
}
