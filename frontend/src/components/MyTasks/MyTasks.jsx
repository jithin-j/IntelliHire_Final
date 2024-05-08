import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Card } from 'antd';
import './MyTasks.css';

const { Meta } = Card;

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [refreshTasks, setRefreshTasks] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [detailedTaskModalVisible, setDetailedTaskModalVisible] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.post('http://127.0.0.1:5000/get_user_tasks', {
                    username: username,
                });
                setTasks(response.data.tasks);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setLoading(false);
            }
        };

        fetchTasks();
    }, [username, refreshTasks]);

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
            const decodedToken = parseJwt(storedToken);
            if (decodedToken) {
                setUsername(decodedToken.sub);
            }
        }
    }, []);

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    const handleTaskStatusChange = async (taskId, status) => {
        try {
            const response = await axios.post(`http://127.0.0.1:5000/update_task_status/${taskId}`, {
                status: status,
            });
            if (response.status !== 200) {
                console.error('Error updating task status:', response.data);
                return;
            }
            setRefreshTasks(!refreshTasks);
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const openDetailedTaskModal = (task) => {
        setSelectedTask(task);
        setDetailedTaskModalVisible(true);
    };

    return (
        <div>
            <h1 style={{ color: "#1E0342" }}>My Tasks</h1>
            {loading ? (
                <p>Loading tasks...</p>
            ) : (
                <div className='tasks-container'>
                    <div className='task-container'>
                        <h2>Pending Tasks</h2>
                        {tasks.filter(task => task.status === 'Pending').map(task => (
                            <Card
                                key={task.id}
                                title={task.title}
                                style={{ width: "45vw", margin: '0 10px 20px 10px' }}
                                actions={[
                                    <Button onClick={() => openDetailedTaskModal(task)}>Show Details</Button>,
                                    <Button onClick={() => handleTaskStatusChange(task.id, 'Done')}>Mark as Completed</Button>,
                                ]}
                            >
                                <Meta description={task.description} />
                                <p>Status: {task.status}</p>
                            </Card>
                        ))}
                    </div>
                    <div className='task-container'>
                        <h2>Completed Tasks</h2>
                        {tasks.filter(task => task.status === 'Done').map(task => (
                            <Card
                                key={task.id}
                                title={task.title}
                                style={{ width: "45vw", margin: '0 10px 20px 10px' }}
                                actions={[
                                    <Button onClick={() => openDetailedTaskModal(task)}>Show Details</Button>
                                ]}
                            >
                                <Meta description={task.description} />
                                <p>Status: {task.status}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <Modal
                title="Task Details"
                visible={detailedTaskModalVisible}
                onCancel={() => setDetailedTaskModalVisible(false)}
                footer={null}
            >
                {selectedTask && (
                    <div>
                        <h2>Title: {selectedTask.title}</h2>
                        <p>Description: {selectedTask.description}</p>
                        <p>Status: {selectedTask.status}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MyTasks;
