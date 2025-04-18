const people = [
    { 
        id: 'diana', 
        name: 'Диана', 
        birthday: '2002-07-09', 
        colors: {
            physical: '#FF0000',   
            emotional: '#d94646',   
            intellectual: '#55080d'  
        }
    },
    { 
        id: 'kashtanka', 
        name: 'Каштанка', 
        birthday: '2008-08-17', 
        colors: {
            physical: '#bd00db',   
            emotional: '#e350e8',  
            intellectual: '#760b7d' 
        }
    },
    { 
        id: 'lera', 
        name: 'Лера', 
        birthday: '2005-02-28', 
        colors: {
            physical: '#00FF00',   
            emotional: '#66FF66', 
            intellectual: '#036706' 
        }
    },
    { 
        id: 'lima', 
        name: 'Лима', 
        birthday: '2008-07-30', 
        colors: {
            physical: '#FFFF00',   
            emotional: '#FFFF66',  
            intellectual: '#a1a100' 
        }
    },
    { 
        id: 'masha', 
        name: 'Маша', 
        birthday: '1996-12-19', 
        colors: {
            physical: '#f15f7e',   
            emotional: '#F48FB1',  
            intellectual: '#F8BBD0'
        }
    },
    { 
        id: 'sonya', 
        name: 'Соня', 
        birthday: '2008-08-27', 
        colors: {
            physical: '#0000FF',   
            emotional: '#6666FF',  
            intellectual: '#AAAAFF' 
        }
    },
    { 
        id: 'dasha', 
        name: 'Даша', 
        birthday: '2005-10-24', 
        colors: {
            physical: '#FFA500',   
            emotional: '#FFBB33',  
            intellectual: '#FFD27F' 
        }
    },
    { 
        id: 'zhaniya', 
        name: 'Жания', 
        birthday: '2005-03-12', 
        colors: {
            physical: '#e4c482',  
            emotional: '#b08354', 
            intellectual: '#9c662d' 
        }
    },
    { 
        id: 'leriya', 
        name: 'Лерия', 
        birthday: '2005-03-08', 
        colors: {
            physical: '#00bda1',   
            emotional: '#a2dcd1',  
            intellectual: '#275653' 
        }
    }
];
  
const biorhythmTypes = [
    { id: 'physical', name: 'Физический', cycle: 23 },
    { id: 'emotional', name: 'Эмоциональный', cycle: 28 },
    { id: 'intellectual', name: 'Интеллектуальный', cycle: 33 }
];
  
const dateInput = document.querySelector("#target-date");
const rangeInput = document.getElementById("range-days");
const canvas = document.getElementById("biorhythm-chart");
const ctx = canvas.getContext("2d");
const peopleCheckboxes = document.getElementById("people-checkboxes");
  
// Инициализация чекбоксов для людей
people.forEach(person => {
    const label = document.createElement('label');
    label.innerHTML = `
        <input type="checkbox" class="person-checkbox" value="${person.id}" checked>
        <span class="checkmark"></span>
        <span class="person-name" style="color: ${person.colors.physical}">${person.name}</span>
    `;
    peopleCheckboxes.appendChild(label);
});

  
const today = new Date();
dateInput.value = today.toISOString().split("T")[0];
  
function fixCanvasDPI() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Масштабирование
}

  
function calculateDays(birthDate, targetDate) {
    const diffMs = targetDate - new Date(birthDate);
    const msPerDay = 24 * 60 * 60 * 1000;
    return diffMs / msPerDay;
}
  
function calculateBiorhythm(days, cycle) {
    return Math.sin((2 * Math.PI * days) / cycle);
}
  
function drawAxes(centerY, width, height, range, targetDate) {
    const marginX = 20;
  
    // Ось X
    ctx.strokeStyle = "#bbb";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
  
    // Вертикальная линия текущей даты
    const highlightX = marginX + (range / (range * 2)) * (width - 2 * marginX);
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(highlightX, 0);
    ctx.lineTo(highlightX, height);
    ctx.stroke();
  
    // Подписи дат на оси X
    const approxLabelSpacing = 60;
    const maxLabels = Math.floor((width - 2 * marginX) / approxLabelSpacing);
    const stepX = Math.max(1, Math.floor((range * 2) / maxLabels));
    const totalSteps = Math.floor((range * 2) / stepX);
  
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#aaa";
    ctx.textAlign = "center";
  
    for (let i = 0; i <= totalSteps; i++) {
        const dayOffset = -range + i * stepX;
        const x = marginX + ((dayOffset + range) / (range * 2)) * (width - 2 * marginX);
        const labelDate = new Date(targetDate);
        labelDate.setDate(labelDate.getDate() + dayOffset);
        const label = labelDate.toLocaleDateString("ru-RU").slice(0, 5);
        ctx.fillText(label, x, centerY + 24);
    }
  
    // Подписи значений на оси Y
    ctx.textAlign = "left";
    const ySteps = 4;
    for (let i = -ySteps; i <= ySteps; i++) {
        const y = centerY - (i / ySteps) * (height * 0.4);
        ctx.fillStyle = "#999";
        ctx.fillText((i / ySteps).toFixed(1), 5, y - 2);
    }
}
  
