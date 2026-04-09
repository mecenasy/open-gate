'use client';

import { useState } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';
import { graphql } from '@/app/gql';
import { AddPromptType, UpdatePromptType, PromptUserType } from '@/app/gql/graphql';

export type PromptSummary = {
  id: string;
  key: string;
  description: string;
  commandName: string;
  prompt?: string;
  userType: PromptUserType | '%future added value';
};

const GET_PROMPTS_QUERY = graphql(`
  query GetPrompts($input: GetAllPromptsType) {
    prompts(input: $input) {
      status
      message
      data {
        id
        key
        description
        commandName
        userType
      }
      total
    }
  }
`);

const GET_PROMPT_BY_USER_TYPE_QUERY = graphql(`
  query GetPromptById($input: GetPromptByIdType!) {
    promptById(input: $input) {
      status
      message
      data {
        id
        key
        description
        commandName
        userType
        prompt
      }
    }
  }
`);

const ADD_PROMPT_MUTATION = graphql(`
  mutation AddPrompt($input: AddPromptType!) {
    addPrompt(input: $input) {
      status
      message
      data {
        id
        key
        description
        commandName
        userType
        prompt
      }
    }
  }
`);

const UPDATE_PROMPT_MUTATION = graphql(`
  mutation UpdatePrompt($input: UpdatePromptType!) {
    updatePrompt(input: $input) {
      status
      message
      data {
        id
        key
        description
        commandName
        userType
        prompt
      }
    }
  }
`);

const REMOVE_PROMPT_MUTATION = graphql(`
  mutation RemovePrompt($input: RemovePromptType!) {
    removePrompt(input: $input) {
      success
    }
  }
`);

export const usePrompts = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptSummary | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { loading, data } = useQuery(GET_PROMPTS_QUERY, {
    fetchPolicy: 'cache-and-network',
    variables: { input: { limit: 100, page: 1 } },
  });

  const [fetchFullPrompt, { loading: fullPromptLoading, data: fullPromptData }] =
    useLazyQuery(GET_PROMPT_BY_USER_TYPE_QUERY);

  const [doAddPrompt, { loading: creatingPrompt }] = useMutation(ADD_PROMPT_MUTATION, {
    refetchQueries: ['GetPrompts'],
  });

  const [doUpdatePrompt, { loading: updatingPrompt }] = useMutation(UPDATE_PROMPT_MUTATION, {
    refetchQueries: ['GetPrompts'],
  });

  const [doRemovePrompt] = useMutation(REMOVE_PROMPT_MUTATION, {
    refetchQueries: ['GetPrompts'],
  });

  const prompts = data?.prompts.data;

  const openModal = (prompt: PromptSummary) => {
    setSelectedPrompt(prompt);
    fetchFullPrompt({ variables: { input: { id: prompt.id } } });
  };

  const closeModal = () => setSelectedPrompt(null);

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const onCreatePrompt = async (input: AddPromptType) => {
    await doAddPrompt({ variables: { input } });
  };

  const onUpdatePrompt = async (input: Omit<UpdatePromptType, 'id'>) => {
    if (!selectedPrompt) return;
    await doUpdatePrompt({ variables: { input: { ...input, id: selectedPrompt.id } } });
  };

  const onRemovePrompt = (id: string) => {
    doRemovePrompt({ variables: { input: { id } } });
  };

  return {
    prompts,
    isLoading: loading,
    selectedPrompt,
    openModal,
    closeModal,
    onUpdatePrompt,
    onRemovePrompt,
    isUpdatingPrompt: updatingPrompt,
    isAddModalOpen,
    openAddModal,
    closeAddModal,
    onCreatePrompt,
    isCreatingPrompt: creatingPrompt,
    fullPromptLoading,
    fullPromptText: fullPromptData?.promptById.data?.prompt,
  };
};
