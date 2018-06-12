
const robot = require('robotjs');

// 点击坐标
export const clickPos = pos => {
    robot.moveMouse(pos.x, pos.y);
    robot.mouseClick();
};

// 点击DOM元素
export const clickElement = element => {
    const box = element.getBoundingClientRect();
    const pos = {
        x: (Math.random() + 1) / 3 * (box.right - box.left),  // 中间 1/3  位置
        y: (Math.random() + 1) / 3 * (box.bottom - box.top)
    };
    clickPos(pos);
};

// 拖动滑块验证码
const mouseDrag = (from, to) => {
    robot.setMouseDelay(100);
    robot.moveMouse(from.x, from.y);
    robot.mouseToggle('down');
    robot.dragMouse(to.x, to.y);
    robot.mouseToggle('up');
};
