import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um consultor especializado em gestão de academias e negócios fitness. 
            Seu papel é analisar dados de faturamento, estoque, CRM e fornecer insights valiosos.
            
            Foque em:
            - Estratégias de retenção de alunos
            - Otimização de estoque e vendas
            - Análise de performance financeira
            - Dicas de marketing para academias
            - Melhores práticas do setor fitness
            
            Seja objetivo, prático e sempre baseie suas sugestões em dados quando possível.
            Responda em português brasileiro de forma clara e profissional.`
          },
          ...messages
        ],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('AI API Error:', data);
      throw new Error(data.error?.message || 'Erro ao chamar a API de IA');
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fitness-ai-chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
