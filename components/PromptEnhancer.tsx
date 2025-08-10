/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { geminiEnhancer, PromptEnhancementResult } from '../source/geminiPromptEnhancer';

interface PromptEnhancerProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate?: () => void;
  isLoading: boolean;
  showGenerateButton?: boolean;
}

export const PromptEnhancer: React.FC<PromptEnhancerProps> = ({
  value,
  onChange,
  onGenerate,
  isLoading,
  showGenerateButton = true
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showEnhancedPrompt, setShowEnhancedPrompt] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<PromptEnhancementResult | null>(null);

  const enhancePrompt = async () => {
    setIsEnhancing(true);
    try {
      const result = await geminiEnhancer.enhancePrompt(value);
      setEnhancementResult(result);
      setShowEnhancedPrompt(true);
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      // Fallback to simple enhancement if Gemini fails
      const fallback: PromptEnhancementResult = {
        enhancedPrompt: `${value}. Shot with cinematic camera work, professional lighting, and detailed atmospheric elements for maximum visual impact.`,
        reasoning: 'Enhanced with basic cinematographic improvements (Gemini API unavailable)',
        improvements: ['Added camera work details', 'Enhanced lighting description', 'Improved atmospheric elements']
      };
      setEnhancementResult(fallback);
      setShowEnhancedPrompt(true);
    } finally {
      setIsEnhancing(false);
    }
  };

  const acceptEnhancement = () => {
    if (enhancementResult) {
      onChange(enhancementResult.enhancedPrompt);
      setShowEnhancedPrompt(false);
    }
  };

  const rejectEnhancement = () => {
    setShowEnhancedPrompt(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          rows={4}
          placeholder="Enter video description..."
          className="w-full border border-white/20 bg-black p-6 pr-32 text-white placeholder-white/40 focus:outline-none focus:border-white transition-all duration-300 resize-none font-mono"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          onClick={enhancePrompt}
          disabled={isEnhancing || !value.trim() || isLoading}
          className="absolute right-2 top-2 px-4 py-2 bg-white text-black text-sm hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium uppercase tracking-wide"
        >
          {isEnhancing ? "AI Working..." : "Enhance"}
        </button>
      </div>

      {showEnhancedPrompt && enhancementResult && (
        <div className="border border-white/50 bg-white/10 p-6 space-y-4">
          <h3 className="text-lg font-medium text-white uppercase tracking-wide">
            AI-Enhanced VEO Prompt
          </h3>

          <div className="bg-black/50 p-4 border border-white/10 text-white/90 font-mono text-sm max-h-40 overflow-y-auto">
            {enhancementResult.enhancedPrompt}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/70 uppercase tracking-wide">Why This Works:</h4>
            <p className="text-white/60 text-sm">{enhancementResult.reasoning}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/70 uppercase tracking-wide">Improvements Made:</h4>
            <ul className="space-y-1">
              {enhancementResult.improvements.map((improvement, index) => (
                <li key={index} className="text-white/60 text-sm flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={acceptEnhancement}
              className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 transition-all duration-300 font-medium uppercase tracking-wide text-sm"
            >
              Use Enhanced Prompt
            </button>
            <button
              onClick={rejectEnhancement}
              className="px-6 py-2 bg-transparent border border-white/40 text-white hover:bg-white/10 transition-all duration-300 font-medium uppercase tracking-wide text-sm"
            >
              Keep Original
            </button>
          </div>
        </div>
      )}

      {showGenerateButton && onGenerate && (
        <div className="flex justify-end">
          <button
            onClick={onGenerate}
            disabled={isLoading || !value.trim()}
            className="px-8 py-4 bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium uppercase tracking-wide"
          >
            {isLoading ? "Generating..." : "Generate Video"}
          </button>
        </div>
      )}
    </div>
  );
};