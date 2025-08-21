document.addEventListener('DOMContentLoaded', () => {
    // 游戏状态变量
    let isGameStarted = false;
    let score = 0;
    let timer = 60; // 设置为1分钟
    let timerInterval;
    let currentWordIndex = -1;
    let currentOptions = [];
    let correctAnswer = '';
    let usedWordIndices = []; // 记录已使用的单词索引
    let wrongWords = []; // 记录错误的单词及正确定义

    // 合并所有单词为一个库
    const wordLibrary = [
        { word: 'button', definition: 'n.按键，纽扣' },
        { word: 'click', definition: 'n.点击,单击,咔哒声 vt.& vi.使发出咔哒声；点击，单击' },
        { word: 'goods', definition: 'n.商品，货品，私人财产' },
        { word: 'instant', definition: 'adj.立即的，立刻的；方便的 n.瞬间，片刻；某一时刻' },
        { word: 'access', definition: 'vt.到达，进入，使用 n.机会，权利，入径，通道' },
        { word: 'affair', definition: 'n.公共事务，政治事务，事件，事情' },
        { word: 'aware', definition: 'adj.知道，意识到；察觉到，发觉；有…意识的' },
        { word: 'deliver', definition: 'vt.递送，传送；发表，宣布；交出' },
        { word: 'extent', definition: 'n.程度，限度，范围' },
        { word: 'majority', definition: 'n.大部分，大多数，多数票' },
        { word: 'obviously', definition: 'adv.显然，明显地' },
        { word: 'recipe', definition: 'n.食谱，方法，秘诀' },
        { word: 'arrangement', definition: 'n.安排；布置； 约定；排列' },
        { word: 'establish', definition: 'vt.建立(关系或联系)；设立；确立；使得到认可；查实，确定' },
        { word: 'frontier', definition: 'n.国界，边缘，尖端，边缘' }
    ];

    // DOM 元素
    const wordElement = document.getElementById('word');
    const option1 = document.getElementById('option1');
    const option2 = document.getElementById('option2');
    const option3 = document.getElementById('option3');
    const option4 = document.getElementById('option4');
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    const feedbackElement = document.getElementById('feedback');
    const startButton = document.getElementById('start-btn');
    const resetButton = document.getElementById('reset-btn');
    const endButton = document.getElementById('end-btn');
    const musicToggle = document.getElementById('music-toggle');
    const backgroundMusic = document.getElementById('background-music');

    const difficultySelect = document.getElementById('difficulty');
    const wrongWordsContainer = document.querySelector('.wrong-words-container');
    const wrongWordsList = document.getElementById('wrong-words-list');
    const volumeSlider = document.getElementById('volume-slider');
    let isMusicPlaying = false;

    // 事件监听器
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);
    endButton.addEventListener('click', endGame);
    musicToggle.addEventListener('click', toggleMusic);
    option1.addEventListener('click', () => checkAnswer(option1));
    option2.addEventListener('click', () => checkAnswer(option2));
    option3.addEventListener('click', () => checkAnswer(option3));
    option4.addEventListener('click', () => checkAnswer(option4));
    
    // 音量控制
    if (volumeSlider) {
        volumeSlider.addEventListener('input', () => {
            backgroundMusic.volume = volumeSlider.value;
        });
    }

    // 切换音乐播放状态
    function toggleMusic() {
        // 停止所有音频
        document.querySelectorAll('audio').forEach(audio => {
            audio.pause();
        });

        if (isMusicPlaying) {
            musicToggle.textContent = '音乐';
        } else {
            backgroundMusic.volume = 0.1; // 设置更低音量
            backgroundMusic.currentTime = 0; // 确保从开头播放
            backgroundMusic.play().catch(e => {
                console.log('播放音乐失败:', e);
                feedbackElement.textContent = '音乐播放失败，请点击音乐按钮重试';
                setTimeout(() => {
                    feedbackElement.textContent = '';
                }, 3000);
            });
            musicToggle.textContent = '静音';
        }
        isMusicPlaying = !isMusicPlaying;
    }

    // 开始游戏
    function startGame() {
        if (isGameStarted) return;

        isGameStarted = true;
        score = 0;
        timer = 60; // 设置为1分钟
        scoreElement.textContent = score;
        timerElement.textContent = timer;
        feedbackElement.textContent = '';
        startButton.disabled = true;
        resetButton.disabled = true; // 游戏进行中禁用重新开始按钮
        endButton.disabled = false; // 游戏开始后启用结束按钮
        difficultySelect.disabled = true;

        // 如果音乐未播放，自动开始播放
        if (!isMusicPlaying) {
            toggleMusic();
        }

        // 启动计时器
        timerInterval = setInterval(() => {
            timer--;
            timerElement.textContent = timer;

            if (timer <= 0) {
                endGame();
            }
        }, 1000);

        // 加载第一个单词
        loadNextWord();
    }

    // 结束游戏
    function endGame() {
        isGameStarted = false;
        clearInterval(timerInterval);
        feedbackElement.textContent = `游戏结束！你的得分是: ${score}`;
        startButton.disabled = false;
        resetButton.disabled = false; // 游戏结束后启用重新开始按钮
        endButton.disabled = true; // 游戏结束后禁用结束按钮
        // 隐藏难度选择器
        difficultySelect.style.display = 'none';

        // 游戏结束时不自动停止音乐，让用户手动控制
        // 保持低音量
        backgroundMusic.volume = 0.1;

        // 显示错误单词
        if (wrongWords.length > 0) {
            wrongWordsContainer.style.display = 'block';
            wrongWordsList.innerHTML = '';
            
            wrongWords.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="wrong-word">${item.word}</span>: 
                    你的选择: ${item.selected} <br>
                    正确答案: <span class="correct-definition">${item.definition}</span>
                `;
                wrongWordsList.appendChild(li);
            });
        } else {
            wrongWordsContainer.style.display = 'none';
        }

        // 移除所有选项的点击效果
        [option1, option2, option3, option4].forEach(option => {
            option.classList.remove('correct', 'incorrect');
        });
    }

    // 重置游戏
    function resetGame() {
        if (isGameStarted) return; // 确保只有在游戏结束后才能重置
        endGame();
        // 清空已使用的单词索引记录，确保重新开始时顺序不同
        usedWordIndices = [];
        // 清空错误单词记录
        wrongWords = [];
        // 隐藏错误单词容器
        wrongWordsContainer.style.display = 'none';
        // 保持低音量
        backgroundMusic.volume = 0.1;
        // 额外添加随机种子，增加随机性
        Math.random();
        startGame();
    }

    // 加载下一个单词
    function loadNextWord() {
        const words = wordLibrary;

        // 如果所有单词都已使用过，重置使用记录
        if (usedWordIndices.length >= words.length) {
            usedWordIndices = [];
        }

        // 随机选择一个未使用过的单词
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * words.length);
        } while (usedWordIndices.includes(randomIndex));

        // 记录已使用的单词索引
        usedWordIndices.push(randomIndex);
        currentWordIndex = randomIndex;
        const currentWord = words[currentWordIndex];
        wordElement.textContent = currentWord.word;
        correctAnswer = currentWord.definition;

        // 生成选项
        generateOptions(currentWord, words);

        // 重置反馈和选项样式
        feedbackElement.textContent = '';
        [option1, option2, option3, option4].forEach(option => {
            option.classList.remove('correct', 'incorrect');
        });
    }

    // 生成选项
    function generateOptions(correctWord, allWords) {
        // 复制所有单词
        const allDefinitions = [...allWords].map(word => word.definition);
        // 移除正确答案
        const filteredDefinitions = allDefinitions.filter(def => def !== correctWord.definition);
        // 随机选择3个干扰项
        const distractors = [];
        while (distractors.length < 3) {
            const randomIndex = Math.floor(Math.random() * filteredDefinitions.length);
            if (!distractors.includes(filteredDefinitions[randomIndex])) {
                distractors.push(filteredDefinitions[randomIndex]);
            }
        }

        // 合并正确答案和干扰项
        currentOptions = [correctAnswer, ...distractors];
        // 使用增强的Fisher-Yates洗牌算法确保随机性
        for (let i = currentOptions.length - 1; i > 0; i--) {
            // 添加额外的随机性
            const j = Math.floor(Math.random() * Math.random() * (i + 1));
            [currentOptions[i], currentOptions[j]] = [currentOptions[j], currentOptions[i]];
        }

        // 显示选项
        option1.textContent = currentOptions[0];
        option2.textContent = currentOptions[1];
        option3.textContent = currentOptions[2];
        option4.textContent = currentOptions[3];
    }

    // 检查答案
    function checkAnswer(selectedOption) {
        if (!isGameStarted) return;

        const selectedDefinition = selectedOption.textContent;

        // 禁用所有选项点击
        [option1, option2, option3, option4].forEach(option => {
            option.style.pointerEvents = 'none';
        });

        if (selectedDefinition === correctAnswer) {
            // 回答正确
            selectedOption.classList.add('correct');
            score += 10;
            scoreElement.textContent = score;
            feedbackElement.textContent = '正确！';
            feedbackElement.style.color = '#2ecc71';


        } else {
            // 回答错误
            selectedOption.classList.add('incorrect');
            // 显示正确答案
            [option1, option2, option3, option4].forEach(option => {
                if (option.textContent === correctAnswer) {
                    option.classList.add('correct');
                }
            });
            feedbackElement.textContent = `错误！正确答案是: ${correctAnswer}`;
            feedbackElement.style.color = '#e74c3c';

            // 记录错误单词
            const currentWord = wordLibrary[currentWordIndex];
            wrongWords.push({
                word: currentWord.word,
                definition: currentWord.definition,
                selected: selectedDefinition
            });
        }

        // 延迟后加载下一个单词
        setTimeout(() => {
            // 恢复选项点击
            [option1, option2, option3, option4].forEach(option => {
                option.style.pointerEvents = 'auto';
            });
            loadNextWord();
        }, 1500);
    }
});