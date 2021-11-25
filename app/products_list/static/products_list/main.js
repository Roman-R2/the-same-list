'use strict';

// -----------------------------------------------------------
//--------------------- SomeJsonRequests ---------------------
// -----------------------------------------------------------
class SomeJsonRequests {
  /**
   * Класс для выполнения запросов к серверу и возвращения Promise
   * @returns {Promise<unknown>}
   */

  sendJSONRequest(url, json, method) {
    return new Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url);
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

  sendPostJSONRequest(url, json, method = "POST") {
    return this.sendJSONRequest(url, json, method);
  }

  sendGetJSONRequest(url, json, method = "GET") {
    return this.sendJSONRequest(url, json, method);
  }

  sendDeleteJSONRequest(url, json, method = "DELETE") {
    return this.sendJSONRequest(url, json, method);
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
   * @type {SomeJsonRequests}
   */

  addNewListButtonEl = document.querySelector('#addNewListButton');
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

  async someAsyncGetResp(url, json) {
    return await new SomeJsonRequests().sendGetJSONRequest(url, json);
  }

  async someAsyncPostResp(url, json) {
    return await new SomeJsonRequests().sendPostJSONRequest(url, json);
  }

  async someAsyncDeleteResp(url, json) {
    return await new SomeJsonRequests().sendDeleteJSONRequest(url, json);
  }

//----------- Все, что связано со списками и продуктами в них ----------------
// ---------------------------------------------------------------------------
  getListsWithProducts() {
    /**
     * Получает объект списков с продуктами и передает полученный объект listsObj далее на обработку
     * методу workWithTheReceivedList
     * @type {Promise<any>}
     */


    // ------------ Конструкция асинхронного запроса ----------
    this.someAsyncGetResp(
      document.location.origin + "/api/v1/get_lists_and_products/",
      {}
    ).then(response => {
      response = JSON.parse(response)
      if (response.status === 'success') {

        // Добавим полученный объект в свойство класса
        this.addListObjectToClass(response.listsAndProducts);

        //Начнем отрисовки на основе полученного объекта
        this.workWithTheReceivedList(response.listsAndProducts)

      } else {
        this.errorToConsole(response);
      }
    });
    // ------------------------------------------------------------
  }

  addListObjectToClass(receivedListObj) {
    this.receivedListObj = receivedListObj;
  }


  workWithTheReceivedList() {
    /**
     * Производит с полученным объектом действия добавления событий и отрисовки
     */

    this.setFunctionalForClickCreateNewList();

    if (Object.keys(this.receivedListObj).length !== 0) {
      // Отобразим списки продуктов для пользователя
      this.drawProductLists(this.receivedListObj);

      // Отобразим продукты в первом списке и добавим выделение
      this.drawListProductsAndSetActiveClassForListId(Object.keys(this.receivedListObj)[0])

      // Добавим функционала при клике на списки пользователя
      this.setFunctionalForClickProductsList();

      // Добавим функционала при наведении и уходе на списки пользователя для меню
      this.setFunctionalForMouseoverProductsList();
      this.setFunctionalForMouseoutProductsList();
    } else {
      console.log('Пока нет ни одного списка...');
    }
  }


  setFunctionalForClickCreateNewList() {
    /**
     * Добавляет обработчик события по нажатию на кнопку добавления нового списка
     */
    this.addNewListButtonEl.addEventListener('click', () => {

      // ------------ Конструкция асинхронного запроса ----------
      this.someAsyncPostResp(
        document.location.origin + "/api/v1/add_new_list/",
        {"comment": "giveMeNewList"}
      ).then(response => {
        response = JSON.parse(response)
        if (response.status === 'success') {
          // Добавим в объект и отобразим новый список
          this.receivedListObj[response.listId] = {
            'name': response.listTitle,
            'products': {},
          };
          // Отобразим списки занова
          this.drawProductLists(this.receivedListObj)
          // Отобразим продукты в первом списке и добавим выделение
          this.drawListProductsAndSetActiveClassForListId(response.listId);

        } else {
          this.errorToConsole(response)
        }
      });
      // ------------------------------------------------------------

    });
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
    this.receivedListObj[listId]['products'][productId] = productName;
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

  clearProductLists() {
    /**
     * Уберет все списки с экрана
     */
    this.productListEl.innerHTML = "";
  }

  drawProductLists(lists) {
    this.clearProductLists();
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
    });
    // Вставим строки с названиями списков
    this.productListEl.insertAdjacentHTML('beforeend', str);
  }

