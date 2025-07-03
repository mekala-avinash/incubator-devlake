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
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Switch, 
  Button, 
  Space, 
  Spin, 
  Alert,
  Breadcrumb,
  Divider,
  Tag
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  SaveOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface TemplateField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  default?: any;
  description: string;
  options?: Array<{ label: string; value: any }>;
}

interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  fields: TemplateField[];
  examples?: Record<string, any>;
}

export const TemplateForm: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      fetchTemplates(category);
    }
  }, [category]);

  const fetchTemplates = async (categoryId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/plugins/template-generator/templates?category=${categoryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplate(data[0]);
        if (data[0].examples && Object.keys(data[0].examples).length > 0) {
          const firstExample = Object.values(data[0].examples)[0] as Record<string, any>;
          form.setFieldsValue(firstExample);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      form.resetFields();
      if (template.examples && Object.keys(template.examples).length > 0) {
        const firstExample = Object.values(template.examples)[0] as Record<string, any>;
        form.setFieldsValue(firstExample);
      }
    }
  };

  const handlePreview = () => {
    if (selectedTemplate) {
      const values = form.getFieldsValue();
      const params = new URLSearchParams();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
        }
      });
      navigate(`/templates/${category}/${selectedTemplate.id}/preview?${params.toString()}`);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    try {
      setGenerating(true);
      const values = await form.validateFields();
      
      const response = await fetch('/api/plugins/template-generator/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: selectedTemplate.id,
          config: values,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate template');
      }

      const result = await response.json();
      
      // Download the generated template
      const downloadResponse = await fetch(`/api/plugins/template-generator/templates/${result.id}/download`);
      if (downloadResponse.ok) {
        const blob = await downloadResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedTemplate.id}-template.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate template');
    } finally {
      setGenerating(false);
    }
  };

  const renderField = (field: TemplateField) => {
    const commonProps = {
      required: field.required,
      extra: field.description,
    };

    switch (field.type) {
      case 'text':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            {...commonProps}
          >
            <Input placeholder={`Enter ${field.label.toLowerCase()}`} />
          </Form.Item>
        );

      case 'number':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            {...commonProps}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder={`Enter ${field.label.toLowerCase()}`}
              min={0}
            />
          </Form.Item>
        );

      case 'select':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            {...commonProps}
          >
            <Select placeholder={`Select ${field.label.toLowerCase()}`}>
              {field.options?.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );

      case 'multiselect':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            {...commonProps}
          >
            <Select 
              mode="multiple" 
              placeholder={`Select ${field.label.toLowerCase()}`}
              allowClear
            >
              {field.options?.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );

      case 'boolean':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            valuePropName="checked"
            {...commonProps}
          >
            <Switch />
          </Form.Item>
        );

      default:
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            {...commonProps}
          >
            <Input placeholder={`Enter ${field.label.toLowerCase()}`} />
          </Form.Item>
        );
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading templates...</div>
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
        action={<Button onClick={() => navigate('/templates')}>Back to Categories</Button>}
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <Breadcrumb.Item>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/templates')}
            style={{ padding: 0 }}
          >
            Templates
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{category}</Breadcrumb.Item>
      </Breadcrumb>

      <Row gutter={24}>
        <Col span={8}>
          <Card title="Available Templates" style={{ height: 'fit-content' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {templates.map(template => (
                <Card
                  key={template.id}
                  size="small"
                  hoverable
                  style={{ 
                    cursor: 'pointer',
                    border: selectedTemplate?.id === template.id ? '2px solid #1890ff' : '1px solid #d9d9d9'
                  }}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text strong>{template.name}</Text>
                      <Tag color="blue">{template.version}</Tag>
                    </div>
                    <Paragraph 
                      type="secondary" 
                      style={{ margin: '8px 0 0 0', fontSize: '12px' }}
                      ellipsis={{ rows: 2 }}
                    >
                      {template.description}
                    </Paragraph>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>

        <Col span={16}>
          {selectedTemplate ? (
            <Card 
              title={selectedTemplate.name}
              extra={
                <Space>
                  <Button icon={<EyeOutlined />} onClick={handlePreview}>
                    Preview
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    onClick={handleGenerate}
                    loading={generating}
                  >
                    Generate & Download
                  </Button>
                </Space>
              }
            >
              <Paragraph>{selectedTemplate.description}</Paragraph>
              <Divider />
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleGenerate}
              >
                {selectedTemplate.fields.map(renderField)}
              </Form>
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Text type="secondary">Select a template to configure</Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};