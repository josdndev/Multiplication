// This file contains the JavaScript code that implements the functionality for practicing multiplication tables.

document.addEventListener('DOMContentLoaded', function() {
  const screen1 = document.getElementById('screen1');
  const screen2 = document.getElementById('screen2');
  const screen3 = document.getElementById('screen3');
  const numberInput = document.getElementById('numberInput'); // En modo específica: tabla a practicar; en aleatorio: valor máximo
  const rangeInput = document.getElementById('rangeInput');   // Cantidad de operaciones que tendrá la tabla
  const startButton = document.getElementById('startButton');
  const questionContainer = document.getElementById('questionContainer');
  const questionElement = document.getElementById('question');
  const optionsContainer = document.getElementById('options');
  const backButton = document.getElementById('backButton');
  const statsButton = document.getElementById('statsButton'); // Botón de estadísticas
  const statsContainer = document.getElementById('statsContainer');
  const restartButton = document.getElementById('restartButton');
  const feedback = document.getElementById('feedback');
  const resultAlert = document.getElementById('resultAlert');
  const resetTimeButton = document.getElementById('resetTimeButton');

  let gameMode = "specific"; // "specific" o "random" (se define en screen1 mediante radio buttons)
  let maxTable = 0;         // Si en aleatorio, este es el valor máximo para seleccionar tabla aleatoria
  let currentNumber = 0;    // Tabla actual (número a multiplicar)
  let currentRange = 0;     // Cantidad de operaciones en la tabla
  let currentQuestion = 1;
  let correctAnswers = 0;
  let totalQuestions = 0;
  let totalSeconds = 0;     // Tiempo acumulado en segundos

  // Para almacenamiento de estadísticas por tabla (se guarda en localStorage)
  let statsData = {}; // Ej: { "5": { attempts: 3, correct: 2 }, ... }

  // Para repetir preguntas incorrectas
  let incorrectQueue = []; // Se almacenan objetos { questionNumber, correctAnswer }
  let inReview = false;
  let reviewIndex = 0;

  // Función para persistir statsData en localStorage (JSON)
  function persistStats() {
    localStorage.setItem('statsData', JSON.stringify(statsData));
  }

  // Función para cargar estadísticas (si se desea en otra sesión)
  function loadStats() {
    const data = localStorage.getItem('statsData');
    statsData = data ? JSON.parse(data) : {};
  }

  // Función para ocultar/mostrar pantallas
  function showScreen(screen) {
    screen1.style.display = 'none';
    screen2.style.display = 'none';
    screen3.style.display = 'none';
    screen.style.display = 'block';
  }

  // Al iniciar, se lee el modo de juego de los radio buttons
  startButton.addEventListener('click', function() {
    // Lee el modo
    const modeRadios = document.getElementsByName('gameMode');
    modeRadios.forEach(radio => {
      if (radio.checked) { 
        gameMode = radio.value; 
      }
    });
    
    currentRange = parseInt(rangeInput.value);
    if (isNaN(currentRange) || currentRange <= 0) {
      feedback.textContent = 'Por favor, ingresa un rango válido.';
      return;
    }
    
    // Reinicia contadores y estadísticas
    correctAnswers = 0;
    totalQuestions = 0;
    totalSeconds = 0;
    statsData = {};
    persistStats();
    incorrectQueue = [];
    inReview = false;
    reviewIndex = 0;
    
    if (gameMode === 'specific') {
      // En modo específica, el usuario ingresa el número exacto de la tabla a practicar
      currentNumber = parseInt(numberInput.value);
      if (isNaN(currentNumber) || currentNumber <= 0) {
        feedback.textContent = 'Por favor, ingresa un número válido para la tabla.';
        return;
      }
    } else {
      // En modo aleatorio, numberInput indica el valor máximo para elegir la tabla
      maxTable = parseInt(numberInput.value);
      if (isNaN(maxTable) || maxTable <= 0) {
        feedback.textContent = 'Por favor, ingresa un número máximo válido.';
        return;
      }
      currentNumber = Math.floor(Math.random() * maxTable) + 1;
    }
    
    currentQuestion = 1;
    showScreen(screen2);
    showQuestion();
  });

  // Función para mostrar la pregunta actual (fase normal)
  function showQuestion() {
    // Si estamos en fase normal, mostramos la pregunta de la tabla actual y el número de operación
    questionContainer.style.display = 'block';
    questionElement.textContent = `${currentNumber} x ${currentQuestion} = ?`;
    optionsContainer.innerHTML = '';
    const correctAnswer = currentNumber * currentQuestion;
    const options = generateOptions(correctAnswer);
    options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'option-button';
      button.textContent = option;
      button.addEventListener('click', function() {
        checkAnswer(option, correctAnswer, false);
      });
      optionsContainer.appendChild(button);
    });
  }

  // Función para mostrar la pregunta en modo revisión (respuestas incorrectas)
  function showReviewQuestion() {
    // reviewIndex indica qué pregunta de review mostramos
    const reviewItem = incorrectQueue[reviewIndex];
    questionContainer.style.display = 'block';
    questionElement.textContent = `${currentNumber} x ${reviewItem.questionNumber} = ?`;
    optionsContainer.innerHTML = '';
    const correctAnswer = reviewItem.correctAnswer;
    const options = generateOptions(correctAnswer);
    options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'option-button';
      button.textContent = option;
      button.addEventListener('click', function() {
        // En modo review, se comprueba pero no se vuelve a encolar (aún se registra el intento)
        checkAnswer(option, correctAnswer, true);
      });
      optionsContainer.appendChild(button);
    });
  }

  // Genera 4 opciones (incluyendo la correcta, en orden aleatorio)
  function generateOptions(correctAnswer) {
    const options = [correctAnswer];
    while (options.length < 4) {
      const randomOption = Math.floor(Math.random() * (currentNumber * currentRange)) + 1;
      if (!options.includes(randomOption)) {
        options.push(randomOption);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  }

  // Verifica la respuesta y actualiza estadísticas. El parámetro isReview indica si se trata de una pregunta de revisión.
  function checkAnswer(selectedAnswer, correctAnswer, isReview) {
    totalQuestions++;
    
    // Actualiza estadísticas para la tabla actual
    if (!statsData[currentNumber]) {
      statsData[currentNumber] = { attempts: 0, correct: 0 };
    }
    statsData[currentNumber].attempts++;
    
    if (selectedAnswer === correctAnswer) {
      correctAnswers++;
      statsData[currentNumber].correct++;
      totalSeconds += 30;  // Suma 30 segundos por respuesta correcta
      resultAlert.textContent = '¡Correcto!';
      resultAlert.className = 'result-alert success';
    } else {
      // Resta 30 segundos; se evita que totalSeconds sea negativo.
      totalSeconds = Math.max(totalSeconds - 30, 0);
      resultAlert.textContent = `Incorrecto. La respuesta correcta es ${correctAnswer}.`;
      resultAlert.className = 'result-alert error';
      // Si no es revisión, encola la pregunta para repetirla luego
      if (!isReview) {
        // Guarda el número de la operación y la respuesta correcta
        incorrectQueue.push({ questionNumber: currentQuestion, correctAnswer: correctAnswer });
      }
    }
    
    persistStats();
    resultAlert.style.display = 'block';
    
    setTimeout(function() {
      resultAlert.style.display = 'none';
      if (!inReview) {
        if (currentQuestion < currentRange) {
          currentQuestion++;
          showQuestion();
        } else {
          // Final de fase normal: si hay preguntas incorrectas, iniciamos la revisión
          if (incorrectQueue.length > 0) {
            inReview = true;
            reviewIndex = 0;
            showReviewQuestion();
          } else {
            finishTable();
          }
        }
      } else {
        // Estamos en modo revisión
        if (reviewIndex < incorrectQueue.length - 1) {
          reviewIndex++;
          showReviewQuestion();
        } else {
          // Termina la revisión y finaliza la tabla
          inReview = false;
          finishTable();
        }
      }
    }, 1500);
  }

  // Función para manejar el final de una tabla
  function finishTable() {
    // En modo aleatorio, seguimos con una nueva tabla;
    // en modo específica, finalizamos la sesión y mostramos estadísticas.
    if (gameMode === 'random') {
      currentNumber = Math.floor(Math.random() * maxTable) + 1;
      currentQuestion = 1;
      // Reiniciamos la cola de revisión para la nueva tabla
      incorrectQueue = [];
      showQuestion();
    } else {
      // En modo específica se termina la sesión tras la revisión de la tabla
      showStats();
      showScreen(screen3);
    }
  }

  statsButton.addEventListener('click', function() {
    showStats();
    showScreen(screen3);
  });

  backButton.addEventListener('click', function() {
    showScreen(screen1);
  });

  restartButton.addEventListener('click', function() {
    showScreen(screen1);
  });

  // Muestra estadísticas generales y el detalle (por cada tabla, el porcentaje de aciertos)
  function showStats() {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    let statsHTML = `
      <p>Preguntas correctas: ${correctAnswers} / ${totalQuestions}</p>
      <p>Tiempo acumulado: ${minutes} minuto(s) y ${seconds} segundo(s)</p>
      <h2>Detalle por tabla:</h2>
      <ul>
    `;
    for (const table in statsData) {
      const data = statsData[table];
      const percent = ((data.correct / data.attempts) * 100).toFixed(1);
      statsHTML += `<li>Tabla del ${table}: ${data.correct} de ${data.attempts} (${percent}%)</li>`;
    }
    statsHTML += `</ul>`;
    statsContainer.innerHTML = statsHTML;
  }

  if (resetTimeButton) {
    resetTimeButton.addEventListener('click', function() {
      totalSeconds = 0;
      alert("Tiempo reiniciado a 0 segundos.");
    });
  }
});

