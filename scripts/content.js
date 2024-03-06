chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // console.log(request);
    if (request && request.type === 'actions') {
        const questions = Array.from(document.querySelectorAll('.question-item-wrap'));
        let num = +request.data - 1;
        if (num < 0) num = 0;
        if (num > questions.length - 1) num = questions.length - 1;
        const curQuestion = questions.filter(r => !r.style.display)[0];
        const questionSection = curQuestion || questions[num];
        if (questionSection) {
            // let title = questionSection.querySelector('.name').textContent.replace(/[\r\n\s\t.]*/g, '').replace(/（\d{1,2}(.\d{1,2})?分）/, '');
            // const options = Array.from(questionSection.querySelectorAll('.item-detail')).map(r => r.textContent.replace(/[\r\n\s]*/g, ''));
            let title = questionSection.querySelector('.question-stem').textContent.replace(/[\r\n\t.]*/g, '').replace(/（\d{1,2}(.\d{1,2})?分）/, '').trim().replace(/^\d{1,3}/, '');
            const options = Array.from(questionSection.querySelectorAll('.form-cell')).map(r => r.textContent.replace(/[\r\n\s]*/g, ''));
            sendResponse({
                type: 'data',
                data: {
                    title,
                    options
                }
            });//做出回应
        } else {
            console.log('找不到问题元素');
        }
    }
});
