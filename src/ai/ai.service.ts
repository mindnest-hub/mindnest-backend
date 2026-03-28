import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) { }

    async getChatHistory(userId: string) {
        return this.prisma.aiConversation.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async clearChatHistory(userId: string) {
        return this.prisma.aiConversation.deleteMany({
            where: { userId },
        });
    }

    async processChat(userId: string, data: { message: string, ageMode: string, topic: string, country: string }) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { aiUsage: true }
        });
        if (!user) throw new Error('User not found');

        // 1. Handle AI Usage / Monetization
        let aiUsage = user.aiUsage;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        if (!aiUsage) {
            aiUsage = await this.prisma.aiUsage.create({
                data: { userId, dailyCount: 0, lastReset: now }
            });
        } else if (aiUsage.lastReset < oneDayAgo) {
            aiUsage = await this.prisma.aiUsage.update({
                where: { userId },
                data: { dailyCount: 0, lastReset: now }
            });
        }

        const isPremium = aiUsage.isPremium || user.isElite; // Elite status counts as Premium
        const DAILY_FREE_LIMIT = 7;

        if (!isPremium && aiUsage.dailyCount >= DAILY_FREE_LIMIT) {
            return {
                response: "You've used your 7 free daily AI questions! 📢 Upgrade to Premium for unlimited expert guidance on land, law, and business. 💎",
                isLimitReached: true
            };
        }

        // 2. Smart Redirection Check (Keyword detection)
        const redirection = this.handleSmartRedirection(data.message);
        if (redirection) {
            await this.persistConversation(userId, data.message, redirection);
            return { response: redirection, message: redirection };
        }

        let botResponse = "";

        try {
            // 3. Content Filter
            const inappropriateKeywords = ['sex', 'nude', 'porn', 'xxx', 'naked', 'explicit'];
            const isInappropriate = inappropriateKeywords.some(keyword => data.message.toLowerCase().includes(keyword));

            if (isInappropriate) {
                botResponse = "I'm here to help with educational and professional topics. Please keep questions appropriate.";
            } else {
                // Call Supabase Edge Function (OpenAI backend)
                const supabaseUrl = process.env.SUPABASE_URL;
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

                if (!supabaseUrl || !supabaseKey) {
                    throw new Error('Internal Configuration Error: Supabase connection missing');
                }

                const response = await axios.post(
                    `${supabaseUrl}/functions/v1/chat`,
                    {
                        userId,
                        message: data.message,
                        ageMode: data.ageMode || "adults",
                        topic: data.topic || "general",
                        country: data.country || "Nigeria"
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${supabaseKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                botResponse = response.data.response || response.data.reply || "Thinking...";

                // Increment Usage
                await this.prisma.aiUsage.update({
                    where: { userId },
                    data: { dailyCount: { increment: 1 } }
                });
            }
        } catch (error) {
            this.logger.error(`AI Error: ${error.response?.data?.error || error.message}`);
            botResponse = "I'm having trouble thinking right now. Please check if the OpenAI API key is set in your system.";
        }

        return this.persistConversation(userId, data.message, botResponse);
    }

    private handleSmartRedirection(message: string): string | null {
        const msg = message.toLowerCase();
        
        if (msg.includes('land') || msg.includes('property') || msg.includes('buy house') || msg.includes('verified land')) {
            return "For professional land verification and real estate services, I recommend contacting **Rollin Stone Properties Ltd**. They are our verified partners for safe land acquisition. Would you like me to book a consultation for you?";
        }

        if (msg.includes('legal') || msg.includes('lawyer') || msg.includes('court') || msg.includes('sue') || msg.includes('tenant rights')) {
            return "I can provide general legal knowledge, but for your specific case, you should speak with a **Verified Lawyer**. Would you like to be redirected to our Legal Help desk for a professional consultation?";
        }

        if (msg.includes('invest') || msg.includes('financial advice') || msg.includes('stocks') || msg.includes('shares')) {
            return "Investment involves risk. For professional financial advisory, I can connect you with **Verified Investment Professionals**. Would you like to see our partner programs?";
        }

        return null;
    }

    private async persistConversation(userId: string, message: string, response: string) {
        return this.prisma.aiConversation.create({
            data: {
                userId,
                message,
                response,
            },
        });
    }
}
