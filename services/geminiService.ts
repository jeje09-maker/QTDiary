
import { GoogleGenAI, Type } from "@google/genai";
import { QTEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchDailyQT(date: string): Promise<Partial<QTEntry>> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${date} 날짜에 어울리는 개역개정 성경 묵상 본문과 내용을 제안해주세요. 
      성인들이 깊이 있게 묵상할 수 있는 본문이어야 합니다.`,
      config: {
        systemInstruction: "당신은 깊이 있는 신앙 생활을 돕는 큐티 가이드입니다. 반드시 '개역개정' 성경 버전을 사용하며, 장년층 성도가 읽기에 적합한 경건하고 품격 있는 어조를 사용하세요. 본문에 대한 신학적 분석(analysis)과 따뜻한 권면이 담긴 AI 묵상(meditation)을 구분하여 제공하세요. JSON 형식으로 응답하세요.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "오늘의 핵심 메시지 제목" },
            passage: { type: Type.STRING, description: "성경 구절 (예: 시편 23:1-6)" },
            verses: { type: Type.STRING, description: "개역개정 성경 본문 전문" },
            analysis: { type: Type.STRING, description: "본문에 대한 신학적/문맥적 분석" },
            meditation: { type: Type.STRING, description: "사용자를 위한 AI의 따뜻한 묵상과 통찰" }
          },
          required: ["title", "passage", "verses", "analysis", "meditation"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      title: "오늘의 말씀",
      passage: "",
      verses: "네트워크 상태를 확인해주세요.",
      analysis: "",
      meditation: ""
    };
  }
}

export async function fetchBibleVersesWithInsight(passage: string): Promise<Partial<QTEntry>> {
  if (!passage) return { verses: "장절이 입력되지 않았습니다." };
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `'${passage}' 성경 본문을 '개역개정' 판으로 찾아주시고, 이 말씀에 대한 성인용 해설과 묵상 가이드를 작성해주세요.`,
      config: {
        systemInstruction: "당신은 성경 전문가이자 영적 멘토입니다. 입력된 구절의 '개역개정' 본문(verses), 신학적 해설(analysis), 그리고 실천적 묵상 가이드(meditation)를 JSON 형식으로 제공하세요. 어조는 매우 정중하고 깊이 있어야 합니다.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verses: { type: Type.STRING },
            analysis: { type: Type.STRING },
            meditation: { type: Type.STRING }
          },
          required: ["verses", "analysis", "meditation"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return { verses: "본문을 불러오는 중 오류가 발생했습니다.", analysis: "해설을 가져오지 못했습니다.", meditation: "" };
  }
}
