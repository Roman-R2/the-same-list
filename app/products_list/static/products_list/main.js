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
    this.getListsWithProducts();
  }

  getListsWithProducts() {
    /**
     * Получает объект, содержащий списки и продукты по спискам
     */
    const lists = new FetchClass().fetchJSONFromURL('http://localhost:8000/api/v1/get_lists_and_products/');
    console.log(lists);

    const catchUserLists = async () => {
      const listsObj = await lists;

      console.log(listsObj);

      // Отрисуем списки продуктов для пользователя
      this.drawProductLists(listsObj);

      // Отрисуем продукты в конкретном списке
      this.drawProductsForId(listsObj, Object.keys(listsObj)[0]);

      // Добавим функционала при клике на списки пользователя
      this.setFunctionalForClickProductsList(listsObj);
    };

    catchUserLists();
  }

  drawProductLists(lists) {
    let str = ``;
    Object.keys(lists).forEach((id) => {
      str += `<a href="#" style="text-decoration: none;">
                <li class="list-group-item" data-id="${id}">${lists[id]['name']}</li>
              </a>`;
    });
    // Вставим строки с названиями списков
    this.productListsEl.insertAdjacentHTML('beforeend', str);
  }

  drawProductsForId(listsObj, list_id) {
    this.addActiveClassForList(list_id);
    this.clearProductsFromLabels();
    let str = ``;
    let odj = listsObj[list_id]['products'];
    Object.keys(odj).forEach(product_id => {
      str += `<label class="list-group-item">
                  <input class="form-check-input me-1" type="checkbox" value="">
                  ${odj[product_id]}
              </label>`;
    });
    // Вставим строки с названиями продуктов
    this.productsEl.insertAdjacentHTML('beforeend', str);
  }

  setFunctionalForClickProductsList(listsObj) {
    this.productListsEl.addEventListener('click', ({target}) => {
      if (target.tagName === "LI") {
        this.drawProductsForId(listsObj, target.dataset.id);
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
      const products = new FetchClass().fetchJSONFromURL('http://localhost:8000/api/v1/get_products_dict/');

      const catchProducts = async () => {
        const productsObj = await products;

        this.renderAdditionProductButtons(productsObj);

        // Событие клика по кнопкам продукта productChoiceEl
        this.setEventForClickNewProduct();

        // Событие расфокусировки с поля addProductInputEl
        this.setEventForOutingFromNewProductInput();

      };

      catchProducts();

    });
  }

  setEventForClickNewProduct() {
    /**
     * Добавляет событие клика по кнопкам продукта productChoiceEl
     */
    this.productChoiceEl.addEventListener('click', ({target}) => {
      this.clearProductButtonsFromWindow();
      if (target.tagName === "A") {
        console.log('click');
        this.sendJSON(this.getListId(), target.dataset.productid);
      }
    })
  }

  setEventForOutingFromNewProductInput() {
    this.addProductInputEl.addEventListener('blur', ({target}) => {
      console.log('change input');
      window.setTimeout(() => {
        this.clearProductButtonsFromWindow();
      }, 100);
    });
  }

  renderAdditionProductButtons(renderObj) {
    /**
     * Отрисовывает кнопки добавления новых продуктов в список
     * @type {string}
     */
    let str = ``;

    Object.keys(renderObj).forEach(product_id => {
      str += `<a href="#" class="bblock" data-productid="${product_id}">${renderObj[product_id]}</a>`;
    });

    this.clearProductButtonsFromWindow();
    this.productChoiceEl.insertAdjacentHTML('beforeend', str);
  }

  clearProductButtonsFromWindow() {
    /**
     * Очищает кнопки для добавления новых продуктов с экрана
     * @type {string}
     */
    this.productChoiceEl.innerHTML = "";
  }

  blurArea() {
    console.log('реализовать')
  }

  getListId() {
    /**
     * Получает id активного списка продуктов на странице
     * @type {number}
     */
    let list_id = 0;
    let productListsEl = document.querySelectorAll('#productLists li');
    productListsEl.forEach(el => {
      if (el.classList.contains('active')) {
        list_id = el.dataset.id;
      }
    })
    if (list_id) {
      return list_id
    } else {
      throw new Error(`Не удалось получить идентификатор списка продуктов пользователя`);
    }
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

class FetchClass {
  fetchJSONFromURL(url) {
    /**
     * Получает promice для последующего использования в async/await
     */
    return fetch(url)
      .then((response) => response.json())
      .then((result) => {
        return result;
      });
  }
}