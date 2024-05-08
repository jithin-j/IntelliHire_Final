import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const SignUp = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { employeeId, password, reenterPassword } = values;
    try {
      if (password !== reenterPassword) {
        setError('Passwords do not match');
        return;
      }

      const response = await axios.post('http://127.0.0.1:5000/signup', {
        username: employeeId,
        password: password,
      });

      console.log('Employee account created:', response.data);
      message.success('Employee account created successfully');
      navigate('/admin');
      // Add your logic after successful employee account creation, e.g., redirect to login page

    } catch (error) {
      console.error('Signup error:', error.response.data);
      setError('Error creating employee account. Please try again.');
      message.error(`Error creating employee account. ${error.response.data.error}`);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#E1F7F5' }}>
      <Form
        name="signup"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        style={{ width: 300 }}
      >
        <Title level={2} style={{ textAlign: 'center', color: '#1E0342' }}>Create Employee Account</Title>
        <Form.Item
          name="employeeId"
          rules={[{ required: true, message: 'Please input your employee ID!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Employee ID" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>
        <Form.Item
          name="reenterPassword"
          rules={[{ required: true, message: 'Please re-enter your password!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Re-enter Password" />
        </Form.Item>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 15 }} />}
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%', background: '#0E46A3' }}>Create Account</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SignUp;
