function getCurrentTabId(callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (callback) callback(tabs.length ? tabs[0].id : null);
    });
}

function sendMessageToContentScript(message, callback) {
    getCurrentTabId((tabId) => {
        chrome.tabs.sendMessage(tabId, message, function (response) {
            if (callback) callback(response);
        });
    });
}

const createElement = (tag, property) => {
    const ele = document.createElement(tag);
    Object.keys(property).map(k => {
        ele[k] = property[k];
    });
    return ele;
}

const renderContainer = (response) => {
    const containerEle = document.querySelector('#container');
    if (response) {
        if (response.type === 'data') {
            const title = document.createElement("div");
            title.textContent = response.data.title;
            const ul = document.createElement('ul');
            response.data.options.map(r => {
                const li = document.createElement('li');
                li.textContent = r;
                ul.appendChild(li);
            });
            while (containerEle.firstChild) {
                containerEle.removeChild(containerEle.firstChild);
            }
            containerEle.appendChild(title);
            containerEle.appendChild(ul);
            const btn = document.createElement('button');
            btn.textContent = '匹配答案';
            btn.addEventListener('click', async () => {
                const data = (await chrome.storage.local.get('data')).data;
                // let fixTitle = response.data.title;
                // if (fixTitle.indexOf('（') >= 0) {
                //     fixTitle = fixTitle.substring(0, fixTitle.indexOf('（')).trim();
                // }
                if (data && data.length > 0) {
                    const search = data.filter(r => {
                        // console.log(r['题干*'], response.data.title, r['题干*'].indexOf(response.data.title.replace(/[\r\n\t\s]*/g, '')));
                        return (r['题干*'] || '').replace(/[\r\n\t\s]*/g, '').indexOf(response.data.title.replace(/[\r\n\t\s]*/g, '')) >= 0;
                    });
                    if (search.length > 0) {
                        containerEle.appendChild(createElement('div', {
                            textContent: `一共匹配${search.length}个题目`,
                            style: 'font-weight: bold'
                        }));
                        containerEle.appendChild(createElement('div', {
                            textContent: `答案:${search[0]['答案*']}`,
                            style: 'font-weight: bold'
                        }));
                        const answer = document.createElement('ul');
                        const a = (search[0]['答案*'] || '').split(',');
                        a.map(aa => {
                            const o = `选项${aa}`
                            const aw = aa + ':' + search[0][o]
                            answer.appendChild(createElement('li', {
                                textContent: aw
                            }));
                        });
                        containerEle.appendChild(answer);
                    } else {
                        const answer = document.createElement('div');
                        answer.textContent = '找不到匹配答案';
                        containerEle.appendChild(answer);
                    }
                } else {
                    const answer = document.createElement('div');
                    answer.textContent = '无数据';
                    containerEle.appendChild(answer);
                }
            });
            containerEle.appendChild(btn);
        }
    }
}
const displayContainer = () => {
    const value = document.querySelector('#questionNum').value;
    sendMessageToContentScript({
        type: 'actions',
        data: value
    }, renderContainer);
}

sendMessageToContentScript({
    type: 'actions',
    data: 1
}, renderContainer);
/**
 *
 * @param file {File}
 * @returns {Promise<void>}
 */
const updateXlsx = async (file) => {
    const fileBuffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(fileBuffer);
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {range: 2});
    if (data.length > 0) {
        await chrome.storage.local.set({data});
    }
}

// 浏览器初始化
document.addEventListener('DOMContentLoaded', async function () {
    const btn = document.querySelector('#questionBtn');
    btn.addEventListener('click', displayContainer);
    const fileEle = document.querySelector('#file');
    fileEle.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        await updateXlsx(file);
    });
});
