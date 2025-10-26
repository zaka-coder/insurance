(function () {
    'use strict';

    // Minimal multistep form script
    // - Supports: indicators, progress bar, next/previous navigation
    // - Collects inputs with class `msf-input` and `data-field`
    // - On final submit logs collected data to console

    function initMultiStepForm(form) {
        var steps = Array.prototype.slice.call(form.querySelectorAll('.msf-step'));
        if (!steps.length) return;
        var total = steps.length;
        var current = 1;

        var progressCurrent = form.querySelector('.msf-current');
        var progressTotal = form.querySelector('.msf-total');
        var progressBar = form.querySelector('.msf-progress-wrapper .progress-bar');
        var indicators = form.querySelector('.msf-indicators');
        var prevBtn = form.querySelector('.msf-prev');
        var nextBtn = form.querySelector('.msf-next');
        var submitBtn = form.querySelector('.msf-submit');

        var data = {};

        // build indicators
        if (progressTotal) progressTotal.textContent = String(total);
        if (indicators) {
            indicators.innerHTML = '';
            for (var i = 1; i <= total; i++) {
                var wrap = document.createElement('div');
                wrap.className = 'd-flex flex-column align-items-center';
                var dot = document.createElement('div');
                dot.className = 'msf-indicator';
                dot.setAttribute('data-step', i);
                dot.textContent = String(i);
                wrap.appendChild(dot);
                var label = document.createElement('div');
                label.className = 'label';
                label.textContent = '';
                wrap.appendChild(label);
                indicators.appendChild(wrap);
            }
        }

        function showStep(n) {
            if (n < 1 || n > total) return;
            steps.forEach(function (s) { s.classList.add('d-none'); });
            var target = form.querySelector('.msf-step[data-step="' + n + '"]');
            if (target) target.classList.remove('d-none');
            current = n;
            if (progressCurrent) progressCurrent.textContent = String(current);

            // buttons
            if (prevBtn) prevBtn.classList.toggle('d-none', current === 1);
            if (nextBtn) nextBtn.classList.toggle('d-none', current === total);
            if (submitBtn) submitBtn.classList.toggle('d-none', current !== total);

            // progress
            if (progressBar) {
                var pct = total > 1 ? Math.round(((current - 1) / (total - 1)) * 100) : 100;
                progressBar.style.width = pct + '%';
            }

            // indicators update
            if (indicators) {
                var dots = indicators.querySelectorAll('.msf-indicator');
                Array.prototype.forEach.call(dots, function (dot) {
                    var idx = parseInt(dot.getAttribute('data-step'), 10);
                    dot.classList.remove('active', 'completed');
                    if (idx < current) dot.classList.add('completed');
                    else if (idx === current) dot.classList.add('active');
                });
            }

            // restore inputs if we have stored values
            var curStep = form.querySelector('.msf-step[data-step="' + current + '"]');
            if (curStep) {
                var inputs = curStep.querySelectorAll('.msf-input');
                Array.prototype.forEach.call(inputs, function (inp) {
                    var key = inp.getAttribute('data-field') || inp.name;
                    if (key && data.hasOwnProperty(key)) inp.value = data[key];
                });
            }
        }

        function collectCurrent() {
            var curStep = form.querySelector('.msf-step[data-step="' + current + '"]');
            if (!curStep) return;
            var inputs = curStep.querySelectorAll('.msf-input');
            Array.prototype.forEach.call(inputs, function (inp) {
                var key = inp.getAttribute('data-field') || inp.name;
                if (!key) return;
                data[key] = inp.value;
            });
        }

        // bind controls
        if (nextBtn) {
            nextBtn.addEventListener('click', function (e) { e.preventDefault(); collectCurrent(); showStep(current + 1); });
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', function (e) { e.preventDefault(); showStep(current - 1); });
        }

        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                collectCurrent();
                // final action: console.log data
                console.log('msf data:', data);
            });
        }

        // initial show
        showStep(1);
    }

    // auto-init
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () {
        var forms = document.querySelectorAll('form.multi-step-form');
        Array.prototype.forEach.call(forms, initMultiStepForm);
    });
    else {
        Array.prototype.forEach.call(document.querySelectorAll('form.multi-step-form'), initMultiStepForm);
    }

})();
