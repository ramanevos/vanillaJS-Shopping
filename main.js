/* eslint-disable no-param-reassign */

let cart = (JSON.parse(localStorage.getItem('cart')) || []);

const cartDOM = document.querySelector('.cart');
const addToCartButtonsDOM = document.querySelectorAll('[data-action="ADD_TO_CART"]');
const clearCartButtonDOM = document.querySelector('[data-action="CLEAR_CART"]');
const payButtonDOM = document.querySelector('[data-action="CHECKOUT"]');
const cartFooterTotal = document.querySelector('.cart-footer__total');

function insertItemToDOM(product) {
  cartDOM.insertAdjacentHTML('beforeend', `
        <div class="cart__item">
            <img class="cart__item__image" src="${product.image}" alt="${product.name}">
            <h3 class="cart__item__name">${product.name}</h3>
            <h3 class="cart__item__price">${product.price}</h3>
            <button class="btn btn--primary cart__btn" data-action="DECREASE_ITEM" ${(product.quantity === 1 ? 'disabled' : '')}>&#9866;</button>
            <h3 class="cart__item__quantity">${product.quantity}</h3>
            <button class="btn btn--primary cart__btn" data-action="INCREASE_ITEM">&#10010;</button>
            <button class="btn btn--danger cart__btn" data-action="REMOVE_ITEM">&#10006;</button>
        </div>
    `);
  clearCartButtonDOM.disabled = false;
  payButtonDOM.disabled = false;
}

function countCartTotal() {
  let cartTotal = 0;
  cart.forEach((cartItem) => { cartTotal += cartItem.quantity * cartItem.price; });
  cartFooterTotal.innerText = cartTotal;
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  countCartTotal();
}

function increaseItem(product, cartItemDOM) {
  cart.forEach((cartItem) => {
    if (cartItem.name === product.name) {
      cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').disabled = false;
      cartItem.quantity += 1;
      cartItemDOM.querySelector('.cart__item__quantity').innerText = cartItem.quantity;
      saveCart();
    }
  });
}

function decreaseItem(product, cartItemDOM) {
  cart.forEach((cartItem) => {
    if (cartItem.name === product.name) {
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        cartItemDOM.querySelector('.cart__item__quantity').innerText = cartItem.quantity;
        if (cartItem.quantity === 1) {
          cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').disabled = true;
        }
        saveCart();
      }
    }
  });
}

function removeItem(product, cartItemDOM, addToCartButtonDOM) {
  cart.forEach((cartItem) => {
    if (cartItem.name === product.name) {
      cartItemDOM.classList.add('cart__item--removed');
      setTimeout(() => cartItemDOM.remove(), 250);
      cart = cart.filter(item => item.name !== product.name);
      addToCartButtonDOM.innerText = 'Add To Cart';
      addToCartButtonDOM.disabled = false;
      saveCart();
    }
  });
}

function handleActionButtons(addToCartButtonDOM, product) {
  addToCartButtonDOM.innerText = 'In Cart';
  addToCartButtonDOM.disabled = true;

  const cartItemsDOM = cartDOM.querySelectorAll('.cart__item');
  cartItemsDOM.forEach((cartItemDOM) => {
    if (cartItemDOM.querySelector('.cart__item__name').innerText === product.name) {
      cartItemDOM.querySelector('[data-action="INCREASE_ITEM"]').addEventListener('click', () => increaseItem(product, cartItemDOM));
      cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').addEventListener('click', () => decreaseItem(product, cartItemDOM));
      cartItemDOM.querySelector('[data-action="REMOVE_ITEM"]').addEventListener('click', () => {
        removeItem(product, cartItemDOM, addToCartButtonDOM);
        if (cart.length < 1) {
          clearCartButtonDOM.disabled = true;
          payButtonDOM.disabled = true;
        }
      });
    }
  });
}

function clearCart() {
  cartDOM.querySelectorAll('.cart__item').forEach((cartItemDOM) => {
    cartItemDOM.classList.add('cart__item--removed');
    setTimeout(() => cartItemDOM.remove(), 250);
  });
  cart = [];
  localStorage.removeItem('cart');
  clearCartButtonDOM.disabled = true;
  payButtonDOM.disabled = true;
  addToCartButtonsDOM.forEach((addToCartButtonDOM) => {
    addToCartButtonDOM.innerText = 'Add To Cart';
    addToCartButtonDOM.disabled = false;
  });
  countCartTotal();
}





clearCartButtonDOM.addEventListener('click', () => clearCart());
payButtonDOM.addEventListener('click', () => checkout());

if (cart.length > 0) {
  cart.forEach((cartItem) => {
    const product = cartItem;
    insertItemToDOM(product);
    countCartTotal();

    addToCartButtonsDOM.forEach((addToCartButtonDOM) => {
      const productDOM = addToCartButtonDOM.parentNode;

      if (productDOM.querySelector('.product__name').innerText === product.name) {
        handleActionButtons(addToCartButtonDOM, product);
      }
    });
  });
}

addToCartButtonsDOM.forEach((addToCartButtonDOM) => {
  addToCartButtonDOM.addEventListener('click', () => {
    const productDOM = addToCartButtonDOM.parentNode;
    const product = {
      image: productDOM.querySelector('.product__image img').getAttribute('src'),
      name: productDOM.querySelector('.product__name').innerText,
      price: productDOM.querySelector('.product__price').innerText,
      quantity: 1,
    };

    const isInCart = cart.filter(cartItem => (cartItem.name === product.name)).length > 0;
    if (!isInCart) {
      insertItemToDOM(product);
      cart.push(product);
      saveCart();
      handleActionButtons(addToCartButtonDOM, product);
    }
  });
});
