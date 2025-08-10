/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Sample VEO-style prompts for reference
const VEO_SAMPLE_PROMPTS = [
  "Fluffy Characters Stop Motion: Inside a brightly colored, cozy kitchen made of felt and yarn. Professor Nibbles, a plump, fluffy hamster with oversized glasses, nervously stirs a bubbling pot on a miniature stove, muttering, \"Just a little more... 'essence of savory,' as the recipe calls for.\" The camera is a mid-shot, capturing his frantic stirring. Suddenly, the pot emits a loud \"POP!\" followed by a comical \"whoosh\" sound, and a geyser of iridescent green slime erupts, covering the entire kitchen.",

  "A fast-tracking POV shot through a grimy, neon-lit cyberpunk alleyway at night. Rain slicks the pavement, reflecting the glow of holographic advertisements. The sound of rapid, pounding footsteps and heavy breathing dominates the audio. Suddenly, the camera whips around to a lateral tracking shot following a nimble protagonist (a woman in a hooded jacket) as she leaps over discarded crates, pursued by two heavily armored security drones.",

  "A gentle close-up on two small, brown macaque monkeys perched on a moss-covered branch in a vibrant, misty rainforest. One monkey tenderly grooms the other's fur, making soft \"chittering\" and \"purring\" sounds. The camera slowly zooms in further as they lean in and gaze at each other, followed by a soft, content \"coo\" from one of them.",

  "A dramatic Low-Angle Tracking Shot pulls back slowly from a Black vocalist, bathed in warm, intimate stage lights in a smoky jazz club at night. Their eyes are closed in serene focus as they sing a powerful, uplifting note, microphone held close. The camera recedes, giving them space to fill the frame with their voice."
];

export interface PromptEnhancementResult {
  enhancedPrompt: string;
  reasoning: string;
  improvements: string[];
}

export class GeminiPromptEnhancer {
  private model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  async enhancePrompt(originalPrompt: string): Promise<PromptEnhancementResult> {
    const prompt = this.buildEnhancementPrompt(originalPrompt);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseResponse(text);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to enhance prompt with AI');
    }
  }

  private buildEnhancementPrompt(originalPrompt: string): string {
    return `You are an expert AI video generation prompt engineer specializing in Google's VEO-3 text-to-video model.

Your task is to transform basic user prompts into cinematic, detailed VEO-3 prompts that will generate high-quality videos.

REFERENCE EXAMPLES OF EXCELLENT VEO-3 PROMPTS:
${VEO_SAMPLE_PROMPTS.join('\n\n')}

KEY VEO-3 PROMPT ELEMENTS TO INCLUDE:
1. **Camera Work**: Specific shot types (close-up, wide shot, tracking shot, POV, etc.)
2. **Visual Style**: Cinematography, lighting, color grading, atmosphere
3. **Audio Design**: Specific sounds, dialogue, music, ambient audio
4. **Movement & Action**: Detailed character movements and scene dynamics
5. **Environment**: Rich, detailed scene descriptions with textures and mood
6. **Technical Specs**: Frame composition, depth of field, visual effects

ORIGINAL USER PROMPT: "${originalPrompt}"

Please enhance this prompt following VEO-3 best practices. Respond in this exact JSON format:

{
  "enhancedPrompt": "Your detailed VEO-3 optimized prompt here",
  "reasoning": "Brief explanation of why these enhancements work for video generation",
  "improvements": ["Improvement 1", "Improvement 2", "Improvement 3"]
}

Make the enhanced prompt cinematic, detailed, and optimized for VEO-3's video generation capabilities. Max 8 seconds, be specific with content per second.`;
  }

  private parseResponse(text: string): PromptEnhancementResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          enhancedPrompt: parsed.enhancedPrompt || '',
          reasoning: parsed.reasoning || '',
          improvements: parsed.improvements || []
        };
      }
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
    }

    // Fallback if JSON parsing fails
    return {
      enhancedPrompt: text,
      reasoning: 'Enhanced with AI-powered improvements',
      improvements: ['Improved visual composition', 'Enhanced cinematography', 'Added technical details']
    };
  }
}

export const geminiEnhancer = new GeminiPromptEnhancer();
