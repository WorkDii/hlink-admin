import { DrugData, FilterType } from '../../types';

export interface DrugDetailsListProps {
  data: DrugData;
}

export interface MappingModalState {
  visible: boolean;
  selectedRecord: any | null;
  selectedHospitalDrugId: string;
  isMapping: boolean;
}

export interface DrugRecord {
  id: string;
  drugcode: string;
  drugtype: string;
  remaining: number;
  issued30day: number;
  hospital_drug: any;
  ratio: {
    value: number;
    days: number;
    status: string;
    color: string;
  };
}

export interface FilteredDataResult {
  filteredData: DrugRecord[];
  linkedCount: number;
  unlinkedCount: number;
}
