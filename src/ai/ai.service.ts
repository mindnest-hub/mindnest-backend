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
        // In a real implementation, we would call OpenAI directly or proxy to the Supabase Edge function.
        // For this implementation, we will mock the AI response logic but ensure persistence.
        // However, I will implement a fetch call to satisfy the 'AI Mentor' requirement if possible.

        let botResponse = "";

        try {
            // CONTENT FILTER (Re-implementing frontend safety)
            const inappropriateKeywords = ['sex', 'nude', 'porn', 'xxx', 'naked', 'explicit'];
            const isInappropriate = inappropriateKeywords.some(keyword => data.message.toLowerCase().includes(keyword));

            if (isInappropriate) {
                botResponse = "I'm here to help with educational topics. Please keep questions appropriate.";
            } else {
                // Call Supabase Edge Function
                const supabaseUrl = this.configService.get('SUPABASE_URL');
                const supabaseAnonKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY');

                const response = await axios.post(
                    `${supabaseUrl}/functions/v1/chat`,
                    {
                        message: data.message,
                        userId: userId,
                        ageMode: data.ageMode,
                        topic: data.topic,
                        country: data.country
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${supabaseAnonKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                botResponse = response.data.reply;
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
