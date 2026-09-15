export function orphus() {
	(function () {
		'use strict';

		var user = window.orphus || {};
		var self = (window.orphus = {});

		self.opt = {
			version: '6.0',
			// If prefixed with '!', the value is obfuscated by swapping every second
			// character, e.g. 'foo@bar.com' == '!of@oab.rocm'.
			email: 'info@intellektfinance.ru',
			homepage: 'https://intellektfinance.ru/',
			c_tag1: '<!!!>',
			c_tag2: '<!!!>',
			contextLength: 60, // max length of ?c_pre and ?c_suf.
			maxSelection: 256, // max ?c_sel.
			action: '/orphus.php',
			maxWidth: 650, // of <div id="orphusp">.
			strings: {
				// localizable.
				alt: 'Выделите орфографическую ошибку мышью и нажмите Ctrl+Enter. Сделаем наши тексты чище!',
				badbrowser:
					'Ваш браузер не поддерживает возможность перехвата выделенного текста или IFRAME. Возможно, он слишком старый, а, может быть, произошла какая-нибудь другая ошибка.',
				toobig: 'Вы выбрали слишком большой фрагмент текста.',
				subject: 'Сообщение от Orphus',
				intextmsg: 'Орфографическая ошибка в этом фрагменте:',
				ifsendmsg:
					'Нажмите <span>«Отправить»</span>, чтобы сообщение ушло редактору сайта. Ваш браузер останется на этой же странице.',
				gohome:
					'Или, может, вы хотите посетить домашнюю страницу Orphus (в новой вкладке)?',
				author: 'Дмитрий Котеров и Proger_XP',
				send: 'Отправить',
				cancel: 'Отмена',
				entercmnt: 'Ваш комментарий (необязательно):',
				submitex: 'Проблема при отправке сообщения:',
			},
		};

		var assign = function (dest, src) {
			for (var k in src) {
				if (k == 'strings') {
					assign(dest[k], src[k]);
				} else {
					dest[k] = src[k];
				}
			}
		};

		assign(self.opt, user);

		var docEl = document.documentElement;
		var body = document.body;

		self.iframe = null;
		self.submitted = false;
		self.lastComment = '';

		self.deobfuscate = function (s) {
			if (s.substr(0, 1) == '!') {
				s = s.substr(1).replace(/(.)(.)/g, '$2$1');
			}
			return s;
		};

		self.run = function () {
			document.onkeypress = self.onkeypress;
		};

		self.addOffScreen = function (node) {
			node.style.position = 'absolute';
			node.style.top = '-10000px';
			body.lastChild
				? body.insertBefore(node, body.lastChild)
				: body.appendChild(node);
			return node;
		};

		self.createIFrame = function (name) {
			var div = document.createElement('DIV');
			div.innerHTML = '<iframe name="' + name + '"></iframe>';
			return self.addOffScreen(div);
		};

		self.submit = function (refURL, sel, comment) {
			var name = 'orphus_ifr';
			self.iframe = self.iframe || self.createIFrame(name);

			var form = document.createElement('FORM');
			form.action = self.opt.action;
			form.method = 'post';
			form.target = name;

			var query = {
				version: self.opt.version,
				email: self.deobfuscate(self.opt.email),
				to: self.opt.strings.to,
				subject: self.opt.strings.subject,
				ref: refURL,
				c_pre: sel.pre,
				c_sel: sel.text,
				c_suf: sel.suf,
				c_pos: sel.pos,
				c_tag1: self.opt.c_tag1,
				c_tag2: self.opt.c_tag2,
				charset: document.charset || document.characterSet || '',
				comment: comment,
			};

			for (var name in query) {
				var input = document.createElement('INPUT');
				input.type = 'hidden';
				input.name = name;
				input.value = query[name];
				form.appendChild(input);
			}

			self.addOffScreen(form);
			form.submit();
			form.parentNode.removeChild(form);
		};

		self.windowInfo = function () {
			var width = 0;
			var height = 0;

			if (typeof window.innerWidth == 'number') {
				width = window.innerWidth;
				height = window.innerHeight;
			} else if (docEl && (docEl.clientWidth || docEl.clientHeight)) {
				width = docEl.clientWidth;
				height = docEl.clientHeight;
			} else if (body && (body.clientWidth || body.clientHeight)) {
				width = body.clientWidth;
				height = body.clientHeight;
			}

			var scrollLeft = 0;
			var scrollTop = 0;

			if (typeof window.pageYOffset == 'number') {
				scrollTop = window.pageYOffset;
				scrollLeft = window.pageXOffset;
			} else if (body && (body.scrollLeft || body.scrollTop)) {
				scrollTop = body.scrollTop;
				scrollLeft = body.scrollLeft;
			} else if (docEl && (docEl.scrollLeft || docEl.scrollTop)) {
				scrollTop = docEl.scrollTop;
				scrollLeft = docEl.scrollLeft;
			}

			return {
				width: width,
				height: height,
				scrollLeft: scrollLeft,
				scrollTop: scrollTop,
			};
		};

		self.showFor = function (context, submit) {
			if (self.submitted) {
				return;
			}

			self.submitted = true;
			var div = document.createElement('DIV');
			var width = Math.min(self.opt.maxWidth, body.clientWidth);

			div.innerHTML =
				'<div class="orphus" id="orphusp">' +
				'<h2 class="orphus__title">Благодарю за внимательность!</h2>' +
				'<div class="orphus__block">' +
				'<div class="orphus__legend">' +
				self.opt.strings.intextmsg +
				'</div>' +
				'<div class="orphus__fragment">' +
				context
					.replace(self.opt.c_tag1, '<mark>')
					.replace(self.opt.c_tag2, '</mark>') +
				'</div>' +
				'</div>' +
				'<div class="orphus__hint">' +
				self.opt.strings.ifsendmsg.replace(/\r?\n/, '<br>') +
				'</div>' +
				'<form class="orphus__form">' +
				'<div class="orphus__comment">' +
				self.opt.strings.entercmnt +
				'</div>' +
				'<input class="orphus__input-text" type="text" maxlength="250">' +
				'<div class="orphus__buttons">' +
				'<input class="button orphus__button  orphus__button--submit" type="submit" value="' +
				self.opt.strings.send +
				'">' +
				'&nbsp;' +
				'<input class="button orphus__button  orphus__button--cancel" type="button" value="' +
				self.opt.strings.cancel +
				'">' +
				'</div>' +
				'</form>' +
				'</>';

			self.addOffScreen(div);
			var inputs = div.getElementsByTagName('input');
			var forms = div.getElementsByTagName('form');
			var commentInput = inputs[0];
			var origOnKeyDown = null;

			var end = function () {
				document.onkeydown = origOnKeyDown;
				origOnKeyDown = null;
				div.parentNode.removeChild(div);
				self.submitted = false;
				self.lastComment = commentInput.value;
			};

			setTimeout(function () {
				var divWidth = div.clientWidth;
				var divHeight = div.clientHeight;
				var win = self.windowInfo();

				var x = (win.width - divWidth) / 2 + win.scrollLeft;
				var y = (win.height - divHeight) / 2 + win.scrollTop;
				div.style.left = x + 'px';
				div.style.top = y + 'px';

				commentInput.value = self.lastComment;
				commentInput.focus();
				commentInput.select();
				origOnKeyDown = document.onkeydown;

				document.onkeydown = function (e) {
					e = e || window.event;
					if (e.keyCode == 27) {
						end();
					}
				};

				forms[0].onsubmit = function () {
					try {
						submit(commentInput.value);
					} catch (e) {
						alert(self.opt.strings.submitex + '\n\n' + e);
					}
					end();
					self.lastComment = '';
					return false;
				};

				inputs[2].onclick = end;
			}, 10);
		};

		self.cleanString = function (s) {
			return ('' + s).replace(/[\r\n]+/g, ' ').replace(/^\s+|\s+$/g, '');
		};

		self.getSelection = function () {
			var docSel = null;

			if (window.getSelection) {
				docSel = window.getSelection();
			} else if (document.getSelection) {
				docSel = document.getSelection();
			} else {
				docSel = document.selection;
			}

			if (docSel == null) {
				throw 'null getSelection()';
			}

			var pre = '';
			var text = null;
			var suf = '';
			var pos = -1;

			if (docSel.getRangeAt) {
				if (!docSel.rangeCount) {
					return;
				}
				var range = docSel.getRangeAt(0);
				text = range.toString();
				var newRange = document.createRange();
				newRange.setStartBefore(range.startContainer.ownerDocument.body);
				newRange.setEnd(range.startContainer, range.startOffset);
				pre = newRange.toString();
				var newRange = range.cloneRange();
				newRange.setStart(range.endContainer, range.endOffset);
				newRange.setEndAfter(range.endContainer.ownerDocument.body);
				suf = newRange.toString();
			} else if (docSel.createRange) {
				var range = docSel.createRange();
				text = range.text;
				var newRange = docSel.createRange();
				newRange.moveStart('character', -self.opt.contextLength);
				newRange.moveEnd('character', -text.length);
				pre = newRange.text;
				var newRange = docSel.createRange();
				newRange.moveEnd('character', self.opt.contextLength);
				newRange.moveStart('character', text.length);
				suf = newRange.text;
			} else {
				text = '' + docSel;
			}

			var p;
			var s = (p = text.match(/^(\s*)/)) && p[0].length;
			var e = (p = text.match(/(\s*)$/)) && p[0].length;
			pre = pre + text.substring(0, s);
			suf = text.substring(text.length - e, text.length) + suf;
			text = text.substring(s, text.length - e);

			if (text != '') {
				return {
					pre: pre,
					text: text,
					suf: suf,
					pos: pos,
				};
			}
		};

		self.show = function () {
			try {
				var sel = self.getSelection();
			} catch (e) {
				alert(self.opt.strings.badbrowser);
				return;
			}

			if (!sel) {
				var msg = [
					self.opt.strings.name + ' v' + self.opt.version,
					self.opt.strings.author,
					'',
					self.opt.strings.alt,
					'',
					self.opt.strings.gohome,
				];

				if (confirm(msg.join('\n'))) {
					window.open(self.opt.homepage, '_blank');
				}

				return;
			}

			sel.pre = sel.pre
				.substring(sel.pre.length - self.opt.contextLength, sel.pre.length)
				.replace(/^\S{1,10}\s+/, '');
			sel.suf = sel.suf
				.substring(0, self.opt.contextLength)
				.replace(/\s+\S{1,10}$/, '');
			var context = self.cleanString(
				sel.pre + self.opt.c_tag1 + sel.text + self.opt.c_tag2 + sel.suf,
			);

			if (context.length > self.opt.maxSelection) {
				alert(self.opt.strings.toobig);
			} else {
				self.showFor(context, function (comment) {
					self.submit(document.location.href, sel, comment);
				});
			}
		};

		self.onkeypress = function (e) {
			var handle = false;
			var we = window.event;

			if (we) {
				handle = we.keyCode == 10 || (we.keyCode == 13 && we.ctrlKey);
			} else if (e) {
				handle =
					(e.which == 10 && e.modifiers == 2) ||
					(e.keyCode == 0 && e.charCode == 106 && e.ctrlKey) ||
					(e.keyCode == 13 && e.ctrlKey);
			}

			if (handle) {
				self.show();
				return false;
			}
		};

		self.run();
	})();
}
