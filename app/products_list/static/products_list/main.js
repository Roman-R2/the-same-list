'use strict';

// -----------------------------------------------------------
//--------------------- SomeJsonRequests ---------------------
// -----------------------------------------------------------
class SomeJsonRequests {
  /**
   * Класс для выполнения запросов к серверу и возвращения Promise
   * @returns {Promise<unknown>}
   */

  sendJSONRequest(url, json) {
    return new Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      let data = JSON.stringify(json);
      xhr.send(data);
    });
  }
}

// -----------------------------------------------------------
//--------------------- ProductListV2 ------------------------
// -----------------------------------------------------------
class ProductListV2 {
  /**
   * Версия вторая
   * Класс служит для:
   *  1. отображения списков и продуктов по спискам
   *  1. назначения и обработки функционала поля ввода новых продуктов
   * @type {Element}
   */
  productListsEl = document.querySelector('#productLists');
  productsEl = document.querySelector('#products');
  addProductInputEl = document.querySelector('#addProductInput');
  productChoiceEl = document.querySelector('#productChoice');
  receivedListObj = {}

  init() {
    // Получим список с сервера
    this.getListsWithProducts();
    // Навесим событие на поле добавления новых продуктов
    this.AddEventFocusOnProductInput();
  }


//----------- Все, что связано со списками и продуктами в них ----------------
// ---------------------------------------------------------------------------
  getListsWithProducts() {
    /**
     * Получает объект списков с продуктами и передает полученный объект listsObj далее на обработку
     * методу workWithTheReceivedList
     * @type {Promise<any>}
     */
    const lists = new FetchClass()
      .fetchJSONFromURL('http://localhost:8000/api/v1/get_lists_and_products/');

    const catchUserLists = async () => {
      const listsObj = await lists;

      // Добавим полученный объект в свойство класса
      this.addListObjectToClass(listsObj);

      //Начнем отрисовке на основе полученного объекта
      this.workWithTheReceivedList(listsObj)
    };
    catchUserLists().then();
  }

  addListObjectToClass(receivedListObj) {
    this.receivedListObj = receivedListObj;
  }

  workWithTheReceivedList() {
    /**
     * Производит с полученным объектом действия добавления событий и отрисовки
     */

    console.log(this.receivedListObj);


    // Отрисуем списки продуктов для пользователя
    this.drawProductLists(this.receivedListObj);

    // Отрисуем продукты в первом списке и добавим выделение
    this.drawProductsForListId(Object.keys(this.receivedListObj)[0]);
    this.addActiveClassForList(Object.keys(this.receivedListObj)[0]);

    // Добавим функционала при клике на списки пользователя
    this.setFunctionalForClickProductsList();

  }

  drawOneProductToEndListAndAddToObject(listId, productId, productName) {
    let str = ``;
    str += `<label class="list-group-item">
                  <input class="form-check-input me-1" type="checkbox" value="" data-id="${productId}">
                  ${productName}
              </label>`;
    this.productsEl.insertAdjacentHTML('beforeend', str);
    this.addProductToObjectInClass(listId, productId, productName);
  }

  addProductToObjectInClass(listId, productId, productName) {
    /**
     * Добавит продукт в объект списков класса ProductListV2 по переданным аргументам
     */
    console.log(this.receivedListObj[listId]['products'])
    this.receivedListObj[listId]['products'][productId] = productName;
    console.log(this.receivedListObj[listId]['products'])

  }

