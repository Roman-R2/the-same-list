'use strict';

class ProductList {
  productListsEl = document.querySelector('#productLists');
  productsEl = document.querySelector('#products');


  constructor(lists) {
    this.lists = lists;
    console.log(this.lists);
    console.log(this.productListsEl);
    console.log(this.productsEl);

  }

  init() {
    this.draw_product_lists();
    this.draw_products_for_id(Object.keys(this.lists)[0]);
    this.setFunctionalForClickProductsList();
  }

  draw_product_lists() {
    let str = ``;
    Object.keys(this.lists).forEach((id) => {
      str += `<a href="#" style="text-decoration: none;">
                <li class="list-group-item" data-id="${id}">${this.lists[id]['name']}</li>
              </a>`;
    });
    // Вставим строки с названиями списков
    this.productListsEl.insertAdjacentHTML('beforeend', str);
  }

  draw_products_for_id(id) {
    this.addActiveClassForList(id);
    this.clearProductsFromLabels();
    let str = ``;
    let odj = this.lists[id]['products'];
    Object.keys(odj).forEach(priduct_id => {
      str += `<label class="list-group-item">
                  <input class="form-check-input me-1" type="checkbox" value="">
                  ${odj[priduct_id]}
              </label>`;
    });
    // Вставим строки с названиями продуктов
    this.productsEl.insertAdjacentHTML('beforeend', str);
  }

  setFunctionalForClickProductsList() {
    this.productListsEl.addEventListener('click', ({target}) => {
      if (target.tagName === "LI") {
        this.draw_products_for_id(target.dataset.id);
      }
    });
  }

  clearProductsFromLabels() {
    this.productsEl.innerHTML = '';
  }

  addActiveClassForList(id) {
    this.productListsEl.querySelectorAll('li').forEach(el => {
      if (el.dataset.id == id) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

}