import { useState, useEffect } from 'react';
import { directusClient } from "../../directusClient";
import { readItem } from '@tspvivek/refine-directus';
import { getInventoryDashboardData } from './api';
import { InventoryDashboardData, OuWithWarehouse } from './types';

/**
 * Custom hook for fetching and managing inventory dashboard data
 */
export const useInventoryDashboardData = (pcucode: string | undefined) => {
  const [data, setData] = useState<InventoryDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [ou, setOu] = useState<OuWithWarehouse | null>(null);

  // Fetch OU data when pcucode changes
  useEffect(() => {
    if (!pcucode) {
      setOu(null);
      return;
    }

    const fetchOu = async () => {
      try {
        const result = await directusClient.request<OuWithWarehouse>(
          readItem("ou", pcucode, {
            fields: ['*', { 'warehouse': ['id', 'warehouse_id'] }]
          })
        );

        if (result) {
          setOu(result);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch OU data'));
      }
    };

    fetchOu();
  }, [pcucode]);

  // Fetch dashboard data when OU changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!ou) {
        setData(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getInventoryDashboardData(ou);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred while fetching dashboard data'));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [ou]);

  // Reset states when pcucode is undefined
  useEffect(() => {
    if (!pcucode) {
      setData(null);
      setLoading(true);
      setError(null);
    }
  }, [pcucode]);

  return {
    data,
    loading,
    error,
    ou,
    /**
     * Manually refetch the dashboard data
     */
    refetch: () => {
      if (ou) {
        getInventoryDashboardData(ou)
          .then(setData)
          .catch(err => setError(err instanceof Error ? err : new Error('Refetch failed')));
      }
    }
  };
}; 