  askForProductAndDrawInList(listId, productId) {
    /**
     * Отправит запрос на сервер и дорисует новый продукт productId в конец списка listId
     * @type {XMLHttpRequest}
     */

    // ------------ Конструкция асинхронного запроса--------------
    new SomeJsonRequests().sendJSONRequest(
      document.location.origin + "/api/v1/get_product_name_for_id/",
      {"product_id": productId}
    ).then((data) => {
      let product = JSON.parse(data);
      console.log('-------------> ', product.product_name)
      this.drawOneProductToEndListAndAddToObject(listId, productId, product.product_name);
      console.log(this);

    }).catch((err) => {
      console.error('Ошибка запроса к серверу!', err.statusText);
    });
    // ------------------------------------------------------------

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

  drawProductsForListId(listId) {
    this.clearProductsFromLabels();
    let str = ``;
    let odj = this.receivedListObj[listId]['products'];
    Object.keys(odj).forEach(product_id => {
      str += `<label class="list-group-item">
                  <input class="form-check-input me-1" type="checkbox" value="">
                  ${odj[product_id]}
              </label>`;
    });
    // Вставим строки с названиями продуктов
    this.productsEl.insertAdjacentHTML('beforeend', str);
  }

  addActiveClassForList(listId) {
    this.productListsEl.querySelectorAll('li').forEach(el => {
      if (el.dataset.id == listId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  setFunctionalForClickProductsList() {
    this.productListsEl.addEventListener('click', ({target}) => {
      if (target.tagName === "LI") {
        this.drawProductsForListId(target.dataset.id);
        this.addActiveClassForList(target.dataset.id);
      }
    });
  }

  clearProductsFromLabels() {
    this.productsEl.innerHTML = '';
  }


  //----------- Все, что связано сполем ввода новых продуктов ------------------
  // ---------------------------------------------------------------------------
  AddEventFocusOnProductInput() {
    /**
     * Добавляет событие на выбор поля для ввода нового продукта в список
     */
    // Событие на фокусировку поля
    this.addProductInputEl.addEventListener('focus', ({target}) => {

      console.log('addEventListener_focus');
      // Вернем объект с продуктами,а когда придет информация от сервера то забирем продукты в объект allProducts
      const products = new FetchClass().fetchJSONFromURL(document.location.origin + '/api/v1/get_products_dict/');

      const catchProducts = async () => {
        const productsObj = await products;

        this.renderAdditionProductButtons(productsObj);

      };

      catchProducts();

    });

    // Событие клика по кнопкам продукта productChoiceEl
    this.setEventForClickNewProduct();

    // Событие расфокусировки с поля addProductInputEl
    this.setEventForOutingFromNewProductInput();
  }

  setEventForClickNewProduct() {
    /**
     * Добавляет событие клика по кнопкам продукта productChoiceEl и отправляет данные на сервер
     */
    this.productChoiceEl.addEventListener('click', ({target}) => {
      this.clearProductButtonsFromWindow();
      if (target.tagName === "A") {
        console.log('click');

        this.sendJSONNewProductToServer(this.getListId(), target.dataset.productid);

      }
    })
  }

  sendJSONNewProductToServer(listId, productId) {
    /**
     * Отправляет данные о новом продукте на сервер, для его сохранения
     */

    let json = {"product_id": productId, "list_id": listId, "quantity": "500 гр."}

    // ------------ Конструкция асинхронного запроса--------------
    new SomeJsonRequests().sendJSONRequest(
      document.location.origin + "/api/v1/add_product/",
      json
    ).then((data) => {
        let product = JSON.parse(data);
        console.log('-------------> ', product.status)
        // Дорисуем новый продукт в конец списка
        this.askForProductAndDrawInList(listId, productId);

      }
    ).catch((err) => {
      console.error('Ошибка запроса к серверу!', err.statusText);
    });
    // ------------------------------------------------------------
  }

  setEventForOutingFromNewProductInput() {
    /**
     * Уберет все кнопки, показанные при активации поля ввода новых продуктов
     */
    this.addProductInputEl.addEventListener('blur', ({target}) => {
      console.log('change blur');
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


//
// class ProductList {
//   /**
//    * Класс служит для отобрабения списков и продуктов по спискам
//    * @type {Element}
//    */
//   productListsEl = document.querySelector('#productLists');
//   productsEl = document.querySelector('#products');
//
//   init() {
//     this.getListsWithProducts();
//   }
//
//   getListsWithProducts() {
//     /**
//      * Получает объект, содержащий списки и продукты по спискам
//      */
//     const lists = new FetchClass().fetchJSONFromURL('http://localhost:8000/api/v1/get_lists_and_products/');
//
//     const catchUserLists = async () => {
//       const listsObj = await lists;
//
//       // Отрисуем списки продуктов для пользователя
//       this.drawProductLists(listsObj);
//
//       // Отрисуем продукты в конкретном списке
//       this.drawProductsForListId(listsObj, Object.keys(listsObj)[0]);
//
//       // Добавим функционала при клике на списки пользователя
//       this.setFunctionalForClickProductsList(listsObj);
//     };
//
//     catchUserLists();
//   }
//
//   redrawProductsForListId(listId) {
//     /**
//      * Перерисовывает продукты для списка с идентификатором listId
//      */
//
//   }
//
//   drawProductLists(lists) {
//     let str = ``;
//     Object.keys(lists).forEach((id) => {
//       str += `<a href="#" style="text-decoration: none;">
//                 <li class="list-group-item" data-id="${id}">${lists[id]['name']}</li>
//               </a>`;
//     });
//     // Вставим строки с названиями списков
//     this.productListsEl.insertAdjacentHTML('beforeend', str);
//   }
//
//   drawProductsForListId(listsObj, list_id) {
//     this.addActiveClassForList(list_id);
//     this.clearProductsFromLabels();
//     let str = ``;
//     let odj = listsObj[list_id]['products'];
//     Object.keys(odj).forEach(product_id => {
//       str += `<label class="list-group-item">
//                   <input class="form-check-input me-1" type="checkbox" value="">
//                   ${odj[product_id]}
//               </label>`;
//     });
//     // Вставим строки с названиями продуктов
//     this.productsEl.insertAdjacentHTML('beforeend', str);
//   }
//
//   setFunctionalForClickProductsList(listsObj) {
//     this.productListsEl.addEventListener('click', ({target}) => {
//       if (target.tagName === "LI") {
//         this.drawProductsForListId(listsObj, target.dataset.id);
//       }
//     });
//   }
//
//   clearProductsFromLabels() {
//     this.productsEl.innerHTML = '';
//   }
//
//   addActiveClassForList(id) {
//     this.productListsEl.querySelectorAll('li').forEach(el => {
//       if (el.dataset.id == id) {
//         el.classList.add('active');
//       } else {
//         el.classList.remove('active');
//       }
//     });
//   }
//
// }