const screen = document.querySelector('#screen');
const question = document.querySelector('#question');
const questionInput = document.querySelector('#questionInput');
const answer = document.querySelector('#answer');
const answerInput = document.querySelector('#answerInput');
const go = document.querySelector('#go');
const showAnswer = document.querySelector('#showAnswer');
const number = document.querySelector('#number');
const repeated = document.querySelector('#repeated');
const save = document.querySelector('#save');

let filteredQuestions = [],
  filteredIds = [],
  filteredRepeated = [],
  media = [],
  currentIndex = 0,
  numberOfCurrentQuestion = 1;

async function fetchMedia() {
  try {
    const response = await fetch('https://in-the-know.blobsandtrees.online/wp-json/wp/v2/media');
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    media = shuffleArray(data.map(item => ({ uri: item.link })));
    screen.style.backgroundImage = `url(${media[0].uri})`;
  } catch (error) {
    console.error('Error fetching media:', error);
  }
}

async function updateRepeated(postId, newRepeated) {
  try {
    const response = await fetch(`https://in-the-know.blobsandtrees.online/wp-json/custom/v1/update-repeated/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ new_repeated: newRepeated })
    });
    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
    const data = await response.json();
    console.log('Success:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function fetchData() {
  try {
    const response = await fetch('https://in-the-know.blobsandtrees.online/wp-json/custom/v1/question-posts');
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();

    const minRepeat = Math.min(...data.map(question => question.repeated || Infinity));
    const maxRepeat = Math.max(...data.map(question => question.repeated || 0));
    const step = 1;

    const thresholds = [];
    for (let i = minRepeat; i <= maxRepeat; i += step) {
      thresholds.push(i);
    }

    const shuffledData = shuffleArray(data.filter((item) => item?.question));

    const shuffledGroups = [];
    for (let i = 0; i < thresholds.length; i++) {
      const threshold = thresholds[i];
      const group = shuffledData.filter(question => (question.repeated || 0) == threshold);
      shuffledGroups.push(group);
    }

    const shuffledGroupsShuffled = shuffledGroups.map(group => (group));

    const shuffledDataFinal = [].concat(...shuffledGroupsShuffled);

    filteredQuestions = shuffledDataFinal;
    filteredIds = filteredQuestions.map(item => item.id);
    filteredRepeated = filteredQuestions.map(item => item.repeated);

    question.textContent = filteredQuestions[currentIndex]?.question;
    questionInput.textContent = filteredQuestions[currentIndex]?.question;
    number.textContent = numberOfCurrentQuestion + " / " + filteredQuestions.length;

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

const shuffleArray = (array) => {
  let currentIndex = array.length;
  let temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

fetchData();
fetchMedia();

const handleGoPress = () => {
  currentIndex++;
  const randomIndex = Math.floor(Math.random() * media.length);
  numberOfCurrentQuestion++;

  question.textContent = filteredQuestions[currentIndex]?.question;
  questionInput.textContent = filteredQuestions[currentIndex]?.question;

  answer.style.display = "none";
  go.style.display = "none";
  showAnswer.style.display = "block";
  screen.style.backgroundImage = `url(${media[randomIndex].uri})`;
  number.textContent = numberOfCurrentQuestion + " / " + filteredQuestions.length;
  questionInput.style.display = "none";
  answerInput.style.display = "none";

  if (numberOfCurrentQuestion !== filteredQuestions.length) {
    return;
  } else {
    numberOfCurrentQuestion = 1;
    currentIndex = 0;
  }
};

const handleSeeAnswerPress = () => {
  answer.textContent = filteredQuestions[currentIndex]?.answer;
  answerInput.textContent = filteredQuestions[currentIndex]?.answer;

  filteredQuestions[currentIndex].featured_media ? screen.style.backgroundImage = `url(${filteredQuestions[currentIndex].featured_media})` : null;
  showAnswer.style.display = "none";
  answer.style.display = "block";
  go.style.display = "block";
  repeated.textContent = filteredQuestions[currentIndex]?.repeated;
  updateRepeated(filteredIds[currentIndex], (Number(filteredQuestions[currentIndex].repeated) + 1));
  questionInput.style.display = "none";
  answerInput.style.display = "none";

  answer.style.display = "block";
  question.style.display = "block";
};

const handleDisplayQuestionInput = () => {
  questionInput.style.display = "block";
  question.style.display = "none";
  save.style.display = "block";
};

const handleDisplayAnswerInput = () => {
  answerInput.style.display = "block";
  answer.style.display = "none";
  save.style.display = "block";
};

const handleSavePress = async () => {
  const updatedQuestion = questionInput.textContent;
  const updatedAnswer = answerInput.textContent;

  try {
    const response = await fetch(`https://in-the-know.blobsandtrees.online/wp-json/custom/v1/update-question/${filteredIds[currentIndex]}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: updatedQuestion,
        answer: updatedAnswer
      })
    });
    console.log(response);
    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
    const data = await response.json();
    console.log('Success:', data);

    // filteredQuestions[currentIndex].question = updatedQuestion;
    // filteredQuestions[currentIndex].answer = updatedAnswer;

    question.textContent = updatedQuestion;
    answer.textContent = updatedAnswer;
    save.style.display = "none";
    if (answerInput.style.display === "block") {
      answer.style.display = "block";
    }
    questionInput.style.display = "none";
    answerInput.style.display = "none";
    question.style.display = "block";
  
  } catch (error) {
    console.error('Error:', error);
  }
};

go.addEventListener("click", handleGoPress);
showAnswer.addEventListener("click", handleSeeAnswerPress);
save.addEventListener("click", handleSavePress);
question.addEventListener("click", handleDisplayQuestionInput);
answer.addEventListener("click", handleDisplayAnswerInput);
