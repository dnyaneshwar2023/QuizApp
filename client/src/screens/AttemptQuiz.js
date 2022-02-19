import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";
import AttemptedModal from "./AttemptedModal";
import axios from "axios";
import { useParams } from "react-router-dom";
import CountDownTimer from "../components/CountDownTimer";
const AttemptQuiz = ({ match }) => {
  const { quizCode } = useParams();
  const [questions, setQuestions] = useState([]);
  const [attemptedQuestions, setAttemptedQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      const res = await axios.post("/API/quizzes/join", { quizid: quizCode });
      const quizData = res.data;
      console.log(quizData);
      setQuestions(quizData.data);
      const attempted = quizData.data.filter((question) => {
        return -1;
      });
      setAttemptedQuestions(attempted);
      setQuizTitle(quizData.title);
      setLoading(false);
    };
    fetchQuiz();
  }, [quizCode]);

  const handleOptionSelect = (e, option, index) => {
    const temp = [...attemptedQuestions];
    temp[index] = option;
    setAttemptedQuestions(temp);
  };

  const submitQuiz = async () => {
    const res = await axios.post("/API/quizzes/submit", {
      quizid: quizCode,
      responses: attemptedQuestions,
    });
    console.log(res);
    if (res.data.ok) {
      setResult(res.data.score);
      setShowModal(true);
    }
  };

  if (loading) return <LoadingScreen />;
  // For Quiz not Found
  if (quizTitle === "ERR:QUIZ_NOT_FOUND")
    return (
      <div className="loading">
        <h1>404 Quiz Not Found!</h1>
        <div id="logo-name">
          <b>Quiz</b>ify
        </div>
        <h3>
          Go back to <Link to="/join-quiz">Join Quiz </Link>Page.
        </h3>
      </div>
    );
  // For Quiz not accessible
  else if (quizTitle === "ERR:QUIZ_ACCESS_DENIED")
    return (
      <div className="loading">
        <h2>
          Quiz Access is Not Granted by the Creator. Please contact Quiz
          Creator.
        </h2>
        <div id="logo-name">
          <b>Quiz</b>ify
        </div>
        <h3>
          Go back to <Link to="/join-quiz">Join Quiz </Link>Page.
        </h3>
      </div>
    );
  else if (quizTitle === "ERR:QUIZ_ALREADY_ATTEMPTED")
    return (
      <div className="loading">
        <h2>You have already taken the Quiz.</h2>
        <div id="logo-name">
          <b>Quiz</b>ify
        </div>
        <h3>
          Go back to <Link to="/join-quiz">Join Quiz </Link>Page.
        </h3>
      </div>
    );
  else
    return (
      <div id="main-body">
        <CountDownTimer
          minutes={20}
          handleExpire={submitQuiz}
          style={{
            position: "fixed",
            right: 10,
            bottom: 20,
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        />
        <div id="create-quiz-body">
          <div className="quiz-header">
            <h2>{quizTitle}</h2>
          </div>
          {questions.map((question, index) => (
            <div className="attempQuestionCard" key={index}>
              <div id="title">{question.statement}</div>
              <div className="option-div">
                {question.options.map((option, ind) => (
                  <div className="option" key={ind}>
                    <input
                      type="radio"
                      name={`option${index}`}
                      onChange={(e) => handleOptionSelect(e, ind, index)}
                    />
                    <label className="label" style={{ padding: "0px 5px" }}>
                      {option.text}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button className="button wd-200" onClick={submitQuiz}>
            Submit
          </button>
          <AttemptedModal
            result={result}
            showModal={showModal}
            totalScore={questions.length}
          />
        </div>
      </div>
    );
};

export default AttemptQuiz;
