(function () {
    'use strict';

    // MultiStepForm: lightweight reusable module (input-based)
    // - Finds forms with class 'multi-step-form' and initializes them
    // - Collects inputs having class 'msf-input' and data-field attributes inside each step
    // - Steps are elements with class 'msf-step' and attribute data-step
    // - Emits a custom event 'msf:change' on the form with detail {data, currentStep}
    // - Provides form.getData() to retrieve collected answers

    function MultiStepForm(form) {
        this.form = form;
        this.steps = Array.from(form.querySelectorAll('.msf-step'));
        this.total = this.steps.length;
        this.current = 1;
        this.data = {};

        // elements
        this.progressCurrent = form.querySelector('.msf-current');
        this.progressTotal = form.querySelector('.msf-total');
    this.prevBtn = form.querySelector('.msf-prev');
    this.nextBtn = form.querySelector('.msf-next');
    this.submitBtn = form.querySelector('.msf-submit');
        this.hiddenContainer = form.querySelector('.msf-hidden');
        this.progressBar = form.querySelector('.msf-progress-wrapper .progress-bar');
        this.indicatorsContainer = form.querySelector('.msf-indicators');

        if (this.progressTotal) this.progressTotal.textContent = String(this.total);
        // build indicators only after we know total
        this._buildIndicators();
        this._bindControls();
        this._showStep(1);
    }

    MultiStepForm.prototype._buildIndicators = function () {
        var self = this;
        if (!this.indicatorsContainer) return;
        this.indicatorsContainer.innerHTML = '';
        for (var i = 1; i <= this.total; i++) {
            var wrap = document.createElement('div');
            wrap.className = 'd-flex flex-column align-items-center';

            var dot = document.createElement('div');
            dot.className = 'msf-indicator';
            dot.setAttribute('data-step', String(i));
            dot.textContent = String(i);
            wrap.appendChild(dot);

            // optional label under the dot (can be empty or step name later)
            var label = document.createElement('div');
            label.className = 'label';
            label.textContent = '';
            wrap.appendChild(label);

            this.indicatorsContainer.appendChild(wrap);
        }
    };

    // Collect inputs from the current step and save into data + hidden fields
    MultiStepForm.prototype._collectCurrentInputs = function () {
        var stepEl = this.form.querySelector('.msf-step[data-step="' + this.current + '"]');
        if (!stepEl) return;
        var inputs = Array.from(stepEl.querySelectorAll('.msf-input'));
        var self = this;
        inputs.forEach(function (inp) {
            var field = inp.getAttribute('data-field') || inp.name;
            if (!field) return;
            var value = inp.value;
            self.data[field] = value;
            self._setHidden(field, value);
        });
        // dispatch change after collecting
        this._dispatchChange();
    };

    // Apply input values for a given step (restore previously-entered values if any)
    MultiStepForm.prototype._applyInputsForStep = function (stepEl) {
        if (!stepEl) return;
        var inputs = Array.from(stepEl.querySelectorAll('.msf-input'));
        var self = this;
        inputs.forEach(function (inp) {
            var field = inp.getAttribute('data-field') || inp.name;
            if (!field) return;
            if (self.data.hasOwnProperty(field)) inp.value = self.data[field];
        });
    };

    MultiStepForm.prototype._bindControls = function () {
        var self = this;

        // Next button: collect inputs and advance (or finalize if last)
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', function (e) {
                e.preventDefault();
                // collect current inputs
                self._collectCurrentInputs();
                if (self.current < self.total) {
                    self._showStep(self.current + 1);
                } else {
                    self._finalize();
                }
            });
        }

        // Previous button: go back one step
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (self.current > 1) self._showStep(self.current - 1);
            });
        }

        // prevent default form submit; instead we keep API for integration
        this.form.addEventListener('submit', function (e) {
            e.preventDefault();
            // ensure current inputs are collected before submit
            self._collectCurrentInputs();
            var submitEvent = new CustomEvent('msf:submit', { detail: { data: Object.assign({}, self.data) } });
            self.form.dispatchEvent(submitEvent);
        });
    };

    MultiStepForm.prototype._setHidden = function (name, value) {
        if (!this.hiddenContainer) return;
        var input = this.hiddenContainer.querySelector('input[name="' + name + '"]');
        if (!input) {
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            this.hiddenContainer.appendChild(input);
        }
        input.value = value;
    };

    MultiStepForm.prototype._showStep = function (n) {
        if (n < 1 || n > this.total) return;
        this.steps.forEach(function (stepEl) {
            stepEl.classList.add('d-none');
        });
        var target = this.form.querySelector('.msf-step[data-step="' + n + '"]');
        if (target) target.classList.remove('d-none');

        this.current = n;
        if (this.progressCurrent) this.progressCurrent.textContent = String(this.current);

        // toggle previous button
        if (this.prevBtn) {
            if (this.current > 1) this.prevBtn.classList.remove('d-none');
            else this.prevBtn.classList.add('d-none');
        }

        // show/hide next and submit
        if (this.nextBtn) {
            if (this.current === this.total) this.nextBtn.classList.add('d-none');
            else this.nextBtn.classList.remove('d-none');
        }
        if (this.submitBtn) {
            if (this.current === this.total) {
                this.submitBtn.classList.remove('d-none');
                this.submitBtn.disabled = false;
            } else {
                this.submitBtn.classList.add('d-none');
                this.submitBtn.disabled = true;
            }
        }

        // update progress bar and indicators
        try {
            var pct = 0;
            if (this.total > 1) pct = Math.round(((this.current - 1) / (this.total - 1)) * 100);
            else pct = 100;
            if (this.progressBar) this.progressBar.style.width = pct + '%';

            if (this.indicatorsContainer) {
                var dots = Array.from(this.indicatorsContainer.querySelectorAll('.msf-indicator'));
                var self = this;
                dots.forEach(function (dot) {
                    var stepIndex = parseInt(dot.getAttribute('data-step'), 10);
                    dot.classList.remove('active', 'completed');
                    if (stepIndex < self.current) dot.classList.add('completed');
                    else if (stepIndex === self.current) dot.classList.add('active');
                });
            }
        } catch (err) {
            // fail silently — progress UI optional
            console.warn('msf progress update error', err);
        }

        // restore inputs for current step from saved data (if any)
        try {
            var curStepEl = this.form.querySelector('.msf-step[data-step="' + this.current + '"]');
            this._applyInputsForStep(curStepEl);
        } catch (e) {
            // ignore
        }
    };

    MultiStepForm.prototype._finalize = function () {
        // enable submit and dispatch event to inform that form is complete
        if (this.submitBtn) this.submitBtn.disabled = false;
        var completeEvent = new CustomEvent('msf:complete', { detail: { data: Object.assign({}, this.data) } });
        this.form.dispatchEvent(completeEvent);
    };

    MultiStepForm.prototype._dispatchChange = function () {
        var ev = new CustomEvent('msf:change', { detail: { data: Object.assign({}, this.data), currentStep: this.current } });
        this.form.dispatchEvent(ev);
    };

    MultiStepForm.prototype.getData = function () {
        return Object.assign({}, this.data);
    };

    MultiStepForm.prototype.reset = function () {
        this.data = {};
        if (this.hiddenContainer) this.hiddenContainer.innerHTML = '';
        this._showStep(1);
        if (this.submitBtn) this.submitBtn.disabled = true;
        // clear inputs visually
        try {
            var allInputs = Array.from(this.form.querySelectorAll('.msf-input'));
            allInputs.forEach(function (i) { i.value = ''; });
        } catch (e) {}
        this._dispatchChange();
    };

    // Auto-init all forms with class 'multi-step-form' on DOMContentLoaded
    function initAll() {
        var forms = document.querySelectorAll('form.multi-step-form');
        forms.forEach(function (f) {
            if (!f._msfInstance) {
                f._msfInstance = new MultiStepForm(f);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    // Expose constructor on window for manual initialization or access
    window.MultiStepForm = MultiStepForm;
})();