let animationFrame;
let currentFrame = 0;
const maxFrames = 60;
let prevData = [];
  
function drawGraph() {
    cancelAnimationFrame(animationFrame);
    currentFrame = 0;
    fixCanvasDPI();
  
    const targetDate = new Date(dateInput.value);
    const range = parseInt(rangeInput.value) || 5;
    const width = canvas.getBoundingClientRect().width;
    const height = canvas.getBoundingClientRect().height;
    const centerY = height / 2;
    const amplitude = height * 0.4;
    const marginX = 20;
  
    // Получаем выбранных людей и типы биоритмов
    const selectedPeople = people.filter(person => 
        document.querySelector(`.person-checkbox[value="${person.id}"]`).checked
    );
    
    const selectedBiorhythms = biorhythmTypes.filter(type => 
        document.querySelector(`.biorhythm-type[value="${type.id}"]`).checked
    );
  
    const newData = [];
    
    selectedPeople.forEach(person => {
        const baseDaysPassed = calculateDays(person.birthday, targetDate);
        const personData = [];
        
        selectedBiorhythms.forEach(biorhythm => {
            const data = [];
            for (let x = 0; x <= width; x++) {
                const plotX = marginX + (x / width) * (width - 2 * marginX);
                const dayOffset = ((plotX - marginX) / (width - 2 * marginX)) * range * 2 - range;
                const daysPassed = baseDaysPassed + dayOffset;
                const value = calculateBiorhythm(daysPassed, biorhythm.cycle);
                const y = centerY - value * amplitude;
                data.push(y);
            }
            personData.push(data);
        });
        
        newData.push({
            person,
            biorhythms: selectedBiorhythms,
            data: personData
        });
    });
  
    if (!prevData.length) {
        prevData = newData;
    }
  
    function animate() {
        ctx.clearRect(0, 0, width, height);
        drawAxes(centerY, width, height, range, targetDate);
    
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
    
        newData.forEach((personObj, personIdx) => {
            const person = personObj.person;
            const biorhythms = personObj.biorhythms;
            
            biorhythms.forEach((biorhythm, bioIdx) => {
                // Используем индивидуальный цвет для каждого типа биоритма
                ctx.strokeStyle = person.colors[biorhythm.id];
                ctx.beginPath();
                
                for (let x = 0; x <= width; x++) {
                    // Проверяем, существуют ли предыдущие данные для этого биоритма
                    const prevBioData = prevData[personIdx]?.data?.[bioIdx];
                    const y = prevBioData ? prevBioData[x] : personObj.data[bioIdx][x];
                    const targetY = personObj.data[bioIdx][x];
                    const currentY = prevBioData 
                        ? y + (targetY - y) * (currentFrame / maxFrames)
                        : targetY;
                    
                    if (x === 0) ctx.moveTo(x, currentY);
                    else ctx.lineTo(x, currentY);
                }
                ctx.stroke();
            });
        });
    
        if (currentFrame < maxFrames) {
            currentFrame++;
            animationFrame = requestAnimationFrame(animate);
        } else {
            prevData = newData;
            currentFrame = 0;
        }
    }
  
    animate();
}
  
// Обработчики событий
dateInput.addEventListener("input", drawGraph);
rangeInput.addEventListener("input", drawGraph);
  
rangeInput.addEventListener("blur", () => {
    if (!rangeInput.value || isNaN(parseInt(rangeInput.value))) {
        rangeInput.value = 5;
        drawGraph();
    }
});
  
window.addEventListener("resize", drawGraph());
  
// Добавляем обработчики для всех чекбоксов
document.querySelectorAll('.person-checkbox, .biorhythm-type').forEach(checkbox => {
    checkbox.addEventListener('change', drawGraph);
});
  
