import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal, Form, Input, message } from 'antd';
import './AdminViewTasks.css';

const AdminViewTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [detailedTaskModalVisible, setDetailedTaskModalVisible] = useState(false);
    const [detailedTask, setDetailedTask] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/tasks');
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleEditTask = (task) => {
        setSelectedTask(task);
        form.setFieldsValue({
            title: task.title,
            description: task.description,
            status: 'Pending', // Default to 'Pending' status
        });
        setEditTaskModalVisible(true);
    };

    const handleDetailedTask = (task) => {
        setDetailedTask(task);
        setDetailedTaskModalVisible(true);
    };

    const handleEditTaskSubmit = async () => {
        try {
            const values = await form.validateFields();
            await axios.put(`http://127.0.0.1:5000/update_task/${selectedTask.id}`, {
                title: values.title,
                description: values.description,
                status: values.status,
            });
            message.success('Task updated successfully');
            setEditTaskModalVisible(false);
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
            message.error('Error updating task. Please try again.');
        }
    };

    //Function to delete a task
    const handleDeleteTask = async (task) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/delete_task/${task.id}`);
            message.success('Task deleted successfully');
            fetchTasks();
        }
        catch (error) {
            console.error('Error deleting task:', error);
            message.error('Error deleting task. Please try again.');
        }
    }

    return (
        <div className='tasks_container'>
            <h1>Task List</h1>
            <div className="tasks_wrapper">
                <div className="tasks_column">
                    <h2>Pending Tasks</h2>
                    <div className="card-container">
                        {tasks.map(task => (
                            task.status === 'Pending' && (
                                <Card
                                    key={task.id}
                                    title={task.title}
                                    style={{ marginBottom: 20, width: "45vw" }}
                                    extra={<Button onClick={() => handleDetailedTask(task)}>Show Details</Button>}
                                >
                                    <p>Description: {task.description.slice(0, 100)}...</p>
                                    <p>Status: {task.status}</p>
                                    <p>Assigned to: {task.assigned_to}</p>
                                    <Button onClick={() => handleDeleteTask(task)} danger ghost>Delete</Button>
                                </Card>
                            )
                        ))}
                    </div>
                </div>
                <div className="tasks_column">
                    <h2>Completed Tasks</h2>
                    <div className="card-container">
                        {tasks.map(task => (
                            task.status === 'Done' && (
                                <Card
                                    key={task.id}
                                    title={task.title}
                                    extra={<><Button onClick={() => handleEditTask(task)}>Reassign</Button> <Button onClick={() => handleDetailedTask(task)}>Show Details</Button></>}
                                    style={{ marginBottom: 20, width: "45vw" }}
                                >
                                    <p>Description: {task.description.slice(0, 50)}...</p>
                                    <p>Status: {task.status}</p>
                                    <p>Completed by: {task.assigned_to}</p>
                                    <Button onClick={() => handleDeleteTask(task)} danger ghost>Delete</Button>
                                </Card>
                            )
                        ))}
                    </div>
                </div>
            </div>

            <Modal
                title="Edit Task"
                visible={editTaskModalVisible}
                onCancel={() => setEditTaskModalVisible(false)}
                onOk={handleEditTaskSubmit}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter title' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter description' }]}>
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="status" label="Status" initialValue="Pending">
                        <Input disabled />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Detailed Task"
                visible={detailedTaskModalVisible}
                onCancel={() => setDetailedTaskModalVisible(false)}
                footer={null}
            >
                {detailedTask && (
                    <div>
                        <h2>Title: {detailedTask.title}</h2>
                        <p>Description: {detailedTask.description}</p>
                        <p>Status: {detailedTask.status}</p>
                        <p>Assigned to: {detailedTask.assigned_to}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminViewTasks;
