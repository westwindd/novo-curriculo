var _edgeLen = 60,
    _opacity = 0.75,
    _transitionInterval = 9000,
    _modelName = 'dodecahedron',
    _model,
    _cssRules = '',
    _isPaused = false,
    _isManual = false,
    _dragging = false,
    _isFiredByMouse = true,
    _touchId,
    _lastTransform, _matrix, _spx, _spy,
    _productToRadians,
    _isTransitionStopped = false,
    _transitionTimer,
    _currentTransition = 0;

init();

function init() {
    console.log('Initializing model...');
    appendModel();
    _model.classList.add('animate');
    _transitionTimer = window.setInterval(nextTransition, _transitionInterval);
}

function appendModel() {
    console.log('Appending model...');
    var wrap = document.querySelector(".dodecahedron-wrapper");
    _model = document.createElement("div");
    _model.classList.add(_modelName);
    createModel(_model, _edgeLen, _opacity);
    wrap.appendChild(_model);
    _model.setAttribute('draggable', 'false');
    addEvent(_model, 'mousedown', handleMouseDown);
    addEvent(_model, 'mousemove', handleMouseMove);
    addEvent(document, 'mouseup', handleMouseUp);
    if ('touchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
        addEvent(_model, 'touchstart', handleTouchStart);
        addEvent(_model, 'touchmove', handleTouchMove);
        addEvent(document, 'touchcancel', handleTouchEnd);
        addEvent(document, 'touchend', handleTouchEnd);
    }
}

function addEvent(elm, evt, callback) {
    elm.addEventListener(evt, callback);
    console.log(`Event ${evt} added to element.`);
}

function handleMouseDown(evt) {
    if (!_dragging) {
        console.log('Mouse down event detected.');
        var e = evt || window.event;
        e.preventDefault();
        console.log('Mouse down at coordinates:', e.pageX, e.pageY);
        _isFiredByMouse = true;
        startDragging(e.pageX, e.pageY);
    }
}

function handleMouseMove(evt) {
    if (_dragging && _isFiredByMouse) {
        var e = evt || window.event;
        e.preventDefault();
        console.log('Mouse move at coordinates:', e.pageX, e.pageY);
        whileDragging(e.pageX, e.pageY);
    }
}

function handleMouseUp(evt) {
    if (_dragging && _isFiredByMouse) {
        var e = evt || window.event;
        e.preventDefault();
        console.log('Mouse up event detected.');
        endDragging();
    }
}

function handleTouchStart(evt) {
    var e = evt || window.event;
    if (_dragging && !_isFiredByMouse && e.touches.length == 1) endDragging();
    if (!_dragging) {
        console.log('Touch start event detected.');
        var touch = e.changedTouches[0];
        e.preventDefault();
        console.log('Touch start at coordinates:', touch.pageX, touch.pageY);
        _isFiredByMouse = false;
        _touchId = touch.identifier;
        startDragging(touch.pageX, touch.pageY);
    }
}

function handleTouchMove(evt) {
    if (_dragging && !_isFiredByMouse) {
        var e = evt || window.event,
            touches = e.changedTouches,
            touch;
        for (var i = 0; i < touches.length; i++) {
            touch = touches[i];
            if (touch.identifier === _touchId) {
                e.preventDefault();
                console.log('Touch move at coordinates:', touch.pageX, touch.pageY);
                whileDragging(touch.pageX, touch.pageY);
                break;
            }
        }
    }
}

function handleTouchEnd(evt) {
    if (_dragging && !_isFiredByMouse) {
        var e = evt || window.event,
            touches = e.changedTouches,
            touch;
        for (var i = 0; i < touches.length; i++) {
            touch = touches[i];
            if (touch.identifier === _touchId) {
                e.preventDefault();
                console.log('Touch end event detected.');
                endDragging();
                return;
            }
        }
    }
}

