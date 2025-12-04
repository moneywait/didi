document.addEventListener('DOMContentLoaded', () => {
    // 获取 DOM 元素
    const wheelContainer = document.getElementById('wheelContainer');
    const startButton = document.getElementById('startButton');
    const emojiList = config.emojiList;
    const prizeMapping = config.prizes;
    const contactPerson = config.contactPerson;
    let isPlaying = false;

    // 模态框元素
    const prizeModal = document.getElementById('prizeModal');
    const modalClose = document.getElementById('modalClose');
    const modalContent = document.getElementById('modalContent');
    const modalIcon = document.getElementById('modalIcon');
    const modalButton = document.getElementById('modalButton');

    // 获取 CSS 主题色（用于转盘样式）
    const styles = getComputedStyle(document.documentElement);
    const primaryColor = styles.getPropertyValue('--primary-color').trim() || '#ff6f61';
    const primaryDark = styles.getPropertyValue('--primary-dark').trim() || '#e55b50';
    const gradientStart = styles.getPropertyValue('--gradient-start').trim() || '#a8edea';
    const gradientEnd = styles.getPropertyValue('--gradient-end').trim() || '#fed6e3';
    const white = styles.getPropertyValue('--white').trim() || '#fff';

    // 初始化奖项说明区（可选，若不需要可删除整个块）
    const prizeMappingElement = document.getElementById('prizeMapping');
    if (prizeMappingElement) {
        Object.entries(prizeMapping).forEach(([key, { description, icon }], index) => {
            const prizeCard = document.createElement('div');
            prizeCard.classList.add('prize-card');
            prizeCard.innerHTML = `
                <div class="prize-icon">${icon}</div>
                <div class="prize-description">${description}</div>
                <div class="watermark">${index + 1}</div>
            `;
            prizeMappingElement.appendChild(prizeCard);
        });
    }

    // === 模态框控制 ===
    function showModal(icon, content) {
        modalIcon.innerText = icon;
        modalContent.innerHTML = content;
        prizeModal.classList.add('active');
        createConfetti();
    }

    function hideModal() {
        prizeModal.classList.remove('active');
    }

    modalClose?.addEventListener('click', hideModal);
    modalButton?.addEventListener('click', hideModal);

    // === 粒子庆祝效果 ===
    function createConfetti() {
        const symbols = ['✨', '🎉', '🎊', '⭐', '🌟'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'falling-emojis';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
            confetti.style.opacity = Math.random() * 0.5 + 0.5;
            confetti.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
            document.body.appendChild(confetti);
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    // === 转盘初始化 ===
    const prizes = Object.keys(prizeMapping);
    const myLucky = new LuckyCanvas.LuckyWheel('#my-lucky', {
        width: 300,
        height: 300,
        blocks: [{ padding: '10px', background: primaryColor }],
        prizes: prizes.map((prize, index) => ({
            background: index % 2 === 0 ? gradientStart : gradientEnd,
            fonts: [
                { text: prize, fontColor: primaryDark, fontWeight: '700', fontSize: '10px' },
                { text: prizeMapping[prize].icon, top: '60%', fontSize: '12px' }
            ]
        })),
        buttons: [{
            radius: '35%',
            background: primaryColor,
            pointer: true,
            fonts: [{ text: '开始', fontColor: white, fontWeight: 'bold', fontSize: '18px' }]
        }],
        start() {
            console.log('转盘开始旋转');
        },
        end(prize) {
            console.log('停止，抽中：', prize);
        }
    });

    // === 抽奖主函数 ===
    window.startGame = function () {
        if (isPlaying) return;
        isPlaying = true;
        startButton.disabled = true;
        startButton.style.opacity = '0.5';

        myLucky.play();

        setTimeout(() => {
            const prizeIndex = Math.floor(Math.random() * prizes.length);
            myLucky.stop(prizeIndex);
            showPrize(prizes[prizeIndex]);

            setTimeout(() => {
                startButton.disabled = false;
                startButton.style.opacity = '1';
                isPlaying = false;
            }, 1000);
        }, 3000);
    };

    // === 显示中奖结果 ===
    function showPrize(prize) {
        const { icon, description } = prizeMapping[prize];
        showModal(icon, `
            <p>恭喜你抽中了：</p>
            <p><strong>${description}</strong></p>
            <p>请联系 <strong>${contactPerson}</strong> 兑换你的歌曲！</p>
        `);
        logPrize(prize, description, icon);
    }

    // === 日志记录 ===
    async function logPrize(prize, prizeText, prizeIcon) {
        try {
            const now = new Date();
            const logEntry = {
                time: now.toISOString(),
                timestamp: now.getTime(),
                prize,
                prizeText,
                prizeIcon,
                userAgent: navigator.userAgent,
                id: now.getTime() + '-' + Math.random().toString(36).substr(2, 9)
            };

            // 本地存储
            let logs = JSON.parse(localStorage.getItem('prizeLog')) || [];
            logs.push(logEntry);
            localStorage.setItem('prizeLog', JSON.stringify(logs));

            // 上报服务器
            try {
                await fetch('api/log-prize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(logEntry)
                });
            } catch (err) {
                console.warn('日志上报失败，已存本地', err);
            }
        } catch (err) {
            console.error('记录日志出错', err);
        }
    }

    // === 直接显示转盘（跳过所有引导）===
    wheelContainer.style.display = 'flex';
    wheelContainer.classList.add('active');
});
