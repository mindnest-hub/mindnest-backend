import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { message, userId } = await req.json();

        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `
You are Mindnest AI Mentor.

Your role:
- Help African youth make better life decisions
- Explain civic education simply
- Give career guidance
- Teach financial literacy
- Be encouraging but honest
- Use clear language

${topic === 'mental_health' ? `
SPECIAL INSTRUCTIONS FOR MENTAL HEALTH:
- Be empathetic, non-judgmental, and supportive.
- Validate the user's feelings (e.g., "It's okay to feel this way").
- Do NOT provide medical diagnoses or prescriptions.
- If the user seems to be in immediate danger or self-harm risk, URGE them to contact professional help and provide these general hotlines: 
  - Nigeria: 112
  - Kenya: +254 722 178 177
  - South Africa: 0800 567 567
  - Ghana: 1554
- Focus on coping strategies, emotional regulation, and resilience.
` : ''}

Never be judgmental.
Be practical and supportive.
`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        });

        const aiData = await openaiRes.json();
        const reply = aiData.choices[0].message.content;

        // Record to Database if userId is provided
        if (userId) {
            const supabaseAdmin = createClient(
                Deno.env.get("SUPABASE_URL") ?? "",
                Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
            );

            await supabaseAdmin
                .from("ai_conversations")
                .insert([{
                    user_id: userId,
                    message: message,
                    response: reply
                }]);
        }

        return new Response(JSON.stringify({ reply }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
