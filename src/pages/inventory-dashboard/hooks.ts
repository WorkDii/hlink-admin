import { useState, useEffect } from 'react';
import { directusClient } from "../../directusClient";
import { readItem, readItems } from '@tspvivek/refine-directus';
import { getInventoryDashboardData } from './hooks.controller';



/**
 * Custom hook for fetching and managing inventory dashboard data
 */
export const useInventoryDashboardData = (pcucode: string | undefined) => {
  const [data, setData] = useState<Awaited<ReturnType<typeof getInventoryDashboardData>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (pcucode) {
      setLoading(true)
      getInventoryDashboardData(pcucode).then(res => {
        setData(res)
      }).catch(err => {
        setError(err)
      }).finally(() => {
        setLoading(false)
      })
    } else {
      setData(null)
      setLoading(false)
      setError(null)
    }
  }, [pcucode]);

  return {
    data,
    loading,
    error,
  };
}; 