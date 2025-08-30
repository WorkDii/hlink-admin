import React, { useState, useEffect } from 'react';
import { Modal, Input, List, Spin, Button, Tag, Typography, message } from 'antd';
import { SearchOutlined, LinkOutlined } from '@ant-design/icons';
import { useSimpleList } from '@refinedev/antd';
import { debounce } from 'lodash';
import { HospitalDrug } from '../../../../type';
import { DRUG_TYPE_MAP } from '../constants';
import { formatNumber } from '../utils';

const { Text } = Typography;

interface DrugMappingModalProps {
  visible: boolean;
  selectedRecord: any | null;
  selectedHospitalDrugId: string;
  isMapping: boolean;
  onOk: () => void;
  onCancel: () => void;
  onHospitalDrugIdChange: (value: string) => void;
}

export const DrugMappingModal: React.FC<DrugMappingModalProps> = ({
  visible,
  selectedRecord,
  selectedHospitalDrugId,
  isMapping,
  onOk,
  onCancel,
  onHospitalDrugIdChange,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<HospitalDrug | null>(null);

  // Fetch hospital_drug data using Refine's useSimpleList hook
  const { listProps, setFilters, setCurrent } = useSimpleList<HospitalDrug>({
    resource: 'hospital_drug',
    meta: {
      fields: ['id', 'name', 'drugcode24', 'h_drugcode', 'is_active', 'default_unit.name', 'warehouse.name'],
    },
    // Remove filters to show both active and inactive drugs
    sorters: {
      initial: [
        {
          field: 'name',
          order: 'asc',
        },
      ],
    },
    pagination: {
      pageSize: 20,
    },
  });

  // Debounced search function
  const debouncedSearch = debounce((value: string) => {
    setCurrent(1);
    if (!value) {
      setFilters([], 'replace');
    } else {
      setFilters([
        {
          operator: 'or',
          value: [
            {
              field: 'name',
              operator: 'containss',
              value: value,
            },
            {
              field: 'drugcode24',
              operator: 'containss',
              value: value,
            },
            {
              field: 'h_drugcode',
              operator: 'containss',
              value: value,
            },
          ],
        },
      ]);
    }
  }, 500);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  // Handle drug selection
  const handleDrugSelect = (drug: HospitalDrug) => {
    setSelectedDrug(drug);
    onHospitalDrugIdChange(drug.id);
  };

  // Handle save mapping
  const handleSaveMapping = async () => {
    if (!selectedDrug) {
      message.error('กรุณาเลือกยาที่ต้องการเชื่อมโยง');
      return;
    }

    try {
      // Here you would typically save the mapping to your database
      // For now, we'll just call the onOk callback
      message.success('เชื่อมโยงยาสำเร็จ');
      onOk();
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการเชื่อมโยงยา');
      console.error('Mapping error:', error);
    }
  };

  // Clear search when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchText('');
      setSelectedDrug(null);
      onHospitalDrugIdChange('');
      setFilters([], 'replace');
    }
  }, [visible, onHospitalDrugIdChange, setFilters]);

  return (
    <Modal
      title="เชื่อมโยงยา"
      open={visible}
      onOk={handleSaveMapping}
      onCancel={onCancel}
      okText="เชื่อมโยง"
      cancelText="ยกเลิก"
      confirmLoading={isMapping}
      width={800}
      okButtonProps={{
        disabled: !selectedDrug,
      }}
    >
      {selectedRecord && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h4>ข้อมูลยาที่ต้องการเชื่อมโยง:</h4>
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px' }}>
              <p><strong>รหัสยา:</strong> {selectedRecord.drugcode}</p>
              <p><strong>ประเภทยา:</strong> {DRUG_TYPE_MAP[selectedRecord.drugtype] || selectedRecord.drugtype}</p>
              <p><strong>คงเหลือ:</strong> {formatNumber(selectedRecord.remaining)}</p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>เลือกยาที่ต้องการเชื่อมโยง:</h4>
            <p style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>
              ค้นหาและเลือกยาจากรายการยาของโรงพยาบาลที่ตรงกับยานี้
            </p>

            <Input
              placeholder="ค้นหายาในโรงพยาบาล (ชื่อยา, รหัสยา 24 หลัก, รหัสยา รพ.)..."
              size="large"
              prefix={<SearchOutlined />}
              style={{ marginBottom: '12px' }}
              value={searchText}
              onChange={handleSearchChange}
              allowClear
            />

            <div style={{
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              maxHeight: '300px',
              overflowY: 'auto',
              background: '#fff'
            }}>
              {listProps.dataSource && listProps.dataSource.length > 0 ? (
                <List
                  {...listProps}
                  renderItem={(item: HospitalDrug) => (
                    <List.Item
                      style={{
                        padding: '12px',
                        cursor: 'pointer',
                        backgroundColor: selectedDrug?.id === item.id ? '#e6f7ff' : 'transparent',
                        borderBottom: '1px solid #f0f0f0',
                        opacity: item.is_active ? 1 : 0.6,
                      }}
                      onClick={() => handleDrugSelect(item)}
                      actions={[
                        selectedDrug?.id === item.id && (
                          <LinkOutlined key="selected" style={{ color: '#1890ff' }} />
                        ),
                      ].filter(Boolean)}
                    >
                      <List.Item.Meta
                        title={
                          <div>
                            <Text strong style={{ opacity: item.is_active ? 1 : 0.7 }}>
                              {item.name}
                            </Text>
                            {!item.is_active && (
                              <Tag color="orange" style={{ marginLeft: 8 }}>
                                ยกเลิกแล้ว
                              </Tag>
                            )}
                            {selectedDrug?.id === item.id && (
                              <Tag color="blue" style={{ marginLeft: 8 }}>
                                เลือกแล้ว
                              </Tag>
                            )}
                          </div>
                        }
                        description={
                          <div>
                            <div style={{ marginBottom: '4px' }}>
                              <Text type="secondary">รหัสยา 24 หลัก: </Text>
                              <Text code>{item.drugcode24 || '-'}</Text>
                            </div>
                            <div style={{ marginBottom: '4px' }}>
                              <Text type="secondary">รหัสยา รพ.: </Text>
                              <Text code>{item.h_drugcode || '-'}</Text>
                            </div>
                            <div>
                              <Text type="secondary">หน่วย: </Text>
                              <Text>{item.default_unit?.name || '-'}</Text>
                              {item.warehouse?.name && (
                                <>
                                  <Text type="secondary" style={{ marginLeft: 8 }}>คลัง: </Text>
                                  <Text>{item.warehouse.name}</Text>
                                </>
                              )}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                  pagination={{
                    ...listProps.pagination,
                    size: 'small',
                    showSizeChanger: false,
                    showQuickJumper: false,
                  }}
                />
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                  {searchText ? 'ไม่พบยาที่ตรงกับคำค้นหา' : 'ไม่มีข้อมูลยาในโรงพยาบาล'}
                </div>
              )}
            </div>

            {selectedDrug && (
              <div style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '6px',
                padding: '12px',
                marginTop: '12px'
              }}>
                <Text strong style={{ color: '#52c41a' }}>
                  ยาที่เลือก: {selectedDrug.name}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  รหัสยา 24 หลัก: {selectedDrug.drugcode24 || '-'} |
                  รหัสยา รพ.: {selectedDrug.h_drugcode || '-'}
                </Text>
              </div>
            )}
          </div>

          <div style={{
            background: '#e6f7ff',
            border: '1px solid #91d5ff',
            borderRadius: '6px',
            padding: '12px',
            fontSize: '12px'
          }}>
            <p style={{ margin: 0, color: '#1890ff' }}>
              <strong>หมายเหตุ:</strong> การเชื่อมโยงนี้จะสร้างความสัมพันธ์ระหว่างรหัสยาในรพ.สต.
              กับข้อมูลยาของคัพ (hospital_drug) เพื่อให้สามารถแสดงข้อมูลราคาและรายละเอียดอื่นๆ ได้
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};