// Создаем тултип
const tooltip = document.createElement("div");
tooltip.className = "tooltip";
tooltip.style.display = "none";
document.body.appendChild(tooltip);
  
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
  
    const width = rect.width;
    const height = rect.height;
    const centerY = height / 2;
    const amplitude = height * 0.4;
    const marginX = 20;
  
    const targetDate = new Date(dateInput.value);
    const range = parseInt(rangeInput.value) || 5;
  
    const dayOffset = ((mouseX - marginX) / (width - 2 * marginX)) * range * 2 - range;
    const currentDate = new Date(targetDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);
  
    const selectedPeople = people.filter(person => 
        document.querySelector(`.person-checkbox[value="${person.id}"]`).checked
    );
    
    const selectedBiorhythms = biorhythmTypes.filter(type => 
        document.querySelector(`.biorhythm-type[value="${type.id}"]`).checked
    );
  
    let tooltipContent = `<div>${currentDate.toLocaleDateString('ru-RU')}</div>`;
    let hasContent = false;
  
    selectedPeople.forEach(person => {
        const daysPassed = calculateDays(person.birthday, currentDate);
        
        selectedBiorhythms.forEach(biorhythm => {
            const value = calculateBiorhythm(daysPassed, biorhythm.cycle);
            const y = centerY - value * amplitude;
            
            if (Math.abs(mouseY - y) < 6) {
                hasContent = true;
                const color = person.colors[biorhythm.id];
                tooltipContent += `<div><span style="color:${color};">${person.name} ${biorhythm.name}:</span> ${Math.round(value * 100)}%</div>`;
            }
        });
    });
  
    if (hasContent) {
        tooltip.innerHTML = tooltipContent;
        tooltip.style.display = "block";
        tooltip.style.left = e.pageX + 15 + "px";
        tooltip.style.top = e.pageY - 40 + "px";
    } else {
        tooltip.style.display = "none";
    }
});
  
canvas.addEventListener("mouseout", () => {
    tooltip.style.display = "none";
});
  
// Обработчик кнопки сброса
document.getElementById('clear-people').addEventListener('click', () => {
    document.querySelectorAll('.person-checkbox').forEach(checkbox => {
      checkbox.checked = false;
    });
    drawGraph();
    
    // Анимация кнопки
    const btn = document.getElementById('clear-people');
    btn.classList.add('shake');
    setTimeout(() => btn.classList.remove('shake'), 500);
  });

