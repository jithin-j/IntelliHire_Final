import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Progress, List } from 'antd';
import './DataVisualization.css';

const DataVisualization = () => {
  const [responses, setResponses] = useState([]);
  const [averageSatisfiedScore, setAverageSatisfiedScore] = useState(0);
  const [employeeSuggestions, setEmployeeSuggestions] = useState([]);
  const twoColors = {
    '0%': '#108ee9',
    '100%': '#87d068',
  };
  const dangerColors = {
    '0%': '#f50',
    '100%': '#87d068',
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/get_all_results');
        const results = response.data.results;

        const data = results.map((result, resultIndex) => {
          const labels = JSON.parse(result.labels.replace(/'/g, '"'));
          const scores = JSON.parse(result.scores);
          const scaledScores = scores.map(score => score * 100);

          return {
            id: resultIndex,
            username: result.username,
            labels: labels,
            scores: scaledScores,
            sequence: result.sequence,
          };
        });

        setResponses(data);

        // Calculate average score for the label "Satisfied"
        let totalSatisfiedScores = 0;
        let satisfiedCount = 0;

        data.forEach(response => {
          const satisfiedIndex = response.labels.findIndex(label => label === 'Satisfied');
          if (satisfiedIndex !== -1) {
            totalSatisfiedScores += response.scores[satisfiedIndex];
          }
          satisfiedCount++;
        });

        const averageSatisfied = satisfiedCount > 0 ? totalSatisfiedScores / satisfiedCount : 0;
        setAverageSatisfiedScore(averageSatisfied);

        // Extract employee suggestions
        const suggestions = data.map(response => {
          const sequence = response.sequence;
          const suggestionIndex = sequence.indexOf('Suggestion:');
          if (suggestionIndex !== -1) {
            return sequence.substring(suggestionIndex + 'Suggestion:'.length).trim();
          }
          return '';
        });
        setEmployeeSuggestions(suggestions.filter(suggestion => suggestion !== ''));
        console.log('Employee Suggestions:', employeeSuggestions);

      } catch (error) {
        console.error('Error fetching sentiment data:', error);
      }
    };

    fetchData();
  }, [employeeSuggestions]);

  return (
    <div className='overall-container'>
      <h1>Response Summary</h1>
      <div className='response-summary'>
        <div className='average-satisfied-score'>
          <h3>Overall Employee Satisfaction</h3>
          <Progress type="circle" percent={averageSatisfiedScore.toFixed(2)} format={() => `${averageSatisfiedScore.toFixed(2)}%`} strokeColor={twoColors} size={300} />
        </div>
        <div className="suggestions-container">
          <List
            header={<h3>Employee Suggestions</h3>}
            bordered
            size={'large'}
            dataSource={employeeSuggestions}
            renderItem={(item) => (
              <List.Item>
                {item}
              </List.Item>
            )}
          />
        </div>
      </div>
      {responses.length > 0 ? (
        responses.map((response) => (
          <div key={response.id} className='response-container'>
            <h2 style={{ margin: '10px' }}>Employee: {response.username}</h2>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '3rem', justifyContent: 'center' }}>
              {response.labels.map((label, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <Progress
                    type="circle"
                    percent={response.scores[index].toFixed(2)}
                    format={() => (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0', fontSize: 'small' }}>{label}</p>
                        <p style={{ margin: '5px 0' }}>{parseFloat(response.scores[index]).toFixed(2)}%</p>
                      </div>
                    )}
                    strokeColor={label.startsWith('No') || label.startsWith('Not') || label === 'Negative' ? dangerColors : twoColors}
                  />
                </div>
              ))}
            </div>
            <h2 style={{ margin: '10px' }}>Employee Response</h2>
            <div style={{ margin: '10px' }}>
              {response.sequence.split('Question:').slice(0, -1).map((qna, index) => (
                <p key={index}>
                  {qna.trim().length > 0 && (
                    <>
                      <strong>Question:</strong> {qna.split('Answer:')[0]} <br />
                      <strong>Answer:</strong> {qna.split('Answer:')[1]} <br />
                    </>
                  )}
                </p>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default DataVisualization;
