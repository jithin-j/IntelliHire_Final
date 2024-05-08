import React from 'react';
import { useLocation } from 'react-router-dom';
import { List, Progress } from 'antd';
import "./ResumeResults.css";

const twoColors = {
    '0%': '#108ee9',
    '100%': '#87d068',
};

const ResumeResults = () => {
    const location = useLocation();
    const { apiResponse } = location.state;

    // const parseCategories = (categoriesString) => {
    //     // Parse the string representation of list of lists
    //     const categories = JSON.parse(categoriesString);
    //     // Flatten the list of lists
    //     const flattenedCategories = categories.flat();
    //     const validJsonStr = flattenedCategories[0].replace(/'/g, '"');

    //     // Parse the string into an array
    //     const arr = JSON.parse(validJsonStr);
    //     //Remove the duplicate elements from arr 
    //     const uniqueArr = [...new Set(arr)];
    //     return (
    //         <ul>
    //             {uniqueArr.map((category, index) => (
    //                 <Tag color="blue">{category}</Tag>
    //             ))}
    //         </ul>
    //     );
    // };

    return (
        <div className='rank-results'>
            <h2>Results</h2>
            <List
                itemLayout="horizontal"
                dataSource={apiResponse}
                renderItem={(result, index) => (
                    <List.Item key={index}>
                        <div className='resume_data'>
                            <p>Resume {index + 1}</p>
                            <div className="category-list">
                                <p>Category:</p>
                                <div className="category-tags">
                                    {result.predicted_category}
                                </div>
                            </div>
                            <a href={`http://127.0.0.1:5000/${result.file_link}`} target="_blank" rel="noreferrer">View resume</a>
                            <div className='score-card'>
                                <p>Score:</p>
                                <Progress percent={Math.round(result.similarity_score * 10000) / 100} strokeColor={twoColors} className='progress-bar' />
                            </div>
                        </div>
                        {/* Display other properties of the result object */}
                    </List.Item>
                )}
            />
        </div>
    );
};

export default ResumeResults;
