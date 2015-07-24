(function ($, undefined) {

	var buttons = [
		{ label: 'MR' },
		{ label: 'MS' },
		{ label: 'MC' },
		{ label: 'Clear', classname: 'dw-calculator-clear dw-calculator-clearfix', action: 'clear' },
		{ label: 'CE', action: 'clearEntry' },
		{ label: '*', classname: 'dw-calculator-times', action: 'operator' },
		{ label: 7, classname: 'dw-calculator-clearfix', action: 'number' },
		{ label: 8, action: 'number' },
		{ label: 9, action: 'number' },
		{ label: '+', classname: 'dw-calculator-plus', action: 'operator' },
		{ label: 4, classname: 'dw-calculator-clearfix', action: 'number' },
		{ label: 5, action: 'number' },
		{ label: 6, action: 'number' },
		{ label: '-', classname: 'dw-calculator-minus', action: 'operator' },
		{ label: 1, classname: 'dw-calculator-clearfix', action: 'number' },
		{ label: 2, action: 'number' },
		{ label: 3, action: 'number' },
		{ label: '/', classname: 'dw-calculator-divide', action: 'operator' },
		{ label: 0, classname: 'dw-calculator-clearfix dw-calculator-wide', action: 'number' },
		{ label: '.', classname: 'dw-calculator-dot', action: 'dot' },
		{ label: '=', classname: 'dw-calculator-equals', action: 'equals' }
	];

	$.widget('dw.calculator', {
		version: '0.0.1',
		options: {
			buttons: buttons,
			showOnCreate: false,
			show: false,
			hide: false,
			beforeAddButton: null,
			shown: null,
			hidden: null
		},

		_create: function () {
			this.element.addClass('dw-calculator ui-widget ui-corner-all');
			this._createWrapper();
			this._createButtons();
			this._renderMarkup();

			this._on({
				'click button': this._handleClick
			});

			this.currentDisplay = [];
			this.runningDisplay = [];
			this.numberInput = false;
		},

		_createWrapper: function() {
			var el = $('<div/>'),
				widget = this,
				displays;

			this.shell = el.clone().addClass('dw-calculator-shell ui-widget-header ui-corner-all');
			displays = el.clone().addClass('dw-calculator-displays ui-widget-content ui-corner-all').appendTo(this.shell);
			el.clone().addClass('dw-calculator-calculation').appendTo(displays);
			el.clone().text('0').addClass('dw-calculator-display').appendTo(displays);

			if (!this.options.showOnCreate) {
				this._hide(this.element, this.options.hide, function () {
					widget._trigger('hidden');
				});
			}
		},

		_createButtons: function () {
			var el = $('<button/>'),
				container = $('<div/>').addClass('ui-helper-clearfix ui-widget-content ui-corner-all'),
				widget = this;

			$.each(this.options.buttons, function (i, button) {
				if (widget._trigger('beforeAddButton', null, button)) {
					var btn = el.clone().text(button.label).appendTo(container).button();
					if (!!button.classname) {
						btn.addClass(button.classname);
					}

					if (typeof button.action === 'string') {
						btn.data('action', button.action);
					} else if (typeof button.action === 'function') {
						var fnName = 'custom' + i;

						widget['_' + fnName] = button.action;
						btn.data('action', fnName);
					}
				}
			});

			container.appendTo(this.shell);
		},

		_renderMarkup: function () {
			this.shell.appendTo(this.element);
		},

		_setOptions: function (options) {
			this._superApply(arguments);
		},

		_setOption: function (key, val) {

			this._super(key, val);

			if (key === 'buttons') {
				this.shell.find('button').remove();
				this._createButtons();
				this._renderMarkup();
			} else if (key === 'disabled') {
				this.shell.find('button').button('option', key, val);
			}
		},

		_destroy: function () {
			this.element.removeClass('dw-calculator');
			this.element.empty();
		},

		show: function () {
			var widget = this;

			this._show(this.element, this.options.show, function () {
				widget._trigger('shown');
			});
		},

		_handleClick: function (e) {
			var btn = $(e.target).closest('button'),
				fn = btn.data('action');

			this['_' + fn](e, btn);
		},

		_clear: function (e, ui) {
			this.currentDisplay = [];
			this.runningDisplay = [];
			this.numericalInput = false;
			this._updateDisplay();
			this._updateRunningDisplay();
		},

		_clearEntry: function (e, ui) {
			this.currentDisplay = [];
			this._updateDisplay();
		},

		_operator: function (e, ui) {
			if (!this.currentDisplay.length && !this.runningDisplay.length) {
				this.currentDisplay.push(this.element.find('.dw-calculator-display').text());
			} else if (this.currentDisplay.slice(0).reverse()[0] === '.') {
				this.currentDisplay.pop();
			}

			if (!this.runningDisplay.length || this.numericalInput) {
				this.runningDisplay.push([this.currentDisplay.join(''), ' ', ui.text(), ' '].join(''))
			} else if (!this.numericalInput) {
				var length = this.runningDisplay.length,
					newStr = this.runningDisplay[length - 1].replace(/[\*\-\+\/]/, ui.text());

				this.runningDisplay.pop();
				this.runningDisplay.push(newStr);
			}

			this.numericalInput = false;
			this._updateRunningDisplay();
			this._calculate();
		},

		_number: function (e, ui) {
			this.currentDisplay.push(ui.text());
			this._updateDisplay();
			this.numericalInput = true;
		},

		_dot: function (e, ui) {

			var hasDot = false,
				x = this.currentDisplay.length;

			if (!x) {
				this.currentDisplay.push('0');
			}

			while (--x >= 0) {
				if (this.currentDisplay[x] === '.') {
					hasDot = true;
					break;
				}
			}

			if (hasDot) {
				return false;
			} else {
				this.currentDisplay.push('.');
				this._updateDisplay();
			}
		},

		_equals: function (e, ui) {
			this._calculate(true);
		},

		_updateDisplay: function (reset) {
			if (!this.currentDisplay.length) {
				this.element.find('.dw-calculator-display').text(0);
			} else if (this.currentDisplay.length < 18) {
				this.element.find('.dw-calculator-display').text(this.currentDisplay.join(''));
			}

			if (reset) {
				this.currentDisplay = [];
			}
		},

		_updateRunningDisplay: function () {
			this.element.find('.dw-calculator-calculation').text(this.runningDisplay.join(''));
			this.currentDisplay = [];
		},

		_calculate: function (final) {

			var ops = {
				'+': function (x, y) { return x + y },
				'-': function (x, y) { return x - y },
				'*': function (x, y) { return x * y },
				'/': function (x, y) { return x / y },
			};

			function sequentialCalc(str) {

				var sumArray = str.split(' '),
					left = +sumArray[0],
					length = sumArray.length,
					x;

				for (x = 1; x < length; x = x + 2) {
					left = ops[sumArray[x]](left, +sumArray[x + 1]);
				}

				return left;
			}

			if (final) {

				var running = this.element.find('.dw-calculator-calculation').text(),
					display = this.element.find('.dw-calculator-display').text(),
					sum = [running, display].join('');

				this.currentDisplay = [sequentialCalc(sum)];
				this._updateDisplay();
				this.runningDisplay = [];
				this.numericalInput = false;
				this._updateRunningDisplay();

			} else if (this.runningDisplay.length > 1) {

				var tmp = this.runningDisplay.pop(),
					trimmed = tmp.replace(/\s[\*\-\+\/]\s/, '');

				this.runningDisplay.push(trimmed);

				this.currentDisplay = [sequentialCalc(this.runningDisplay.join(''))];
				this.runningDisplay.pop();
				this.runningDisplay.push(tmp);
				this._updateDisplay(true);
			}
		}

	});

}(jQuery));