/**
 * DrugDetailsList Component
 * 
 * A comprehensive drug inventory management component that displays drug data
 * in a sortable, filterable table with mapping capabilities.
 * 
 * @component
 * @example
 * ```tsx
 * <DrugDetailsList data={drugInventoryData} />
 * ```
 * 
 * Features:
 * - Display drug inventory with filtering and search
 * - Support for creating drug code to hospital drug mappings
 * - Visual indicators for linked/unlinked drugs
 * - CSV export functionality
 * - Real-time search and filtering
 * - Pagination with customizable page sizes
 * 
 * Workflow for creating mappings:
 * 1. Look for drugs marked as "ไม่ได้เชื่อมโยง" (Not Linked)
 * 2. Click the "เชื่อมโยงยา" (Link Drug) button in the Drug Name column
 * 3. Select the appropriate hospital drug from the dropdown
 * 4. Confirm the mapping in the modal dialog
 * 
 * This creates a pcucode2hospital_drug_mapping relationship that enables
 * cost calculation and detailed drug information display.
 * 
 * @param props - Component props
 * @param props.data - Array of drug records to display
 * @returns React functional component
 */

import React, { useState, useMemo } from 'react';
import { Col, Card } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import { FilterType, STATUS_PRIORITY } from '../../types';
import {
  filterDrugData,
  sortDataByPriority,
} from './utils';
import { DEFAULT_PAGE_SIZE } from './constants';
import { useDrugMapping } from './hooks/useDrugMapping';
import { DrugFilters } from './components/DrugFilters';
import { DrugTable } from './components/DrugTable';
import { DrugMappingModal } from './components/DrugMappingModal';
import { downloadCSV } from './components/CSVExport';
import { DrugDetailsListProps, DrugRecord } from './types';
import { isValidDrugData, handleValidationError, safeAsyncOperation } from './utils/errorHandling';

export const DrugDetailsList: React.FC<DrugDetailsListProps> = ({ data }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState<string>('');

  const {
    mappingModal,
    handleOpenMappingModal,
    handleCreateMapping,
    handleCancelMapping,
    handleUpdateHospitalDrugId,
    handleCancelDrugMapping,
  } = useDrugMapping();

  // ============================================================================
  // DATA VALIDATION AND EARLY RETURNS
  // ============================================================================

  // Validate input data
  if (!isValidDrugData(data)) {
    if (data && !Array.isArray(data)) {
      handleValidationError('รูปแบบข้อมูล', data);
    }

    return (
      <Col span={24}>
        <Card title="รายละเอียดยาทั้งหมด" extra={<UnorderedListOutlined />}>
          <div style={{ textAlign: 'center', color: '#aaa', padding: '32px 0' }}>
            ไม่มีข้อมูล
          </div>
        </Card>
      </Col>
    );
  }

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const { filteredData, linkedCount, unlinkedCount } = useMemo(() => {
    return filterDrugData(data, filterType, searchText);
  }, [data, filterType, searchText]);

  const sortedData = useMemo(() => {
    return sortDataByPriority(filteredData, STATUS_PRIORITY);
  }, [filteredData]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle filter type change (all/linked/unlinked)
   * @param value - The new filter type
   */
  const handleFilterTypeChange = (value: FilterType) => {
    setFilterType(value);
  };

  /**
   * Handle search text input change
   * @param value - The new search text
   */
  const handleSearchTextChange = (value: string) => {
    setSearchText(value);
  };

  /**
   * Handle pagination page size change
   * @param _current - Current page number (unused)
   * @param size - New page size
   */
  const handlePageSizeChange = (_current: number, size: number) => {
    setPageSize(size);
  };

  /**
   * Handle CSV download with error handling
   * Exports the currently filtered and sorted data to a CSV file
   */
  const handleDownloadCSV = async () => {
    await safeAsyncOperation(
      async () => {
        downloadCSV(sortedData, filterType);
        return true;
      },
      'การส่งออก CSV'
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Col span={24}>
      <Card
        title="รายละเอียดยาทั้งหมด"
        extra={
          <DrugFilters
            filterType={filterType}
            searchText={searchText}
            dataLength={data.length}
            linkedCount={linkedCount}
            unlinkedCount={unlinkedCount}
            onFilterTypeChange={handleFilterTypeChange}
            onSearchTextChange={handleSearchTextChange}
            onDownloadCSV={handleDownloadCSV}
          />
        }
      >
        <DrugTable
          data={sortedData}
          onOpenMappingModal={handleOpenMappingModal}
          onCancelMapping={handleCancelDrugMapping}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          searchText={searchText}
        />

        <DrugMappingModal
          visible={mappingModal.visible}
          selectedRecord={mappingModal.selectedRecord}
          selectedHospitalDrugId={mappingModal.selectedHospitalDrugId}
          isMapping={mappingModal.isMapping}
          onOk={handleCreateMapping}
          onCancel={handleCancelMapping}
          onHospitalDrugIdChange={handleUpdateHospitalDrugId}
        />
      </Card>
    </Col>
  );
};