// Функция для анализа корреляции биоритмов
function analyzeCorrelation() {
    const targetDate = new Date(dateInput.value);
    const selectedPeople = people.filter(person => 
        document.querySelector(`.person-checkbox[value="${person.id}"]`).checked
    );
    
    const selectedBiorhythms = biorhythmTypes.filter(type => 
        document.querySelector(`.biorhythm-type[value="${type.id}"]`).checked
    );
    
    if (selectedPeople.length < 2 || selectedBiorhythms.length === 0) {
        return "Выберите как минимум двух человек и хотя бы один тип биоритма для анализа корреляции.";
    }
    
    const daysPassed = selectedPeople.map(person => 
        calculateDays(person.birthday, targetDate)
    );
    
    const results = [];
    const threshold = 0.2; // Порог для определения совпадения (20%)
    
    // Анализируем все возможные пары людей
    for (let i = 0; i < selectedPeople.length; i++) {
        for (let j = i + 1; j < selectedPeople.length; j++) {
            const person1 = selectedPeople[i];
            const person2 = selectedPeople[j];
            
            selectedBiorhythms.forEach(biorhythm => {
                const value1 = calculateBiorhythm(daysPassed[i], biorhythm.cycle);
                const value2 = calculateBiorhythm(daysPassed[j], biorhythm.cycle);
                const diff = Math.abs(value1 - value2);
                
                if (diff <= threshold) {
                    const similarity = Math.round((1 - diff) * 100);
                    const avgValue = (value1 + value2) / 2;
                    
                    let advice = "";
                    
if (biorhythm.id === 'physical') {
    if (avgValue > 0.7) {
        advice = `💪 Идеальный день для совместного ЗОЖ:\n` +
                `- Включите онлайн-тренировку (например, HIIT)\n` +
                `- Синхронно сделайте комплекс йоги по видео\n` +
                `- Устройте челлендж по количеству шагов (минимум 10к)\n`
    } else if (avgValue > 0.3) {
        advice = `👍 Хороший день для активности:\n` +
                `- Совместная утренняя зарядка\n` +
                `- Прогулка в парке с аудиокнигой (обсудите потом)\n` +
                `- Разминка каждые 2 часа во время работы\n` 
    } else if (avgValue < -0.7) {
        advice = `🛌 День восстановления:\n` +
                `- Сделайте дыхательные упражнения вместе\n` +
                `- Примите контрастный душ (договоритесь о времени)\n`
    }
} 
else if (biorhythm.id === 'emotional') {
    if (avgValue > 0.7) {
        advice = `❤️ Максимальная эмоциональная связь:\n` +
                `- Проведите "сердечный круг": по очереди делитесь тем, что сейчас чувствуете\n`;
    } else if (avgValue > 0.3) {
        advice = `😊 Поддержка и развитие:\n` +
                `- Обменяйтесь комплиментами в голосовых\n`
    } else if (avgValue < -0.7) {
        advice = `🧘‍♀️ Энергии мало - берегите себя:\n` +
                `- Послушайте одинаковый плейлист для релакса\n` 
    }
} 
else if (biorhythm.id === 'intellectual') {
    if (avgValue > 0.7) {
        advice = `🚀 Пик продуктивности для учебы:\n` +
                `- Совместный coding session (VS Code Live Share)\n` +
                `- Разберите сложную тему по фронтенду\n` +
                `- Решите 3 задачи на LeetCode вместе`;
    } else if (avgValue > 0.3) {
        advice = `📚 Хорошо для обучения:\n` +
                `- Сделайте конспект по новому материалу\n` +
                `- Повторите грамматику английского`;
    } else if (avgValue < -0.7) {
        advice = `🎓 Легкая учеба:\n` +
                `- Повторите базовые концепции фронтенда\n` +
                `- Сыграйте в "Алиас" с техническими терминами\n` +
                `- Послушайте подкаст о разработке во время прогулки`;
    }
}

// Общие рекомендации для нейтральных дней
if (avgValue >= -0.3 && avgValue <= 0.3) {
    advice = `⚖️ Баланс для системного роста:\n` +
            `- Обновите трекер привычек\n` +
            `- Запланируйте учебные цели на месяц\n` +
            `- Сделайте обзор своих проектов на GitHub`;
}

// Добавляем анти-дофаминовые советы
if (avgValue < -0.5) {
    advice += `🚫 Избегайте сегодня:\n` +
              `- Бесцельного скроллинга соцсетей\n` +
              `- Мультитаскинга без четкой цели`;
}
                    
                    results.push({
                        person1: person1.name,
                        person2: person2.name,
                        biorhythm: biorhythm.name,
                        similarity: similarity,
                        value1: Math.round(value1 * 100),
                        value2: Math.round(value2 * 100),
                        advice: advice
                    });
                }
            });
        }
    }
    
    return results;
}

