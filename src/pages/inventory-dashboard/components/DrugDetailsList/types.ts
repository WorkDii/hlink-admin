import { DrugData, FilterType } from '../../types';

export interface DrugDetailsListProps {
  data: DrugData;
}

export interface HospitalDrug {
  id: string;
  name: string;
  cost: number;
}

export interface DrugRatio {
  value: number;
  days: number;
  status: string;
  color: string;
}

export interface DrugRecord {
  id: string;
  pcucode: string;
  drugcode: string;
  drugtype: string;
  remaining: number;
  issued30day: number;
  hospital_drug: HospitalDrug | null;
  ratio: DrugRatio;
}

export interface MappingModalState {
  visible: boolean;
  selectedRecord: DrugRecord | null;
  selectedHospitalDrugId: string;
  isMapping: boolean;
}

export interface FilteredDataResult {
  filteredData: DrugRecord[];
  linkedCount: number;
  unlinkedCount: number;
}

export interface DrugTableProps {
  data: DrugRecord[];
  onOpenMappingModal: (record: DrugRecord) => void;
  pageSize: number;
  onPageSizeChange: (current: number, size: number) => void;
  searchText: string;
}

export interface DrugFiltersProps {
  filterType: FilterType;
  searchText: string;
  dataLength: number;
  linkedCount: number;
  unlinkedCount: number;
  onFilterTypeChange: (value: FilterType) => void;
  onSearchTextChange: (value: string) => void;
  onDownloadCSV: () => void;
}

export interface DrugMappingModalProps {
  visible: boolean;
  selectedRecord: DrugRecord | null;
  selectedHospitalDrugId: string;
  isMapping: boolean;
  onOk: () => void;
  onCancel: () => void;
  onHospitalDrugIdChange: (value: string) => void;
}
