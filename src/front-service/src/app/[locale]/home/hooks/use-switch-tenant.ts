'use client';

import { useApolloClient, useMutation } from '@apollo/client/react';
import { SWITCH_TENANT_MUTATION } from './queries';

export const useSwitchTenant = () => {
  const client = useApolloClient();
  const [doSwitch, { loading }] = useMutation(SWITCH_TENANT_MUTATION);

  const switchTenant = async (tenantId: string) => {
    await doSwitch({ variables: { tenantId } });
    // Tenant context lives server-side in the session — every cached query
    // whose result depends on it (tenantFeatures, platforms, staff, contacts,
    // prompts, commands, usage…) needs fresh data. refetchQueries('active')
    // re-fires every observed query in place: cached results stay visible
    // until the new payload lands, so the UI doesn't blank out.
    await client.refetchQueries({ include: 'active' });
  };

  return { switchTenant, isSwitching: loading };
};
