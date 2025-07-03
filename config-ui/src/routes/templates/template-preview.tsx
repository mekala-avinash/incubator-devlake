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
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Spin, 
  Alert,
  Breadcrumb,
  Tabs,
  Badge,
  Row,
  Col
} from 'antd';
import { 
  ArrowLeftOutlined, 
  DownloadOutlined, 
  EditOutlined,
  FileOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  type: string;
}

interface PreviewData {
  id: string;
  files: GeneratedFile[];
  metadata: {
    template_id: string;
    template_name: string;
    version: string;
    generated_at: string;
    config: Record<string, any>;
  };
}

const getLanguageFromType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'yaml': 'yaml',
    'yml': 'yaml',
    'json': 'json',
    'dockerfile': 'dockerfile',
    'groovy': 'groovy',
    'bash': 'bash',
    'shell': 'bash',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'python': 'python',
    'go': 'go',
  };
  return typeMap[type.toLowerCase()] || 'text';
};

export const TemplatePreview: React.FC = () => {
  const { category, templateId } = useParams<{ category: string; templateId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (templateId) {
      fetchPreview();
    }
  }, [templateId, location.search]);

  const fetchPreview = async () => {
    if (!templateId) return;

    try {
      setLoading(true);
      
      // Parse query parameters
      const searchParams = new URLSearchParams(location.search);
      const config: Record<string, any> = {};
      
      searchParams.forEach((value, key) => {
        try {
          // Try to parse as JSON first (for arrays)
          config[key] = JSON.parse(value);
        } catch {
          // If not JSON, use as string
          config[key] = value;
        }
      });

      const response = await fetch(`/api/plugins/template-generator/templates/${templateId}/preview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // For GET request, we'd need to include config in query params
        // For now, using POST-like approach with preview endpoint
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const data = await response.json();
      setPreviewData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!previewData) return;

    try {
      setDownloading(true);
      const response = await fetch(`/api/plugins/template-generator/templates/${previewData.id}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${templateId}-template.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to download template');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download template');
    } finally {
      setDownloading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/templates/${category}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Generating preview...</div>
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
        action={
          <Button onClick={() => navigate(`/templates/${category}`)}>
            Back to Templates
          </Button>
        }
      />
    );
  }

  if (!previewData) {
    return (
      <Alert
        message="No Preview Data"
        description="Unable to generate preview for this template."
        type="warning"
        showIcon
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
        <Breadcrumb.Item>
          <Button 
            type="link" 
            onClick={() => navigate(`/templates/${category}`)}
            style={{ padding: 0 }}
          >
            {category}
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Preview</Breadcrumb.Item>
      </Breadcrumb>

      <Card
        title={
          <Space>
            <FileOutlined />
            {previewData.metadata.template_name} Preview
            <Badge count={previewData.files.length} color="blue" />
          </Space>
        }
        extra={
          <Space>
            <Button icon={<EditOutlined />} onClick={handleEdit}>
              Edit Configuration
            </Button>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={handleDownload}
              loading={downloading}
            >
              Download ZIP
            </Button>
          </Space>
        }
      >
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Text type="secondary">Template:</Text>
            <div>{previewData.metadata.template_name}</div>
          </Col>
          <Col span={6}>
            <Text type="secondary">Version:</Text>
            <div>{previewData.metadata.version}</div>
          </Col>
          <Col span={6}>
            <Text type="secondary">Generated:</Text>
            <div>{new Date(previewData.metadata.generated_at).toLocaleString()}</div>
          </Col>
          <Col span={6}>
            <Text type="secondary">Files:</Text>
            <div>{previewData.files.length} files</div>
          </Col>
        </Row>

        <Tabs
          type="card"
          items={previewData.files.map((file, index) => ({
            key: index.toString(),
            label: (
              <Space>
                <CodeOutlined />
                {file.name}
              </Space>
            ),
            children: (
              <div>
                <div style={{ marginBottom: '8px' }}>
                  <Text type="secondary">Path: </Text>
                  <Text code>{file.path}</Text>
                </div>
                <SyntaxHighlighter
                  language={getLanguageFromType(file.type)}
                  style={tomorrow}
                  customStyle={{
                    margin: 0,
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                  showLineNumbers
                  wrapLines
                >
                  {file.content}
                </SyntaxHighlighter>
              </div>
            ),
          }))}
        />
      </Card>
    </div>
  );
};