function startDragging(spx, spy) {
    console.log('Start dragging...');
    _spx = spx;
    _spy = spy;
    _dragging = true;
    if (!_isPaused) toggleAnimation();
    if (!_isManual) {
        _lastTransform = window.getComputedStyle(_model).getPropertyValue('transform');
        _matrix = toArray(_lastTransform);
        console.log('Starting drag with transform matrix:', _matrix);
        _model.classList.remove('animate');
        _model.classList.remove('paused');
        _model.style.cssText = addVendorPrefix('transform: ' + _lastTransform + ';');
        _isManual = true;
    }
}

function whileDragging(cpx, cpy) {
    var sx, sy, x = 0, y = 0, z = 0, rad, css;
    if (_spx != cpx || _spy != cpy) {
        sx = (_spy - cpy);
        sy = (cpx - _spx);
        rad = Math.sqrt(sx * sx + sy * sy) * _productToRadians;
        x = sx * _matrix[0] + sy * _matrix[1];
        y = sx * _matrix[4] + sy * _matrix[5];
        z = sx * _matrix[8] + sy * _matrix[9];
        console.log('Dragging with rotate3d:', x, y, z, rad);
        css = 'transform: ' + _lastTransform + ' rotate3d(' + x + ', ' + y + ', ' + z + ', ' + rad + 'rad);';
        _model.style.cssText = addVendorPrefix(css);
    }
}

function endDragging() {
    console.log('End dragging...');
    _dragging = false;
    _lastTransform = window.getComputedStyle(_model).getPropertyValue('transform');
    _matrix = toArray(_lastTransform);
    console.log('End drag with new transform matrix:', _matrix);
}

function toggleAnimation() {
    console.log('Toggling animation...');
    if (_isManual) {
        _model.style.cssText = '';
        _model.classList.add('animate');
        _isManual = false;
        _dragging = false;
    } else {
        if (_isPaused) {
            _model.classList.remove('paused');
        } else {
            _model.classList.add('paused');
        }
    }
    _isPaused ^= true;
}

function toggleTransition() {
    console.log('Toggling transition...');
    if (_isTransitionStopped) {
        _transitionTimer = window.setInterval(nextTransition, _transitionInterval);
    } else {
        window.clearInterval(_transitionTimer);
        uncheckLastOption();
        _currentTransition = 0;
    }
    _isTransitionStopped ^= true;
}

function unpack(idNum) {
    console.log('Unpacking model, id:', idNum);
    if (idNum > 0 && idNum <= 4) {
        uncheckLastOption();
        _model.classList.add('unpack-' + idNum);
        _currentTransition = idNum;
    } else {
        _model.classList.remove('unpack-' + idNum);
        _currentTransition = 0;
    }
}

function uncheckLastOption() {
    if (_currentTransition) {
        _model.classList.remove('unpack-' + _currentTransition);
    }
}

function nextTransition() {
    var t = ~~(Math.random() * 5);
    if (t == _currentTransition) t = ++t % 5;
    console.log('Next transition to:', t);
    if (t) {
        unpack(t);
    } else {
        uncheckLastOption();
        _currentTransition = 0;
    }
}

function toArray(str) {
    var res = [],
        arr = str.substring(9, str.length - 1).split(',');
    for (var i in arr) res.push(parseFloat(arr[i]));
    return res;
}

function addVendorPrefix(property) {
    return '-webkit-' + property +
        '-moz-' + property +
        '-o-' + property +
        property;
}

function getRainbowColor(step, numOfSteps) {
    var h = (step % numOfSteps) / numOfSteps,
        i = ~~(h * 6),
        a = h * 6 - i,
        d = 1 - a;
    switch (i) {
        case 0: r = 1; g = a; b = 0; break;
        case 1: r = d; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = a; break;
        case 3: r = 0; g = d; b = 1; break;
        case 4: r = a; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = d;
    }
    var c = '#' + ('0' + (~~(r * 255)).toString(16)).slice(-2) + ('0' + (~~(g * 255)).toString(16)).slice(-2) + ('0' + (~~(b * 255)).toString(16)).slice(-2);
    return c;
}

