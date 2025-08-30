/**
 * DrugDetailsList Component
 * 
 * Features:
 * - Display drug inventory with filtering and search
 * - Support for creating drug code to hospital drug mappings
 * - Visual indicators for linked/unlinked drugs
 * 
 * Usage for creating mappings:
 * 1. Look for drugs marked as "ไม่ได้เชื่อมโยง" (Not Linked)
 * 2. Click the "เชื่อมโยงยา" (Link Drug) button in the Drug Name column
 * 3. Select the appropriate hospital drug from the dropdown
 * 4. Confirm the mapping in the modal dialog
 * 
 * This creates a pcucode2hospital_drug_mapping relationship
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
import { DrugDetailsListProps } from './types';

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
  } = useDrugMapping();

  // ============================================================================
  // EARLY RETURN FOR EMPTY DATA
  // ============================================================================

  if (!Array.isArray(data) || data.length === 0) {
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

  const handleFilterTypeChange = (value: FilterType) => {
    setFilterType(value);
  };

  const handleSearchTextChange = (value: string) => {
    setSearchText(value);
  };

  const handlePageSizeChange = (_current: number, size: number) => {
    setPageSize(size);
  };

  const handleDownloadCSV = () => {
    downloadCSV(sortedData, filterType);
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
