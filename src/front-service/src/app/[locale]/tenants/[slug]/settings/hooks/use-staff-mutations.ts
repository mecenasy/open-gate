'use client';

import { useMutation } from '@apollo/client/react';
import {
  ADD_TENANT_STAFF_MUTATION,
  CHANGE_TENANT_STAFF_ROLE_MUTATION,
  REMOVE_TENANT_STAFF_MUTATION,
  TENANT_SETTINGS_QUERY,
} from './queries';

export const useStaffMutations = (tenantId: string) => {
  const refetchQueries = [{ query: TENANT_SETTINGS_QUERY, variables: { tenantId } }];

  const [doAdd, addState] = useMutation(ADD_TENANT_STAFF_MUTATION, { refetchQueries });
  const [doRemove, removeState] = useMutation(REMOVE_TENANT_STAFF_MUTATION, { refetchQueries });
  const [doChange, changeState] = useMutation(CHANGE_TENANT_STAFF_ROLE_MUTATION, { refetchQueries });

  return {
    addStaff: (userId: string, role: string) => doAdd({ variables: { input: { tenantId, userId, role } } }),
    removeStaff: (userId: string) => doRemove({ variables: { input: { tenantId, userId } } }),
    changeRole: (userId: string, role: string) => doChange({ variables: { input: { tenantId, userId, role } } }),
    isAdding: addState.loading,
    isRemoving: removeState.loading,
    isChanging: changeState.loading,
  };
};
