document.getElementById('rollButton').addEventListener('click', rollDice);
document.getElementById('downloadPdfButton').addEventListener('click', downloadPdf);

let results = [];
let chart;

function rollDice() {
    const numDice = parseInt(document.getElementById('numDice').value);
    if (isNaN(numDice) || numDice < 1 || numDice > 100) {
        alert('Por favor, insira um número válido de dados entre 1 e 100.');
        return;
    }

    const diceContainer = document.getElementById('diceContainer');
    diceContainer.innerHTML = '';

    let total = 0;
    results = [];

    for (let i = 0; i < numDice; i++) {
        const roll = Math.floor(Math.random() * 20) + 1;
        results.push(roll);
        total += roll;

        const dice = document.createElement('div');
        dice.className = 'dice';
        dice.textContent = roll;
        diceContainer.appendChild(dice);
    }

    const average = total / numDice;
    document.getElementById('total').textContent = `Soma: ${total}`;
    document.getElementById('average').textContent = `Média: ${average.toFixed(2)}`;

    const frequency = {};
    results.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
    });

    let mostFrequent = results[0];
    for (const num in frequency) {
        if (frequency[num] > frequency[mostFrequent]) {
            mostFrequent = num;
        }
    }

    document.getElementById('mostFrequent').textContent = `Número mais frequente: ${mostFrequent}`;

    createChart(frequency);
}

function createChart(frequency) {
    const ctx = document.getElementById('diceChart').getContext('2d');
    const labels = Object.keys(frequency);
    const data = Object.values(frequency);
    const totalRolls = data.reduce((a, b) => a + b, 0);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: labels.map(() => `#${Math.floor(Math.random()*16777215).toString(16)}`),
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                datalabels: {
                    formatter: (value, ctx) => {
                        let percentage = (value / totalRolls * 100).toFixed(2) + '%';
                        return percentage;
                    },
                    color: '#fff',
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function downloadPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Resultados das Tiragens dos Dados', 10, 10);

    doc.setFontSize(12);
    doc.text(`Total: ${results.reduce((a, b) => a + b, 0)}`, 10, 20);
    doc.text(`Média: ${(results.reduce((a, b) => a + b, 0) / results.length).toFixed(2)}`, 10, 30);
    doc.text(`Número mais frequente: ${document.getElementById('mostFrequent').textContent.split(': ')[1]}`, 10, 40);

    // Adicionar gráfico ao PDF com proporções adequadas
    const canvas = document.getElementById('diceChart');
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 180;
    const imgHeight = (canvas.height / canvas.width) * imgWidth;
    doc.addImage(imgData, 'PNG', 10, 50, imgWidth, imgHeight);

    doc.save('resultados_dados.pdf');
}
