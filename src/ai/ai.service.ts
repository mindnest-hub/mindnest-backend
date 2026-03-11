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
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        // MONETIZATION: Check Elite status or Message Quota
        if (!user.isElite && user.aiMessagesLeft <= 0) {
            return {
                response: "You've reached your free AI message limit! 📢 Upgrade to Elite at mindnest.bond/finance to get unlimited wisdom from the Oracle. 💎",
                isLimitReached: true
            };
        }

        let botResponse = "";

        try {
            // CONTENT FILTER (Re-implementing frontend safety)
            const inappropriateKeywords = ['sex', 'nude', 'porn', 'xxx', 'naked', 'explicit'];
            const isInappropriate = inappropriateKeywords.some(keyword => data.message.toLowerCase().includes(keyword));

            if (isInappropriate) {
                botResponse = "I'm here to help with educational topics. Please keep questions appropriate.";
            } else {
                // Call Supabase Edge Function
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

                // MONETIZATION: Update quota for non-Elite users
                if (!user.isElite) {
                    await this.prisma.user.update({
                        where: { id: userId },
                        data: { aiMessagesLeft: { decrement: 1 } }
                    });
                }
            }
        } catch (error) {
            this.logger.error(`AI Error: ${error.response?.data?.error || error.message}`);
            botResponse = "I'm having trouble thinking right now. Please check if the OpenAI API key is set in Supabase Secrets.";
        }

        // PERSISTENCE
        const conversation = await this.prisma.aiConversation.create({
            data: {
                userId,
                message: data.message,
                response: botResponse,
            },
        });

        return conversation;
    }
}
