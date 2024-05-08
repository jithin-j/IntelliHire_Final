import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Select, Button, message } from 'antd';
import "./AssignTask.css"

const { Option } = Select;

const AssignTask = () => {
    const [users, setUsers] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        // Fetch the list of users from the backend
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/get_all_users');
                setUsers(response.data.users);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleAssignTask = async (values) => {
        try {
            // Make an API call to assign the task
            const response = await axios.post('http://127.0.0.1:5000/create_task', {
                assigned_to: values.assignedTo,
                title: values.title,
                description: values.description,
            });

            message.success(response.data.message);
            form.resetFields();
        } catch (error) {
            console.error('Error assigning task:', error);
            message.error('Error assigning task. Please try again.');
        }
    };

    return (
        <div className="assign-task-container">
            <h1 className="assign-task-title">Assign Task</h1>
            <Form
                form={form}
                onFinish={handleAssignTask}
                className="assign-task-form"
                initialValues={{ assignedTo: '' }}
            >
                <Form.Item
                    name="title"
                    label="Title:"
                    rules={[{ required: true, message: 'Please enter the title' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Description:"
                    rules={[{ required: true, message: 'Please enter the description' }]}
                    className='description-input'
                >
                    <Input.TextArea />
                </Form.Item>
                <Form.Item
                    name="assignedTo"
                    label="Assign To:"
                    rules={[{ required: true, message: 'Please select a user' }]}
                >
                    <Select>
                        <Option value="">Select User</Option>
                        {users.map((user) => (
                            <Option key={user.id} value={user.username}>{user.username}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item style={{ marginTop: '1rem' }}>
                    <Button type="primary" htmlType="submit" style={{ background: '#0E46A3'}}>Assign Task</Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default AssignTask;
