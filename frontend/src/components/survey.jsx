import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './survey.css';
// import NavBar from './NavBar/NavBar';

const EmployeeSentimentSurvey = () => {
  const [formData, setFormData] = useState({});
  const [username, setUsername] = useState('');
  const navigate = useNavigate(); // Initialize the useNavigate hook

  useEffect(() => {
    // Retrieve username from the token in local storage
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      // Decode the JWT token to get user information
      const decodedToken = parseJwt(storedToken);
      console.log(decodedToken);
      if (decodedToken) {
        setUsername(decodedToken.sub);
      }
    }
  }, []);

  const questions = [
    'How satisfied are you with your current work environment?',
    'What aspects of your job do you find most fulfilling?',
    'Are you provided with enough opportunities for professional growth and development?',
    'How well do you feel your contributions are recognized?',
    'How comfortable are you in sharing your ideas and feedback with your team?',
    'Are there any suggessions you would like to share?'
  ];

  const handleChange = (e, question) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [question]: value,
    }));
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Construct the responses paragraph with each question followed by its corresponding answer
      const responsesParagraph = questions.map((question, index) => {
        const answer = formData[question] || 'N/A'; // If no answer is provided, use 'N/A'
        const responsePrefix = index === questions.length - 1 ? "Suggestion: " : "Answer: ";
        return `Question: ${question}\n${responsePrefix}${answer}`;
      }).join('\n\n'); // Separate each question-answer pair by two line breaks
      console.log(responsesParagraph);
      // Send the responses as a paragraph to the backend using Axios
      await axios.post('http://127.0.0.1:5000/query', {
        inputs: responsesParagraph,
        parameters: {
          candidate_labels: ["Satisfied", "Not Satisfied", "Fulfilling", "Not Fulfilling", "Opportunities", "No Opportunities", "Good Recognition", "No Recognition", "Comfortable", "Not Comfortable"],
          multi_label: true
        },
        username: username
      });

      // Reset the form after successful submission
      setFormData({});

      // Redirect to the Data Visualization page after successful submission
      navigate('/home');

    } catch (error) {
      console.error('Error submitting form:', error);
      window.alert('Error submitting form. Please try again.');
    }
  };

  return (
    <div>
      {/* <NavBar /> */}
      <h1>Employee Survey</h1>
      <form onSubmit={handleSubmit} className='survey-form'>
        {questions.map((question, index) => (
          <div key={index}>
            <label className="question">
              {question}
              <textarea
                value={formData[question] || ''}
                onChange={(e) => handleChange(e, question)}
              />
            </label>
            <br />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default EmployeeSentimentSurvey;
