'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';

// ── NOTE ─────────────────────────────────────────────────────────────────────
// After updating the backend (proto + bff-service) run GraphQL codegen so that
// graphql.ts gains: CommandType.roleNames, RemoveCommandType input type.
// ─────────────────────────────────────────────────────────────────────────────

export type CommandSummary = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  actions: Record<string, boolean>;
  parameters: Record<string, boolean>;
  roleNames: string[];
};

// ── queries / mutations ───────────────────────────────────────────────────────

const GET_COMMANDS_QUERY = graphql(`
  query GetCommands($input: GetAllCommandsType) {
    commands(input: $input) {
      status
      message
      data {
        id
        name
        description
        active
        actions
        parameters
        roleNames
      }
      total
    }
  }
`);

const ADD_COMMAND_MUTATION = graphql(`
  mutation AddCommand($input: AddCommandType!) {
    addCommand(input: $input) {
      status
      message
      data {
        id
        name
        description
        active
        actions
        parameters
        roleNames
      }
    }
  }
`);

const UPDATE_COMMAND_MUTATION = graphql(`
  mutation UpdateCommand($input: UpdateCommandType!) {
    updateCommand(input: $input) {
      status
      message
      data {
        id
      }
    }
  }
`);

const TOGGLE_ACTIVE_STATUS_MUTATION = graphql(`
  mutation ToggleActiveStatus($input: ToggleActiveStatusType!) {
    toggleActiveStatus(input: $input) {
      status
      message
      data {
        id
        active
      }
    }
  }
`);

const REMOVE_COMMAND_MUTATION = graphql(`
  mutation RemoveCommand($input: RemoveCommandType!) {
    removeCommand(input: $input) {
      status
      message
    }
  }
`);

// ── hook ─────────────────────────────────────────────────────────────────────

export const useCommands = () => {
  const [selectedCommand, setSelectedCommand] = useState<CommandSummary | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { loading, data } = useQuery(GET_COMMANDS_QUERY, {
    fetchPolicy: 'cache-and-network',
    variables: { input: { limit: 100, page: 1 } },
  });

  const [doAddCommand, { loading: creatingCommand }] = useMutation(ADD_COMMAND_MUTATION, {
    refetchQueries: ['GetCommands'],
  });

  const [doUpdateCommand, { loading: updatingCommand }] = useMutation(UPDATE_COMMAND_MUTATION, {
    refetchQueries: ['GetCommands'],
  });

  const [doToggleActive] = useMutation(TOGGLE_ACTIVE_STATUS_MUTATION, {
    refetchQueries: ['GetCommands'],
  });

  const [doRemoveCommand] = useMutation(REMOVE_COMMAND_MUTATION, {
    refetchQueries: ['GetCommands'],
  });

  const commands = data?.commands.data as CommandSummary[] | undefined;

  const openModal = (command: CommandSummary) => setSelectedCommand(command);
  const closeModal = () => setSelectedCommand(null);
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const onCreateCommand = async (input: {
    name: string;
    description: string;
    actions: Record<string, boolean>;
    parameters: Record<string, boolean>;
    roleNames: string[];
  }) => {
    await doAddCommand({ variables: { input } });
  };

  const onUpdateCommand = async (input: {
    description?: string;
    active?: boolean;
    actions: Record<string, boolean>;
    parameters: Record<string, boolean>;
    roleNames: string[];
    name?: string;
  }) => {
    if (!selectedCommand) return;
    await doUpdateCommand({ variables: { input: { ...input, id: selectedCommand.id } } });
  };

  const onToggleActive = (id: string, active: boolean) => {
    doToggleActive({ variables: { input: { id, active } } });
  };

  const onRemoveCommand = (id: string) => {
    doRemoveCommand({ variables: { input: { id } } });
  };

  return {
    commands,
    isLoading: loading,
    selectedCommand,
    openModal,
    closeModal,
    onUpdateCommand,
    onRemoveCommand,
    onToggleActive,
    isUpdatingCommand: updatingCommand,
    isAddModalOpen,
    openAddModal,
    closeAddModal,
    onCreateCommand,
    isCreatingCommand: creatingCommand,
  };
};
