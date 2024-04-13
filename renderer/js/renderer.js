const screen = document.querySelector('#screen');
const question = document.querySelector('#question');
const go = document.querySelector('#go');
const showAnswer = document.querySelector('#showAnswer');
const answer = document.querySelector('#answer');

let filteredQuestions = [],
  media = [],
  currentIndex = [],
  temporaryValue,
  randomIndex,
  numberOfCurrentQuestion = 1;

  async function fetchMedia() {
    try {
      // Make a GET request to the specified URL
      const response = await fetch('https://in-the-know.blobsandtrees.online/wp-json/wp/v2/media');
      
      // Check if the response is successful (status code 200-299)
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      // Parse the JSON response body
      const data = await response.json();
  
      media = data.map((item) => ({ uri: item.link }));;

      screen.style.backgroundImage = "url(" + media[0].uri + ")";
    
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  

// Example function to fetch data from a URL
async function fetchData() {
  try {
    // Make a GET request to the specified URL
    const response = await fetch('https://in-the-know.blobsandtrees.online/wp-json/custom/v1/question-posts');
    
    // Check if the response is successful (status code 200-299)
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    // Parse the JSON response body
    const data = await response.json();

    filteredQuestions = data.filter((question) => question?.question);
    
    question.textContent = filteredQuestions[currentIndex]?.question;

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Call the fetchData function to initiate the request
fetchData();

// Call the fetchData function to initiate the request
fetchMedia();

const shuffleArray = (array) => {
  currentIndex = array.length;

  while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
  }

  return array;
};

const handleGoPress = () => {
  currentIndex++;
  const randomIndex = Math.floor(Math.random() * media.length);
  numberOfCurrentQuestion++;

  question.textContent = filteredQuestions[currentIndex]?.question;

  answer.style.display = "none";

  go.style.display = "none";

  showAnswer.style.display = "block";

  screen.style.backgroundImage = "url(" + media[randomIndex].uri + ")";

  if (numberOfCurrentQuestion !== filteredQuestions.length) {
      return;
  } else {
      numberOfCurrentQuestion = 1;
      currentIndex = 0;
  }
};

const handleSeeAnswerPress = () => {
  answer.textContent = filteredQuestions[currentIndex]?.answer;

  filteredQuestions[currentIndex].featured_media ? screen.style.backgroundImage = "url(" + filteredQuestions[currentIndex].featured_media + ")" : null;

  showAnswer.style.display = "none";

  answer.style.display = "block";

  go.style.display = "block";

};

go.addEventListener("click", handleGoPress);

showAnswer.addEventListener("click", handleSeeAnswerPress);

