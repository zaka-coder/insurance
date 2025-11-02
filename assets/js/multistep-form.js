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

// helper: show the msf form only after valid US ZIP
function isValidUSZip(z) {
    if (!z) return false;
    z = String(z).trim();
    return /^\d{5}(-\d{4})?$/.test(z);
}

function setupZipReveal() {
    var startBtn = document.getElementById('msf-start-btn');
    var zipInput = document.getElementById('msf-start-zip');
    var err = document.getElementById('msf-zip-error');
    if (!startBtn || !zipInput) return;

    function showError(msg) {
        if (!err) return;
        err.textContent = msg || 'Invalid ZIP code.';
        err.classList.remove('d-none');
    }

    startBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var val = zipInput.value.trim();
        if (!isValidUSZip(val)) {
            showError('Please enter a valid US ZIP code (e.g. 12345 or 12345-6789).');
            return;
        }
        // hide error
        if (err) err.classList.add('d-none');

        // reveal first form on the page
        var form = document.querySelector('form.multi-step-form');
        if (form) {
            form.classList.remove('d-none');

            // prefill zip field inside the form if present
            var zipField = form.querySelector('.msf-input[data-field="zip_code"]');
            if (zipField) zipField.value = val;

            // focus first visible input
            setTimeout(function () {
                var first = form.querySelector('.msf-step:not(.d-none) .msf-input');
                if (first) first.focus();
            }, 50);

            // scroll into view smoothly
            try { form.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (err) { }
        }

        // hide start block
        var blk = document.getElementById('msf-zip-block');
        if (blk) blk.classList.add('d-none');
    });

    // hide error on input
    zipInput.addEventListener('input', function () {
        if (err) err.classList.add('d-none');
    });
}

// ensure ZIP reveal wiring is registered after helpers are defined
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { try { setupZipReveal(); } catch (e) { } });
else { try { setupZipReveal(); } catch (e) { } }

// Contact form setup: basic validation, log and show success message
function setupContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var successEl = document.getElementById('contact-success');
    var errorEl = document.getElementById('contact-error');

    function showSuccess() {
        if (errorEl) errorEl.classList.add('d-none');
        if (successEl) {
            successEl.classList.remove('d-none');
            setTimeout(function () { successEl.classList.add('d-none'); }, 6000);
        }
    }

    function showError(msg) {
        if (successEl) successEl.classList.add('d-none');
        if (errorEl) {
            errorEl.textContent = msg || 'Please enter a valid name and email.';
            errorEl.classList.remove('d-none');
            setTimeout(function () { errorEl.classList.add('d-none'); }, 6000);
        }
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var formData = {};
        var elems = form.querySelectorAll('input[name], textarea[name]');
        Array.prototype.forEach.call(elems, function (el) { formData[el.name] = el.value; });

        // basic validation
        if (!formData.name || !formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
            showError('Please enter a valid name and email.');
            return;
        }

        // log the contact submission (replace with fetch() to send to server)
        console.log('contact form:', formData);

        // clear form
        form.reset();
        showSuccess();
    });
}

// register contact form wiring
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { try { setupContactForm(); } catch (e) { } });
else { try { setupContactForm(); } catch (e) { } }
