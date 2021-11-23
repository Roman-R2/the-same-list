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

  askServerJSONWithPost(url, json) {
    // ------------ Конструкция асинхронного запроса--------------
    this.sendJSONRequest(url, json).then((data) => {
      return JSON.parse(data);
    }).catch((err) => {
      console.error('Ошибка запроса к серверу!', err.statusText);
    });
    // ------------------------------------------------------------
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
  productListEl = document.querySelector('#productLists');
  productsEl = document.querySelector('#products');
  addProductInputEl = document.querySelector('#addProductInput');
  addProductInputButtonEl = document.querySelector('#addProductInputButton');
  productChoiceEl = document.querySelector('#productChoice');
  // Заготовка для объекта, который будет содержать данные со списками продуктов
  // и прикрепленными к ним продуктами
  receivedListObj = {}
  // Заготовка для объекта, который будет содержать данные с типовым словарем всех продуктов для
  // отображения их в кнопках к полю ввода нового продукта
  receivedProductsDictObj = {}

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

      //Начнем отрисовки на основе полученного объекта
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


    // Отобразим списки продуктов для пользователя
    this.drawProductLists(this.receivedListObj);


    if (Object.keys(this.receivedListObj).length !== 0) {
      // Отобразим продукты в первом списке и добавим выделение
      this.drawProductsForListId(Object.keys(this.receivedListObj)[0]);
      this.addActiveClassForList(Object.keys(this.receivedListObj)[0]);

      // Добавим функционала при клике на списки пользователя
      this.setFunctionalForClickProductsList();

      // Добавим функционала при наведении и уходе на списки пользователя для меню
      this.setFunctionalForMouseoverProductsList();
      this.setFunctionalForMouseoutProductsList();
    } else {
      console.log('Пока нет ни одного списка...');
    }


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

  askForProductAndDrawInList(listId, productDictId, newProductId) {
    /**
     * Отправит запрос на сервер и дорисует новый продукт productId в конец списка listId
     * @type {XMLHttpRequest}
     */


    // ------------ Конструкция асинхронного запроса--------------
    new SomeJsonRequests().sendJSONRequest(
      document.location.origin + "/api/v1/get_product_name_for_id/",
      {"productId": productDictId}
    ).then((data) => {
      let product = JSON.parse(data);
      console.log('-------------> ', product.product_name)
      this.drawOneProductToEndListAndAddToObject(listId, newProductId, product.product_name);
      console.log(this);

    }).catch((err) => {
      console.error('Ошибка запроса к серверу!', err.statusText);
    });
    // ------------------------------------------------------------

  }


  drawProductLists(lists) {
    let str = ``;
    Object.keys(lists).forEach((id) => {

      str += `
                <a class="list-group-item list-group-item-action mb-2" data-id="${id}">
                    
                    <small class="menu-area d-none float-end" id="listButtonsMenu" data-id="${id}">
                          <i class="fas fa-ellipsis-v fas-line p-e-none"></i>
                    </small>
                    <div class="d-flex w-75 justify-content-between p-e-none">
                      <h6 class="mb-1 p-e-none" id="listTitle:${id}">${lists[id]['name']}</h6>
                      <input type="text" class="form-control p-e-yes d-none list-title-input" value="${lists[id]['name']}" id="renameListArea:${id}" data-id="${id}">
                    </div>
                    <span class="float-start d-none" id="listButtonsAction" data-id="${id}">
                        <i class="fas fa-pencil-alt fa-lg m-2 color-blue p-for-icons" id="listButtonsActionEdit" data-id="${id}"></i>
                        <i class="far fa-trash-alt fa-lg m-2 color-red p-for-icons" id="listButtonsActionDelete" data-id="${id}"></i>
                    </span>
               </a>`;


      // str += `<a href="#" style="text-decoration: none;">
      //           <li class="list-group-item" data-id="${id}">
      //             ${lists[id]['name']}
      //             <i class="fas fa-ellipsis-v fas-line float-end"></i>
      //           </li>
      //         </a>`;
    });
    // Вставим строки с названиями списков
    this.productListEl.insertAdjacentHTML('beforeend', str);
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
    this.productListEl.querySelectorAll('a').forEach(el => {
      if (el.dataset.id === listId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  setFunctionalForMouseoverProductsList() {
    this.productListEl.addEventListener('mouseover', ({target}) => {
      if (
        target.tagName === "A" ||
        target.id === "listButtonsMenu" ||
        target.id === "listButtonsAction" ||
        target.id === "listButtonsActionEdit" ||
        target.id === "listButtonsActionDelete"
      ) {
        let listButtonId = target.dataset.id;
        let listButtonsMenuEls = document.querySelectorAll('#listButtonsMenu');
        listButtonsMenuEls.forEach(el => {
          if (listButtonId === el.dataset.id) {
            el.classList.remove('d-none');
          }
        });
      }
    })
  }

  setFunctionalForMouseoutProductsList() {
    this.productListEl.addEventListener('mouseout', ({target}) => {

      if (target.tagName === "A") {
        let listButtonId = target.dataset.id;
        let listButtonsMenuEls = document.querySelectorAll('#listButtonsMenu');
        listButtonsMenuEls.forEach(el => {
          if (listButtonId === el.dataset.id) {
            el.classList.add('d-none');
          }
        });
      }
    });
  }

  setFunctionalForClickProductsList() {
    console.dir(this.productListEl)
    this.productListEl.addEventListener('click', ({target}) => {
      console.dir(target)
      // Если кликаем просто по списку
      if (target.tagName === "A") {
        this.drawProductsForListId(target.dataset.id);
        this.addActiveClassForList(target.dataset.id);
      }

      // Если кликаем по кнопке меню
      if (target.id === 'listButtonsMenu') {
        let targetMenuId = target.dataset.id;
        let listButtonsActionEls = document.querySelectorAll('#listButtonsAction');

        listButtonsActionEls.forEach(el => {
          if (targetMenuId === el.dataset.id) {
            el.classList.toggle('d-none')
          }

        });
      }

      // Если кликаем по кнопке действия редактирования
      if (target.id === 'listButtonsActionEdit') {
        let targetEditIconId = target.dataset.id;
        let listTitleEl = document.querySelector("#listTitle\\:" + targetEditIconId);
        let renameListAreaEl = document.querySelector("#renameListArea\\:" + targetEditIconId);
        console.dir(listTitleEl)
        console.dir(renameListAreaEl)

        let titleText = listTitleEl.innerText
        listTitleEl.classList.toggle('d-none');
        renameListAreaEl.classList.toggle('d-none');
        renameListAreaEl.focus();
        renameListAreaEl.select();
        renameListAreaEl.defaultValue = titleText;
        // this.setFunctionalEnterInRenameListField();

        renameListAreaEl.addEventListener('keypress', (event) => {

          if (event.code === 'Enter' || event.code === 'NumpadEnter') {
            console.log(event.code);
            // TODO отправить на сервер новое имя списка
            console.log(renameListAreaEl.dataset.id);
            console.dir(renameListAreaEl);

            // ------------ Конструкция асинхронного запроса--------------
            new SomeJsonRequests().sendJSONRequest(
              document.location.origin + "/api/v1/set_list_new_name/",
              {"listId": renameListAreaEl.dataset.id, "listNewName": renameListAreaEl.value}
            ).then((data) => {
              let list = JSON.parse(data);
              console.log('-------------> ', list.status)
              listTitleEl.innerText = renameListAreaEl.value;
              listTitleEl.classList.toggle('d-none');
              renameListAreaEl.classList.toggle('d-none');

            }).catch((err) => {
              console.error('Ошибка запроса к серверу!', err.statusText);
            });
            // ------------------------------------------------------------
          }
        });
      }

      // Если кликаем по кнопке действия удаления

    });
  }

  setFunctionalEnterInRenameListField() {

  }

  clearProductsFromLabels() {
    this.productsEl.innerHTML = '';
  }


  //----------- Все, что связано с полем ввода новых продуктов -----------------
  // ---------------------------------------------------------------------------
  AddEventFocusOnProductInput() {
    /**
     * Добавляет событие на выбор поля для ввода нового продукта в список
     */
    // Событие на фокусировку поля
    this.addProductInputEl.addEventListener('focus', ({target}) => {

      console.log('addEventListener_focus');
      // Вернем объект с продуктами,а когда придет информация от сервера,
      // то заберем продукты в объект allProducts вида {productId: productName}
      const products = new FetchClass().fetchJSONFromURL(
        document.location.origin + '/api/v1/get_products_dict/'
      );

      const catchProducts = async () => {
        const productsObj = await products;

        this.receivedProductsDictObj = productsObj;
        console.log(this.receivedProductsDictObj)
      };

      catchProducts();

    });

    // Событие клика по кнопкам продукта productChoiceEl
    this.setEventForClickNewProductField();

    //Событие по изменению ввода в поле новых продуктов
    this.setEventForInputNewProductField();

    // Добавим обработчик события при клике на кнопку добавления нового продукта
    this.setEventForClickNewProductButton();

    // Событие расфокусировки с поля addProductInputEl
    this.setEventForOutingFromNewProductInput();
  }

  setEventForInputNewProductField() {
    /**
     * Добавляет и обрабатывает по изменению ввода в поле новых продуктов
     */
    this.addProductInputEl.addEventListener('input', ({target}) => {
      this.clearProductButtonsFromWindow();

      // Если есть хоть один символ в поле нового продукта
      if (target.value.length > 0) {
        // Найдем подстроку в названиях продуктов в объекте словаря типовых продуктов и вернем только
        // те свойства, в которых встречается переданная подстрока
        const filteredObj = this.getDictOfProductsForSubstring(target.value);
        this.renderAdditionProductButtons(filteredObj);
        //Сделаем кнопку добавления нового продукта активной
        this.setModButtonForAddNewProduct('able');

      } else {
        this.setModButtonForAddNewProduct('disable');
      }

    });
  }

  setEventForClickNewProductButton() {
    /**
     * Добавляет обработчик события при клике на кнопку добавления нового продукта
     */
    this.addProductInputButtonEl.addEventListener('click', ({target}) => {

      console.log('setEventForClickNewProductButton --- click out');
      console.dir(target)
      if (target.tagName === "BUTTON") {
        console.log('setEventForClickNewProductButton --- click');

        //
        this.sendJSONNewProductToServer(this.getListId(), null, this.addProductInputEl.value);

        //Очистим поле ввода нового продукта
        this.clearNewProductInputValue();

        // Очистим кнопки новых продуктов
        this.clearProductButtonsFromWindow();

        //Деактивируем кнопку для новых продуктов
        this.setModButtonForAddNewProduct('disable');
      }


    })
  }

  removeEventForClickNewProductButton() {
    this.addProductInputButtonEl.removeEventListener('click', () => {
    });
  }

  getDictOfProductsForSubstring(substring) {
    /**
     * Найдет подстроку в названиях продуктов в объекте словаря типовых продуктов и вернем только те
     * свойства, в которых встречается переданная подстрока
     */
    // this.renderAdditionProductButtons(this.receivedProductsDictObj);
    return Object.fromEntries(
      Object.entries(this.receivedProductsDictObj)
        .filter(
          ([key, value]) => {
            let someValue = value.toLowerCase();
            let someSubstring = substring.toLowerCase();
            return someValue.includes(someSubstring);
          }
        )
    );
  }


  setEventForClickNewProductField() {
    /**
     * Добавляет событие клика по кнопкам продукта productChoiceEl и отправляет данные на сервер
     */
    this.productChoiceEl.addEventListener('click', ({target}) => {

      //Очистим поле ввода нового продукта
      this.clearNewProductInputValue();

      // Очистим кнопки новых продуктов
      this.clearProductButtonsFromWindow();
      if (target.tagName === "A") {
        console.log('click');

        this.sendJSONNewProductToServer(this.getListId(), target.dataset.productid, null);

        this.setModButtonForAddNewProduct('disable');
      }
    })
  }

  sendJSONNewProductToServer(listId, productId = null, productName = null) {
    /**
     * Отправляет данные о новом продукте на сервер, для его сохранения
     */

    let json = null;
    let url = null;

    if (productName == null) {
      json = {"listId": listId, "productId": productId, "quantity": "500 гр."}
      url = document.location.origin + "/api/v1/add_product_for_id/"

      // ------------ Конструкция асинхронного запроса--------------
      new SomeJsonRequests().sendJSONRequest(url, json)
        .then((data) => {
            let product = JSON.parse(data);
            console.log('-------------> ', product.status)
            // Дорисуем новый продукт в конец списка
            this.askForProductAndDrawInList(listId, productId, product.newProductId);

          }
        ).catch((err) => {
        console.error('Ошибка запроса к серверу!', err.statusText);
      });
      // ------------------------------------------------------------
    }

    if (productId == null) {
      json = {"listId": listId, "productName": productName, "quantity": "500 гр."}
      url = document.location.origin + "/api/v1/add_product_for_name/"

      // ------------ Конструкция асинхронного запроса--------------
      new SomeJsonRequests().sendJSONRequest(url, json)
        .then((data) => {
            let product = JSON.parse(data);
            console.log('-------------> ', product.status)
            // Дорисуем новый продукт в конец списка
            this.drawOneProductToEndListAndAddToObject(
              this.getListId(),
              product.newProductId,
              product.newProductName
            );
          }
        ).catch((err) => {
        console.error('Ошибка запроса к серверу!', err.statusText);
      });
      // ------------------------------------------------------------
    }


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
     * Отрисовывает кнопки при вводе в поле новых продуктов,
     * которые являются ссылками для добавления новых продуктов в список
     * @type {string}
     */
    // this.clearProductButtonsFromWindow();
    if (Object.keys(renderObj).length !== 0) {
      let str = ``;

      Object.keys(renderObj).forEach(product_id => {
        str += `<a href="#" class="bblock" data-productid="${product_id}">${renderObj[product_id]}</a>`;
      });


      this.productChoiceEl.insertAdjacentHTML('beforeend', str);
    }
  }

  clearProductButtonsFromWindow() {
    /**
     * Очищает кнопки для добавления новых продуктов с экрана
     * @type {string}
     */
    this.productChoiceEl.innerHTML = "";
  }

  clearNewProductInputValue() {
    /**
     * Очищает ввод в поле ввода нового продукта
     * @type {string}
     */
    this.addProductInputEl.value = "";
  }

  setModButtonForAddNewProduct(mod = 'disable') {
    /**
     * Делает активной или не активной кнопку добавления нового продукта из поля ввода нового
     * продукта в зависимости от переданного аргумента в mod
     */
    if (mod === "able") {
      this.addProductInputButtonEl.classList.remove('disabled');
      this.addProductInputButtonEl.classList.remove('btn-outline-secondary');
      this.addProductInputButtonEl.classList.add('btn-primary');
    } else {
      this.addProductInputButtonEl.classList.add('disabled');
      this.addProductInputButtonEl.classList.add('btn-outline-secondary');
      this.addProductInputButtonEl.classList.remove('btn-primary');
    }
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
    let productListsEl = document.querySelectorAll('#productLists a');
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