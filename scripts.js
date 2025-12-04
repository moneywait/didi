document.addEventListener('DOMContentLoaded', () => {
    const introContainers = [
        document.getElementById('introContainer1'),
        document.getElementById('introContainer2'),
        document.getElementById('introContainer3')
    ];
    const animationContainer = document.getElementById('animationContainer');
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

    // 获取CSS变量值
    const styles = getComputedStyle(document.documentElement);
    const primaryColor = styles.getPropertyValue('--primary-color').trim() || '#ff6f61';
    const primaryLight = styles.getPropertyValue('--primary-light').trim() || '#ff856e';
    const primaryDark = styles.getPropertyValue('--primary-dark').trim() || '#e55b50';
    const gradientStart = styles.getPropertyValue('--gradient-start').trim() || '#a8edea';
    const gradientEnd = styles.getPropertyValue('--gradient-end').trim() || '#fed6e3';
    const white = styles.getPropertyValue('--white').trim() || '#fff';

    // 初始化奖品映射
    const prizeMappingElement = document.getElementById('prizeMapping');
    Object.entries(prizeMapping).forEach(([key, { description, icon }], index) => {
        const prizeCard = document.createElement('div');
        prizeCard.classList.add('prize-card');

        const prizeIcon = document.createElement('div');
        prizeIcon.classList.add('prize-icon');
        prizeIcon.innerText = icon;

        const prizeDescription = document.createElement('div');
        prizeDescription.classList.add('prize-description');
        prizeDescription.innerText = description;

        const watermark = document.createElement('div');
        watermark.classList.add('watermark');
        watermark.innerText = index + 1; // 奖项顺序，从1开始

        prizeCard.appendChild(prizeIcon);
        prizeCard.appendChild(prizeDescription);
        prizeCard.appendChild(watermark); // 添加水印到奖项卡片

        prizeMappingElement.appendChild(prizeCard);
    });
    
    // 模态框控制
    function showModal(icon, content) {
        modalIcon.innerText = icon;
        modalContent.innerHTML = content;
        prizeModal.classList.add('active');
        
        // 添加动画效果，让星星围绕模态框飘落
        createConfetti();
    }
    
    function hideModal() {
        prizeModal.classList.remove('active');
    }
    
    // 创建彩色粒子效果
    function createConfetti() {
        const colors = ['#ff6f61', '#a8edea', '#fed6e3', '#ffeb3b', '#4caf50'];
        const symbols = ['✨', '🎉', '🎊', '⭐', '🌟'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'falling-emojis';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
            confetti.style.opacity = Math.random() * 0.5 + 0.5;
            confetti.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
            document.body.appendChild(confetti);
            
            // 移除粒子
            setTimeout(() => {
                if (document.body.contains(confetti)) {
                    document.body.removeChild(confetti);
                }
            }, 5000);
        }
    }
    
    // 模态框关闭事件
    modalClose.addEventListener('click', hideModal);
    modalButton.addEventListener('click', hideModal);

    function typeWriter(text, element, callback) {
        let i = 0;
        const placeholder = '|';
        function typing() {
            if (i < text.length) {
                element.innerHTML = text.substring(0, i + 1) + placeholder;
                i++;
                setTimeout(typing, 100);
            } else {
                element.innerHTML = text;
                if (callback) callback();
            }
        }
        typing();
    }

    function displayIntroductionLines() {
        showContainer(introContainers[0], config.introMessages[0], () => {
            showContainer(introContainers[1], config.introMessages[1], () => {
                showContainer(introContainers[2], config.introMessages[2], () => {
                    setTimeout(showAnimation, 2000);
                });
            });
        });
    }

    function showContainer(container, text, callback) {
        container.classList.add('active');
        typeWriter(text, container.querySelector('p'), () => {
            setTimeout(() => {
                container.classList.remove('active');
                container.style.display = 'none';
                if (callback) callback();
            }, 2000);
        });
    }

    function showAnimation() {
        animationContainer.style.display = 'flex';
        createFallingEmojis(emojiList, 50);
        animationContainer.classList.add('active');
        setTimeout(showWheel, 2000);
    }

    function createFallingEmojis(emojis, count) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const emoji = document.createElement('div');
            emoji.classList.add('falling-emojis');
            emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.left = Math.random() * 100 + 'vw';
            emoji.style.animationDuration = Math.random() * 2 + 3 + 's';
            fragment.appendChild(emoji);
        }
        animationContainer.appendChild(fragment);
    }

    function showWheel() {
        animationContainer.classList.remove('active');
        setTimeout(() => {
            animationContainer.style.display = 'none';
            wheelContainer.style.display = 'flex';
            wheelContainer.classList.add('active');
        }, 1000);
    }

    const prizes = Object.keys(prizeMapping);
    const myLucky = new LuckyCanvas.LuckyWheel('#my-lucky', {
        width: 300,
        height: 300,
        blocks: [
            { padding: '10px', background: primaryColor }
        ],
        prizes: prizes.map((prize, index) => ({
            background: index % 2 === 0 ? gradientStart : gradientEnd,
            fonts: [
                { 
                    text: prize,
                    fontColor: primaryDark,
                    fontWeight: '700',
                    fontSize: '14px'
                },
                {
                    text: prizeMapping[prize].icon,
                    top: '60%',
                    fontSize: '24px'
                }
            ]
        })),
        buttons: [
            { 
                radius: '35%', 
                background: primaryColor,
                pointer: true,
                fonts: [
                    {
                        text: '开始',
                        fontColor: white,
                        fontWeight: 'bold',
                        fontSize: '18px'
                    }
                ]
            }
        ],
        start: function() {
            // 转盘开始旋转
            console.log('转盘开始旋转');
        },
        end: function(prize) {
            // 转盘停止旋转
            console.log('转盘停止，歌曲类型是：', prize);
        }
    });

    window.startGame = function() {
        if (isPlaying) return;
        isPlaying = true;
        // 禁用开始按钮
        startButton.disabled = true;
        startButton.style.opacity = '0.5';
        
        myLucky.play();
        setTimeout(() => {
            const prizeIndex = Math.floor(Math.random() * prizes.length);
            myLucky.stop(prizeIndex);
            showPrize(prizes[prizeIndex]);
            
            // 启用开始按钮
            setTimeout(() => {
                startButton.disabled = false;
                startButton.style.opacity = '1';
            }, 1000);
        }, 3000);
    }

    function showPrize(prize) {
        const prizeIcon = prizeMapping[prize].icon;
        const prizeText = prizeMapping[prize].description;
        const message = `歌曲类型是：${prizeText}，请找${contactPerson}兑换。`;
        
        // 显示模态框
        showModal(prizeIcon, `
            <p>恭喜你抽中了：</p>
            <p><strong>${prizeText}</strong></p>
            <p>请联系 <strong>${contactPerson}</strong> 兑换你的歌曲！</p>
        `);
        
        logPrize(prize, prizeText, prizeIcon, message).then(() => {
            isPlaying = false;
        });
    }

    async function logPrize(prize, prizeText, prizeIcon, message) {
        try {
            const now = new Date();
            // 创建日志对象
            const logEntry = { 
                time: now.toISOString(), 
                timestamp: now.getTime(),
                prize: prize,
                prizeText: prizeText,
                prizeIcon: prizeIcon, 
                notification: message,
                userAgent: navigator.userAgent,
                // 添加唯一标识，避免重复记录
                id: now.getTime() + '-' + Math.random().toString(36).substr(2, 9)
            };
            
            // 存储到localStorage作为备份
            let prizeLog = JSON.parse(localStorage.getItem('prizeLog')) || [];
            prizeLog.push(logEntry);
            localStorage.setItem('prizeLog', JSON.stringify(prizeLog));
            
            // 同时发送到服务器
            try {
                const response = await fetch('api/log-prize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(logEntry)
                });
                
                if (!response.ok) {
                    console.warn('日志记录到服务器失败，已存储到本地: ', logEntry);
                } else {
                    console.log('日志已成功记录到服务器');
                }
            } catch (error) {
                console.error('发送日志到服务器时出错: ', error);
            }
        } catch (error) {
            console.error('记录日志时出错: ', error);
        }
    }

    displayIntroductionLines();
});
