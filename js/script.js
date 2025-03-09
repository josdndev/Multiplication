// This file contains the JavaScript code that implements the functionality for practicing multiplication tables.

document.addEventListener('DOMContentLoaded', function() {
    const screen1 = document.getElementById('screen1');
    const screen2 = document.getElementById('screen2');
    const screen3 = document.getElementById('screen3');
    const numberInput = document.getElementById('numberInput'); // Valor máximo para tabla
    const rangeInput = document.getElementById('rangeInput');   // Cantidad de operaciones de la tabla
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

    let maxTable = 0;           // Valor máximo para elegir la tabla aleatoriamente
    let currentNumber = 0;      // Tabla actual (número a multiplicar)
    let currentRange = 0;       // Cantidad de operaciones en la tabla
    let currentQuestion = 1;
    let correctAnswers = 0;
    let totalQuestions = 0;
    let totalSeconds = 0;       // Tiempo acumulado en segundos

    // Nuevo objeto para almacenar estadísticas por cada tabla
    // Se guardará en localStorage para simular una mini base de datos.
    let statsData = {}; // Ej: { "5": { attempts: 3, correct: 2 }, "7": { attempts: 4, correct: 4 } }

    // Función para persistir statsData en localStorage (almacena en formato JSON)
    function persistStats() {
        localStorage.setItem('statsData', JSON.stringify(statsData));
    }

    // Función para cargar estadísticas (si deseas recuperarlas en otra sesión)
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

    // Inicia la práctica
    startButton.addEventListener('click', function() {
        maxTable = parseInt(numberInput.value);
        currentRange = parseInt(rangeInput.value);
        if (isNaN(maxTable) || maxTable <= 0 || isNaN(currentRange) || currentRange <= 0) {
            feedback.textContent = 'Por favor, ingresa números positivos válidos.';
            return;
        }
        feedback.textContent = '';
        correctAnswers = 0;
        totalQuestions = 0;
        totalSeconds = 0;
        statsData = {}; // Reiniciamos las estadísticas
        persistStats(); // Guardamos la información inicial
        // Selecciona aleatoriamente la primera tabla (valor entre 1 y maxTable)
        currentNumber = Math.floor(Math.random() * maxTable) + 1;
        currentQuestion = 1;
        showScreen(screen2);
        showQuestion();
    });

    // Función para mostrar la pregunta actual
    function showQuestion() {
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
                checkAnswer(option, correctAnswer);
            });
            optionsContainer.appendChild(button);
        });
    }

    // Genera 4 opciones (incluyendo la correcta, ordenadas aleatoriamente)
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

    // Verifica la respuesta, actualiza estadísticas y avanza de forma ininterrumpida
    function checkAnswer(selectedAnswer, correctAnswer) {
        totalQuestions++;
        // Actualiza las estadísticas para la tabla actual
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
            resultAlert.textContent = `Incorrecto. La respuesta correcta es ${correctAnswer}.`;
            resultAlert.className = 'result-alert error';
        }
        // Persiste el cambio en las estadísticas
        persistStats();
        resultAlert.style.display = 'block';
        setTimeout(function() {
            resultAlert.style.display = 'none';
            if (currentQuestion < currentRange) {
                currentQuestion++;
                showQuestion();
            } else {
                // Termina la tabla actual y escoge una nueva tabla aleatoria
                currentNumber = Math.floor(Math.random() * maxTable) + 1;
                currentQuestion = 1;
                showQuestion();
            }
        }, 1500);
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

    // Muestra estadísticas detalladas, incluyendo el porcentaje de aciertos por cada multiplicación.
    function showStats() {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        let statsHTML = `
            <p>Preguntas correctas: ${correctAnswers} / ${totalQuestions}</p>
            <p>Tiempo acumulado: ${minutes} minuto(s) y ${seconds} segundo(s)</p>
            <h2>Detalle por tabla:</h2>
            <ul>
        `;
        // Itera sobre cada tabla en statsData
        for (const table in statsData) {
            const data = statsData[table];
            const percent = ((data.correct / data.attempts) * 100).toFixed(1);
            statsHTML += `<li>Tabla del ${table}: ${data.correct} de ${data.attempts} (${percent}%)</li>`;
        }
        statsHTML += `</ul>`;
        statsContainer.innerHTML = statsHTML;
    }
});