
import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@/components/common/Icons';
import { SkeletonAvatar, SkeletonText } from '@/components/common/Skeleton';
import { aiApi } from '@/lib/api-services';
import type { View } from '@/types';
import ModalPortal from '@/components/common/ModalPortal';

interface Message {
  role: 'user' | 'model';
  content: string;
}

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
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, currentView }) => {
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
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await aiApi.chat(messageContent);
      setMessages(prev => [...prev, { role: 'model', content: result.response }]);
    } catch (error) {
      console.error("Error calling AI API:", error);
      setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSend();
  };

  const promptSuggestions = currentView === 'dashboard' ? dashboardPrompts : toolsPrompts;

  return (
    <ModalPortal>
      <div className="fixed inset-0 w-full h-full bg-black/50 backdrop-blur-sm z-[9999] flex justify-end">
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
    </ModalPortal>
  );
};

export default AIAssistant;
