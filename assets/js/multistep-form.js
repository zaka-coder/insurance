(function () {
    'use strict';

    // MultiStepForm: lightweight reusable module
    // - Finds forms with class 'multi-step-form' and initializes them
    // - Options are buttons with class 'msf-option' and attributes data-field / data-value
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
        this.backBtn = form.querySelector('.msf-back');
        this.resetBtn = form.querySelector('.msf-reset');
        this.submitBtn = form.querySelector('.msf-submit');
        this.hiddenContainer = form.querySelector('.msf-hidden');
        this.progressBar = form.querySelector('.msf-progress-wrapper .progress-bar');
        this.indicatorsContainer = form.querySelector('.msf-indicators');

        if (this.progressTotal) this.progressTotal.textContent = String(this.total);
        // build indicators only after we know total
        this._buildIndicators();
        this._bindOptions();
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

    MultiStepForm.prototype._bindOptions = function () {
        var self = this;
        this.form.addEventListener('click', function (e) {
            var btn = e.target.closest('.msf-option');
            if (!btn) return;
            e.preventDefault();
            var field = btn.getAttribute('data-field');
            var value = btn.getAttribute('data-value');
            if (!field) return;

            // Save answer
            self.data[field] = value;

            // Update or create a hidden input for potential form submission later
            self._setHidden(field, value);

            // Visually mark the clicked option as selected and clear others in this step
            try {
                var stepEl = btn.closest('.msf-step');
                if (stepEl) {
                    var other = Array.from(stepEl.querySelectorAll('.msf-option'));
                    other.forEach(function (o) {
                        o.classList.remove('selected');
                        o.setAttribute('aria-pressed', 'false');
                    });
                    btn.classList.add('selected');
                    btn.setAttribute('aria-pressed', 'true');
                }
            } catch (err) {
                // ignore visual update errors
            }

            // dispatch change event
            self._dispatchChange();

            // Move to next step if available
            if (self.current < self.total) {
                self._showStep(self.current + 1);
            } else {
                // Last step - enable submit
                self._finalize();
            }
        });
    };

    // Apply selected state for a given step element based on saved data
    MultiStepForm.prototype._applySelectedForStep = function (stepEl) {
        if (!stepEl) return;
        var opts = Array.from(stepEl.querySelectorAll('.msf-option'));
        if (!opts || !opts.length) return;

        // find the field name used by this step (first option's data-field)
        var field = opts[0].getAttribute('data-field');
        if (!field) return;

        var selectedValue = this.data[field];
        opts.forEach(function (o) {
            var val = o.getAttribute('data-value');
            if (selectedValue !== undefined && String(val) === String(selectedValue)) {
                o.classList.add('selected');
                o.setAttribute('aria-pressed', 'true');
            } else {
                o.classList.remove('selected');
                o.setAttribute('aria-pressed', 'false');
            }
        });
    };

    MultiStepForm.prototype._bindControls = function () {
        var self = this;
        if (this.backBtn) {
            this.backBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (self.current > 1) self._showStep(self.current - 1);
            });
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', function (e) {
                e.preventDefault();
                self.reset();
            });
        }

        // prevent default form submit; instead we keep API for integration
        this.form.addEventListener('submit', function (e) {
            e.preventDefault();
            // emit a submit event with collected data; integration code can listen to it
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

        // toggle back button
        if (this.backBtn) {
            if (this.current > 1) this.backBtn.classList.remove('d-none');
            else this.backBtn.classList.add('d-none');
        }

        // disable submit until last step answered
        if (this.submitBtn) this.submitBtn.disabled = (this.current !== this.total);

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

        // apply selected states for the current step (if user previously answered)
        try {
            var curStepEl = this.form.querySelector('.msf-step[data-step="' + this.current + '"]');
            this._applySelectedForStep(curStepEl);
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
        // clear visual selected states
        try {
            var all = Array.from(this.form.querySelectorAll('.msf-option'));
            all.forEach(function (o) { o.classList.remove('selected'); o.setAttribute('aria-pressed', 'false'); });
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
