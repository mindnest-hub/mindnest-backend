import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';

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
                // PROXY TO OPENAI or EDGE FUNCTION
                // For now, let's assume we proxy or provide a robust educational response
                // If the user has an OpenAI key in env, we could use it here.

                // Simulation of AI response logic based on topic
                if (data.topic === 'rights') {
                    botResponse = `In ${data.country}, your legal rights are protected by the constitution. For ${data.ageMode}, it's important to know that... [Detailed logic would be here]`;
                } else {
                    botResponse = `As your MindNest Mentor for ${data.country}, I can tell you that ${data.topic} is crucial for ${data.ageMode}. How can I specifically help you today?`;
                }
            }
        } catch (error) {
            this.logger.error(`AI Error: ${error.message}`);
            botResponse = "I'm having trouble thinking right now. Please try again later.";
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