function createModel(model, edgeLen, opacity) {
    var w = 2 * edgeLen * Math.cos(Math.PI / 5),
        h = edgeLen * (Math.cos(Math.PI / 10) + Math.sin(Math.PI / 5)),
        ta = Math.atan(2) / 2,
        ty = -edgeLen / 2,
        tz = h * Math.cos(ta),
        style = document.createElement('style');
    _productToRadians = Math.PI / (h + h + edgeLen);
    const orangeColor = '#cc5933'; // Hex code for orange

    model.appendChild(createFace(w, h, ty, 0, 0, 0, tz, ta, edgeLen, orangeColor, opacity, 'face-0'));
    model.appendChild(createFace(w, h, ty, 0, 0, 179.999, tz, ta, edgeLen, orangeColor, opacity, 'face-1'));
    model.appendChild(createFace(w, h, ty, 0, 90, -90, tz, ta, edgeLen, orangeColor, opacity, 'face-2'));
    model.appendChild(createFace(w, h, ty, 0, -90, 90, tz, ta, edgeLen, orangeColor, opacity, 'face-3'));
    model.appendChild(createFace(w, h, ty, 90, 0, 90, tz, ta, edgeLen, orangeColor, opacity, 'face-4'));
    model.appendChild(createFace(w, h, ty, 90, 0, -90, tz, ta, edgeLen, orangeColor, opacity, 'face-5'));
    model.appendChild(createFace(w, h, ty, -90, 0, 90, tz, ta, edgeLen, orangeColor, opacity, 'face-6'));
    model.appendChild(createFace(w, h, ty, -90, 0, -90, tz, ta, edgeLen, orangeColor, opacity, 'face-7'));
    model.appendChild(createFace(w, h, ty, 0, 0, 0, -tz, -ta, edgeLen, orangeColor, opacity, 'face-8'));
    model.appendChild(createFace(w, h, ty, 0, 0, 179.999, -tz, -ta, edgeLen, orangeColor, opacity, 'face-9'));
    model.appendChild(createFace(w, h, ty, 0, 90, 90, tz, ta, edgeLen, orangeColor, opacity, 'face-10'));
    model.appendChild(createFace(w, h, ty, 0, -90, -90, tz, ta, edgeLen, orangeColor, opacity, 'face-11'));
    
    style.type = 'text/css';
    style.id = _modelName + '-style';
    if (style.styleSheet)
        style.styleSheet.cssText = _cssRules;
    else
        style.innerHTML = _cssRules;
    _cssRules = '';
    document.head.appendChild(style);
}

function createFace(w, h, ty, rx, ry, rz, tz, trx, edgeLen, color, opacity, cname) {
    var face = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon'),
        css,
        cssText =
        'margin-left: ' + (-w / 2).toFixed(0) + 'px;' +
        'margin-top: ' + (-h / 2).toFixed(0) + 'px;',
        px = (w - edgeLen) / 2, py = h, angle = Math.PI / 2.5;
    face.setAttribute('width', w.toFixed(0));
    face.setAttribute('height', h.toFixed(0));
    points = px.toFixed(0) + ',' + py.toFixed(0);
    for (var i = 0; i < 5 - 1; i++) {
        px += Math.cos(i * angle) * edgeLen;
        py -= Math.sin(i * angle) * edgeLen;
        points += ' ' + px.toFixed(0) + ',' + py.toFixed(0);
    }
    shape.setAttribute('points', points);
    shape.style.cssText = 'fill:' + color + '; opacity:' + opacity + '; stroke:white; stroke-width:1;';
    css = 'transform: translateY(' + ty.toFixed(0) + 'px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) rotateZ(' + rz + 'deg) translateZ(' + tz.toFixed(0) + 'px) ';
    _cssRules += '.unpack-1 .' + cname + ' {' + addVendorPrefix(css + '!important;') + '}';
    css += 'rotateX(';
    _cssRules += '.unpack-2 .' + cname + ' {' + addVendorPrefix(css + (-trx) + 'rad) !important;') + '}';
    css += trx + 'rad)';
    cssText += addVendorPrefix(css + ';');
    css += ' translateZ(' + (edgeLen * Math.sign(tz)) + 'px) !important;';
    _cssRules += '.unpack-3 .' + cname + ' {' + addVendorPrefix(css) + '}';
    css = 'transform: translateZ(0px) !important;';
    _cssRules += '.unpack-4 .' + cname + '{' + addVendorPrefix(css) + '}';
    face.classList.add(cname);
    face.style.cssText = cssText;
    face.appendChild(shape);
    return face;
}

 /*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
navToggle = document.getElementById('nav-toggle'),
navClose = document.getElementById('nav-close')

/*===== MENU SHOW =====*/
/* Validate if constant exists */
if(navToggle){
navToggle.addEventListener('click', () =>{
  navMenu.classList.add('show-menu')
})
}

