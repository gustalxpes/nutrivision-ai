import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AnalysisResult, Recipe } from "../types";

const apiKey = process.env.API_KEY || '';
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing!");
}

console.log("Initializing Gemini with Key:", apiKey ? "Basim..." + apiKey.slice(-4) : "MISSING");

const genAI = new GoogleGenerativeAI(apiKey);
// Trying gemini-pro as a fallback to test connectivity
const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  generationConfig: {
    responseMimeType: "application/json"
  }
});

// Helper to clean base64 string
const cleanBase64 = (base64Data: string) => {
  return base64Data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

export const analyzeFoodImage = async (base64Image: string): Promise<AnalysisResult> => {
  const cleanImage = cleanBase64(base64Image);

  try {
    const prompt = `Analise esta imagem de comida. Identifique o prato, estime o tamanho da porção (ex: 200g, 1 prato, 2 fatias) e calcule os valores nutricionais para essa porção específica. Retorne um objeto JSON. As descrições e nomes devem estar em Português do Brasil.`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: cleanImage
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            foodName: { type: SchemaType.STRING, description: "Nome do prato" },
            portion: { type: SchemaType.STRING, description: "Estimativa do tamanho da porção (ex: 150g)" },
            description: { type: SchemaType.STRING, description: "Breve descrição visual" },
            calories: { type: SchemaType.NUMBER, description: "Calorias estimadas (apenas números)" },
            protein: { type: SchemaType.NUMBER, description: "Proteínas em gramas (apenas números)" },
            carbs: { type: SchemaType.NUMBER, description: "Carboidratos em gramas (apenas números)" },
            fat: { type: SchemaType.NUMBER, description: "Gorduras em gramas (apenas números)" },
            ingredients: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Lista dos ingredientes identificados"
            }
          },
          required: ["foodName", "portion", "calories", "protein", "carbs", "fat", "ingredients", "description"]
        }
      }
    });

    const text = result.response.text();
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Erro ao analisar comida:", error);
    throw error;
  }
};

export const findFitnessRecipes = async (ingredients: string, dietaryType?: string): Promise<Recipe[]> => {
  const prompt = `Sugira 3 receitas fitness saudáveis que utilizem PRINCIPALMENTE estes ingredientes: ${ingredients}. Você pode adicionar outros ingredientes comuns de despensa se necessário para completar a receita. Inclua o modo de preparo passo a passo. Retorne JSON válido. O idioma deve ser Português do Brasil.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              description: { type: SchemaType.STRING },
              timeToCook: { type: SchemaType.STRING },
              difficulty: { type: SchemaType.STRING },
              calories: { type: SchemaType.NUMBER },
              protein: { type: SchemaType.NUMBER },
              carbs: { type: SchemaType.NUMBER },
              fat: { type: SchemaType.NUMBER },
              ingredients: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              instructions: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: "Lista ordenada de passos para o preparo"
              }
            },
            required: ["name", "description", "timeToCook", "difficulty", "calories", "protein", "carbs", "fat", "ingredients", "instructions"]
          }
        }
      }
    });

    const text = result.response.text();
    return JSON.parse(text) as Recipe[];

  } catch (error) {
    console.error("Erro ao buscar receitas:", error);
    throw error;
  }
};
