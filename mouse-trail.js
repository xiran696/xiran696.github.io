function initMouseTrail() {
    // 配置参数
    const config = {
        maxTrailLength: 10,  // 轨迹的最大长度
        lineWidth: 3,        // 修改：线条的宽度从5改为3
        startColor: [255, 255, 255], // 起始颜色（蓝色）
        endColor: [60, 179, 113],   // 结束颜色（绿色）
        fadeOutSpeed: 1      // 控制轨迹淡出的速度
    };
    
    // 创建 canvas 元素并设置基本样式
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.style.position = 'fixed';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';  // 确保 canvas 不会阻止鼠标事件
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 获取 canvas 的 2D 绘图环境
    const ctx = canvas.getContext('2d');
    let trail = [];  // 存储轨迹点
    let lastMousePosition = { x: 0, y: 0 };  // 存储上一次鼠标位置

    /**
     * 线性插值计算函数，用于渐变色计算。
     * @param {Array} a 起始颜色的 RGB 数组
     * @param {Array} b 结束颜色的 RGB 数组
     * @param {number} amount 插值比例
     * @returns {Array} 插值后的颜色 RGB 数组
     */
    function lerpColor(a, b, amount) {
        const [ar, ag, ab] = a;
        const [br, bg, bb] = b;
        return [
            ar + amount * (br - ar),
            ag + amount * (bg - ag),
            ab + amount * (bb - ab)
        ].map(Math.round);
    }

    /**
     * 绘制函数，每帧调用一次以绘制鼠标拖尾。
     */
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);  // 清除画布

        // 绘制线条
        ctx.beginPath();
        for (let i = 0; i < trail.length; i++) {
            const gradientRatio = i / trail.length;
            const color = lerpColor(config.startColor, config.endColor, gradientRatio);

            if (i === 0) {
                ctx.moveTo(trail[i].x, trail[i].y);
            } else {
                ctx.lineTo(trail[i].x, trail[i].y);
            }
            ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            ctx.lineWidth = config.lineWidth;
        }
        ctx.stroke();
    }

    /**
     * 更新轨迹数组，添加新的位置点。
     */
    function updateTrail() {
        if (lastMousePosition.x !== 0 && lastMousePosition.y !== 0) {
            trail.push({ ...lastMousePosition });
        }

        // 控制轨迹长度，删除旧数据
        if (trail.length > config.maxTrailLength) {
            trail = trail.slice(config.fadeOutSpeed);
        }
    }

    // 监听鼠标移动事件更新鼠标位置
    window.addEventListener('mousemove', (event) => {
        lastMousePosition.x = event.pageX;
        lastMousePosition.y = event.pageY - window.scrollY;
    });

    // 添加触摸移动事件监听
    window.addEventListener('touchmove', (event) => {
        if (event.touches.length > 0) {
            lastMousePosition.x = event.touches[0].pageX;
            lastMousePosition.y = event.touches[0].pageY - window.scrollY;
        }
    });

    // 添加触摸结束事件监听，清空轨迹数组
    window.addEventListener('touchend', () => {
        trail = [];
        lastMousePosition = { x: 0, y: 0 }; // 重置鼠标位置
    });

    /**
     * 动画循环，用于不断刷新画布。
     */
    function animate() {
        updateTrail();
        draw();
        requestAnimationFrame(animate);
    }
    animate();

    // 窗口大小改变时重新设置 canvas 尺寸
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// 检测文档加载状态，适时启动鼠标拖尾效果
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMouseTrail);
} else {
    initMouseTrail();
}
