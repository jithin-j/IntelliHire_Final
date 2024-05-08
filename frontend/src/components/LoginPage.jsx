import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', {
        username: values.employeeId,
        password: values.password,
      });
      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      setLoading(false);
      const decodedToken = parseJwt(access_token);
      if (decodedToken.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error.response.data);
      message.error('Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: "#9AC8CD" }}>
      <h1 style={{ 'color': '#1E0342' }}>Employee Login</h1>
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        style={{ width: 300 }}
      >
        <Form.Item
          name="employeeId"
          rules={[{ required: true, message: 'Please enter your Employee ID!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Employee ID" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please enter your password!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
            Log in
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
