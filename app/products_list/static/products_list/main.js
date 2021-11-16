'use strict';

class ProductList {
  /**
   * Класс служит для отобрабения списков и продуктов по спискам
   * @type {Element}
   */
  productListsEl = document.querySelector('#productLists');
  productsEl = document.querySelector('#products');


  constructor(lists) {
    this.lists = lists;

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
    Object.keys(odj).forEach(product_id => {
      str += `<label class="list-group-item">
                  <input class="form-check-input me-1" type="checkbox" value="">
                  ${odj[product_id]}
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

class AddProductInput {
  /**
   * Класс служит для функционала добавления продуктов в поле inpyt
   * @type {Element}
   */
  addProductInputEl = document.querySelector('#addProductInput');
  productChoiceEl = document.querySelector('#productChoice');

  init() {
    console.log('init AddProductInput');
    this.focusOnProductInput();
    // this.blurArea();
  }

  focusOnProductInput() {
    // Событие на фокусировку поля
    this.addProductInputEl.addEventListener('focus', ({target}) => {

      // Вернем объект с продуктами,а когда придет информация от сервера то забирем продукты в объект allProducts класса AddProductInput
      const products = fetch("http://localhost:8000/api/v1/get_products_dict/")
        .then((response) => response.json())
        .then((products) => {
          return products;
        });

      const catchProducts = async () => {
        const p = await products;
        console.log(p);
        let str = ``;
        //productChoiceEl.textContent = JSON.stringify(p, null, 4);

        Object.keys(p).forEach(product_id => {
          str += `<a href="#" class="bblock" onclick="new AddProductInput().sendJSON(111, ${ product_id});">${p[product_id]}</a>`;
        });

        this.clearProductButtonsFromWindow();
        this.productChoiceEl.insertAdjacentHTML('beforeend', str);

        // Событие клика по кнопке продукта
        this.productChoiceEl.addEventListener('click', ({target}) => {
          this.clearProductButtonsFromWindow();
          console.log('click')
        })

        // Событие расфокусировку с поля
        this.addProductInputEl.addEventListener('blur', ({target}) => {
          console.log('change input');
          window.setTimeout(() => {
            this.clearProductButtonsFromWindow();
          }, 100);
        });

      };

      catchProducts();

    });


  }

  clearProductButtonsFromWindow(){
    this.productChoiceEl.innerHTML = "";
  }

  blurArea() {
    console.log('реализовать')
  }

  sendJSON(list_id, product_id) {
    let xhr = new XMLHttpRequest();
    let url = "http://localhost:8000/api/v1/add_product/";
    // открываем соединение
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    // когда придёт ответ на наше обращение к серверу, мы его обработаем здесь
    xhr.onreadystatechange = function () {
      // если запрос принят и сервер ответил, что всё в порядке
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log(this.responseText);
      }
    };
    // преобразуем наши данные JSON в строку
    let data = JSON.stringify({"product_id": product_id, "list_id": list_id});
    // когда всё готово, отправляем JSON на сервер
    xhr.send(data);
  }
}