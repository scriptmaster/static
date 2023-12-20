// efga.js
function addEvent(name, cb) {
	document.addEventListener(name, cb);
}

function qS(){return document.querySelector.apply(document, arguments)}
function cE(){return document.createElement.apply(document, arguments)}
const q=qS;

const draggable = {
	el: null,
	startX: 0,
	startY: 0,
	elX: 0,
	elY: 0,
};

addEvent('pointerdown', function(ev){
	if(ev.target.nodeName=='LEGEND') {
		const el = draggable.el = ev.target.parentNode;
		// ev.target.style.left = px(ev.target.parentNode.offsetLeft);
		// ev.target.style.top = px(ev.target.parentNode.offsetTop);
		console.log('el:', el.style.left);
		draggable.elX = parseInt(el.style.left, 10) || 0; // ev.target.parentNode.offsetLeft;
		draggable.elY = parseInt(el.style.top, 10) || 0; // ev.target.parentNode.offsetTop;
		draggable.startX = ev.x;
		draggable.startY = ev.y;
		console.log('ev:', ev);
		ev.preventDefault();
	} else {
		draggable.el = null;
	}
});

addEvent('pointermove', function(ev) {
	if (draggable.el) {
		//ev.preventDefault();
		//console.log('pointermove:', ev.offsetX, draggable.startX, draggable.el);
		draggable.el.style.left = px(draggable.elX + (ev.x - draggable.startX))
		draggable.el.style.top = px(draggable.elY + (ev.y - draggable.startY))
		//console.log('draggable.el.parentNode.style.left', draggable.el.parentNode.style.left);
	}
})

addEvent('pointerup', function(ev) {
	draggable.el = null;
})

function px(n){return parseInt(n, 10)+'px'}

function create(name) {
	// alert(name);
	switch(name) {
	case 'entity':
	case 'e':
		prompter.show((name) => {
			s('#efga', s('div', { class: 'efga e' }, s('legend', name)));
		})
		// alert('create this entity');
		break;
    case 'upload':
        prompter.show((name) => {
            alert(name);
        });
        break;
	}
}

function s(name, attrs, children) {
	if(arguments.length == 2) { children = attrs; attrs = {}; }
	const el = (() => { 
		if(typeof name == 'string') {
			if(name.startsWith('.') || name.startsWith('#')) {
				const sel = qS(name);
				if (sel) return sel;
				if (name.startsWith('.')) return s('div', {class: name.substr(1)}, 0);
				if (name.startsWith('#')) return s('div', {id: name.substr(1)}, 0);
			} else {
				return cE(name || 'div');
			}
		}
	})();
	Object.keys(attrs || {}).forEach((k) => {
		if(k == 'class') {
			(attrs[k]||'').split(/\W+/).forEach(c => el.classList.add(c));
		} else {
			el.setAttribute(k, (attrs[k]||'').toString())
		}
	});
	if (children) createChildren(el, children);
	function createChildren(el, children) {
		// console.log('createChildren', el, children);
		if(children) {
			if(typeof children == 'string') {
				el.innerText = children;
			} else if (typeof children == 'object') {
				if (children instanceof HTMLElement) {
					const p = attrs? attrs.teleport || attrs.parent || el: el;
					if (p && p instanceof HTMLElement) p.appendChild(children);
					else el.appendChild(children);
				} else if (children instanceof Array) {
					children.forEach(child => {
						createChildren(el, children);
					})
				} else if (children instanceof TrustedInnerHTML) {
					el.innerHTML = children.html || '';
				}
			}
		}
	}
	return el;
}

function trusted(html) {
	return new TrustedInnerHTML(html);
}

class TrustedInnerHTML {
	html = ''
	constructor(html = '') {
		this.html = html;
	}
}

const prompter = {
	show(cb, formNumber) {
		if (window.debug) console.log('show:', hideModal);
		const modal = q('#modal');
		modal.classList.add('top-show');
		if(cb && typeof cb == 'function') {
			this.callback = function() {
				cb.apply(this, arguments);
				hideModal();
			}
		}
		q('#modal input').focus();
		function hideModal(ev) {
			if(!ev || ev.target === modal) {
				modal.classList.remove('top-show');
				modal.removeEventListener('pointerdown', modalClick);
				document.removeEventListener('keydown', modalEscape);
			}
		}
		const modalClick  = modal.addEventListener('pointerdown', hideModal);
		const modalEscape = document.addEventListener('keydown', function(ev){ if(ev.key == 'Escape') hideModal(); console.log('document:keydown:', ev); });
	}
	// callback = function(){}
};

function promptSubmit() {
	if (window.debug) console.log('promptSubmit');
	const input = q('#modal .prompt input');
	if (window.debug) console.log(input.value);
	if(prompter && typeof prompter.callback == 'function') {
		prompter.callback(input.value);
	}
	input.value='';
}