// Функция для генерации рекомендаций
function generateRecommendations() {
    const targetDate = new Date(dateInput.value);
    const selectedPeople = people.filter(person => 
        document.querySelector(`.person-checkbox[value="${person.id}"]`).checked
    );
    
    const selectedBiorhythms = biorhythmTypes.filter(type => 
        document.querySelector(`.biorhythm-type[value="${type.id}"]`).checked
    );
    
    if (selectedPeople.length === 0 || selectedBiorhythms.length === 0) {
        return "Выберите хотя бы одного человека и один тип биоритма для получения рекомендаций.";
    }
    
    const recommendations = [];
    
    selectedPeople.forEach(person => {
        const daysPassed = calculateDays(person.birthday, targetDate);
        const personRecommendations = [];
        
        selectedBiorhythms.forEach(biorhythm => {
            const value = calculateBiorhythm(daysPassed, biorhythm.cycle);
            const percent = Math.round(value * 100);
            
            let recommendation = "";
            let emoji = "";
            
            if (biorhythm.id === 'physical') {
                if (percent > 70) {
                    recommendation = `Идеальный день для физической активности! Запланируйте тренировку, пробежку или активный отдых.`;
                    emoji = "💪";
                } else if (percent > 30) {
                    recommendation = `Хороший день для умеренных физических нагрузок.`;
                    emoji = "👍";
                } else if (percent > -30) {
                    recommendation = `Физическая энергия на среднем уровне. Делайте перерывы в работе.`;
                    emoji = "😐";
                } else if (percent > -70) {
                    recommendation = `Физическая энергия низкая. Избегайте интенсивных нагрузок.`;
                    emoji = "😕";
                } else {
                    recommendation = `Критически низкий уровень физической энергии. Отдохните и восстановитесь.`;
                    emoji = "😫";
                }
            } 
            else if (biorhythm.id === 'emotional') {
                if (percent > 70) {
                    recommendation = `Эмоциональный подъем! Отличный день для общения, творчества и новых знакомств.`;
                    emoji = "😊";
                } else if (percent > 30) {
                    recommendation = `Стабильное эмоциональное состояние. Хорошее время для важных разговоров.`;
                    emoji = "🙂";
                } else if (percent > -30) {
                    recommendation = `Эмоции нейтральные. Избегайте принятия важных решений на эмоциях.`;
                    emoji = "😐";
                } else if (percent > -70) {
                    recommendation = `Эмоциональный спад. Будьте осторожны в общении, возможна раздражительность.`;
                    emoji = "😞";
                } else {
                    recommendation = `Глубокий эмоциональный кризис. Сегодня лучше побыть в одиночестве.`;
                    emoji = "😢";
                }
            } 
            else if (biorhythm.id === 'intellectual') {
                if (percent > 70) {
                    recommendation = `Пик интеллектуальной активности! Решайте сложные задачи, учитесь, творите.`;
                    emoji = "🧠";
                } else if (percent > 30) {
                    recommendation = `Хороший день для умственной работы. Планируйте важные встречи.`;
                    emoji = "🤔";
                } else if (percent > -30) {
                    recommendation = `Средний уровень интеллектуальной энергии. Рутинная работа.`;
                    emoji = "📝";
                } else if (percent > -70) {
                    recommendation = `Интеллектуальный спад. Избегайте сложных задач и принятия решений.`;
                    emoji = "😴";
                } else {
                    recommendation = `Критически низкий уровень интеллектуальной энергии. Отдых для мозга.`;
                    emoji = "🛌";
                }
            }
            
            personRecommendations.push({
                biorhythm: biorhythm.name,
                percent: percent,
                recommendation: recommendation,
                emoji: emoji
            });
        });
        
        recommendations.push({
            person: person.name,
            recommendations: personRecommendations
        });
    });
    
    return recommendations;
}

// Функция для отображения корреляции в модальном окне
function showCorrelationModal() {
    const correlationData = analyzeCorrelation();
    const modal = document.getElementById('correlation-modal');
    const content = document.getElementById('correlation-content');
    
    // Прокручиваем вверх перед открытием
    content.scrollTop = 0;
    
    if (typeof correlationData === 'string') {
        content.innerHTML = `<p>${correlationData}</p>`;
    } else if (correlationData.length === 0) {
        content.innerHTML = `<p>Нет значительной корреляции между выбранными биоритмами.</p>`;
    } else {
        let html = '';
        correlationData.forEach(item => {
            html += `
                <div class="correlation-item">
                   <h3>
  <span style="color: #d5a2ff">${item.person1} (${item.value1}%)</span> 
  <span> и </span> 
  <span style="color: #d5a2ff">${item.person2} (${item.value2}%)</span>
</h3>
                    <p><strong>${item.biorhythm} биоритм:</strong> совпадение на ${item.similarity}%</p>
                    <div class="advice">${item.advice.replace(/\n/g, '<br>')}</div>
                </div>
            `;
        });
        content.innerHTML = html;
    }
    
    modal.style.display = 'block';
}

function showRecommendationsModal() {
    const recommendationsData = generateRecommendations();
    const modal = document.getElementById('recommendations-modal');
    const content = document.getElementById('recommendations-content');
    
    // Прокручиваем вверх перед открытием
    content.scrollTop = 0;
    
    if (typeof recommendationsData === 'string') {
        content.innerHTML = `<p>${recommendationsData}</p>`;
    } else {
        let html = '';
        recommendationsData.forEach(person => {
            html += `<h3 style="color: #d5a2ff">${person.person}</h3>`; // Используем основной цвет текста
            person.recommendations.forEach(rec => {
                html += `
                    <div class="recommendation-item">
                        <p>
                            <strong style="color: ${rec.color}">${rec.biorhythm} биоритм: ${rec.percent}%</strong> 
                            ${rec.emoji}
                        </p>
                        <p>${rec.recommendation}</p>
                    </div>
                `;
            });
        });
        content.innerHTML = html;
    }
    
    modal.style.display = 'block';
}
// Обработчики для модальных окон
document.getElementById('show-correlation').addEventListener('click', showCorrelationModal);
document.getElementById('show-recommendations').addEventListener('click', showRecommendationsModal);

document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Первоначальная отрисовка
drawGraph();