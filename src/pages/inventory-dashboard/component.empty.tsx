import { Alert, Col, Row } from "antd"


export const ComponentEmpty = () => {
  return (
    <Row gutter={[16, 16]} justify="center" align="middle" style={{ minHeight: '200px' }}>
      <Col>
        <Alert
          message="ไม่พบข้อมูล"
          description="กรุณาเลือก PCU เพื่อดูข้อมูล"
          type="info"
          showIcon
        />
      </Col>
    </Row>
  )
}