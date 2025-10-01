/**
 * AI Service - Service d'intelligence artificielle
 * Gestion des appels vers les modèles AI (OpenAI, Claude, Ollama)
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090/api/v1';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    model?: string;
    tokens?: number;
    reasoning?: string;
  };
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: number;
  updatedAt: number;
  model: string;
  context: string; // 'docker', 'kubernetes', 'general', etc.
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'ollama' | 'custom';
  contextLength: number;
  supportsStreaming: boolean;
  costPerToken?: number;
}

export interface AIRequest {
  model: string;
  messages: Omit<AIMessage, 'id' | 'timestamp' | 'metadata'>[];
  context?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  message: AIMessage;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

class AIService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // AI requests can take longer
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Liste les modèles AI disponibles
   */
  async listModels(): Promise<AIModel[]> {
    const response = await this.api.get('/ai/models');
    return response.data.models || [];
  }

  /**
   * Envoie une requête AI
   */
  async sendMessage(request: AIRequest): Promise<AIResponse> {
    const response = await this.api.post('/ai/chat', request);
    return response.data;
  }

  /**
   * Stream une réponse AI
   */
  async *streamMessage(request: AIRequest): AsyncGenerator<AIMessage> {
    const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.body) {
      throw new Error('Streaming not supported');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.message) {
                yield parsed.message;
              }
            } catch (e) {
              // Ignore parsing errors for now
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Crée une nouvelle conversation
   */
  async createConversation(title: string, context: string = 'general', model: string = 'gpt-4'): Promise<AIConversation> {
    const response = await this.api.post('/ai/conversations', {
      title,
      context,
      model,
    });
    return response.data.conversation;
  }

  /**
   * Liste les conversations
   */
  async listConversations(limit: number = 50): Promise<AIConversation[]> {
    const response = await this.api.get('/ai/conversations', { params: { limit } });
    return response.data.conversations || [];
  }

  /**
   * Obtient une conversation par ID
   */
  async getConversation(id: string): Promise<AIConversation> {
    const response = await this.api.get(`/ai/conversations/${id}`);
    return response.data.conversation;
  }

  /**
   * Met à jour une conversation
   */
  async updateConversation(id: string, updates: Partial<AIConversation>): Promise<AIConversation> {
    const response = await this.api.put(`/ai/conversations/${id}`, updates);
    return response.data.conversation;
  }

  /**
   * Supprime une conversation
   */
  async deleteConversation(id: string): Promise<void> {
    await this.api.delete(`/ai/conversations/${id}`);
  }

  /**
   * Analyse le contexte actuel pour suggérer des prompts
   */
  async analyzeContext(context: 'docker' | 'kubernetes' | 'ansible' | 'git' | 'general'): Promise<{
    suggestions: string[];
    commands: string[];
    documentation: string[];
  }> {
    const response = await this.api.post('/ai/analyze-context', { context });
    return response.data.analysis;
  }

  /**
   * Génère du code basé sur le contexte
   */
  async generateCode(
    type: 'dockerfile' | 'kubernetes' | 'ansible' | 'script',
    description: string,
    context?: any
  ): Promise<string> {
    const response = await this.api.post('/ai/generate-code', {
      type,
      description,
      context,
    });
    return response.data.code;
  }

  /**
   * Explique du code ou une configuration
   */
  async explainCode(code: string, language?: string): Promise<string> {
    const response = await this.api.post('/ai/explain', {
      code,
      language,
    });
    return response.data.explanation;
  }

  /**
   * Debug une erreur ou un problème
   */
  async debugError(error: string, context?: any): Promise<{
    diagnosis: string;
    solutions: string[];
    prevention: string[];
  }> {
    const response = await this.api.post('/ai/debug', {
      error,
      context,
    });
    return response.data.result;
  }

  /**
   * Optimise une configuration ou du code
   */
  async optimize(config: string, type: 'docker' | 'kubernetes' | 'ansible' | 'code'): Promise<string> {
    const response = await this.api.post('/ai/optimize', {
      config,
      type,
    });
    return response.data.optimized;
  }
}

export const aiService = new AIService();
export default aiService;
