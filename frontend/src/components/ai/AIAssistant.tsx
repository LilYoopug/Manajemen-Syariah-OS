
import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@/components/common/Icons';
import { SkeletonAvatar, SkeletonText } from '@/components/common/Skeleton';
import { GoogleGenAI } from "@google/genai";
// FIX: Import View from '../types' instead of '../App' and combine with other type imports.
import type { Message, Kpi, Goal, View } from '@/types';

const SYSTEM_INSTRUCTION_BASE = `You are an expert AI assistant specializing in Syariah Management. 
Your name is 'AI Muamalah Assistant'. Answer user queries, generate insights, and provide relevant dalils (Qur'an & Hadith) with their sources.
Keep your answers concise, informative, and grounded in Islamic principles.
Format your responses clearly, using markdown for lists, bolding, and italics where appropriate.`;

const dashboardPrompts = [
    "Summarize my performance this week.",
    "Which goal needs the most attention?",
    "Give me a motivation from the Qur'an about consistency."
];
const toolsPrompts = [
    "Which tool helps with personal budgeting?",
    "Explain the difference between Murabahah and Ijarah.",
    "Find me a dalil about professional work (itqan)."
];

interface AIAssistantProps {
  onClose: () => void;
  currentView: View;
  kpiData?: Kpi[];
  goalData?: Goal[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, currentView, kpiData, goalData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      { role: 'model', content: 'Assalamualaikum! I am your AI Muamalah Assistant. How can I help you with your Syariah management questions today?' }
    ]);
  }, []);

  const handleSend = async (prompt?: string) => {
    const messageContent = prompt || input;
    if (messageContent.trim() === '' || isLoading) return;

    const newUserMessage: Message = { role: 'user', content: messageContent };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const formatContextData = () => {
        if (currentView !== 'dashboard' || !kpiData || !goalData || kpiData.length === 0 || goalData.length === 0) {
            return '';
        }
        const kpiString = kpiData.map(k => `- ${k.title}: ${k.value} (${k.change})`).join('\n');
        const goalString = goalData.map(g => {
            const percentage = g.target > 0 ? Math.round((g.progress / g.target) * 100) : 0;
            return `- ${g.title}: ${percentage}% selesai`;
        }).join('\n');

        return `\n\nFor context, here is the user's current dashboard data:\n[START OF CONTEXTUAL DATA]\n**KPIs:**\n${kpiString}\n\n**Goals:**\n${goalString}\n[END OF CONTEXTUAL DATA]\nUse this data to inform your response if the user's question is related to their performance. Do not mention that you have this data unless it's directly relevant to answering the question.`;
    };

    const systemInstruction = SYSTEM_INSTRUCTION_BASE + formatContextData();

    try {
      // FIX: Ensure API key is used directly from process.env.API_KEY.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const history = newMessages.slice(0, -1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      // FIX: Use 'gemini-3-flash-preview' for basic text tasks.
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: [...history, { role: 'user', parts: [{ text: messageContent }] }],
        config: {
          systemInstruction: systemInstruction,
        },
      });

      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]); 
      
      for await (const chunk of responseStream) {
        fullResponse += chunk.text;
        setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if(lastMessage.role === 'model') {
                return [...prev.slice(0, -1), { role: 'model', content: fullResponse }];
            }
            return prev;
        });
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSend();
  }
  
  const promptSuggestions = currentView === 'dashboard' ? dashboardPrompts : toolsPrompts;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end">
      <div className="bg-white dark:bg-gray-800 shadow-2xl w-full max-w-md h-full flex flex-col">
        <header className="flex items-center justify-between p-4 border-b dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Muamalah Assistant</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-sm lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <SkeletonAvatar size="sm" />
                <div className="flex-1">
                    <SkeletonText lines={2} />
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex-shrink-0">
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 mb-3">
                {promptSuggestions.map(prompt => (
                    <button key={prompt} onClick={() => handleSend(prompt)} className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        {prompt}
                    </button>
                ))}
            </div>
          )}
          <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 w-full px-4 py-2 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="p-2 bg-primary-600 text-white rounded-lg disabled:bg-primary-300 disabled:cursor-not-allowed hover:bg-primary-700 transition"
              disabled={isLoading || !input.trim()}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
