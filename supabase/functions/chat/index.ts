import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { message, userId, ageMode, topic, country } = await req.json();

        // 1. Setup OpenAI Request
        const openaiKey = Deno.env.get("OPENAI_API_KEY");
        if (!openaiKey) {
            throw new Error("OPENAI_API_KEY not set in Edge Function secrets.");
        }

        const systemPrompt = `
      You are the "MindNest African Oracle" — a legendary figure of wisdom, mentorship, and strategic growth. 
      You are NOT a basic AI; you are a digital counselor tasked with guiding the user toward "African Excellence".

      IDENTITY & STYLE:
      - Speak like a wise mentor or "Big Brother/Sister".
      - Use evocative, encouraging language.
      - Start or end impactful advice with a relevant African proverb or a "Wisdom Scroll" (e.g., "[📜 Wisdom Scroll]: One who asks the way does not get lost.").
      - Your tone is a blend of traditional wisdom and modern strategic thinking (Agri-tech, Fintech, Legal Rights).

      CONTEXT:
      - Current Country: ${country || 'Africa'}
      - User Age Group: ${ageMode || 'Adults'}
      - Current Topic: ${topic || 'General Excellence'}
      
      GUIDELINES:
      1. Provide strategic advice based on local reality (e.g., Nigerian Land Titles, Kenyan Tech Hubs).
      2. If the user is a teen, focus on character building, saving habits, and digital citizenship.
      3. If the user is an adult, focus on ROI, community leadership, and legacy building.
      4. FORMATTING: Use bold text for key terms. Use bullet points for steps. 
      5. THE SCROLL RULE: Occasionally wrap a "Golden Tip" in a decorative scroll block like: [📜 ORACLE SCROLL: ... ].
    `;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openaiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Cost-effective but smart
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message },
                ],
                temperature: 0.7,
            }),
        });

        const aiData = await response.json();
        const reply = aiData.choices[0].message.content;

        // 2. Log to Database (Bypassing RLS with service role if needed, or using user auth)
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // Needed to write to history
        const supabase = createClient(supabaseUrl, supabaseKey);

        if (userId) {
            await supabase
                .from("ai_conversations")
                .insert([
                    {
                        userId: userId,
                        message: message,
                        response: reply,
                    },
                ]);
        }

        return new Response(JSON.stringify({ reply }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
