import { Alert, Col, Row } from "antd"


export const ComponentError = ({ error }: { error: Error }) => {
  return (
    <Row gutter={[16, 16]} justify="center" align="middle" style={{ minHeight: '200px' }}>
      <Col>
        <Alert
          message="เกิดข้อผิดพลาด"
          description={error.message}
          type="error"
          showIcon
        />
      </Col>
    </Row>
  )
}