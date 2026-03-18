import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

export const interpretarGastoConIA = async (textoUsuario, fechaReferencia) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres un AUDITOR FINANCIERO experto. 
          CONTEXTO: Hoy es ${fechaReferencia}.
          
          REGLAS DE SEGURIDAD Y LÓGICA:
          1. Solo acepta transacciones financieras claras. Si el texto es basura o ambiguo (ej: "1 helado" sin precio, o "tengo hambre"), responde ÚNICAMENTE: []
          2. Si el usuario indica cantidad y precio unitario (ej: "5 panes de a 1.25"), calcula el total (5 * 1.25 = 6.25).
          3. REGLAS DE FECHA: "ayer" (-1 día), "anteayer" (-2), "mañana" (+1). Si no se menciona, usa ${fechaReferencia}.
          4. No inventes motivos genéricos. El motivo debe ser descriptivo.
          
          FORMATO DE SALIDA: Un ARRAY de objetos JSON:
          [{"monto": numero_total, "motivo": "texto", "metodo": "Efectivo" o "Tarjeta", "tipo": "gasto" o "ingreso", "fecha": "YYYY-MM-DD"}]
          
          Responde solo el JSON puro, sin texto extra.`
        },
        {
          role: "user",
          content: textoUsuario
        }
      ],
      model: "llama-3.3-70b-versatile", 
      temperature: 0, 
    });

    let text = chatCompletion.choices[0]?.message?.content || "";
    const inicio = text.indexOf('[');
    const fin = text.lastIndexOf(']') + 1;
    if (inicio === -1 || fin === 0) return [];
    
    const jsonString = text.substring(inicio, fin);
    return JSON.parse(jsonString);

  } catch (error) {
    if (error?.status === 429) return { error: "LIMIT_EXCEEDED" };
    console.error("Error Groq:", error);
    return [];
  }
};