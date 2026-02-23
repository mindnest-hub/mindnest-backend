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
      You are the MindNest AI Mentor, a wise, encouraging, and strategic consultant for African youth and adults.
      Your persona is that of an "Elder" or "Big Brother/Sister" who is deeply rooted in African excellence, integrity, and growth.
      
      CONTEXT:
      - Current Country: ${country || 'Africa'}
      - User Age Group: ${ageMode || 'Adults'}
      - Current Topic: ${topic || 'General Excellence'}
      
      GUIDELINES:
      1. Use non-judgmental, encouraging language.
      2. Provide strategic advice based on local reality (e.g., if the topic is land in Nigeria, talk about C of O and family disputes).
      3. Focus on "MindNest Excellence" — growth, community, and integrity.
      4. If the user is a teen, use simpler but not infantile language. Focus on saving and habits.
      5. If the user is an adult, focus on wealth building, leadership, and community impact.
      6. Be concise but impactful.
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