/*===== MENU HIDDEN =====*/
/* Validate if constant exists */
if(navClose){
navClose.addEventListener('click', () =>{
  navMenu.classList.remove('show-menu')
})
}

/*=============== REMOVE MENU MOBILE ===============*/
const timelineParagraphs = document.querySelectorAll('.timeline p');

const addMorePadding = () => {
const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
const windowHeight = window.innerHeight || document.documentElement.clientHeight;
const breakPoint = windowHeight * 0.9;

timelineParagraphs.forEach(paragraph => {
  const elementOffset = paragraph.offsetTop;
  const distance = elementOffset - scrollTop;

  if (distance > breakPoint) {
      paragraph.classList.add("more-padding");
  } else {
      paragraph.classList.remove("more-padding");
  }
});
};

window.addEventListener('scroll', addMorePadding);
/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll('.nav__link')

const linkAction = () =>{
const navMenu = document.getElementById('nav-menu')
// When we click on each nav__link, we remove the show-menu class
navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))


/*=============== ADD BLUR TO HEADER ===============*/


/*=============== EMAIL JS ===============*/
const contactForm = document.getElementById('contact-form'),
contactMessage = document.getElementById('contact-message');
const sendEmail = (e) =>{
e.preventDefault()
console.log(e)

emailjs.sendForm('service_kirhniw', 'template_8hfqwlf', '#contact-form', 'bhRt8Oho3PjpQiGWS')
              .then(()=> {
                  contactMessage.textContent = 'Message sent successfully'

                  setTimeout(() =>{
                      contactMessage.textContent = ''
                  }, 5000)

                  contactForm.reset()
              }, () => {
                  contactMessage.textContent = 'Message not sent (service error)'

              })
              
}
contactForm.addEventListener('submit', sendEmail)

/*=============== SHOW SCROLL UP ===============*/ 
const scrollUp = () =>{
const scrollUp = document.getElementById('scroll-up')
// When the scroll is higher than 350 viewport height, add the show-scroll class to the a tag with the scrollup class
this.scrollY >= 350 ? scrollUp.classList.add('show-scroll')
                  : scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () =>{
const scrollDown = window.scrollY

sections.forEach(current =>{
  const sectionHeight = current.offsetHeight,
        sectionTop = current.offsetTop - 58,
        sectionId = current.getAttribute('id'),
        sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')

  if(scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight){
      sectionsClass.classList.add('active-link')
  }else{
      sectionsClass.classList.remove('active-link')
  }                                                    
})
}
window.addEventListener('scroll', scrollActive)

/*=============== SCROLL REVEAL ANIMATION ===============*/
document.addEventListener("DOMContentLoaded", function() {
const homeObserver = new IntersectionObserver(entries => {
entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add('active');
    homeObserver.unobserve(entry.target);
  }
});
}, { threshold: 0.1 });

const aboutObserver = new IntersectionObserver(entries => {
entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add('active');
    aboutObserver.unobserve(entry.target);
  }
});
}, { threshold: 0.1 });

const homeTarget = document.querySelector('.animate-home');
const aboutTarget = document.querySelector('.animate-about');

homeObserver.observe(homeTarget);
aboutObserver.observe(aboutTarget);
});
