/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Space, Spin, Alert, Button, Tag } from 'antd';
import { 
  RocketOutlined, 
  ContainerOutlined, 
  CloudOutlined, 
  ShieldOutlined,
  CodeOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: TemplateInfo[];
}

interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
}

const iconMap = {
  rocket: <RocketOutlined style={{ fontSize: '2rem', color: '#1890ff' }} />,
  box: <ContainerOutlined style={{ fontSize: '2rem', color: '#52c41a' }} />,
  kubernetes: <CloudOutlined style={{ fontSize: '2rem', color: '#722ed1' }} />,
  shield: <ShieldOutlined style={{ fontSize: '2rem', color: '#fa8c16' }} />,
  code: <CodeOutlined style={{ fontSize: '2rem', color: '#13c2c2' }} />,
};

export const TemplateHome: React.FC = () => {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/plugins/template-generator/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch template categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading template categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={<Button onClick={fetchCategories}>Retry</Button>}
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>DevOps Template Generator</Title>
        <Paragraph>
          Generate best-practice DevOps templates for CI/CD, containerization, Kubernetes,
          infrastructure as code, and security configurations. Save time and ensure consistency
          across your projects.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {categories.map((category) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={category.id}>
            <Card
              hoverable
              style={{ height: '100%' }}
              bodyStyle={{ padding: '24px' }}
              actions={[
                <Link to={`/templates/${category.id}`}>
                  <Button type="primary" block>
                    Browse Templates ({category.templates.length})
                  </Button>
                </Link>
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div style={{ textAlign: 'center' }}>
                  {iconMap[category.icon as keyof typeof iconMap] || iconMap.code}
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {category.name}
                  </Title>
                  <Text type="secondary">{category.description}</Text>
                </div>

                <div>
                  <Text strong>Available Templates:</Text>
                  <div style={{ marginTop: '8px' }}>
                    {category.templates.slice(0, 3).map((template) => (
                      <Tag key={template.id} style={{ marginBottom: '4px' }}>
                        {template.name}
                      </Tag>
                    ))}
                    {category.templates.length > 3 && (
                      <Tag color="blue">+{category.templates.length - 3} more</Tag>
                    )}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {categories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text type="secondary">No template categories available</Text>
        </div>
      )}
    </div>
  );
};