  drawListProductsAndSetActiveClassForListId(listId) {
    /**
     * Отобразит продукты в первом списке и добавит выделение для первого списка
     */
    this.drawProductsForListId(listId);
    this.addActiveClassForList(listId);
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
    listId = listId.toString();
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
    this.productListEl.addEventListener('click', ({target}) => {
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
        let titleText = listTitleEl.innerText

        listTitleEl.classList.toggle('d-none');
        renameListAreaEl.classList.toggle('d-none');
        renameListAreaEl.focus();
        renameListAreaEl.select();
        renameListAreaEl.defaultValue = titleText;

        this.setFunctionalEnterInRenameListField(renameListAreaEl, listTitleEl);

      }

      // Если кликаем по кнопке действия удаления
      if (target.id === 'listButtonsActionDelete') {
        let targetDeleteIconId = target.dataset.id;

        // ------------ Конструкция асинхронного запроса ----------
        this.someAsyncDeleteResp(
          document.location.origin + "/api/v1/delete_list_for_id/",
          {"listId": targetDeleteIconId}
        ).then(response => {
          response = JSON.parse(response)
          if (response.status === 'success') {
            // Удалим в объект и уберем удаленный список
            delete this.receivedListObj[response.deletedListId]

            // Отобразим списки заново
            this.drawProductLists(this.receivedListObj)
            // Отобразим продукты в первом списке и добавим выделение
            this.drawListProductsAndSetActiveClassForListId(Object.keys(this.receivedListObj)[0]);
          } else {
            this.errorToConsole(response);
          }
        });
        // ------------------------------------------------------------
      }

    });
  }

  setFunctionalEnterInRenameListField(renameListAreaEl, listTitleEl) {
    /**
     * Добавляет обработчик события по нажатию enter в поле редактирования имя списка
     */
    renameListAreaEl.addEventListener('keypress', (event) => {

      if (event.code === 'Enter' || event.code === 'NumpadEnter') {

        // ------------ Конструкция асинхронного запроса ----------
        this.someAsyncPostResp(
          document.location.origin + "/api/v1/set_list_new_name/",
          {"listId": renameListAreaEl.dataset.id, "listNewName": renameListAreaEl.value}
        ).then(response => {
          response = JSON.parse(response)
          if (response.status === 'success') {
            listTitleEl.innerText = renameListAreaEl.value;
            listTitleEl.classList.remove('d-none');
            renameListAreaEl.classList.add('d-none');
          } else {
            this.errorToConsole(response);
          }
        });
        // ------------------------------------------------------------
      }
    });
  }


  errorToConsole(response) {
    console.log(`Пришел ответ со статусом ${response.status}, status.code ${response.code}`)
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

      // console.log('addEventListener_focus');

      //Добавим тень на заднем фоне
      this.setBackgroundShadow(true);

      // Вернем объект с продуктами,а когда придет информация от сервера,
      // то заберем продукты в объект allProducts вида {productId: productName}

      // ------------ Конструкция асинхронного запроса ----------
      this.someAsyncGetResp(
        document.location.origin + "/api/v1/get_products_dict/",
        {}
      ).then(response => {
        response = JSON.parse(response)
        if (response.status === 'success') {
          this.receivedProductsDictObj = response.productsDict;
        } else {
          this.errorToConsole(response);
        }
      });
      // ------------------------------------------------------------

    });

    // Событие клика по кнопкам продукта productChoiceEl
    this.setEventForClickNewProductField();

    //Событие по изменению ввода в поле новых продуктов
    this.setEventForInputNewProductField();

    //Событие по нажатию enter внутри поля ввода новых продуктов
    this.setEventForPressEnterForInputNewProductField();

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

  setEventForPressEnterForInputNewProductField() {
    /**
     * Добавляет событие по нажатию enter внутри поля ввода новых продуктов
     */
    this.addProductInputEl.addEventListener('keypress', (event) => {
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        if (this.addProductInputEl.value.length > 1) {
          this.sendJSONNewProductToServer(this.getListId(), null, this.addProductInputEl.value);

          //Очистим поле ввода нового продукта
          this.clearNewProductInputValue();

          // Очистим кнопки новых продуктов
          this.clearProductButtonsFromWindow();

          //Деактивируем кнопку для новых продуктов
          this.setModButtonForAddNewProduct('disable');

          //Уберем тень на заднем фоне
          this.setBackgroundShadow(false);
        }
      }
    });
  }

  setEventForClickNewProductButton() {
    /**
     * Добавляет обработчик события при клике на кнопку добавления нового продукта
     */
    this.addProductInputButtonEl.addEventListener('click', ({target}) => {

      if (target.tagName === "BUTTON") {

        //
        this.sendJSONNewProductToServer(this.getListId(), null, this.addProductInputEl.value);

        //Очистим поле ввода нового продукта
        this.clearNewProductInputValue();

        // Очистим кнопки новых продуктов
        this.clearProductButtonsFromWindow();

        //Деактивируем кнопку для новых продуктов
        this.setModButtonForAddNewProduct('disable');

        //Уберем тень на заднем фоне
        this.setBackgroundShadow(false);
      }


    })
  }

  getDictOfProductsForSubstring(substring) {
    /**
     * Найдет подстроку в названиях продуктов в объекте словаря типовых продуктов и вернем только те
     * свойства, в которых встречается переданная подстрока
     */
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

        this.sendJSONNewProductToServer(this.getListId(), target.dataset.productid, null);

        this.setModButtonForAddNewProduct('disable');

        //Уберем тень на заднем фоне
        this.setBackgroundShadow(false);
      }
    })
  }

  sendJSONNewProductToServer(listId, productId = null, productName = null) {
    /**
     * Отправляет данные о новом продукте на сервер, для его сохранения
     */

    if (productName == null) {

      // ------------ Конструкция асинхронного запроса ----------
      this.someAsyncPostResp(
        document.location.origin + "/api/v1/add_product_for_id/",
        {"listId": listId, "productId": productId, "quantity": "500 гр."}
      ).then(response => {
        response = JSON.parse(response)
        if (response.status === 'success') {
          // Дорисуем новый продукт в конец списка
          this.drawOneProductToEndListAndAddToObject(listId, response.newProductId, response.newProductName);
        } else {
          this.errorToConsole(response);
        }
      });
      // ------------------------------------------------------------
    }

    if (productId == null) {

      // ------------ Конструкция асинхронного запроса ----------
      this.someAsyncPostResp(
        document.location.origin + "/api/v1/add_product_for_name/",
        {"listId": listId, "productName": productName, "quantity": "500 гр."}
      ).then(response => {
        response = JSON.parse(response)
        if (response.status === 'success') {
          // Дорисуем новый продукт в конец списка
          this.drawOneProductToEndListAndAddToObject(
            listId,
            response.newProductId,
            response.newProductName);
        } else {
          this.errorToConsole(response);
        }
      });
      // ------------------------------------------------------------
    }


  }

  setEventForOutingFromNewProductInput() {
    /**
     * Уберет все кнопки, показанные при активации поля ввода новых продуктов
     */
    this.addProductInputEl.addEventListener('blur', ({target}) => {
      window.setTimeout(() => {
        this.clearProductButtonsFromWindow();
        //Уберем тень на заднем фоне
        this.setBackgroundShadow(false);
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

  setBackgroundShadow(setMod = false) {
    if (setMod === true) {
      document.querySelector('#backgroundShadow').classList.add('shadow');
    } else {
      document.querySelector('#backgroundShadow').classList.remove('shadow');
    }
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