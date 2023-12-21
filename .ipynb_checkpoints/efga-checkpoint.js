// efga.js Copyright 2003-2030 M Sheriff <msheriffusa@gmail.com> All rights reserved.
function qS(selector, el = document){return el.querySelector(selector)}
function qSA(selector, el = document){return el.querySelectorAll(selector)}
function cE(){return document.createElement.apply(document, arguments)}
function addEvent(name, cb, el = document) { el.addEventListener(name, cb); }
function removeEvent(name, cb, el = document) { el.removeEventListener(name, cb); }

const q=qS;
const UPLOAD_URI = '/upload';

const draggable = {
	el: null,
	startX: 0,
	startY: 0,
	elX: 0,
	elY: 0,
};

addEvent('DOMContentLoaded', main_kernel);

function px(n){return parseInt(n, 10)+'px'}

function create(name) {
	switch(name) {
	case 'entity':
	case 'e':
		prompter.show('text-prompt', (v) => {
			s('#efga', s('div', { class: 'efga e' }, s('legend', v)));
		})
		break;
    case 'upload':
        prompter.show('upload', (filename, input) => {
            uploadFiles(input.files);
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
	show(formNameOrNumber, cb) {
		if (window.debug) console.log('show:', hideModal)
		const modal = q('#modal')
		modal.classList.add('top-show')
		modal.classList.remove('top-hide')
        document.forms[formNameOrNumber]?.classList?.add('visible')
		if(cb && typeof cb == 'function') {
			this.callback = function() {
				cb.apply(this, arguments)
				hideModal()
			}
		}
		q('#modal input').focus()
		function hideModal(ev) {
			if(!ev || ev.target === modal) {
				modal?.classList?.remove('top-show')
				modal?.classList?.add('top-hide')
				removeEvent('pointerdown', modalClick, modal)
				removeEvent('keydown', modalEscape)
                q('#modal form.visible')?.classList?.remove('visible')
			}
		}
		const modalClick  = addEvent('pointerdown', hideModal, modal)
		const modalEscape = addEvent('keydown', (ev) => { if(ev.key == 'Escape') hideModal() })
	}
	// callback = function(){}
};

function promptSubmit(form) {
	if (window.debug) console.log('promptSubmit', form);
	const input = q('input', form);
	if (window.debug) console.log(input.value);
	if(prompter && typeof prompter.callback == 'function') {
		prompter.callback(input.value, input);
	}
	if (input.type=='text') input.value='';
}

function uploadFiles(files) {
    console.log('uploadFiles', files);
    const request = new XMLHttpRequest();
    const formData = new FormData();

    request.open("POST", UPLOAD_URI, true);
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
          console.log(request.responseText);
        }
    };

    for (let i = 0; i < files.length; i++) {
        //formData.append(files[i].name, files[i])
        formData.append('file', files[i])
    }
    request.send(formData);
}

function main_kernel() {
    // .. // .. //
    qSA('#modal form').forEach(form => addEvent('submit', (ev) => { ev.preventDefault(); promptSubmit(ev.target) }, form))

    addEvent('pointerdown', function(ev){
    	if(ev.target.nodeName.toUpperCase()=='LEGEND') {
    		const el = draggable.el = ev.target.parentNode;
    
            draggable.elX = parseInt(el.style.left, 10) || 0; // ev.target.parentNode.offsetLeft;
    		draggable.elY = parseInt(el.style.top, 10) || 0; // ev.target.parentNode.offsetTop;
    		draggable.startX = ev.x;
    		draggable.startY = ev.y;
    
            ev.preventDefault();
    	} else {
    		draggable.el = null;
    	}
    });
    
    addEvent('pointermove', function(ev) {
    	if (draggable.el) {
    		draggable.el.style.left = px(draggable.elX + (ev.x - draggable.startX))
    		draggable.el.style.top = px(draggable.elY + (ev.y - draggable.startY))
    	}
    })
    
    addEvent('pointerup', function(ev) {
    	draggable.el = null;
    })

}
