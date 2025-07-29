import { Col, Row, Spin } from "antd"


export const ComponentLoading = () => {
  return (
    <div>
      <Row gutter={[16, 16]} justify="center" align="middle" style={{ minHeight: '200px' }}>
        <Col>
          <Spin size="large" />
        </Col>
      </Row>
    </div>
  )
}