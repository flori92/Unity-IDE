/**
 * Hook useAI - Gestion de l'IA et des conversations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { aiService, AIConversation, AIMessage, AIModel } from '../services/ai.service';

export const useAI = () => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<AIConversation | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamingMessageRef = useRef<AIMessage | null>(null);

  // Charger les modèles disponibles
  const loadModels = useCallback(async () => {
    try {
      const data = await aiService.listModels();
      setModels(data);
    } catch (err: any) {
      console.error('Failed to load AI models:', err);
    }
  }, []);

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    try {
      const data = await aiService.listConversations();
      setConversations(data);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
    }
  }, []);

  // Créer une nouvelle conversation
  const createConversation = useCallback(async (
    title: string,
    context: string = 'general',
    model: string = 'gpt-4'
  ) => {
    setLoading(true);
    setError(null);
    try {
      const conversation = await aiService.createConversation(title, context, model);
      setConversations(prev => [conversation, ...prev]);
      setCurrentConversation(conversation);
      return conversation;
    } catch (err: any) {
      setError(err.message || 'Failed to create conversation');
      console.error('Failed to create conversation:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sélectionner une conversation
  const selectConversation = useCallback(async (id: string) => {
    try {
      const conversation = await aiService.getConversation(id);
      setCurrentConversation(conversation);
    } catch (err: any) {
      console.error('Failed to load conversation:', err);
    }
  }, []);

  // Envoyer un message
  const sendMessage = useCallback(async (content: string, stream: boolean = true) => {
    if (!currentConversation) return null;

    setLoading(true);
    setError(null);

    const userMessage: AIMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Ajouter le message utilisateur immédiatement
    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
      updatedAt: Date.now(),
    };

    setCurrentConversation(updatedConversation);
    setConversations(prev =>
      prev.map(conv =>
        conv.id === currentConversation.id ? updatedConversation : conv
      )
    );

    try {
      if (stream) {
        setStreaming(true);
        streamingMessageRef.current = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        };

        // Ajouter le message assistant vide pour le streaming
        const conversationWithEmptyAssistant = {
          ...updatedConversation,
          messages: [...updatedConversation.messages, streamingMessageRef.current],
        };
        setCurrentConversation(conversationWithEmptyAssistant);

        // Stream la réponse
        let fullContent = '';
        for await (const chunk of aiService.streamMessage({
          model: currentConversation.model,
          messages: [...currentConversation.messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          context: currentConversation.context,
        })) {
          fullContent += chunk.content;
          if (streamingMessageRef.current) {
            streamingMessageRef.current.content = fullContent;
            streamingMessageRef.current.metadata = chunk.metadata;

            setCurrentConversation(prev => prev ? {
              ...prev,
              messages: prev.messages.map(msg =>
                msg.id === streamingMessageRef.current!.id
                  ? { ...streamingMessageRef.current! }
                  : msg
              ),
            } : null);
          }
        }

        setStreaming(false);

        // Mettre à jour la conversation finale
        const finalConversation = {
          ...conversationWithEmptyAssistant,
          messages: conversationWithEmptyAssistant.messages.map(msg =>
            msg.id === streamingMessageRef.current!.id
              ? { ...streamingMessageRef.current!, content: fullContent }
              : msg
          ),
          updatedAt: Date.now(),
        };

        setCurrentConversation(finalConversation);
        setConversations(prev =>
          prev.map(conv =>
            conv.id === currentConversation.id ? finalConversation : conv
          )
        );

        // Sauvegarder la conversation
        await aiService.updateConversation(currentConversation.id, {
          messages: finalConversation.messages,
          updatedAt: finalConversation.updatedAt,
        });

        return finalConversation.messages[finalConversation.messages.length - 1];
      } else {
        // Requête non-streamée
        const response = await aiService.sendMessage({
          model: currentConversation.model,
          messages: [...currentConversation.messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          context: currentConversation.context,
        });

        const finalConversation = {
          ...updatedConversation,
          messages: [...updatedConversation.messages, response.message],
          updatedAt: Date.now(),
        };

        setCurrentConversation(finalConversation);
        setConversations(prev =>
          prev.map(conv =>
            conv.id === currentConversation.id ? finalConversation : conv
          )
        );

        // Sauvegarder la conversation
        await aiService.updateConversation(currentConversation.id, {
          messages: finalConversation.messages,
          updatedAt: finalConversation.updatedAt,
        });

        return response.message;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      console.error('Failed to send message:', err);
      setStreaming(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentConversation]);

  // Supprimer une conversation
  const deleteConversation = useCallback(async (id: string) => {
    try {
      await aiService.deleteConversation(id);
      setConversations(prev => prev.filter(conv => conv.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
      }
    } catch (err: any) {
      console.error('Failed to delete conversation:', err);
    }
  }, [currentConversation]);

  // Analyser le contexte pour des suggestions
  const analyzeContext = useCallback(async (context: string) => {
    try {
      return await aiService.analyzeContext(context as any);
    } catch (err: any) {
      console.error('Failed to analyze context:', err);
      return { suggestions: [], commands: [], documentation: [] };
    }
  }, []);

  // Générer du code
  const generateCode = useCallback(async (
    type: 'dockerfile' | 'kubernetes' | 'ansible' | 'script',
    description: string,
    context?: any
  ) => {
    try {
      return await aiService.generateCode(type, description, context);
    } catch (err: any) {
      console.error('Failed to generate code:', err);
      return '';
    }
  }, []);

  // Expliquer du code
  const explainCode = useCallback(async (code: string, language?: string) => {
    try {
      return await aiService.explainCode(code, language);
    } catch (err: any) {
      console.error('Failed to explain code:', err);
      return 'Unable to explain code at this time.';
    }
  }, []);

  // Debug une erreur
  const debugError = useCallback(async (error: string, context?: any) => {
    try {
      return await aiService.debugError(error, context);
    } catch (err: any) {
      console.error('Failed to debug error:', err);
      return {
        diagnosis: 'Unable to analyze error',
        solutions: [],
        prevention: [],
      };
    }
  }, []);

  // Optimiser du code/configuration
  const optimize = useCallback(async (
    config: string,
    type: 'docker' | 'kubernetes' | 'ansible' | 'code'
  ) => {
    try {
      return await aiService.optimize(config, type);
    } catch (err: any) {
      console.error('Failed to optimize:', err);
      return config;
    }
  }, []);

  // Charger les données au montage
  useEffect(() => {
    loadModels();
    loadConversations();
  }, [loadModels, loadConversations]);

  return {
    conversations,
    currentConversation,
    models,
    loading,
    streaming,
    error,
    loadConversations,
    createConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
    analyzeContext,
    generateCode,
    explainCode,
    debugError,
    optimize,
  };
};

export default useAI;
