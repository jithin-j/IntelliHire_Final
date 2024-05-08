import React, { useState } from 'react';
import { Upload, Button, message, Form, Input, Select, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import './FileUploadPage.css';

const { Option } = Select;

const FileUploadPage = () => {
  const [fileList, setFileList] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();


  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleUpload = () => {
    const formData = new FormData();
    setSpinning(true)
    fileList.forEach(file => {
      formData.append('files', file.originFileObj);
    });

    form.validateFields().then(values => {
      formData.append('jobCategory', values.jobCategory);
      formData.append('keywords', values.keywords.join(','));
      formData.append('jobDescription', values.jobDescription);

      axios.post('http://127.0.0.1:5000/upload', formData)
        .then(response => {
          if (response.status === 200) {
            message.success('Upload successful');
            setFileList([]);
            form.resetFields(); // Reset form fields after successful upload
            setSpinning(false);
            navigate('/admin/results', { state: { apiResponse: response.data } });
          } else {
            setSpinning(false);
            message.error('Upload failed');
          }
        })
        .catch(error => {
          setSpinning(false);
          console.error('Error:', error);
          message.error('Upload failed');
        });
    }).catch(errorInfo => {
      setSpinning(false);
      console.error('Validation failed:', errorInfo);
    });
  };

  const uploadProps = {
    fileList,
    onChange: handleFileChange,
    multiple: true,
    beforeUpload: () => false,
    accept: '.pdf',
  };

  return (
    <div className="form-upload-container">
      <h1>Resume Screener</h1>
      <Form form={form} layout="vertical">
        <Form.Item
          label="Job Category"
          name="jobCategory"
          rules={[{ required: true, message: 'Please select job category' }]}
        >
          <Select placeholder="Select job category">
            <Option value="Frontend Developer">Frontend Developer</Option>
            <Option value="Backend Developer">Backend Developer</Option>
            <Option value="Python Developer">Python Developer</Option>
            <Option value="Data Scientist">Data Scientist</Option>
            <Option value="Full Stack Developer">Full Stack Developer</Option>
            <Option value="Mobile App Developer (iOS/Android)">Mobile App Developer (iOS/Android)</Option>
            <Option value="Machine Learning Engineer">Machine Learning Engineer</Option>
            <Option value="Cloud Engineer">Cloud Engineer</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Keywords" name="keywords" rules={[{ required: true, message: 'Please enter keywords' }]}>
          <Select mode="tags" placeholder="Enter keywords" style={{ width: '100%' }} >
            <Option value="React">React.js</Option>
            <Option value="Node.js">Node.js</Option>
            <Option value="JavaScript">JavaScript</Option>
            <Option value="TypeScript">TypeScript</Option>
            <Option value="Angular">Angular</Option>
            <Option value="Vue.js">Vue.js</Option>
            <Option value="HTML">HTML</Option>
            <Option value="CSS">CSS</Option>
            <Option value="Bootstrap">Bootstrap</Option>
            <Option value="Sass">Sass</Option>
            <Option value="MERN">Mern Stack</Option>
            <Option value="Python">Python</Option>
            <Option value="Django">Django</Option>
            <Option value="Flask">Flask</Option>
            <Option value="SQL">SQL</Option>
            <Option value="MongoDB">MongoDB</Option>
            <Option value="PostgreSQL">PostgreSQL</Option>
            <Option value="AWS">AWS</Option>
            <Option value="Azure">Azure</Option>
            <Option value="Google Cloud">Google Cloud</Option>
            <Option value="Machine Learning">Machine Learning</Option>
            <Option value="Deep Learning">Deep Learning</Option>
            <Option value="NLP">NLP</Option>
            <Option value="iOS">iOS</Option>
            <Option value="Android">Android</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Job Description" name="jobDescription" rules={[{ required: true, message: 'Please enter job description' }]}>
          <Input.TextArea placeholder="Enter job description" rows={10} />
        </Form.Item>
      </Form>
      <Upload.Dragger {...uploadProps} className="dragger">
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
      </Upload.Dragger>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        className="uploadButton"
      >
        Upload
      </Button>
      <Spin spinning={spinning} fullscreen />
    </div>
  );
};

export default FileUploadPage;