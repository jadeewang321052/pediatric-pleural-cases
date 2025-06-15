// 存储方案
function saveVote(caseNum, choice) {
    try {
        if (typeof localStorage === 'undefined') {
            console.error("localStorage不可用");
            return false;
        }
        
        let votes = JSON.parse(localStorage.getItem('pleuralVotes')) || {
            case1: {}, case2: {}, case3: {}
        };
        
        const userId = 'usr-' + new Date().getTime() + Math.random().toString(36).substr(2, 5);
        votes['case' + caseNum][userId] = choice;
        
        localStorage.setItem('pleuralVotes', JSON.stringify(votes));
        return true;
    } catch (e) {
        console.error("存储失败:", e);
        return false;
    }
}

// 获取投票数据
function getVotes() {
    const defaultVotes = {
        case1: { '胸膜外': 0, '肺内': 0, '胸膜腔': 0 },
        case2: { '胸膜外': 0, '肺内': 0, '胸膜腔': 0 },
        case3: { '胸膜外': 0, '肺内': 0, '胸膜腔': 0 }
    };
    
    try {
        const saved = JSON.parse(localStorage.getItem('pleuralVotes'));
        if (!saved) return defaultVotes;
        
        Object.keys(saved).forEach(caseKey => {
            const choices = Object.values(saved[caseKey]);
            choices.forEach(choice => {
                if (defaultVotes[caseKey][choice] !== undefined) {
                    defaultVotes[caseKey][choice]++;
                }
            });
        });
        
        return defaultVotes;
    } catch (e) {
        return defaultVotes;
    }
}

// 渲染图表
function renderPreClassCharts() {
    const votes = getVotes();
    
    for(let i = 1; i <= 3; i++) {
        const chartId = `case${i}Chart`;
        const oldChart = Chart.getChart(chartId);
        if (oldChart) {
            oldChart.destroy();
        }

        const ctx = document.getElementById(chartId).getContext('2d');
        const data = votes[`case${i}`];
        const total = data['胸膜外'] + data['肺内'] + data['胸膜腔'];
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [
                    `胸膜外 (${total ? Math.round(data['胸膜外']/total*100) : 0}%)`,
                    `肺内 (${total ? Math.round(data['肺内']/total*100) : 0}%)`,
                    `胸膜腔 (${total ? Math.round(data['胸膜腔']/total*100) : 0}%)`
                ],
                datasets: [{
                    data: [data['胸膜外'], data['肺内'], data['胸膜腔']],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// 选择选项
function selectOption(btn, phase, caseId, option) {
    const container = btn.closest('.options-container');
    container.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    
    const saved = saveVote(caseId, option);
    if (!saved) {
        alert('提交失败，请确保未使用无痕模式浏览');
        return;
    }
    
    if (phase === 'in-class') {
        renderPreClassCharts();
    }
}

// 页面加载完成后隐藏加载提示
window.addEventListener('load', function() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
    renderPreClassCharts();
}); 