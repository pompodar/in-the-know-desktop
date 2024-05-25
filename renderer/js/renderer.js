const screen = document.querySelector('#screen');
const question = document.querySelector('#question');
const go = document.querySelector('#go');
const showAnswer = document.querySelector('#showAnswer');
const answer = document.querySelector('#answer');
const number = document.querySelector('#number');
const repeated = document.querySelector('#repeated');

let filteredQuestions = [],
  filteredIds = [],
  filteredRepeated = [],
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
  
      media = shuffleArray(data.map((item) => ({ uri: item.link })));

      screen.style.backgroundImage = "url(" + media[0].uri + ")";
    
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function updateRepeated(postId, newRepeated) {
    const url = `https://in-the-know.blobsandtrees.online/wp-json/custom/v1/update-repeated/${postId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ new_repeated: newRepeated })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        console.log('Success:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}
  

async function fetchData() {
  try {
    const response = await fetch('https://in-the-know.blobsandtrees.online/wp-json/custom/v1/question-posts');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();

    // Shuffle the data array
    const shuffledData = shuffleArray(data);

    // Extract filteredQuestions, filteredIds, and filteredRepeateds from the shuffled array
    filteredQuestions = shuffledData.filter((question) => question?.question);
    filteredIds = filteredQuestions.map(item => item.id);
    filteredRepeateds = filteredQuestions.map(item => item.repeated);

    question.textContent = filteredQuestions[currentIndex]?.question;
    number.textContent = numberOfCurrentQuestion + " / " + filteredQuestions.length;

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Shuffle function
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

// Call the fetchData function to initiate the request
fetchData();

// Call the fetchData function to initiate the request
fetchMedia();

const handleGoPress = () => {
  currentIndex++;
  const randomIndex = Math.floor(Math.random() * media.length);
  numberOfCurrentQuestion++;

  question.textContent = filteredQuestions[currentIndex]?.question;

  answer.style.display = "none";

  go.style.display = "none";

  showAnswer.style.display = "block";

  screen.style.backgroundImage = "url(" + media[randomIndex].uri + ")";

  number.textContent = numberOfCurrentQuestion + " / " + filteredQuestions.length;

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

  repeated.textContent = filteredQuestions[currentIndex]?.repeated;

  updateRepeated(filteredIds[currentIndex], (Number(filteredQuestions[currentIndex].repeated) + 1));

};

go.addEventListener("click", handleGoPress);

showAnswer.addEventListener("click", handleSeeAnswerPress);

