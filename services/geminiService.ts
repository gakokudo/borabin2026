import { GoogleGenAI, Type } from "@google/genai";

/**
 * ビンゴのミッション（課題）をAIで生成する
 * 失敗した場合はデフォルトの課題リストを返す
 */
export const generateBingoTasks = async (eventTitle: string, eventContent: string): Promise<string[]> => {
  if (!process.env.API_KEY) {
    return ["笑顔であいさつ", "自己紹介", "写真を撮る", "安全確認", "感謝を伝える", "ゴミ拾い", "水分補給", "感想共有", "活動を楽しむ"];
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `世田谷ボランティアビンゴツアーズの課題を9つ作成してください。\n活動名: ${eventTitle}\n内容: ${eventContent}\n\n条件:\n1. 誰でも実行できる楽しいアクション\n2. 10文字以内の短い日本語\n3. 重複しないこと`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "9つのミッション課題",
            },
          },
          required: ["tasks"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    let tasks = result.tasks || [];
    
    // 9つに満たない、または多すぎる場合の調整
    tasks = tasks.slice(0, 9);
    while (tasks.length < 9) {
      tasks.push("地域に貢献");
    }
    
    return tasks;
  } catch (error) {
    console.error("Gemini Tasks Generation Error:", error);
    return ["笑顔であいさつ", "自己紹介", "交流", "安全確認", "感謝", "清掃", "記録", "共有", "楽しむ"];
  }
};

/**
 * イベントのイメージ画像をAIで生成する
 * Gemini 2.5 Flash Imageモデルを使用
 */
export const generateEventImage = async (title: string, category: string): Promise<string | null> => {
  if (!process.env.API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ 
          text: `A warm, artistic watercolor illustration for a community volunteer event in Setagaya, Tokyo. 
                 Subject: ${title}, Theme: ${category}. 
                 Style: Soft colors, friendly atmosphere, minimalist, Japanese aesthetic. 
                 NO TEXT, NO LETTERS, HIGH QUALITY.` 
        }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    // レスポンスから画像データを探す
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return null;
  }
};
